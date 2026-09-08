import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../models/job.dart';

/// Layout variant for [JobCardWidget].
enum JobCardLayout {
  /// Default home feed — compact row with inline Apply.
  compact,
  /// Chatbot — full-width Apply button below job details.
  chat,
}

/// A compact, crash-proof job listing card designed for smooth scrolling
/// in ListViews and slivers. All elements use bounded sizes to prevent layout errors.
class JobCardWidget extends StatelessWidget {
  final Job job;
  final VoidCallback onTap;
  final VoidCallback? onApply;
  final VoidCallback? onBookmark;
  final bool isBookmarked;
  final bool hasApplied;
  final bool isNoLongerAccepting;
  final EdgeInsetsGeometry? margin;
  final JobCardLayout layout;

  const JobCardWidget({
    super.key,
    required this.job,
    required this.onTap,
    this.onApply,
    this.onBookmark,
    this.isBookmarked = false,
    this.hasApplied = false,
    this.isNoLongerAccepting = false,
    this.margin,
    this.layout = JobCardLayout.compact,
  });

  String _fmtK(double v) {
    if (v >= 1000) return '${(v / 1000).toStringAsFixed(0)}k';
    return v.toStringAsFixed(0);
  }

  String get _salaryText {
    if (job.salaryMin != null && job.salaryMax != null) {
      return '₹${_fmtK(job.salaryMin!)} - ${_fmtK(job.salaryMax!)}/mo';
    }
    if (job.salaryRange.isNotEmpty) {
      String r = job.salaryRange;
      r = r.replaceAllMapped(RegExp(r'(\d+),?000'), (m) => '${m.group(1)}k');
      return r.contains('k') ? '₹$r/mo' : r;
    }
    return '₹30k - 60k/mo';
  }

