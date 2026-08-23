<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

/**
 * Public referral invite link.
 * Opens the app with the code when installed; otherwise Play Store (with install referrer).
 */
class ReferralInviteLandingController extends Controller
{
    public const PLAY_STORE_BASE = 'https://play.google.com/store/apps/details?id=com.joballocate.in';

    public function show(Request $request, string $code): View
    {
        $code = strtoupper(trim($code));
        $scheme = 'joballocate';
        $deepLink = "{$scheme}://refer/{$code}";

        $referrer = rawurlencode('utm_source=joballocate&utm_medium=referral&utm_content='.$code);
        $playStore = self::PLAY_STORE_BASE.'&referrer='.$referrer;

        $intentUrl = 'intent://refer/'.$code
            .'#Intent;scheme='.$scheme
            .';S.browser_fallback_url='.rawurlencode($playStore)
            .';end';

        return view('share.invite', [
            'code' => $code,
            'deepLink' => $deepLink,
            'intentUrl' => $intentUrl,
            'playStoreUrl' => $playStore,
        ]);
    }
}
