import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'config/app_config.dart';
import 'config/firebase_options.dart';
import 'screens/auth_screen.dart';
import 'screens/home_shell.dart';
import 'screens/launch_experience_screen.dart';
import 'screens/setup_screen.dart';
import 'services/auth_service.dart';
import 'services/backend_api_service.dart';
import 'services/connectivity_service.dart';
import 'services/local_notification_service.dart';
import 'services/permission_service.dart';
import 'services/push_notification_service.dart';
import 'services/solutionhub_repository.dart';
import 'state/session_controller.dart';
import 'theme/app_theme.dart';
import 'widgets/brand_logo.dart';
import 'widgets/modern_ui.dart';

Future<void> _initializeFirebaseSafely() async {
  if (Firebase.apps.isNotEmpty) {
    return;
  }

  try {
    if (kIsWeb) {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
      return;
    }

    await Firebase.initializeApp();
  } on FirebaseException catch (error) {
    final duplicateDefaultApp =
        error.code == 'duplicate-app' ||
        (error.message?.contains('[DEFAULT]') ?? false);

    if (duplicateDefaultApp) {
      return;
    }

    if (Firebase.apps.isEmpty) {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
    }
  }
}

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await _initializeFirebaseSafely();
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  Object? bootstrapError;
  try {
    await _initializeFirebaseSafely();
  } catch (error) {
    bootstrapError = error;
  }

  final localNotificationService = LocalNotificationService();
  await localNotificationService.initialize();

  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  runApp(
    SolutionHubMobileApp(
      bootstrapError: bootstrapError,
      localNotificationService: localNotificationService,
    ),
  );
}

class SolutionHubMobileApp extends StatelessWidget {
  const SolutionHubMobileApp({
    super.key,
    required this.bootstrapError,
    required this.localNotificationService,
  });

  final Object? bootstrapError;
  final LocalNotificationService localNotificationService;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<AuthService>(create: (_) => AuthService()),
        Provider<SolutionHubRepository>(create: (_) => SolutionHubRepository()),
        Provider<ConnectivityService>(create: (_) => ConnectivityService()),
        Provider<BackendApiService>(create: (_) => BackendApiService()),
        Provider<PermissionService>(create: (_) => PermissionService()),
        Provider<PushNotificationService>(
          create: (_) => PushNotificationService(),
        ),
        Provider<LocalNotificationService>.value(
          value: localNotificationService,
        ),
        ChangeNotifierProvider<SessionController>(
          create: (context) => SessionController(
            authService: context.read<AuthService>(),
            repository: context.read<SolutionHubRepository>(),
            connectivityService: context.read<ConnectivityService>(),
            permissionService: context.read<PermissionService>(),
            localNotificationService: context.read<LocalNotificationService>(),
            pushNotificationService: context.read<PushNotificationService>(),
            firebaseReady: bootstrapError == null,
          ),
        ),
      ],
      child: MaterialApp(
        title: AppConfig.appName,
        debugShowCheckedModeBanner: false,
        theme: SolutionHubTheme.dark(),
        home: bootstrapError != null
            ? SetupScreen(error: bootstrapError.toString())
            : Consumer<SessionController>(
                builder: (context, session, _) {
                  if (session.isBootstrapping) {
                    return const _BootstrapLoader();
                  }

                  if (!session.isAuthenticated) {
                    return const _LoggedOutExperience();
                  }

                  return const HomeShell();
                },
              ),
      ),
    );
  }
}

class _LoggedOutExperience extends StatefulWidget {
  const _LoggedOutExperience();

  @override
  State<_LoggedOutExperience> createState() => _LoggedOutExperienceState();
}

class _LoggedOutExperienceState extends State<_LoggedOutExperience> {
  bool _showAuth = false;

  @override
  Widget build(BuildContext context) {
    if (_showAuth) {
      return const AuthScreen();
    }

    return LaunchExperienceScreen(
      onContinue: () => setState(() => _showAuth = true),
    );
  }
}

class _BootstrapLoader extends StatelessWidget {
  const _BootstrapLoader();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppBackdrop(
        child: Center(
          child: GlassCard(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 30),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF0B2130), Color(0xFF0C2C3C), Color(0xFF12313A)],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const BrandLogo(
                  size: 90,
                  padding: 14,
                  backgroundColor: Color(0x1A5EEAD4),
                ),
                const SizedBox(height: 18),
                const CircularProgressIndicator(),
                const SizedBox(height: 18),
                Text(
                  'Launching ${AppConfig.appName}',
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                Text(
                  'Mobile workspace, alerts aur sync services start ho rahi hain.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
