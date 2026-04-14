import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../config/app_config.dart';
import '../models/app_models.dart';
import '../services/backend_api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/modern_ui.dart';
import 'chat_page.dart';
import 'projects_page.dart';

class ServiceHubPage extends StatefulWidget {
  const ServiceHubPage({super.key, required this.user});

  final AppUser user;

  @override
  State<ServiceHubPage> createState() => _ServiceHubPageState();
}

class _ServiceHubPageState extends State<ServiceHubPage> {
  bool _aiAvailable = false;
  bool _loadingAi = true;

  @override
  void initState() {
    super.initState();
    _checkAiAvailability();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Service Hub')),
      body: AppBackdrop(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 120),
          children: [
            SectionIntro(
              eyebrow: 'SERVICES',
              title: 'Mobile shortcuts for support, verification, and payments',
              subtitle:
                  'This hub connects the existing web platform, certificate tools, projects marketplace, and support actions into one mobile surface.',
              trailing: TagChip(
                label: _loadingAi
                    ? 'Checking AI'
                    : _aiAvailable
                    ? 'AI ready'
                    : 'AI offline',
                color: _loadingAi
                    ? Colors.white70
                    : _aiAvailable
                    ? SolutionHubTheme.success
                    : SolutionHubTheme.secondary,
              ),
            ),
            const SizedBox(height: 18),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                MetricPill(
                  label: 'Support',
                  value: '24/7',
                  icon: Icons.support_agent_rounded,
                  color: SolutionHubTheme.primary,
                ),
                MetricPill(
                  label: 'Payments',
                  value: 'Razorpay',
                  icon: Icons.payments_outlined,
                  color: SolutionHubTheme.secondary,
                ),
                MetricPill(
                  label: 'Certificates',
                  value: 'Verified',
                  icon: Icons.workspace_premium_outlined,
                  color: SolutionHubTheme.tertiary,
                ),
              ],
            ),
            const SizedBox(height: 22),
            const SectionIntro(
              eyebrow: 'FAST ACTIONS',
              title: 'What do you want to do?',
              subtitle:
                  'Jump to the right flow without hunting through the whole app.',
            ),
            const SizedBox(height: 16),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.12,
              children: [
                _HubActionCard(
                  icon: Icons.folder_open_rounded,
                  title: 'Browse Projects',
                  subtitle: 'Marketplace catalog and checkout links',
                  color: SolutionHubTheme.primary,
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => ProjectsPage(user: widget.user),
                    ),
                  ),
                ),
                _HubActionCard(
                  icon: Icons.chat_rounded,
                  title: 'Support Chat',
                  subtitle: 'Open mobile inbox and reach the team',
                  color: SolutionHubTheme.success,
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => ChatPage(user: widget.user),
                    ),
                  ),
                ),
                _HubActionCard(
                  icon: Icons.verified_rounded,
                  title: 'Verify Certificate',
                  subtitle: 'Open public verification page',
                  color: SolutionHubTheme.tertiary,
                  onTap: () => _openUrl(AppConfig.certificateVerifyUrl),
                ),
                _HubActionCard(
                  icon: Icons.design_services_rounded,
                  title: 'Custom Project',
                  subtitle: 'Send a fresh project requirement',
                  color: SolutionHubTheme.secondary,
                  onTap: () => _openUrl(AppConfig.customProjectUrl),
                ),
              ],
            ),
            const SizedBox(height: 24),
            GlassCard(
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF14253A), Color(0xFF0F3446)],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const TagChip(
                    label: 'Payment flow',
                    color: SolutionHubTheme.secondary,
                    icon: Icons.lock_outline_rounded,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'Secure checkout stays connected to the existing platform',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Project and course purchases continue through the connected Razorpay-backed web checkout. This mobile app sends users into the right flow quickly without losing the existing backend integration.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      FilledButton.tonalIcon(
                        onPressed: () => _openUrl(AppConfig.projectsUrl),
                        icon: const Icon(Icons.shopping_bag_outlined),
                        label: const Text('Open marketplace'),
                      ),
                      OutlinedButton.icon(
                        onPressed: () => _openUrl(AppConfig.websiteUrl),
                        icon: const Icon(Icons.language_rounded),
                        label: const Text('Open website'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            GlassCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const TagChip(
                    label: 'Support rails',
                    color: SolutionHubTheme.primary,
                    icon: Icons.contact_support_outlined,
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'Need direct help?',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Use email, phone, or in-app chat depending on what is fastest for you.',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      FilledButton.tonalIcon(
                        onPressed: () => _openUrl('mailto:${AppConfig.supportEmail}'),
                        icon: const Icon(Icons.email_outlined),
                        label: const Text('Email support'),
                      ),
                      FilledButton.tonalIcon(
                        onPressed: () => _openUrl('tel:${AppConfig.supportPhone}'),
                        icon: const Icon(Icons.call_outlined),
                        label: const Text('Call now'),
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

  Future<void> _checkAiAvailability() async {
    try {
      final available = await context.read<BackendApiService>().isAiAvailable();
      if (!mounted) return;
      setState(() {
        _aiAvailable = available;
        _loadingAi = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingAi = false);
    }
  }

  Future<void> _openUrl(String url) async {
    await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  }
}

class _HubActionCard extends StatelessWidget {
  const _HubActionCard({
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
