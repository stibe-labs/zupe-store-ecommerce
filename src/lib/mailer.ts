import nodemailer from "nodemailer";

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
  const companyEmail = process.env.SMTP_USER || "stibelabs@gmail.com";
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  // 1. Check for Gmail SMTP if password is provided
  if (smtpPass) {
    try {
      const port = Number(process.env.SMTP_PORT) || 465;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port,
        secure: port === 465,
        auth: {
          user: companyEmail,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Zupe Store" <${companyEmail}>`,
        to,
        subject,
        html,
      });

      return { success: true };
    } catch (err: any) {
      console.error("Nodemailer SMTP error:", err);
      // Fall through to HTTP options if SMTP fails
    }
  }

  // 2. Check for Brevo API Key (Cloudflare Workers native HTTP REST API)
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (brevoApiKey) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "Zupe Store", email: companyEmail },
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });

      if (res.ok) {
        return { success: true };
      } else {
        const errorData = await res.text();
        console.error("Brevo API error:", errorData);
      }
    } catch (err: any) {
      console.error("Failed to send email via Brevo:", err);
    }
  }

  // 3. Check for Resend API Key (Cloudflare Workers native HTTP REST API)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || `Zupe Store <${companyEmail}>`;
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
      }
    } catch (err: any) {
      console.error("Failed to send email via Resend:", err);
    }
  }

  // 4. Fallback simulation mode
  console.log(`\n📧 [EMAIL SIMULATION]\nFrom: ${companyEmail}\nTo: ${to}\nSubject: ${subject}\n`);
  return {
    success: false,
    error: `SMTP credentials for ${companyEmail} not configured. Please configure SMTP_PASS in Cloudflare Worker secrets.`,
  };
}
