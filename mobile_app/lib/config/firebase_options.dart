import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

/// These options are derived from the existing web project configuration.
/// Replace Android/iOS app IDs with native app registrations for production
/// mobile push and analytics support.
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return macos;
      case TargetPlatform.windows:
      case TargetPlatform.linux:
        return windows;
      case TargetPlatform.fuchsia:
        return android;
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAiXs_rSSfAkXVuWMm7RRzSc3q-e27qMms',
    appId: '1:614841884457:web:9758030e4ebbcf61dde138',
    messagingSenderId: '614841884457',
    projectId: 'solutionhub-81976',
    authDomain: 'solutionhub-81976.firebaseapp.com',
    storageBucket: 'solutionhub-81976.firebasestorage.app',
    measurementId: 'G-FQ3RCNF3SH',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyAiXs_rSSfAkXVuWMm7RRzSc3q-e27qMms',
    appId: '1:614841884457:web:9758030e4ebbcf61dde138',
    messagingSenderId: '614841884457',
    projectId: 'solutionhub-81976',
    storageBucket: 'solutionhub-81976.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyAiXs_rSSfAkXVuWMm7RRzSc3q-e27qMms',
    appId: '1:614841884457:web:9758030e4ebbcf61dde138',
    messagingSenderId: '614841884457',
    projectId: 'solutionhub-81976',
    storageBucket: 'solutionhub-81976.firebasestorage.app',
    iosBundleId: 'com.solutionhub.mobileApp',
  );

  static const FirebaseOptions macos = FirebaseOptions(
    apiKey: 'AIzaSyAiXs_rSSfAkXVuWMm7RRzSc3q-e27qMms',
    appId: '1:614841884457:web:9758030e4ebbcf61dde138',
    messagingSenderId: '614841884457',
    projectId: 'solutionhub-81976',
    storageBucket: 'solutionhub-81976.firebasestorage.app',
    iosBundleId: 'com.solutionhub.mobileApp',
  );

  static const FirebaseOptions windows = FirebaseOptions(
    apiKey: 'AIzaSyAiXs_rSSfAkXVuWMm7RRzSc3q-e27qMms',
    appId: '1:614841884457:web:9758030e4ebbcf61dde138',
    messagingSenderId: '614841884457',
    projectId: 'solutionhub-81976',
    authDomain: 'solutionhub-81976.firebaseapp.com',
    storageBucket: 'solutionhub-81976.firebasestorage.app',
  );
}
