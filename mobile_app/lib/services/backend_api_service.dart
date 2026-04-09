import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/app_config.dart';

class BackendApiService {
  Uri _uri(String path) {
    final base = AppConfig.backendBaseUrl.endsWith('/')
        ? AppConfig.backendBaseUrl.substring(0, AppConfig.backendBaseUrl.length - 1)
        : AppConfig.backendBaseUrl;
    return Uri.parse('$base$path');
  }

  Future<void> sendSupportMessage({
    required String firstName,
    required String lastName,
    required String email,
    required String mobile,
    required String message,
    String github = 'Mobile App',
  }) async {
    final response = await http.post(
      _uri(AppConfig.supportRoute),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'mobile': mobile,
        'github': github,
        'message': message,
      }),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Support request failed (${response.statusCode}).');
    }
  }

  Future<bool> isAiAvailable() async {
    final response = await http.get(_uri(AppConfig.aiStatusRoute));
    if (response.statusCode < 200 || response.statusCode >= 300) {
      return false;
    }
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    return data['success'] == true;
  }

  Future<String> askAi(List<Map<String, String>> messages) async {
    final response = await http.post(
      _uri(AppConfig.aiChatRoute),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'messages': messages}),
    );

    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception(
        (data['reply'] ?? data['message'] ?? 'AI request failed.').toString(),
      );
    }

    return (data['reply'] ?? 'No reply received.').toString();
  }
}
