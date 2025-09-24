import { NextRequest } from "next/server";
import nodemailer from "nodemailer";

export const POST = async (req: NextRequest) => {
  try {
    const { email, name, subject, html } = await req.json();

    if (!email) {
      return new Response("Recipient email is required", { status: 400 });
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

    await transporter.sendMail({
      from: `"Academic Bridge" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject || "Message from Academic Bridge",
      html:
        html ||
        `<p>Hi ${name || "there"},</p><p>This is a message from Academic Bridge.</p>`,
    });

    return new Response("Email sent successfully!", { status: 200 });
  } catch (error) {
    console.error("Send message error:", error);
    return new Response("Failed to send email", { status: 500 });
  }
};
