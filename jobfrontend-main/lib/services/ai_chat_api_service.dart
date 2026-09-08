import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/job.dart';
import '../utils/api_json_decode.dart';
import 'app_session.dart';

/// AI chat assistant API (`POST /api/v1/ai/chat`).
class AiChatApiService {
  AiChatApiService._();
  static final AiChatApiService instance = AiChatApiService._();

  String get _base => ApiConfig.baseUrl;

  Map<String, String> get _authHeaders {
    final t = AppSession.token;
    if (t == null || t.isEmpty) {
      throw StateError('Not authenticated');
    }
    return {
      'Authorization': 'Bearer $t',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  Map<String, dynamic> _decode(http.Response r) => decodeApiJsonObject(r);

  List<AiChatJobResult> _parseJobs(dynamic rawJobs) {
    final jobs = <AiChatJobResult>[];
    if (rawJobs is! List) return jobs;
    for (final item in rawJobs) {
      if (item is! Map) continue;
      final map = Map<String, dynamic>.from(item);
      jobs.add(AiChatJobResult(
        job: Job.fromApi(map),
        hasApplied: map['has_applied'] == true,
      ));
    }
    return jobs;
  }

  void _ensureSuccess(Map<String, dynamic> json, int status) {
    if (status >= 200 && status < 300 && json['success'] == true) return;
    final msg = json['message']?.toString() ?? '';
    throw Exception(
      msg.isNotEmpty ? msg : "Sorry, I'm having trouble connecting right now. Please try again.",
    );
  }

  /// Send a chat message. Returns AI reply and optional conversation id.
  Future<AiChatResponse> sendMessage({
    required String message,
    String? conversationId,
    int? jobId,
  }) async {
    final body = <String, dynamic>{
      'message': message.trim(),
      if (conversationId != null && conversationId.isNotEmpty)
        'conversation_id': conversationId,
      'job_id': ?jobId,
    };

    final r = await http
        .post(
          Uri.parse('$_base/ai/chat'),
          headers: _authHeaders,
          body: jsonEncode(body),
        )
        .timeout(const Duration(seconds: 90));

    final json = _decode(r);
    _ensureSuccess(json, r.statusCode);

    final data = json['data'];
    if (data is! Map) {
      throw Exception("Sorry, I'm having trouble connecting right now. Please try again.");
    }

    final jobs = _parseJobs(data['jobs']);

    return AiChatResponse(
      message: data['message']?.toString() ?? '',
      conversationId: data['conversation_id']?.toString(),
      jobs: jobs,
    );
  }

  /// Load conversation history for the current user.
  Future<AiConversationHistory> loadConversation(String conversationId) async {
    final r = await http
        .get(
          Uri.parse('$_base/ai/conversations/$conversationId'),
          headers: _authHeaders,
        )
        .timeout(const Duration(seconds: 30));

    final json = _decode(r);
    _ensureSuccess(json, r.statusCode);

    final data = json['data'];
    if (data is! Map) {
      throw Exception('Could not load conversation.');
    }

    final rawMessages = data['messages'];
    final messages = <AiChatMessage>[];
    if (rawMessages is List) {
      for (final item in rawMessages) {
        if (item is! Map) continue;
        final role = item['role']?.toString() ?? 'user';
        final text = item['message']?.toString() ?? '';
        if (text.isEmpty) continue;
        messages.add(AiChatMessage(
          role: role == 'assistant' ? AiChatRole.assistant : AiChatRole.user,
          text: text,
          jobs: _parseJobs(item['jobs']),
        ));
      }
    }

    return AiConversationHistory(
      conversationId: data['conversation_id']?.toString() ?? conversationId,
      title: data['title']?.toString(),
      messages: messages,
    );
  }
}

enum AiChatRole { user, assistant }

class AiChatMessage {
  const AiChatMessage({
    required this.role,
    required this.text,
    this.jobs = const [],
  });

  final AiChatRole role;
  final String text;
  final List<AiChatJobResult> jobs;
}

class AiChatResponse {
  const AiChatResponse({
    required this.message,
    this.conversationId,
    this.jobs = const [],
  });

  final String message;
  final String? conversationId;
  final List<AiChatJobResult> jobs;
}

class AiChatJobResult {
  const AiChatJobResult({required this.job, this.hasApplied = false});

  final Job job;
  final bool hasApplied;
}

class AiConversationHistory {
  const AiConversationHistory({
    required this.conversationId,
    this.title,
    required this.messages,
  });

  final String conversationId;
  final String? title;
  final List<AiChatMessage> messages;
}
