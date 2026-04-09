import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:permission_handler/permission_handler.dart';

import '../models/app_models.dart';
import '../services/auth_service.dart';
import '../services/connectivity_service.dart';
import '../services/local_notification_service.dart';
import '../services/permission_service.dart';
import '../services/push_notification_service.dart';
import '../services/solutionhub_repository.dart';

class SessionController extends ChangeNotifier {
  SessionController({
    required this.authService,
    required this.repository,
    required this.connectivityService,
    required this.permissionService,
    required this.localNotificationService,
    required this.pushNotificationService,
    required this.firebaseReady,
  }) {
    _initialize();
  }

  final AuthService authService;
  final SolutionHubRepository repository;
  final ConnectivityService connectivityService;
  final PermissionService permissionService;
  final LocalNotificationService localNotificationService;
  final PushNotificationService pushNotificationService;
  final bool firebaseReady;

  bool _isBootstrapping = true;
  bool _isOnline = true;
  AppUser? _currentUser;
  User? _firebaseUser;
  Map<AppPermissionType, PermissionStatus> _permissionStatuses = const {};

  StreamSubscription<User?>? _authSubscription;
  StreamSubscription<AppUser?>? _profileSubscription;
  StreamSubscription<bool>? _connectivitySubscription;
  StreamSubscription<List<AppNotificationItem>>? _notificationSubscription;
  StreamSubscription<String>? _tokenRefreshSubscription;

  final Set<String> _seenNotificationIds = <String>{};
  bool _notificationStreamPrimed = false;

  bool get isBootstrapping => _isBootstrapping;
  bool get isOnline => _isOnline;
  bool get isAuthenticated => _currentUser != null;
  AppUser? get currentUser => _currentUser;
  Map<AppPermissionType, PermissionStatus> get permissionStatuses =>
      Map.unmodifiable(_permissionStatuses);

  int get grantedPermissionCount => _permissionStatuses.values
      .where((status) => permissionService.isGranted(status))
      .length;

  Future<void> _initialize() async {
    _permissionStatuses = await permissionService.getStatuses();

    try {
      _isOnline = await connectivityService.isOnline();
    } catch (_) {
      _isOnline = true;
    }

    _connectivitySubscription =
        connectivityService.watchOnline().listen((value) {
      _isOnline = value;
      notifyListeners();
    });

    if (!firebaseReady) {
      _isBootstrapping = false;
      notifyListeners();
      return;
    }

    await pushNotificationService
        .initializeForegroundHandling(localNotificationService);

    _authSubscription = authService.authStateChanges().listen(_handleAuthChange);
  }

  Future<void> _handleAuthChange(User? user) async {
    _firebaseUser = user;
    await _profileSubscription?.cancel();
    _profileSubscription = null;
    await _notificationSubscription?.cancel();
    _notificationSubscription = null;
    await _tokenRefreshSubscription?.cancel();
    _tokenRefreshSubscription = null;
    _seenNotificationIds.clear();
    _notificationStreamPrimed = false;

    if (user == null) {
      _currentUser = null;
      _isBootstrapping = false;
      notifyListeners();
      return;
    }

    await authService.ensureProfileDocument(user);
    await authService.setPresence(user.uid, online: true);
    await _syncPushToken(user.uid);

    await _tokenRefreshSubscription?.cancel();
    _tokenRefreshSubscription =
        pushNotificationService.watchTokenRefresh().listen((token) async {
      await repository.saveDeviceToken(uid: user.uid, token: token);
    });

    _profileSubscription = repository.watchUserProfile(user).listen((profile) {
      final shouldBindNotifications = _currentUser?.uid != profile?.uid ||
          _currentUser?.employeeId != profile?.employeeId;

      _currentUser = profile;
      _isBootstrapping = false;

      if (profile != null && shouldBindNotifications) {
        _bindNotifications(profile);
      }

      notifyListeners();
    });
  }

  void _bindNotifications(AppUser user) {
    _notificationSubscription?.cancel();
    _notificationSubscription = repository.watchNotifications(user).listen(
      (items) async {
        if (!_notificationStreamPrimed) {
          _seenNotificationIds.addAll(items.map((item) => item.id));
          _notificationStreamPrimed = true;
          return;
        }

        final freshItems = items
            .where((item) => !item.read && !_seenNotificationIds.contains(item.id))
            .take(3)
            .toList();

        for (final item in freshItems) {
          await localNotificationService.show(
            title: item.title,
            body: item.message,
          );
        }

        _seenNotificationIds.addAll(items.map((item) => item.id));
      },
    );
  }

  Future<void> refreshPermissions() async {
    _permissionStatuses = await permissionService.getStatuses();
    notifyListeners();
  }

  Future<void> requestEssentialPermissions() async {
    _permissionStatuses = await permissionService.requestAll();
    await pushNotificationService.requestPermission();
    notifyListeners();
  }

  Future<void> _syncPushToken(String uid) async {
    try {
      await pushNotificationService.requestPermission();
      final token = await pushNotificationService.getToken();
      if (token == null || token.isEmpty) return;
      await repository.saveDeviceToken(uid: uid, token: token);
    } catch (_) {}
  }

  Future<void> openPermissionSettings() async {
    await permissionService.openSettings();
  }

  Future<void> login({
    required String email,
    required String password,
  }) {
    return authService.login(email: email, password: password);
  }

  Future<void> signupCustomer({
    required String name,
    required String email,
    required String phone,
    required String password,
  }) {
    return authService.signupCustomer(
      name: name,
      email: email,
      phone: phone,
      password: password,
    );
  }

  Future<void> sendPasswordReset(String email) {
    return authService.sendPasswordResetEmail(email);
  }

  Future<void> updateProfile({
    required String displayName,
    required String phone,
    required String department,
  }) async {
    final user = _currentUser;
    if (user == null) return;

    await repository.updateUserProfile(user.uid, {
      'displayName': displayName.trim(),
      'phone': phone.trim(),
      'department': department.trim(),
    });
  }

  Future<void> logout() async {
    final uid = _firebaseUser?.uid;
    if (uid != null) {
      await authService.setPresence(uid, online: false);
    }
    await authService.logout();
  }

  @override
  void dispose() {
    _authSubscription?.cancel();
    _profileSubscription?.cancel();
    _connectivitySubscription?.cancel();
    _notificationSubscription?.cancel();
    _tokenRefreshSubscription?.cancel();
    super.dispose();
  }
}
