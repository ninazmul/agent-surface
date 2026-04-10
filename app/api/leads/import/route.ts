import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { connectToDatabase } from "@/lib/database";
import Lead from "@/lib/database/models/lead.model";
import { LeadParams } from "@/types";
import type { CellValue } from "exceljs";

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

  course_id?: string;
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
  allowed: T,
): T[number] =>
  allowed.includes(value as T[number]) ? (value as T[number]) : allowed[0];

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
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    const rows: ExcelLeadRow[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header row
      const values = row.values as CellValue[];

      rows.push({
        name: (values[1] as string) || "",
        email: (values[2] as string) || "",
        number: (values[3] as string) || "",
        gender: values[4] as string | undefined,
        maritalStatus: values[5] as string | undefined,
        dateOfBirth: values[6] as string | undefined,
        home_address: values[7] as string | undefined,
        home_zip: values[8] as string | undefined,
        home_country: values[9] as string | undefined,
        home_state: values[10] as string | undefined,
        home_city: values[11] as string | undefined,
        course_id: values[12] as string | undefined,
        course_name: values[13] as string | undefined,
        course_duration: values[14] as string | undefined,
        course_type: values[15] as string | undefined,
        course_start_date: values[16] as string | undefined,
        course_end_date: values[17] as string | undefined,
        campus_name: values[18] as string | undefined,
        campus_shift: values[19] as string | undefined,
        course_fee: values[20] as string | undefined,
        progress: values[21] as string | undefined,
        status: values[22] as string | undefined,
        date: values[23] as string | undefined,
        author: values[24] as string | undefined,
        social_facebook: values[25] as string | undefined,
        social_instagram: values[26] as string | undefined,
        social_twitter: values[27] as string | undefined,
        social_skype: values[28] as string | undefined,
      });
    });

    if (!rows.length) {
      return NextResponse.json(
        { success: false, error: "No valid rows found" },
        { status: 400 },
      );
    }

    const leads: LeadParams[] = rows.map((row) => ({
      name: row.name.trim(),
      email: row.email.trim(),
      number: row.number.trim(),
      gender: row.gender || "Unknown",
      maritalStatus: row.maritalStatus || "Unknown",
      dateOfBirth: parseDate(row.dateOfBirth) ?? new Date(),
      home: {
        address: row.home_address || "",
        zip: row.home_zip || "",
        country: row.home_country || "",
        state: row.home_state || "",
        city: row.home_city || "",
      },
      course: row.course_name
        ? [
            {
              _id: row.course_id || "",
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
      progress: enumOrDefault(row.progress, PROGRESS),
      status: enumOrDefault(row.status, STATUS),
      date: parseDate(row.date) ?? new Date(),
      author: row.author || "excel-import",
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
      { status: 500 },
    );
  }
}
