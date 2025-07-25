'use client';

import type React from 'react';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Heart, MessageCircle } from 'lucide-react';
import { getFallbackFemaleImage, getProfileImage } from '@/lib/data';

interface Advertiser {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: number;
  images: string[];
  rating: number;
  reviewCount?: number;
  mediaRating?: number;
  popularity?: number;
  tags: string[];
  isOnline?: boolean;
}

const mockAdvertisers: Advertiser[] = [
  {
    id: '1',
    name: 'Sophia',
    age: 28,
    location: 'Stockholm',
    distance: 2,
    images: ['/assets/img/profiles/random1.jpg'],
    rating: 4.9,
    reviewCount: 156,
    mediaRating: 4.8,
    popularity: 2340,
    tags: ['Massage', 'Wellness', 'Premium'],
    isOnline: true,
  },
  {
    id: '2',
    name: 'Emma',
    age: 25,
    location: 'Gothenburg',
    distance: 5,
    images: ['/assets/img/profiles/random2.jpg'],
    rating: 4.8,
    reviewCount: 134,
    mediaRating: 4.7,
    popularity: 2100,
    tags: ['Dance', 'Entertainment', 'VIP'],
    isOnline: false,
  },
  {
    id: '3',
    name: 'Olivia',
    age: 27,
    location: 'Malmö',
    distance: 3,
    images: ['/assets/img/profiles/random3.jpg'],
    rating: 4.7,
    reviewCount: 98,
    mediaRating: 4.9,
    popularity: 1890,
    tags: ['Massage', 'Therapy'],
    isOnline: true,
  },
  {
    id: '4',
    name: 'Isabella',
    age: 24,
    location: 'Uppsala',
    distance: 7,
    images: ['/assets/img/profiles/random4.jpg'],
    rating: 4.6,
    reviewCount: 87,
    mediaRating: 4.6,
    popularity: 1750,
    tags: ['Dance', 'Entertainment', 'Premium'],
    isOnline: false,
  },
  {
    id: '5',
    name: 'Mia',
    age: 26,
    location: 'Stockholm',
    distance: 4,
    images: ['/assets/img/profiles/random5.jpg'],
    rating: 4.5,
    reviewCount: 76,
    mediaRating: 4.5,
    popularity: 1650,
    tags: ['Massage', 'Wellness', 'VIP'],
    isOnline: true,
  },
];

export default function RankingsPage() {
  const [activeTab, setActiveTab] = useState('rating');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [advertisers, setAdvertisers] = useState<{
    rating: Advertiser[];
    reviews: Advertiser[];
    media: Advertiser[];
    popularity: Advertiser[];
  }>({
    rating: [],
    reviews: [],
    media: [],
    popularity: [],
  });

  const ratingTrackRef = useRef<HTMLDivElement>(null);
  const reviewsTrackRef = useRef<HTMLDivElement>(null);
  const mediaTrackRef = useRef<HTMLDivElement>(null);
  const popularityTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Sort advertisers by different criteria after component mounts
    const sortedByRating = [...mockAdvertisers].sort((a, b) => b.rating - a.rating);
    const sortedByReviews = [...mockAdvertisers].sort(
      (a, b) => (b.reviewCount || 0) - (a.reviewCount || 0),
    );
    const sortedByMedia = [...mockAdvertisers].sort(
      (a, b) => (b.mediaRating || 0) - (a.mediaRating || 0),
    );
    const sortedByPopularity = [...mockAdvertisers].sort(
      (a, b) => (b.popularity || 0) - (a.popularity || 0),
    );

    setAdvertisers({
      rating: sortedByRating,
      reviews: sortedByReviews,
      media: sortedByMedia,
      popularity: sortedByPopularity,
    });
  }, []);

  const getTrackRef = (category: string) => {
    switch (category) {
      case 'rating':
        return ratingTrackRef;
      case 'reviews':
        return reviewsTrackRef;
      case 'media':
        return mediaTrackRef;
      case 'popularity':
        return popularityTrackRef;
      default:
        return null;
    }
  };

  const scrollCarousel = (category: string, direction: 'prev' | 'next') => {
    const trackRef = getTrackRef(category);
    if (trackRef?.current) {
      const cardWidth = 320; // Card width + gap
      const scrollAmount = cardWidth * 2;
      trackRef.current.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => (prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]));
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const renderCarousel = (
    category: string,
    title: string,
    items: Advertiser[],
    trackRef: React.RefObject<HTMLDivElement>,
  ) => (
    <div className="carousel-container">
      <div className="carousel-header">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <div className="carousel-controls">
          <button className="control-button" onClick={() => scrollCarousel(category, 'prev')}>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="control-button" onClick={() => scrollCarousel(category, 'next')}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="carousel-wrapper">
        <div className="carousel-track" ref={trackRef}>
          {items.map((advertiser, index) => (
            <div key={advertiser.id} className="carousel-card">
              <div className="card-rank">{index + 1}</div>
              <div className="card-image relative">
                <Image
                  src={advertiser.images[0] || '/placeholder.svg'}
                  alt={advertiser.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="card-badges">
                  {advertiser.isOnline && <span className="badge online">Online</span>}
                  {category === 'rating' && (
                    <span className="badge rating">{advertiser.rating} ★</span>
                  )}
                  {category === 'reviews' && (
                    <span className="badge reviews">{advertiser.reviewCount} reviews</span>
                  )}
                  {category === 'media' && (
                    <span className="badge media">{advertiser.mediaRating} ★</span>
                  )}
                  {category === 'popularity' && (
                    <span className="badge popularity">{advertiser.popularity} views</span>
                  )}
                </div>
                <div className="card-overlay"></div>
              </div>
              <div className="card-content">
                <h3 className="card-title">
                  {advertiser.name}, {advertiser.age}
                </h3>
                <p className="card-location">
                  {advertiser.location} • {advertiser.distance} km
                </p>
                <div className="card-tags">
                  {advertiser.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="card-actions">
                  <button className="action-button view">View Profile</button>
                  <button
                    className="action-button favorite"
                    onClick={() => toggleFavorite(advertiser.id)}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFavorite(advertiser.id) ? 'fill-current text-red-500' : ''
                      }`}
                    />
                  </button>
                  <button className="action-button message">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="page-title text-3xl font-bold mb-8 text-gray-800">Top Advertisers</h1>

      <div className="rankings-tabs mb-8">
        <ul className="tabs-list flex border-b border-gray-200">
          {[
            { key: 'rating', label: 'Top Rated' },
            { key: 'reviews', label: 'Most Reviewed' },
            { key: 'media', label: 'Best Media' },
            { key: 'popularity', label: 'Most Popular' },
          ].map(tab => (
            <li
              key={tab.key}
              className={`tab-item px-6 py-4 font-medium cursor-pointer transition-colors relative ${
                activeTab === tab.key
                  ? 'text-pink-500 font-semibold'
                  : 'text-gray-600 hover:text-pink-500'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-500"></div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="rankings-content">
        {activeTab === 'rating' &&
          renderCarousel('rating', 'Top Rated Advertisers', advertisers.rating, ratingTrackRef)}
        {activeTab === 'reviews' &&
          renderCarousel(
            'reviews',
            'Most Reviewed Advertisers',
            advertisers.reviews,
            reviewsTrackRef,
          )}
        {activeTab === 'media' &&
          renderCarousel('media', 'Best Media Advertisers', advertisers.media, mediaTrackRef)}
        {activeTab === 'popularity' &&
          renderCarousel(
            'popularity',
            'Most Popular Advertisers',
            advertisers.popularity,
            popularityTrackRef,
          )}
      </div>
    </div>
  );
}
