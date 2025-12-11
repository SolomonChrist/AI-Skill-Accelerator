import { VideoResource } from "../types";

export const fetchYouTubeVideo = async (query: string, apiKey: string): Promise<Partial<VideoResource> | null> => {
  if (!apiKey) return null;

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`
    );

    if (!response.ok) {
      console.warn("YouTube API Error:", response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) return null;

    const item = data.items[0];
    const snippet = item.snippet;

    return {
      videoId: item.id.videoId,
      videoTitle: snippet.title, // Real title from YouTube
      channelTitle: snippet.channelTitle,
      thumbnailUrl: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
      description: snippet.description
    };
  } catch (error) {
    console.error("Failed to fetch YouTube video", error);
    return null;
  }
};