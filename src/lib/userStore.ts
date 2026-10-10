import { executeD1Query } from "@/lib/d1";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  phone?: string;
  role?: string;
  created_at: string;
}

// Memory cache fallback
const inMemoryUsers: Map<string, UserRecord> = new Map();

// Seed default demo user
inMemoryUsers.set("demo@zupestore.com", {
  id: "usr_demo",
  name: "Demo Customer",
  email: "demo@zupestore.com",
  password_hash: Buffer.from("Zupe1234").toString("base64"),
  phone: "+1 555-0199",
  role: "customer",
  created_at: new Date().toISOString(),
});

export function findUserByEmail(email: string): UserRecord | null {
  const normalized = email.toLowerCase().trim();
  return inMemoryUsers.get(normalized) || null;
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
      return user;
    }
  } catch (err) {
    console.warn("D1 user lookup error:", err);
  }

  return null;
}

export async function saveUser(user: UserRecord): Promise<void> {
  const normalized = user.email.toLowerCase().trim();
  inMemoryUsers.set(normalized, user);

  try {
    await executeD1Query(
      `INSERT OR REPLACE INTO users (id, name, email, password_hash, phone, role, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.name,
        user.email,
        user.password_hash,
        user.phone || null,
        user.role || "customer",
        user.created_at,
      ]
    );
  } catch (err) {
    console.warn("D1 user sync warning:", err);
  }
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

  inMemoryUsers.set(normalized, user);

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

