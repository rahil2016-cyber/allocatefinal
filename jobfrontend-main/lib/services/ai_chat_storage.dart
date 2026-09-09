import 'package:shared_preferences/shared_preferences.dart';

import 'app_session.dart';

/// Persists the active AI chat conversation id per logged-in user.
class AiChatStorage {
  AiChatStorage._();

  static const _prefix = 'ai_chat_conversation_v1_';

  static String _prefsKey() {
    final uid = AppSession.currentUserId;
    if (uid == null || uid.isEmpty) return '${_prefix}active';
    return '$_prefix$uid';
  }

  static Future<String?> loadConversationId() async {
    final key = _prefsKey();
    final prefs = await SharedPreferences.getInstance();
    final id = prefs.getString(key);
    if (id == null || id.isEmpty) return null;
    return id;
  }

  static Future<void> saveConversationId(String conversationId) async {
    final key = _prefsKey();
    if (key == null || conversationId.isEmpty) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(key, conversationId);
  }

  static Future<void> clearConversationId() async {
    final key = _prefsKey();
    if (key == null) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(key);
  }

  /// Called on logout so another account does not inherit chat state.
  static Future<void> clearAllForLogout() async {
    final prefs = await SharedPreferences.getInstance();
    final keys = prefs.getKeys().where((k) => k.startsWith(_prefix));
    for (final key in keys) {
      await prefs.remove(key);
    }
  }
}
