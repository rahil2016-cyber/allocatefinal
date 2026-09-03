import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/banner.dart';
import '../utils/api_json_decode.dart';
import 'app_session.dart';

/// Banner service for managing promotional banners shown on the platform.
///
/// Banners are role-specific. Each user role (job_seeker / employer) gets its
/// own in-memory cache and its own SharedPreferences key so that switching
/// accounts on the same device never leaks one role's banners into another.
class BannerApiService {
  BannerApiService._();
  static final BannerApiService instance = BannerApiService._();

  // ─── Role-aware cache keys ────────────────────────────────────────────────
  static const _prefsKeyJobSeeker = 'cached_banners_v2_job_seeker';
  static const _prefsKeyEmployer  = 'cached_banners_v2_employer';
  static const _prefsKeyAll       = 'cached_banners_v2_all';

  String get _currentRole {
    final role = AppSession.user?['role']?.toString() ?? '';
    if (role == 'job_seeker') return 'job_seeker';
    if (role == 'company' || role == 'employer') return 'employer';
    return 'all';
  }

  String get _prefsKey {
    switch (_currentRole) {
      case 'job_seeker': return _prefsKeyJobSeeker;
      case 'employer':   return _prefsKeyEmployer;
      default:           return _prefsKeyAll;
    }
  }

  String get _base => ApiConfig.baseUrl;

  // Separate memory caches per role to prevent cross-role contamination.
  final Map<String, List<PromoBanner>> _memoryCache = {};
  final Map<String, bool> _fetchedThisSession = {};

  Map<String, String> get _publicHeaders => {
        'Accept': 'application/json',
      };

  Map<String, dynamic> _decode(http.Response r) => decodeApiJsonObject(r);

  void _ensureSuccess(Map<String, dynamic> json, int status) {
    if (status >= 200 && status < 300 && json['success'] == true) return;
    throw Exception(json['message']?.toString() ?? 'Request failed ($status)');
  }

  Map<String, String> get _authHeaders {
    final t = AppSession.token;
    if (t == null || t.isEmpty) return _publicHeaders;
    return {
      ..._publicHeaders,
      'Authorization': 'Bearer $t',
    };
  }

  /// Instant in-memory list for the current role (may be empty).
  List<PromoBanner> get memoryBanners =>
      List<PromoBanner>.unmodifiable(_memoryCache[_currentRole] ?? const []);

  /// Clear all cached banners (call on logout so the next user starts fresh).
  void clearCache() {
    _memoryCache.clear();
    _fetchedThisSession.clear();
  }

  /// Load disk cache for the current role into memory (no network).
  /// Safe to call on Home init.
  Future<List<PromoBanner>> loadCachedBanners() async {
    final role = _currentRole;
    if (_memoryCache.containsKey(role)) {
      return List<PromoBanner>.unmodifiable(_memoryCache[role]!);
    }
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_prefsKey);
      if (raw == null || raw.isEmpty) return const [];
      final decoded = jsonDecode(raw);
      if (decoded is! List) return const [];
      final list = decoded
          .whereType<Map>()
          .map((e) => PromoBanner.fromJson(Map<String, dynamic>.from(e)))
          .toList();
      _memoryCache[role] = list;
      return List<PromoBanner>.unmodifiable(list);
    } catch (_) {
      return const [];
    }
  }

  Future<void> _persist(String role, List<PromoBanner> banners) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        _prefsKey,
        jsonEncode(banners.map((b) => b.toJson()).toList()),
      );
    } catch (_) {
      // Disk cache is best-effort.
    }
  }

  Future<List<PromoBanner>> _fetchFromNetwork() async {
    final role = _currentRole;
    String queryParams = '';
    if (role == 'job_seeker') {
      queryParams = '?for=job_seeker';
    } else if (role == 'employer') {
      queryParams = '?for=employer';
    }
    final uri = Uri.parse('$_base/banners$queryParams');
    final r = await http.get(uri, headers: _authHeaders);
    final json = _decode(r);
    _ensureSuccess(json, r.statusCode);

    final data = json['data'];
    if (data is! List) {
      return [];
    }

    return data
        .map((e) => PromoBanner.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  /// `GET /banners` — active banners with role-specific session + disk cache.
  ///
  /// Each role has its own cache. Switching accounts never returns stale banners
  /// from a different role. Pass [forceRefresh] = true for pull-to-refresh.
  Future<List<PromoBanner>> getActiveBanners({bool forceRefresh = false}) async {
    final role = _currentRole;
    if (!forceRefresh &&
        (_fetchedThisSession[role] == true) &&
        _memoryCache.containsKey(role)) {
      return List<PromoBanner>.unmodifiable(_memoryCache[role]!);
    }

    try {
      final fresh = await _fetchFromNetwork();
      _memoryCache[role] = fresh;
      _fetchedThisSession[role] = true;
      await _persist(role, fresh);
      return List<PromoBanner>.unmodifiable(fresh);
    } catch (e) {
      final cached = await loadCachedBanners();
      if (cached.isNotEmpty) {
        _fetchedThisSession[role] = true;
        return cached;
      }
      rethrow;
    }
  }
}
