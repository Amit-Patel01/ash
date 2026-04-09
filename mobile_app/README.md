# SolutionHub Mobile App

Flutter-based mobile client for the existing SolutionHub stack. This app is wired for:

- Firebase Authentication
- Firestore-backed dashboards
- Firebase Cloud Messaging token sync with local foreground alerts
- internet/connectivity awareness
- Android permissions for notifications, camera, media access, phone, vibration and wake lock
- support request form connected to the backend contact route
- built-in AI assistant connected to the backend AI routes
- role-based tasks and certificate access

## Included Screens

- Login
- Customer signup
- Role-aware dashboard
- Courses
- Tasks for employee/admin accounts
- Certificates for customer accounts
- Notifications
- Hub page with profile edit, permissions, support and AI tools

## Current Firebase Setup

The app currently uses Firebase options derived from the existing web project so the structure is immediately usable.

For production mobile builds, replace the placeholder-safe config with real native Firebase apps:

1. Register Android and iOS apps in the `solutionhub-81976` Firebase project.
2. Download `google-services.json` for Android and place it in `android/app/`.
3. Download `GoogleService-Info.plist` for iOS and place it in `ios/Runner/`.
4. Update `lib/config/firebase_options.dart` with the generated native app IDs.

## Run

```bash
flutter pub get
flutter run
```

## Notes

- Android emulator can use `10.0.2.2` if you later connect local backend APIs.
- Notifications in this build are driven from Firestore data, local device alerts and Firebase Messaging token sync.
- For production background FCM push, native Firebase app registration is required.
- Backend-powered support and AI features use the routes configured in `lib/config/app_config.dart`.
