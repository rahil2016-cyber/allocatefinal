import 'package:flutter/material.dart';
import '../../services/job_seeker_api_service.dart';
import '../../services/resume_plan_service.dart';
import '../../utils/app_colors.dart';
import '../../widgets/seeker_html_template_swatch.dart';
import '../../widgets/resume_template_mini_preview.dart';
import '../../services/resume_demo_profiles_cache.dart';
import 'resume_html_preview_screen.dart';
import 'my_resumes_screen.dart';

class ResumeSelectionScreen extends StatefulWidget {
  const ResumeSelectionScreen({
    super.key,
    this.initialPackageKey,
  });

  final String? initialPackageKey;

  @override
  State<ResumeSelectionScreen> createState() => _ResumeSelectionScreenState();
}

class _ResumeSelectionScreenState extends State<ResumeSelectionScreen> {
  bool _loading = true;
  bool _submitting = false;
  int _allowedCount = 4;
  String _packageKey = 'basic_resume';
  final Set<String> _selectedKeys = {};

  @override
  void initState() {
    super.initState();
    _loadSelectionData();
  }

  Future<void> _loadSelectionData() async {
    setState(() => _loading = true);
    try {
      final res = await JobSeekerApiService.instance.getResumeSelection();
      final allowed = res['allowed_count'] as int? ?? 4;
      final key = res['active_package_key']?.toString() ?? widget.initialPackageKey ?? 'basic_resume';
      final existing = res['selected_template_ids'];

      final Set<String> preselected = {};
      if (existing is List) {
        for (final item in existing) {
          preselected.add(item.toString());
        }
      }

      // If user hasn't selected any yet, default to first N templates
      if (preselected.isEmpty) {
        for (var i = 0; i < allowed && i < kSeekerResumeHtmlTemplates.length; i++) {
          preselected.add(kSeekerResumeHtmlTemplates[i]['key']!);
        }
      }

      if (mounted) {
        setState(() {
          _allowedCount = allowed;
          _packageKey = key;
          _selectedKeys.clear();
          _selectedKeys.addAll(preselected);
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        // Fallback default selection
        final allowed = ResumePlanService.instance.allowedTemplateCount;
        setState(() {
          _allowedCount = allowed;
          _packageKey = widget.initialPackageKey ?? 'basic_resume';
          _selectedKeys.clear();
          for (var i = 0; i < allowed && i < kSeekerResumeHtmlTemplates.length; i++) {
            _selectedKeys.add(kSeekerResumeHtmlTemplates[i]['key']!);
          }
          _loading = false;
        });
      }
    }
  }

  void _toggleTemplate(String key) {
    setState(() {
      if (_selectedKeys.contains(key)) {
        _selectedKeys.remove(key);
      } else {
        if (_selectedKeys.length >= _allowedCount) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Your plan allows selecting up to $_allowedCount templates.'),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 2),
            ),
          );
          return;
        }
        _selectedKeys.add(key);
      }
    });
  }

  Future<void> _submitSelection() async {
    if (_selectedKeys.length != _allowedCount) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please select exactly $_allowedCount templates to continue.'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _submitting = true);
    final selectionList = _selectedKeys.toList();

    try {
      await JobSeekerApiService.instance.saveResumeSelection(selectionList);
      ResumePlanService.instance.updateSelections(selectionList);
      await ResumePlanService.instance.fetchActivePlan();

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('🎉 Your $_allowedCount resume templates are now unlocked!'),
          backgroundColor: AppColors.success,
          behavior: SnackBarBehavior.floating,
        ),
      );

      Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(
          builder: (_) => const MyResumesScreen(),
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to save selection: $e'), backgroundColor: AppColors.error),
        );
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Select Your Resumes'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : Column(
              children: [
                // Celebration & Instructions Header Banner
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.04),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      const Text(
                        '🎉 Payment Successful!',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: AppColors.success,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Your plan is now active.',
                        style: tt.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.08),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Your Plan includes $_allowedCount Resume Templates',
                                    style: const TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    'Select $_allowedCount templates to activate.',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: AppColors.primary,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                '${_selectedKeys.length} / $_allowedCount Selected',
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),

                // Grid of 12 Templates
                Expanded(
                  child: GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.62,
                      crossAxisSpacing: 14,
                      mainAxisSpacing: 14,
                    ),
                    itemCount: kSeekerResumeHtmlTemplates.length,
                    itemBuilder: (context, index) {
                      final slot = kSeekerResumeHtmlTemplates[index];
                      final key = slot['key']!;
                      final label = slot['label'] ?? key;
                      final isSelected = _selectedKeys.contains(key);
                      final variant = index % ResumeDemoProfilesCache.instance.variantCount;

                      return GestureDetector(
                        onTap: () => _toggleTemplate(key),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isSelected ? AppColors.primary : Colors.grey.shade300,
                              width: isSelected ? 2.5 : 1,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: isSelected
                                    ? AppColors.primary.withValues(alpha: 0.15)
                                    : Colors.black.withValues(alpha: 0.04),
                                blurRadius: isSelected ? 12 : 6,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Stack(
                            children: [
                              Padding(
                                padding: const EdgeInsets.all(10),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.stretch,
                                  children: [
                                    Expanded(
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(10),
                                        child: ResumeTemplateMiniPreview(
                                          templateKey: key,
                                          demoVariant: variant,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                    Text(
                                      label,
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                                        color: isSelected ? AppColors.primary : AppColors.textPrimary,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      textAlign: TextAlign.center,
                                    ),
                                  ],
                                ),
                              ),

                              // Selection Checkbox Badge
                              Positioned(
                                top: 8,
                                right: 8,
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  padding: const EdgeInsets.all(4),
                                  decoration: BoxDecoration(
                                    color: isSelected ? AppColors.primary : Colors.white.withValues(alpha: 0.9),
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: isSelected ? AppColors.primary : Colors.grey.shade400,
                                      width: 1.5,
                                    ),
                                  ),
                                  child: Icon(
                                    Icons.check_rounded,
                                    size: 16,
                                    color: isSelected ? Colors.white : Colors.transparent,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // Bottom Action Bar
                SafeArea(
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.06),
                          blurRadius: 10,
                          offset: const Offset(0, -4),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      onPressed: _submitting || _selectedKeys.length != _allowedCount
                          ? null
                          : _submitSelection,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                        elevation: 0,
                      ),
                      child: _submitting
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : Text(
                              _selectedKeys.length == _allowedCount
                                  ? 'Confirm Selection & Activate'
                                  : 'Select ${_allowedCount - _selectedKeys.length} More Template(s)',
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
