import Image from "next/image";

interface Video {
  snippet: {
    title: string;
    resourceId: { videoId: string };
    thumbnails: { medium: { url: string } };
  };
}

interface Props {
  playlistId: string;
}

export const dynamic = "force-dynamic";

export default async function YouTubePlaylist({ playlistId }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  let videos: Video[] = [];

  try {
    const res = await fetch(
      `${baseUrl}/api/playlist?playlistId=${playlistId}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return <p className="text-red-500">Failed to load playlist.</p>;
    }

    videos = await res.json();
  } catch {
    return <p className="text-red-500">Error fetching playlist.</p>;
  }

  if (!videos.length) {
    return <p>No videos found in this playlist.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Playlist Videos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <a
            key={video.snippet.resourceId.videoId}
            href={`https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border rounded overflow-hidden shadow hover:shadow-lg transition block"
          >
            <Image
              src={video.snippet.thumbnails.medium.url}
              width={320}
              height={180}
              alt={video.snippet.title}
              className="w-full"
            />
            <p className="p-2 font-medium line-clamp-2">
              {video.snippet.title}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
