class AppConfig {
  static const String appName = 'SolutionHub Mobile';
  static const String websiteUrl = 'https://www.amitsolutionhub.com';
  static const String supportEmail = 'amitpatel07029@gmail.com';
  static const String supportPhone = '+919099257625';
  static const String firebaseProjectId = 'solutionhub-81976';
  static const String backendBaseUrl = String.fromEnvironment(
    'SOLUTIONHUB_API_BASE_URL',
    defaultValue: 'https://www.amitsolutionhub.com',
  );
  static const String supportRoute = '/contact';
  static const String aiChatRoute = '/api/ai/chat';
  static const String aiStatusRoute = '/api/ai/status';
  static const String certificateVerifyUrl =
      'https://www.amitsolutionhub.com/verify';

  static const String firebaseSetupHint =
      'This build reuses the existing web Firebase keys for structure and development. '
      'For production mobile push setup, replace the app IDs in firebase_options.dart with native Android/iOS app registrations.';
}
