import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:pdfrx/pdfrx.dart';
import 'package:share_plus/share_plus.dart';

import '../../services/app_session.dart';
import '../../utils/app_colors.dart';
import '../../utils/media_url.dart';
import '../../utils/screenshot_protection.dart';

class PdfViewScreen extends StatefulWidget {
  const PdfViewScreen({
    super.key,
    required this.title,
    required this.url,
  });

  final String title;
  final String url;

  @override
  State<PdfViewScreen> createState() => _PdfViewScreenState();
}

class _PdfViewScreenState extends State<PdfViewScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  File? _localFile;

  @override
  void initState() {
    super.initState();
    ScreenshotProtection.enable();
    _loadPdf();
  }

  @override
  void dispose() {
    ScreenshotProtection.disable();
    super.dispose();
  }

  Future<void> _loadPdf() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final rawUrl = widget.url.trim();
    final resolved = (MediaUrl.resolve(rawUrl) ?? rawUrl).trim();
    if (resolved.isEmpty) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Invalid or empty resume URL.';
        });
      }
      return;
    }

    final uri = Uri.tryParse(resolved);
    if (uri == null) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Invalid PDF URL format.';
        });
      }
      return;
    }

    try {
      final headers = <String, String>{
        'Accept': 'application/pdf, */*',
      };
      final token = AppSession.token;
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }

      final response = await http.get(uri, headers: headers).timeout(const Duration(seconds: 30));

      if (response.statusCode == 401) {
        throw Exception('Unauthorized (401). Please sign in again.');
      } else if (response.statusCode == 403) {
        throw Exception('Access denied (403). You do not have permission to view this resume.');
      } else if (response.statusCode == 404) {
        throw Exception('Resume file not found (404).');
      } else if (response.statusCode < 200 || response.statusCode >= 300) {
        throw Exception('Failed to download resume (HTTP ${response.statusCode}).');
      }

      final bytes = response.bodyBytes;
      if (bytes.isEmpty) {
        throw Exception('Received empty file from server.');
      }

      // Verify PDF magic header %PDF- (bytes: 0x25, 0x50, 0x44, 0x46, 0x2D)
      if (bytes.length < 5 ||
          bytes[0] != 0x25 ||
          bytes[1] != 0x50 ||
          bytes[2] != 0x44 ||
          bytes[3] != 0x46 ||
          bytes[4] != 0x2D) {
        throw Exception('The requested document is not a valid PDF file.');
      }

      final nonEmp = uri.pathSegments.where((s) => s.isNotEmpty);
      final safeName = nonEmp.isNotEmpty ? nonEmp.last : 'resume.pdf';
      final sanitizedName = safeName.replaceAll(RegExp(r'[^a-zA-Z0-9._-]'), '_');
      final tempDir = Directory.systemTemp;
      final file = File('${tempDir.path}/$sanitizedName');
      await file.writeAsBytes(bytes, flush: true);

      if (!mounted) return;
      setState(() {
        _localFile = file;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    }
  }

  Future<void> _sharePdf() async {
    final file = _localFile;
    if (file == null || !await file.exists()) return;
    try {
      await Share.shareXFiles(
        [XFile(file.path, mimeType: 'application/pdf')],
        text: widget.title,
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not share resume: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        elevation: 0,
        title: Text(widget.title, style: const TextStyle(fontWeight: FontWeight.w800)),
        actions: [
          if (_localFile != null)
            IconButton(
              icon: const Icon(Icons.share_rounded),
              tooltip: 'Share / Open externally',
              onPressed: _sharePdf,
            ),
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            tooltip: 'Reload',
            onPressed: _loadPdf,
          ),
        ],
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(color: AppColors.primary),
            SizedBox(height: 16),
            Text(
              'Downloading resume...',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
            ),
          ],
        ),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline_rounded, color: AppColors.error, size: 48),
              const SizedBox(height: 16),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _loadPdf,
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Try Again'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (_localFile != null) {
      return PdfViewer.file(
        _localFile!.path,
        params: PdfViewerParams(
          backgroundColor: AppColors.background,
          loadingBannerBuilder: (context, bytesDownloaded, totalBytes) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            );
          },
          errorBannerBuilder: (context, error, stackTrace, documentRef) {
            return Center(
              child: Text(
                'Error rendering PDF: $error',
                style: const TextStyle(color: AppColors.error),
              ),
            );
          },
        ),
      );
    }

    return const Center(child: Text('No PDF available'));
  }
}
