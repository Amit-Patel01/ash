import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/app_models.dart';
import '../services/permission_service.dart';
import '../services/solutionhub_repository.dart';
import '../state/session_controller.dart';
import '../theme/app_theme.dart';
import '../widgets/modern_ui.dart';

class NotificationsPage extends StatefulWidget {
  const NotificationsPage({super.key, required this.user});

  final AppUser user;

  @override
  State<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends State<NotificationsPage> {
  late final SolutionHubRepository _repository;
  late final Stream<List<AppNotificationItem>> _stream;

  @override
  void initState() {
    super.initState();
    _repository = context.read<SolutionHubRepository>();
    _stream = _repository.watchNotifications(widget.user);
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionController>();
    final notificationStatus =
        session.permissionStatuses[AppPermissionType.notifications];
    final permissionGranted =
        notificationStatus != null &&
        session.permissionService.isGranted(notificationStatus);

    return StreamBuilder<List<AppNotificationItem>>(
      stream: _stream,
      initialData: const [],
      builder: (context, snapshot) {
        final items = snapshot.data ?? const [];
        final unreadIds = items
            .where((item) => !item.read)
            .map((item) => item.id)
            .toList();
        final liveJoinCount = items
            .where(
              (item) => item.meetingLink.isNotEmpty || item.callUrl.isNotEmpty,
            )
            .length;

        return ListView(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 118),
          children: [
            SectionIntro(
              eyebrow: 'ALERTS',
              title: 'Live notifications feed',
              subtitle:
                  'Unread updates, meeting joins aur device notification readiness ko ek hi place me manage kijiye.',
              trailing: TagChip(
                label: '${unreadIds.length} unread',
                color: SolutionHubTheme.success,
              ),
            ),
            const SizedBox(height: 18),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                MetricPill(
                  label: 'Unread',
                  value: '${unreadIds.length}',
                  icon: Icons.mark_email_unread_outlined,
                  color: SolutionHubTheme.primary,
                ),
                MetricPill(
                  label: 'Live joins',
                  value: '$liveJoinCount',
                  icon: Icons.video_call_rounded,
                  color: SolutionHubTheme.success,
                ),
              ],
            ),
            if (!permissionGranted) ...[
              const SizedBox(height: 18),
              GlassCard(
                backgroundColor: const Color(0xCC31220E),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const TagChip(
                      label: 'Notification permission pending',
                      color: SolutionHubTheme.secondary,
                      icon: Icons.notifications_off_outlined,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'In-app alerts visible rahengi, lekin device pop-up notifications ke liye permission allow karna zaroori hai.',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 16),
                    FilledButton.tonalIcon(
                      onPressed: () => session.requestEssentialPermissions(),
                      icon: const Icon(Icons.notifications_active_outlined),
                      label: const Text('Grant permissions'),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 18),
            if (unreadIds.isNotEmpty)
              Align(
                alignment: Alignment.centerRight,
                child: TextButton.icon(
                  onPressed: () =>
                      _repository.markAllNotificationsRead(unreadIds),
                  icon: const Icon(Icons.done_all_rounded),
                  label: const Text('Mark all read'),
                ),
              ),
            if (items.isEmpty)
              const EmptyStateCard(
                icon: Icons.notifications_none_rounded,
                title: 'No notifications yet',
                message:
                    'New enrollments, meeting reminders aur direct updates yahin par live dikhengi.',
              )
            else
              ...items.map(
                (item) => _NotificationCard(
                  item: item,
                  onMarkRead: item.read
                      ? null
                      : () => _repository.markNotificationRead(item.id),
                  onOpenMeeting: () => _openExternal(
                    item.meetingLink.isNotEmpty
                        ? item.meetingLink
                        : item.callUrl,
                  ),
                  formattedDate: _formatDate(item.createdAt),
                ),
              ),
          ],
        );
      },
    );
  }

  Future<void> _openExternal(String url) async {
    if (url.isEmpty) return;
    await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  }

  String _formatDate(DateTime? value) {
    if (value == null) return 'Now';
    return DateFormat('dd MMM, hh:mm a').format(value);
  }
}

class _NotificationCard extends StatelessWidget {
  const _NotificationCard({
    required this.item,
    required this.formattedDate,
    required this.onOpenMeeting,
    this.onMarkRead,
  });

  final AppNotificationItem item;
  final String formattedDate;
  final VoidCallback onOpenMeeting;
  final VoidCallback? onMarkRead;

  @override
  Widget build(BuildContext context) {
    final hasMeeting = item.meetingLink.isNotEmpty || item.callUrl.isNotEmpty;

    return GlassCard(
      margin: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AccentIconBubble(
                icon: item.type == 'new_enrollment'
                    ? Icons.school_outlined
                    : hasMeeting
                    ? Icons.videocam_rounded
                    : Icons.notifications_none_rounded,
                color: item.read
                    ? Colors.white70
                    : hasMeeting
                    ? SolutionHubTheme.success
                    : SolutionHubTheme.primary,
                size: 46,
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
                            item.title,
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(fontWeight: FontWeight.w800),
                          ),
                        ),
                        TagChip(
                          label: item.read ? 'Seen' : 'New',
                          color: item.read
                              ? Colors.white70
                              : SolutionHubTheme.success,
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      item.message,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              if (item.courseTitle.isNotEmpty)
                TagChip(
                  label: item.courseTitle,
                  color: SolutionHubTheme.tertiary,
                ),
              if (item.planLabel.isNotEmpty)
                TagChip(
                  label: item.planLabel,
                  color: SolutionHubTheme.secondary,
                ),
              if (item.studentMobile.isNotEmpty)
                TagChip(
                  label: item.studentMobile,
                  color: SolutionHubTheme.primary,
                ),
              TagChip(label: formattedDate, color: Colors.white70),
            ],
          ),
          if (hasMeeting || onMarkRead != null) ...[
            const SizedBox(height: 18),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                if (hasMeeting)
                  FilledButton.icon(
                    onPressed: onOpenMeeting,
                    icon: const Icon(Icons.video_call_rounded),
                    label: const Text('Join live'),
                  ),
                if (onMarkRead != null)
                  OutlinedButton.icon(
                    onPressed: onMarkRead,
                    icon: const Icon(Icons.done_rounded),
                    label: const Text('Mark read'),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
