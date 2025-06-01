'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { getAdvertisers, Advertiser, getProfileImage } from '@/lib/data';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Star, ThumbsUp, ImageIcon, Video, SearchX } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';

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
    <div className="bg-card border rounded-lg overflow-hidden shadow-lg transition-all hover:shadow-xl flex flex-col">
      <div className="relative h-56">
        <Link href={`/advertiser/${advertiser.id}`}>
          <Image
            src={getProfileImage(advertiser)}
            alt={advertiser.name}
            fill
            className="object-cover"
          />
        </Link>
        <Badge variant="secondary" className="absolute top-2 left-2 bg-black/70 text-white">
          #{rank} {rankingType !== 'overall' && `in ${rankingType}`}
        </Badge>
        {advertiser.isVip && (
          <Badge variant="secondary" className="absolute top-2 right-2 bg-yellow-500 text-black">
            VIP
          </Badge>
        )}
        {advertiser.isOnline && (
          <Badge
            variant="secondary"
            className="absolute bottom-2 left-2 bg-green-500/90 text-white"
          >
            Online
          </Badge>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-card-foreground">
            <Link href={`/advertiser/${advertiser.id}`} className="hover:text-primary">
              {advertiser.name}
            </Link>
          </h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
            {advertiser.rating?.toFixed(1) || 'N/A'} ({advertiser.reviewsCount || 0})
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-1 truncate h-5">
          {advertiser.headline || 'No headline'}
        </p>
        <div className="text-xs text-muted-foreground mb-3">
          {advertiser.city}, {advertiser.country || 'N/A'}
        </div>

        <div className="flex flex-wrap gap-1 mb-3 min-h-[26px]">
          {advertiser.tags?.slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
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
          {' '}
          {/* Pushes buttons to the bottom */}
          <div className="border-t pt-4">
            <div className="text-sm font-semibold mb-2 text-foreground">{getRankingInfoText()}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild className="flex-grow">
              <Link href={`/advertiser/${advertiser.id}`}>View Profile</Link>
            </Button>
            <Button
              variant={isFavorite ? 'default' : 'outline'}
              size="icon"
              onClick={() => onFavorite(advertiser.id)}
              aria-label="Favorite"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
            </Button>
            <Button variant="outline" size="icon" asChild aria-label="Message">
              <Link href={`/messages?recipient=${advertiser.id}`}>
                <MessageCircle className="w-4 h-4" />
              </Link>
            </Button>
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
  const { user } = useAuth(); // user might be used for personalized features later

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
  }, []);

  const handleFavorite = (advertiserId: number) => {
    setFavoriteAdvertisers((prevFavorites: number[]) => {
      const newFavorites = prevFavorites.includes(advertiserId)
        ? prevFavorites.filter((id: number) => id !== advertiserId)
        : [...prevFavorites, advertiserId];
      localStorage.setItem('favoriteAdvertisers', JSON.stringify(newFavorites));
      return newFavorites;
    });
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
      <div className="flex flex-col min-h-screen">
        <EnhancedNavbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          {/* Basic spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-muted-foreground">Loading rankings...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <EnhancedNavbar />
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col justify-center items-center">
          <SearchX className="h-16 w-16 text-destructive mb-4" />
          <p className="text-xl text-destructive mb-2">Oops! Something went wrong.</p>
          <p className="text-muted-foreground text-center mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <EnhancedNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-foreground">
          Top Advertisers
        </h1>

        <div className="mb-8 flex flex-wrap justify-center items-center gap-2 sm:gap-4">
          <Button
            size="sm"
            variant={rankingType === 'overall' ? 'default' : 'outline'}
            onClick={() => setRankingType('overall')}
          >
            Overall
          </Button>
          <Button
            size="sm"
            variant={rankingType === 'likes' ? 'default' : 'outline'}
            onClick={() => setRankingType('likes')}
          >
            Most Liked
          </Button>
          <Button
            size="sm"
            variant={rankingType === 'rating' ? 'default' : 'outline'}
            onClick={() => setRankingType('rating')}
          >
            Top Rated
          </Button>
          <Button
            size="sm"
            variant={rankingType === 'newest' ? 'default' : 'outline'}
            onClick={() => setRankingType('newest')}
          >
            Newest
          </Button>
        </div>

        {sortedAdvertisers.length === 0 ? (
          <div className="text-center py-10">
            <SearchX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No advertisers found.</p>
            <p className="text-sm text-muted-foreground mt-2">
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
