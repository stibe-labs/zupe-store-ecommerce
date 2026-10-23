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

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
  attachments,
}: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  const companyEmail = process.env.SMTP_USER || "zupestoreonline@gmail.com";
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";
  const smtpPass = rawPass.replace(/\s+/g, "");
  const fromAddress = from || `"Zupe Store" <${companyEmail}>`;
  const replyToAddress = replyTo || companyEmail;

  // 1. Check for Gmail SMTP if password is provided
  if (smtpPass) {
    // A. In Cloudflare Workers environment, use WorkerMailer with cloudflare:sockets
    try {
      const { WorkerMailer } = await import("worker-mailer");
      const wmAttachments: Array<{ filename: string; content: string; mimeType?: string }> = [];
      if (Array.isArray(attachments)) {
        for (const att of attachments) {
          if (att.content) {
            const b64 = Buffer.isBuffer(att.content)
              ? att.content.toString("base64")
              : typeof att.content === "string"
              ? att.content
              : Buffer.from(att.content).toString("base64");
            wmAttachments.push({
              filename: att.filename,
              content: b64,
              mimeType: att.contentType,
            });
          }
        }
      }

      await WorkerMailer.send(
        {
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT) || 465,
          secure: true,
          authType: ["login", "plain"],
          credentials: {
            username: companyEmail,
            password: smtpPass,
          },
        },
        {
          from: { name: "Zupe Store", email: companyEmail },
          to,
          reply: replyToAddress,
          subject,
          html,
          text,
          attachments: wmAttachments.length > 0 ? wmAttachments : undefined,
        }
      );

      console.log(`[Mailer] ✅ Cloudflare WorkerMailer delivered email to ${to} via Gmail SMTP`);
      return { success: true };
    } catch (cfErr: any) {
      console.warn("[Mailer] WorkerMailer socket connection attempt failed / not in CF:", cfErr?.message || cfErr);
      // Fall through to standard Node.js nodemailer
    }

    // B. Standard Node.js environment fallback
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
        tls: {
          rejectUnauthorized: false,
        },
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

      console.log(`[Mailer] ✅ Nodemailer delivered email to ${to} from ${fromAddress}`);
      return { success: true };
    } catch (err: any) {
      console.error("[Mailer] Nodemailer SMTP error:", err);
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
