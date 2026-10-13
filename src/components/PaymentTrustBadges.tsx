"use client";

import React from "react";

export function PaymentTrustBadges() {
  return (
    <div
      aria-label="Accepted Payment Methods"
      className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 pt-0.5 select-none"
    >
      {/* 1. VISA */}
      <div
        className="h-7 sm:h-8 px-2 sm:px-2.5 bg-white rounded-md sm:rounded-lg border border-gray-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-center hover:border-gray-300 transition-colors"
        title="Visa"
      >
        <svg viewBox="0 0 48 20" className="h-3 sm:h-3.5 w-auto" aria-hidden="true">
          <path
            fill="#1434CB"
            d="M18.5 19.3l2.8-17.1h4.5l-2.8 17.1h-4.5zm16.8-16.7c-.9-.3-2.3-.6-4-.6-4.4 0-7.5 2.3-7.5 5.7 0 2.5 2.2 3.9 3.9 4.8 1.8.9 2.4 1.4 2.4 2.2 0 1.2-1.4 1.8-2.8 1.8-1.9 0-2.9-.3-4.5-1l-.6-.3-.7 4.1c1.1.5 3.2.9 5.3.9 5 0 8.2-2.5 8.2-6.3 0-2.1-1.3-3.7-4.1-5-1.7-.9-2.7-1.5-2.7-2.4 0-.8.9-1.7 2.9-1.7 1.6 0 2.8.3 3.7.7l.4.2.6-4.4zm12.3 0h-3.5c-1.1 0-1.9.3-2.4 1.5l-6.8 15.2h4.7l.9-2.6h5.8l.5 2.6h4.2l-3.4-16.7zm-5.7 10.3l2.4-6.4 1.4 6.4h-3.8zM11.6 2.6L7.2 14.5l-.5-2.5c-.8-2.8-3.3-5.9-6.1-7.4l4 14.7h4.8l7.2-16.7H11.6z"
          />
          <path
            fill="#EBA000"
            d="M5.3 2.6H.1l-.1.5c4.7 1.2 7.7 4.2 9 7.7l-1.5-6.8c-.3-1-1-1.4-2.2-1.4z"
          />
        </svg>
      </div>

      {/* 2. Apple Pay */}
      <div
        className="h-7 sm:h-8 px-2 sm:px-2.5 bg-white rounded-md sm:rounded-lg border border-gray-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-center hover:border-gray-300 transition-colors"
        title="Apple Pay"
      >
        <svg
          viewBox="0 0 50 22"
          className="h-3 sm:h-3.5 w-auto text-black fill-current"
          aria-hidden="true"
        >
          {/* Apple Logo */}
          <path d="M11.08 10.97c-.02-2.32 1.89-3.44 1.98-3.49-1.08-1.57-2.75-1.79-3.35-1.81-1.42-.14-2.78.84-3.5.84-.73 0-1.84-.82-3.03-.8-1.56.02-3 .9-3.8 2.3-1.63 2.82-.42 7 1.17 9.29.77 1.12 1.7 2.37 2.91 2.33 1.17-.05 1.61-.75 3.03-.75 1.41 0 1.81.75 3.03.73 1.24-.02 2.03-1.13 2.79-2.25.88-1.28 1.24-2.53 1.26-2.6-.03-.01-2.47-.95-2.49-3.79zM9.46 4.3c.63-.77 1.06-1.84.94-2.91-.91.04-2.02.61-2.67 1.37-.57.66-.99 1.74-.86 2.78 1.02.08 2.06-.52 2.59-1.24z" />
          {/* Pay Text */}
          <path d="M20.24 4.02h3.9c2.37 0 3.99 1.54 3.99 3.82s-1.63 3.84-4.04 3.84h-1.92v4.89h-1.93V4.02zm3.76 5.99c1.36 0 2.21-.86 2.21-2.17 0-1.3-.85-2.15-2.2-2.15h-1.83v4.32h1.82zM28.48 12.78c0-2.38 1.8-3.89 4.39-3.89 1.24 0 2.11.35 2.61.76v-.55c0-1.17-.9-1.82-2.22-1.82-1.15 0-2.04.42-2.36.96l-1.39-.96c.64-.99 1.99-1.67 3.87-1.67 2.39 0 3.93 1.27 3.93 3.42v7.54h-1.85v-1.3c-.6.85-1.68 1.48-2.96 1.48-2.17 0-4.02-1.52-4.02-3.97zm7-.27v-.71c-.44-.39-1.19-.66-2.16-.66-1.58 0-2.5.83-2.5 2.07 0 1.2.98 2.02 2.45 2.02 1.34 0 2.21-.73 2.21-1.92v-.8zM38.86 8.98h2.02l2.76 7.42 2.68-7.42h1.99l-4.14 10.36c-.66 1.63-1.62 2.27-3.23 2.27-.47 0-.96-.06-1.31-.15v-1.63c.27.06.6.1.92.1.84 0 1.38-.34 1.74-1.26l.28-.68-3.71-8.01z" />
        </svg>
      </div>

      {/* 3. G Pay */}
      <div
        className="h-7 sm:h-8 px-2 sm:px-2.5 bg-white rounded-md sm:rounded-lg border border-gray-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-center hover:border-gray-300 transition-colors"
        title="Google Pay"
      >
        <svg viewBox="0 0 52 20" className="h-3 sm:h-3.5 w-auto" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M10.8 10.3c0-.6-.05-1.2-.16-1.8H5.6v3.4h3c-.13.9-.62 1.6-1.4 2.2v1.8h2.3c1.33-1.2 2.3-3.1 2.3-5.6z"
          />
          <path
            fill="#34A853"
            d="M5.6 15.6c2.7 0 5-1 6.7-2.6l-2.3-1.8c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.7-5.6-4.1H0v2C1.7 13.7 4.5 15.6 5.6 15.6z"
          />
          <path
            fill="#FBBC05"
            d="M1 9.5c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V3.4H0C-.6 4.7-1 6-1 7.5s.4 2.8 1 4.1l2-2.1z"
            transform="translate(1)"
          />
          <path
            fill="#EA4335"
            d="M5.6 3.5c1.5 0 2.8.5 3.8 1.5l2.6-2.6C10.4.9 8.2 0 5.6 0 4.5 0 1.7 1.9 0 5.4l2.4 2c.8-2.4 3-3.9 5.6-3.9z"
          />
          {/* Pay Text */}
          <path
            fill="#3C4043"
            d="M17.5 3.7h3.9c1.2 0 2.3.4 3 1.1.7.7 1.1 1.7 1.1 2.9s-.4 2.2-1.1 2.9c-.7.7-1.8 1.1-3 1.1h-2v4h-1.9V3.7zm3.8 6.4c.7 0 1.4-.2 1.8-.7.4-.5.7-1.1.7-1.8s-.3-1.3-.7-1.8c-.4-.5-1.1-.7-1.8-.7h-1.9v5h1.9zm6.7 2.4c0-1.2.4-2.2 1.3-2.9.9-.7 1.9-1.1 3.2-1.1 1.1 0 2.1.2 2.9.6v-.8c0-.8-.3-1.4-.8-1.8-.5-.4-1.2-.7-2-.7-.7 0-1.4.2-1.9.5-.5.3-.9.8-1 1.4l-1.7-.7c.3-1 .9-1.7 1.7-2.3.9-.6 1.9-.9 3-.9 1.4 0 2.5.4 3.4 1.1.9.8 1.3 1.8 1.3 3.2v6.6h-1.8v-1.5c-.7 1.1-1.8 1.7-3.3 1.7-1.1 0-2.1-.3-2.9-1-.8-.6-1.3-1.6-1.3-2.7zm7.4-1.1v-1c-.7-.5-1.6-.8-2.6-.8-.8 0-1.5.2-2 .6-.5.4-.8 1-.8 1.6s.3 1.1.8 1.5c.5.4 1.2.5 1.9.5 1.2 0 2.1-.4 2.7-1.2zm4.8-3.2l2.1 5.2 2-5.2h1.9l-3.1 7.2c-.5 1.1-1 1.9-1.5 2.3-.5.4-1.2.7-2 .7-.4 0-.7 0-1-.1v-1.6c.3.1.5.1.8.1.4 0 .8-.2 1-.4.3-.3.6-.9.9-1.7l.2-.4-3.9-7.8h1.7z"
          />
        </svg>
      </div>

      {/* 4. UPI */}
      <div
        className="h-7 sm:h-8 px-2 sm:px-2.5 bg-white rounded-md sm:rounded-lg border border-gray-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-center hover:border-gray-300 transition-colors"
        title="UPI"
      >
        <svg viewBox="0 0 54 20" className="h-3 sm:h-3.5 w-auto" aria-hidden="true">
          {/* Dual Chevron Arrows */}
          <path fill="#097939" d="M10 18l3.6-14H8.8L5.2 18H10z" />
          <path fill="#ED752E" d="M15.4 18l3.6-14h-4.8L10.6 18h4.8z" />
          {/* UPI Letters */}
          <path
            fill="#2E3192"
            d="M23.2 4h3.3v7.6c0 1.1.3 1.9.9 2.4.6.5 1.5.7 2.6.7 1.1 0 1.9-.2 2.5-.7.6-.5.9-1.3.9-2.4V4h3.3v7.8c0 2-.6 3.5-1.9 4.4-1.3 1-3 1.4-5.2 1.4s-3.9-.5-5.1-1.4c-1.3-1-1.9-2.4-1.9-4.4V4z"
          />
          <path
            fill="#2E3192"
            d="M38.5 4h5.4c1.7 0 3 .4 3.8 1.2.8.8 1.3 2 1.3 3.5s-.4 2.6-1.4 3.5c-.9.9-2.2 1.3-3.9 1.3h-2v4.1h-3.2V4zm3.2 2.8v3.9h2c.8 0 1.4-.2 1.8-.5.4-.4.6-.9.6-1.5 0-.6-.2-1.1-.6-1.4-.4-.3-1-.5-1.8-.5h-2z"
          />
          <path fill="#2E3192" d="M50.8 4h3.2v13.6h-3.2V4z" />
        </svg>
      </div>

      {/* 5. Mastercard */}
      <div
        className="h-7 sm:h-8 px-2 sm:px-2.5 bg-white rounded-md sm:rounded-lg border border-gray-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-center hover:border-gray-300 transition-colors"
        title="Mastercard"
      >
        <svg viewBox="0 0 36 22" className="h-3.5 sm:h-4 w-auto" aria-hidden="true">
          <circle cx="11" cy="11" r="9" fill="#EB001B" />
          <circle cx="25" cy="11" r="9" fill="#F79E1B" />
          <path
            d="M18 4.2a8.98 8.98 0 0 1 3.2 6.8c0 2.8-1.3 5.3-3.2 6.8a8.98 8.98 0 0 1-3.2-6.8c0-2.8 1.3-5.3 3.2-6.8z"
            fill="#FF5F00"
          />
        </svg>
      </div>
    </div>
  );
}
