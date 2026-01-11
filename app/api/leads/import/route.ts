import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { connectToDatabase } from "@/lib/database";
import Lead from "@/lib/database/models/lead.model";
import { LeadParams } from "@/types";

/* ---------------- TYPES ---------------- */

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

  course_name?: string;
  course_duration?: string;
  course_type?: string;
  course_start_date?: string;
  course_end_date?: string;
  campus_name?: string;
  campus_shift?: string;
  course_fee?: string;

  progress?: string;
  status?: string;

  date?: string;
  author?: string;

  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  social_skype?: string;
};

/* ---------------- ENUMS ---------------- */

const PROGRESS = ["Open", "Contacted", "Converted", "Closed"] as const;
const STATUS = ["Perception", "Cold", "Warm", "Hot"] as const;

const enumOrDefault = <T extends readonly string[]>(
  value: unknown,
  allowed: T
): T[number] =>
  allowed.includes(value as T[number])
    ? (value as T[number])
    : allowed[0];

/* ---------------- HELPERS ---------------- */

const parseDate = (val?: string) => {
  if (!val) return undefined;
  const d = new Date(val);
  return isNaN(d.getTime()) ? undefined : d;
};

/* ---------------- API ---------------- */

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<ExcelLeadRow>(sheet, {
      defval: "",
    });

    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: "No valid rows found" },
        { status: 400 }
      );
    }

    const leads: LeadParams[] = rows.map((row) => ({
      /* -------- REQUIRED -------- */
      name: row.name.trim(),
      email: row.email.trim(),
      number: row.number.trim(),

      /* -------- BASIC INFO -------- */
      gender: row.gender || "Unknown",
      maritalStatus: row.maritalStatus || "Unknown",
      dateOfBirth: parseDate(row.dateOfBirth) ?? new Date(),

      /* -------- HOME -------- */
      home: {
        address: row.home_address || "",
        zip: row.home_zip || "",
        country: row.home_country || "",
        state: row.home_state || "",
        city: row.home_city || "",
      },

      /* -------- COURSE (SINGLE → ARRAY) -------- */
      course: row.course_name
        ? [
            {
              name: row.course_name,
              courseDuration: row.course_duration || "",
              courseType: row.course_type || "",
              startDate: parseDate(row.course_start_date),
              endDate: parseDate(row.course_end_date),
              campus: {
                name: row.campus_name || "",
                shift: row.campus_shift || "",
              },
              courseFee: row.course_fee || "",
            },
          ]
        : [],

      /* -------- STATUS -------- */
      progress: enumOrDefault(row.progress, PROGRESS),
      status: enumOrDefault(row.status, STATUS),

      /* -------- META -------- */
      date: parseDate(row.date) ?? new Date(),
      author: row.author || "excel-import",

      /* -------- SOCIAL -------- */
      social: {
        facebook: row.social_facebook || "",
        instagram: row.social_instagram || "",
        twitter: row.social_twitter || "",
        skype: row.social_skype || "",
      },
    }));

    await connectToDatabase();
    const inserted = await Lead.insertMany(leads, { ordered: false });

    return NextResponse.json({
      success: true,
      inserted: inserted.length,
      total: rows.length,
    });
  } catch (error) {
    console.error("Excel lead import failed:", error);
    return NextResponse.json(
      { success: false, error: "Lead import failed" },
      { status: 500 }
    );
  }
}
