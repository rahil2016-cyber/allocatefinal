import 'package:flutter/material.dart';
import '../../models/job.dart';
import '../../services/ai_chat_api_service.dart';
import '../../services/ai_chat_storage.dart';
import '../../services/app_session.dart';
import '../../services/job_seeker_api_service.dart';
import '../../utils/app_colors.dart';
import '../../utils/network_user_message.dart';
import '../../widgets/ai_bot_avatar.dart';
import '../../widgets/apply_job_sheet.dart';
import '../../widgets/job_card.dart';
import '../job_seeker/job_detail_screen.dart';

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
  bool _loadingHistory = true;
  String? _error;
  String? _lastFailedText;
  final Set<String> _savedJobIds = {};
  final Set<String> _appliedJobIds = {};

  @override
  void initState() {
    super.initState();
    _loadSavedAndApplied();
    _restoreConversation();
  }

  Future<void> _restoreConversation() async {
    if (!AppSession.isLoggedIn) {
      if (mounted) setState(() => _loadingHistory = false);
      return;
    }

    try {
      final savedId = await AiChatStorage.loadConversationId();
      if (savedId == null) {
        if (mounted) setState(() => _loadingHistory = false);
        return;
      }

      final history = await AiChatApiService.instance.loadConversation(savedId);
      if (!mounted) return;

      setState(() {
        _conversationId = history.conversationId;
        _messages
          ..clear()
          ..addAll(
            history.messages.map(
              (m) => m.role == AiChatRole.user
                  ? _UiMessage.user(m.text)
                  : _UiMessage.assistant(
                      m.text,
                      jobs: _isEmployer ? const [] : m.jobs,
                    ),
            ),
          );
        for (final m in history.messages) {
          for (final item in m.jobs) {
            if (item.hasApplied) _appliedJobIds.add(item.job.id);
          }
        }
        _loadingHistory = false;
      });
      _scrollToBottom();
    } catch (_) {
      await AiChatStorage.clearConversationId();
      if (mounted) setState(() => _loadingHistory = false);
    }
  }

  Future<void> _persistConversationId(String? id) async {
    if (id == null || id.isEmpty) return;
    await AiChatStorage.saveConversationId(id);
  }

  Future<void> _startNewChat() async {
    await AiChatStorage.clearConversationId();
    if (!mounted) return;
    setState(() {
      _conversationId = null;
      _messages.clear();
      _error = null;
      _lastFailedText = null;
    });
  }

  Future<void> _loadSavedAndApplied() async {
    if (!AppSession.isLoggedIn || _isEmployer) return;
    try {
      final saved = await JobSeekerApiService.instance.listSavedJobs(perPage: 100);
      final apps =
          await JobSeekerApiService.instance.listMyApplications(perPage: 100);
      if (!mounted) return;
      setState(() {
        _savedJobIds
          ..clear()
          ..addAll(saved.map((j) => j.id));
        _appliedJobIds
          ..clear()
          ..addAll(apps.map((a) => a.jobId));
      });
    } catch (_) {}
  }

  Future<void> _refreshAppliedIds() async {
    if (!AppSession.isLoggedIn) return;
    try {
      final apps =
          await JobSeekerApiService.instance.listMyApplications(perPage: 100);
      if (mounted) {
        setState(() {
          _appliedJobIds
            ..clear()
            ..addAll(apps.map((a) => a.jobId));
        });
      }
    } catch (_) {}
  }

  Future<void> _toggleSaveJob(Job job) async {
    try {
      final isSaved = _savedJobIds.contains(job.id);
      if (isSaved) {
        await JobSeekerApiService.instance.unsaveJob(job.id);
      } else {
        await JobSeekerApiService.instance.saveJob(job.id);
      }
      if (!mounted) return;
      setState(() {
        if (isSaved) {
          _savedJobIds.remove(job.id);
        } else {
          _savedJobIds.add(job.id);
        }
      });
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(NetworkUserMessage.shortSummary(e))),
      );
    }
  }

  void _markApplied(String jobId) {
    setState(() => _appliedJobIds.add(jobId));
  }

  Future<void> _openJobDetail(Job job, {required bool hasApplied}) async {
    final token = AppSession.token ?? '';
    final userId = AppSession.user?['id']?.toString() ?? 'demo-user';
    final isSaved = _savedJobIds.contains(job.id);
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => JobDetailScreen(
          job: job,
          userId: userId,
          token: token,
          isBookmarked: isSaved,
          hasApplied: hasApplied || _appliedJobIds.contains(job.id),
        ),
      ),
    );
    if (mounted) {
      await _refreshAppliedIds();
      await _loadSavedAndApplied();
    }
  }

  Future<void> _applyToJob(Job job) async {
    final ok = await showApplyJobSheet(context, job);
    if (ok && mounted) {
      _markApplied(job.id);
      await _refreshAppliedIds();
    }
  }

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
      'Show jobs near me',
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
      final convId = response.conversationId ?? _conversationId;
      if (convId != null && convId.isNotEmpty) {
        await _persistConversationId(convId);
      }
      setState(() {
        _conversationId = convId ?? _conversationId;
        for (final item in response.jobs) {
          if (item.hasApplied) _appliedJobIds.add(item.job.id);
        }
        _messages.add(_UiMessage.assistant(
          response.message,
          jobs: _isEmployer ? const [] : response.jobs,
        ));
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
    return Scaffold(
      backgroundColor: AppColors.background,
      resizeToAvoidBottomInset: true,
      appBar: AppBar(
        backgroundColor: const Color(0xFF4F46E5),
        foregroundColor: Colors.white,
        elevation: 0,
        title: const Row(
          children: [
            AiBotAvatar(size: 30),
            SizedBox(width: 10),
            Text(
              'JobAllocate AI',
              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
            ),
          ],
        ),
        actions: [
          if (_messages.isNotEmpty || _conversationId != null)
            IconButton(
              tooltip: 'New chat',
              onPressed: _sending ? null : _startNewChat,
              icon: const Icon(Icons.add_comment_outlined),
            ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: GestureDetector(
                onTap: () => FocusManager.instance.primaryFocus?.unfocus(),
                behavior: HitTestBehavior.translucent,
                child: _loadingHistory
                    ? const Center(
                        child: CircularProgressIndicator(
                          color: AppColors.primary,
                        ),
                      )
                    : _messages.isEmpty && !_sending
                    ? _EmptyState(
                        suggestions: _suggestions,
                        onSuggestionTap: _send,
                      )
                    : ListView.builder(
                        controller: _scrollCtrl,
                        keyboardDismissBehavior:
                            ScrollViewKeyboardDismissBehavior.onDrag,
                        padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                        itemCount: _messages.length + (_sending ? 1 : 0),
                        itemBuilder: (context, index) {
                          if (_sending && index == _messages.length) {
                            return const _TypingIndicator();
                          }
                          final msg = _messages[index];
                          return _ChatBubble(
                            message: msg,
                            isEmployer: _isEmployer,
                            savedJobIds: _savedJobIds,
                            appliedJobIds: _appliedJobIds,
                            onJobTap: _openJobDetail,
                            onJobApply: _applyToJob,
                            onJobBookmark: _toggleSaveJob,
                          );
                        },
                      ),
              ),
            ),
            if (_error != null)
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
                child: Material(
                  color: AppColors.error.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.error_outline,
                          color: AppColors.error,
                          size: 20,
                        ),
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
              onSend: () => _send(),
            ),
          ],
        ),
      ),
    );
  }
}

