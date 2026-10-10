import { executeD1Query } from "@/lib/d1";
import { updateUserAsync } from "@/lib/userStore";
import { getOrders } from "@/lib/orderStore";

export interface UserAddress {
  id: string;
  user_id?: string;
  user_email: string;
  recipient_name: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
  tag?: "Home" | "Work" | "Other";
  created_at?: string;
}

// In-memory fallback map: email -> UserAddress[]
const inMemoryAddresses: Map<string, UserAddress[]> = new Map();

let tableInitialized = false;

export async function ensureAddressTable(): Promise<void> {
  if (tableInitialized) return;
  tableInitialized = true;

  try {
    await executeD1Query(`
      CREATE TABLE IF NOT EXISTS addresses (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_email TEXT NOT NULL,
        recipient_name TEXT NOT NULL,
        phone TEXT,
        street TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT,
        postal_code TEXT NOT NULL,
        country TEXT DEFAULT 'India',
        is_default INTEGER DEFAULT 0,
        tag TEXT DEFAULT 'Home',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      await executeD1Query(`CREATE INDEX IF NOT EXISTS idx_addresses_email ON addresses(user_email);`);
    } catch {}
  } catch (err) {
    console.warn("Could not ensure addresses table:", err);
  }
}

export async function getUserAddresses(
  email: string,
  userId?: string
): Promise<UserAddress[]> {
  const normEmail = (email || "").toLowerCase().trim();
  if (!normEmail) return [];

  let addresses: UserAddress[] = inMemoryAddresses.get(normEmail) || [];

  // Query D1 by verified email
  try {
    const rows = await executeD1Query<any>(
      `SELECT * FROM addresses WHERE LOWER(user_email) = ? ${userId ? "OR user_id = ?" : ""} ORDER BY is_default DESC, created_at DESC`,
      userId ? [normEmail, userId] : [normEmail]
    );

    if (rows && rows.length > 0) {
      addresses = rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        user_email: r.user_email || normEmail,
        recipient_name: r.recipient_name,
        phone: r.phone || "",
        street: r.street,
        city: r.city,
        state: r.state || "",
        postal_code: r.postal_code,
        country: r.country || "India",
        is_default: Number(r.is_default) === 1,
        tag: r.tag || "Home",
        created_at: r.created_at || new Date().toISOString(),
      }));
      inMemoryAddresses.set(normEmail, addresses);
    }
  } catch (err) {
    console.warn("D1 addresses fetch error:", err);
  }

  // If no address exists yet, check if customer already purchased in the past
  if (addresses.length === 0) {
    try {
      const pastOrders = getOrders(normEmail);
      if (pastOrders && pastOrders.length > 0) {
        const latestOrder = pastOrders[0];
        if (latestOrder.shipping_address) {
          const autoAddress: UserAddress = {
            id: `addr_auto_${Date.now()}`,
            user_id: userId || latestOrder.user_id,
            user_email: normEmail,
            recipient_name: latestOrder.customer_name || "Valued Customer",
            phone: latestOrder.customer_phone || "",
            street: latestOrder.shipping_address,
            city: latestOrder.city || "",
            state: "",
            postal_code: latestOrder.postal_code || "",
            country: "India",
            is_default: true,
            tag: "Home",
            created_at: latestOrder.created_at || new Date().toISOString(),
          };
          await saveUserAddress(autoAddress);
          return [autoAddress];
        }
      }
    } catch (e) {
      console.warn("Could not auto-sync address from past orders:", e);
    }
  }

  return addresses;
}

export async function saveUserAddress(address: UserAddress): Promise<UserAddress> {
  const normEmail = address.user_email.toLowerCase().trim();
  await ensureAddressTable();

  let userList = inMemoryAddresses.get(normEmail) || [];

  if (address.is_default) {
    userList = userList.map((a) => ({ ...a, is_default: false }));
    try {
      await executeD1Query(
        `UPDATE addresses SET is_default = 0 WHERE LOWER(user_email) = ? OR user_id = ?`,
        [normEmail, address.user_id || ""]
      );
    } catch {}
  }

  const existingIdx = userList.findIndex((a) => a.id === address.id);
  if (existingIdx >= 0) {
    userList[existingIdx] = address;
  } else {
    // If it's the very first address, enforce default
    if (userList.length === 0) {
      address.is_default = true;
    }
    userList = [address, ...userList];
  }

  inMemoryAddresses.set(normEmail, userList);

  // Sync to D1
  try {
    await executeD1Query(
      `INSERT OR REPLACE INTO addresses (id, user_id, user_email, recipient_name, phone, street, city, state, postal_code, country, is_default, tag, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        address.id,
        address.user_id || null,
        normEmail,
        address.recipient_name,
        address.phone || "",
        address.street,
        address.city,
        address.state || "",
        address.postal_code,
        address.country || "India",
        address.is_default ? 1 : 0,
        address.tag || "Home",
        address.created_at || new Date().toISOString(),
      ]
    );
  } catch (err) {
    console.warn("D1 address save error:", err);
  }

  return address;
}

