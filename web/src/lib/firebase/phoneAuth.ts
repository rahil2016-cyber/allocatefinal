// Firebase Configuration matching the mobile app (joballocate)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDjACaW-Ir5V8w8lvj0RWUKyb9jUU235_o",
  authDomain: "joballocate.firebaseapp.com",
  projectId: "joballocate",
  storageBucket: "joballocate.firebasestorage.app",
  messagingSenderId: "395622351897",
};

// Initialize Firebase once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

/**
 * Setup invisible reCAPTCHA verifier for Phone Auth with proper cleanup
 */
export function setupRecaptcha(containerId = "recaptcha-container"): RecaptchaVerifier {
  if (typeof window === "undefined") {
    throw new Error("Cannot initialize recaptcha on server.");
  }

  // Clear any existing verifier instance to prevent DOM/re-render collisions
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch {
      // ignore
    }
    window.recaptchaVerifier = undefined;
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: "invisible",
    callback: () => {
      // reCAPTCHA solved automatically
    },
    "expired-callback": () => {
      try {
        if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
      } catch {
        // ignore
      }
      window.recaptchaVerifier = undefined;
    },
  });

  window.recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Format 10-digit Indian phone number to E.164 (+91XXXXXXXXXX)
 */
export function formatToE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }
  if (phone.startsWith("+")) {
    return phone;
  }
  return `+91${digits.slice(-10)}`;
}

/**
 * Send real SMS OTP to phone using Firebase (Exact same provider as Flutter App)
 */
export async function sendFirebasePhoneOtp(rawPhone: string, containerId = "recaptcha-container"): Promise<ConfirmationResult> {
  const e164Phone = formatToE164(rawPhone);
  const verifier = setupRecaptcha(containerId);
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, e164Phone, verifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  } catch (err: any) {
    // Clean up verifier on error so subsequent attempts get a fresh instance
    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch {
        // ignore
      }
      window.recaptchaVerifier = undefined;
    }
    throw err;
  }
}

/**
 * Verify SMS code entered by user, returns Firebase ID token
 */
export async function verifyFirebasePhoneOtp(code: string): Promise<string> {
  if (!window.confirmationResult) {
    throw new Error("No active SMS verification session. Please request a new OTP.");
  }
  const userCredential = await window.confirmationResult.confirm(code);
  const idToken = await userCredential.user.getIdToken();
  return idToken;
}
