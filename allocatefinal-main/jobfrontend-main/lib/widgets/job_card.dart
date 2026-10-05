import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../models/job.dart';
import '../../utils/app_colors.dart';
import '../../constants/industry_types.dart';

class JobCardWidget extends StatelessWidget {
  final Job job;
  final VoidCallback onTap;
  final VoidCallback? onApply;
  final VoidCallback? onBookmark;
  final bool isBookmarked;
  /// True when the current user has already submitted an application for this job.
  final bool hasApplied;
  /// Job closed, past deadline, or otherwise not accepting applications.
  final bool isNoLongerAccepting;

  const JobCardWidget({
    super.key,
    required this.job,
    required this.onTap,
    this.onApply,
    this.onBookmark,
    this.isBookmarked = false,
    this.hasApplied = false,
    this.isNoLongerAccepting = false,
  });

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFF1F5F9), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.015),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title, Company Name, and Avatar
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFF1F5F9)),
                      ),
                      clipBehavior: Clip.antiAlias,
                      child: job.companyLogoUrl != null
                          ? CachedNetworkImage(
                              imageUrl: job.companyLogoUrl!,
                              fit: BoxFit.contain,
                              errorWidget: (context, url, error) => Center(
                                child: Text(
                                  job.companyName.isNotEmpty
                                      ? job.companyName[0].toUpperCase()
                                      : 'C',
                                  style: const TextStyle(
                                    color: AppColors.primary,
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            )
                          : Center(
                              child: Text(
                                job.companyName.isNotEmpty
                                    ? job.companyName[0].toUpperCase()
                                    : 'C',
                                style: const TextStyle(
                                  color: AppColors.primary,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            job.title,
                            style: textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.primary,
                              fontSize: 15,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            job.companyName,
                            style: textTheme.bodyMedium?.copyWith(
                              color: AppColors.textPrimary.withOpacity(0.7),
                              fontWeight: FontWeight.w600,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (onBookmark != null)
                      IconButton(
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: onBookmark,
                        icon: Icon(
                          isBookmarked
                              ? Icons.bookmark_rounded
                              : Icons.bookmark_border_rounded,
                          color: isBookmarked
                              ? AppColors.primary
                              : AppColors.textPrimary.withOpacity(0.6),
                          size: 22,
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                
                // Location & Salary
                Row(
                  children: [
                    Expanded(
                      child: Row(
                        children: [
                          Icon(Icons.location_on_outlined, size: 14, color: AppColors.textPrimary.withOpacity(0.55)),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              job.location,
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.textPrimary.withOpacity(0.7),
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Row(
                        children: [
                          Icon(Icons.currency_rupee_rounded, size: 14, color: AppColors.textPrimary.withOpacity(0.55)),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              job.salaryRange,
                              style: TextStyle(
                                fontSize: 12,
                                color: AppColors.textPrimary.withOpacity(0.7),
                                fontWeight: FontWeight.w600,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                
                // Bottom row: Action / Applied badge
                if (hasApplied || (onApply != null && !isNoLongerAccepting)) ...[
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      if (hasApplied)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.success.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.success.withOpacity(0.3)),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.check_circle_rounded, size: 14, color: AppColors.success),
                              SizedBox(width: 4),
                              Text(
                                'Applied',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.success,
                                ),
                              ),
                            ],
                          ),
                        )
                      else if (onApply != null && !isNoLongerAccepting)
                        SizedBox(
                          height: 30,
                          child: ElevatedButton(
                            onPressed: onApply,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: const Text(
                              'Apply Now',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip({
    required IconData icon,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F9),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: AppColors.primary),
          const SizedBox(width: 5),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}