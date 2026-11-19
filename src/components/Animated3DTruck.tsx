"use client";

import React from "react";

export interface Animated3DTruckProps {
  className?: string;
  size?: number; // size multiplier, default 24
}

export function Animated3DTruck({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-visible select-none ${className}`}
      title="Express insured door-to-door delivery"
    >
      <style jsx>{`
        @keyframes truckSuspension {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-1.2px) rotate(-0.4deg);
          }
          50% {
            transform: translateY(0.3px) rotate(0.2deg);
          }
          75% {
            transform: translateY(-0.8px) rotate(-0.2deg);
          }
        }

        @keyframes wheelRoll {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes roadDash {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: -20;
          }
        }

        @keyframes windStreak {
          0% {
            opacity: 0;
            transform: translateX(3px);
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
            transform: translateX(-8px);
          }
        }

        @keyframes shadowPulse {
          0%, 100% {
            transform: scaleX(1);
            opacity: 0.28;
          }
          25% {
            transform: scaleX(0.92);
            opacity: 0.2;
          }
          50% {
            transform: scaleX(1.05);
            opacity: 0.35;
          }
        }

        .truck-chassis-bounce {
          animation: truckSuspension 0.42s ease-in-out infinite;
          transform-origin: 22px 18px;
        }

        .wheel-spin-front {
          transform-origin: 34.5px 20.5px;
          animation: wheelRoll 0.35s linear infinite;
        }

        .wheel-spin-rear {
          transform-origin: 12.5px 20.5px;
          animation: wheelRoll 0.35s linear infinite;
        }

        .road-moving-dashes {
          animation: roadDash 0.35s linear infinite;
        }

        .wind-streak-1 {
          animation: windStreak 0.5s linear infinite;
        }

        .wind-streak-2 {
          animation: windStreak 0.6s linear infinite 0.2s;
        }

        .truck-shadow {
          animation: shadowPulse 0.42s ease-in-out infinite;
          transform-origin: center;
        }
      `}</style>

      <svg
        viewBox="0 0 46 26"
        className="w-6 h-4 sm:w-7 sm:h-4.5 overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cargo Container 3D Gradient */}
          <linearGradient id="cargoGradient" x1="4" y1="3" x2="4" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="15%" stopColor="#F4F6F8" />
            <stop offset="85%" stopColor="#E2E6EA" />
            <stop offset="100%" stopColor="#CBD3DB" />
          </linearGradient>

          {/* Cargo Top 3D Bevel Highlight */}
          <linearGradient id="cargoTopBevel" x1="4" y1="3" x2="28" y2="3" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E9ECEF" />
          </linearGradient>

          {/* Cab 3D Forest Green Gradient */}
          <linearGradient id="cabGradient" x1="28" y1="7" x2="42" y2="19" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4A7C24" />
            <stop offset="40%" stopColor="#3B581C" />
            <stop offset="100%" stopColor="#253A10" />
          </linearGradient>

          {/* Windshield Glossy Gradient */}
          <linearGradient id="windshieldGrad" x1="30" y1="8" x2="38" y2="13" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D9F0FA" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#87CEEB" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.85" />
          </linearGradient>

          {/* Wheel 3D Rim Gradient */}
          <radialGradient id="rimGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F3F4F6" />
            <stop offset="60%" stopColor="#9CA3AF" />
            <stop offset="100%" stopColor="#374151" />
          </radialGradient>

          {/* Headlight Glow */}
          <linearGradient id="headlightBeam" x1="42" y1="15" x2="46" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Road Dash Lines (Simulating moving road under truck) */}
        <line
          x1="2"
          y1="24.5"
          x2="44"
          y2="24.5"
          stroke="#94A3B8"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          strokeLinecap="round"
          className="road-moving-dashes opacity-60"
        />

        {/* 2. Soft Dynamic Ground Shadow */}
        <ellipse
          cx="23"
          cy="23"
          rx="18"
          ry="1.8"
          fill="#0F172A"
          className="truck-shadow"
        />

        {/* 3. Aerodynamic Wind Streaks behind Cargo */}
        <line x1="2" y1="7" x2="5" y2="7" stroke="#3B581C" strokeWidth="1" strokeLinecap="round" className="wind-streak-1 opacity-70" />
        <line x1="0" y1="11" x2="4" y2="11" stroke="#6B9E3A" strokeWidth="1" strokeLinecap="round" className="wind-streak-2 opacity-60" />

        {/* 4. Truck Body (Bouncing on suspension) */}
        <g className="truck-chassis-bounce">
          {/* Headlight beam shining forward */}
          <polygon points="42,14.5 45.5,13.5 45.5,17.5 42,16.5" fill="url(#headlightBeam)" />

          {/* Cargo Container 3D Box */}
          <rect x="4" y="3.5" width="24" height="15" rx="1.5" fill="url(#cargoGradient)" />
          {/* Cargo Box top 3D highlight edge */}
          <line x1="4.5" y1="4" x2="27.5" y2="4" stroke="url(#cargoTopBevel)" strokeWidth="0.8" />
          {/* Cargo Box side 3D shadow edge */}
          <line x1="4.5" y1="18" x2="27.5" y2="18" stroke="#94A3B8" strokeWidth="0.6" />

          {/* Vittal Lifestyle Brand Stripe on Container */}
          <rect x="4" y="11" width="24" height="2.2" fill="#6B9E3A" fillOpacity="0.85" />
          <circle cx="16" cy="12.1" r="0.8" fill="#FFFFFF" />

          {/* Rear Container Door Gap Line */}
          <line x1="6.5" y1="4" x2="6.5" y2="18" stroke="#CBD5E1" strokeWidth="0.7" />

          {/* Lower Chassis / Battery & Tool Box (Dark Gray) */}
          <rect x="18" y="17" width="9" height="2" fill="#334155" rx="0.4" />

          {/* Driver Cab (Aerodynamic curved truck front) */}
          <path
            d="M28 7.5 H34 C36.5 7.5 38.5 9.5 39.5 12 L41.2 15 C41.7 15.8 42 16.5 42 17.5 V18.5 H28 V7.5 Z"
            fill="url(#cabGradient)"
          />

          {/* Cab Glossy Windshield with 3D reflection */}
          <path
            d="M30 8.5 H33.5 C35 8.5 36.5 9.8 37.2 11.5 L38.5 14 H30 V8.5 Z"
            fill="url(#windshieldGrad)"
          />
          {/* Windshield Glass Specular Highlight */}
          <line x1="32" y1="9" x2="36" y2="13.5" stroke="#FFFFFF" strokeWidth="0.7" strokeLinecap="round" strokeOpacity="0.75" />

          {/* Chrome Front Bumper */}
          <rect x="40.5" y="17" width="2" height="2" rx="0.5" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.3" />

          {/* Headlamp bulb */}
          <circle cx="41.2" cy="15.5" r="0.9" fill="#FEF08A" stroke="#CA8A04" strokeWidth="0.3" />

          {/* Rear mudguard arch */}
          <path d="M7 19.5 C7 16.5 18 16.5 18 19.5" fill="#1E293B" />
          {/* Front mudguard arch */}
          <path d="M29 19.5 C29 16.5 40 16.5 40 19.5" fill="#1E293B" />

          {/* Rear Wheel (Outer Rubber Tire) */}
          <circle cx="12.5" cy="20.5" r="3.4" fill="#18181B" stroke="#09090B" strokeWidth="0.5" />
          {/* Rear Wheel (Alloy Rim & Hub) */}
          <circle cx="12.5" cy="20.5" r="2.1" fill="url(#rimGrad)" />
          {/* Rear Wheel Spinning Spokes */}
          <g className="wheel-spin-rear">
            <line x1="12.5" y1="18.8" x2="12.5" y2="22.2" stroke="#FFFFFF" strokeWidth="0.5" />
            <line x1="10.8" y1="20.5" x2="14.2" y2="20.5" stroke="#FFFFFF" strokeWidth="0.5" />
            <circle cx="12.5" cy="20.5" r="0.7" fill="#111827" />
          </g>

          {/* Front Wheel (Outer Rubber Tire) */}
          <circle cx="34.5" cy="20.5" r="3.4" fill="#18181B" stroke="#09090B" strokeWidth="0.5" />
          {/* Front Wheel (Alloy Rim & Hub) */}
          <circle cx="34.5" cy="20.5" r="2.1" fill="url(#rimGrad)" />
          {/* Front Wheel Spinning Spokes */}
          <g className="wheel-spin-front">
            <line x1="34.5" y1="18.8" x2="34.5" y2="22.2" stroke="#FFFFFF" strokeWidth="0.5" />
            <line x1="32.8" y1="20.5" x2="36.2" y2="20.5" stroke="#FFFFFF" strokeWidth="0.5" />
            <circle cx="34.5" cy="20.5" r="0.7" fill="#111827" />
          </g>
        </g>
      </svg>
    </div>
  );
}
