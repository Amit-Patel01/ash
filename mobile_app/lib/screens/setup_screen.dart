import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../widgets/brand_logo.dart';

class SetupScreen extends StatelessWidget {
  const SetupScreen({super.key, required this.error});

  final String error;

  @override
  Widget build(BuildContext context) {
    final lowerError = error.toLowerCase();
    final firebaseIssue =
        lowerError.contains('firebase') ||
        lowerError.contains('google-services') ||
        lowerError.contains('google_service');

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF06111D),
              Color(0xFF0B2032),
              Color(0xFF12324A),
            ],
          ),
        ),
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const BrandLogo(
                        size: 82,
                        padding: 12,
                        backgroundColor: Color(0x1A38BDF8),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        firebaseIssue
                            ? 'Firebase Startup Issue'
                            : 'Unable to Start ${AppConfig.appName}',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        firebaseIssue
                            ? AppConfig.firebaseSetupHint
                            : 'App launch ke waqt ek startup error aayi. Neeche diya gaya error check karke relaunch karein.',
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: Colors.white70,
                              height: 1.5,
                            ),
                      ),
                      const SizedBox(height: 20),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF08131D),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          error,
                          style: const TextStyle(
                            color: Colors.white70,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        firebaseIssue
                            ? '1. Register Android/iOS apps in Firebase.\n'
                                '2. Place native config files in android/app and ios/Runner.\n'
                                '3. Update firebase_options.dart and relaunch.'
                            : '1. App ko completely close karke dubara open karein.\n'
                                '2. Config aur asset files verify karein.\n'
                                '3. Agar issue rahe to isi error message ko share karein.',
                        style: const TextStyle(height: 1.6, color: Colors.white70),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
