'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Play, Youtube } from 'lucide-react';

interface YouTubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      medium: {
        url: string;
      };
      high: {
        url: string;
      };
    };
    channelTitle: string;
  };
}

interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: {
        url: string;
      };
      medium: {
        url: string;
      };
      high: {
        url: string;
      };
    };
  };
  statistics: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
  };
}

interface YouTubeApiResponse {
  roomName: string;
  channel: YouTubeChannel;
  videos: YouTubeVideo[];
}

interface YouTubeSectionProps {
  roomName?: string;
}

export default function YouTubeSection({ roomName }: YouTubeSectionProps) {
  const [data, setData] = useState<YouTubeApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchYouTubeData = async () => {
      try {
        setLoading(true);
        const encodedRoomName = roomName ? encodeURIComponent(roomName) : '';
        const response = await fetch(`/api/youtube?roomName=${encodedRoomName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch YouTube data');
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching YouTube data:', err);
        setError('Failed to load YouTube videos');
      } finally {
        setLoading(false);
      }
    };

    if (roomName) {
      fetchYouTubeData();
    } else {
      setError('No room name provided');
      setLoading(false);
    }
  }, [roomName]);

  if (loading) {
    return <YouTubeSectionSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 text-center">
        {error}
      </div>
    );
  }

  if (!data || !data.channel || !data.videos) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No YouTube content available</p>
      </div>
    );
  }

  const { channel, videos } = data;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Youtube className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Our YouTube Channel
          </h2>
        </div>
        {data?.roomName && (
          <p className="text-gray-600 dark:text-gray-300">
            {data.roomName} - Subscribe for the latest car updates and reviews
          </p>
        )}
      </div>

      {/* Channel Info */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0">
          {channel.snippet.thumbnails?.medium?.url ? (
            <img
              src={channel.snippet.thumbnails.medium.url}
              alt={channel.snippet.title}
              className="w-20 h-20 rounded-full border-4 border-red-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
              <Youtube className="h-10 w-10 text-red-500" />
            </div>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {channel.snippet.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
            {channel.snippet.description}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800/50">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {channel.statistics.subscriberCount}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Subscribers</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800/50">
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {channel.statistics.videoCount}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Videos</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800/50">
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {channel.statistics.viewCount}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Latest Videos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <a
              key={video.id.videoId}
              href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-xl transition-all duration-300 overflow-hidden group block border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400"
            >
              <div className="relative">
                {video.snippet.thumbnails?.high?.url ? (
                  <img
                    src={video.snippet.thumbnails.high.url}
                    alt={video.snippet.title}
                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-700 dark:to-gray-800 w-full h-40 flex items-center justify-center">
                    <Play className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-red-500 rounded-full p-3">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-sm line-clamp-2 h-12 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {video.snippet.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {new Date(video.snippet.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton component for loading state
function YouTubeSectionSkeleton() {
  return (
    <div className="space-y-6">
      {/* Section Header Skeleton */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-8 w-64 rounded" />
        </div>
        <Skeleton className="h-4 w-80 mx-auto rounded" />
      </div>

      {/* Channel Info Skeleton */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="flex-1">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden border border-gray-200 dark:border-gray-700">
              <Skeleton className="w-full h-40" />
              <div className="p-4">
                <Skeleton className="h-4 w-full rounded mb-2" />
                <Skeleton className="h-4 w-3/4 rounded mb-2" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}