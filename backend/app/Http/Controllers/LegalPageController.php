<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\View\View;

/**
 * Public legal pages — no auth. Must stay outside the admin SPA catch-all.
 */
class LegalPageController extends Controller
{
    public function terms(Request $request): View
    {
        return view('legal.terms', [
            'embed' => $request->boolean('embed'),
        ]);
    }

    public function privacyPolicy(Request $request): View
    {
        return view('legal.privacy-policy', [
            'embed' => $request->boolean('embed'),
        ]);
    }

    public function refundPolicy(Request $request): View
    {
        return view('legal.refund-policy', [
            'embed' => $request->boolean('embed'),
        ]);
    }
}
