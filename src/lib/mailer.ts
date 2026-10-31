import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: any;
    cid?: string;
    contentType?: string;
    contentDisposition?: string;
  }>;
}

const DEFAULT_SMTP_HOST = "smtp.gmail.com";
const DEFAULT_SMTP_PORT = 465;
const DEFAULT_SMTP_USER = "zupestoreonline@gmail.com";
const DEFAULT_SMTP_PASS = "wwgfnukdhczwknba";

export function getMailConfig() {
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  let host = process.env.SMTP_HOST;
  let port = process.env.SMTP_PORT;

  // Try OpenNext Cloudflare Context
  if (!pass) {
    try {
      const { getCloudflareContext } = require("@opennextjs/cloudflare");
      const ctx = getCloudflareContext();
      if (ctx?.env) {
        user = user || ctx.env.SMTP_USER;
        pass = pass || ctx.env.SMTP_PASS || ctx.env.GMAIL_APP_PASSWORD;
        host = host || ctx.env.SMTP_HOST;
        port = port || ctx.env.SMTP_PORT;
      }
    } catch {}
  }

  // Try globalThis.__cf_env__
  if (!pass && (globalThis as any).__cf_env__) {
    const env = (globalThis as any).__cf_env__;
    user = user || env.SMTP_USER;
    pass = pass || env.SMTP_PASS || env.GMAIL_APP_PASSWORD;
    host = host || env.SMTP_HOST;
    port = port || env.SMTP_PORT;
  }

  return {
    user: (user || DEFAULT_SMTP_USER).trim(),
    pass: (pass || DEFAULT_SMTP_PASS).trim().replace(/\s+/g, ""),
    host: (host || DEFAULT_SMTP_HOST).trim(),
    port: Number(port || DEFAULT_SMTP_PORT),
  };
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
  attachments,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const mailConfig = getMailConfig();
  const companyEmail = mailConfig.user;
  const smtpPass = mailConfig.pass;
  const fromAddress = from || `"Zupe Store" <${companyEmail}>`;
  const replyToAddress = replyTo || companyEmail;

  // 1. Check for Gmail SMTP if password is provided
  if (smtpPass) {
    try {
      const port = mailConfig.port || 465;
      const transporter = nodemailer.createTransport({
        host: mailConfig.host || "smtp.gmail.com",
        port,
        secure: port === 465,
        auth: {
          user: companyEmail,
          pass: smtpPass,
        },
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
      });

      await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        text,
        replyTo: replyToAddress,
        attachments: attachments as any,
      });

      console.log(`[Mailer] ✅ SMTP email delivered to ${to} from ${fromAddress}`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error("[Mailer] Nodemailer SMTP error:", errMsg, err?.stack);
      // If HTTP providers are not configured, return this exact SMTP error so we know why it failed
      if (!process.env.BREVO_API_KEY && !process.env.RESEND_API_KEY) {
        return { success: false, error: `SMTP error: ${errMsg}` };
      }
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
