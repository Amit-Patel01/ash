import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../state/session_controller.dart';
import '../theme/app_theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/modern_ui.dart';
import 'certificates_page.dart';
import 'courses_page.dart';
import 'home_page.dart';
import 'notifications_page.dart';
import 'profile_page.dart';
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
}
