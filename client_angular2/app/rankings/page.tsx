'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { getAdvertisers, Advertiser } from '@/lib/data';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Star, ThumbsUp, ImageIcon, Video, SearchX } from 'lucide-react';
import Link from 'next/link';
// Removed useAuth import to fix SSR prerendering issue

// RankedAdvertiserCard component
interface RankedAdvertiserCardProps {
  advertiser: Advertiser;
  rank: number;
  isFavorite: boolean;
  onFavorite: (id: number) => void;
  rankingType: string;
}

function RankedAdvertiserCard({
  advertiser,
  rank,
  isFavorite,
  onFavorite,
  rankingType,
}: RankedAdvertiserCardProps) {
  const getRankingInfoText = () => {
    switch (rankingType) {
      case 'rating':
      case 'overall':
        return (
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-yellow-400 fill-current" />
            <span>{advertiser.rating?.toFixed(1) || 'N/A'}/5</span>
          </div>
        );
      case 'reviews':
        return (
          <div className="flex items-center">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{advertiser.reviewsCount || 0} reviews</span>
          </div>
        );
      case 'likes':
        return (
          <div className="flex items-center">
            <ThumbsUp className="h-4 w-4 mr-1" />
            <span>{advertiser.likes || 0} likes</span>
          </div>
        );
      case 'newest':
        return (
          <div className="flex items-center">
            <span>
              Joined:{' '}
              {advertiser.createdAt ? new Date(advertiser.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800 border-slate-700 shadow-xl rounded-lg overflow-hidden flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-purple-500/40">
      <div className="relative h-56">
        <Link href={`/advertiser/${advertiser.id}`}>
          <Image
            src={advertiser.image || '/placeholder.svg'}
            alt={advertiser.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
        <Badge
          variant="secondary"
          className="absolute top-3 left-3 bg-black/70 text-white backdrop-blur-sm"
        >
          #{rank} {rankingType !== 'overall' && `in ${rankingType}`}
        </Badge>
        {advertiser.isVip && (
          <Badge
            variant="secondary"
            className="absolute top-3 right-3 bg-yellow-400 text-slate-900 font-bold px-2 py-1 text-xs rounded-full shadow-md"
          >
            VIP
          </Badge>
        )}
        {advertiser.isOnline && (
          <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 bg-green-500/80 text-white px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
            <span>Online</span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-semibold text-pink-400 hover:text-pink-300 transition-colors">
            <Link href={`/advertiser/${advertiser.id}`}>{advertiser.name}</Link>
          </h3>
          <div className="flex items-center text-sm text-yellow-400">
            <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
            {advertiser.rating?.toFixed(1) || 'N/A'} ({advertiser.reviewsCount || 0})
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-1">
          {advertiser.city} - Age: {advertiser.age}
        </p>

        {advertiser.headline && (
          <p className="text-md text-slate-300 italic mb-3 truncate" title={advertiser.headline}>
            &ldquo;{advertiser.headline}&rdquo;
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {advertiser.tags?.slice(0, 3).map((tag: string) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-purple-400 text-purple-300 text-xs px-2.5 py-0.5"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
          <div className="flex items-center">
            <ThumbsUp className="w-4 h-4 mr-1" /> {advertiser.likes || 0}
          </div>
          <div className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" /> {advertiser.commentsCount || 0}
          </div>
          <div className="flex items-center">
            {advertiser.hasPhotos && <ImageIcon className="w-4 h-4 mr-1" />}
            {advertiser.hasVideos && <Video className="w-4 h-4" />}
          </div>
        </div>

        <div className="mt-auto">
          <div className="text-sm font-semibold mb-3 text-slate-300">{getRankingInfoText()}</div>
          <div className="p-5 bg-slate-800/50 border-t border-slate-700 mt-auto -mx-5 -mb-5">
            <div className="flex gap-2 items-center justify-between">
              <Button
                variant="default"
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 w-2/3"
                asChild
              >
                <Link href={`/advertiser/${advertiser.id}`}>View Profile</Link>
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onFavorite(advertiser.id)}
                  aria-label="Favorite"
                  className="text-slate-400 border-slate-600 hover:bg-slate-700 hover:text-red-400 hover:border-red-500 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  aria-label="Message"
                  className="text-slate-400 border-slate-600 hover:bg-slate-700 hover:text-blue-400 hover:border-blue-500 transition-colors"
                >
                  <Link href={`/messages?recipient=${advertiser.id}`}>
                    <MessageCircle className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function RankingsPage() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rankingType, setRankingType] = useState<string>('overall');
  const [favoriteAdvertisers, setFavoriteAdvertisers] = useState<number[]>([]);
  // Removed useAuth call to fix SSR prerendering issue
  // const { user } = useAuth(); // user might be used for personalized features later

  useEffect(() => {
    async function loadAdvertisers() {
      try {
        setLoading(true);
        const fetchedAdvertisers = await getAdvertisers();
        setAdvertisers(fetchedAdvertisers);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load advertisers.';
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAdvertisers();
  }, []);

  useEffect(() => {
    // Add availability check for localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedFavorites = localStorage.getItem('favoriteAdvertisers');
      if (storedFavorites) {
        try {
          const parsedFavorites = JSON.parse(storedFavorites);
          if (
            Array.isArray(parsedFavorites) &&
            parsedFavorites.every(item => typeof item === 'number')
          ) {
            setFavoriteAdvertisers(parsedFavorites);
          } else {
            console.error('Parsed favorites is not an array of numbers');
            setFavoriteAdvertisers([]);
          }
        } catch (e) {
          console.error('Failed to parse favorites from localStorage', e);
          setFavoriteAdvertisers([]);
        }
      }
    }
  }, []);

  const handleFavorite = (advertiserId: number) => {
    if (typeof window !== 'undefined') {
      setFavoriteAdvertisers((prevFavorites: number[]) => {
        const newFavorites = prevFavorites.includes(advertiserId)
          ? prevFavorites.filter((id: number) => id !== advertiserId)
          : [...prevFavorites, advertiserId];
        localStorage.setItem('favoriteAdvertisers', JSON.stringify(newFavorites));
        return newFavorites;
      });
    }
  };

  const sortedAdvertisers = useMemo(() => {
    let sorted = [...advertisers];
    switch (rankingType) {
      case 'likes':
        sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0)); // Use advertiser.rating
        break;
      case 'newest':
        sorted.sort(
          (a, b) =>
            (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
            (a.createdAt ? new Date(a.createdAt).getTime() : 0),
        );
        break;
      case 'overall':
      default:
        // Example: sort by rating, then by likes if ratings are equal
        sorted.sort((a, b) => {
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return (b.likes || 0) - (a.likes || 0);
        });
        break;
    }
    return sorted;
  }, [advertisers, rankingType]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 text-white">
        <EnhancedNavbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          {/* Basic spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          <p className="ml-4 text-slate-300">Loading rankings...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 text-white">
        <EnhancedNavbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col justify-center items-center">
          <SearchX className="h-16 w-16 text-pink-400 mb-4" />
          <p className="text-xl text-pink-400 mb-2">Oops! Something went wrong.</p>
          <p className="text-slate-300 text-center mb-4">{error}</p>
          <Button
            variant="default"
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Try Again
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-900 to-purple-900 text-white">
      <EnhancedNavbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <header className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
            Top Ranked Advertisers
          </h1>
          <p className="mt-3 text-xl text-slate-300">
            Browse the highest rated and most popular profiles
          </p>
        </header>

        <div className="mb-8 flex flex-wrap justify-center items-center gap-2 sm:gap-4">
          <Button
            size="sm"
            className={
              rankingType === 'overall'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold'
                : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/70 hover:text-white'
            }
            onClick={() => setRankingType('overall')}
          >
            Overall
          </Button>
          <Button
            size="sm"
            className={
              rankingType === 'likes'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold'
                : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/70 hover:text-white'
            }
            onClick={() => setRankingType('likes')}
          >
            Most Liked
          </Button>
          <Button
            size="sm"
            className={
              rankingType === 'rating'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold'
                : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/70 hover:text-white'
            }
            onClick={() => setRankingType('rating')}
          >
            Top Rated
          </Button>
          <Button
            size="sm"
            className={
              rankingType === 'newest'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold'
                : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700/70 hover:text-white'
            }
            onClick={() => setRankingType('newest')}
          >
            Newest
          </Button>
        </div>

        {sortedAdvertisers.length === 0 ? (
          <div className="text-center py-10">
            <SearchX className="mx-auto h-12 w-12 text-pink-400 mb-4" />
            <p className="text-xl text-pink-400">No advertisers found.</p>
            <p className="text-sm text-slate-300 mt-2">
              Try a different ranking or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {sortedAdvertisers.map(
              (
                advertiser: Advertiser,
                index: number, // Explicitly type advertiser and index
              ) => (
                <RankedAdvertiserCard
                  key={advertiser.id}
                  advertiser={advertiser}
                  rank={index + 1}
                  isFavorite={favoriteAdvertisers.includes(advertiser.id)}
                  onFavorite={handleFavorite}
                  rankingType={rankingType}
                />
              ),
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
