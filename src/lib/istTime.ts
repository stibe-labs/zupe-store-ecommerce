/**
 * Indian Standard Time (IST / Asia/Kolkata) Utility Functions
 * Works reliably on Cloudflare Workers (where system timezone is UTC) and Client Browsers.
 */

export function parseDbTimestamp(str?: string | null): number {
  if (!str) return Date.now();
  const s = String(str).trim();
  // SQLite format: "YYYY-MM-DD HH:MM:SS" (stored in UTC)
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) {
    const d = new Date(`${s.substring(0, 19).replace(" ", "T")}Z`);
    return isNaN(d.getTime()) ? Date.now() : d.getTime();
  }
  if (s.includes("T") && !s.endsWith("Z") && !s.includes("+")) {
    const d = new Date(`${s}Z`);
    return isNaN(d.getTime()) ? Date.now() : d.getTime();
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? Date.now() : d.getTime();
}

/**
 * Format any Date, epoch timestamp, SQLite UTC string, or ISO string to IST 12-hour time (e.g. "01:25 AM")
 */
export function formatToIST(dateInput?: string | number | Date | null): string {
  if (!dateInput && dateInput !== 0) return "Just now";

  if (typeof dateInput === "string") {
    const s = dateInput.trim();
    if (s === "Just now" || s === "Today" || s === "Yesterday") return s;
  }

  let d: Date | null = null;
  if (dateInput instanceof Date) {
    d = isNaN(dateInput.getTime()) ? null : dateInput;
  } else if (typeof dateInput === "number") {
    d = new Date(dateInput);
  } else if (typeof dateInput === "string") {
    const s = dateInput.trim();
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) {
      d = new Date(`${s.substring(0, 19).replace(" ", "T")}Z`);
    } else if (s.includes("T") && !s.endsWith("Z") && !s.includes("+")) {
      d = new Date(`${s}Z`);
    } else if (/^\d{10,13}$/.test(s)) {
      const num = Number(s);
      d = new Date(num > 1e11 ? num : num * 1000);
    } else {
      d = new Date(s);
    }
  }

  if (!d || isNaN(d.getTime())) {
    return typeof dateInput === "string" ? dateInput : "Just now";
  }

  return d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).toUpperCase();
}

/**
 * Format conversation sidebar timestamp in IST:
 * - Today: "01:25 AM"
 * - Yesterday: "Yesterday"
 * - Older: "DD/MM/YY"
 */
export function formatChatListTimeIST(
  dateOrTimestamp?: string | number | Date | null,
  fallbackText?: string
): string {
  if (!dateOrTimestamp && dateOrTimestamp !== 0) return fallbackText || "Today";

  if (typeof dateOrTimestamp === "string") {
    const s = dateOrTimestamp.trim();
    if (s === "Just now" || s === "Today" || s === "Yesterday") return s;
  }

  let d: Date | null = null;
  if (typeof dateOrTimestamp === "number") {
    d = new Date(dateOrTimestamp);
  } else if (typeof dateOrTimestamp === "string") {
    const s = dateOrTimestamp.trim();
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) {
      d = new Date(`${s.substring(0, 19).replace(" ", "T")}Z`);
    } else if (s.includes("T") && !s.endsWith("Z") && !s.includes("+")) {
      d = new Date(`${s}Z`);
    } else if (/^\d{10,13}$/.test(s)) {
      const num = Number(s);
      d = new Date(num > 1e11 ? num : num * 1000);
    } else {
      d = new Date(s);
    }
  } else if (dateOrTimestamp instanceof Date) {
    d = dateOrTimestamp;
  }

  if (!d || isNaN(d.getTime())) {
    return fallbackText || (typeof dateOrTimestamp === "string" ? dateOrTimestamp : "Today");
  }

  // Current time in IST (YYYY-MM-DD)
  const now = new Date();
  const istNowStr = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  const istDateStr = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const timeStr = d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).toUpperCase();

  if (istNowStr === istDateStr) {
    return timeStr;
  }

  // Check Yesterday in IST
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const istYesterdayStr = yesterday.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  if (istDateStr === istYesterdayStr) {
    return "Yesterday";
  }

  return d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

