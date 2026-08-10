import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'job_seeker_api_service.dart';
import '../screens/job_seeker/resume_html_preview_screen.dart';

class ResumePlanService extends ChangeNotifier {
  ResumePlanService._();
  static final ResumePlanService instance = ResumePlanService._();

  String? _activePackageKey;
  int _allowedTemplateCount = 4; // Default plan limit is 4 templates

  String? get activePackageKey => _activePackageKey;
  int get allowedTemplateCount => _allowedTemplateCount;

  Future<void> fetchActivePlan() async {
    try {
      final profile = await JobSeekerApiService.instance.getSeekerProfile();
      final key = profile['resume_package_key']?.toString() ??
          profile['package_key']?.toString() ??
          'basic_resume';
      _setActivePlanKey(key);
    } catch (_) {
      // Default to basic_resume (4 templates) if offline or guest
      _setActivePlanKey('basic_resume');
    }
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

  /// Returns the slice of templates allowed under the current active plan.
  List<Map<String, String>> getAvailableTemplates() {
    final count = _allowedTemplateCount;
    if (count >= kSeekerResumeHtmlTemplates.length) {
      return kSeekerResumeHtmlTemplates;
    }
    return kSeekerResumeHtmlTemplates.take(count).toList();
  }
}
