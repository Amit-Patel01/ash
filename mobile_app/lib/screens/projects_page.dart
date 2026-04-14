import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../config/app_config.dart';
import '../models/app_models.dart';
import '../services/solutionhub_repository.dart';
import '../theme/app_theme.dart';
import '../widgets/modern_ui.dart';

class ProjectsPage extends StatefulWidget {
  const ProjectsPage({super.key, required this.user});

  final AppUser user;

  @override
  State<ProjectsPage> createState() => _ProjectsPageState();
}

class _ProjectsPageState extends State<ProjectsPage> {
  late final Stream<List<ProjectItem>> _projectsStream;
  late final Stream<List<TaskItem>> _tasksStream;

  @override
  void initState() {
    super.initState();
    final repository = context.read<SolutionHubRepository>();
    _projectsStream = repository.watchProjects();
    _tasksStream = repository.watchTasksForUser(widget.user);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Projects')),
      body: AppBackdrop(
        child: StreamBuilder<List<ProjectItem>>(
          stream: _projectsStream,
          initialData: const [],
          builder: (context, projectSnapshot) {
            final projects = projectSnapshot.data ?? const [];
            final activeProjects = projects.where((item) => item.active).toList();
            final visibleProjects = widget.user.isAdmin ? projects : activeProjects;
            final myProjects = projects
                .where((item) => item.matchesSeller(widget.user))
                .toList();
            final featuredCount =
                visibleProjects.where((item) => item.isFeatured).length;

            return StreamBuilder<List<TaskItem>>(
              stream: _tasksStream,
              initialData: const [],
              builder: (context, taskSnapshot) {
                final tasks = taskSnapshot.data ?? const [];
                final taskBoards = _buildTaskBoards(tasks);

                return ListView(
                  padding: const EdgeInsets.fromLTRB(20, 14, 20, 120),
                  children: [
                    SectionIntro(
                      eyebrow: 'PROJECTS',
                      title: widget.user.isAdmin
                          ? 'Marketplace and delivery command view'
                          : widget.user.isEmployee
                          ? 'Projects, listings, and delivery boards'
                          : 'Explore ready-to-use projects',
                      subtitle: widget.user.isAdmin
                          ? 'Monitor live listings, seller-side activity, and project delivery context from one mobile screen.'
                          : widget.user.isEmployee
                          ? 'Keep an eye on task-linked project work while also browsing marketplace-ready listings.'
                          : 'Browse digital products, source-code bundles, and curated listings connected to the existing platform.',
                    ),
                    const SizedBox(height: 18),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      children: [
                        MetricPill(
                          label: 'Visible',
                          value: '${visibleProjects.length}',
                          icon: Icons.folder_copy_outlined,
                          color: SolutionHubTheme.primary,
                        ),
                        MetricPill(
                          label: 'Featured',
                          value: '$featuredCount',
                          icon: Icons.auto_awesome_rounded,
                          color: SolutionHubTheme.secondary,
                        ),
                        MetricPill(
                          label: 'Your Listings',
                          value: '${myProjects.length}',
                          icon: Icons.sell_outlined,
                          color: SolutionHubTheme.tertiary,
                        ),
                        MetricPill(
                          label: 'Task Boards',
                          value: '${taskBoards.length}',
                          icon: Icons.developer_board_outlined,
                          color: SolutionHubTheme.success,
                        ),
                      ],
                    ),
                    if (widget.user.isEmployee && taskBoards.isNotEmpty) ...[
                      const SizedBox(height: 24),
                      const SectionIntro(
                        eyebrow: 'DELIVERY',
                        title: 'Project boards from assigned tasks',
                        subtitle:
                            'Employee delivery progress is grouped here from the task stream so you can spot active workload instantly.',
                      ),
                      const SizedBox(height: 16),
                      ...taskBoards.map((board) => _TaskBoardCard(board: board)),
                    ],
                    if (myProjects.isNotEmpty && !widget.user.isCustomer) ...[
                      const SizedBox(height: 24),
                      SectionIntro(
                        eyebrow: 'SELLER VIEW',
                        title: widget.user.isAdmin
                            ? 'Team marketplace highlights'
                            : 'Your listed projects',
                        subtitle: widget.user.isAdmin
                            ? 'Projects attached to the current identity stream appear here first for faster review.'
                            : 'Listings connected to your email are surfaced separately so you can watch sales and pricing quickly.',
                      ),
                      const SizedBox(height: 16),
                      ...myProjects.take(4).map(
                            (project) => _ProjectCard(
                              user: widget.user,
                              project: project,
                              onOpenUrl: _openUrl,
                              showSellerTone: true,
                            ),
                          ),
                    ],
                    const SizedBox(height: 24),
                    const SectionIntro(
                      eyebrow: 'MARKETPLACE',
                      title: 'Available project catalog',
                      subtitle:
                          'Open details, purchase from the connected web checkout, or use the source-code offer when available.',
                    ),
                    const SizedBox(height: 16),
                    if (visibleProjects.isEmpty)
                      const EmptyStateCard(
                        icon: Icons.folder_open_outlined,
                        title: 'No projects available right now',
                        message:
                            'As soon as marketplace listings sync into Firestore, they will appear here automatically.',
                      )
                    else
                      ...visibleProjects.map(
                        (project) => _ProjectCard(
                          user: widget.user,
                          project: project,
                          onOpenUrl: _openUrl,
                        ),
                      ),
                  ],
                );
              },
            );
          },
        ),
      ),
    );
  }

  List<_TaskBoardItem> _buildTaskBoards(List<TaskItem> tasks) {
    final grouped = <String, List<TaskItem>>{};
    for (final task in tasks) {
      final key = task.project.trim();
      if (key.isEmpty) continue;
      grouped.putIfAbsent(key, () => []).add(task);
    }

    return grouped.entries.map((entry) {
      final total = entry.value.length;
      final done = entry.value.where((task) => task.isDone).length;
      final inProgress = entry.value
          .where((task) => _taskStatus(task.status) == 'progress')
          .length;
      final progress = total == 0 ? 0 : ((done / total) * 100).round();

      return _TaskBoardItem(
        title: entry.key,
        totalTasks: total,
        completedTasks: done,
        inProgressTasks: inProgress,
        progress: progress,
      );
    }).toList()
      ..sort((left, right) => right.totalTasks.compareTo(left.totalTasks));
  }

  String _taskStatus(String status) {
    final normalized = normalizeText(status);
    if (const ['done', 'completed', 'complete', 'closed'].contains(normalized)) {
      return 'done';
    }
    if (const ['in-progress', 'in progress', 'progress', 'working']
        .contains(normalized)) {
      return 'progress';
    }
    return 'todo';
  }

  Future<void> _openUrl(String url) async {
    if (url.isEmpty) return;
    await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  }
}

