import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../config/app_config.dart';
import '../models/app_models.dart';
import '../services/solutionhub_repository.dart';
import '../state/session_controller.dart';
import '../theme/app_theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/modern_ui.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.user, required this.onNavigate});

  final AppUser user;
  final ValueChanged<int> onNavigate;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late final Stream<HomeDashboardData> _dashboardStream;

  @override
  void initState() {
    super.initState();
    _dashboardStream = context.read<SolutionHubRepository>().watchDashboard(
      widget.user,
    );
  }

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionController>();

    return StreamBuilder<HomeDashboardData>(
      stream: _dashboardStream,
      initialData: HomeDashboardData.empty(),
      builder: (context, snapshot) {
        final data = snapshot.data ?? HomeDashboardData.empty();
        final metrics = _buildMetrics(session, data);
        final actions = _buildActions(context, session);

        return ListView(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 118),
          children: [
            GlassCard(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color(0xFF0C2232),
                  Color(0xFF0B3042),
                  Color(0xFF0F4C55),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Welcome back',
                              style: Theme.of(context).textTheme.labelLarge
                                  ?.copyWith(
                                    color: Colors.white.withValues(alpha: 0.7),
                                    letterSpacing: 0.8,
                                  ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              widget.user.displayName,
                              style: Theme.of(context).textTheme.headlineMedium
                                  ?.copyWith(fontWeight: FontWeight.w800),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              widget.user.isCustomer
                                  ? 'Courses, live sessions, certificates aur mobile alerts ek hi polished workspace me ready hain.'
                                  : widget.user.isAdmin
                                  ? 'Courses, teams aur notifications ka clean command view yahin se manage kijiye.'
                                  : 'Assigned students, meetings aur task visibility ke saath aapka delivery cockpit ready hai.',
                              style: Theme.of(context).textTheme.bodyLarge,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      const BrandLogo(
                        size: 70,
                        padding: 12,
                        borderRadius: 22,
                        backgroundColor: Color(0x145EEAD4),
                      ),
                    ],
                  ),
                  const SizedBox(height: 18),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      TagChip(
                        label: session.isOnline
                            ? 'Online sync'
                            : 'Offline mode',
                        color: session.isOnline
                            ? SolutionHubTheme.success
                            : SolutionHubTheme.secondary,
                        icon: session.isOnline
                            ? Icons.wifi_rounded
                            : Icons.wifi_off_rounded,
                      ),
                      TagChip(
                        label: widget.user.role.toUpperCase(),
                        color: SolutionHubTheme.tertiary,
                        icon: Icons.verified_user_outlined,
                      ),
                      TagChip(
                        label:
                            '${session.grantedPermissionCount}/${session.permissionStatuses.length} permissions',
                        color: SolutionHubTheme.secondary,
                        icon: Icons.security_rounded,
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 22),
            SectionIntro(
              eyebrow: 'OVERVIEW',
              title: 'Everything in one glance',
              subtitle:
                  'Live counts, certificates, unread alerts aur task health ko clean mobile cards me track karo.',
              trailing: TagChip(
                label: '${metrics.length} blocks',
                color: SolutionHubTheme.primary,
              ),
            ),
            const SizedBox(height: 16),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: metrics.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.04,
              ),
              itemBuilder: (context, index) =>
                  _MetricCard(item: metrics[index]),
            ),
            if (data.announcement.enabled) ...[
              const SizedBox(height: 22),
              GlassCard(
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [Color(0xFF1A2536), Color(0xFF142B3D)],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const TagChip(
                      label: 'Announcement',
                      color: SolutionHubTheme.secondary,
                      icon: Icons.campaign_outlined,
                    ),
                    const SizedBox(height: 14),
                    Text(
                      data.announcement.title,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      data.announcement.message,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    if (data.announcement.ctaUrl.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      FilledButton.tonalIcon(
                        onPressed: () =>
                            _openExternal(data.announcement.ctaUrl),
                        icon: const Icon(Icons.open_in_new_rounded),
                        label: Text(
                          data.announcement.ctaLabel.isEmpty
                              ? 'Open now'
                              : data.announcement.ctaLabel,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
            const SizedBox(height: 22),
            const SectionIntro(
              eyebrow: 'FAST ACCESS',
              title: 'Quick actions',
              subtitle:
                  'Most-used mobile actions ko directly yahin se launch kijiye.',
            ),
            const SizedBox(height: 16),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: actions.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.26,
              ),
              itemBuilder: (context, index) =>
                  _ActionCard(item: actions[index]),
            ),
            const SizedBox(height: 22),
            SectionIntro(
              eyebrow: 'LIVE FEED',
              title: 'Recent updates',
              subtitle:
                  'New notifications aur platform activity iss section me instantly surface hoti hai.',
              trailing: TagChip(
                label: '${data.unreadNotificationCount} unread',
                color: SolutionHubTheme.success,
              ),
            ),
            const SizedBox(height: 16),
            if (data.notifications.isEmpty)
              const EmptyStateCard(
                icon: Icons.notifications_none_rounded,
                title: 'No fresh updates right now',
                message:
                    'New enrollments, live alerts aur activity cards yahin par show hongi.',
              )
            else
              GlassCard(
                child: Column(
                  children: [
                    for (final item in data.notifications.take(4))
                      _UpdateRow(
                        item: item,
                        formattedDate: _formatDate(item.createdAt),
                      ),
                  ],
                ),
              ),
          ],
        );
      },
    );
  }

  List<_MetricItem> _buildMetrics(
    SessionController session,
    HomeDashboardData data,
  ) {
    if (widget.user.isCustomer) {
      return [
        _MetricItem(
          label: 'My Courses',
          value: '${data.courses.length}',
          icon: Icons.school_outlined,
          color: SolutionHubTheme.primary,
        ),
        _MetricItem(
          label: 'Certificates',
          value: '${data.certificates.length}',
          icon: Icons.workspace_premium_outlined,
          color: SolutionHubTheme.secondary,
        ),
        _MetricItem(
          label: 'Unread Alerts',
          value: '${data.unreadNotificationCount}',
          icon: Icons.notifications_active_outlined,
          color: SolutionHubTheme.success,
        ),
        _MetricItem(
          label: 'Permissions',
          value:
              '${session.grantedPermissionCount}/${session.permissionStatuses.length}',
          icon: Icons.security_rounded,
          color: SolutionHubTheme.warning,
        ),
      ];
    }

    if (widget.user.isAdmin) {
      return [
        _MetricItem(
          label: 'Courses',
          value: '${data.courses.length}',
          icon: Icons.library_books_outlined,
          color: SolutionHubTheme.primary,
        ),
        _MetricItem(
          label: 'Enrollments',
          value: '${data.activeStudentCount}',
          icon: Icons.groups_2_outlined,
          color: SolutionHubTheme.success,
        ),
        _MetricItem(
          label: 'Open Tasks',
          value: '${data.pendingTaskCount}',
          icon: Icons.task_alt_outlined,
          color: SolutionHubTheme.secondary,
        ),
        _MetricItem(
          label: 'Unread Alerts',
          value: '${data.unreadNotificationCount}',
          icon: Icons.notifications_active_outlined,
          color: SolutionHubTheme.warning,
        ),
      ];
    }

    return [
      _MetricItem(
        label: 'Assigned Courses',
        value: '${data.courses.length}',
        icon: Icons.menu_book_outlined,
        color: SolutionHubTheme.primary,
      ),
      _MetricItem(
        label: 'Students',
        value: '${data.activeStudentCount}',
        icon: Icons.group_outlined,
        color: SolutionHubTheme.success,
      ),
      _MetricItem(
        label: 'Pending Tasks',
        value: '${data.pendingTaskCount}',
        icon: Icons.pending_actions_outlined,
        color: SolutionHubTheme.secondary,
      ),
      _MetricItem(
        label: 'Unread Alerts',
        value: '${data.unreadNotificationCount}',
        icon: Icons.notifications_active_outlined,
        color: SolutionHubTheme.warning,
      ),
    ];
  }

  List<_ActionItem> _buildActions(
    BuildContext context,
    SessionController session,
  ) {
    return [
      _ActionItem(
        label: 'Permissions',
        caption: 'Allow device alerts',
        icon: Icons.security_update_good_rounded,
        color: SolutionHubTheme.primary,
        onTap: () async {
          final messenger = ScaffoldMessenger.of(context);
          await session.requestEssentialPermissions();
          if (!context.mounted) return;
          messenger.showSnackBar(
            const SnackBar(content: Text('Permissions status updated.')),
          );
        },
      ),
      _ActionItem(
        label: widget.user.isCustomer ? 'Certificates' : 'Tasks',
        caption: widget.user.isCustomer ? 'Issued docs' : 'Assigned work',
        icon: widget.user.isCustomer
            ? Icons.workspace_premium_outlined
            : Icons.task_outlined,
        color: SolutionHubTheme.secondary,
        onTap: () => widget.onNavigate(2),
      ),
      _ActionItem(
        label: 'Alerts',
        caption: 'Unread notifications',
        icon: Icons.notifications_active_outlined,
        color: SolutionHubTheme.success,
        onTap: () => widget.onNavigate(3),
      ),
      _ActionItem(
        label: 'Website',
        caption: 'Open SolutionHub',
        icon: Icons.language_rounded,
        color: SolutionHubTheme.tertiary,
        onTap: () => _openExternal(AppConfig.websiteUrl),
      ),
    ];
  }

  Future<void> _openExternal(String url) async {
    await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  }

  String _formatDate(DateTime? value) {
    if (value == null) return 'Now';
    return DateFormat('dd MMM').format(value);
  }
}

