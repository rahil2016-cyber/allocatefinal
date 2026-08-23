import 'dart:async';
import 'dart:io';

import 'package:app_links/app_links.dart';
import 'package:flutter/material.dart';
import 'package:play_install_referrer/play_install_referrer.dart';

import '../navigation/app_navigator.dart';
import '../screens/job_seeker/job_detail_screen.dart';
import '../services/app_session.dart';
import '../services/job_seeker_api_service.dart';
import '../services/referral_invite_service.dart';

/// Listens for job deep links and referral invite links.
class JobDeepLinkListener extends StatefulWidget {
  const JobDeepLinkListener({super.key, required this.child});

  final Widget child;

  @override
  State<JobDeepLinkListener> createState() => _JobDeepLinkListenerState();
}

class _JobDeepLinkListenerState extends State<JobDeepLinkListener> {
  final _appLinks = AppLinks();
  StreamSubscription<Uri>? _sub;
  bool _handlingJob = false;

  @override
  void initState() {
    super.initState();
    _initLinks();
    _captureInstallReferrer();
  }

  Future<void> _initLinks() async {
    try {
      final initial = await _appLinks.getInitialLink();
      if (initial != null) {
        await _handleUri(initial);
      }
    } catch (_) {}

    _sub = _appLinks.uriLinkStream.listen((uri) {
      _handleUri(uri);
    });
  }

  Future<void> _captureInstallReferrer() async {
    if (!Platform.isAndroid) return;
    try {
      final details = await PlayInstallReferrer.installReferrer;
      final raw = details.installReferrer;
      final code = ReferralInviteService.instance.codeFromInstallReferrer(raw);
      if (code != null) {
        await ReferralInviteService.instance.savePendingCode(code);
      }
    } catch (_) {
      // Referrer unavailable (sideload / already consumed) — ignore.
    }
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  String? _parseJobId(Uri uri) {
    if (uri.scheme == 'joballocate' && uri.host == 'job') {
      if (uri.pathSegments.isNotEmpty) {
        return uri.pathSegments.first;
      }
      final p = uri.path.replaceFirst('/', '');
      if (p.isNotEmpty) return p;
    }

    final segs = uri.pathSegments;
    if (segs.length >= 3 && segs[0] == 'share' && segs[1] == 'job') {
      return segs[2];
    }
    if (segs.length >= 2 && segs[0] == 'job') {
      return segs[1];
    }
    if (segs.length == 1 && segs[0] == 'job' && uri.queryParameters['id'] != null) {
      return uri.queryParameters['id'];
    }

    return null;
  }

  Future<void> _handleUri(Uri uri) async {
    final inviteCode = ReferralInviteService.instance.codeFromUri(uri);
    if (inviteCode != null) {
      await ReferralInviteService.instance.savePendingCode(inviteCode);
      return;
    }

    final jobId = _parseJobId(uri);
    if (jobId == null || jobId.isEmpty || _handlingJob) return;

    _handlingJob = true;
    try {
      final job = await JobSeekerApiService.instance.getJob(jobId);
      final nav = rootNavigatorKey.currentState;
      if (nav == null) return;

      await nav.push(
        MaterialPageRoute<void>(
          builder: (_) => JobDetailScreen(
            job: job,
            userId: AppSession.userId ?? 'guest',
            token: AppSession.token ?? '',
          ),
        ),
      );
    } catch (_) {
      // Job missing or network error — ignore silently.
    } finally {
      _handlingJob = false;
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
