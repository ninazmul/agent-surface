import { NextRequest } from "next/server";
import nodemailer from "nodemailer";

export const POST = async (req: NextRequest) => {
  try {
    const { recipients } = await req.json();
    // recipients = [
    //   { email: string, name?: string, subject?: string, html?: string },
    //   ...
    // ]

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response("No recipients provided", { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const sendPromises = recipients.map(async (recipient) => {
      try {
        const {
          email,
          name,
          subject = "Message from Agent Surface",
          html,
        } = recipient;
        if (!email) return null;

        const finalHtml =
          html ||
          `<p>Hi ${
            name || "there"
          },</p><p>This is a message from Agent Surface.</p>`;

        return transporter.sendMail({
          from: `"Agent Surface" <${process.env.EMAIL_USER}>`,
          to: email,
          subject,
          html: finalHtml,
        });
      } catch (err) {
        console.error(`Failed to send to ${recipient.email}:`, err);
        return null;
      }
    });
    await Promise.all(sendPromises);

    return new Response(`Emails sent to ${sendPromises.length} recipient(s)!`, {
      status: 200,
    });
  } catch (error) {
    console.error("Email send error:", error);
    return new Response("Failed to send emails", { status: 500 });
  }
};