class _MetricItem {
  const _MetricItem({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color color;
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.item});

  final _MetricItem item;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AccentIconBubble(icon: item.icon, color: item.color),
          const Spacer(),
          Text(
            item.value,
            style: Theme.of(
              context,
            ).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 6),
          Text(item.label, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}

class _ActionItem {
  const _ActionItem({
    required this.label,
    required this.caption,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  final String label;
  final String caption;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
}

class _ActionCard extends StatelessWidget {
  const _ActionCard({required this.item});

  final _ActionItem item;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(26),
      onTap: item.onTap,
      child: GlassCard(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AccentIconBubble(icon: item.icon, color: item.color),
            const Spacer(),
            Text(
              item.label,
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 6),
            Text(item.caption, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      ),
    );
  }
}

class _UpdateRow extends StatelessWidget {
  const _UpdateRow({required this.item, required this.formattedDate});

  final AppNotificationItem item;
  final String formattedDate;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.04),
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AccentIconBubble(
              icon: item.type == 'new_enrollment'
                  ? Icons.school_outlined
                  : item.meetingLink.isNotEmpty
                  ? Icons.videocam_rounded
                  : Icons.notifications_none_rounded,
              color: item.read ? Colors.white70 : SolutionHubTheme.primary,
              size: 42,
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
                        label: formattedDate,
                        color: SolutionHubTheme.tertiary,
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
      ),
    );
  }
}
