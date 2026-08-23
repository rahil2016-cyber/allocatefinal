import 'package:flutter/material.dart';
import 'job_seeker_api_service.dart';
import '../screens/job_seeker/resume_html_preview_screen.dart';

class ResumePlanService extends ChangeNotifier {
  ResumePlanService._();
  static final ResumePlanService instance = ResumePlanService._();

  String? _activePackageKey;
  int _allowedTemplateCount = 0;
  List<String> _selectedTemplateIds = [];

  String? get activePackageKey => _activePackageKey;
  int get allowedTemplateCount => _allowedTemplateCount;
  List<String> get selectedTemplateIds => List.unmodifiable(_selectedTemplateIds);
  bool get hasActivePlan => _activePackageKey != null && _allowedTemplateCount > 0;
  bool get isSelectionComplete =>
      hasActivePlan && _selectedTemplateIds.length == _allowedTemplateCount;

  static int templateLimitForPackage(String? key) {
    switch (key) {
      case 'professional_resume':
        return 13;
      case 'premium_resume':
        return 8;
      case 'basic_resume':
        return 4;
      default:
        return 0;
    }
  }

  Future<void> fetchActivePlan() async {
    try {
      final profile = await JobSeekerApiService.instance.getSeekerProfile();
      final keyRaw = profile['resume_package_key']?.toString() ??
          profile['package_key']?.toString();
      final key = (keyRaw != null && keyRaw.isNotEmpty) ? keyRaw : null;

      // Prefer server selection endpoint when available (respects expiry + caps).
      try {
        final sel = await JobSeekerApiService.instance.getResumeSelection();
        final apiKey = sel['active_package_key']?.toString();
        final allowed = sel['allowed_count'];
        final ids = sel['selected_template_ids'];
        _activePackageKey =
            (apiKey != null && apiKey.isNotEmpty) ? apiKey : null;
        _allowedTemplateCount = allowed is int
            ? allowed
            : int.tryParse(allowed?.toString() ?? '') ??
                templateLimitForPackage(_activePackageKey);
        if (ids is List) {
          final list = ids
              .map((e) => e.toString())
              .where((e) => e.isNotEmpty)
              .toList();
          _selectedTemplateIds =
              list.length > _allowedTemplateCount ? <String>[] : list;
        } else {
          _selectedTemplateIds = [];
        }
        notifyListeners();
        return;
      } catch (_) {
        // Fall through to profile-only parsing.
      }

      final expiresRaw = profile['resume_credits_expires_at'] ??
          profile['package_expires_at'];
      final expiresAt = expiresRaw != null
          ? DateTime.tryParse(expiresRaw.toString())
          : null;
      final active = key != null &&
          templateLimitForPackage(key) > 0 &&
          expiresAt != null &&
          expiresAt.isAfter(DateTime.now());

      if (!active) {
        _activePackageKey = null;
        _allowedTemplateCount = 0;
        _selectedTemplateIds = [];
        notifyListeners();
        return;
      }

      _setActivePlanKey(key);
      final sel = profile['selected_template_ids'];
      if (sel is List) {
        final list = sel
            .map((e) => e.toString())
            .where((e) => e.isNotEmpty)
            .toList();
        _selectedTemplateIds =
            list.length > _allowedTemplateCount ? <String>[] : list;
      } else {
        _selectedTemplateIds = [];
      }
      notifyListeners();
    } catch (_) {
      _activePackageKey = null;
      _allowedTemplateCount = 0;
      _selectedTemplateIds = [];
      notifyListeners();
    }
  }

  void updateSelections(List<String> selection) {
    _selectedTemplateIds = selection
        .map((e) => e.toString())
        .where((e) => e.isNotEmpty)
        .take(_allowedTemplateCount)
        .toList();
    notifyListeners();
  }

  void _setActivePlanKey(String key) {
    _activePackageKey = key;
    _allowedTemplateCount = templateLimitForPackage(key);
    notifyListeners();
  }

  /// Only templates the user selected after purchase are unlocked.
  /// Empty selection = nothing unlocked (no “first N free” fallback).
  bool isTemplateUnlocked(String templateKey) {
    if (!hasActivePlan || _selectedTemplateIds.isEmpty) {
      return false;
    }
    return _selectedTemplateIds.contains(templateKey);
  }

  /// Templates available for home carousel / editing under the active plan.
  List<Map<String, String>> getAvailableTemplates() {
    if (!hasActivePlan || _selectedTemplateIds.isEmpty) {
      return const [];
    }
    return kSeekerResumeHtmlTemplates
        .where((t) => _selectedTemplateIds.contains(t['key']))
        .toList();
  }
}
