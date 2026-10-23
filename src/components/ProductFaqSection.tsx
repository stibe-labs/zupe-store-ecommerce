"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 1,
    question: "How long will delivery take?",
    answer:
      "Delivery usually takes 2 to 4 business days depending on your location across India. Metro cities receive orders within 24–48 hours. Once shipped, you will receive real-time tracking updates via SMS and WhatsApp.",
  },
  {
    id: 2,
    question: "Do you offer Cash on Delivery (COD)?",
    answer:
      "Yes, Cash on Delivery (COD) is available across all serviceable pincodes in India. You can inspect the package upon arrival and pay cash or UPI directly to the delivery executive.",
  },
  {
    id: 3,
    question: "What is the return and replacement policy?",
    answer:
      "We provide a 7-Day Hassle-Free Replacement Guarantee. If the product arrives damaged, defective, or different from expected, simply WhatsApp our support team at +91 80862 39659 to arrange an instant free replacement or refund.",
  },
  {
    id: 4,
    question: "Is this product genuine & tested for quality?",
    answer:
      "Every single unit is 100% authentic, inspected, and quality-tested before dispatch. We source directly from verified manufacturers to guarantee long-lasting performance and customer satisfaction.",
  },
  {
    id: 5,
    question: "How can I track my order?",
    answer:
      "As soon as your order is dispatched, you will receive a tracking link via WhatsApp & SMS. You can also visit our 'Track Order' page anytime and enter your Order ID or mobile number for live GPS tracking.",
  },
  {
    id: 6,
    question: "What payment methods do you accept?",
    answer:
      "We accept all major payment methods including UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, and Cash on Delivery.",
  },
  {
    id: 7,
    question: "Can I cancel or change my order?",
    answer:
      "Yes, you can easily cancel or modify your order from the 'My Orders' section or by messaging our WhatsApp support before the order has been handed over to the courier.",
  },
];

interface ProductFaqSectionProps {
  className?: string;
}

export function ProductFaqSection({ className = "" }: ProductFaqSectionProps) {
  // First question open by default as in reference image
  const [openId, setOpenId] = useState<number | null>(1);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`w-full my-8 select-none ${className}`}>
      {/* Header */}
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-[#FF5722] text-[11px] font-bold uppercase tracking-wider mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>FAQ</span>
        </div>
        <h2 className="text-[18px] sm:text-[22px] font-display font-extrabold text-[#0F172A] tracking-tight leading-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-[12px] sm:text-[13px] text-gray-500 font-normal mt-1 leading-snug max-w-md mx-auto">
          Find quick answers to common questions about this product.
        </p>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-2.5">
        {DEFAULT_FAQS.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "bg-white border-orange-300 shadow-xs"
                  : "bg-white/80 border-gray-200/80 hover:border-gray-300"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="w-full flex items-center justify-between p-3 sm:p-3.5 text-left gap-3 focus:outline-hidden"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  {/* Orange Number Badge */}
                  <span
                    className={`shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-colors ${
                      isOpen
                        ? "bg-[#FF5722] text-white shadow-2xs"
                        : "bg-orange-100 text-[#FF5722]"
                    }`}
                  >
                    {item.id}
                  </span>
                  <span
                    className={`text-xs sm:text-[13px] font-bold leading-snug line-clamp-2 ${
                      isOpen ? "text-[#FF5722]" : "text-gray-900"
                    }`}
                  >
                    {item.question}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-[#FF5722]" : "text-gray-400"
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-3.5 sm:px-4 pb-3.5 pt-0 text-gray-600 text-[11px] sm:text-xs leading-relaxed border-t border-orange-100/50 mt-1">
                  <div className="pt-2">{item.answer}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
