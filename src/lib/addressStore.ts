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
  last_used_at?: string;
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used_at TIMESTAMP
      );
    `);

    try {
      await executeD1Query(`CREATE INDEX IF NOT EXISTS idx_addresses_email ON addresses(user_email);`);
    } catch {}

    try {
      await executeD1Query(`ALTER TABLE addresses ADD COLUMN last_used_at TIMESTAMP;`);
    } catch {}
  } catch (err) {
    console.warn("Could not ensure addresses table:", err);
  }
}

export { normalizeAddressKey, deduplicateAddresses } from "@/lib/addressUtils";
import { normalizeAddressKey } from "@/lib/addressUtils";

export async function getUserAddresses(
  email: string,
  userId?: string
): Promise<UserAddress[]> {
  const normEmail = (email || "").toLowerCase().trim();
  if (!normEmail) return [];

  await ensureAddressTable();

  let addresses: UserAddress[] = [];

  // Query D1 by verified email
  try {
    const rows = await executeD1Query<any>(
      `SELECT * FROM addresses WHERE LOWER(user_email) = ? ${userId ? "OR user_id = ?" : ""} ORDER BY is_default DESC, created_at DESC`,
      userId ? [normEmail, userId] : [normEmail]
    );

    if (rows && rows.length > 0) {
      const seenKeys = new Map<string, UserAddress>();
      const duplicateIdsToDelete: string[] = [];
      let defaultFound = false;

      for (const r of rows) {
        const key = normalizeAddressKey(r.street, r.postal_code);
        const isDef = Number(r.is_default) === 1;

        if (seenKeys.has(key)) {
          // This row is an exact physical duplicate of an already processed address
          duplicateIdsToDelete.push(r.id);
        } else {
          // Exactly one address should retain is_default = true
          let isFinalDefault = false;
          if (isDef && !defaultFound) {
            isFinalDefault = true;
            defaultFound = true;
          }

          seenKeys.set(key, {
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
            is_default: isFinalDefault,
            tag: r.tag || "Home",
            created_at: r.created_at || new Date().toISOString(),
            last_used_at: r.last_used_at || undefined,
          });
        }
      }

      addresses = Array.from(seenKeys.values());

      // If any addresses exist, see if customer has a latest order in orders table to identify latest used address
      try {
        const latestOrderRows = await executeD1Query<any>(
          `SELECT shipping_address, postal_code, created_at FROM orders WHERE (LOWER(customer_email) = ? ${userId ? "OR user_id = ?" : ""}) AND shipping_address IS NOT NULL ORDER BY created_at DESC LIMIT 1`,
          userId ? [normEmail, userId] : [normEmail]
        );
        if (latestOrderRows && latestOrderRows.length > 0) {
          const latestShipping = latestOrderRows[0].shipping_address;
          const latestPin = latestOrderRows[0].postal_code;
          const latestTime = latestOrderRows[0].created_at || new Date().toISOString();
          const latestKey = normalizeAddressKey(latestShipping, latestPin);

          for (const addr of addresses) {
            if (!addr.last_used_at && normalizeAddressKey(addr.street, addr.postal_code) === latestKey) {
              addr.last_used_at = latestTime;
              try {
                await executeD1Query(`UPDATE addresses SET last_used_at = ? WHERE id = ?`, [latestTime, addr.id]);
              } catch {}
              break;
            }
          }
        }
      } catch (orderCheckErr) {
        // Non-fatal
      }

      // Sort with latest used address in first position
      addresses.sort((a, b) => {
        if (a.last_used_at && b.last_used_at) {
          const diff = new Date(b.last_used_at).getTime() - new Date(a.last_used_at).getTime();
          if (diff !== 0) return diff;
        }
        if (a.last_used_at && !b.last_used_at) return -1;
        if (!a.last_used_at && b.last_used_at) return 1;
        if (a.is_default && !b.is_default) return -1;
        if (!a.is_default && b.is_default) return 1;
        if (a.created_at && b.created_at) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        return 0;
      });

      // If no address was marked default but addresses exist, designate the first address as default
      if (!defaultFound && addresses.length > 0) {
        addresses[0].is_default = true;
        try {
          await executeD1Query(`UPDATE addresses SET is_default = 1 WHERE id = ?`, [addresses[0].id]);
        } catch {}
      }

      // Purge redundant duplicate rows from D1 asynchronously
      if (duplicateIdsToDelete.length > 0) {
        try {
          for (const dupId of duplicateIdsToDelete) {
            await executeD1Query(`DELETE FROM addresses WHERE id = ?`, [dupId]);
          }
        } catch (delErr) {
          console.warn("Failed to purge duplicate addresses from D1:", delErr);
        }
      }

      // Normalize D1 so only the chosen default address has is_default = 1
      const activeDefault = addresses.find((a) => a.is_default);
      if (activeDefault) {
        try {
          await executeD1Query(
            `UPDATE addresses SET is_default = 0 WHERE (LOWER(user_email) = ? OR user_id = ?) AND id != ?`,
            [normEmail, userId || "", activeDefault.id]
          );
        } catch {}
      }

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

  // Query D1 directly to get the current persisted state
  let existingAddresses: any[] = [];
  try {
    existingAddresses = (await executeD1Query<any>(
      `SELECT * FROM addresses WHERE LOWER(user_email) = ? OR user_id = ?`,
      [normEmail, address.user_id || ""]
    )) || [];
  } catch (e) {}

  const targetKey = normalizeAddressKey(address.street, address.postal_code);
  const existingMatch = existingAddresses.find(
    (a: any) =>
      a.id === address.id ||
      normalizeAddressKey(a.street, a.postal_code) === targetKey
  );

  // If an address with the same physical key already exists, reuse its ID to prevent duplicate records
  if (existingMatch) {
    address.id = existingMatch.id;
  }

  // Determine is_default properly
  if (existingAddresses.length === 0) {
    address.is_default = true;
  } else if (address.is_default) {
    // If making this address default, clear any other default in D1
    try {
      await executeD1Query(
        `UPDATE addresses SET is_default = 0 WHERE LOWER(user_email) = ? OR user_id = ?`,
        [normEmail, address.user_id || ""]
      );
    } catch {}
  } else {
    // If not explicitly set to default, ensure it doesn't accidentally become default if other addresses exist
    // However, if the existing match was already default and user didn't request a change, preserve it
    if (existingMatch && Number(existingMatch.is_default) === 1) {
      address.is_default = true;
    } else {
      address.is_default = false;
    }
  }

  // Sync to D1
  try {
    await executeD1Query(
      `INSERT OR REPLACE INTO addresses (id, user_id, user_email, recipient_name, phone, street, city, state, postal_code, country, is_default, tag, created_at, last_used_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        address.last_used_at || address.created_at || new Date().toISOString(),
      ]
    );
  } catch (err) {
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
    } catch (fallbackErr) {
      console.warn("D1 address save error:", fallbackErr);
    }
  }

  // Update inMemoryAddresses
  const userList = inMemoryAddresses.get(normEmail) || [];
  const idx = userList.findIndex((a) => a.id === address.id);
  if (idx >= 0) {
    userList[idx] = address;
  } else {
    userList.push(address);
  }
  inMemoryAddresses.set(normEmail, userList);

  return address;
}

