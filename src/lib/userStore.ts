import { executeD1Query } from "@/lib/d1";
import { siteConfig } from "@/config/siteConfig";
import { normalizePhoneNumber } from "@/lib/whatsappOtp";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  role?: string;
  created_at: string;
}

// Memory cache fallback (indexed by both email and normalized phone digits)
const inMemoryUsers: Map<string, UserRecord> = new Map();
const inMemoryPhoneUsers: Map<string, UserRecord> = new Map();

// Seed default demo user (none)

export function findUserByEmail(email: string): UserRecord | null {
  const normalized = email.toLowerCase().trim();
  return inMemoryUsers.get(normalized) || null;
}

export function findUserByPhone(phone: string): UserRecord | null {
  const { digits } = normalizePhoneNumber(phone);
  if (!digits) return null;
  return inMemoryPhoneUsers.get(digits) || null;
}

export function normalizeUserRecord(user: UserRecord): UserRecord {
  if (
    !user.name ||
    user.name.trim() === "" ||
    user.name.trim().toLowerCase() === "customer" ||
    /^Customer\s*\d*$/i.test(user.name.trim())
  ) {
    const last4 = (user.phone || "").replace(/\D/g, "").slice(-4);
    user.name = last4 ? `User${last4}` : "User";
  }
  return user;
}

export async function findUserByEmailAsync(email: string): Promise<UserRecord | null> {
  const normalized = email.toLowerCase().trim();
  const cached = inMemoryUsers.get(normalized);
  if (cached) return normalizeUserRecord(cached);

  try {
    const rows = await executeD1Query<UserRecord>(
      `SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [normalized]
    );
    if (rows && rows.length > 0) {
      const user = normalizeUserRecord(rows[0]);
      inMemoryUsers.set(normalized, user);
      if (user.phone) {
        const { digits } = normalizePhoneNumber(user.phone);
        if (digits) inMemoryPhoneUsers.set(digits, user);
      }
      return user;
    }
  } catch (err) {
    console.warn("D1 user lookup error:", err);
  }

  return null;
}

export async function findUserByPhoneAsync(phone: string): Promise<UserRecord | null> {
  const { digits, e164, display } = normalizePhoneNumber(phone);
  if (!digits) return null;

  const raw10 = digits.slice(-10);

  const cached = inMemoryPhoneUsers.get(digits) || inMemoryPhoneUsers.get(raw10);
  if (cached) return normalizeUserRecord(cached);

  try {
    // Try matching phone column by formatted display (+91 9747 19 5000), E.164, raw digits, or sanitized digits
    const rows = await executeD1Query<UserRecord>(
      `SELECT * FROM users 
       WHERE phone = ? OR phone = ? OR phone = ? 
          OR REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '+', '') LIKE ?
       ORDER BY created_at DESC LIMIT 1`,
      [display, e164, digits, `%${raw10}%`]
    );

    if (rows && rows.length > 0) {
      const user = normalizeUserRecord(rows[0]);
      inMemoryPhoneUsers.set(digits, user);
      inMemoryPhoneUsers.set(raw10, user);
      if (user.email) inMemoryUsers.set(user.email.toLowerCase().trim(), user);
      return user;
    }
  } catch (err) {
    console.warn("D1 user phone lookup error:", err);
  }

  return null;
}

export async function saveUser(user: UserRecord): Promise<void> {
  const normalizedEmail = user.email ? user.email.toLowerCase().trim() : "";
  if (normalizedEmail) {
    inMemoryUsers.set(normalizedEmail, user);
  }

  if (user.phone) {
    const { digits } = normalizePhoneNumber(user.phone);
    if (digits) inMemoryPhoneUsers.set(digits, user);
  }

  try {
    await executeD1Query(
      `INSERT OR REPLACE INTO users (id, name, email, password_hash, phone, role, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.name,
        user.email || siteConfig.generateSyntheticEmail(user.id),
        user.password_hash || "",
        user.phone || null,
        user.role || "customer",
        user.created_at,
      ]
    );
  } catch (err) {
    console.warn("D1 user sync warning:", err);
  }
}

export async function findOrCreateWhatsAppUserAsync({
  phone,
  name,
}: {
  phone: string;
  name?: string;
}): Promise<{ user: UserRecord; isNew: boolean }> {
  const { digits, e164, display } = normalizePhoneNumber(phone);
  const last4 = display.replace(/\D/g, "").slice(-4) || digits.slice(-4);
  const defaultUserName = last4 ? `User${last4}` : "User";

  const existing = await findUserByPhoneAsync(phone);
  if (existing) {
    // If name was provided and user has default or placeholder name, update it
    if (name && name.trim()) {
      if (
        !existing.name ||
        existing.name === "Customer" ||
        /^Customer\s*\d*$/i.test(existing.name.trim()) ||
        /^User\s*\d*$/i.test(existing.name.trim())
      ) {
        existing.name = name.trim();
        await saveUser(existing);
      }
    } else if (
      !existing.name ||
      existing.name === "Customer" ||
      /^Customer\s*\d*$/i.test(existing.name.trim())
    ) {
      // Reconcile legacy "Customer 2385" or "Customer" to "User2385"
      existing.name = defaultUserName;
      await saveUser(existing);
    }
    return { user: existing, isNew: false };
  }

  // Create new customer record
  const newUserId = `usr_wa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newUser: UserRecord = {
    id: newUserId,
    name: name && name.trim() ? name.trim() : defaultUserName,
    email: siteConfig.generateSyntheticEmail(digits),
    password_hash: "",
    phone: display,
    role: "customer",
    created_at: new Date().toISOString(),
  };

  await saveUser(newUser);
  return { user: newUser, isNew: true };
}

export async function updateUserAsync(
  email: string,
  updates: { name?: string; phone?: string }
): Promise<UserRecord | null> {
  const normalized = email.toLowerCase().trim();
  let user = await findUserByEmailAsync(normalized);
  if (!user) {
    const last4 = (updates.phone || "").replace(/\D/g, "").slice(-4);
    user = {
      id: `usr_${Date.now()}`,
      name: updates.name || (last4 ? `User${last4}` : "User"),
      email: normalized,
      password_hash: "",
      phone: updates.phone,
      role: "customer",
      created_at: new Date().toISOString(),
    };
  } else {
    if (updates.name !== undefined) user.name = updates.name;
    if (updates.phone !== undefined) user.phone = updates.phone;
  }

  await saveUser(user);

  try {
    await executeD1Query(
      `UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE LOWER(email) = ?`,
      [updates.name ?? null, updates.phone ?? null, normalized]
    );
  } catch (err) {
    console.warn("D1 update user warning:", err);
  }

  return user;
}

