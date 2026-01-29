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
  const res = await fetch(
    `/api/playlist?playlistId=${playlistId}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch playlist");
  }

  const videos: Video[] = await res.json();

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
