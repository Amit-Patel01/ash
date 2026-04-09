import 'dart:async';

import 'package:firebase_messaging/firebase_messaging.dart';

import 'local_notification_service.dart';

class PushNotificationService {
  PushNotificationService({
    FirebaseMessaging? messaging,
  }) : _messaging = messaging ?? FirebaseMessaging.instance;

  final FirebaseMessaging _messaging;

  Stream<String> watchTokenRefresh() => _messaging.onTokenRefresh;

  Future<void> initializeForegroundHandling(
    LocalNotificationService localNotificationService,
  ) async {
    await _messaging.setForegroundNotificationPresentationOptions(
      alert: true,
      badge: true,
      sound: true,
    );

    FirebaseMessaging.onMessage.listen((message) async {
      final notification = message.notification;
      if (notification == null) return;
      await localNotificationService.show(
        title: notification.title ?? 'SolutionHub',
        body: notification.body ?? 'You have a new update.',
      );
    });
  }

  Future<NotificationSettings> requestPermission() {
    return _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );
  }

  Future<String?> getToken() => _messaging.getToken();
}
