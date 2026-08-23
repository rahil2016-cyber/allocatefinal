import 'package:flutter/material.dart';

import '../../mixins/auto_reload_on_reconnect.dart';
import '../../services/company_subscription_api_service.dart';
import '../../services/cashfree_payment_service.dart';
import '../../utils/app_colors.dart';
import '../../utils/network_user_message.dart';
import 'company_subscription_history_screen.dart';

/// Employer plans screen — layout matches [JobSeekerPackagesScreen].
class CompanySubscriptionScreen extends StatefulWidget {
  const CompanySubscriptionScreen({super.key});

  @override
  State<CompanySubscriptionScreen> createState() =>
      _CompanySubscriptionScreenState();
}

class _CompanySubscriptionScreenState extends State<CompanySubscriptionScreen>
    with AutoReloadOnReconnect {
  final _subApi = CompanySubscriptionApiService.instance;

  bool _loading = true;
  bool _purchasing = false;
  String? _error;
  Map<String, dynamic>? _offer;

  static const _features = [
    '1 job post',
    '30 days listing',
    'Candidate profile access',
    'Priority listing',
    'WhatsApp & email support',
  ];

  @override
  void onNetworkRestored() => _load();

  @override
  bool shouldReloadOnReconnect() => _error != null;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _showError(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: AppColors.error),
    );
  }

  void _showSuccess(String msg) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: AppColors.success),
    );
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final offer = await _subApi.getOffer();
      if (!mounted) return;
      setState(() {
        _offer = offer;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = NetworkUserMessage.shortSummary(e);
        _loading = false;
      });
    }
  }

  Future<void> _purchase() async {
    if (_purchasing) return;
    setState(() => _purchasing = true);
    try {
      final orderData = await _subApi.purchase(couponCode: null);
      await CashfreePaymentService.instance.checkoutAndConfirm(
        orderData: orderData,
        confirmStatus: (merchantOrderId) => _subApi.confirmStatus(
          merchantOrderId: merchantOrderId,
        ),
      );
      _showSuccess('Payment successful! Your plan is now active.');
      await _load();
    } catch (e) {
      _showError(NetworkUserMessage.shortSummary(e));
    } finally {
      if (mounted) setState(() => _purchasing = false);
    }
  }

  int _priceInr() {
    final offer = _offer;
    if (offer == null) return 499;
    final v = offer['monthly_price_inr'];
    if (v is int) return v;
    return int.tryParse(v?.toString() ?? '') ?? 499;
  }

  String _packageTitle() {
    final t = _offer?['package_title']?.toString().trim();
    if (t != null && t.isNotEmpty) return t;
    return 'Corporate Package';
  }

  Map<String, dynamic> _subscriptionMeta() {
    final raw = _offer?['subscription'];
    if (raw is Map) return Map<String, dynamic>.from(raw);
    return {};
  }

  String? _formatExpiresAt(String? iso) {
    if (iso == null || iso.isEmpty) return null;
    final d = DateTime.tryParse(iso);
    if (d == null) return iso;
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    return '${d.day} ${months[d.month - 1]} ${d.year}';
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final offer = _offer;
    final verified = offer?['verified'] == true;
    final hasActive = offer?['has_active_subscription'] == true;
    final canPurchase = offer?['can_purchase'] == true ||
        (verified && !hasActive);
    final first = (offer?['first_month'] is Map)
        ? Map<String, dynamic>.from(offer!['first_month'] as Map)
        : <String, dynamic>{};
    final renewal = (offer?['renewal'] is Map)
        ? Map<String, dynamic>.from(offer!['renewal'] as Map)
        : <String, dynamic>{};
    final sub = _subscriptionMeta();
    final nearExpiry = sub['near_expiry'] == true;
    final daysRemaining = sub['days_remaining'] is int
        ? sub['days_remaining'] as int
        : int.tryParse(sub['days_remaining']?.toString() ?? '');
    final expiresLabel = _formatExpiresAt(sub['expires_at']?.toString());
    final status = sub['status']?.toString() ?? '';
    final statusMessage = first['message']?.toString();
    final renewalMessage = renewal['message']?.toString();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Plans & packages'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            tooltip: 'Purchase history',
            icon: const Icon(Icons.history_rounded),
            onPressed: () {
              Navigator.of(context).push<void>(
                MaterialPageRoute<void>(
                  builder: (_) => const CompanySubscriptionHistoryScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          RefreshIndicator(
            color: AppColors.primary,
            onRefresh: _load,
            child: _loading && !_purchasing
                ? const Center(
                    child:
                        CircularProgressIndicator(color: AppColors.primary),
                  )
                : _error != null
                    ? ListView(
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(24),
                            child: Column(
                              children: [
                                Text(_error!, textAlign: TextAlign.center),
                                const SizedBox(height: 16),
                                FilledButton(
                                  onPressed: _load,
                                  child: const Text('Retry'),
                                ),
                              ],
                            ),
                          ),
                        ],
                      )
                    : ListView(
                        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
                        children: [
                          Text(
                            'Employer packages',
                            style: textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Post jobs and reach qualified candidates.',
                            style: textTheme.bodyMedium?.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          if (nearExpiry && daysRemaining != null) ...[
                            const SizedBox(height: 16),
                            _ReminderBanner(
                              tone: _ReminderTone.warning,
                              title: daysRemaining <= 1
                                  ? 'Plan expires tomorrow'
                                  : 'Plan expires in $daysRemaining days',
                              body:
                                  'Renew after expiry to keep posting jobs without interruption.',
                            ),
                          ],
                          if (status == 'expired') ...[
                            const SizedBox(height: 16),
                            _ReminderBanner(
                              tone: _ReminderTone.error,
                              title: 'Your plan has expired',
                              body: renewalMessage?.isNotEmpty == true
                                  ? renewalMessage!
                                  : 'Purchase again to renew and continue posting jobs.',
                            ),
                          ],
                          const SizedBox(height: 20),
                          if (offer == null)
                            Padding(
                              padding:
                                  const EdgeInsets.symmetric(vertical: 24),
                              child: Text(
                                'No packages available.',
                                style: textTheme.bodyMedium?.copyWith(
                                  color: AppColors.textHint,
                                ),
                                textAlign: TextAlign.center,
                              ),
                            )
                          else
                            _EmployerPackageCard(
                              title: _packageTitle(),
                              priceInr: _priceInr(),
                              durationDays: (sub['duration_days'] is int)
                                  ? sub['duration_days'] as int
                                  : 30,
                              features: _features,
                              featured: true,
                              verified: verified,
                              hasActive: hasActive,
                              canPurchase: canPurchase,
                              nearExpiry: nearExpiry,
                              daysRemaining: daysRemaining,
                              expiresLabel: expiresLabel,
                              statusMessage: statusMessage,
                              isExpired: status == 'expired',
                              onSelect: _purchase,
                            ),
                        ],
                      ),
          ),
          if (_purchasing)
            Container(
              color: Colors.black.withValues(alpha: 0.25),
              child: const Center(
                child: CircularProgressIndicator(color: Colors.white),
              ),
            ),
        ],
      ),
    );
  }
}

