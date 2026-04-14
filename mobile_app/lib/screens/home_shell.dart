import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/session_controller.dart';
import '../theme/app_theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/modern_ui.dart';
import 'admin_workspace_page.dart';
import 'certificates_page.dart';
import 'chat_page.dart';
import 'courses_page.dart';
import 'home_page.dart';
import 'notifications_page.dart';
import 'projects_page.dart';
import 'profile_page.dart';
import 'service_hub_page.dart';
import 'tasks_page.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final session = context.watch<SessionController>();
    final user = session.currentUser;

    if (user == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final pages = [
      HomePage(
        key: ValueKey('home-${user.uid}'),
        user: user,
        onNavigate: _jumpTo,
        onOpenProjects: _openProjectsPage,
        onOpenInbox: _openChatInbox,
        onOpenServiceHub: _openServiceHub,
        onOpenAdminWorkspace: user.isAdmin ? () => _openAdminCenter(user) : null,
      ),
      CoursesPage(key: ValueKey('courses-${user.uid}'), user: user),
      user.isCustomer
          ? CertificatesPage(
              key: ValueKey('certificates-${user.uid}'),
              user: user,
            )
          : TasksPage(key: ValueKey('tasks-${user.uid}'), user: user),
      NotificationsPage(key: ValueKey('notifications-${user.uid}'), user: user),
      ProfilePage(key: ValueKey('profile-${user.uid}'), user: user),
    ];

    final titles = [
      'Dashboard',
      user.isCustomer ? 'Learning Space' : 'Course Control',
      user.isCustomer ? 'Certificates' : 'Tasks',
      'Alerts',
      'Hub',
    ];

    final subtitles = [
      'Overview, sync aur quick actions',
      user.isCustomer
          ? 'Courses, meetings aur materials'
          : 'Plans, delivery aur live sessions',
      user.isCustomer
          ? 'Issued docs ready to download'
          : 'Pending work and progress',
      'Notifications, live joins aur updates',
      'Profile, support aur account tools',
    ];

    return Scaffold(
      extendBody: true,
      drawer: _WorkspaceDrawer(
        user: user,
        session: session,
        onSelectHome: () => _closeDrawerAndRun(() => _jumpTo(0)),
        onSelectCourses: () => _closeDrawerAndRun(() => _jumpTo(1)),
        onSelectRoleWorkspace: () => _closeDrawerAndRun(() => _jumpTo(2)),
        onSelectAlerts: () => _closeDrawerAndRun(() => _jumpTo(3)),
        onSelectProfile: () => _closeDrawerAndRun(() => _jumpTo(4)),
        onOpenProjects: () => _closeDrawerAndRun(_openProjectsPage),
        onOpenInbox: () => _closeDrawerAndRun(_openChatInbox),
        onOpenServiceHub: () => _closeDrawerAndRun(_openServiceHub),
        onOpenAdminCenter: user.isAdmin
            ? () => _closeDrawerAndRun(() => _openAdminCenter(user))
            : null,
      ),
      appBar: AppBar(
        toolbarHeight: 86,
        titleSpacing: 18,
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Colors.black.withValues(alpha: 0.16),
                Colors.transparent,
              ],
            ),
          ),
        ),
        leadingWidth: 72,
        leading: Builder(
          builder: (context) => Padding(
            padding: const EdgeInsets.only(left: 14),
            child: IconButton(
              onPressed: () => Scaffold.of(context).openDrawer(),
              icon: const Icon(Icons.grid_view_rounded),
            ),
          ),
        ),
        title: Row(
          children: [
            const BrandLogo(
              size: 42,
              padding: 8,
              borderRadius: 16,
              backgroundColor: Color(0x145EEAD4),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    titles[_currentIndex],
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitles[_currentIndex],
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Colors.white.withValues(alpha: 0.68),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: _openChatInbox,
            icon: const Icon(Icons.forum_outlined),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 18),
            child: Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.08),
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
              ),
              child: Center(
                child: Text(
                  user.initials.isEmpty ? 'S' : user.initials,
                  style: const TextStyle(
                    fontWeight: FontWeight.w900,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
      body: AppBackdrop(
        child: Column(
          children: [
            if (!session.isOnline)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
                child: GlassCard(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  backgroundColor: const Color(0xCC45210D),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.wifi_off_rounded,
                        color: SolutionHubTheme.secondary,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'Internet connection unavailable. Sync automatically resume ho jayega jab network wapas aayega.',
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            Expanded(
              child: IndexedStack(index: _currentIndex, children: pages),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openChatInbox,
        icon: const Icon(Icons.chat_rounded),
        label: const Text('Inbox'),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(16, 0, 16, 14),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: const Color(0xD2081824),
            borderRadius: BorderRadius.circular(28),
            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.22),
                blurRadius: 28,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: NavigationBar(
            selectedIndex: _currentIndex,
            onDestinationSelected: (index) {
              setState(() => _currentIndex = index);
            },
            destinations: [
              const NavigationDestination(
                icon: Icon(Icons.space_dashboard_outlined),
                selectedIcon: Icon(Icons.space_dashboard_rounded),
                label: 'Home',
              ),
              const NavigationDestination(
                icon: Icon(Icons.school_outlined),
                selectedIcon: Icon(Icons.school_rounded),
                label: 'Courses',
              ),
              NavigationDestination(
                icon: Icon(
                  user.isCustomer
                      ? Icons.workspace_premium_outlined
                      : Icons.task_outlined,
                ),
                selectedIcon: Icon(
                  user.isCustomer
                      ? Icons.workspace_premium_rounded
                      : Icons.task_rounded,
                ),
                label: user.isCustomer ? 'Docs' : 'Tasks',
              ),
              const NavigationDestination(
                icon: Icon(Icons.notifications_outlined),
                selectedIcon: Icon(Icons.notifications_active_rounded),
                label: 'Alerts',
              ),
              const NavigationDestination(
                icon: Icon(Icons.hub_outlined),
                selectedIcon: Icon(Icons.hub_rounded),
                label: 'Hub',
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _jumpTo(int index) {
    setState(() => _currentIndex = index);
  }

  void _closeDrawerAndRun(VoidCallback action) {
    Navigator.of(context).pop();
    action();
  }

  Future<void> _openChatInbox() async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ChatPage(user: context.read<SessionController>().currentUser!),
      ),
    );
  }

  Future<void> _openProjectsPage() async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) =>
            ProjectsPage(user: context.read<SessionController>().currentUser!),
      ),
    );
  }

  Future<void> _openServiceHub() async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) =>
            ServiceHubPage(user: context.read<SessionController>().currentUser!),
      ),
    );
  }

  Future<void> _openAdminCenter(AppUser user) async {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (routeContext) => AdminWorkspacePage(
          user: user,
          onOpenCourses: () {
            Navigator.of(routeContext).pop();
            _jumpTo(1);
          },
          onOpenAlerts: () {
            Navigator.of(routeContext).pop();
            _jumpTo(3);
          },
          onOpenProjects: () {
            Navigator.of(routeContext).pop();
            _openProjectsPage();
          },
          onOpenRoleWorkspace: () {
            Navigator.of(routeContext).pop();
            _jumpTo(2);
          },
          onOpenServiceHub: () {
            Navigator.of(routeContext).pop();
            _openServiceHub();
          },
        ),
      ),
    );
  }
}