export async function deleteUserAddress(id: string, email: string): Promise<boolean> {
  const normEmail = email.toLowerCase().trim();
  let userList = inMemoryAddresses.get(normEmail) || [];
  const removed = userList.find((a) => a.id === id);
  userList = userList.filter((a) => a.id !== id);

  // If we deleted the default and there are other addresses, make the first one default
  if (removed?.is_default && userList.length > 0) {
    userList[0].is_default = true;
  }

  inMemoryAddresses.set(normEmail, userList);

  try {
    await executeD1Query(`DELETE FROM addresses WHERE id = ?`, [id]);
    if (removed?.is_default && userList.length > 0) {
      await executeD1Query(`UPDATE addresses SET is_default = 1 WHERE id = ?`, [userList[0].id]);
    }
    return true;
  } catch (err) {
    console.warn("D1 address delete error:", err);
    return true;
  }
}

export async function setDefaultUserAddress(id: string, email: string): Promise<boolean> {
  const normEmail = email.toLowerCase().trim();
  let userList = inMemoryAddresses.get(normEmail) || [];
  userList = userList.map((a) => ({
    ...a,
    is_default: a.id === id,
  }));
  inMemoryAddresses.set(normEmail, userList);

  try {
    await executeD1Query(
      `UPDATE addresses SET is_default = 0 WHERE LOWER(user_email) = ?`,
      [normEmail]
    );
    await executeD1Query(`UPDATE addresses SET is_default = 1 WHERE id = ?`, [id]);
    return true;
  } catch (err) {
    console.warn("D1 set default address error:", err);
    return true;
  }
}

export async function syncAddressFromOrder(orderData: {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  city: string;
  postal_code: string;
  user_id?: string;
}): Promise<UserAddress | null> {
  if (!orderData.customer_email || !orderData.shipping_address) return null;

  const email = orderData.customer_email.toLowerCase().trim();

  // Also update user's profile phone if customer provided one
  if (orderData.customer_phone) {
    try {
      await updateUserAsync(email, { phone: orderData.customer_phone });
    } catch {}
  }

  const existing = await getUserAddresses(email, orderData.user_id);

  // Check if identical address already exists
  const isDuplicate = existing.some(
    (a) =>
      a.street.toLowerCase().trim() === orderData.shipping_address.toLowerCase().trim() &&
      a.postal_code.trim() === orderData.postal_code.trim()
  );

  if (isDuplicate) {
    return existing.find(
      (a) =>
        a.street.toLowerCase().trim() === orderData.shipping_address.toLowerCase().trim() &&
        a.postal_code.trim() === orderData.postal_code.trim()
    ) || existing[0];
  }

  // Parse state from city if combined (e.g. "Kochi, Kerala")
  let cleanCity = orderData.city || "";
  let cleanState = "";
  if (cleanCity.includes(",")) {
    const parts = cleanCity.split(",");
    cleanCity = parts[0].trim();
    cleanState = parts.slice(1).join(",").trim();
  }

  const newAddress: UserAddress = {
    id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    user_id: orderData.user_id,
    user_email: email,
    recipient_name: orderData.customer_name || "Valued Customer",
    phone: orderData.customer_phone || "",
    street: orderData.shipping_address,
    city: cleanCity,
    state: cleanState,
    postal_code: orderData.postal_code || "",
    country: "India",
    is_default: existing.length === 0,
    tag: "Home",
    created_at: new Date().toISOString(),
  };

  return await saveUserAddress(newAddress);
}
