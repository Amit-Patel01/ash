import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/app_models.dart';
import '../services/solutionhub_repository.dart';
import '../theme/app_theme.dart';
import '../widgets/modern_ui.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key, required this.user});

  final AppUser user;

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  late final SolutionHubRepository _repository;
  late final Stream<List<ChatRoomItem>> _chatStream;
  bool _creatingSupportChat = false;

  @override
  void initState() {
    super.initState();
    _repository = context.read<SolutionHubRepository>();
    _chatStream = _repository.watchChatsForUser(widget.user);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Inbox')),
      body: AppBackdrop(
        child: StreamBuilder<List<ChatRoomItem>>(
          stream: _chatStream,
          initialData: const [],
          builder: (context, snapshot) {
            final chats = snapshot.data ?? const [];

            return ListView(
              padding: const EdgeInsets.fromLTRB(20, 14, 20, 120),
              children: [
                SectionIntro(
                  eyebrow: 'CHAT',
                  title: widget.user.isCustomer
                      ? 'Support and project conversations'
                      : 'Team and customer inbox',
                  subtitle: widget.user.isCustomer
                      ? 'Reach support, follow up on delivery, and keep important conversations inside the app.'
                      : 'Live chat rooms sync from Firestore so delivery and support communication stays portable.',
                ),
                const SizedBox(height: 18),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    MetricPill(
                      label: 'Rooms',
                      value: '${chats.length}',
                      icon: Icons.forum_outlined,
                      color: SolutionHubTheme.primary,
                    ),
                    MetricPill(
                      label: 'Direct',
                      value: '${chats.where((item) => !item.isGroup).length}',
                      icon: Icons.chat_bubble_outline_rounded,
                      color: SolutionHubTheme.tertiary,
                    ),
                    MetricPill(
                      label: 'Groups',
                      value: '${chats.where((item) => item.isGroup).length}',
                      icon: Icons.groups_2_outlined,
                      color: SolutionHubTheme.secondary,
                    ),
                  ],
                ),
                if (widget.user.isCustomer) ...[
                  const SizedBox(height: 18),
                  GlassCard(
                    gradient: const LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [Color(0xFF132639), Color(0xFF10384A)],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const TagChip(
                          label: 'Support shortcut',
                          color: SolutionHubTheme.success,
                          icon: Icons.support_agent_rounded,
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Need help right now?',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Create or reopen a direct support chat and continue the conversation from mobile.',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 16),
                        FilledButton.icon(
                          onPressed: _creatingSupportChat ? null : _openSupportChat,
                          icon: _creatingSupportChat
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Icon(Icons.chat_rounded),
                          label: Text(
                            _creatingSupportChat
                                ? 'Connecting...'
                                : 'Start support chat',
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 22),
                if (chats.isEmpty)
                  const EmptyStateCard(
                    icon: Icons.mark_chat_unread_outlined,
                    title: 'No conversations yet',
                    message:
                        'When support or team conversations begin, they will appear here automatically.',
                  )
                else
                  ...chats.map(
                    (chat) => _ChatRoomCard(
                      user: widget.user,
                      chat: chat,
                      onTap: () => _openChatThread(chat),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }

  Future<void> _openSupportChat() async {
    setState(() => _creatingSupportChat = true);
    try {
      final chatId = await _repository.ensureSupportChat(widget.user);
      if (!mounted) return;

      if (chatId == null || chatId.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Support team is not available right now.')),
        );
        return;
      }

      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => ChatThreadPage(
            user: widget.user,
            chatId: chatId,
            initialTitle: 'Support',
          ),
        ),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to open support chat: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => _creatingSupportChat = false);
      }
    }
  }

  void _openChatThread(ChatRoomItem chat) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ChatThreadPage(
          user: widget.user,
          chatId: chat.id,
          initialTitle: chat.titleFor(widget.user.uid),
        ),
      ),
    );
  }
}

class _ChatRoomCard extends StatelessWidget {
  const _ChatRoomCard({
    required this.user,
    required this.chat,
    required this.onTap,
  });

  final AppUser user;
  final ChatRoomItem chat;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final partner = chat.partnerFor(user.uid);
    final subtitle = chat.subtitleFor(user.uid);

