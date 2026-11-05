export type MailAttachment = {
  filename: string;
  content: Uint8Array;
};

export interface Mailer {
  send(
    to: string,
    subject: string,
    text: string,
    attachments?: MailAttachment[],
  ): Promise<void>;
}

class ConsoleMailer implements Mailer {
  async send(
    to: string,
    subject: string,
    text: string,
    attachments: MailAttachment[] = [],
  ) {
    console.log(`[mail] to=${to} subject="${subject}"\n${text}`);
    if (attachments.length) {
      console.log(
        `[mail] attachments=${attachments.map((attachment) => attachment.filename).join(", ")}`,
      );
    }
  }
}

class BrevoMailer implements Mailer {
  async send(
    to: string,
    subject: string,
    text: string,
    attachments: MailAttachment[] = [],
  ) {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    if (!apiKey)
      throw new Error("BREVO_API_KEY is required to send email with Brevo");
    if (!senderEmail)
      throw new Error(
        "BREVO_SENDER_EMAIL must be set to a verified Brevo sender",
      );

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: senderEmail,
          name: process.env.BREVO_SENDER_NAME || "Youniqlyf",
        },
        to: [{ email: to }],
        subject,
        textContent: text,
        ...(attachments.length
          ? {
              attachment: attachments.map((attachment) => ({
                name: attachment.filename,
                content: Buffer.from(attachment.content).toString("base64"),
              })),
            }
          : {}),
      }),
    });

    if (!response.ok)
      throw new Error(
        `Brevo email delivery failed with status ${response.status}`,
      );
  }
}

const consoleMailer = new ConsoleMailer();
const brevoMailer = new BrevoMailer();
let mailer: Mailer | null = null;

export function setMailer(m: Mailer) {
  mailer = m;
}

export function getMailer() {
  if (mailer) return mailer;

  const driver = process.env.MAIL_DRIVER;
  if (driver && driver !== "console" && driver !== "brevo") {
    throw new Error(`Unsupported MAIL_DRIVER: ${driver}`);
  }
  if (driver === "brevo" || process.env.BREVO_API_KEY) return brevoMailer;
  if (driver === "console" || process.env.NODE_ENV !== "production")
    return consoleMailer;
  throw new Error(
    "No production mailer configured; set BREVO_API_KEY and BREVO_SENDER_EMAIL",
  );
}
