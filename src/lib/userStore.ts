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

export function saveUser(user: UserRecord): void {
  const normalized = user.email.toLowerCase().trim();
  inMemoryUsers.set(normalized, user);

  // Attempt D1 write async
  executeD1Query(
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
  ).catch((err) => console.warn("D1 user sync warning:", err));
}
