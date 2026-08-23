import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../config/api_config.dart';
import '../utils/api_json_decode.dart';

/// Public contact / social links from admin Settings (cached locally).
class ContactSettingsService {
  ContactSettingsService._();
  static final ContactSettingsService instance = ContactSettingsService._();

  static const _prefsKey = 'cached_contact_settings_v1';

  Map<String, String>? _memory;

  Map<String, String> get defaults => {
        'support_phone': '9036980547',
        'youtube_url': 'https://www.youtube.com/@joballocate',
        'facebook_url': 'https://www.facebook.com/joballocate',
        'whatsapp_url': 'https://wa.me/919036980547',
        'instagram_url': 'https://www.instagram.com/joballocate',
        'linkedin_url': 'https://www.linkedin.com/company/joballocate',
        'website_url': 'https://joballocate.tech',
        'about_text':
            'Empowering careers through smart matching and powerful resume building tools.',
      };

  Map<String, String> get current =>
      Map<String, String>.from(_memory ?? defaults);

  Future<Map<String, String>> load({bool forceRefresh = false}) async {
    if (!forceRefresh && _memory != null) {
      return current;
    }

    final cached = await _readCache();
    if (cached != null) {
      _memory = cached;
    }

    try {
      final uri = Uri.parse('${ApiConfig.baseUrl}/contact');
      final r = await http.get(uri, headers: {
        'Accept': 'application/json',
      });
      final json = decodeApiJsonObject(r);
      if (r.statusCode >= 200 &&
          r.statusCode < 300 &&
          json['success'] == true &&
          json['data'] is Map) {
        final raw = Map<String, dynamic>.from(json['data'] as Map);
        final mapped = <String, String>{};
        for (final e in defaults.entries) {
          final v = raw[e.key]?.toString().trim();
          mapped[e.key] = (v != null && v.isNotEmpty) ? v : e.value;
        }
        _memory = mapped;
        await _writeCache(mapped);
        return current;
      }
    } catch (_) {
      // Fall through to cache / defaults.
    }

    if (_memory != null) return current;
    _memory = Map<String, String>.from(defaults);
    return current;
  }

  Future<Map<String, String>?> _readCache() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_prefsKey);
      if (raw == null || raw.isEmpty) return null;
      final decoded = jsonDecode(raw);
      if (decoded is! Map) return null;
      return decoded.map((k, v) => MapEntry(k.toString(), v.toString()));
    } catch (_) {
      return null;
    }
  }

  Future<void> _writeCache(Map<String, String> data) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_prefsKey, jsonEncode(data));
    } catch (_) {}
  }

  String dialUri(String phone) {
    final digits = phone.replaceAll(RegExp(r'\D'), '');
    return 'tel:$digits';
  }
}