class _WorkspaceDrawer extends StatelessWidget {
  const _WorkspaceDrawer({
    required this.user,
    required this.session,
    required this.onSelectHome,
    required this.onSelectCourses,
    required this.onSelectRoleWorkspace,
    required this.onSelectAlerts,
    required this.onSelectProfile,
    required this.onOpenProjects,
    required this.onOpenInbox,
    required this.onOpenServiceHub,
    this.onOpenAdminCenter,
  });

  final AppUser user;
  final SessionController session;
  final VoidCallback onSelectHome;
  final VoidCallback onSelectCourses;
  final VoidCallback onSelectRoleWorkspace;
  final VoidCallback onSelectAlerts;
  final VoidCallback onSelectProfile;
  final VoidCallback onOpenProjects;
  final VoidCallback onOpenInbox;
  final VoidCallback onOpenServiceHub;
  final VoidCallback? onOpenAdminCenter;

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: Colors.transparent,
      child: AppBackdrop(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(18, 10, 18, 20),
            children: [
              GlassCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const BrandLogo(
                          size: 48,
                          padding: 9,
                          borderRadius: 18,
                          backgroundColor: Color(0x145EEAD4),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                user.displayName,
                                style: Theme.of(context).textTheme.titleLarge
                                    ?.copyWith(fontWeight: FontWeight.w800),
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
                      ],
                    ),
                    const SizedBox(height: 16),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        TagChip(
                          label: user.role.toUpperCase(),
                          color: user.isAdmin
                              ? SolutionHubTheme.secondary
                              : user.isCustomer
                              ? SolutionHubTheme.success
                              : SolutionHubTheme.tertiary,
                        ),
                        TagChip(
                          label: session.isOnline ? 'Online sync' : 'Offline',
                          color: session.isOnline
                              ? SolutionHubTheme.success
                              : SolutionHubTheme.secondary,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              _DrawerTile(
                icon: Icons.space_dashboard_rounded,
                label: 'Dashboard',
                onTap: onSelectHome,
              ),
              _DrawerTile(
                icon: Icons.school_rounded,
                label: 'Courses',
                onTap: onSelectCourses,
              ),
              _DrawerTile(
                icon: user.isCustomer
                    ? Icons.workspace_premium_rounded
                    : Icons.task_rounded,
                label: user.isCustomer ? 'Certificates' : 'Tasks',
                onTap: onSelectRoleWorkspace,
              ),
              _DrawerTile(
                icon: Icons.folder_special_rounded,
                label: 'Projects',
                onTap: onOpenProjects,
              ),
              _DrawerTile(
                icon: Icons.forum_rounded,
                label: 'Inbox',
                onTap: onOpenInbox,
              ),
              _DrawerTile(
                icon: Icons.notifications_active_rounded,
                label: 'Alerts',
                onTap: onSelectAlerts,
              ),
              _DrawerTile(
                icon: Icons.hub_rounded,
                label: 'Service Hub',
                onTap: onOpenServiceHub,
              ),
              if (onOpenAdminCenter != null)
                _DrawerTile(
                  icon: Icons.admin_panel_settings_rounded,
                  label: 'Admin Workspace',
                  onTap: onOpenAdminCenter!,
                ),
              _DrawerTile(
                icon: Icons.person_rounded,
                label: 'Profile',
                onTap: onSelectProfile,
              ),
              const SizedBox(height: 18),
              OutlinedButton.icon(
                onPressed: () async {
                  Navigator.of(context).pop();
                  await session.logout();
                },
                icon: const Icon(Icons.logout_rounded),
                label: const Text('Sign out'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DrawerTile extends StatelessWidget {
  const _DrawerTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon),
        title: Text(
          label,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
          ),
        ),
        trailing: const Icon(Icons.chevron_right_rounded),
      ),
    );
  }
}
