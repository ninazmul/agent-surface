import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { recipients, promotionTitle, promotionLink } = await req.json();

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { message: "No recipients provided" },
        { status: 400 }
      );
    }

    // Create transporter (use environment variables for real email & password)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send emails to all recipients
    const sendPromises = recipients.map((email: string) =>
      transporter.sendMail({
        from: `"Promotions" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `New Promotion: ${promotionTitle}`,
        html: `
          <p>Hello,</p>
          <p>A new promotion has been ${
            promotionLink ? "updated" : "created"
          }: <strong>${promotionTitle}</strong>.</p>
          <p>Check it out <a href="${promotionLink}">here</a>.</p>
          <p>Best regards,<br/>Your Team</p>
        `,
      })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({ message: "Emails sent successfully" });
  } catch (error) {
    console.error("Failed to send promotion emails:", error);
    return NextResponse.json(
      { message: "Failed to send emails" },
      { status: 500 }
    );
  }
}