enum _ReminderTone { warning, error }

class _ReminderBanner extends StatelessWidget {
  const _ReminderBanner({
    required this.tone,
    required this.title,
    required this.body,
  });

  final _ReminderTone tone;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    final isWarning = tone == _ReminderTone.warning;
    final bg = isWarning ? const Color(0xFFFFFBEB) : const Color(0xFFFEF2F2);
    final border = isWarning ? const Color(0xFFFDE68A) : const Color(0xFFFECACA);
    final fg = isWarning ? const Color(0xFF92400E) : const Color(0xFF991B1B);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            isWarning ? Icons.schedule_rounded : Icons.error_outline_rounded,
            color: fg,
            size: 22,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w800,
                    color: fg,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  body,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: fg.withValues(alpha: 0.9),
                    fontSize: 13,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _EmployerPackageCard extends StatelessWidget {
  const _EmployerPackageCard({
    required this.title,
    required this.priceInr,
    required this.durationDays,
    required this.features,
    required this.featured,
    required this.verified,
    required this.hasActive,
    required this.canPurchase,
    required this.nearExpiry,
    required this.onSelect,
    this.daysRemaining,
    this.expiresLabel,
    this.statusMessage,
    this.isExpired = false,
  });

  final String title;
  final int priceInr;
  final int durationDays;
  final List<String> features;
  final bool featured;
  final bool verified;
  final bool hasActive;
  final bool canPurchase;
  final bool nearExpiry;
  final bool isExpired;
  final int? daysRemaining;
  final String? expiresLabel;
  final String? statusMessage;
  final VoidCallback onSelect;

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final accent = featured ? const Color(0xFFD97706) : AppColors.primary;
    final badgeLabel = !verified
        ? 'Verify first'
        : hasActive
            ? (nearExpiry ? 'Expiring soon' : 'Active')
            : 'Renew';

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: featured ? accent : const Color(0xFFE2E8F0),
          width: featured ? 1.5 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              Container(
                margin: const EdgeInsets.only(left: 8),
                padding:
                    const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: accent.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  badgeLabel,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: accent,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '₹$priceInr',
                style: textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                  color: AppColors.textPrimary,
                  height: 1,
                ),
              ),
              const SizedBox(width: 8),
              Padding(
                padding: const EdgeInsets.only(bottom: 2),
                child: Text(
                  '$durationDays days',
                  style: textTheme.labelMedium?.copyWith(
                    color: AppColors.textHint,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          if (features.isNotEmpty) ...[
            const SizedBox(height: 14),
            ...features.take(5).map(
              (f) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.check_rounded, size: 16, color: accent),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        f,
                        style: textTheme.bodyMedium?.copyWith(
                          color: AppColors.textSecondary,
                          height: 1.3,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: 14),
          if (!verified)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFFFFBEB),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFDE68A)),
              ),
              child: Text(
                statusMessage?.isNotEmpty == true
                    ? statusMessage!
                    : 'Your company must be verified before you can purchase a plan.',
                style: textTheme.bodySmall?.copyWith(
                  color: const Color(0xFF92400E),
                  fontWeight: FontWeight.w600,
                  height: 1.35,
                ),
              ),
            )
          else if (hasActive)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: nearExpiry
                    ? const Color(0xFFFFFBEB)
                    : AppColors.success.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: nearExpiry
                      ? const Color(0xFFFDE68A)
                      : AppColors.success.withValues(alpha: 0.3),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    nearExpiry
                        ? Icons.schedule_rounded
                        : Icons.check_circle_rounded,
                    color: nearExpiry
                        ? const Color(0xFF92400E)
                        : AppColors.success,
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      [
                        nearExpiry
                            ? (daysRemaining == 1
                                ? 'Active — expires tomorrow.'
                                : 'Active — expires in ${daysRemaining ?? 0} days.')
                            : 'Your plan is active.',
                        if (expiresLabel != null) 'Valid until $expiresLabel.',
                        'You can purchase again after it expires.',
                      ].join(' '),
                      style: textTheme.bodyMedium?.copyWith(
                        color: nearExpiry
                            ? const Color(0xFF92400E)
                            : AppColors.success,
                        fontWeight: FontWeight.w700,
                        height: 1.35,
                      ),
                    ),
                  ),
                ],
              ),
            )
          else
            SizedBox(
              width: double.infinity,
              height: 46,
              child: FilledButton(
                onPressed: canPurchase ? onSelect : null,
                style: FilledButton.styleFrom(
                  backgroundColor: accent,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  isExpired ? 'Renew plan' : 'Purchase',
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
