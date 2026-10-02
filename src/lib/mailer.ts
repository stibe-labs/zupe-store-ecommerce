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
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // If no SMTP credentials provided, log code and return gracefully
  if (!user || !pass) {
    console.log(`\n📧 [EMAIL SIMULATION]\nTo: ${to}\nSubject: ${subject}\n`);
    return { success: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"Zupe Store" <${user}>`,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Nodemailer error:", err);
    return { success: false, error: err.message };
  }
}
