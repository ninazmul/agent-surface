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

export default async function YouTubePlaylist({ playlistId }: Props) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/playlist?playlistId=${playlistId}`
  );
  const videos: Video[] = await res.json();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Playlist Videos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <div key={video.snippet.resourceId.videoId} className="border rounded overflow-hidden shadow hover:shadow-lg transition">
            <a
              href={`https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={video.snippet.thumbnails.medium.url}
                width={320}
                height={180}
                alt={video.snippet.title}
                className="w-full"
              />
              <p className="p-2 font-medium">{video.snippet.title}</p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
