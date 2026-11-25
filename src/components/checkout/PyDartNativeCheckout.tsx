"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  CreditCard,
  ExternalLink,
  Landmark,
  Loader2,
  Lock,
  QrCode,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  TURKIYE_JAM_ENABLED_PYDART_RAILS,
  isPyDartRailEnabled,
  type PyDartPaymentRail,
} from "@/lib/pydartPay";
import {
  DEFAULT_ENABLED_CARD_NETWORKS,
  detectCardNetwork,
  escapeHtml,
  formatCardExpiryDisplay,
  formatCardNumberDisplay,
  getExpectedCvvLength,
  validateCardInput,
  type EnabledCardNetworks,
} from "@/lib/cardUtils";
import {
  AmexLogo,
  BankBrandIcon,
  MastercardLogo,
  RuPayLogo,
  UpiAppBrandIcon,
  UpiMark,
  VisaLogo,
  formatBankDisplayName,
} from "@/components/checkout/PaymentBrandLogos";

interface UpiDeepLinkApp {
  id: string;
  name: string;
  uri: string;
  tier: "primary" | "extended";
  accentHex?: string;
}

interface NetbankingBankOption {
  code: string;
  name: string;
}

interface CheckoutPayload {
  order: {
    id: string;
    short_code: string;
    environment: "sandbox" | "live";
    merchant_order_id: string;
    amount_paise: number;
    amount_decimal: string;
    amount_formatted?: string;
    currency: string;
    order_purpose: string;
    customer_name: string;
    customer_mobile?: string;
    customer_email?: string | null;
    status: string;
    payment_method: string | null;
    utr: string | null;
    receipt_number: string | null;
    paid_at: string | null;
    redirect_url: string | null;
    upstream_provider: string;
    upstream_order_id: string;
    upstream_session_id?: string | null;
    virtual_account_number: string | null;
    virtual_account_ifsc: string | null;
    razorpay_key_id: string | null;
    razorpay_account_id?: string | null;
  };
  merchant: {
    brand_name: string;
    legal_name: string;
    brand_hex_color?: string;
    logo_url?: string | null;
    beneficiary_name: string;
  };
  upi: {
    canonicalUpiUri?: string | null;
    apps?: UpiDeepLinkApp[];
    qrMatrix?: boolean[][] | null;
    qrImageDataUrl?: string | null;
    expiresAt?: string | null;
    isLiveBankBacked?: boolean;
  } | null;
  netbanking_banks?: NetbankingBankOption[];
  card_networks?: EnabledCardNetworks | null;
  smart_collect_enabled?: boolean;
}

interface RazorpayCustomInstance {
  createPayment: (payload: Record<string, unknown>) => void;
  on: (
    event: string,
    handler: (resp: {
      razorpay_payment_id?: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
      error?: { code?: string; description?: string; reason?: string };
    }) => void
  ) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayCustomInstance;
  }
}

export interface PyDartNativeCheckoutProps {
  pydartOrderId: string;
  variant?: "modal" | "standalone";
  initialAuthFailed?: boolean;
  enabledRails?: readonly PyDartPaymentRail[];
  onPaid?: (details: {
    pydartOrderId: string;
    merchantOrderId: string;
    utr?: string | null;
    receiptNumber?: string | null;
  }) => void;
  onSwitchToCod?: () => void;
}

const POPULAR_BANK_PRIORITY = [
  { code: "HDFC", short: "HDFC" },
  { code: "ICIC", short: "ICICI" },
  { code: "SBIN", short: "SBI" },
  { code: "UTIB", short: "Axis" },
  { code: "KKBK", short: "Kotak" },
  { code: "FDRL", short: "Federal" },
  { code: "BARB_R", short: "Bank of Baroda" },
  { code: "PUNB_R", short: "PNB" },
  { code: "UBIN", short: "Union Bank" },
  { code: "IDFB", short: "IDFC FIRST" },
  { code: "INDB", short: "IndusInd" },
  { code: "YESB", short: "Yes Bank" },
  { code: "SIBL", short: "South Indian" },
  { code: "IDIB", short: "Indian Bank" },
  { code: "IOBA", short: "IOB" },
  { code: "IBKL", short: "IDBI" },
] as const;

