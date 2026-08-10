import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'job_seeker_api_service.dart';
import '../screens/job_seeker/resume_html_preview_screen.dart';

class ResumePlanService extends ChangeNotifier {
  ResumePlanService._();
  static final ResumePlanService instance = ResumePlanService._();

  String? _activePackageKey;
  int _allowedTemplateCount = 4; // Default plan limit is 4 templates
  List<String> _selectedTemplateIds = [];

  String? get activePackageKey => _activePackageKey;
  int get allowedTemplateCount => _allowedTemplateCount;
  List<String> get selectedTemplateIds => List.unmodifiable(_selectedTemplateIds);

  Future<void> fetchActivePlan() async {
    try {
      final profile = await JobSeekerApiService.instance.getSeekerProfile();
      final key = profile['resume_package_key']?.toString() ??
          profile['package_key']?.toString() ??
          'basic_resume';
      _setActivePlanKey(key);

      final sel = profile['selected_template_ids'];
      if (sel is List) {
        _selectedTemplateIds = sel.map((e) => e.toString()).toList();
      } else {
        _selectedTemplateIds = [];
      }
      notifyListeners();
    } catch (_) {
      // Default to basic_resume (4 templates) if offline or guest
      _setActivePlanKey('basic_resume');
    }
  }

  void updateSelections(List<String> selection) {
    _selectedTemplateIds = List.from(selection);
    notifyListeners();
  }

  void _setActivePlanKey(String key) {
    _activePackageKey = key;
    if (key == 'professional_resume') {
      _allowedTemplateCount = 12;
    } else if (key == 'premium_resume') {
      _allowedTemplateCount = 8;
    } else {
      _allowedTemplateCount = 4; // basic_resume or default
    }
    notifyListeners();
  }

  bool isTemplateUnlocked(String templateKey) {
    if (_selectedTemplateIds.isEmpty) {
      // If user hasn't made a custom 4-template selection yet, fallback to default slice
      final available = getAvailableTemplates();
      return available.any((t) => t['key'] == templateKey);
    }
    return _selectedTemplateIds.contains(templateKey);
  }

  /// Returns the templates allowed/selected under the active plan.
  List<Map<String, String>> getAvailableTemplates() {
    if (_selectedTemplateIds.isNotEmpty) {
      return kSeekerResumeHtmlTemplates
          .where((t) => _selectedTemplateIds.contains(t['key']))
          .toList();
    }
    final count = _allowedTemplateCount;
    if (count >= kSeekerResumeHtmlTemplates.length) {
      return kSeekerResumeHtmlTemplates;
    }
    return kSeekerResumeHtmlTemplates.take(count).toList();
  }
}
