import React from "react";

export function UpiLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 font-black italic tracking-tight text-white select-none ${className}`}>
      <span className="text-[17px] sm:text-[19px] font-black italic tracking-tight leading-none text-white font-sans">
        UPI
      </span>
      {/* Official UPI Chevron Arrows: Green and Orange acute forward chevrons */}
      <svg
        className="w-4 h-4 inline-block -ml-0.5"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* First chevron (Green) */}
        <path
          d="M4 3L13 12L4 21H8.5L17.5 12L8.5 3H4Z"
          fill="#00B050"
        />
        {/* Second chevron (White / Light Orange highlight) */}
        <path
          d="M11 3L20 12L11 21H14.5L23.5 12L14.5 3H11Z"
          fill="#FFFFFF"
        />
      </svg>
    </span>
  );
}
