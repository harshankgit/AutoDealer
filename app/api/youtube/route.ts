import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

// Cache YouTube data in memory for 10 minutes
const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export async function GET(request: NextRequest) {
  try {
    // Get room name from query parameters
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get('roomName');

    if (!YOUTUBE_API_KEY) {
      return NextResponse.json(
        { error: "YouTube API key is not configured" },
        { status: 500 }
      );
    }

    if (!roomName) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    // First, search for the channel by name to get the channel ID
    // Use the exact room name for searching
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(roomName)}&key=${YOUTUBE_API_KEY}`
    );
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      console.log(`No YouTube channel found for room name: ${roomName}`);
      return NextResponse.json(
        { error: `No YouTube channel found for "${roomName}". Please make sure the channel exists on YouTube.` },
        { status: 404 }
      );
    }

    // Get the channel ID from the search results
    const channelId = searchData.items[0].id.channelId;

    // Check if we have cached data that's still valid for this specific channel
    const cacheKey = `${channelId}`;
    const cachedData = cache.get(cacheKey);

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log("Returning cached YouTube data");
      return NextResponse.json(cachedData.data);
    }

    // Channel details
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${YOUTUBE_API_KEY}`
    );
    const channelData = await channelResponse.json();

    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json(
        { error: "Channel not found" },
        { status: 404 }
      );
    }

    // Fetch ALL videos from the channel using pagination
    // Note: YouTube API limits channel video search to 500 videos per search request
    let allVideos: any[] = [];
    let nextPageToken: string | undefined;

    do {
      const videosResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&order=date&type=video&pageToken=${nextPageToken || ''}&key=${YOUTUBE_API_KEY}`
      );
      const videosData = await videosResponse.json();

      if (!videosData.items || videosData.items.length === 0) {
        break; // No more videos to fetch
      }

      allVideos = allVideos.concat(videosData.items);
      nextPageToken = videosData.nextPageToken;

      // Limit to prevent infinite loops (YouTube caps at 500 videos per search)
      if (allVideos.length >= 500) {
        console.log(`Reached YouTube API limit of 500 videos for channel ${channelId}`);
        break;
      }
    } while (nextPageToken);

    if (allVideos.length === 0) {
      return NextResponse.json(
        { error: "No videos found for this channel" },
        { status: 404 }
      );
    }

    // Sort videos by publish date (newest first)
    const sortedVideos = allVideos.sort((a, b) => {
      const dateA = new Date(a.snippet.publishedAt).getTime();
      const dateB = new Date(b.snippet.publishedAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    });

    // Create result object
    const result = {
      roomName, // Include the room name in the response
      channel: channelData.items[0],
      videos: sortedVideos,
    };

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching YouTube data:", error);
    return NextResponse.json(
      { error: "Failed to fetch YouTube data" },
      { status: 500 }
    );
  }
}