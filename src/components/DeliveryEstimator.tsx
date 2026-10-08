"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ShoppingCart,
  Truck,
  Package,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";

interface DeliveryEstimatorProps {
  businessDays?: number;
}

export function DeliveryEstimator({ businessDays = 5 }: DeliveryEstimatorProps) {
  const [pincode, setPincode] = useState<string>("");
  const [checkedPincode, setCheckedPincode] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [animTrigger, setAnimTrigger] = useState<number>(0);

  // Load previously checked PIN code from localStorage if available
  useEffect(() => {
    try {
      const savedPin = localStorage.getItem("zp_delivery_pincode");
      if (savedPin && /^\d{6}$/.test(savedPin)) {
        setPincode(savedPin);
        setCheckedPincode(savedPin);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Compute live delivery dates based on current day and 5 business days
  const dates = useMemo(() => {
    const now = new Date();

    const addBusinessDays = (startDate: Date, daysToAdd: number): Date => {
      const result = new Date(startDate);
      let added = 0;
      while (added < daysToAdd) {
        result.setDate(result.getDate() + 1);
        // Exclude Sunday (day 0) as non-operational delivery transit day
        if (result.getDay() !== 0) {
          added++;
        }
      }
      return result;
    };

    const formatOrdinal = (d: Date): string => {
      const day = d.getDate();
      const j = day % 10;
      const k = day % 100;
      let suffix = "th";
      if (j === 1 && k !== 11) suffix = "st";
      else if (j === 2 && k !== 12) suffix = "nd";
      else if (j === 3 && k !== 13) suffix = "rd";
      const month = d.toLocaleDateString("en-US", { month: "short" });
      return `${month} ${day}${suffix}`;
    };

    // Step 1: Ordered (Today)
    const orderedDate = formatOrdinal(now);

    // Step 2: Order Shipped (Today to Next Business Day)
    const shippedDayNext = addBusinessDays(now, 1);
    const shippedDate = `${formatOrdinal(now)} - ${formatOrdinal(shippedDayNext)}`;

    // Step 3: Delivered (5 business days)
    const deliveryDayStart = addBusinessDays(now, Math.max(1, businessDays - 1));
    const deliveryDayEnd = addBusinessDays(now, businessDays);
    const deliveredRange =
      deliveryDayStart.getDate() === deliveryDayEnd.getDate()
        ? formatOrdinal(deliveryDayEnd)
        : `${formatOrdinal(deliveryDayStart)} - ${formatOrdinal(deliveryDayEnd)}`;

    const deliveryDayFull = deliveryDayEnd.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    return {
      orderedDate,
      shippedDate,
      deliveredRange,
      deliveryDayFull,
    };
  }, [businessDays]);

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanPin = pincode.trim();
    if (!cleanPin) {
      setError("Please enter your 6-digit postal PIN code");
      return;
    }

    if (!/^\d{6}$/.test(cleanPin)) {
      setError("Please enter a valid 6-digit Indian PIN code");
      return;
    }

    setError(null);
    setIsChecking(true);

    setTimeout(() => {
      setIsChecking(false);
      setCheckedPincode(cleanPin);
      setAnimTrigger((prev) => prev + 1);
      try {
        localStorage.setItem("zp_delivery_pincode", cleanPin);
      } catch {
        // Ignore storage errors
      }
    }, 350);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(val);
    if (error) setError(null);
  };

  const handleClear = () => {
    setPincode("");
    setCheckedPincode(null);
    try {
      localStorage.removeItem("zp_delivery_pincode");
    } catch {
      // Ignore
    }
  };

  return (
    <div className="mt-5 rounded-[22px] border border-gray-200/90 bg-[#FBFBFC] p-4 sm:p-5 shadow-xs transition-all">
      {/* 1. Header with MapPin */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <MapPin className="w-4 h-4 stroke-[2.2]" />
        </div>
        <h3 className="text-[13px] sm:text-[14px] font-bold text-gray-900 tracking-tight">
          Enter your PIN code to check delivery availability
        </h3>
      </div>

      {/* 2. PIN Code Input & Check Button */}
      <form onSubmit={handleCheck} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={pincode}
            onChange={handleInputChange}
            placeholder="Enter 6-digit PIN code (e.g. 683547)"
            className="w-full h-11 sm:h-12 px-3.5 sm:px-4 rounded-xl bg-white border border-gray-300 text-[14px] sm:text-[15px] font-semibold text-gray-900 placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:border-[#FA521C] focus:ring-2 focus:ring-[#FA521C]/20 transition-all tracking-wide"
          />
          {pincode && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-700 px-1 py-0.5 rounded transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isChecking || pincode.length !== 6}
          className="h-11 sm:h-12 px-5 sm:px-6 rounded-xl bg-[#0F172A] hover:bg-black active:scale-[0.98] text-white font-bold text-[13px] sm:text-[14px] tracking-wide transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 min-w-[84px]"
        >
          {isChecking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : checkedPincode === pincode && pincode.length === 6 ? (
            <span className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              Checked
            </span>
          ) : (
            "Check"
          )}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 mt-2 text-rose-600 text-xs font-medium"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* 3. Delivery Availability Status Banner */}
      <div className="mt-3">
        {checkedPincode ? (
          <motion.div
            key={checkedPincode + animTrigger}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 rounded-xl px-3 py-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
            <div className="text-xs sm:text-[13px] font-semibold leading-tight">
              <span>Delivery available to </span>
              <span className="font-extrabold text-emerald-800">{checkedPincode}</span>
              <span className="text-emerald-500 mx-1.5 font-bold">•</span>
              <span>Estimated in {businessDays} business days</span>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium px-1">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5] shrink-0" />
            <span>Delivery available Pan-India • Estimated in {businessDays} business days</span>
          </div>
        )}
      </div>

      {/* 4. Horizontal Animated 3-Step Delivery Timeline Track */}
      <div className="mt-5 pt-4 border-t border-gray-200/70">
        <div className="relative pb-1">
          {/* Background Connecting Line */}
          <div className="absolute top-[22px] sm:top-[24px] left-[16.67%] right-[16.67%] h-[2.5px] bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              key={`line-${animTrigger}`}
              className="h-full bg-gradient-to-r from-emerald-500 via-emerald-500 to-emerald-600 origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* 3 Milestones Grid */}
          <div className="relative grid grid-cols-3 gap-2">
            {/* Step 1: Ordered */}
            <motion.div
              key={`step1-${animTrigger}`}
              initial={{ scale: 0.7, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 20,
                delay: 0.1,
              }}
              className="flex flex-col items-center text-center z-10"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center text-gray-800 group hover:border-gray-400 transition-colors">
                <ShoppingCart className="w-5 h-5 stroke-[2] text-gray-800" />
              </div>
              <span className="text-[12px] sm:text-[13px] font-bold text-gray-900 mt-2 leading-tight">
                {dates.orderedDate}
              </span>
              <span className="text-[11px] sm:text-[12px] text-gray-500 font-medium mt-0.5">
                Ordered
              </span>
            </motion.div>

            {/* Step 2: Order Shipped */}
            <motion.div
              key={`step2-${animTrigger}`}
              initial={{ scale: 0.7, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 20,
                delay: 0.3,
              }}
              className="flex flex-col items-center text-center z-10"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center text-gray-800 hover:border-gray-400 transition-colors">
                <Truck className="w-5 h-5 stroke-[2] text-gray-800" />
              </div>
              <span className="text-[12px] sm:text-[13px] font-bold text-gray-900 mt-2 leading-tight">
                {dates.shippedDate}
              </span>
              <span className="text-[11px] sm:text-[12px] text-gray-500 font-medium mt-0.5">
                Order Shipped
              </span>
            </motion.div>

            {/* Step 3: Delivered */}
            <motion.div
              key={`step3-${animTrigger}`}
              initial={{ scale: 0.7, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 20,
                delay: 0.55,
              }}
              className="flex flex-col items-center text-center z-10"
            >
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-50 border-2 border-emerald-500 shadow-xs flex items-center justify-center text-emerald-700 ring-4 ring-emerald-100/60">
                <Package className="w-5 h-5 stroke-[2] text-emerald-700" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 rounded-full border-2 border-white flex items-center justify-center text-white"
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </motion.span>
              </div>
              <span className="text-[12px] sm:text-[13px] font-bold text-gray-900 mt-2 leading-tight">
                {dates.deliveredRange}
              </span>
              <span className="text-[11px] sm:text-[12px] text-emerald-700 font-bold mt-0.5">
                Delivered
              </span>
            </motion.div>
          </div>
        </div>

        {/* Reassuring Guarantee Tagline */}
        <div className="mt-3.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span className="flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Guaranteed safe dispatch via Bluedart & Delhivery
          </span>
          <span className="font-semibold text-gray-700 hidden sm:inline">
            Free Express Shipping
          </span>
        </div>
      </div>
    </div>
  );
}
