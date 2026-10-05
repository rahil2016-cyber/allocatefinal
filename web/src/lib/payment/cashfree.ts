// Cashfree v3 Payment Gateway Web Integration
// JobAllocate Official Payment Utility

declare global {
  interface Window {
    Cashfree: any;
  }
}

export interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  environment?: "sandbox" | "production";
  returnUrl?: string;
  onSuccess?: (data: any) => void;
  onFailure?: (data: any) => void;
  onClose?: () => void;
}

/**
 * Dynamically loads the official Cashfree JS SDK v3
 */
export async function loadCashfreeSDK(environment: "sandbox" | "production" = "production"): Promise<any> {
  if (typeof window === "undefined") return null;

  if (window.Cashfree) {
    return window.Cashfree({
      mode: environment,
    });
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById("cashfree-js-sdk");
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        resolve(window.Cashfree({ mode: environment }));
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "cashfree-js-sdk";
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      try {
        const cashfree = window.Cashfree({ mode: environment });
        resolve(cashfree);
      } catch (err) {
        reject(err);
      }
    };
    script.onerror = (err) => {
      reject(new Error("Failed to load Cashfree payment gateway SDK: " + err));
    };

    document.head.appendChild(script);
  });
}

/**
 * Opens Cashfree Checkout Modal for instant UPI, Cards, Netbanking & Wallets
 */
export async function launchCashfreeCheckout({
  paymentSessionId,
  environment = "production",
  onSuccess,
  onFailure,
  onClose,
}: CashfreeCheckoutOptions): Promise<void> {
  try {
    const cashfree = await loadCashfreeSDK(environment);
    if (!cashfree) {
      throw new Error("Cashfree SDK failed to initialize.");
    }

    const checkoutOptions = {
      paymentSessionId,
      redirectTarget: "_modal",
    };

    cashfree.checkout(checkoutOptions).then((result: any) => {
      if (result.error) {
        if (onFailure) onFailure(result.error);
      } else if (result.redirect) {
        // Redirection handled by Cashfree
      } else if (result.paymentDetails) {
        if (onSuccess) onSuccess(result.paymentDetails);
      } else {
        if (onClose) onClose();
      }
    });
  } catch (err) {
    if (onFailure) onFailure(err);
    else throw err;
  }
}
