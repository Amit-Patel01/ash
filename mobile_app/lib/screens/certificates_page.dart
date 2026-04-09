import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../config/app_config.dart';
import '../models/app_models.dart';
import '../services/solutionhub_repository.dart';
import '../theme/app_theme.dart';
import '../widgets/modern_ui.dart';

class CertificatesPage extends StatefulWidget {
  const CertificatesPage({super.key, required this.user});

  final AppUser user;

  @override
  State<CertificatesPage> createState() => _CertificatesPageState();
}

class _CertificatesPageState extends State<CertificatesPage> {
  late final Stream<List<CertificateItem>> _stream;

  @override
  void initState() {
    super.initState();
    _stream = context.read<SolutionHubRepository>().watchCertificatesForUser(
      widget.user,
    );
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<CertificateItem>>(
      stream: _stream,
      initialData: const [],
      builder: (context, snapshot) {
        final certificates = snapshot.data ?? const [];
        final readyCount = certificates
            .where(
              (item) =>
                  item.downloadUrl.isNotEmpty || item.previewUrl.isNotEmpty,
            )
            .length;

        return ListView(
          padding: const EdgeInsets.fromLTRB(20, 14, 20, 118),
          children: [
            SectionIntro(
              eyebrow: 'DOCUMENTS',
              title: 'Certificates & letters',
              subtitle:
                  'Issued documents ko polished download cards ke through access, preview aur share-ready ID ke saath manage kijiye.',
              trailing: TagChip(
                label: '${certificates.length} issued',
                color: SolutionHubTheme.primary,
              ),
            ),
            const SizedBox(height: 18),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                MetricPill(
                  label: 'Issued',
                  value: '${certificates.length}',
                  icon: Icons.workspace_premium_outlined,
                  color: SolutionHubTheme.secondary,
                ),
                MetricPill(
                  label: 'Ready',
                  value: '$readyCount',
                  icon: Icons.download_rounded,
                  color: SolutionHubTheme.success,
                ),
              ],
            ),
            const SizedBox(height: 18),
            if (certificates.isEmpty)
              const EmptyStateCard(
                icon: Icons.workspace_premium_outlined,
                title: 'No approved documents yet',
                message:
                    'Jab certificate ya official letter issue hoga, woh yahin par ready-to-open card ke form me dikhega.',
              )
            else
              ...certificates.map(
                (item) => GlassCard(
                  margin: const EdgeInsets.only(bottom: 14),
                  gradient: const LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [Color(0xFF122236), Color(0xFF101F30)],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const AccentIconBubble(
                            icon: Icons.verified_rounded,
                            color: SolutionHubTheme.secondary,
                            size: 48,
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  item.courseName.isEmpty
                                      ? 'Issued Document'
                                      : item.courseName,
                                  style: Theme.of(context).textTheme.titleLarge
                                      ?.copyWith(fontWeight: FontWeight.w800),
                                ),
                                const SizedBox(height: 8),
                                Wrap(
                                  spacing: 8,
                                  runSpacing: 8,
                                  children: [
                                    TagChip(
                                      label: item.documentLabel,
                                      color: SolutionHubTheme.tertiary,
                                    ),
                                    TagChip(
                                      label: item.status.toUpperCase(),
                                      color:
                                          item.status.toLowerCase() ==
                                              'approved'
                                          ? SolutionHubTheme.success
                                          : SolutionHubTheme.secondary,
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Document ID',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        item.certificateId.isEmpty
                            ? item.id
                            : item.certificateId,
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.w800),
                      ),
                      if (item.createdAt != null) ...[
                        const SizedBox(height: 10),
                        Text(
                          'Issued on ${DateFormat('dd MMM yyyy').format(item.createdAt!)}',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                      const SizedBox(height: 18),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: [
                          FilledButton.icon(
                            onPressed: () => _download(item),
                            icon: const Icon(Icons.download_rounded),
                            label: const Text('Download'),
                          ),
                          if (item.previewUrl.isNotEmpty)
                            OutlinedButton.icon(
                              onPressed: () => _openUrl(item.previewUrl),
                              icon: const Icon(Icons.visibility_outlined),
                              label: const Text('Preview'),
                            ),
                          OutlinedButton.icon(
                            onPressed: () => _copyId(item),
                            icon: const Icon(Icons.copy_rounded),
                            label: const Text('Copy ID'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
          ],
        );
      },
    );
  }

  Future<void> _download(CertificateItem item) async {
    final targetUrl = item.downloadUrl.isNotEmpty
        ? item.downloadUrl
        : item.previewUrl.isNotEmpty
        ? item.previewUrl
        : '${AppConfig.certificateVerifyUrl}?id=${item.certificateId.isEmpty ? item.id : item.certificateId}';
    await _openUrl(targetUrl);
  }

  Future<void> _openUrl(String url) async {
    if (url.isEmpty) return;
    await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
  }

  Future<void> _copyId(CertificateItem item) async {
    final id = item.certificateId.isEmpty ? item.id : item.certificateId;
    await Clipboard.setData(ClipboardData(text: id));
    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Certificate ID copied.')));
  }
}