class _ProjectCard extends StatelessWidget {
  const _ProjectCard({
    required this.user,
    required this.project,
    required this.onOpenUrl,
    this.showSellerTone = false,
  });

  final AppUser user;
  final ProjectItem project;
  final ValueChanged<String> onOpenUrl;
  final bool showSellerTone;

  @override
  Widget build(BuildContext context) {
    final detailUrl = project.slug.isNotEmpty
        ? '${AppConfig.projectsUrl}/${project.slug}'
        : AppConfig.projectsUrl;
    final checkoutUrl = project.slug.isNotEmpty
        ? '${AppConfig.websiteUrl}/checkout/${project.slug}?type=project_only'
        : detailUrl;
    final sourceUrl = project.slug.isNotEmpty
        ? '${AppConfig.websiteUrl}/checkout/${project.slug}?type=project_with_source'
        : detailUrl;
    final theme = Theme.of(context);

    return GlassCard(
      margin: const EdgeInsets.only(bottom: 14),
      gradient: showSellerTone
          ? const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF142239), Color(0xFF123445)],
            )
          : project.isFeatured
          ? const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF14253A), Color(0xFF103042)],
            )
          : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (project.imageUrl.isNotEmpty)
            ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: Image.network(
                  project.imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) =>
                      _ProjectHeroFallback(project: project),
                ),
              ),
            )
          else
            _ProjectHeroFallback(project: project),
          const SizedBox(height: 18),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AccentIconBubble(
                icon: Icons.folder_special_outlined,
                color: project.isFeatured
                    ? SolutionHubTheme.secondary
                    : SolutionHubTheme.primary,
                size: 48,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      project.title,
                      style: theme.textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        TagChip(
                          label: project.categoryName,
                          color: SolutionHubTheme.tertiary,
                        ),
                        if (project.isFeatured)
                          const TagChip(
                            label: 'Featured',
                            color: SolutionHubTheme.secondary,
                            icon: Icons.auto_awesome_rounded,
                          ),
                        TagChip(
                          label: project.active ? 'Live' : 'Draft',
                          color: project.active
                              ? SolutionHubTheme.success
                              : Colors.white70,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (project.description.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(project.description, style: theme.textTheme.bodyMedium),
          ],
          const SizedBox(height: 18),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _InfoTile(
                label: 'Project',
                value: NumberFormat.compactCurrency(
                  symbol: '₹',
                  decimalDigits: 0,
                ).format(project.projectOnlyPrice),
              ),
              _InfoTile(
                label: 'With Source',
                value: NumberFormat.compactCurrency(
                  symbol: '₹',
                  decimalDigits: 0,
                ).format(project.projectWithSourcePrice),
              ),
              _InfoTile(label: 'Sales', value: '${project.sales}'),
              _InfoTile(
                label: 'Updated',
                value: project.createdAt == null
                    ? 'Now'
                    : DateFormat('dd MMM').format(project.createdAt!),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              FilledButton.tonalIcon(
                onPressed: () => onOpenUrl(detailUrl),
                icon: const Icon(Icons.open_in_new_rounded),
                label: const Text('Open details'),
              ),
              if (project.active)
                FilledButton.icon(
                  onPressed: () => onOpenUrl(checkoutUrl),
                  icon: const Icon(Icons.shopping_bag_outlined),
                  label: Text(user.isAdmin ? 'Open checkout' : 'Buy project'),
                ),
              if (project.active &&
                  project.projectWithSourcePrice > project.projectOnlyPrice)
                OutlinedButton.icon(
                  onPressed: () => onOpenUrl(sourceUrl),
                  icon: const Icon(Icons.code_rounded),
                  label: const Text('Get source'),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ProjectHeroFallback extends StatelessWidget {
  const _ProjectHeroFallback({required this.project});

  final ProjectItem project;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 170,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            project.isFeatured
                ? const Color(0xFF2C1E4F)
                : const Color(0xFF123043),
            project.active ? const Color(0xFF0D4B55) : const Color(0xFF2C3748),
          ],
        ),
      ),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AccentIconBubble(
              icon: Icons.folder_special_outlined,
              color: SolutionHubTheme.primary,
              size: 58,
            ),
            const SizedBox(height: 12),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                project.title,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TaskBoardCard extends StatelessWidget {
  const _TaskBoardCard({required this.board});

  final _TaskBoardItem board;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      margin: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const AccentIconBubble(
                icon: Icons.developer_board_outlined,
                color: SolutionHubTheme.success,
                size: 46,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  board.title,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              TagChip(
                label: '${board.progress}%',
                color: SolutionHubTheme.primary,
              ),
            ],
          ),
          const SizedBox(height: 14),
          ClipRRect(
            borderRadius: BorderRadius.circular(999),
            child: LinearProgressIndicator(
              minHeight: 10,
              value: board.progress / 100,
              backgroundColor: Colors.white.withValues(alpha: 0.08),
            ),
          ),
          const SizedBox(height: 14),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              TagChip(
                label: '${board.totalTasks} tasks',
                color: SolutionHubTheme.tertiary,
              ),
              TagChip(
                label: '${board.completedTasks} done',
                color: SolutionHubTheme.success,
              ),
              TagChip(
                label: '${board.inProgressTasks} in progress',
                color: SolutionHubTheme.secondary,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TaskBoardItem {
  const _TaskBoardItem({
    required this.title,
    required this.totalTasks,
    required this.completedTasks,
    required this.inProgressTasks,
    required this.progress,
  });

  final String title;
  final int totalTasks;
  final int completedTasks;
  final int inProgressTasks;
  final int progress;
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.white.withValues(alpha: 0.58),
            ),
          ),
          const SizedBox(height: 4),
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
