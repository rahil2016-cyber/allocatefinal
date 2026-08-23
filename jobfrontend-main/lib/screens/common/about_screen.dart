import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../services/contact_settings_service.dart';
import '../../utils/app_colors.dart';

/// Shared Contact / About screen for job seekers and employers.
/// Links come from admin Settings via GET /contact (not hardcoded).
class AboutScreen extends StatefulWidget {
  const AboutScreen({super.key});

  @override
  State<AboutScreen> createState() => _AboutScreenState();
}

class _AboutScreenState extends State<AboutScreen> {
  bool _loading = true;
  Map<String, String> _settings = ContactSettingsService.instance.defaults;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final data = await ContactSettingsService.instance.load(forceRefresh: true);
    if (!mounted) return;
    setState(() {
      _settings = data;
      _loading = false;
    });
  }

  Future<void> _launchUrl(String url) async {
    var trimmed = url.trim();
    if (trimmed.isEmpty) return;
    var uri = Uri.tryParse(trimmed);
    if (uri == null) return;
    if (!uri.hasScheme) {
      uri = Uri.tryParse('https://$trimmed');
    }
    if (uri == null) return;
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not open link'), backgroundColor: AppColors.error),
      );
    }
  }

  Future<void> _openWhatsApp(String phone) async {
    final digits = phone.replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) return;
    final withCountry = digits.length == 10 ? '91$digits' : digits;
    final configured = (_settings['whatsapp_url'] ?? '').trim();
    final url = configured.isNotEmpty
        ? configured
        : 'https://wa.me/$withCountry';
    await _launchUrl(url);
  }

  @override
  Widget build(BuildContext context) {
    final tt = Theme.of(context).textTheme;
    final phone = _settings['support_phone'] ?? '';
    final about = _settings['about_text'] ?? '';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Contact us'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              color: AppColors.primary,
              onRefresh: _load,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.work_rounded,
                        size: 60,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'JobAllocate',
                      style: tt.headlineMedium?.copyWith(
                        fontWeight: FontWeight.w900,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      about,
                      textAlign: TextAlign.center,
                      style: tt.bodyLarge?.copyWith(
                        color: AppColors.textSecondary,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 40),
                    _buildSectionTitle('Connect with us'),
                    const SizedBox(height: 16),
                    if (phone.trim().isNotEmpty)
                      _SocialTile(
                        icon: Icons.chat_bubble_outline_rounded,
                        label: 'WhatsApp',
                        color: const Color(0xFF25D366),
                        onTap: () => _openWhatsApp(phone),
                      ),
                    if ((_settings['youtube_url'] ?? '').trim().isNotEmpty)
                      _SocialTile(
                        icon: Icons.play_circle_fill_rounded,
                        label: 'YouTube',
                        color: const Color(0xFFFF0000),
                        onTap: () => _launchUrl(_settings['youtube_url']!),
                      ),
                    if ((_settings['facebook_url'] ?? '').trim().isNotEmpty)
                      _SocialTile(
                        icon: Icons.facebook,
                        label: 'Facebook',
                        color: const Color(0xFF1877F2),
                        onTap: () => _launchUrl(_settings['facebook_url']!),
                      ),
                    if ((_settings['instagram_url'] ?? '').trim().isNotEmpty)
                      _SocialTile(
                        icon: Icons.camera_alt_rounded,
                        label: 'Instagram',
                        color: const Color(0xFFE4405F),
                        onTap: () => _launchUrl(_settings['instagram_url']!),
                      ),
                    if ((_settings['linkedin_url'] ?? '').trim().isNotEmpty)
                      _SocialTile(
                        icon: Icons.business_rounded,
                        label: 'LinkedIn',
                        color: const Color(0xFF0A66C2),
                        onTap: () => _launchUrl(_settings['linkedin_url']!),
                      ),
                    if ((_settings['website_url'] ?? '').trim().isNotEmpty)
                      _SocialTile(
                        icon: Icons.language_rounded,
                        label: 'Official Website',
                        color: AppColors.primary,
                        onTap: () => _launchUrl(_settings['website_url']!),
                      ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Row(
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(width: 12),
        const Expanded(child: Divider()),
      ],
    );
  }
}

class _SocialTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _SocialTile({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFF1F5F9)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.02),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              const Icon(Icons.arrow_forward_ios_rounded,
                  size: 14, color: AppColors.textHint),
            ],
          ),
        ),
      ),
    );
  }
}