class _UiMessage {
  const _UiMessage({
    required this.role,
    required this.text,
    this.jobs = const [],
  });

  final AiChatRole role;
  final String text;
  final List<AiChatJobResult> jobs;

  factory _UiMessage.user(String text) =>
      _UiMessage(role: AiChatRole.user, text: text);

  factory _UiMessage.assistant(String text, {List<AiChatJobResult> jobs = const []}) =>
      _UiMessage(role: AiChatRole.assistant, text: text, jobs: jobs);
}

class _ChatBubble extends StatelessWidget {
  const _ChatBubble({
    required this.message,
    required this.isEmployer,
    required this.savedJobIds,
    required this.appliedJobIds,
    required this.onJobTap,
    required this.onJobApply,
    required this.onJobBookmark,
  });

  final _UiMessage message;
  final bool isEmployer;
  final Set<String> savedJobIds;
  final Set<String> appliedJobIds;
  final Future<void> Function(Job job, {required bool hasApplied}) onJobTap;
  final Future<void> Function(Job job) onJobApply;
  final Future<void> Function(Job job) onJobBookmark;

  @override
  Widget build(BuildContext context) {
    final isUser = message.role == AiChatRole.user;
    final maxWidth = MediaQuery.of(context).size.width * 0.85;

    if (isUser) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          constraints: BoxConstraints(maxWidth: maxWidth),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(18),
              topRight: Radius.circular(18),
              bottomLeft: Radius.circular(18),
              bottomRight: Radius.circular(4),
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.25),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            message.text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              height: 1.5,
            ),
          ),
        ),
      );
    }

    // AI answer with optional job boxes — each job in its own tappable card.
    final jobs = isEmployer ? const <AiChatJobResult>[] : message.jobs;

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFDCE6F0), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.accentLight,
                borderRadius: jobs.isEmpty
                    ? BorderRadius.circular(15)
                    : const BorderRadius.only(
                        topLeft: Radius.circular(15),
                        topRight: Radius.circular(15),
                      ),
              ),
              child: Row(
                children: [
                  const AiBotAvatar(size: 24),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'JobAllocate AI',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  if (jobs.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${jobs.length} job${jobs.length == 1 ? '' : 's'}',
                        style: const TextStyle(
                          color: AppColors.primary,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(14, 12, 14, jobs.isEmpty ? 14 : 10),
              child: Text(
                message.text,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 14,
                  height: 1.55,
                ),
              ),
            ),
            if (jobs.isNotEmpty) ...[
              const Divider(height: 1, thickness: 1, color: Color(0xFFE8EEF4)),
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 10, 14, 4),
                child: Row(
                  children: [
                    Icon(
                      Icons.work_outline_rounded,
                      size: 16,
                      color: AppColors.primary.withValues(alpha: 0.85),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Tap a job to view details or apply',
                      style: TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
              ...jobs.map((item) {
                final job = item.job;
                final hasApplied =
                    item.hasApplied || appliedJobIds.contains(job.id);
                final isSaved = savedJobIds.contains(job.id);
                return Padding(
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: const Color(0xFFCBD5E1),
                        width: 1.2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withValues(alpha: 0.06),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(13),
                      child: JobCardWidget(
                        job: job,
                        margin: EdgeInsets.zero,
                        layout: JobCardLayout.chat,
                        hasApplied: hasApplied,
                        isBookmarked: isSaved,
                        isNoLongerAccepting: job.isJobExpired,
                        onTap: () => onJobTap(job, hasApplied: hasApplied),
                        onApply: () => onJobApply(job),
                        onBookmark: () => onJobBookmark(job),
                      ),
                    ),
                  ),
                );
              }),
            ],
          ],
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
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.7,
        ),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFDCE6F0)),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const AiBotAvatar(size: 28),
              const SizedBox(width: 10),
              const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: AppColors.primary,
                ),
              ),
              const SizedBox(width: 10),
              const Text(
                'Thinking…',
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 13,
                ),
              ),
            ],
          ),
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
    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        const SizedBox(height: 16),
        Center(
          child: Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF8B5CF6).withValues(alpha: 0.35),
                  blurRadius: 24,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: const AiBotAvatar(size: 88),
          ),
        ),
        const SizedBox(height: 20),
        Text(
          'How can I help you?',
          textAlign: TextAlign.center,
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
    );
  }
}

class _InputBar extends StatelessWidget {
  const _InputBar({
    required this.controller,
    required this.sending,
    required this.onSend,
  });

  final TextEditingController controller;
  final bool sending;
  final VoidCallback onSend;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      elevation: 4,
      shadowColor: Colors.black.withValues(alpha: 0.08),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: TextField(
                controller: controller,
                maxLines: 3,
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
