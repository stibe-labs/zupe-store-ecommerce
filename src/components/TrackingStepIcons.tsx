"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IconProps {
  isTriggered?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Step 1 Icon: Packaging Box
 * Hover/Click: Box opens up -> spins 360 degrees in 3D -> returns back to normal closed box.
 */
export function AnimatedPackagingBox({ isTriggered, className = "", onClick }: IconProps) {
  const [internalActive, setInternalActive] = useState(false);
  const active = Boolean(isTriggered || internalActive);

  // Auto reset click animation after full cycle
  useEffect(() => {
    if (internalActive) {
      const timer = setTimeout(() => {
        setInternalActive(false);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [internalActive]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalActive(true);
    onClick?.();
  };

  return (
    <div
      className={`relative w-8 h-8 flex items-center justify-center cursor-pointer select-none ${className}`}
      style={{ perspective: 600 }}
      onMouseEnter={() => setInternalActive(true)}
      onMouseLeave={() => setInternalActive(false)}
      onClick={handleClick}
      title="Click or hover to inspect packaging"
      aria-label="Quality Inspection & Packaging Animation"
    >
      <motion.div
        className="w-full h-full flex items-center justify-center relative"
        style={{ transformStyle: "preserve-3d" }}
        animate={
          active
            ? {
                rotateY: [0, 0, 180, 360, 360],
                rotateX: [0, 8, -6, 0, 0],
                scale: [1, 1.12, 1.15, 1.05, 1],
              }
            : {
                rotateY: 0,
                rotateX: 0,
                scale: 1,
              }
        }
        transition={
          active
            ? {
                duration: 1.8,
                ease: [0.34, 1.56, 0.64, 1],
                times: [0, 0.25, 0.6, 0.85, 1],
              }
            : { duration: 0.4, ease: "easeOut" }
        }
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 overflow-visible"
        >
          {/* Box Shadow on ground */}
          <ellipse
            cx="16"
            cy="28"
            rx={active ? 10 : 8}
            ry="2.5"
            fill="#074230"
            fillOpacity={active ? "0.22" : "0.12"}
            className="transition-all duration-300"
          />

          {/* Box Body (Isometric Cube Front) */}
          {/* Left front wall */}
          <path
            d="M5 12.5L16 18.5V27.5L5 21.5V12.5Z"
            fill="#0B5D44"
            fillOpacity="0.85"
            stroke="#074230"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Right front wall */}
          <path
            d="M16 18.5L27 12.5V21.5L16 27.5V18.5Z"
            fill="#074230"
            stroke="#074230"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Center vertical seam */}
          <path
            d="M16 18.5V27.5"
            stroke="#10B981"
            strokeWidth="1.2"
            strokeDasharray="2 1.5"
          />

          {/* INSIDE CAVITY GLOW (revealed when box opens) */}
          <motion.path
            d="M16 8.5L26 13.5L16 18.5L6 13.5L16 8.5Z"
            fill="#04261B"
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: 0.25 }}
          />
          {active && (
            <motion.circle
              cx="16"
              cy="13.5"
              r="3.5"
              fill="#10B981"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.4, 0.8, 1.2, 0],
                opacity: [0, 0.9, 0.7, 0.8, 0],
              }}
              transition={{ duration: 1.6, times: [0, 0.3, 0.5, 0.75, 1] }}
            />
          )}

          {/* TOP FLAPS */}
          {/* Normal Closed State Lid (Left flap) */}
          <motion.path
            d="M16 8.5L6 13.5L16 18.5L16 8.5Z"
            fill="#10B981"
            fillOpacity="0.3"
            stroke="#074230"
            strokeWidth="1.5"
            strokeLinejoin="round"
            style={{ originX: "6px", originY: "13.5px" }}
            animate={
              active
                ? {
                    // Open upward and outward, then snap shut
                    rotateZ: [0, -42, -50, -42, 0],
                    y: [0, -3.5, -4, -3.5, 0],
                    opacity: [1, 0.9, 0.9, 0.95, 1],
                  }
                : { rotateZ: 0, y: 0, opacity: 1 }
            }
            transition={
              active
                ? {
                    duration: 1.8,
                    times: [0, 0.2, 0.6, 0.82, 1],
                    ease: "easeInOut",
                  }
                : { duration: 0.3 }
            }
          />

          {/* Normal Closed State Lid (Right flap) */}
          <motion.path
            d="M16 8.5L26 13.5L16 18.5L16 8.5Z"
            fill="#10B981"
            fillOpacity="0.45"
            stroke="#074230"
            strokeWidth="1.5"
            strokeLinejoin="round"
            style={{ originX: "26px", originY: "13.5px" }}
            animate={
              active
                ? {
                    // Open upward and outward to right, then snap shut
                    rotateZ: [0, 42, 50, 42, 0],
                    y: [0, -3.5, -4, -3.5, 0],
                    opacity: [1, 0.9, 0.9, 0.95, 1],
                  }
                : { rotateZ: 0, y: 0, opacity: 1 }
            }
            transition={
              active
                ? {
                    duration: 1.8,
                    times: [0, 0.2, 0.6, 0.82, 1],
                    ease: "easeInOut",
                  }
                : { duration: 0.3 }
            }
          />

          {/* Security Hologram Seal Tape (Folds and re-seals) */}
          <motion.path
            d="M12 10.5L20 14.5"
            stroke="#F59E0B"
            strokeWidth="2.5"
            strokeLinecap="round"
            animate={
              active
                ? {
                    opacity: [1, 0, 0, 0, 1],
                    scaleX: [1, 0, 0, 0.8, 1],
                  }
                : { opacity: 1, scaleX: 1 }
            }
            transition={{
              duration: 1.8,
              times: [0, 0.15, 0.6, 0.85, 1],
            }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

/**
 * Step 2 Icon: Express Air Logistics Truck
 * Hover/Click: Truck stays in position, but looks like driving fast.
 * Realistic chassis road suspension rumble, spinning wheels, road speed marks, and rushing wind speed streaks!
 */
export function AnimatedExpressTruck({ isTriggered, className = "", onClick }: IconProps) {
  const [internalActive, setInternalActive] = useState(false);
  const active = Boolean(isTriggered || internalActive);

  // Auto reset click animation after 2.5s
  useEffect(() => {
    if (internalActive) {
      const timer = setTimeout(() => {
        setInternalActive(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [internalActive]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalActive(true);
    onClick?.();
  };

  return (
    <div
      className={`relative w-8 h-8 flex items-center justify-center cursor-pointer select-none ${className}`}
      onMouseEnter={() => setInternalActive(true)}
      onMouseLeave={() => setInternalActive(false)}
      onClick={handleClick}
      title="Click or hover to accelerate express delivery"
      aria-label="Express Air Logistics Animation"
    >
      <svg
        viewBox="0 0 34 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7 overflow-visible"
      >
        {/* RUSHING SPEED STREAKS BEHIND TRUCK (Move rapidly to left to give driving illusion) */}
        {active && (
          <g>
            {/* Top Wind Streak */}
            <motion.line
              x1="6"
              y1="9"
              x2="0"
              y2="9"
              stroke="#10B981"
              strokeWidth="1.6"
              strokeLinecap="round"
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: [-2, -18], opacity: [0, 0.9, 0] }}
              transition={{ repeat: Infinity, duration: 0.38, ease: "linear" }}
            />
            {/* Middle Wind Streak */}
            <motion.line
              x1="8"
              y1="14"
              x2="0"
              y2="14"
              stroke="#074230"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ x: 12, opacity: 0 }}
              animate={{ x: [0, -22], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.32, ease: "linear", delay: 0.08 }}
            />
            {/* Lower Wind Streak */}
            <motion.line
              x1="7"
              y1="19"
              x2="1"
              y2="19"
              stroke="#10B981"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ x: 8, opacity: 0 }}
              animate={{ x: [-1, -16], opacity: [0, 0.85, 0] }}
              transition={{ repeat: Infinity, duration: 0.42, ease: "linear", delay: 0.15 }}
            />

            {/* ROAD SURFACE SPEED DASHES (Ground speed rush moving to left) */}
            <motion.line
              x1="26"
              y1="28"
              x2="19"
              y2="28"
              stroke="#074230"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ x: 10, opacity: 0.8 }}
              animate={{ x: [-14, -28], opacity: [0.8, 0] }}
              transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
            />
            <motion.line
              x1="14"
              y1="28"
              x2="7"
              y2="28"
              stroke="#10B981"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ x: 8, opacity: 0.7 }}
              animate={{ x: [-12, -26], opacity: [0.7, 0] }}
              transition={{ repeat: Infinity, duration: 0.3, ease: "linear", delay: 0.12 }}
            />
          </g>
        )}

        {/* TRUCK BODY (Stays centered, vibrations simulate suspension rumble) */}
        <motion.g
          animate={
            active
              ? {
                  y: [0, -1.2, 0.6, -1.0, 0.4, -0.6, 0],
                  rotate: [0, -1.2, 0.8, -1.0, 0.5, 0],
                }
              : { y: 0, rotate: 0 }
          }
          transition={
            active
              ? {
                  repeat: Infinity,
                  duration: 0.34,
                  ease: "easeInOut",
                }
              : { duration: 0.25 }
          }
        >
          {/* Main Cargo Container Box */}
          <rect
            x="6"
            y="9"
            width="14"
            height="13"
            rx="1.5"
            fill="#074230"
            stroke="#074230"
            strokeWidth="1.2"
          />
          {/* Cargo Details / Vittal Green Stripe */}
          <line x1="6" y1="13" x2="20" y2="13" stroke="#10B981" strokeWidth="1.4" />
          <line x1="6" y1="18" x2="20" y2="18" stroke="#04261B" strokeWidth="1" />

          {/* Cabin Base */}
          <path
            d="M20 12H24.5L27.5 16V22H20V12Z"
            fill="#0B5D44"
            stroke="#074230"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />

          {/* Cabin Windshield Glass */}
          <path
            d="M21 13.5H23.8L26 16.5H21V13.5Z"
            fill="#E6F4EA"
            stroke="#074230"
            strokeWidth="0.8"
          />

          {/* Headlight Beam (Illuminates road ahead when driving) */}
          {active ? (
            <motion.polygon
              points="27.5,19 33.5,17 33.5,23 27.5,21"
              fill="#FDE047"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.4, 0.85, 0.4] }}
              transition={{ repeat: Infinity, duration: 0.4 }}
            />
          ) : (
            <circle cx="27.5" cy="20" r="1" fill="#F59E0B" />
          )}

          {/* Front Bumper */}
          <rect x="27" y="21" width="1.5" height="1.5" rx="0.4" fill="#04261B" />

          {/* REAR WHEEL (Spins rapidly when active) */}
          <g transform="translate(10, 22)">
            <motion.g
              animate={active ? { rotate: [0, 360] } : { rotate: 0 }}
              transition={
                active
                  ? { repeat: Infinity, duration: 0.32, ease: "linear" }
                  : { duration: 0.2 }
              }
            >
              <circle cx="0" cy="0" r="3.2" fill="#111827" stroke="#074230" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.4" fill="#E5E7EB" />
              {/* Wheel spokes so spin is vivid */}
              <line x1="0" y1="-2.8" x2="0" y2="2.8" stroke="#374151" strokeWidth="0.8" />
              <line x1="-2.8" y1="0" x2="2.8" y2="0" stroke="#374151" strokeWidth="0.8" />
            </motion.g>
          </g>

          {/* FRONT WHEEL (Spins rapidly when active) */}
          <g transform="translate(24, 22)">
            <motion.g
              animate={active ? { rotate: [0, 360] } : { rotate: 0 }}
              transition={
                active
                  ? { repeat: Infinity, duration: 0.32, ease: "linear" }
                  : { duration: 0.2 }
              }
            >
              <circle cx="0" cy="0" r="3.2" fill="#111827" stroke="#074230" strokeWidth="1" />
              <circle cx="0" cy="0" r="1.4" fill="#E5E7EB" />
              {/* Wheel spokes so spin is vivid */}
              <line x1="0" y1="-2.8" x2="0" y2="2.8" stroke="#374151" strokeWidth="0.8" />
              <line x1="-2.8" y1="0" x2="2.8" y2="0" stroke="#374151" strokeWidth="0.8" />
            </motion.g>
          </g>
        </motion.g>
      </svg>
    </div>
  );
}

