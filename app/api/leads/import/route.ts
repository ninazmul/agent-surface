import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { connectToDatabase } from "@/lib/database";
import Lead from "@/lib/database/models/lead.model";

type ExcelLeadRow = {
  name: string;
  email: string;
  number: string;
  gender?: string;
  maritalStatus?: string;
  dateOfBirth?: string;

  home_address?: string;
  home_zip?: string;
  home_country?: string;
  home_state?: string;
  home_city?: string;

  irish_address?: string;
  irish_zip?: string;
  irish_country?: string;
  irish_state?: string;
  irish_city?: string;

  passport_visa?: boolean;
  passport_number?: string;
  passport_country?: string;
  passport_file?: string;
  passport_issueDate?: string;
  passport_expirationDate?: string;

  arrival_flight?: string;
  arrival_file?: string;
  arrival_date?: string;
  arrival_time?: string;

  course_name?: string;
  course_duration?: string;
  course_type?: string;
  course_start_date?: string;
  course_end_date?: string;
  campus_name?: string;
  campus_shift?: string;
  course_fee?: string;

  services?: string; // JSON string

  note?: string;
  progress?: "Open" | "Contacted" | "Converted" | "Closed";
  date?: string;
  author_email?: string;

  isPinned?: boolean;

  others?: string; // JSON string

  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_skype?: string;

  discount?: string;
  quotationStatus?: boolean;
  paymentStatus?: boolean;
  transcript?: string;
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json<ExcelLeadRow>(sheet, { defval: "" });
    if (!rows.length) {
      return NextResponse.json({ success: false, error: "No valid leads found" });
    }

    const leads = rows.map((row) => ({
      name: row.name,
      email: row.email,
      number: row.number,
      gender: row.gender || "Unknown",
      maritalStatus: row.maritalStatus || "Unknown",
      dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : undefined,

      home: {
        address: row.home_address || "",
        zip: row.home_zip || "",
        country: row.home_country || "",
        state: row.home_state || "",
        city: row.home_city || "",
      },

      irish: {
        address: row.irish_address || "",
        zip: row.irish_zip || "",
        country: row.irish_country || "",
        state: row.irish_state || "",
        city: row.irish_city || "",
      },

      passport: {
        visa: row.passport_visa ?? false,
        number: row.passport_number || "",
        country: row.passport_country || "",
        file: row.passport_file || "",
        issueDate: row.passport_issueDate ? new Date(row.passport_issueDate) : undefined,
        expirationDate: row.passport_expirationDate ? new Date(row.passport_expirationDate) : undefined,
      },

      arrival: {
        flight: row.arrival_flight || "",
        file: row.arrival_file || "",
        date: row.arrival_date ? new Date(row.arrival_date) : undefined,
        time: row.arrival_time ? new Date(row.arrival_time) : undefined,
      },

      course: {
        name: row.course_name || "",
        courseDuration: row.course_duration || "",
        courseType: row.course_type || "",
        startDate: row.course_start_date ? new Date(row.course_start_date) : undefined,
        endDate: row.course_end_date ? new Date(row.course_end_date) : undefined,
        campus: {
          name: row.campus_name || "",
          shift: row.campus_shift || "",
        },
        courseFee: row.course_fee || "",
      },

      services: row.services ? JSON.parse(row.services) : [],
      note: row.note || "",
      progress: row.progress || "Open",
      date: row.date ? new Date(row.date) : new Date(),
      author: row.author_email || "Unknown",
      isPinned: row.isPinned ?? false,
      others: row.others ? JSON.parse(row.others) : [],

      social: {
        facebook: row.social_facebook || "",
        instagram: row.social_instagram || "",
        twitter: row.social_twitter || "",
        skype: row.social_skype || "",
      },

      discount: row.discount || "0",
      quotationStatus: row.quotationStatus ?? false,
      paymentStatus: row.paymentStatus ?? false,
      transcript: row.transcript || "",
    }));

    await connectToDatabase();
    const inserted = await Lead.insertMany(leads, { ordered: false });

    return NextResponse.json({ success: true, count: inserted.length });
  } catch (error) {
    console.error("Bulk lead import error:", error);
    return NextResponse.json({ success: false, error: "Failed to import leads" });
  }
}
