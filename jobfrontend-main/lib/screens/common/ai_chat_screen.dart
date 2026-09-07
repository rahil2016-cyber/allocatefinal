import 'package:flutter/material.dart';
import '../../services/ai_chat_api_service.dart';
import '../../services/app_session.dart';
import '../../utils/app_colors.dart';
import '../../utils/network_user_message.dart';

class AiChatScreen extends StatefulWidget {
  const AiChatScreen({super.key, this.jobId});

  final int? jobId;

  @override
  State<AiChatScreen> createState() => _AiChatScreenState();
}

class _AiChatScreenState extends State<AiChatScreen> {
  final _inputCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  final _messages = <_UiMessage>[];
  String? _conversationId;
  bool _sending = false;
  String? _error;
  String? _lastFailedText;

  bool get _isEmployer {
    final role = AppSession.user?['role']?.toString() ?? '';
    return role == 'company';
  }

  List<String> get _suggestions {
    if (_isEmployer) {
      return const [
        'Show my active jobs',
        'Help me find suitable candidates',
        'Explain application statuses',
        'Help me prepare interview questions',
        'How does JobAllocate work for employers?',
      ];
    }
    return const [
      'Find jobs matching my profile',
      'Show my applications',
      'Help me understand this job',
      'What should I prepare for my interview?',
      'How does JobAllocate work?',
    ];
  }

  @override
  void dispose() {
    _inputCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_scrollCtrl.hasClients) return;
      _scrollCtrl.animateTo(
        _scrollCtrl.position.maxScrollExtent,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOut,
      );
    });
  }

  Future<void> _send({String? text}) async {
    final message = (text ?? _inputCtrl.text).trim();
    if (message.isEmpty || _sending) return;

    if (!AppSession.isLoggedIn) {
      setState(() => _error = 'Please sign in to use the AI assistant.');
      return;
    }

    setState(() {
      _sending = true;
      _error = null;
      _lastFailedText = null;
      _messages.add(_UiMessage.user(message));
      if (text == null) _inputCtrl.clear();
    });
    _scrollToBottom();

    try {
      final response = await AiChatApiService.instance.sendMessage(
        message: message,
        conversationId: _conversationId,
        jobId: widget.jobId,
      );

      if (!mounted) return;
      setState(() {
        _conversationId = response.conversationId ?? _conversationId;
        _messages.add(_UiMessage.assistant(response.message));
        _sending = false;
      });
      _scrollToBottom();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _messages.removeLast();
        _sending = false;
        _lastFailedText = message;
        _error = NetworkUserMessage.shortSummary(e);
      });
    }
  }

  Future<void> _retry() async {
    final text = _lastFailedText;
    if (text == null) return;
    setState(() => _error = null);
    await _send(text: text);
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Row(
          children: [
            Icon(Icons.auto_awesome_rounded, size: 22),
            SizedBox(width: 8),
            Text(
              'JobAllocate AI',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: _messages.isEmpty && !_sending
                ? _EmptyState(
                    suggestions: _suggestions,
                    onSuggestionTap: _send,
                  )
                : ListView.builder(
                    controller: _scrollCtrl,
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                    itemCount: _messages.length + (_sending ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (_sending && index == _messages.length) {
                        return const _TypingIndicator();
                      }
                      final msg = _messages[index];
                      return _ChatBubble(message: msg);
                    },
                  ),
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Material(
                color: AppColors.error.withOpacity(0.08),
                borderRadius: BorderRadius.circular(12),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: AppColors.error, size: 20),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _error!,
                          style: const TextStyle(
                            color: AppColors.error,
                            fontSize: 13,
                          ),
                        ),
                      ),
                      if (_lastFailedText != null)
                        TextButton(
                          onPressed: _retry,
                          child: const Text('Retry'),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          _InputBar(
            controller: _inputCtrl,
            sending: _sending,
            bottomInset: bottomInset,
            onSend: () => _send(),
          ),
        ],
      ),
    );
  }
}

class _UiMessage {
  const _UiMessage({required this.role, required this.text});

  final AiChatRole role;
  final String text;

  factory _UiMessage.user(String text) =>
      _UiMessage(role: AiChatRole.user, text: text);

  factory _UiMessage.assistant(String text) =>
      _UiMessage(role: AiChatRole.assistant, text: text);
}

class _ChatBubble extends StatelessWidget {
  const _ChatBubble({required this.message});

  final _UiMessage message;

  @override
  Widget build(BuildContext context) {
    final isUser = message.role == AiChatRole.user;
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.82,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isUser ? AppColors.primary : AppColors.surface,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isUser ? 16 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 16),
          ),
          border: isUser
              ? null
              : Border.all(color: const Color(0xFFE2E8F0)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Text(
          message.text,
          style: TextStyle(
            color: isUser ? Colors.white : AppColors.textPrimary,
            fontSize: 14,
            height: 1.45,
          ),
        ),
      ),
    );
  }
}

class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator();

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(width: 10),
            Text(
              'Thinking…',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 13,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState({
    required this.suggestions,
    required this.onSuggestionTap,
  });

  final List<String> suggestions;
  final void Function({String? text}) onSuggestionTap;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 24),
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Icon(
              Icons.auto_awesome_rounded,
              color: Colors.white,
              size: 32,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'How can I help you?',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Ask me about jobs, applications, interviews, or how to use JobAllocate.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
              height: 1.4,
            ),
          ),
          const SizedBox(height: 28),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            alignment: WrapAlignment.center,
            children: suggestions.map((s) {
              return ActionChip(
                label: Text(s),
                backgroundColor: AppColors.surface,
                side: const BorderSide(color: Color(0xFFE2E8F0)),
                labelStyle: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 13,
                ),
                onPressed: () => onSuggestionTap(text: s),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _InputBar extends StatelessWidget {
  const _InputBar({
    required this.controller,
    required this.sending,
    required this.bottomInset,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool sending;
  final double bottomInset;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(12, 8, 12, 12 + bottomInset),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                maxLines: 4,
                minLines: 1,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => onSend(),
                decoration: InputDecoration(
                  hintText: 'Type your message…',
                  hintStyle: const TextStyle(color: AppColors.textHint),
                  filled: true,
                  fillColor: AppColors.background,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            Material(
              color: sending ? AppColors.textHint : AppColors.primary,
              borderRadius: BorderRadius.circular(24),
              child: InkWell(
                onTap: sending ? null : onSend,
                borderRadius: BorderRadius.circular(24),
                child: const Padding(
                  padding: EdgeInsets.all(12),
                  child: Icon(Icons.send_rounded, color: Colors.white, size: 22),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
