import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';
import '../models/banner.dart';
import '../utils/api_json_decode.dart';
import 'app_session.dart';

/// Banner service for managing promotional banners shown on the platform.
///
/// Active banners are kept in memory for the app session and persisted to
/// SharedPreferences so Home can paint instantly on reopen / tab return.
/// Network refresh runs once per session (or when forced).
class BannerApiService {
  BannerApiService._();
  static final BannerApiService instance = BannerApiService._();

  static const _prefsKey = 'cached_active_banners_v1';

  String get _base => ApiConfig.baseUrl;

  List<PromoBanner>? _memoryCache;
  bool _fetchedThisSession = false;

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

  /// Instant in-memory list (may be empty).
  List<PromoBanner> get memoryBanners =>
      List<PromoBanner>.unmodifiable(_memoryCache ?? const []);

  /// Load disk cache into memory (no network). Safe to call on Home init.
  Future<List<PromoBanner>> loadCachedBanners() async {
    if (_memoryCache != null) {
      return List<PromoBanner>.unmodifiable(_memoryCache!);
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
      _memoryCache = list;
      return List<PromoBanner>.unmodifiable(list);
    } catch (_) {
      return const [];
    }
  }

  Future<void> _persist(List<PromoBanner> banners) async {
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
    final uri = Uri.parse('$_base/banners');
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

  /// `GET /banners` — active banners with session + disk cache.
  ///
  /// After the first successful fetch in this process, subsequent calls return
  /// memory unless [forceRefresh] is true (pull-to-refresh / app reopen path).
  Future<List<PromoBanner>> getActiveBanners({bool forceRefresh = false}) async {
    if (!forceRefresh && _fetchedThisSession && _memoryCache != null) {
      return List<PromoBanner>.unmodifiable(_memoryCache!);
    }

    try {
      final fresh = await _fetchFromNetwork();
      _memoryCache = fresh;
      _fetchedThisSession = true;
      await _persist(fresh);
      return List<PromoBanner>.unmodifiable(fresh);
    } catch (e) {
      final cached = await loadCachedBanners();
      if (cached.isNotEmpty) {
        _fetchedThisSession = true;
        return cached;
      }
      rethrow;
    }
  }
}
