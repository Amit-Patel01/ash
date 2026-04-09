import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../models/app_models.dart';
import '../services/solutionhub_repository.dart';
import '../theme/app_theme.dart';
import '../widgets/modern_ui.dart';

class CoursesPage extends StatefulWidget {
  const CoursesPage({super.key, required this.user});

  final AppUser user;

  @override
  State<CoursesPage> createState() => _CoursesPageState();
}

class _CoursesPageState extends State<CoursesPage> {
  late final Stream<List<CourseItem>> _coursesStream;

  @override
  void initState() {
    super.initState();
    _coursesStream = context.read<SolutionHubRepository>().watchCoursesForUser(
      widget.user,
    );
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<CourseItem>>(
      stream: _coursesStream,
      initialData: const [],
      builder: (context, snapshot) {
        final courses = snapshot.data ?? const [];
        final liveCount = courses.where((course) => course.meetingReady).length;
        final totalPlans = courses.fold<int>(
          0,
          (value, item) => value + item.plansCount,
        );
        final totalMaterials = courses.fold<int>(
          0,
          (value, item) => value + item.materialsCount,
        );

        return ListView(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 118),
          children: [
            SectionIntro(
              eyebrow: 'COURSES',
              title: widget.user.isCustomer
                  ? 'Your learning dashboard'
                  : widget.user.isAdmin
                  ? 'Modern course command center'
                  : 'Delivery-ready course board',
              subtitle: widget.user.isCustomer
                  ? 'Enrolled courses, live meetings aur ready materials ko ek clean feed me explore kijiye.'
                  : 'Plans, materials aur live sessions ko fast mobile cards me monitor kijiye.',
            ),
            const SizedBox(height: 18),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                MetricPill(
                  label: 'Courses',
                  value: '${courses.length}',
                  icon: Icons.school_outlined,
                  color: SolutionHubTheme.primary,
                ),
                MetricPill(
                  label: 'Live',
                  value: '$liveCount',
                  icon: Icons.videocam_rounded,
                  color: SolutionHubTheme.success,
                ),
                MetricPill(
                  label: 'Plans',
                  value: '$totalPlans',
                  icon: Icons.layers_outlined,
                  color: SolutionHubTheme.secondary,
                ),
                MetricPill(
                  label: 'Materials',
                  value: '$totalMaterials',
                  icon: Icons.folder_open_outlined,
                  color: SolutionHubTheme.tertiary,
                ),
              ],
            ),
            const SizedBox(height: 18),
            if (courses.isEmpty)
              EmptyStateCard(
                icon: widget.user.isCustomer
                    ? Icons.school_outlined
                    : Icons.library_books_outlined,
                title: widget.user.isCustomer
                    ? 'No active courses found'
                    : 'No course assignments yet',
                message: widget.user.isCustomer
                    ? 'Jab aapke enrollments sync honge, yahin par live course cards aur materials show honge.'
                    : 'Role ke hisaab se naye courses aate hi ye board automatically update ho jayega.',
              )
            else
              ...courses.map(
                (course) => _CourseCard(
                  user: widget.user,
                  course: course,
                  onOpenExternal: _openExternal,
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
}

class _CourseCard extends StatelessWidget {
  const _CourseCard({
    required this.user,
    required this.course,
    required this.onOpenExternal,
  });

  final AppUser user;
  final CourseItem course;
  final ValueChanged<String> onOpenExternal;

  @override
  Widget build(BuildContext context) {
    final meetingLink = _resolveMeetingLink(course);
    final materialUrl = _resolveMaterialUrl(course);

    return GlassCard(
      margin: const EdgeInsets.only(bottom: 14),
      gradient: course.highlighted
          ? const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF11283A), Color(0xFF102537), Color(0xFF0D2331)],
            )
          : null,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AccentIconBubble(
                icon: course.meetingReady
                    ? Icons.videocam_rounded
                    : Icons.menu_book_outlined,
                color: course.meetingReady
                    ? SolutionHubTheme.success
                    : SolutionHubTheme.primary,
                size: 48,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      course.title,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        TagChip(
                          label: course.kind,
                          color: SolutionHubTheme.tertiary,
                        ),
                        TagChip(
                          label: course.category,
                          color: SolutionHubTheme.secondary,
                        ),
                        if (course.meetingReady)
                          const TagChip(
                            label: 'Live ready',
                            color: SolutionHubTheme.success,
                            icon: Icons.live_tv_rounded,
                          ),
                        if (course.highlighted)
                          const TagChip(
                            label: 'Featured',
                            color: SolutionHubTheme.primary,
                            icon: Icons.auto_awesome_rounded,
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          if (course.description.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              course.description,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
          const SizedBox(height: 18),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              _InfoTile(label: 'Students', value: '${course.studentCount}'),
              _InfoTile(label: 'Materials', value: '${course.materialsCount}'),
              _InfoTile(
                label: 'Price',
                value: course.price > 0
                    ? NumberFormat.compactCurrency(
                        symbol: '₹',
                        decimalDigits: 0,
                      ).format(course.price)
                    : 'FREE',
              ),
              _InfoTile(
                label: 'Updated',
                value: course.createdAt == null
                    ? 'Now'
                    : DateFormat('dd MMM').format(course.createdAt!),
              ),
            ],
          ),
          if (course.plans.isNotEmpty) ...[
            const SizedBox(height: 18),
            Text(
              user.isCustomer ? 'Available plan view' : 'Course plan layout',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: course.plans
                  .take(3)
                  .map(
                    (plan) => TagChip(
                      label: _planLabel(plan),
                      color: plan.meetingReady
                          ? SolutionHubTheme.success
                          : SolutionHubTheme.primary,
                      icon: plan.meetingReady
                          ? Icons.videocam_rounded
                          : Icons.layers_outlined,
                    ),
                  )
                  .toList(),
            ),
          ],
          if (meetingLink.isNotEmpty || materialUrl.isNotEmpty) ...[
            const SizedBox(height: 18),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                if (meetingLink.isNotEmpty)
                  FilledButton.icon(
                    onPressed: () => onOpenExternal(meetingLink),
                    icon: const Icon(Icons.video_call_rounded),
                    label: Text(
                      user.isCustomer ? 'Join live meeting' : 'Open meeting',
                    ),
                  ),
                if (materialUrl.isNotEmpty)
                  OutlinedButton.icon(
                    onPressed: () => onOpenExternal(materialUrl),
                    icon: const Icon(Icons.open_in_new_rounded),
                    label: const Text('Open material'),
                  ),
              ],
            ),
          ] else ...[
            const SizedBox(height: 18),
            Text(
              user.isCustomer
                  ? 'Meeting link ya material available hote hi yahin se launch ho jayega.'
                  : 'Meeting links aur materials dashboard se sync hote hi ye card instantly ready ho jayega.',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ],
      ),
    );
  }

  String _resolveMeetingLink(CourseItem item) {
    if (item.meetingLink.isNotEmpty) return item.meetingLink;
    for (final plan in item.plans) {
      if (plan.meetingLink.isNotEmpty) {
        return plan.meetingLink;
      }
    }
    return '';
  }

  String _resolveMaterialUrl(CourseItem item) {
    for (final material in item.materials) {
      if (material.url.isNotEmpty) return material.url;
    }
    return '';
  }

  String _planLabel(CoursePlanItem plan) {
    final priceLabel = plan.isFree
        ? 'Free'
        : NumberFormat.compactCurrency(
            symbol: '₹',
            decimalDigits: 0,
          ).format(plan.price);
    if (plan.duration.isEmpty) {
      return '${plan.label} • $priceLabel';
    }
    return '${plan.label} • ${plan.duration} • $priceLabel';
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 132,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }
}
