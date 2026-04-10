import { NextResponse } from "next/server";
import { getNotificationsByAgency } from "@/lib/actions/notification.actions";
import { INotification } from "@/lib/database/models/notification.model";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) return NextResponse.json([], { status: 400 });

  const notifs = await getNotificationsByAgency(email);

  const result = notifs.map((n:INotification) => {
    const readEntry = n.readBy?.find((r) => r.email === email);
    const userStatus = readEntry?.status === "read" ? "Read" : "Unread";
    return { ...n, userStatus };
  });

  return NextResponse.json(result);
}
