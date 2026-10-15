import { executeD1Query } from "@/lib/d1";
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

// Seed default demo user
const demoUser: UserRecord = {
  id: "usr_demo",
  name: "Demo Customer",
  email: "demo@zupestore.com",
  password_hash: Buffer.from("Zupe1234").toString("base64"),
  phone: "+91 97781 37954",
  role: "customer",
  created_at: new Date().toISOString(),
};
inMemoryUsers.set("demo@zupestore.com", demoUser);
inMemoryPhoneUsers.set("919778137954", demoUser);

export function findUserByEmail(email: string): UserRecord | null {
  const normalized = email.toLowerCase().trim();
  return inMemoryUsers.get(normalized) || null;
}

export function findUserByPhone(phone: string): UserRecord | null {
  const { digits } = normalizePhoneNumber(phone);
  if (!digits) return null;
  return inMemoryPhoneUsers.get(digits) || null;
}

export async function findUserByEmailAsync(email: string): Promise<UserRecord | null> {
  const normalized = email.toLowerCase().trim();
  const cached = inMemoryUsers.get(normalized);
  if (cached) return cached;

  try {
    const rows = await executeD1Query<UserRecord>(
      `SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [normalized]
    );
    if (rows && rows.length > 0) {
      const user = rows[0];
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
  const { digits, e164 } = normalizePhoneNumber(phone);
  if (!digits) return null;

  const cached = inMemoryPhoneUsers.get(digits);
  if (cached) return cached;

  try {
    // Try matching phone column by E.164 (+91...), raw digits, or partial
    const rows = await executeD1Query<UserRecord>(
      `SELECT * FROM users 
       WHERE phone = ? OR phone = ? OR phone LIKE ? 
       ORDER BY created_at DESC LIMIT 1`,
      [e164, digits, `%${digits.slice(-10)}%`]
    );

    if (rows && rows.length > 0) {
      const user = rows[0];
      inMemoryPhoneUsers.set(digits, user);
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
        user.email || `${user.id}@customer.zupestore.com`,
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

  const existing = await findUserByPhoneAsync(phone);
  if (existing) {
    // If name was provided and user has default or placeholder name, update it
    if (name && name.trim() && (!existing.name || existing.name === "Customer")) {
      existing.name = name.trim();
      await saveUser(existing);
    }
    return { user: existing, isNew: false };
  }

  // Create new customer record
  const newUserId = `usr_wa_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const newUser: UserRecord = {
    id: newUserId,
    name: name && name.trim() ? name.trim() : `Customer ${display.slice(-4)}`,
    email: `${digits}@customer.zupestore.com`,
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
    user = {
      id: `usr_${Date.now()}`,
      name: updates.name || "Customer",
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

