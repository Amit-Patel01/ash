import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../config/app_config.dart';
import '../models/app_models.dart';
import '../services/backend_api_service.dart';
import '../services/permission_service.dart';
import '../state/session_controller.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key, required this.user});

  final AppUser user;

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _departmentController = TextEditingController();
  final _supportMessageController = TextEditingController();
  final _assistantController = TextEditingController();

  bool _saving = false;
  bool _sendingSupport = false;
  bool _aiBusy = false;
  bool _aiAvailable = false;
  List<_AssistantMessage> _messages = const [
    _AssistantMessage(
      role: 'assistant',
      text:
          'Hello! Main SolutionHub mobile assistant hoon. Aap courses, support ya app usage ke baare me pooch sakte ho.',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _seedFields();
    _checkAiStatus();
  }

  @override
  void didUpdateWidget(covariant ProfilePage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.user.uid != widget.user.uid) {
      _seedFields();
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _departmentController.dispose();
    _supportMessageController.dispose();
    _assistantController.dispose();
    super.dispose();
  }

  void _seedFields() {
    _nameController.text = widget.user.displayName;
    _phoneController.text = widget.user.phone;
    _departmentController.text = widget.user.department;
  }

  Future<void> _checkAiStatus() async {
    try {
      final available = await context.read<BackendApiService>().isAiAvailable();
      if (!mounted) return;
      setState(() => _aiAvailable = available);
    } catch (_) {
      if (!mounted) return;
      setState(() => _aiAvailable = false);
    }
  }

  Future<void> _saveProfile() async {
    final session = context.read<SessionController>();
    final messenger = ScaffoldMessenger.of(context);
    setState(() => _saving = true);
    try {
      await session.updateProfile(
        displayName: _nameController.text,
        phone: _phoneController.text,
        department: _departmentController.text,
      );
      if (!mounted) return;
      messenger.showSnackBar(
        const SnackBar(content: Text('Profile updated successfully.')),
      );
    } catch (error) {
      if (!mounted) return;
      messenger.showSnackBar(
        SnackBar(content: Text('Unable to update profile: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  Future<void> _sendSupportRequest() async {
    final api = context.read<BackendApiService>();
    final messenger = ScaffoldMessenger.of(context);
    final name = _nameController.text.trim();
    final email = widget.user.email.trim();
    final phone = _phoneController.text.trim();
    final message = _supportMessageController.text.trim();

    if (name.isEmpty || email.isEmpty || phone.isEmpty || message.isEmpty) {
      messenger.showSnackBar(
        const SnackBar(
          content: Text('Name, email, phone aur support message required hai.'),
        ),
      );
      return;
    }

    final parts = name.split(RegExp(r'\s+'));
    final firstName = parts.isEmpty ? name : parts.first;
    final lastName = parts.length > 1 ? parts.skip(1).join(' ') : '';

    setState(() => _sendingSupport = true);
    try {
      await api.sendSupportMessage(
        firstName: firstName,
        lastName: lastName,
        email: email,
        mobile: phone,
        message: message,
      );
      if (!mounted) return;
      _supportMessageController.clear();
      messenger.showSnackBar(
        const SnackBar(content: Text('Support request sent successfully.')),
      );
    } catch (error) {
      if (!mounted) return;
      messenger.showSnackBar(
        SnackBar(content: Text('Support request failed: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => _sendingSupport = false);
      }
    }
  }

  Future<void> _sendAiMessage() async {
    final api = context.read<BackendApiService>();
    final messenger = ScaffoldMessenger.of(context);
    final input = _assistantController.text.trim();
    if (input.isEmpty) return;

    final updatedMessages = [
      ..._messages,
      _AssistantMessage(role: 'user', text: input),
    ];

    setState(() {
      _messages = updatedMessages;
      _assistantController.clear();
      _aiBusy = true;
    });

    try {
      final reply = await api.askAi(
        updatedMessages
            .map((item) => {'role': item.role, 'content': item.text})
            .toList(),
      );

      if (!mounted) return;
      setState(() {
        _messages = [
          ...updatedMessages,
          _AssistantMessage(role: 'assistant', text: reply),
        ];
      });
    } catch (error) {
      if (!mounted) return;
      messenger.showSnackBar(
        SnackBar(content: Text('AI assistant unavailable: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => _aiBusy = false);
      }
    }
  }

  Future<void> _openUrl(String url) async {
    await launchUrl(
      Uri.parse(url),
      mode: LaunchMode.externalApplication,
    );
  }

  Future<void> _openEmail() async {
    await launchUrl(
      Uri.parse('mailto:${AppConfig.supportEmail}'),
      mode: LaunchMode.externalApplication,
    );
  }

  Future<void> _openPhone() async {
    await launchUrl(
      Uri.parse('tel:${AppConfig.supportPhone}'),
      mode: LaunchMode.externalApplication,
    );
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionController>();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: const Color(0xFF0EA5E9),
                      child: Text(
                        widget.user.initials.isEmpty ? 'S' : widget.user.initials,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.user.displayName,
                            style: Theme.of(context)
                                .textTheme
                                .titleLarge
                                ?.copyWith(fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            widget.user.email,
                            style: const TextStyle(color: Colors.white70),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _ProfileBadge(label: widget.user.role.toUpperCase()),
                    if (widget.user.employeeId.isNotEmpty)
                      _ProfileBadge(label: 'ID ${widget.user.employeeId}'),
                    if (widget.user.status.isNotEmpty)
                      _ProfileBadge(label: widget.user.status.toUpperCase()),
                    _ProfileBadge(
                      label: session.isOnline ? 'ONLINE' : 'OFFLINE',
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Edit Profile',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _nameController,
                  decoration: const InputDecoration(
                    labelText: 'Display name',
                    prefixIcon: Icon(Icons.person_outline_rounded),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(
                    labelText: 'Phone number',
                    prefixIcon: Icon(Icons.phone_outlined),
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _departmentController,
                  decoration: const InputDecoration(
                    labelText: 'Department',
                    prefixIcon: Icon(Icons.apartment_outlined),
                  ),
                ),
                const SizedBox(height: 18),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _saving ? null : _saveProfile,
                    icon: _saving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.save_outlined),
                    label: Text(_saving ? 'Saving...' : 'Save changes'),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Permissions',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 14),
                ...AppPermissionType.values.map((type) {
                  final status = session.permissionStatuses[type];
                  final granted = status == null
                      ? false
                      : session.permissionService.isGranted(status);
                  return ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(
                      granted
                          ? Icons.check_circle_rounded
                          : Icons.warning_amber_rounded,
                      color: granted
                          ? const Color(0xFF22C55E)
                          : const Color(0xFFFBBF24),
                    ),
                    title: Text(session.permissionService.labelFor(type)),
                    subtitle: Text(session.permissionService.descriptionFor(type)),
                    trailing: Text(
                      granted ? 'Granted' : 'Pending',
                      style: TextStyle(
                        color: granted
                            ? const Color(0xFF22C55E)
                            : const Color(0xFFFBBF24),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  );
                }),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    FilledButton.tonalIcon(
                      onPressed: () => session.requestEssentialPermissions(),
                      icon: const Icon(Icons.security_update_good_rounded),
                      label: const Text('Request all'),
                    ),
                    OutlinedButton.icon(
                      onPressed: () => session.openPermissionSettings(),
                      icon: const Icon(Icons.settings_outlined),
                      label: const Text('Open settings'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Support Request',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Backend contact route ke through direct support request bhejo.',
                  style: TextStyle(color: Colors.white70, height: 1.5),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _supportMessageController,
                  minLines: 4,
                  maxLines: 6,
                  decoration: const InputDecoration(
                    labelText: 'What do you need help with?',
                    alignLabelWithHint: true,
                    prefixIcon: Padding(
                      padding: EdgeInsets.only(bottom: 64),
                      child: Icon(Icons.support_agent_outlined),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _sendingSupport ? null : _sendSupportRequest,
                    icon: _sendingSupport
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.send_rounded),
                    label: Text(
                      _sendingSupport ? 'Sending...' : 'Send support request',
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'AI Assistant',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                    ),
                    _ProfileBadge(label: _aiAvailable ? 'LIVE' : 'OFFLINE'),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Backend AI route available ho to mobile se quick help aur guidance mil jayegi.',
                  style: TextStyle(color: Colors.white70, height: 1.5),
                ),
                const SizedBox(height: 16),
                Container(
                  constraints: const BoxConstraints(maxHeight: 280),
                  decoration: BoxDecoration(
                    color: const Color(0xFF071521),
                    borderRadius: BorderRadius.circular(22),
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    padding: const EdgeInsets.all(14),
                    itemBuilder: (context, index) {
                      final message = _messages[index];
                      final isUser = message.role == 'user';
                      return Align(
                        alignment: isUser
                            ? Alignment.centerRight
                            : Alignment.centerLeft,
                        child: Container(
                          constraints: const BoxConstraints(maxWidth: 280),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isUser
                                ? const Color(0xFF0EA5E9)
                                : Colors.white.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(18),
                          ),
                          child: Text(
                            message.text,
                            style: const TextStyle(height: 1.45),
                          ),
                        ),
                      );
                    },
                    separatorBuilder: (_, index) => const SizedBox(height: 10),
                    itemCount: _messages.length,
                  ),
                ),
                const SizedBox(height: 14),
                TextField(
                  controller: _assistantController,
                  minLines: 1,
                  maxLines: 4,
                  decoration: InputDecoration(
                    labelText: 'Ask SolutionHub AI',
                    prefixIcon: const Icon(Icons.auto_awesome_outlined),
                    suffixIcon: IconButton(
                      onPressed: _aiBusy ? null : _sendAiMessage,
                      icon: _aiBusy
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.send_rounded),
                    ),
                  ),
                  onSubmitted: (_) => _aiBusy ? null : _sendAiMessage(),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Quick Links',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                ),
                const SizedBox(height: 14),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    FilledButton.tonalIcon(
                      onPressed: () => _openUrl(AppConfig.websiteUrl),
                      icon: const Icon(Icons.language_rounded),
                      label: const Text('Website'),
                    ),
                    FilledButton.tonalIcon(
                      onPressed: _openEmail,
                      icon: const Icon(Icons.mail_outline_rounded),
                      label: const Text('Email'),
                    ),
                    FilledButton.tonalIcon(
                      onPressed: _openPhone,
                      icon: const Icon(Icons.call_outlined),
                      label: const Text('Call'),
                    ),
                    FilledButton.tonalIcon(
                      onPressed: () => session.logout(),
                      icon: const Icon(Icons.logout_rounded),
                      label: const Text('Logout'),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  'API base: ${AppConfig.backendBaseUrl}',
                  style: const TextStyle(color: Colors.white54),
                ),
                const SizedBox(height: 10),
                Text(
                  AppConfig.firebaseSetupHint,
                  style: const TextStyle(color: Colors.white60, height: 1.5),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _ProfileBadge extends StatelessWidget {
  const _ProfileBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _AssistantMessage {
  const _AssistantMessage({
    required this.role,
    required this.text,
  });

  final String role;
  final String text;
}
