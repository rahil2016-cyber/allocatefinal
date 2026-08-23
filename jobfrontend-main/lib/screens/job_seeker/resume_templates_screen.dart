import 'package:flutter/material.dart';

import '../../services/app_session.dart';
import '../../services/resume_plan_service.dart';
import '../../utils/app_colors.dart';
import '../../services/resume_demo_profiles_cache.dart';
import '../../services/resume_html_thumbnail_cache.dart';
import '../../widgets/seeker_html_template_swatch.dart';
import '../../widgets/resume_template_mini_preview.dart';
import 'packages_screen.dart';
import 'my_resumes_screen.dart';
import 'resume_dashboard_template_card.dart';
import 'resume_html_preview_screen.dart';
import 'resume_preview_navigation.dart';
import 'resume_selection_screen.dart';
import 'seeker_resume_studio_screen.dart';

/// Choose among server-rendered HTML résumé templates (12 layouts).
class ResumeTemplatesScreen extends StatelessWidget {
  const ResumeTemplatesScreen({
    super.key,
    this.userId = 'demo-user',
    this.token = 'demo-token',
    this.seekerProfile,
  });

  final String userId;
  final String token;
  final Map<String, dynamic>? seekerProfile;

  void _openStudio(BuildContext context, String htmlKey) {
    Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => SeekerResumeStudioScreen(
          templateIdForSave: seekerStudioTemplateIdForHtmlKey(htmlKey),
        ),
      ),
    );
  }

  void _openPreview(BuildContext context, String htmlKey) {
    if (!ResumePlanService.instance.isTemplateUnlocked(htmlKey)) {
      Navigator.of(context).push<void>(
        MaterialPageRoute<void>(
          builder: (_) => ResumeHtmlPreviewScreen(
            templateKey: htmlKey,
            demoVariant: 0,
          ),
        ),
      );
      return;
    }
    openResumeHtmlPreviewWithUserData(context, templateKey: htmlKey);
  }

  void _openLockedAction(BuildContext context) {
    final plan = ResumePlanService.instance;
    if (plan.hasActivePlan && !plan.isSelectionComplete) {
      Navigator.of(context).push<void>(
        MaterialPageRoute<void>(
          builder: (_) => ResumeSelectionScreen(
            initialPackageKey: plan.activePackageKey,
          ),
        ),
      );
      return;
    }
    _openUpgradePlan(context);
  }

  void _openMyResumes(BuildContext context) {
    Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => MyResumesScreen(
          userId: AppSession.userId ?? userId,
          token: AppSession.token ?? token,
        ),
      ),
    );
  }

  void _openUpgradePlan(BuildContext context) {
    Navigator.of(context).push<void>(
      MaterialPageRoute<void>(
        builder: (_) => const JobSeekerPackagesScreen(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    ResumeDemoProfilesCache.instance.ensureLoaded();
    for (var v = 0; v < 4; v++) {
      ResumeHtmlThumbnailCache.instance.preloadVariant(v);
    }
    final tt = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Resume templates'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          TextButton(
            onPressed: () => _openMyResumes(context),
            child: const Text(
              'My resumes',
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
      body: ListenableBuilder(
        listenable: ResumePlanService.instance,
        builder: (context, _) {
          final allTemplates = kSeekerResumeHtmlTemplates;
          final plan = ResumePlanService.instance;
          final allowedCount = plan.allowedTemplateCount;
          final unlockedCount = plan.selectedTemplateIds.length;
          final planKey = plan.activePackageKey;
          final planLabel = planKey == null
              ? 'NO PLAN'
              : planKey.replaceAll('_', ' ').toUpperCase();

          return CustomScrollView(
            physics: const BouncingScrollPhysics(
              parent: AlwaysScrollableScrollPhysics(),
            ),
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                plan.hasActivePlan
                                    ? '$unlockedCount / $allowedCount unlocked'
                                    : '0 / ${allTemplates.length} unlocked',
                                style: tt.titleMedium?.copyWith(fontWeight: FontWeight.w800),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                planLabel,
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primary,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          !plan.hasActivePlan
                              ? 'Buy a plan to unlock resumes: Basic 4 · Premium 8 · Professional 13.'
                              : !plan.isSelectionComplete
                                  ? 'Select your $allowedCount resume templates to unlock editing & downloads.'
                                  : 'Selected templates include free PDF download. Upgrade to unlock more.',
                          style: tt.bodyMedium?.copyWith(
                            color: AppColors.textSecondary,
                            height: 1.35,
                          ),
                        ),
                        if (plan.hasActivePlan && !plan.isSelectionComplete) ...[
                          const SizedBox(height: 12),
                          FilledButton(
                            onPressed: () => Navigator.of(context).push<void>(
                              MaterialPageRoute<void>(
                                builder: (_) => ResumeSelectionScreen(
                                  initialPackageKey: plan.activePackageKey,
                                ),
                              ),
                            ),
                            child: Text('Choose $allowedCount templates'),
                          ),
                        ] else if (!plan.hasActivePlan) ...[
                          const SizedBox(height: 12),
                          FilledButton(
                            onPressed: () => _openUpgradePlan(context),
                            child: const Text('View plans'),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 460,
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    scrollDirection: Axis.horizontal,
                    itemCount: allTemplates.length,
                    itemBuilder: (context, index) {
                      final slot = allTemplates[index];
                      final key = slot['key'] ?? 't1_teal_sidebar';
                      final label = slot['label'] ?? 'Template';
                      final variant = index % ResumeDemoProfilesCache.instance.variantCount;
                      final isUnlocked = ResumePlanService.instance.isTemplateUnlocked(key);

                      return Stack(
                        children: [
                          ResumeDashboardTemplateCard(
                            displayLabel: label,
                            htmlTemplateKey: key,
                            demoVariant: variant,
                            onView: () => _openPreview(context, key),
                            onEdit: isUnlocked
                                ? () => _openStudio(context, key)
                                : () => _openLockedAction(context),
                          ),
                          if (!isUnlocked)
                            Positioned.fill(
                              child: Container(
                                margin: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.black.withValues(alpha: 0.45),
                                  borderRadius: BorderRadius.circular(16),
                                ),
                                child: Center(
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(Icons.lock_rounded, color: Colors.white, size: 36),
                                      const SizedBox(height: 8),
                                      const Text(
                                        'LOCKED',
                                        style: TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w900,
                                          letterSpacing: 1.2,
                                        ),
                                      ),
                                      const SizedBox(height: 12),
                                      FilledButton.icon(
                                        onPressed: () => _openLockedAction(context),
                                        icon: const Icon(Icons.star_rounded, size: 14),
                                        style: FilledButton.styleFrom(
                                          backgroundColor: AppColors.primary,
                                          visualDensity: VisualDensity.compact,
                                        ),
                                        label: Text(
                                          plan.hasActivePlan && !plan.isSelectionComplete
                                              ? 'Select templates'
                                              : 'Upgrade Plan',
                                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                        ],
                      );
                    },
                  ),
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                sliver: SliverList.separated(
                  itemCount: allTemplates.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final slot = allTemplates[index];
                    final key = slot['key']!;
                    final label = slot['label'] ?? key;
                    final variant = index % ResumeDemoProfilesCache.instance.variantCount;
                    final isUnlocked = ResumePlanService.instance.isTemplateUnlocked(key);

                    return Material(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(14),
                        onTap: isUnlocked
                            ? () => _openStudio(context, key)
                            : () => _openLockedAction(context),
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              SizedBox(
                                width: 52,
                                height: 68,
                                child: ResumeTemplateMiniPreview(
                                  templateKey: key,
                                  demoVariant: variant,
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      label,
                                      style: tt.titleSmall?.copyWith(fontWeight: FontWeight.w800),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      isUnlocked ? 'Unlocked & Active' : 'Locked (Included in other plans)',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: isUnlocked ? AppColors.success : AppColors.textHint,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              TextButton(
                                onPressed: () => _openPreview(context, key),
                                child: const Text('Preview'),
                              ),
                              if (isUnlocked)
                                FilledButton(
                                  onPressed: () => _openStudio(context, key),
                                  style: FilledButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                    padding: const EdgeInsets.symmetric(horizontal: 14),
                                  ),
                                  child: const Text('Use'),
                                )
                              else
                                OutlinedButton.icon(
                                  onPressed: () => _openLockedAction(context),
                                  icon: const Icon(Icons.lock_outline_rounded, size: 14),
                                  style: OutlinedButton.styleFrom(
                                    visualDensity: VisualDensity.compact,
                                  ),
                                  label: const Text('Unlock'),
                                ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