/**
 * Step 3 Icon: Smartphone OTP Doorstep Handover
 * Hover/Click: Smartphone screen animates into view -> tick appears on the screen -> tick stays anchored -> phone fades out leaving the checkmark!
 */
export function AnimatedOtpHandover({ isTriggered, className = "", onClick }: IconProps) {
  const [internalActive, setInternalActive] = useState(false);
  const active = Boolean(isTriggered || internalActive);

  // Auto reset click animation after 2.8s
  useEffect(() => {
    if (internalActive) {
      const timer = setTimeout(() => {
        setInternalActive(false);
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [internalActive]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalActive(true);
    onClick?.();
  };

  return (
    <div
      className={`relative w-8 h-8 flex items-center justify-center cursor-pointer select-none ${className}`}
      onMouseEnter={() => setInternalActive(true)}
      onMouseLeave={() => setInternalActive(false)}
      onClick={handleClick}
      title="Click or hover to verify OTP handover"
      aria-label="OTP Doorstep Delivery Verification Animation"
    >
      <div className="relative w-7 h-7 flex items-center justify-center">
        {/* SMARTPHONE FRAME:
            Appears (phase 1: 0 - 0.3s)
            Shows screen ticked (phase 2: 0.3s - 1.2s)
            Fades out (phase 3: 1.2s - 2.0s)
        */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          animate={
            active
              ? {
                  opacity: [0, 1, 1, 1, 0],
                  scale: [0.65, 1, 1, 1, 0.8],
                  y: [8, 0, 0, 0, -3],
                }
              : { opacity: 0, scale: 0.65, y: 8 }
          }
          transition={
            active
              ? {
                  duration: 2.2,
                  times: [0, 0.22, 0.55, 0.72, 1],
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
        >
          <svg
            viewBox="0 0 28 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-8"
          >
            {/* Phone Outer Shell (Deep luxury forest green casing) */}
            <rect
              x="4.5"
              y="2"
              width="19"
              height="28"
              rx="4"
              fill="#074230"
              stroke="#04261B"
              strokeWidth="1.2"
            />
            {/* Smartphone Inner Screen (Crisp glass display) */}
            <rect
              x="6"
              y="4.5"
              width="16"
              height="23"
              rx="2.5"
              fill="#FFFFFF"
            />
            {/* Camera Pill / Dynamic Island */}
            <rect
              x="11"
              y="5.5"
              width="6"
              height="1.5"
              rx="0.75"
              fill="#074230"
            />
            {/* OTP Status Tag on Phone Screen */}
            <rect
              x="7.5"
              y="8.5"
              width="13"
              height="3"
              rx="1.2"
              fill="#F3FAF7"
            />
            <line x1="9" y1="10" x2="19" y2="10" stroke="#10B981" strokeWidth="1" strokeLinecap="round" />

            {/* Small Home indicator bar at phone bottom */}
            <line
              x1="11"
              y1="25.5"
              x2="17"
              y2="25.5"
              stroke="#9CA3AF"
              strokeWidth="1"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        {/* VERIFIED TICK MARK:
            - When idle: clean centered CheckCircle2 icon
            - When active: smartphone appears around it, tick mark draws in with a bounce inside the phone screen,
              and then when the phone fades out, THE TICK STAYS THERE!
        */}
        <motion.div
          className="relative z-10 flex items-center justify-center"
          animate={
            active
              ? {
                  // Pops into the phone screen, pulses, and then settles firmly in the center!
                  scale: [0.8, 0, 1.2, 1, 1],
                  opacity: [1, 0, 1, 1, 1],
                  y: [0, 2, 2, 0, 0],
                }
              : { scale: 1, opacity: 1, y: 0 }
          }
          transition={
            active
              ? {
                  duration: 2.2,
                  times: [0, 0.18, 0.45, 0.75, 1],
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-[#074230]"
          >
            {/* Outer Circle */}
            <motion.circle
              cx="12"
              cy="12"
              r="9"
              stroke="#074230"
              strokeWidth="2.2"
              fill={active ? "#F3FAF7" : "none"}
              animate={
                active
                  ? {
                      stroke: ["#074230", "#10B981", "#074230"],
                      fill: ["#F3FAF7", "#E6F4EA", "#F3FAF7"],
                    }
                  : { stroke: "#074230" }
              }
              transition={{ duration: 1.2 }}
            />
            {/* Verification Checkmark (ticks in with pathLength) */}
            <motion.path
              d="M8 12L10.8 15L16 9"
              stroke="#074230"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={
                active
                  ? {
                      pathLength: [0, 0, 1, 1, 1],
                      stroke: ["#074230", "#059669", "#074230"],
                    }
                  : { pathLength: 1, stroke: "#074230" }
              }
              transition={
                active
                  ? {
                      duration: 2.2,
                      times: [0, 0.28, 0.52, 0.8, 1],
                      ease: "easeOut",
                    }
                  : { duration: 0.3 }
              }
            />
          </svg>
        </motion.div>

        {/* Success particle sparkles when ticked */}
        {active && (
          <motion.div
            className="absolute inset-0 pointer-events-none flex items-center justify-center z-20"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: [0, 0, 1, 0],
              scale: [0.6, 0.8, 1.4, 1.8],
            }}
            transition={{ duration: 1.6, times: [0, 0.35, 0.55, 1] }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] absolute -top-1 right-1" />
            <div className="w-1 h-1 rounded-full bg-[#059669] absolute -bottom-1 left-1" />
            <div className="w-1 h-1 rounded-full bg-[#34D399] absolute top-2 -left-1" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