    return InkWell(
      borderRadius: BorderRadius.circular(28),
      onTap: onTap,
      child: GlassCard(
        margin: const EdgeInsets.only(bottom: 14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              radius: 26,
              backgroundColor: chat.isGroup
                  ? SolutionHubTheme.secondary.withValues(alpha: 0.18)
                  : SolutionHubTheme.primary.withValues(alpha: 0.18),
              child: Icon(
                chat.isGroup ? Icons.groups_rounded : Icons.person_rounded,
                color: chat.isGroup
                    ? SolutionHubTheme.secondary
                    : SolutionHubTheme.primary,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          chat.titleFor(user.uid),
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      if ((chat.lastMessageAt ?? chat.createdAt) != null)
                        Text(
                          DateFormat('dd MMM').format(
                            chat.lastMessageAt ?? chat.createdAt!,
                          ),
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    subtitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      TagChip(
                        label: chat.isGroup
                            ? '${chat.participants.length} members'
                            : (partner?.role.isNotEmpty == true
                                  ? partner!.role
                                  : 'Direct'),
                        color: chat.isGroup
                            ? SolutionHubTheme.secondary
                            : SolutionHubTheme.tertiary,
                      ),
                      if (chat.lastSenderName.isNotEmpty)
                        TagChip(
                          label: 'Last by ${chat.lastSenderName}',
                          color: Colors.white70,
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ChatThreadPage extends StatefulWidget {
  const ChatThreadPage({
    super.key,
    required this.user,
    required this.chatId,
    required this.initialTitle,
  });

  final AppUser user;
  final String chatId;
  final String initialTitle;

  @override
  State<ChatThreadPage> createState() => _ChatThreadPageState();
}

class _ChatThreadPageState extends State<ChatThreadPage> {
  late final SolutionHubRepository _repository;
  late final Stream<List<ChatMessageItem>> _messageStream;
  final TextEditingController _controller = TextEditingController();
  bool _sending = false;
  bool _startingCall = false;

  @override
  void initState() {
    super.initState();
    _repository = context.read<SolutionHubRepository>();
    _messageStream = _repository.watchChatMessages(widget.chatId);
    unawaited(
      _repository.markChatRead(
        chatId: widget.chatId,
        currentUserId: widget.user.uid,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.initialTitle),
        actions: [
          IconButton(
            onPressed: _startingCall ? null : _startCall,
            icon: _startingCall
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.video_call_rounded),
          ),
        ],
      ),
      body: AppBackdrop(
        child: Column(
          children: [
            Expanded(
              child: StreamBuilder<List<ChatMessageItem>>(
                stream: _messageStream,
                initialData: const [],
                builder: (context, snapshot) {
                  final messages = snapshot.data ?? const [];
                  final hasUnreadFromOther = messages.any(
                    (item) =>
                        item.senderId != widget.user.uid &&
                        normalizeText(item.status) != 'read',
                  );

                  if (hasUnreadFromOther) {
                    unawaited(
                      _repository.markChatRead(
                        chatId: widget.chatId,
                        currentUserId: widget.user.uid,
                      ),
                    );
                  }

                  if (messages.isEmpty) {
                    return const Padding(
                      padding: EdgeInsets.all(20),
                      child: EmptyStateCard(
                        icon: Icons.chat_bubble_outline_rounded,
                        title: 'No messages yet',
                        message:
                            'Send the first message to start this conversation.',
                      ),
                    );
                  }

                  return ListView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
                    itemCount: messages.length,
                    itemBuilder: (context, index) {
                      final message = messages[index];
                      final isMine = message.senderId == widget.user.uid;
                      return _MessageBubble(
                        message: message,
                        isMine: isMine,
                        onOpenCall: () => _openUrl(message.callUrl),
                      );
                    },
                  );
                },
              ),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
                child: GlassCard(
                  radius: 24,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 14,
                    vertical: 12,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _controller,
                          minLines: 1,
                          maxLines: 4,
                          textInputAction: TextInputAction.send,
                          onSubmitted: (_) => _sendMessage(),
                          decoration: const InputDecoration(
                            hintText: 'Type your message...',
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
                            filled: false,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      FilledButton(
                        onPressed: _sending ? null : _sendMessage,
                        style: FilledButton.styleFrom(
                          minimumSize: const Size(54, 54),
                          shape: const CircleBorder(),
                          padding: EdgeInsets.zero,
                        ),
                        child: _sending
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : const Icon(Icons.send_rounded),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() => _sending = true);
    try {
      await _repository.sendChatMessage(
        chatId: widget.chatId,
        sender: widget.user,
        text: text,
      );
      _controller.clear();
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to send message: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => _sending = false);
      }
    }
  }

  Future<void> _startCall() async {
    setState(() => _startingCall = true);
    try {
      final url = await _repository.startVideoCall(
        chatId: widget.chatId,
        sender: widget.user,
      );
      await _openUrl(url);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Unable to start call: $error')),
      );
    } finally {
      if (mounted) {
        setState(() => _startingCall = false);
      }
    }
  }

  Future<void> _openUrl(String url) async {
    if (url.isEmpty) return;
    await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  }
}

class _MessageBubble extends StatelessWidget {
  const _MessageBubble({
    required this.message,
    required this.isMine,
    required this.onOpenCall,
  });

  final ChatMessageItem message;
  final bool isMine;
  final VoidCallback onOpenCall;

  @override
  Widget build(BuildContext context) {
    final bubbleColor = isMine
        ? SolutionHubTheme.primary.withValues(alpha: 0.18)
        : Colors.white.withValues(alpha: 0.06);

    return Align(
      alignment: isMine ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        constraints: const BoxConstraints(maxWidth: 320),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: bubbleColor,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: isMine
                ? SolutionHubTheme.primary.withValues(alpha: 0.2)
                : Colors.white.withValues(alpha: 0.08),
          ),
        ),
        child: Column(
          crossAxisAlignment:
              isMine ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            if (!isMine && message.senderName.isNotEmpty) ...[
              Text(
                message.senderName,
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: SolutionHubTheme.secondary,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 6),
            ],
            if (message.isVideoCall) ...[
              Row(
                children: [
                  const Icon(
                    Icons.video_call_rounded,
                    color: SolutionHubTheme.success,
                  ),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      message.text.isEmpty ? 'Video call started' : message.text,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
              if (message.callUrl.isNotEmpty) ...[
                const SizedBox(height: 10),
                FilledButton.tonalIcon(
                  onPressed: onOpenCall,
                  icon: const Icon(Icons.open_in_new_rounded),
                  label: const Text('Join meeting'),
                ),
              ],
            ] else
              Text(
                message.text,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.white,
                ),
              ),
            const SizedBox(height: 8),
            Text(
              message.timestamp == null
                  ? 'Sending...'
                  : DateFormat('hh:mm a').format(message.timestamp!),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.white.withValues(alpha: 0.58),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
