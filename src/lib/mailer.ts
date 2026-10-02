export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  // 1. Check for Resend API Key (Cloudflare Workers friendly HTTP API)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "Zupe Store <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
        }),
      });

      if (res.ok) {
        return { success: true };
      } else {
        const errorData = await res.text();
        console.error("Resend API error:", errorData);
        return { success: false, error: "Resend API error: " + errorData };
      }
    } catch (err: any) {
      console.error("Failed to send email via Resend:", err);
      return { success: false, error: err.message };
    }
  }

  // 2. Check for Brevo API Key
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "noreply@zupestore.com";
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Zupe Store", email: fromEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });

      if (res.ok) {
        return { success: true };
      }
    } catch (err: any) {
      console.error("Failed to send email via Brevo:", err);
    }
  }

  // 3. Fallback simulation mode
  console.log(`\n📧 [EMAIL SIMULATION]\nTo: ${to}\nSubject: ${subject}\n`);
  return { success: false, error: "SMTP/Email service credentials not configured" };
}
