import 'package:shared_preferences/shared_preferences.dart';

/// Stores a pending referral / promo code from invite links or Play install referrer
/// so Register can auto-fill it.
class ReferralInviteService {
  ReferralInviteService._();
  static final ReferralInviteService instance = ReferralInviteService._();

  static const _prefsKey = 'pending_referral_code';

  /// Persist a code (normalized uppercase). Returns false if empty/invalid.
  Future<bool> savePendingCode(String? raw) async {
    final code = _normalize(raw);
    if (code == null) return false;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefsKey, code);
    return true;
  }

  Future<String?> peekPendingCode() async {
    final prefs = await SharedPreferences.getInstance();
    return _normalize(prefs.getString(_prefsKey));
  }

  Future<void> clearPendingCode() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_prefsKey);
  }

  /// Parse `joballocate://refer/CODE` or `https://joballocate.tech/invite/CODE`.
  String? codeFromUri(Uri uri) {
    if (uri.scheme == 'joballocate' &&
        (uri.host == 'refer' || uri.host == 'invite')) {
      if (uri.pathSegments.isNotEmpty) {
        return _normalize(uri.pathSegments.first);
      }
      final p = uri.path.replaceFirst('/', '');
      return _normalize(p);
    }

    final segs = uri.pathSegments;
    if (segs.length >= 2 && (segs[0] == 'invite' || segs[0] == 'refer')) {
      return _normalize(segs[1]);
    }
    if (segs.length == 1 && segs[0] == 'invite') {
      return _normalize(uri.queryParameters['code']);
    }

    final q = uri.queryParameters;
    return _normalize(
      q['referral_code'] ?? q['ref'] ?? q['code'] ?? q['utm_content'],
    );
  }

  /// Extract code from Play Install Referrer payload (utm query string).
  String? codeFromInstallReferrer(String? referrer) {
    if (referrer == null || referrer.trim().isEmpty) return null;
    try {
      final decoded = Uri.decodeComponent(referrer.trim());
      final params = Uri.splitQueryString(decoded);
      return _normalize(
        params['utm_content'] ??
            params['referral_code'] ??
            params['ref'] ??
            params['code'],
      );
    } catch (_) {
      return _normalize(referrer);
    }
  }

  String? _normalize(String? raw) {
    if (raw == null) return null;
    final code = raw.trim().toUpperCase();
    if (code.length < 3 || code.length > 32) return null;
    if (!RegExp(r'^[A-Z0-9_-]+$').hasMatch(code)) return null;
    return code;
  }
}