function formatAmountInr(paise: number, formatted?: string): string {
  if (formatted) return formatted;
  const rupees = paise / 100;
  return rupees.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(rupees) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function formatCountdown(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function PyDartNativeCheckout({
  pydartOrderId,
  variant = "modal",
  initialAuthFailed = false,
  enabledRails = TURKIYE_JAM_ENABLED_PYDART_RAILS,
  onPaid,
  onSwitchToCod,
}: PyDartNativeCheckoutProps) {
  const upiEnabled = isPyDartRailEnabled("upi", enabledRails);
  const netbankingEnabled = isPyDartRailEnabled("netbanking", enabledRails);
  const cardEnabled = isPyDartRailEnabled("card", enabledRails);
  const vanEnabled = isPyDartRailEnabled("van", enabledRails);
  const isUpiOnly = enabledRails.length === 1 && upiEnabled;

  const [bundle, setBundle] = useState<CheckoutPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PyDartPaymentRail>(enabledRails[0] ?? "upi");
  const [showExtendedUpi, setShowExtendedUpi] = useState(false);
  const [upiRefreshing, setUpiRefreshing] = useState(false);
  const [upiSecondsLeft, setUpiSecondsLeft] = useState<number | null>(null);

  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [selectedBankCode, setSelectedBankCode] = useState<string>("BARB_R");

  // White-label Card fields (browser-only, wiped on completion/unmount, never sent to our servers)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardErrors, setCardErrors] = useState<{
    number?: string;
    expiry?: string;
    cvv?: string;
    name?: string;
  }>({});
  const [rzpSdkState, setRzpSdkState] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [waitingMessage, setWaitingMessage] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(
    initialAuthFailed
      ? isUpiOnly
        ? "Payment was not completed. Please retry via UPI or switch to COD."
        : "Bank authorization was not completed. Please retry or choose another payment method."
      : null
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [vanGenerating, setVanGenerating] = useState(false);

  // Ref-stabilized parent callbacks so parent re-renders NEVER trigger checkout reloads or unmount inputs!
  const onPaidRef = useRef(onPaid);
  onPaidRef.current = onPaid;
  const loadedOrderIdRef = useRef<string | null>(null);

  const rzpInstanceRef = useRef<RazorpayCustomInstance | null>(null);
  const bankWinRef = useRef<Window | null>(null);
  const bankWinPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifiedPaidRef = useRef(false);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cardNumberRef = useRef<HTMLInputElement | null>(null);
  const cardExpiryRef = useRef<HTMLInputElement | null>(null);
  const cardCvvRef = useRef<HTMLInputElement | null>(null);
  const cardNameRef = useRef<HTMLInputElement | null>(null);

  const brandAccent = "#6E1625";

  const triggerPaidOnce = useCallback(
    (orderData: {
      id: string;
      merchant_order_id: string;
      utr?: string | null;
      receipt_number?: string | null;
      paid_at?: string | null;
      payment_method?: string | null;
    }) => {
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setWaitingMessage(null);
      setErrorBanner(null);
      setPendingAction(null);
      setBundle((prev) =>
        prev
          ? {
              ...prev,
              order: {
                ...prev.order,
                status: "paid",
                utr: orderData.utr ?? prev.order.utr,
                receipt_number: orderData.receipt_number ?? prev.order.receipt_number,
                paid_at: orderData.paid_at ?? prev.order.paid_at ?? new Date().toISOString(),
                payment_method: orderData.payment_method ?? prev.order.payment_method,
              },
            }
          : prev
      );
      if (!notifiedPaidRef.current) {
        notifiedPaidRef.current = true;
        onPaidRef.current?.({
          pydartOrderId: orderData.id,
          merchantOrderId: orderData.merchant_order_id,
          utr: orderData.utr,
          receiptNumber: orderData.receipt_number,
        });
      }
    },
    []
  );

  // Fetch full PyDart Pay checkout bundle strictly ONCE per unique pydartOrderId
  const loadFullCheckout = useCallback(
    async (force = false) => {
      if (!pydartOrderId) return;
      if (!force && loadedOrderIdRef.current === pydartOrderId) return;
      loadedOrderIdRef.current = pydartOrderId;

      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(
          `/api/pydart/checkout/${encodeURIComponent(pydartOrderId)}?full=1`,
          { cache: "no-store" }
        );
        const json = (await res.json().catch(() => null)) as {
          status?: string;
          data?: CheckoutPayload;
          error?: { message?: string };
        } | null;

        if (!res.ok || json?.status !== "SUCCESS" || !json.data?.order) {
          loadedOrderIdRef.current = null;
          setLoadError(json?.error?.message || "Could not load payment details. Please retry.");
          return;
        }

        const data = json.data;
        setBundle(data);
        setCardholderName((prev) => prev || data.order.customer_name || "");

        const banks = data.netbanking_banks ?? [];
        if (banks.length > 0) {
          const firstPopular = POPULAR_BANK_PRIORITY.find((p) =>
            banks.some((b) => b.code === p.code)
          );
          setSelectedBankCode(firstPopular?.code ?? banks[0].code);
        }

        if (data.upi?.expiresAt) {
          setUpiSecondsLeft(
            Math.max(0, Math.floor((Date.parse(data.upi.expiresAt) - Date.now()) / 1000))
          );
        }

        if (data.order.status === "paid") {
          triggerPaidOnce(data.order);
        }
      } catch {
        loadedOrderIdRef.current = null;
        setLoadError("Network error while loading payment options. Please retry.");
      } finally {
        setLoading(false);
      }
    },
    [pydartOrderId, triggerPaidOnce]
  );

  useEffect(() => {
    if (loadedOrderIdRef.current !== pydartOrderId) {
      notifiedPaidRef.current = false;
      rzpInstanceRef.current = null;
      void loadFullCheckout(false);
    }
  }, [pydartOrderId, loadFullCheckout]);

  // Wipe sensitive card inputs & clear timers on unmount
  useEffect(() => {
    return () => {
      if (bankWinPollRef.current) clearInterval(bankWinPollRef.current);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
    };
  }, []);

  // Authoritative status sync against PyDart Pay S2S
  const syncLiveStatusNow = useCallback(async () => {
    if (!pydartOrderId || notifiedPaidRef.current) return;
    try {
      const res = await fetch(
        `/api/pydart/checkout/${encodeURIComponent(pydartOrderId)}?sync=1`,
        { cache: "no-store" }
      );
      if (!res.ok) return;
      const json = (await res.json().catch(() => null)) as {
        data?: { order?: CheckoutPayload["order"] };
      } | null;
      const liveOrder = json?.data?.order;
      if (liveOrder?.status === "paid") {
        triggerPaidOnce(liveOrder);
      }
    } catch {
      // Retry on next tick
    }
  }, [pydartOrderId, triggerPaidOnce]);

  // Background polling + visibility/focus reconciliation while order is processing
  const orderStatus = bundle?.order.status;
  useEffect(() => {
    if (orderStatus !== "processing") return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void syncLiveStatusNow();
      }
    }, waitingMessage ? 2800 : 4500);

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void syncLiveStatusNow();
      }
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [orderStatus, waitingMessage, syncLiveStatusNow]);

  // UPI QR countdown ticker
  const upiExpiresAt = bundle?.upi?.expiresAt;
  useEffect(() => {
    if (!upiExpiresAt || orderStatus === "paid") return;
    const tick = () => {
      setUpiSecondsLeft(Math.max(0, Math.floor((Date.parse(upiExpiresAt) - Date.now()) / 1000)));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [upiExpiresAt, orderStatus]);

  // Listen for Bank/3DS completion message from same-origin or PyDart Pay callback popup
  useEffect(() => {
    const handlePopupMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin &&
        event.origin !== "https://pydart.com"
      ) {
        return;
      }
      const msg = event.data as {
        type?: string;
        orderId?: string;
        status?: "paid" | "failed" | "pending";
        error?: string | null;
      } | null;
      if (!msg || msg.type !== "PYDART_BANK_AUTH_DONE" || msg.orderId !== pydartOrderId) return;

      if (bankWinPollRef.current) {
        clearInterval(bankWinPollRef.current);
        bankWinPollRef.current = null;
      }
      try {
        if (bankWinRef.current && !bankWinRef.current.closed) bankWinRef.current.close();
      } catch {}
      bankWinRef.current = null;
      setPendingAction(null);

      if (msg.status === "failed") {
        setWaitingMessage(null);
        setErrorBanner(
          msg.error || "Bank authorization was declined or cancelled. Try again or pay via UPI."
        );
      }
      void syncLiveStatusNow();
    };

    window.addEventListener("message", handlePopupMessage);
    return () => window.removeEventListener("message", handlePopupMessage);
  }, [pydartOrderId, syncLiveStatusNow]);

  // Razorpay Custom Checkout (`razorpay.js`) callbacks via refs
  const cardSuccessRef = useRef<
    (resp: {
      razorpay_payment_id?: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    }) => Promise<void>
  >(async () => {});
  const cardErrorRef = useRef<
    (resp: { error?: { description?: string } }) => void
  >(() => {});

  cardSuccessRef.current = async (resp) => {
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");

    if (!resp.razorpay_payment_id || !resp.razorpay_signature || !bundle) {
      setPendingAction(null);
      void syncLiveStatusNow();
      return;
    }

    setPendingAction("verifying_card");
    setWaitingMessage("Confirming card payment with your bank…");
    try {
      const verifyRes = await fetch(
        `/api/pydart/checkout/${encodeURIComponent(bundle.order.id)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "razorpay_callback",
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_order_id: resp.razorpay_order_id || bundle.order.upstream_order_id,
            razorpay_signature: resp.razorpay_signature,
          }),
        }
      );
      const json = (await verifyRes.json().catch(() => null)) as {
        status?: string;
        data?: { utr?: string; receipt_number?: string; paid_at?: string; payment_method?: string };
        error?: { message?: string };
      } | null;

      if (!verifyRes.ok || json?.status !== "SUCCESS") {
        setErrorBanner(json?.error?.message || "Confirming payment with your bank…");
        void syncLiveStatusNow();
      } else {
        triggerPaidOnce({
          id: bundle.order.id,
          merchant_order_id: bundle.order.merchant_order_id,
          utr: json.data?.utr,
          receipt_number: json.data?.receipt_number,
          paid_at: json.data?.paid_at,
          payment_method: json.data?.payment_method || "card",
        });
      }
    } catch {
      setErrorBanner("Checking card confirmation status…");
      void syncLiveStatusNow();
    } finally {
      setPendingAction(null);
    }
  };

  cardErrorRef.current = (resp) => {
    setPendingAction(null);
    setWaitingMessage(null);
    const reason =
      resp?.error?.description ||
      "Card payment could not be completed. Please check your details or pay via UPI.";
    setErrorBanner(reason);
  };

  // Lazy-load headless `razorpay.js` directly on `turkiyejam.com` with 100% same-origin callback_url
  const rzpOrderId = bundle?.order.id;
  const rzpKeyId = bundle?.order.razorpay_key_id;
  const rzpAccountId = bundle?.order.razorpay_account_id;
  const rzpEnv = bundle?.order.environment;
  const rzpProvider = bundle?.order.upstream_provider;

  const initializeRazorpaySdk = useCallback(() => {
    if (
      !rzpOrderId ||
      rzpEnv !== "live" ||
      rzpProvider !== "razorpay" ||
      !rzpKeyId ||
      orderStatus !== "processing"
    ) {
      return;
    }

    const bind = () => {
      if (!window.Razorpay) {
        setRzpSdkState("error");
        return;
      }
      if (rzpInstanceRef.current) {
        setRzpSdkState("ready");
        return;
      }
      try {
        // 100% same-origin callback_url on turkiyejam.com — zero pydart.com URL sent to Razorpay!
        const callbackUrl = `${window.location.origin}/api/pydart/checkout/${encodeURIComponent(
          rzpOrderId
        )}/callback?mode=popup`;
        const opts: Record<string, unknown> = {
          key: rzpKeyId,
          image: `${window.location.origin}/apple-touch-icon.png`,
          callback_url: callbackUrl,
          redirect: false,
        };
        if (rzpAccountId) {
          opts.account_id = rzpAccountId;
        }
        const instance = new window.Razorpay(opts);
        instance.on("payment.success", (r) => void cardSuccessRef.current(r));
        instance.on("payment.error", (r) => cardErrorRef.current(r));
        instance.on("payment.failure", (r) => cardErrorRef.current(r));
        rzpInstanceRef.current = instance;
        setRzpSdkState("ready");
      } catch {
        setRzpSdkState("error");
      }
    };

    if (window.Razorpay) {
      bind();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-pydart-rzp-firstparty="1"]'
    );
    if (existing) {
      setRzpSdkState("loading");
      existing.addEventListener("load", bind, { once: true });
      existing.addEventListener("error", () => setRzpSdkState("error"), { once: true });
      return;
    }

    setRzpSdkState("loading");
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/razorpay.js";
    script.async = true;
    script.dataset.pydartRzpFirstparty = "1";
    script.onload = bind;
    script.onerror = () => setRzpSdkState("error");
    document.body.appendChild(script);
  }, [rzpOrderId, rzpEnv, rzpProvider, rzpKeyId, rzpAccountId, orderStatus]);

  useEffect(() => {
    if (cardEnabled && activeTab === "card" && orderStatus === "processing") {
      initializeRazorpaySdk();
    }
  }, [cardEnabled, activeTab, orderStatus, initializeRazorpaySdk]);

  const cardNetworks = bundle?.card_networks ?? DEFAULT_ENABLED_CARD_NETWORKS;
  const netbankingBanks = bundle?.netbanking_banks ?? [];
  const detectedNetwork = useMemo(() => detectCardNetwork(cardNumber), [cardNumber]);

  const popularBanks = useMemo(() => {
    const map = new Map(netbankingBanks.map((b) => [b.code, b]));
    return POPULAR_BANK_PRIORITY.filter((p) => map.has(p.code))
      .slice(0, 6)
      .map((p) => ({ ...p, name: map.get(p.code)!.name }));
  }, [netbankingBanks]);

  const filteredBanks = useMemo(() => {
    const q = bankSearchQuery.trim().toLowerCase();
    if (!q) return netbankingBanks;
    return netbankingBanks.filter(
      (b) => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q)
    );
  }, [netbankingBanks, bankSearchQuery]);

  const selectedBankDisplayName = useMemo(() => {
    const found = netbankingBanks.find((b) => b.code === selectedBankCode);
    return found ? formatBankDisplayName(found.name) : "Selected Bank";
  }, [netbankingBanks, selectedBankCode]);

  const primaryUpiApps = useMemo(
    () => (bundle?.upi?.apps ?? []).filter((a) => a.tier === "primary"),
    [bundle?.upi?.apps]
  );
  const extendedUpiApps = useMemo(
    () => (bundle?.upi?.apps ?? []).filter((a) => a.tier === "extended"),
    [bundle?.upi?.apps]
  );

  const refreshUpiQr = async () => {
    if (!bundle || upiRefreshing) return;
    setErrorBanner(null);
    setUpiRefreshing(true);
    try {
      const res = await fetch(
        `/api/pydart/checkout/${encodeURIComponent(bundle.order.id)}/upi-session`,
        { method: "POST" }
      );
      const json = (await res.json().catch(() => null)) as {
        status?: string;
        data?: {
          intent_url?: string | null;
          qr_image_data_url?: string | null;
          expires_at?: string | null;
          apps?: UpiDeepLinkApp[];
          qr_matrix?: boolean[][] | null;
        };
        error?: { message?: string };
      } | null;

      if (!res.ok || json?.status !== "SUCCESS" || !json.data) {
        setErrorBanner(json?.error?.message || "Could not refresh UPI QR right now.");
        return;
      }

      setBundle((prev) =>
        prev
          ? {
              ...prev,
              upi: {
                canonicalUpiUri: json.data?.intent_url ?? null,
                qrImageDataUrl: json.data?.qr_image_data_url ?? null,
                expiresAt: json.data?.expires_at ?? null,
                apps: json.data?.apps ?? [],
                qrMatrix: json.data?.qr_matrix ?? null,
                isLiveBankBacked: true,
              },
            }
          : prev
      );
    } catch {
      setErrorBanner("Network error while refreshing UPI QR.");
    } finally {
      setUpiRefreshing(false);
    }
  };

  const handleUpiAppClick = async (app: UpiDeepLinkApp) => {
    if (!bundle) return;
    setErrorBanner(null);
    if (upiSecondsLeft !== null && upiSecondsLeft <= 15) {
      await refreshUpiQr();
    }
    const uri = app.uri || bundle.upi?.canonicalUpiUri;
    if (!uri) {
      setErrorBanner("UPI session expired. Tap Refresh QR and retry.");
      return;
    }
    setWaitingMessage(
      `Waiting for ${app.name}. Complete the payment in your UPI app — we’ll confirm automatically.`
    );
    window.location.href = uri;
  };

  const handleNetbankingPay = async () => {
    if (!bundle || !selectedBankCode || pendingAction) return;
    setErrorBanner(null);
    setPendingAction("netbanking");

    const winName = `pydart_bank_${Date.now()}`;
    const authWin = window.open(
      "about:blank",
      winName,
      "width=560,height=740,scrollbars=yes,resizable=yes"
    );
    if (authWin) {
      bankWinRef.current = authWin;
      try {
        const safeBank = escapeHtml(selectedBankDisplayName);
        authWin.document.open();
        authWin.document.write(
          `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Connecting to ${safeBank} · PyDart Pay</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#FBF8F3;color:#1B1714;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;text-align:center;padding:24px}.box{max-width:340px;background:#fff;border:1px solid #E7E1D8;border-radius:18px;padding:26px 22px}.spin{width:34px;height:34px;border:3px solid #E7E1D8;border-top-color:#6E1625;border-radius:50%;margin:0 auto 14px;animation:s .8s linear infinite}@keyframes s{to{transform:rotate(360deg)}}h1{margin:0 0 6px;font-size:16px;font-weight:700}p{margin:0;font-size:12px;color:#655B53;line-height:1.5}</style></head><body><div class="box"><div class="spin"></div><h1>Connecting to ${safeBank}</h1><p>Opening your bank’s official NetBanking login page…</p></div></body></html>`
        );
        authWin.document.close();
      } catch {}
    }

    try {
      const res = await fetch(
        `/api/pydart/checkout/${encodeURIComponent(bundle.order.id)}/netbanking-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bank: selectedBankCode,
            return_mode: authWin ? "popup" : "self",
            return_origin: window.location.origin,
          }),
        }
      );
      const json = (await res.json().catch(() => null)) as {
        status?: string;
        data?: {
          redirect_method: "GET" | "POST";
          redirect_url: string;
          form_fields: Record<string, string>;
        };
        error?: { message?: string };
      } | null;

      if (!res.ok || json?.status !== "SUCCESS" || !json.data?.redirect_url) {
        try {
          if (authWin && !authWin.closed) authWin.close();
        } catch {}
        bankWinRef.current = null;
        setErrorBanner(
          json?.error?.message || "Selected bank is temporarily unavailable. Try another bank or UPI."
        );
        return;
      }

      const { redirect_method, redirect_url, form_fields } = json.data;
      setWaitingMessage(
        `Complete login on ${selectedBankDisplayName}’s portal. Confirmation will appear here automatically.`
      );

      if (authWin && !authWin.closed) {
        if (redirect_method === "POST") {
          const doc = authWin.document;
          const form = doc.createElement("form");
          form.method = "POST";
          form.action = redirect_url;
          form.style.display = "none";
          for (const [k, v] of Object.entries(form_fields || {})) {
            const input = doc.createElement("input");
            input.type = "hidden";
            input.name = k;
            input.value = v;
            form.appendChild(input);
          }
          doc.body.appendChild(form);
          form.submit();
        } else {
          authWin.location.replace(redirect_url);
        }

        if (bankWinPollRef.current) clearInterval(bankWinPollRef.current);
        bankWinPollRef.current = setInterval(() => {
          if (!bankWinRef.current || bankWinRef.current.closed) {
            if (bankWinPollRef.current) {
              clearInterval(bankWinPollRef.current);
              bankWinPollRef.current = null;
            }
            bankWinRef.current = null;
            void syncLiveStatusNow();
          }
        }, 800);
      } else if (redirect_method === "POST") {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = redirect_url;
        form.style.display = "none";
        for (const [k, v] of Object.entries(form_fields || {})) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = k;
          input.value = v;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } else {
        window.location.href = redirect_url;
      }
    } catch {
      try {
        if (authWin && !authWin.closed) authWin.close();
      } catch {}
      bankWinRef.current = null;
      setErrorBanner("Could not connect to your bank. Please retry or use UPI.");
    } finally {
      setPendingAction(null);
    }
  };

  // Smooth Backspace handling across " / " separator in MM / YY input
  const handleExpiryKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && cardExpiry.endsWith(" / ")) {
      e.preventDefault();
      setCardExpiry(cardExpiry.slice(0, -4));
    }
  };

  const handleCardSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bundle || pendingAction) return;
    setErrorBanner(null);

    const validation = validateCardInput({
      number: cardNumber,
      expiry: cardExpiry,
      cvv: cardCvv,
      name: cardholderName,
      enabledNetworks: cardNetworks,
    });

    if (!validation.valid) {
      setCardErrors(validation.errors);
      if (validation.errors.number) cardNumberRef.current?.focus();
      else if (validation.errors.expiry) cardExpiryRef.current?.focus();
      else if (validation.errors.cvv) cardCvvRef.current?.focus();
      else if (validation.errors.name) cardNameRef.current?.focus();
      return;
    }
    setCardErrors({});

    if (!rzpInstanceRef.current) {
      initializeRazorpaySdk();
      setErrorBanner("Connecting to card network… please tap Pay again in a second.");
      return;
    }

    setPendingAction("card_3ds");
    setWaitingMessage(
      "Opening your bank’s 3D-Secure OTP verification. We’ll confirm your order automatically."
    );

    try {
      const payload: Record<string, unknown> = {
        amount: bundle.order.amount_paise,
        currency: bundle.order.currency || "INR",
        email: bundle.order.customer_email?.trim() || "support@turkiyejam.com",
        contact: bundle.order.customer_mobile?.trim() || "+919876543210",
        order_id: bundle.order.upstream_order_id,
        method: "card",
        "card[name]": validation.cardholderName,
        "card[number]": validation.digits,
        "card[expiry_month]": validation.expiryMonth,
        "card[expiry_year]": validation.expiryYear2,
        "card[cvv]": validation.cvv,
        notes: {
          pydart_order_id: bundle.order.id,
          merchant_order_id: bundle.order.merchant_order_id,
        },
      };
      if (bundle.order.razorpay_account_id) {
        payload.account_id = bundle.order.razorpay_account_id;
      }
      rzpInstanceRef.current.createPayment(payload);
    } catch {
      setPendingAction(null);
      setWaitingMessage(null);
      setErrorBanner("Could not initiate card verification. Please retry or use UPI.");
    }
  };

  const handleGenerateVan = async () => {
    if (!bundle || vanGenerating) return;
    setErrorBanner(null);
    setVanGenerating(true);
    try {
      const res = await fetch(
        `/api/pydart/checkout/${encodeURIComponent(bundle.order.id)}/bank-transfer-session`,
        { method: "POST" }
      );
      const json = (await res.json().catch(() => null)) as {
        status?: string;
        data?: { account_number?: string; ifsc?: string };
        error?: { message?: string };
      } | null;

      if (!res.ok || json?.status !== "SUCCESS" || !json.data?.account_number || !json.data?.ifsc) {
        setErrorBanner(json?.error?.message || "Bank transfer is unavailable right now.");
        return;
      }
      setBundle((prev) =>
        prev
          ? {
              ...prev,
              order: {
                ...prev.order,
                virtual_account_number: json.data!.account_number!,
                virtual_account_ifsc: json.data!.ifsc!,
              },
            }
          : prev
      );
    } catch {
      setErrorBanner("Network error generating virtual bank account.");
    } finally {
      setVanGenerating(false);
    }
  };

  const copyField = (key: string, value: string) => {
    void navigator.clipboard?.writeText(value);
    setCopiedField(key);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-5 space-y-4">
        {!isUpiOnly && (
          <div className="grid grid-cols-3 gap-2">
            <div className="h-10 rounded-xl bg-stone-100 animate-pulse" />
            <div className="h-10 rounded-xl bg-stone-100 animate-pulse" />
            <div className="h-10 rounded-xl bg-stone-100 animate-pulse" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="h-12 rounded-xl bg-stone-100 animate-pulse" />
          <div className="h-12 rounded-xl bg-stone-100 animate-pulse" />
          <div className="h-12 rounded-xl bg-stone-100 animate-pulse" />
          <div className="h-12 rounded-xl bg-stone-100 animate-pulse" />
        </div>
        <div className="mx-auto h-40 w-40 rounded-2xl bg-stone-100 animate-pulse" />
        <p className="text-center text-xs text-[#655B53]">
          {isUpiOnly ? "Loading UPI payment options…" : "Loading UPI, NetBanking & Card options…"}
        </p>
      </div>
    );
  }

  if (loadError || !bundle) {
    return (
      <div className="p-6 text-center space-y-3">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
        <p className="text-sm font-semibold text-[#1B1714]">Could not load payment session</p>
        <p className="text-xs text-[#655B53]">{loadError || "Order not found."}</p>
        <button
          type="button"
          onClick={() => void loadFullCheckout(true)}
          className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-[#6E1625] px-5 text-xs font-semibold text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const { order, merchant, upi } = bundle;
  const amountFormatted = formatAmountInr(order.amount_paise, order.amount_formatted);
  const hasRealVan = Boolean(order.virtual_account_number && order.virtual_account_ifsc);
  const showVanTab = order.currency === "INR" && (hasRealVan || Boolean(bundle.smart_collect_enabled));

  if (order.status === "paid") {
    return (
      <div className="p-6 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Payment Confirmed
          </p>
          <p className="mt-1 text-2xl font-bold text-[#1B1714] tabular-nums">₹{amountFormatted}</p>
          <p className="mt-0.5 text-xs text-[#655B53]">Paid to {merchant.brand_name}</p>
        </div>
        <dl className="space-y-2 rounded-xl border border-stone-200 bg-[#FBF8F3] p-4 text-left text-xs tabular-nums">
          <div className="flex justify-between gap-3">
            <dt className="text-[#655B53]">Reference</dt>
            <dd className="font-mono font-semibold text-[#1B1714]">{order.merchant_order_id}</dd>
          </div>
          {order.utr && (
            <div className="flex justify-between gap-3">
              <dt className="text-[#655B53]">UTR / Ref</dt>
              <dd className="font-mono font-semibold text-[#1B1714]">{order.utr}</dd>
            </div>
          )}
          {order.receipt_number && (
            <div className="flex justify-between gap-3">
              <dt className="text-[#655B53]">Receipt</dt>
              <dd className="font-mono font-semibold text-[#1B1714]">{order.receipt_number}</dd>
            </div>
          )}
        </dl>
        {variant === "standalone" && (
          <Link
            href={order.redirect_url || "/orders"}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#6E1625] px-5 text-xs font-semibold text-white"
          >
            <span>Continue to Turkiye Jam</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    );
  }

  const tabs: Array<{ id: PyDartPaymentRail; label: string }> = [];
  if (upiEnabled) tabs.push({ id: "upi", label: "UPI" });
  if (netbankingEnabled) tabs.push({ id: "netbanking", label: "NetBanking" });
  if (cardEnabled) tabs.push({ id: "card", label: "Cards" });
  if (vanEnabled && showVanTab) tabs.push({ id: "van", label: "NEFT / IMPS" });

  const resolvedActiveTab: PyDartPaymentRail = tabs.some((t) => t.id === activeTab)
    ? activeTab
    : (tabs[0]?.id ?? "upi");

  const qrSize = upi?.qrMatrix?.length ?? 0;
  const qrViewBox = qrSize + 4;

  return (
    <div className={variant === "modal" ? "p-4 space-y-4" : "p-4 sm:p-6 space-y-4"}>
      {/* Standalone Order Payable Summary Strip */}
      {variant === "standalone" && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-[#FBF8F3] px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-[#1B1714]">{order.order_purpose}</p>
            <p className="mt-0.5 truncate text-[11px] text-[#655B53]">
              {order.customer_name} · <span className="font-mono">{order.merchant_order_id}</span>
            </p>
          </div>
          <div className="shrink-0 text-right tabular-nums">
            <p className="text-[10px] font-medium uppercase tracking-wide text-[#655B53]">Total</p>
            <p className="text-lg font-bold text-[#1B1714]">₹{amountFormatted}</p>
          </div>
        </div>
      )}

      {/* Waiting Banner */}
      {waitingMessage && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/85 px-3.5 py-2.5 text-xs text-emerald-950"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-emerald-700" />
            <span>{waitingMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => void syncLiveStatusNow()}
            className="shrink-0 cursor-pointer rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-emerald-900"
          >
            Check
          </button>
        </div>
      )}

      {/* Single Clean Error Banner (Zero Duplicate Stacked Boxes) */}
      {errorBanner && (
        <div
          role="alert"
          className="flex items-start justify-between gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-900"
        >
          <div className="flex items-start gap-2 min-w-0">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            <span className="leading-snug">{errorBanner}</span>
          </div>
          {onSwitchToCod && (
            <button
              type="button"
              onClick={onSwitchToCod}
              className="shrink-0 cursor-pointer rounded-lg border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#6E1625] hover:bg-rose-50"
            >
              Switch to COD
            </button>
          )}
        </div>
      )}

      {/* Payment Rail Tabs (Hidden automatically in UPI-only single-rail mode) */}
      {tabs.length > 1 && (
        <div
          role="tablist"
          aria-label="Choose payment method"
          className={`grid gap-1 rounded-xl bg-stone-100 p-1 ${
            tabs.length === 4 ? "grid-cols-4" : tabs.length === 2 ? "grid-cols-2" : "grid-cols-3"
          }`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              aria-selected={resolvedActiveTab === tab.id}
              onClick={() => {
                setErrorBanner(null);
                setActiveTab(tab.id);
              }}
              className={`flex min-h-[42px] cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-semibold transition-colors duration-100 ${
                resolvedActiveTab === tab.id
                  ? "bg-white text-[#1B1714] shadow-[0_1px_3px_rgba(27,23,20,0.1)]"
                  : "text-[#655B53] hover:text-[#1B1714]"
              }`}
            >
              {tab.id === "upi" ? (
                <>
                  <UpiMark className="h-3.5 w-auto" />
                  <span className="sr-only">UPI</span>
                </>
              ) : tab.id === "netbanking" ? (
                <>
                  <Landmark className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">NetBanking</span>
                </>
              ) : tab.id === "card" ? (
                <>
                  <CreditCard className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">Cards</span>
                </>
              ) : (
                <>
                  <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">NEFT / IMPS</span>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {/* TAB 1: UPI APPS (ALL 19 AUTHENTIC LOGOS) + LIVE DYNAMIC QR */}
      {upiEnabled && resolvedActiveTab === "upi" && (
        <div className="space-y-4">
          {primaryUpiApps.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-[#1B1714]">Pay with UPI App</p>
                <UpiMark className="h-3.5 w-auto opacity-85" />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {primaryUpiApps.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    disabled={upiRefreshing}
                    onClick={() => void handleUpiAppClick(app)}
                    className="flex min-h-[50px] cursor-pointer items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white px-3 text-left text-[13px] font-semibold text-[#1B1714] shadow-[0_1px_2px_rgba(27,23,20,0.03)] transition-colors hover:border-stone-300 hover:bg-stone-50 active:scale-[0.98]"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <UpiAppBrandIcon
                        appId={app.id}
                        name={app.name}
                        accentHex={app.accentHex}
                        size={28}
                      />
                      <span className="truncate">{app.name}</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-stone-300" aria-hidden="true" />
                  </button>
                ))}
              </div>

              {extendedUpiApps.length > 0 && (
                <div className="mt-2">
                  <button
                    type="button"
                    aria-expanded={showExtendedUpi}
                    onClick={() => setShowExtendedUpi((v) => !v)}
                    className="inline-flex min-h-[38px] cursor-pointer items-center gap-1 text-xs font-semibold text-[#655B53] hover:text-[#1B1714]"
                  >
                    <span>{showExtendedUpi ? "Show fewer UPI apps" : "More UPI apps"}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-150 ${
                        showExtendedUpi ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {showExtendedUpi && (
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      {extendedUpiApps.map((app) => (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => void handleUpiAppClick(app)}
                          className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-xl border border-stone-200 bg-white px-2.5 text-left text-xs font-medium text-[#1B1714] hover:border-stone-300 hover:bg-stone-50"
                        >
                          <UpiAppBrandIcon
                            appId={app.id}
                            name={app.name}
                            accentHex={app.accentHex}
                            size={24}
                          />
                          <span className="truncate">{app.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Scannable Dynamic UPI QR */}
          <div className="rounded-2xl border border-stone-200/90 bg-[#FBF8F3] p-4">
            <div className="flex flex-col items-center gap-3.5 sm:flex-row sm:items-center">
              <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white p-2 shadow-xs">
                {upi?.qrMatrix && qrSize > 0 ? (
                  <svg
                    viewBox={`0 0 ${qrViewBox} ${qrViewBox}`}
                    className="h-full w-full"
                    role="img"
                    aria-label={`UPI QR code to pay ₹${amountFormatted}`}
                  >
                    <rect width={qrViewBox} height={qrViewBox} fill="#FFFFFF" />
                    {upi.qrMatrix.map((row, y) =>
                      row.map((cell, x) =>
                        cell ? (
                          <rect
                            key={`${x}-${y}`}
                            x={x + 2}
                            y={y + 2}
                            width={1}
                            height={1}
                            fill="#0F172A"
                          />
                        ) : null
                      )
                    )}
                  </svg>
                ) : upi?.qrImageDataUrl ? (
                  <img
                    src={upi.qrImageDataUrl}
                    alt={`UPI QR code to pay ₹${amountFormatted}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <QrCode className="h-10 w-10 text-stone-300" />
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <p className="text-xs font-semibold text-[#1B1714]">Scan QR with any UPI App</p>
                <p className="text-[11px] leading-relaxed text-[#655B53]">
                  Open Google Pay, PhonePe, Paytm, or BHIM and scan to pay{" "}
                  <strong className="font-semibold text-[#1B1714]">₹{amountFormatted}</strong>.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                  {upiSecondsLeft !== null && (
                    <span className="rounded-md border border-stone-200 bg-white px-2 py-1 font-mono text-[11px] font-semibold text-[#1B1714] tabular-nums">
                      Valid {formatCountdown(upiSecondsLeft)}
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={upiRefreshing}
                    onClick={() => void refreshUpiQr()}
                    className="inline-flex min-h-[32px] cursor-pointer items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 text-[11px] font-semibold text-[#1B1714] hover:bg-stone-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${upiRefreshing ? "animate-spin" : ""}`} />
                    Refresh QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECT-TO-BANK NETBANKING (AUTHENTIC INDIAN BANK LOGOS + SEARCH) */}
      {netbankingEnabled && resolvedActiveTab === "netbanking" && (
        <div className="space-y-3.5">
          {popularBanks.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#1B1714]">Popular Banks</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {popularBanks.map((bank) => {
                  const selected = selectedBankCode === bank.code;
                  return (
                    <button
                      key={bank.code}
                      type="button"
                      onClick={() => setSelectedBankCode(bank.code)}
                      className={`flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-xl border px-3 text-left text-xs font-semibold transition-colors active:scale-[0.98] ${
                        selected
                          ? "border-[#6E1625] bg-[#FBF8F3] text-[#1B1714] ring-1 ring-[#6E1625]"
                          : "border-stone-200 bg-white text-[#1B1714] hover:border-stone-300 hover:bg-stone-50"
                      }`}
                    >
                      <BankBrandIcon code={bank.code} name={bank.name} size={28} />
                      <span className="truncate">{bank.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="tj-nb-search" className="text-xs font-semibold text-[#1B1714]">
                All Supported Banks ({netbankingBanks.length})
              </label>
              {bankSearchQuery && (
                <button
                  type="button"
                  onClick={() => setBankSearchQuery("")}
                  className="cursor-pointer text-[11px] font-medium text-[#655B53] hover:text-[#1B1714]"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                id="tj-nb-search"
                type="search"
                value={bankSearchQuery}
                onChange={(e) => setBankSearchQuery(e.target.value)}
                placeholder={`Search ${netbankingBanks.length} supported banks…`}
                className="min-h-[44px] w-full rounded-xl border border-stone-200 bg-white py-2 pr-3 pl-9 text-base font-medium text-[#1B1714] outline-none placeholder:text-stone-400 focus:border-[#6E1625] sm:text-xs"
              />
            </div>

            <div
              role="listbox"
              aria-label="Supported NetBanking banks"
              className="mt-2 max-h-[184px] divide-y divide-stone-100 overflow-y-auto rounded-xl border border-stone-200 bg-white"
            >
              {filteredBanks.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-[#655B53]">
                  No banks matched “{bankSearchQuery}”. Try UPI or Card.
                </p>
              ) : (
                filteredBanks.map((bank) => {
                  const selected = selectedBankCode === bank.code;
                  return (
                    <button
                      key={bank.code}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => setSelectedBankCode(bank.code)}
                      className={`flex min-h-[46px] w-full cursor-pointer items-center justify-between gap-2.5 px-3 text-left text-xs ${
                        selected
                          ? "bg-[#FBF8F3] font-semibold text-[#1B1714]"
                          : "font-medium text-[#3D352F] hover:bg-stone-50"
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <BankBrandIcon code={bank.code} name={bank.name} size={26} />
                        <span className="truncate">{formatBankDisplayName(bank.name)}</span>
                      </span>
                      {selected && <Check className="h-4 w-4 shrink-0 text-[#116A4B]" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={Boolean(pendingAction) || !selectedBankCode}
            onClick={() => void handleNetbankingPay()}
            style={{ backgroundColor: brandAccent }}
            className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-95 active:scale-[0.98] disabled:opacity-60"
          >
            {pendingAction === "netbanking" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting to {selectedBankDisplayName}…</span>
              </>
            ) : (
              <>
                <Landmark className="h-4 w-4 shrink-0" />
                <span className="truncate">
                  Pay ₹{amountFormatted} via {selectedBankDisplayName}
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 3: FIRST-PARTY WHITE-LABEL CARDS (STABLE INPUTS + ZERO RE-MOUNTING) */}
      {cardEnabled && resolvedActiveTab === "card" && (
        <form
          onSubmit={handleCardSubmit}
          noValidate
          className="space-y-3.5 rounded-2xl border border-stone-200/90 bg-[#FBF8F3] p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[#1B1714]">Credit &amp; Debit Cards</p>
              <p className="text-[11px] text-[#655B53]">Direct 3D-Secure bank OTP verification</p>
            </div>
            <div className="flex items-center gap-1.5">
              {cardNetworks.visa && <VisaLogo className="h-5 w-auto" />}
              {cardNetworks.mastercard && <MastercardLogo className="h-5 w-auto" />}
              {cardNetworks.rupay && <RuPayLogo className="h-5 w-auto" />}
              {cardNetworks.amex && <AmexLogo className="h-5 w-auto" />}
            </div>
          </div>

          <div>
            <label htmlFor="tj-card-number" className="block text-xs font-semibold text-[#1B1714]">
              Card Number
            </label>
            <div className="relative mt-1">
              <input
                ref={cardNumberRef}
                id="tj-card-number"
                name="cardnumber"
                type="text"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="1234 5678 9012 3456"
                maxLength={23}
                value={cardNumber}
                onChange={(e) => {
                  const formatted = formatCardNumberDisplay(e.target.value);
                  setCardNumber(formatted);
                  if (cardErrors.number) setCardErrors((p) => ({ ...p, number: undefined }));
                }}
                aria-invalid={Boolean(cardErrors.number)}
                className={`min-h-[46px] w-full rounded-xl border bg-white py-2.5 pr-16 pl-3.5 font-mono text-base font-medium tracking-wide text-[#1B1714] tabular-nums outline-none placeholder:font-sans placeholder:tracking-normal placeholder:text-stone-400 sm:text-sm ${
                  cardErrors.number
                    ? "border-rose-400 focus:border-rose-600"
                    : "border-stone-200 focus:border-[#6E1625]"
                }`}
              />
              <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
                {detectedNetwork === "visa" ? (
                  <VisaLogo className="h-5 w-auto" />
                ) : detectedNetwork === "mastercard" ? (
                  <MastercardLogo className="h-5 w-auto" />
                ) : detectedNetwork === "rupay" ? (
                  <RuPayLogo className="h-5 w-auto" />
                ) : detectedNetwork === "amex" ? (
                  <AmexLogo className="h-5 w-auto" />
                ) : (
                  <CreditCard className="h-4 w-4 text-stone-400" />
                )}
              </div>
            </div>
            {cardErrors.number && (
              <p role="alert" className="mt-1 text-[11px] font-medium text-rose-700">
                {cardErrors.number}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tj-card-exp" className="block text-xs font-semibold text-[#1B1714]">
                Expiry (MM / YY)
              </label>
              <input
                ref={cardExpiryRef}
                id="tj-card-exp"
                name="cc-exp"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM / YY"
                maxLength={7}
                value={cardExpiry}
                onKeyDown={handleExpiryKeyDown}
                onChange={(e) => {
                  setCardExpiry(formatCardExpiryDisplay(e.target.value));
                  if (cardErrors.expiry) setCardErrors((p) => ({ ...p, expiry: undefined }));
                }}
                aria-invalid={Boolean(cardErrors.expiry)}
                className={`mt-1 min-h-[46px] w-full rounded-xl border bg-white px-3.5 font-mono text-base font-medium text-[#1B1714] tabular-nums outline-none placeholder:font-sans placeholder:text-stone-400 sm:text-sm ${
                  cardErrors.expiry
                    ? "border-rose-400 focus:border-rose-600"
                    : "border-stone-200 focus:border-[#6E1625]"
                }`}
              />
              {cardErrors.expiry && (
                <p role="alert" className="mt-1 text-[11px] font-medium text-rose-700">
                  {cardErrors.expiry}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="tj-card-cvv" className="block text-xs font-semibold text-[#1B1714]">
                CVV
              </label>
              <input
                ref={cardCvvRef}
                id="tj-card-cvv"
                name="cvc"
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder={getExpectedCvvLength(detectedNetwork) === 4 ? "4 digits" : "3 digits"}
                maxLength={getExpectedCvvLength(detectedNetwork)}
                value={cardCvv}
                onChange={(e) => {
                  setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4));
                  if (cardErrors.cvv) setCardErrors((p) => ({ ...p, cvv: undefined }));
                }}
                aria-invalid={Boolean(cardErrors.cvv)}
                className={`mt-1 min-h-[46px] w-full rounded-xl border bg-white px-3.5 font-mono text-base font-medium text-[#1B1714] tabular-nums outline-none placeholder:font-sans placeholder:text-stone-400 sm:text-sm ${
                  cardErrors.cvv
                    ? "border-rose-400 focus:border-rose-600"
                    : "border-stone-200 focus:border-[#6E1625]"
                }`}
              />
              {cardErrors.cvv && (
                <p role="alert" className="mt-1 text-[11px] font-medium text-rose-700">
                  {cardErrors.cvv}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="tj-card-name" className="block text-xs font-semibold text-[#1B1714]">
              Name on Card
            </label>
            <input
              ref={cardNameRef}
              id="tj-card-name"
              name="ccname"
              type="text"
              autoComplete="cc-name"
              placeholder="As printed on card"
              maxLength={80}
              value={cardholderName}
              onChange={(e) => {
                setCardholderName(e.target.value);
                if (cardErrors.name) setCardErrors((p) => ({ ...p, name: undefined }));
              }}
              aria-invalid={Boolean(cardErrors.name)}
              className={`mt-1 min-h-[46px] w-full rounded-xl border bg-white px-3.5 text-base font-medium text-[#1B1714] outline-none placeholder:text-stone-400 sm:text-sm ${
                cardErrors.name
                  ? "border-rose-400 focus:border-rose-600"
                  : "border-stone-200 focus:border-[#6E1625]"
              }`}
            />
            {cardErrors.name && (
              <p role="alert" className="mt-1 text-[11px] font-medium text-rose-700">
                {cardErrors.name}
              </p>
            )}
          </div>

          {rzpSdkState === "error" && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-950">
              <span>Card processor did not finish loading.</span>
              <button
                type="button"
                onClick={initializeRazorpaySdk}
                className="cursor-pointer font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={Boolean(pendingAction)}
            style={{ backgroundColor: brandAccent }}
            className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-xs transition-opacity hover:opacity-95 active:scale-[0.98] disabled:opacity-60"
          >
            {pendingAction === "card_3ds" || pendingAction === "verifying_card" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying with your bank…</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                <span>Pay ₹{amountFormatted} with Card</span>
              </>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#655B53]">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#116A4B]" />
            <span>256-bit TLS encrypted · Bank 3DS OTP verified</span>
          </p>
        </form>
      )}

      {/* TAB 4: BANK TRANSFER (REAL SMART COLLECT ONLY) */}
      {vanEnabled && resolvedActiveTab === "van" && showVanTab && (
        <div className="space-y-3 rounded-2xl border border-stone-200 bg-[#FBF8F3] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#1B1714]">Bank Transfer</p>
            <span className="text-[11px] font-semibold text-[#655B53]">IMPS · NEFT · RTGS</span>
          </div>
          {hasRealVan ? (
            <div className="space-y-2 rounded-xl border border-stone-200 bg-white p-3.5 text-xs tabular-nums">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#655B53]">Beneficiary</span>
                <span className="font-semibold text-[#1B1714]">{merchant.beneficiary_name}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#655B53]">Account Number</span>
                <button
                  type="button"
                  onClick={() => copyField("acc", order.virtual_account_number || "")}
                  className="inline-flex cursor-pointer items-center gap-1.5 font-mono font-semibold text-[#1B1714]"
                >
                  <span>{order.virtual_account_number}</span>
                  {copiedField === "acc" ? (
                    <Check className="h-3.5 w-3.5 text-[#116A4B]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-stone-400" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#655B53]">IFSC Code</span>
                <button
                  type="button"
                  onClick={() => copyField("ifsc", order.virtual_account_ifsc || "")}
                  className="inline-flex cursor-pointer items-center gap-1.5 font-mono font-semibold text-[#1B1714]"
                >
                  <span>{order.virtual_account_ifsc}</span>
                  {copiedField === "ifsc" ? (
                    <Check className="h-3.5 w-3.5 text-[#116A4B]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-stone-400" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-stone-100 pt-2">
                <span className="text-[#655B53]">Exact Amount</span>
                <span className="font-mono text-sm font-bold text-[#1B1714]">₹{amountFormatted}</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={vanGenerating}
              onClick={() => void handleGenerateVan()}
              style={{ backgroundColor: brandAccent }}
              className="flex min-h-[46px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold text-white"
            >
              {vanGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Bank Account…</span>
                </>
              ) : (
                <>
                  <Building2 className="h-4 w-4" />
                  <span>Show Bank Transfer Account Details</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
