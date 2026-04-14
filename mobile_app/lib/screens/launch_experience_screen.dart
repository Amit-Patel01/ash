import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../theme/app_theme.dart';
import '../widgets/brand_logo.dart';
import '../widgets/modern_ui.dart';

class LaunchExperienceScreen extends StatefulWidget {
  const LaunchExperienceScreen({
    super.key,
    required this.onContinue,
  });

  final VoidCallback onContinue;

  @override
  State<LaunchExperienceScreen> createState() => _LaunchExperienceScreenState();
}

class _LaunchExperienceScreenState extends State<LaunchExperienceScreen> {
  late final PageController _controller;
  int _pageIndex = 0;

  static const _items = [
    _LaunchSlide(
      eyebrow: 'DISCOVER',
      title: 'One mobile app for customers, employees, and admins',
      description:
          'Courses, projects, certificates, alerts, and support tools stay connected in one polished Flutter workspace.',
      icon: Icons.dashboard_customize_rounded,
      bullets: [
        'Role-based dashboards',
        'Real-time activity sync',
        'Modern mobile-first UI',
      ],
    ),
    _LaunchSlide(
      eyebrow: 'COLLABORATE',
      title: 'Stay close to delivery, meetings, and support chat',
      description:
          'Jump into live sessions, reply faster, and keep project or learning communication flowing from anywhere.',
      icon: Icons.forum_rounded,
      bullets: [
        'Live alerts and notifications',
        'Support chat and inbox flow',
        'Tasks and meeting visibility',
      ],
    ),
    _LaunchSlide(
      eyebrow: 'SCALE',
      title: 'Run Amit Solution Hub with a real app experience',
      description:
          'Marketplace discovery, certificate access, admin visibility, and service actions are packaged for Android and iOS.',
      icon: Icons.rocket_launch_rounded,
      bullets: [
        'Project and service hub',
        'Certificate access',
        'Admin workspace shortcuts',
      ],
    ),
  ];

  @override
  void initState() {
    super.initState();
    _controller = PageController();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final item = _items[_pageIndex];

    return Scaffold(
      body: AppBackdrop(
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 18, 20, 20),
            child: Column(
              children: [
                Row(
                  children: [
                    const BrandLogo(
                      size: 48,
                      padding: 8,
                      borderRadius: 18,
                      backgroundColor: Color(0x145EEAD4),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            AppConfig.appName,
                            style: theme.textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          Text(
                            'Amit Solution Hub',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: Colors.white.withValues(alpha: 0.6),
                            ),
                          ),
                        ],
                      ),
                    ),
                    TextButton(
                      onPressed: widget.onContinue,
                      child: const Text('Skip'),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Expanded(
                  child: PageView.builder(
                    controller: _controller,
                    itemCount: _items.length,
                    onPageChanged: (index) => setState(() => _pageIndex = index),
                    itemBuilder: (context, index) {
                      final slide = _items[index];
                      return GlassCard(
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Color(0xFF0A2131),
                            Color(0xFF0D3042),
                            Color(0xFF12404A),
                          ],
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            AccentIconBubble(
                              icon: slide.icon,
                              color: SolutionHubTheme.primary,
                              size: 64,
                            ),
                            const SizedBox(height: 20),
                            Text(
                              slide.eyebrow,
                              style: theme.textTheme.labelLarge?.copyWith(
                                color: SolutionHubTheme.primary,
                                fontWeight: FontWeight.w800,
                                letterSpacing: 1.1,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              slide.title,
                              style: theme.textTheme.headlineMedium?.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              slide.description,
                              style: theme.textTheme.bodyLarge,
                            ),
                            const SizedBox(height: 24),
                            Wrap(
                              spacing: 10,
                              runSpacing: 10,
                              children: slide.bullets
                                  .map(
                                    (bullet) => TagChip(
                                      label: bullet,
                                      color: SolutionHubTheme.secondary,
                                      icon: Icons.check_circle_outline_rounded,
                                    ),
                                  )
                                  .toList(growable: false),
                            ),
                            const Spacer(),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(18),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.06),
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.08),
                                ),
                              ),
                              child: Text(
                                index == 0
                                    ? 'Start with the same ecosystem your web platform already uses.'
                                    : index == 1
                                    ? 'Use chat, alerts, and mobile actions to keep delivery moving.'
                                    : 'Continue to sign in and explore the role-based mobile workspace.',
                                style: theme.textTheme.bodyMedium,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: Wrap(
                        spacing: 8,
                        children: List.generate(
                          _items.length,
                          (index) => AnimatedContainer(
                            duration: const Duration(milliseconds: 220),
                            width: index == _pageIndex ? 30 : 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: index == _pageIndex
                                  ? SolutionHubTheme.primary
                                  : Colors.white.withValues(alpha: 0.24),
                              borderRadius: BorderRadius.circular(999),
                            ),
                          ),
                        ),
                      ),
                    ),
                    FilledButton.icon(
                      onPressed: () {
                        if (_pageIndex == _items.length - 1) {
                          widget.onContinue();
                          return;
                        }
                        _controller.nextPage(
                          duration: const Duration(milliseconds: 240),
                          curve: Curves.easeOut,
                        );
                      },
                      icon: Icon(
                        _pageIndex == _items.length - 1
                            ? Icons.login_rounded
                            : Icons.arrow_forward_rounded,
                      ),
                      label: Text(
                        _pageIndex == _items.length - 1
                            ? 'Continue'
                            : 'Next',
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  item.title,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: Colors.white.withValues(alpha: 0.56),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _LaunchSlide {
  const _LaunchSlide({
    required this.eyebrow,
    required this.title,
    required this.description,
    required this.icon,
    required this.bullets,
  });

  final String eyebrow;
  final String title;
  final String description;
  final IconData icon;
  final List<String> bullets;
}