  String get _postedTime {
    final diff = DateTime.now().difference(job.createdAt);
    if (diff.inHours < 1) return 'Just now';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  int get _matchPercent => (job.id.hashCode % 15) + 82;

  @override
  Widget build(BuildContext context) {
    final pct = _matchPercent;
    final isChat = layout == JobCardLayout.chat;

    return Container(
      margin: margin ?? const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE2E8F0), width: 1.0),
        boxShadow: const [
          BoxShadow(
            color: Color(0x03000000),
            blurRadius: 10,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Material(
            color: Colors.transparent,
            borderRadius: BorderRadius.circular(16),
            child: InkWell(
              onTap: onTap,
              borderRadius: BorderRadius.circular(16),
              child: Padding(
                padding: EdgeInsets.fromLTRB(14, 12, 14, isChat ? 10 : 12),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHeader(pct, hideMatchBadge: isChat),
                    const Padding(
                      padding: EdgeInsets.symmetric(vertical: 8),
                      child: Divider(height: 1, thickness: 0.8, color: Color(0xFFF1F5F9)),
                    ),
                    if (isChat) _buildChatMetaRow() else _buildCompactActionRow(),
                  ],
                ),
              ),
            ),
          ),
          if (isChat) _buildChatApplyBar(),
        ],
      ),
    );
  }

  Widget _buildHeader(int pct, {required bool hideMatchBadge}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: const BoxDecoration(
            color: Color(0xFF1E1B4B),
            shape: BoxShape.circle,
          ),
          clipBehavior: Clip.antiAlias,
          child: job.companyLogoUrl != null && job.companyLogoUrl!.isNotEmpty
              ? CachedNetworkImage(
                  imageUrl: job.companyLogoUrl!,
                  fit: BoxFit.contain,
                  errorWidget: (_, _, _) => _initialsAvatar(),
                )
              : _initialsAvatar(),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                job.title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0F172A),
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Row(
                children: [
                  Flexible(
                    child: Text(
                      job.companyName,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF475569),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 3),
                  const Icon(Icons.verified, color: Color(0xFF2563EB), size: 12),
                ],
              ),
              const SizedBox(height: 3),
              Text(
                '${job.location}  •  ${_getJobType()}',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF64748B),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
        if (!hideMatchBadge) ...[
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFE6F4EA),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '$pct% Match',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFF137333),
              ),
            ),
          ),
        ] else if (onBookmark != null) ...[
          const SizedBox(width: 8),
          _bookmarkButton(),
        ],
      ],
    );
  }

  Widget _buildChatMetaRow() {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _salaryText,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF2563EB),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                _postedTime,
                style: const TextStyle(
                  fontSize: 10,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCompactActionRow() {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _salaryText,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF2563EB),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 2),
              Text(
                _postedTime,
                style: const TextStyle(
                  fontSize: 10,
                  color: Color(0xFF64748B),
                ),
              ),
            ],
          ),
        ),
        if (onBookmark != null) ...[
          _bookmarkButton(),
          const SizedBox(width: 8),
        ],
        _buildActionButton(),
      ],
    );
  }

  Widget _bookmarkButton() {
    return GestureDetector(
      onTap: onBookmark,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: const Color(0xFF2563EB).withValues(alpha: 0.2),
            width: 1.0,
          ),
        ),
        child: Icon(
          isBookmarked ? Icons.bookmark_rounded : Icons.bookmark_border_rounded,
          color: const Color(0xFF2563EB),
          size: 18,
        ),
      ),
    );
  }

  Widget _buildChatApplyBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
      child: SizedBox(
        width: double.infinity,
        height: 42,
        child: _buildChatApplyButton(),
      ),
    );
  }

  Widget _buildChatApplyButton() {
    if (hasApplied) {
      return OutlinedButton.icon(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          foregroundColor: const Color(0xFF10B981),
          side: const BorderSide(color: Color(0xFF10B981)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
        icon: const Icon(Icons.check_circle_rounded, size: 18),
        label: const Text(
          'Applied — View details',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
        ),
      );
    }

    if (isNoLongerAccepting) {
      return OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          foregroundColor: const Color(0xFF94A3B8),
          side: const BorderSide(color: Color(0xFFE2E8F0)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
        child: const Text(
          'No longer accepting applications',
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
        ),
      );
    }

    if (onApply == null) {
      return const SizedBox.shrink();
    }

    return ElevatedButton.icon(
      onPressed: onApply,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF2563EB),
        foregroundColor: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
      icon: const Icon(Icons.send_rounded, size: 18),
      label: const Text(
        'Apply now',
        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
      ),
    );
  }

  Widget _initialsAvatar() => Center(
        child: Text(
          job.companyName.isNotEmpty ? job.companyName[0].toUpperCase() : 'J',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 15,
            fontWeight: FontWeight.bold,
          ),
        ),
      );

  String _getJobType() {
    return job.jobType
        .replaceAll('_', ' ')
        .split(' ')
        .map((s) => s.isNotEmpty ? s[0].toUpperCase() + s.substring(1) : '')
        .join(' ');
  }

  Widget _buildActionButton() {
    if (hasApplied) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: const Color(0xFF10B981).withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFF10B981).withValues(alpha: 0.3)),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle_rounded, size: 12, color: Color(0xFF10B981)),
            SizedBox(width: 4),
            Text(
              'Applied',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFF10B981),
              ),
            ),
          ],
        ),
      );
    }

    if (onApply != null && !isNoLongerAccepting) {
      return SizedBox(
        height: 32,
        width: 72,
        child: ElevatedButton(
          onPressed: onApply,
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF2563EB),
            foregroundColor: Colors.white,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 14),
            minimumSize: Size.zero,
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          child: const Text(
            'Apply',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      );
    }

    if (isNoLongerAccepting) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: const Color(0xFFF1F5F9),
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Text(
          'Closed',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Color(0xFF94A3B8),
          ),
        ),
      );
    }

    return const SizedBox.shrink();
  }
}