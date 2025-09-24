import { NextResponse } from "next/server";
import { getAllLeads } from "@/lib/actions/lead.actions";

const SECRET_KEY = process.env.LEADS_API_KEY;

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key");

  if (!apiKey || apiKey !== SECRET_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leads = await getAllLeads();
    return NextResponse.json({ leads });
  } catch (err) {
    console.error("Error fetching leads:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
