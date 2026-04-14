import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../models/app_models.dart';
import '../services/solutionhub_repository.dart';
import '../theme/app_theme.dart';
import '../widgets/modern_ui.dart';

class AdminWorkspacePage extends StatefulWidget {
  const AdminWorkspacePage({
    super.key,
    required this.user,
    required this.onOpenCourses,
    required this.onOpenAlerts,
    required this.onOpenProjects,
    required this.onOpenRoleWorkspace,
    required this.onOpenServiceHub,
  });

  final AppUser user;
  final VoidCallback onOpenCourses;
  final VoidCallback onOpenAlerts;
  final VoidCallback onOpenProjects;
  final VoidCallback onOpenRoleWorkspace;
  final VoidCallback onOpenServiceHub;

  @override
  State<AdminWorkspacePage> createState() => _AdminWorkspacePageState();
}

class _AdminWorkspacePageState extends State<AdminWorkspacePage> {
  late final SolutionHubRepository _repository;
  late final Stream<HomeDashboardData> _dashboardStream;
  late final Stream<List<AppUser>> _usersStream;
  late final Stream<List<ProjectItem>> _projectsStream;

  @override
  void initState() {
    super.initState();
    _repository = context.read<SolutionHubRepository>();
    _dashboardStream = _repository.watchDashboard(widget.user);
    _usersStream = _repository.watchUsers();
    _projectsStream = _repository.watchProjects();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Admin Workspace')),
      body: AppBackdrop(
        child: StreamBuilder<HomeDashboardData>(
          stream: _dashboardStream,
          initialData: HomeDashboardData.empty(),
          builder: (context, dashboardSnapshot) {
            final dashboard = dashboardSnapshot.data ?? HomeDashboardData.empty();

            return StreamBuilder<List<AppUser>>(
              stream: _usersStream,
              initialData: const [],
              builder: (context, usersSnapshot) {
                final users = usersSnapshot.data ?? const [];
                final customers = users.where((item) => item.isCustomer).length;
                final admins = users.where((item) => item.isAdmin).length;
                final employees = users.where((item) => item.isEmployee).length;
                final activeUsers = users
                    .where((item) => normalizeText(item.status) != 'inactive')
                    .length;

                return StreamBuilder<List<ProjectItem>>(
                  stream: _projectsStream,
                  initialData: const [],
                  builder: (context, projectsSnapshot) {
                    final projects = projectsSnapshot.data ?? const [];
                    final activeProjects =
                        projects.where((item) => item.active).length;

                    return ListView(
                      padding: const EdgeInsets.fromLTRB(20, 14, 20, 120),
                      children: [
                        SectionIntro(
                          eyebrow: 'ADMIN',
                          title: 'Mobile control view for the live platform',
                          subtitle:
                              'Users, courses, projects, certificates, and support signals are summarized here for fast admin checks from mobile.',
                        ),
                        const SizedBox(height: 18),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            MetricPill(
                              label: 'Users',
                              value: '$activeUsers',
                              icon: Icons.people_alt_outlined,
                              color: SolutionHubTheme.primary,
                            ),
                            MetricPill(
                              label: 'Customers',
                              value: '$customers',
                              icon: Icons.person_outline_rounded,
                              color: SolutionHubTheme.success,
                            ),
                            MetricPill(
                              label: 'Employees',
                              value: '$employees',
                              icon: Icons.badge_outlined,
                              color: SolutionHubTheme.tertiary,
                            ),
                            MetricPill(
                              label: 'Admins',
                              value: '$admins',
                              icon: Icons.admin_panel_settings_outlined,
                              color: SolutionHubTheme.secondary,
                            ),
                            MetricPill(
                              label: 'Courses',
                              value: '${dashboard.courses.length}',
                              icon: Icons.school_outlined,
                              color: SolutionHubTheme.primary,
                            ),
                            MetricPill(
                              label: 'Projects',
                              value: '$activeProjects',
                              icon: Icons.folder_copy_outlined,
                              color: SolutionHubTheme.warning,
                            ),
                            MetricPill(
                              label: 'Pending Tasks',
                              value: '${dashboard.pendingTaskCount}',
                              icon: Icons.task_alt_outlined,
                              color: SolutionHubTheme.secondary,
                            ),
                            MetricPill(
                              label: 'Unread Alerts',
                              value: '${dashboard.unreadNotificationCount}',
                              icon: Icons.notifications_active_outlined,
                              color: SolutionHubTheme.success,
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        const SectionIntro(
                          eyebrow: 'OPERATIONS',
                          title: 'Quick admin actions',
                          subtitle:
                              'Use these shortcuts to jump into the most common operational areas.',
                        ),
                        const SizedBox(height: 16),
                        GridView.count(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          crossAxisCount: 2,
                          mainAxisSpacing: 12,
                          crossAxisSpacing: 12,
                          childAspectRatio: 1.1,
                          children: [
                            _AdminActionCard(
                              icon: Icons.school_rounded,
                              title: 'Courses',
                              subtitle: 'Review course delivery and meetings',
                              color: SolutionHubTheme.primary,
                              onTap: widget.onOpenCourses,
                            ),
                            _AdminActionCard(
                              icon: Icons.folder_special_rounded,
                              title: 'Projects',
                              subtitle: 'Open marketplace and listings',
                              color: SolutionHubTheme.tertiary,
                              onTap: widget.onOpenProjects,
                            ),
                            _AdminActionCard(
                              icon: Icons.notifications_active_rounded,
                              title: 'Alerts',
                              subtitle: 'Open real-time notifications feed',
                              color: SolutionHubTheme.success,
                              onTap: widget.onOpenAlerts,
                            ),
                            _AdminActionCard(
                              icon: Icons.manage_accounts_rounded,
                              title: 'Service Hub',
                              subtitle: 'Support, verification, and payment tools',
                              color: SolutionHubTheme.secondary,
                              onTap: widget.onOpenServiceHub,
                            ),
                          ],
                        ),
                        const SizedBox(height: 24),
                        SectionIntro(
                          eyebrow: 'TEAM',
                          title: 'Recent user roster',
                          subtitle:
                              'Identity data streams from the shared Firestore user collection.',
                          trailing: TagChip(
                            label: '${users.length} total',
                            color: SolutionHubTheme.primary,
                          ),
                        ),
                        const SizedBox(height: 16),
                        if (users.isEmpty)
                          const EmptyStateCard(
                            icon: Icons.group_off_rounded,
                            title: 'No team members found',
                            message:
                                'User profiles will appear here once the shared collection is available.',
                          )
                        else
                          GlassCard(
                            child: Column(
                              children: users
                                  .take(6)
                                  .map((user) => _RosterTile(user: user))
                                  .toList(growable: false),
                            ),
                          ),
                        const SizedBox(height: 24),
                        SectionIntro(
                          eyebrow: 'OVERVIEW',
                          title: 'Live platform snapshot',
                          subtitle:
                              'Courses, enrollments, certificates, and notifications are condensed here for fast mobile scanning.',
                          trailing: TagChip(
                            label: '${dashboard.activeStudentCount} students',
                            color: SolutionHubTheme.success,
                          ),
                        ),
                        const SizedBox(height: 16),
                        GlassCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _SnapshotRow(
                                label: 'Certificates issued',
                                value: '${dashboard.certificates.length}',
                              ),
                              _SnapshotRow(
                                label: 'Course enrollments',
                                value: '${dashboard.enrollments.length}',
                              ),
                              _SnapshotRow(
                                label: 'Task queue',
                                value: '${dashboard.tasks.length}',
                              ),
                              _SnapshotRow(
                                label: 'Announcement active',
                                value: dashboard.announcement.enabled
                                    ? 'Yes'
                                    : 'No',
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: OutlinedButton.icon(
                            onPressed: widget.onOpenRoleWorkspace,
                            icon: const Icon(Icons.task_outlined),
                            label: const Text('Open task workspace'),
                          ),
                        ),
                      ],
                    );
                  },
                );
              },
            );
          },
        ),
      ),
    );
  }
}

class _AdminActionCard extends StatelessWidget {
  const _AdminActionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(26),
      onTap: onTap,
      child: GlassCard(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AccentIconBubble(icon: icon, color: color),
            const Spacer(),
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}

class _RosterTile extends StatelessWidget {
  const _RosterTile({required this.user});

  final AppUser user;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: SolutionHubTheme.primary.withValues(alpha: 0.16),
            child: Text(
              user.initials.isEmpty ? 'S' : user.initials,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.displayName,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  user.email,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              TagChip(
                label: user.role.toUpperCase(),
                color: user.isAdmin
                    ? SolutionHubTheme.secondary
                    : user.isEmployee
                    ? SolutionHubTheme.tertiary
                    : SolutionHubTheme.success,
              ),
              const SizedBox(height: 6),
              Text(
                user.status.isEmpty ? 'active' : user.status,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.white.withValues(alpha: 0.58),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SnapshotRow extends StatelessWidget {
  const _SnapshotRow({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
          const SizedBox(width: 14),
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
