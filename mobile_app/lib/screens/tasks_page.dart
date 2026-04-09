import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../models/app_models.dart';
import '../services/solutionhub_repository.dart';

class TasksPage extends StatefulWidget {
  const TasksPage({super.key, required this.user});

  final AppUser user;

  @override
  State<TasksPage> createState() => _TasksPageState();
}

class _TasksPageState extends State<TasksPage> {
  late final SolutionHubRepository _repository;
  late final Stream<List<TaskItem>> _tasksStream;
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _repository = context.read<SolutionHubRepository>();
    _tasksStream = _repository.watchTasksForUser(widget.user);
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<TaskItem>>(
      stream: _tasksStream,
      initialData: const [],
      builder: (context, snapshot) {
        final tasks = snapshot.data ?? const [];
        final visibleTasks = tasks.where((task) {
          if (_filter == 'all') return true;
          return _statusKey(task.status) == _filter;
        }).toList();

        final pending = tasks.where((task) => _statusKey(task.status) == 'todo').length;
        final progress = tasks.where((task) => _statusKey(task.status) == 'progress').length;
        final done = tasks.where((task) => _statusKey(task.status) == 'done').length;

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(
              widget.user.isAdmin ? 'Task command center' : 'Your task board',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Task status mobile se update karo aur assigned work ko quickly monitor karo.',
              style: TextStyle(color: Colors.white70, height: 1.5),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _TaskStatCard(label: 'To Do', value: '$pending')),
                const SizedBox(width: 10),
                Expanded(child: _TaskStatCard(label: 'Progress', value: '$progress')),
                const SizedBox(width: 10),
                Expanded(child: _TaskStatCard(label: 'Done', value: '$done')),
              ],
            ),
            const SizedBox(height: 16),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _FilterChip(
                    label: 'All',
                    selected: _filter == 'all',
                    onTap: () => setState(() => _filter = 'all'),
                  ),
                  _FilterChip(
                    label: 'To Do',
                    selected: _filter == 'todo',
                    onTap: () => setState(() => _filter = 'todo'),
                  ),
                  _FilterChip(
                    label: 'Progress',
                    selected: _filter == 'progress',
                    onTap: () => setState(() => _filter = 'progress'),
                  ),
                  _FilterChip(
                    label: 'Done',
                    selected: _filter == 'done',
                    onTap: () => setState(() => _filter = 'done'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            if (visibleTasks.isEmpty)
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text(
                    _filter == 'all'
                        ? 'Abhi aapke liye koi task visible nahi hai.'
                        : 'Is filter me koi task nahi mila.',
                    style: const TextStyle(color: Colors.white70, height: 1.5),
                  ),
                ),
              )
            else
              ...visibleTasks.map(
                (task) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _TaskBadge(label: _labelForStatus(task.status)),
                            if (task.project.isNotEmpty)
                              _TaskBadge(label: task.project),
                            if (task.dueDate != null)
                              _TaskBadge(
                                label: 'Due ${DateFormat('dd MMM').format(task.dueDate!)}',
                              ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          task.title,
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.w800,
                              ),
                        ),
                        if (task.description.isNotEmpty) ...[
                          const SizedBox(height: 8),
                          Text(
                            task.description,
                            style: const TextStyle(
                              color: Colors.white70,
                              height: 1.5,
                            ),
                          ),
                        ],
                        const SizedBox(height: 14),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: [
                            FilledButton.tonal(
                              onPressed: _statusKey(task.status) == 'todo'
                                  ? null
                                  : () => _updateTask(task.id, 'todo'),
                              child: const Text('Plan'),
                            ),
                            FilledButton.tonal(
                              onPressed: _statusKey(task.status) == 'progress'
                                  ? null
                                  : () => _updateTask(task.id, 'in-progress'),
                              child: const Text('Start'),
                            ),
                            FilledButton(
                              onPressed: _statusKey(task.status) == 'done'
                                  ? null
                                  : () => _updateTask(task.id, 'done'),
                              child: const Text('Done'),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  Future<void> _updateTask(String id, String status) async {
    await _repository.updateTaskStatus(id: id, status: status);
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Task updated to ${_labelForStatus(status)}.')),
    );
  }

  String _statusKey(String status) {
    final normalized = normalizeText(status);
    if (['done', 'completed', 'complete', 'closed'].contains(normalized)) {
      return 'done';
    }
    if (['in-progress', 'in progress', 'progress', 'working'].contains(normalized)) {
      return 'progress';
    }
    return 'todo';
  }

  String _labelForStatus(String status) {
    switch (_statusKey(status)) {
      case 'done':
        return 'Done';
      case 'progress':
        return 'In Progress';
      default:
        return 'To Do';
    }
  }
}

class _TaskStatCard extends StatelessWidget {
  const _TaskStatCard({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(color: Colors.white60)),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.w900,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
      ),
    );
  }
}

class _TaskBadge extends StatelessWidget {
  const _TaskBadge({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}
