'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Play, Youtube, Search } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

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

export default function YouTubeDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const roomName = params?.roomName as string || '';

  const [data, setData] = useState<YouTubeApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedVideos, setDisplayedVideos] = useState<YouTubeVideo[]>([]);
  const [allVideosLoaded, setAllVideosLoaded] = useState(false);

  useEffect(() => {
    const fetchYouTubeData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/youtube?roomName=${roomName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch YouTube data');
        }
        const result = await response.json();
        setData(result);
        setDisplayedVideos(result.videos.slice(0, 12)); // Show first 12 videos initially (4 per row on large screens)
        setAllVideosLoaded(result.videos.length <= 12);
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
    return <YouTubeDetailsSkeleton />;
  }

  // Function to handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (data && data.videos) {
      if (query.trim() === '') {
        // Show first 12 videos when search is cleared
        setDisplayedVideos(data.videos.slice(0, 12));
        setAllVideosLoaded(data.videos.length <= 12);
      } else {
        // Filter videos based on search query
        const filteredVideos = data.videos.filter(video =>
          video.snippet.title.toLowerCase().includes(query.toLowerCase()) ||
          video.snippet.description.toLowerCase().includes(query.toLowerCase())
        );
        setDisplayedVideos(filteredVideos);
        setAllVideosLoaded(true); // Set to true since all matching videos are shown
      }
    }
  };

  // Function to load more videos
  const loadMoreVideos = () => {
    if (data && data.videos && displayedVideos.length < data.videos.length) {
      const currentIndex = displayedVideos.length;
      const nextVideos = data.videos.slice(currentIndex, currentIndex + 12); // Load 12 more videos at a time
      setDisplayedVideos(prev => [...prev, ...nextVideos]);

      // Check if we've loaded all videos
      if (displayedVideos.length + nextVideos.length >= data.videos.length) {
        setAllVideosLoaded(true);
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              YouTube Channel Details
            </h1>
          </div>
          
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8 text-center">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.channel || !data.videos) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              YouTube Channel Details
            </h1>
          </div>
          
          <div className="text-center py-8">
            <p className="text-gray-500">No YouTube content available</p>
          </div>
        </div>
      </div>
    );
  }

  const { channel, videos } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="mr-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Button>
          <div className="relative">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              YouTube Channel
            </h1>
            <div className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 w-full"></div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Channel Info */}
          <div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
            <div className="flex-shrink-0 relative">
              {channel.snippet.thumbnails?.medium?.url ? (
                <div className="relative">
                  <img
                    src={channel.snippet.thumbnails.medium.url}
                    alt={channel.snippet.title}
                    className="w-28 h-28 rounded-full border-4 border-red-500 shadow-lg"
                  />
                  <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-20"></div>
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 flex items-center justify-center border-4 border-red-500 shadow-lg">
                  <Youtube className="h-14 w-14 text-red-500" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                {channel.snippet.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 max-w-2xl line-clamp-2">
                {channel.snippet.description}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-5 rounded-xl border border-blue-200 dark:border-blue-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {channel.statistics.subscriberCount}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Subscribers</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-5 rounded-xl border border-green-200 dark:border-green-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {channel.statistics.videoCount}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Videos</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-5 rounded-xl border border-purple-200 dark:border-purple-800/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    {channel.statistics.viewCount}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Views</p>
                </div>
              </div>

              {/* Visit Channel Button */}
              <div className="flex justify-center md:justify-start">
                <a
                  href={`https://www.youtube.com/channel/${channel.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <div className="bg-white/20 p-1.5 rounded-full group-hover:animate-pulse">
                    <Youtube className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-semibold">Visit YouTube Channel</span>
                  <span className="transform group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Videos Section with Search and Load More */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="relative">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Latest Videos
                </h2>
                <div className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 w-24"></div>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-5 py-3 rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-300"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Videos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedVideos.map((video, index) => (
                <a
                  key={video.id.videoId}
                  href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group block border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative overflow-hidden">
                    {video.snippet.thumbnails?.high?.url ? (
                      <img
                        src={video.snippet.thumbnails.high.url}
                        alt={video.snippet.title}
                        className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-700 dark:to-gray-800 w-full h-48 flex items-center justify-center">
                        <Play className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                      <div className="bg-red-500 rounded-full p-4 animate-bounce">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-sm line-clamp-2 h-14 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {video.snippet.title}
                    </h3>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(video.snippet.publishedAt).toLocaleDateString()}
                      </p>
                      <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        YouTube
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Load More Button */}
            {data && data.videos && displayedVideos.length < data.videos.length && searchQuery === '' && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={loadMoreVideos}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 group"
                >
                  <span className="font-semibold">Load More Videos</span>
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {data.videos.length - displayedVideos.length} remaining
                  </span>
                </Button>
              </div>
            )}

            {/* Search Results Info */}
            {searchQuery && (
              <div className="text-center pt-2">
                <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-6 py-3 rounded-full border border-blue-200 dark:border-blue-800/50">
                  <p className="text-gray-700 dark:text-gray-300">
                    Showing <span className="font-bold text-blue-600 dark:text-blue-400">{displayedVideos.length}</span> of <span className="font-bold text-purple-600 dark:text-purple-400">{data?.videos.length}</span> videos matching
                    <span className="font-bold text-red-500"> "{searchQuery}"</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton component for loading state
function YouTubeDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-10 rounded-full mr-4" />
          <Skeleton className="h-8 w-64 rounded-xl" />
        </div>

        <div className="space-y-6">
          {/* Channel Info Skeleton */}
          <div className="flex flex-col md:flex-row items-center gap-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <Skeleton className="w-28 h-28 rounded-full" />
            <div className="flex-1">
              <div className="space-y-3">
                <Skeleton className="h-8 w-80 mx-auto md:mx-0 rounded-xl" />
                <Skeleton className="h-4 w-full mx-auto md:mx-0 rounded" />
                <Skeleton className="h-4 w-3/4 mx-auto md:mx-0 rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
                <div className="flex justify-center md:justify-start mt-4">
                  <Skeleton className="h-12 w-60 rounded-xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Videos Grid Skeleton */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <Skeleton className="h-8 w-48 rounded-xl" />
              <Skeleton className="h-12 w-80 rounded-xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <Skeleton className="w-full h-48" />
                  <div className="p-5">
                    <Skeleton className="h-4 w-full rounded mb-3" />
                    <Skeleton className="h-4 w-3/4 rounded mb-3" />
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center pt-4">
              <Skeleton className="h-12 w-60 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}