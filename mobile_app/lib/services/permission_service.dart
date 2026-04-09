import 'dart:io';

import 'package:permission_handler/permission_handler.dart';

enum AppPermissionType {
  notifications,
  camera,
  media,
  phone,
}

class PermissionService {
  Map<AppPermissionType, Permission> get _permissionMap => {
        AppPermissionType.notifications: Permission.notification,
        AppPermissionType.camera: Permission.camera,
        AppPermissionType.media:
            Platform.isIOS ? Permission.photos : Permission.storage,
        AppPermissionType.phone: Permission.phone,
      };

  Future<Map<AppPermissionType, PermissionStatus>> getStatuses() async {
    final statuses = <AppPermissionType, PermissionStatus>{};
    for (final entry in _permissionMap.entries) {
      statuses[entry.key] = await entry.value.status;
    }
    return statuses;
  }

  Future<Map<AppPermissionType, PermissionStatus>> requestAll() async {
    final statuses = <AppPermissionType, PermissionStatus>{};
    for (final entry in _permissionMap.entries) {
      statuses[entry.key] = await entry.value.request();
    }
    return statuses;
  }

  bool isGranted(PermissionStatus status) {
    return status.isGranted || status.isLimited;
  }

  String labelFor(AppPermissionType type) {
    switch (type) {
      case AppPermissionType.notifications:
        return 'Notifications';
      case AppPermissionType.camera:
        return 'Camera';
      case AppPermissionType.media:
        return 'Media Access';
      case AppPermissionType.phone:
        return 'Phone';
    }
  }

  String descriptionFor(AppPermissionType type) {
    switch (type) {
      case AppPermissionType.notifications:
        return 'Real-time alerts and app updates on your device.';
      case AppPermissionType.camera:
        return 'Capture payment proofs, project images or profile media.';
      case AppPermissionType.media:
        return 'Pick and attach existing screenshots and gallery files.';
      case AppPermissionType.phone:
        return 'Quick call handoff for support and assigned contacts.';
    }
  }

  Future<bool> openSettings() => openAppSettings();
}
