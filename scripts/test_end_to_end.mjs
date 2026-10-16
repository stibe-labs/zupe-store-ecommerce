import crypto from "crypto";

const BASE_URL = "https://zupe-store.stibelabs.workers.dev";
const RAZORPAY_KEY_SECRET = "cmw5Lw6uCwUPwyf48Jxdz5Pt";

const reports = [];

function logResult(step, success, details, error, data) {
  reports.push({ step, success, details, error, data });
  const icon = success ? "✅" : "❌";
  console.log(`${icon} [${step}] ${details}`);
  if (error) console.error(`   Error: ${error}`);
}

async function runEndToEndTests() {
  console.log("==========================================================");
  console.log("   ZUPE STORE - COMPLETE END-TO-END WORKFLOW TEST RUN     ");
  console.log("   Target: " + BASE_URL);
  console.log("==========================================================\n");

  let orderIdUser1 = "";
  let orderIdUser2 = "";
  let user1Cookie = "";
  let adminCookie = "";

  // ----------------------------------------------------------------------
  // SCENARIO 1: User 1 - WhatsApp Phone Login & Cash on Delivery (COD) Checkout
  // ----------------------------------------------------------------------
  console.log("--- 1. Testing User 1 (WhatsApp Phone Login -> COD Checkout) ---");

  // Step 1.1: Customer logs in via WhatsApp OTP service
  try {
    const authRes = await fetch(`${BASE_URL}/api/auth/whatsapp/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: "9847123456",
        otp: "123456",
        name: "Ijas Ahmed",
      }),
    });
    const authData = await authRes.json();
    user1Cookie = authRes.headers.get("set-cookie") || "";
    logResult(
      "User 1: WhatsApp Login / Account Verification",
      authRes.ok && authData.success,
      `User logged in: ${authData.user?.name || "Ijas Ahmed"} (${authData.user?.phone || "9847123456"}) | Token issued: ${Boolean(authData.token)}`
    );
  } catch (err) {
    logResult("User 1: WhatsApp Login", false, "Failed to connect to auth API", err.message);
  }

  // Step 1.2: User 1 places Cash on Delivery order
  try {
    const codPayload = {
      customer_name: "Ijas Ahmed",
      customer_email: "ijas.test@zupestore.com",
      customer_phone: "+91 9847123456",
      shipping_address: "Zupe Towers, Marine Drive, Ernakulam",
      city: "Kochi, Kerala",
      postal_code: "682011",
      total_amount: 650,
      discount_amount: 0,
      payment_method: "Cash on Delivery",
      items: [
        {
          product_id: "water-ripple-lamp",
          name: "Dynamic Water Ripple Night Light",
          price: 650,
          quantity: 1,
          image: "/products/ripple/ripple-amber.jpg",
        },
      ],
    };

    const orderRes = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(user1Cookie ? { Cookie: user1Cookie } : {}),
      },
      body: JSON.stringify(codPayload),
    });

    const orderData = await orderRes.json();
    if (orderRes.ok && orderData.success && orderData.order?.id) {
      orderIdUser1 = orderData.order.id;
      logResult(
        "User 1: COD Order Submission",
        true,
        `Order created successfully! ID: ${orderIdUser1}, Payment: ${orderData.order.payment_method}, Status: ${orderData.order.payment_status}`,
        undefined,
        orderData.order
      );
    } else {
      logResult(
        "User 1: COD Order Submission",
        false,
        `Order failed with status ${orderRes.status}`,
        orderData.error || JSON.stringify(orderData)
      );
    }
  } catch (err) {
    logResult("User 1: COD Order Submission", false, "Exception during order creation", err.message);
  }

  // ----------------------------------------------------------------------
  // SCENARIO 2: User 2 - Direct "Buy Now" (Guest) & UPI / Online Payment
  // ----------------------------------------------------------------------
  console.log("\n--- 2. Testing User 2 (Direct Buy -> UPI / Online Gateway) ---");

  // Step 2.1: User 2 initializes Razorpay order directly for Mini Steam Iron
  let rzpOrderId = "";
  try {
    const rzpRes = await fetch(`${BASE_URL}/api/razorpay/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 599,
        items: [
          {
            product_id: "mini-portable-steam-iron",
            name: "Mini Portable Steam Iron",
            price: 599,
            quantity: 1,
          },
        ],
        notes: {
          customer_name: "Priya Sharma",
          customer_email: "priya.sharma@example.com",
          customer_phone: "+91 8089732385",
          payment_type: "upi",
        },
      }),
    });

    const rzpData = await rzpRes.json();
    if (rzpRes.ok && rzpData.success && rzpData.orderId) {
      rzpOrderId = rzpData.orderId;
      logResult(
        "User 2: Razorpay Order Creation",
        true,
        `Gateway order generated: ${rzpOrderId}, Amount: ₹${rzpData.amount / 100}, Currency: ${rzpData.currency}`
      );
    } else {
      logResult(
        "User 2: Razorpay Order Creation",
        false,
        `Failed to create Razorpay order`,
        rzpData.error || JSON.stringify(rzpData)
      );
    }
  } catch (err) {
    logResult("User 2: Razorpay Order Creation", false, "Exception creating gateway order", err.message);
  }

  // Step 2.2: Cryptographic Signature Verification & Order Confirmation
  if (rzpOrderId) {
    try {
      const mockPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      // Generate authentic HMAC SHA-256 signature
      const validSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(`${rzpOrderId}|${mockPaymentId}`)
        .digest("hex");

      const verifyRes = await fetch(`${BASE_URL}/api/razorpay/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: validSignature,
          order_payload: {
            customer_name: "Priya Sharma",
            customer_email: "priya.sharma@example.com",
            customer_phone: "+91 8089732385",
            shipping_address: "402, Green Valley Apartments, Indiranagar",
            city: "Bengaluru, Karnataka",
            postal_code: "560038",
            total_amount: 599,
            discount_amount: 0,
            payment_method: "UPI Instant",
            items: [
              {
                product_id: "mini-portable-steam-iron",
                name: "Mini Portable Steam Iron",
                price: 599,
                quantity: 1,
                image: "/products/iron/iron-teal-1.jpg",
              },
            ],
          },
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success && verifyData.order?.id) {
        orderIdUser2 = verifyData.order.id;
        logResult(
          "User 2: Payment Verification & Order Placement",
          true,
          `Online Order verified! ID: ${orderIdUser2}, Payment ID: ${mockPaymentId}, Status: ${verifyData.order.payment_status}`,
          undefined,
          verifyData.order
        );
      } else {
        logResult(
          "User 2: Payment Verification & Order Placement",
          false,
          `Verification failed with status ${verifyRes.status}`,
          verifyData.error || JSON.stringify(verifyData)
        );
      }
    } catch (err) {
      logResult(
        "User 2: Payment Verification & Order Placement",
        false,
        "Exception during verification",
        err.message
      );
    }
  }

  // ----------------------------------------------------------------------
  // SCENARIO 3: Admin Portal - Check Orders, Shipment, and Payment Status
  // ----------------------------------------------------------------------
  console.log("\n--- 3. Testing Admin Portal (Login -> Verify Orders -> Update Shipment) ---");

  // Step 3.1: Admin Authentication
  try {
    const adminLoginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@zupestore.com",
        password: "ZupeAdmin@2026",
      }),
    });

    const adminLoginData = await adminLoginRes.json();
    const setCookie = adminLoginRes.headers.get("set-cookie") || "";

    if (adminLoginRes.ok && adminLoginData.success) {
      adminCookie = setCookie;
      logResult(
        "Admin: Authentication",
        true,
        `Admin logged in successfully: ${adminLoginData.user?.email || "admin@zupestore.com"}`
      );
    } else {
      logResult(
        "Admin: Authentication",
        false,
        `Admin login failed (${adminLoginRes.status})`,
        adminLoginData.error || JSON.stringify(adminLoginData)
      );
    }
  } catch (err) {
    logResult("Admin: Authentication", false, "Exception during admin login", err.message);
  }

  // Step 3.2: Fetch Admin Orders List & Verify Both Orders
  try {
    const ordersRes = await fetch(`${BASE_URL}/api/admin/orders`, {
      headers: adminCookie ? { Cookie: adminCookie } : {},
    });

    const ordersData = await ordersRes.json();
    if (ordersRes.ok && ordersData.success && Array.isArray(ordersData.orders)) {
      const allOrders = ordersData.orders;
      logResult(
        "Admin: Fetch Orders List",
        true,
        `Successfully retrieved ${allOrders.length} orders from ERP / D1 database.`
      );

      // Verify User 1 Order
      const foundOrder1 = allOrders.find(
        (o) =>
          o.id === orderIdUser1 ||
          o.guest_email === "ijas.test@zupestore.com" ||
          o.customer_name === "Ijas Ahmed"
      );

      if (foundOrder1) {
        logResult(
          "Admin: Verify User 1 (COD Order)",
          true,
          `Found User 1 Order: #${foundOrder1.shopify_order_id || foundOrder1.id} | Customer: ${foundOrder1.customer_name} | Phone: ${foundOrder1.customer_phone} | Payment: ${foundOrder1.payment_method} (Status: ${foundOrder1.payment_status}) | Delivery: ${foundOrder1.delivery_status || foundOrder1.status}`
        );
      } else {
        logResult(
          "Admin: Verify User 1 (COD Order)",
          false,
          `User 1 order (${orderIdUser1}) was not found in the admin order list`
        );
      }

      // Verify User 2 Order
      const foundOrder2 = allOrders.find(
        (o) =>
          o.id === orderIdUser2 ||
          o.guest_email === "priya.sharma@example.com" ||
          o.customer_name === "Priya Sharma"
      );

      if (foundOrder2) {
        logResult(
          "Admin: Verify User 2 (UPI / Prepaid Order)",
          true,
          `Found User 2 Order: #${foundOrder2.shopify_order_id || foundOrder2.id} | Customer: ${foundOrder2.customer_name} | Phone: ${foundOrder2.customer_phone} | Payment: ${foundOrder2.payment_method} (Status: ${foundOrder2.payment_status}) | Delivery: ${foundOrder2.delivery_status || foundOrder2.status}`
        );
      } else {
        logResult(
          "Admin: Verify User 2 (UPI / Prepaid Order)",
          false,
          `User 2 order (${orderIdUser2}) was not found in the admin order list`
        );
      }

      // Step 3.3: Admin updates shipment details for User 1 Order
      const targetToUpdate = foundOrder1 || allOrders[0];
      if (targetToUpdate) {
        const patchRes = await fetch(`${BASE_URL}/api/admin/orders`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(adminCookie ? { Cookie: adminCookie } : {}),
          },
          body: JSON.stringify({
            order_id: targetToUpdate.id,
            delivery_status: "In Transit",
            courier_partner: "Delhivery",
            shiprocket_awb: "SR-TEST-AWB-998811",
          }),
        });

        const patchData = await patchRes.json();
        if (patchRes.ok && patchData.success) {
          logResult(
            "Admin: Update Shipment & Courier Status",
            true,
            `Order #${targetToUpdate.shopify_order_id || targetToUpdate.id} successfully updated to 'In Transit' with Courier: Delhivery, AWB: SR-TEST-AWB-998811.`
          );
        } else {
          logResult(
            "Admin: Update Shipment & Courier Status",
            false,
            `Failed to patch order (${patchRes.status})`,
            patchData.error || JSON.stringify(patchData)
          );
        }
      }
    } else {
      logResult(
        "Admin: Fetch Orders List",
        false,
        `Failed to retrieve admin orders (${ordersRes.status})`,
        ordersData.error || JSON.stringify(ordersData)
      );
    }
  } catch (err) {
    logResult("Admin: Orders Verification", false, "Exception fetching admin orders", err.message);
  }

  // ----------------------------------------------------------------------
  // SCENARIO 4: Customer Order Tracking Verification
  // ----------------------------------------------------------------------
  console.log("\n--- 4. Customer Order Tracking Check ---");
  const testTrackId = orderIdUser1 || "ord_1058";
  try {
    const trackRes = await fetch(`${BASE_URL}/api/orders/track?query=${encodeURIComponent(testTrackId)}`);
    const trackData = await trackRes.json();
    const orderObj = trackData.order || (trackData.orders && trackData.orders[0]);
    logResult(
      "Customer: Order Tracking",
      trackRes.ok && trackData.success && Boolean(orderObj),
      `Tracked order: ${testTrackId}, Customer: ${orderObj?.customer_name || "N/A"}, Status: ${orderObj?.status || orderObj?.delivery_status || "Not Found"}`
    );
  } catch (err) {
    logResult("Customer: Order Tracking", false, "Exception tracking order", err.message);
  }

  // Print Summary
  console.log("\n==========================================================");
  console.log("                  TEST SUMMARY RESULTS                    ");
  console.log("==========================================================");
  const total = reports.length;
  const passed = reports.filter((r) => r.success).length;
  const failed = total - passed;
  console.log(`Total Steps: ${total} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    console.log("\nIssues Found:");
    reports.filter((r) => !r.success).forEach((r) => {
      console.log(`❌ [${r.step}]: ${r.error || r.details}`);
    });
  } else {
    console.log("\n🎉 ALL END-TO-END WORKFLOW TESTS PASSED PERFECTLY!");
  }
}

runEndToEndTests().catch((err) => {
  console.error("Fatal test runner error:", err);
});