export async function deleteUserAddress(id: string, email: string): Promise<boolean> {
  const normEmail = email.toLowerCase().trim();
  let userList = inMemoryAddresses.get(normEmail) || [];
  const removed = userList.find((a) => a.id === id);
  userList = userList.filter((a) => a.id !== id);

  try {
    await executeD1Query(`DELETE FROM addresses WHERE id = ?`, [id]);
    
    // If the deleted address was default, make the next existing address default in D1
    const remaining = await executeD1Query<any>(
      `SELECT * FROM addresses WHERE LOWER(user_email) = ? ORDER BY created_at DESC`,
      [normEmail]
    );
    if (remaining && remaining.length > 0 && (removed?.is_default || !remaining.some((r: any) => Number(r.is_default) === 1))) {
      await executeD1Query(`UPDATE addresses SET is_default = 1 WHERE id = ?`, [remaining[0].id]);
      if (userList.length > 0) userList[0].is_default = true;
    }
  } catch (err) {
    console.warn("D1 address delete error:", err);
  }

  inMemoryAddresses.set(normEmail, userList);
  return true;
}

export async function touchAddressLastUsed(id: string, email: string): Promise<boolean> {
  const normEmail = email.toLowerCase().trim();
  const now = new Date().toISOString();
  let userList = inMemoryAddresses.get(normEmail) || [];
  const found = userList.find((a) => a.id === id);
  if (found) {
    found.last_used_at = now;
  }

  try {
    await executeD1Query(
      `UPDATE addresses SET last_used_at = ? WHERE id = ? AND LOWER(user_email) = ?`,
      [now, id, normEmail]
    );
    return true;
  } catch (err) {
    console.warn("D1 touchAddressLastUsed error:", err);
    return false;
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
  const targetKey = normalizeAddressKey(orderData.shipping_address, orderData.postal_code);

  // Check if identical address already exists
  const existingMatch = existing.find(
    (a) => normalizeAddressKey(a.street, a.postal_code) === targetKey
  );

  const now = new Date().toISOString();

  if (existingMatch) {
    // Address already saved; update last_used_at and refresh details
    existingMatch.last_used_at = now;
    if (orderData.customer_name && !orderData.customer_name.startsWith("Customer ")) {
      existingMatch.recipient_name = orderData.customer_name;
    }
    if (orderData.customer_phone) {
      existingMatch.phone = orderData.customer_phone;
    }
    await saveUserAddress(existingMatch);
    return existingMatch;
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
    created_at: now,
    last_used_at: now,
  };

  return await saveUserAddress(newAddress);
}
