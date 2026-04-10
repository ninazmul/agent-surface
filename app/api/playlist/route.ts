import { NextResponse } from "next/server";

interface PlaylistItem {
  snippet?: {
    title?: string;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get("playlistId");
  const API_KEY = process.env.YOUTUBE_API_KEY;

  if (!playlistId) {
    return NextResponse.json(
      { error: "Missing playlistId" },
      { status: 400 }
    );
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "Missing YouTube API key" },
      { status: 500 }
    );
  }

  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: "YouTube API error" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Filter out deleted/private videos here too (extra safety)
    const items = (data.items ?? []).filter(
      (item: PlaylistItem) =>
        item.snippet?.title !== "Deleted video" &&
        item.snippet?.title !== "Private video"
    );

    return NextResponse.json(items);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch from YouTube" },
      { status: 500 }
    );
  }
}
