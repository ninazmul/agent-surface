import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { connectToDatabase } from "@/lib/database";
import Lead from "@/lib/database/models/lead.model";

export async function POST() {
  try {
    await connectToDatabase();

    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const leads = await Lead.find({
      createdAt: { $lte: sevenDaysAgo },
      progress: { $ne: "Closed" },
    });

    if (!leads.length) {
      return NextResponse.json({ success: true, message: "No pending leads" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
      logger: true,
      debug: true,
    });

    for (const lead of leads) {
      if (!lead.author) continue;

      await transporter.sendMail({
        from: `"Agent Surface" <${process.env.EMAIL_USER}>`,
        to: lead.author,
        subject: `⚠ Reminder: Lead "${lead.name}" is still open`,
        html: `
          <div style="font-family: Arial, sans-serif; padding:1rem; background:#f9f9f9; border-radius:8px;">
            <h2>Lead Reminder</h2>
            <p>Your lead <strong>${
              lead.name
            }</strong> has been open since <strong>${new Date(
          lead.createdAt
        ).toLocaleDateString("en-GB")}</strong>.</p>
            <p>Status: <span style="color:orange;">${lead.progress}</span></p>
            <p>Please take action to close or update this lead.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      message: `${leads.length} reminder emails sent`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Error sending reminders" },
      { status: 500 }
    );
  }
}
