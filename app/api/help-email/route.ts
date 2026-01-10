import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

interface HelpRequestBody {
  agentName: string;
  agentEmail: string;
  message: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: HelpRequestBody = await req.json();

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
      from: `"${body.agentName}" <${process.env.EMAIL_USER}>`,
      to: "abpartnerportal@gmail.com",
      subject: `Help Request from Agent: ${body.agentName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; padding: 20px; background: #fff;">
          <h2 style="margin-bottom: 15px; font-size: 20px;">Agent Help Request</h2>
          <p><strong>Agent Name:</strong> ${body.agentName}</p>
          <p><strong>Agent Email:</strong> ${body.agentEmail}</p>
          <p><strong>Message:</strong></p>
          <p style="padding: 10px; border: 1px solid #eee; background: #f9f9f9;">${body.message}</p>
          <p style="margin-top: 20px; font-size: 12px; color: #555;">
            &copy; ${new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ message: "Help request sent successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error sending help request:", error);
    return NextResponse.json({ message: "Failed to send help request" }, { status: 500 });
  }
}
