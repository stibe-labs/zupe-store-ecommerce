import { NextRequest, NextResponse } from "next/server";
import { getShiprocketToken } from "@/lib/shiprocketService";
import { getFastrrOrderDetails } from "@/lib/fastrr";
import { executeD1Query } from "@/lib/d1";

export const dynamic = "force-dynamic";

export interface LookupCustomerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPhone = searchParams.get("phone") || "";
    const cleanPhone = rawPhone.replace(/\D/g, "");
    const phone10 = cleanPhone.slice(-10);

    if (!phone10 || phone10.length !== 10) {
      return NextResponse.json(
        { success: false, error: "A valid 10-digit phone number is required" },
        { status: 400 }
      );
    }

    // 1. Check Shiprocket Orders & Fastrr structured details
    try {
      const token = await getShiprocketToken();
      if (token) {
        const srRes = await fetch(
          `https://apiv2.shiprocket.in/v1/external/orders?customer_phone=${encodeURIComponent(phone10)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(6000),
          }
        );

        if (srRes.ok) {
          const srData = await srRes.json();
          const orders = srData?.data || [];
          
          // Check orders to find a record matching this specific phone number
          for (const order of orders) {
            const channelOrderId = order.channel_order_id;
            if (channelOrderId) {
              const fastrrDetails = await getFastrrOrderDetails(channelOrderId);
              const shipping = fastrrDetails?.shipping_address;
              const fPhone = (fastrrDetails?.phone || shipping?.phone || "")
                .replace(/\D/g, "")
                .slice(-10);

              if (fPhone === phone10 && shipping && (shipping.line1 || shipping.city || shipping.pincode)) {
                const fullName = [shipping.first_name, shipping.last_name]
                  .filter(Boolean)
                  .join(" ")
                  .trim() || order.customer_name?.trim() || "";

                const streetAddr = [shipping.line1, shipping.line2]
                  .filter(Boolean)
                  .join(", ")
                  .trim();

                return NextResponse.json({
                  success: true,
                  found: true,
                  source: "shiprocket_fastrr",
                  customer: {
                    name: fullName,
                    email: shipping.email || fastrrDetails.email || order.customer_email || "",
                    phone: phone10,
                    address: streetAddr || order.customer_address || "",
                    city: shipping.city || order.customer_city || "",
                    state: shipping.state || order.customer_state || "",
                    pincode: shipping.pincode || order.customer_pincode || "",
                  },
                });
              }
            }

            // Check if unmasked customer phone matches in Shiprocket Core
            const corePhone = (order.customer_phone_unmasked || order.customer_phone || "")
              .replace(/\D/g, "")
              .slice(-10);

            if (corePhone === phone10 && (order.customer_address || order.customer_city)) {
              return NextResponse.json({
                success: true,
                found: true,
                source: "shiprocket",
                customer: {
                  name: (order.customer_name || "").trim(),
                  email: (order.customer_email || "").trim(),
                  phone: phone10,
                  address: (order.customer_address || "").trim(),
                  city: (order.customer_city || "").trim(),
                  state: (order.customer_state || "").trim(),
                  pincode: (order.customer_pincode || "").trim(),
                },
              });
            }
          }
        }
      }
    } catch (srErr) {
      console.warn("[CustomerLookup] Shiprocket query error:", srErr);
    }

    // 2. Check Local D1 Orders Table
    try {
      const d1OrderRes = await executeD1Query<any>(
        `SELECT customer_name, guest_email, shipping_address 
         FROM orders 
         WHERE customer_phone LIKE ? 
         ORDER BY id DESC LIMIT 1;`,
        [`%${phone10}%`]
      );

      const d1Order = d1OrderRes?.[0];
      if (d1Order && d1Order.shipping_address) {
        const parts = d1Order.shipping_address.split(",").map((p: string) => p.trim());
        let pincode = "";
        let state = "";
        let city = "";
        let street = d1Order.shipping_address;

        const pinMatch = d1Order.shipping_address.match(/\b\d{6}\b/);
        if (pinMatch) pincode = pinMatch[0];

        if (parts.length >= 3) {
          if (/india/i.test(parts[parts.length - 1]) && parts.length >= 4) {
            state = parts[parts.length - 3] || "";
            city = parts[parts.length - 4] || "";
            street = parts.slice(0, parts.length - 4).join(", ");
          }
        }

        return NextResponse.json({
          success: true,
          found: true,
          source: "local_orders",
          customer: {
            name: d1Order.customer_name || "",
            email: d1Order.guest_email || "",
            phone: phone10,
            address: street || d1Order.shipping_address,
            city: city,
            state: state,
            pincode: pincode,
          },
        });
      }
    } catch (d1Err) {
      console.warn("[CustomerLookup] D1 orders query error:", d1Err);
    }

    // 3. Check Local D1 Addresses Table
    try {
      const d1AddrRes = await executeD1Query<any>(
        `SELECT recipient_name, phone, street, city, state, postal_code 
         FROM addresses 
         WHERE phone LIKE ? 
         ORDER BY updated_at DESC LIMIT 1;`,
        [`%${phone10}%`]
      );

      const addr = d1AddrRes?.[0];
      if (addr && (addr.street || addr.city)) {
        return NextResponse.json({
          success: true,
          found: true,
          source: "local_addresses",
          customer: {
            name: addr.recipient_name || "",
            email: "",
            phone: phone10,
            address: addr.street || "",
            city: addr.city || "",
            state: addr.state || "",
            pincode: addr.postal_code || "",
          },
        });
      }
    } catch (addrErr) {
      console.warn("[CustomerLookup] D1 addresses query error:", addrErr);
    }

    return NextResponse.json({
      success: true,
      found: false,
      message: "No previous shipping records found for this phone number.",
    });
  } catch (error: any) {
    console.error("[CustomerLookup] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to look up customer details" },
      { status: 500 }
    );
  }
}
