'use client';
import Image from 'next/image';

import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Star } from 'lucide-react';
import { getFemaleImageByIndex } from '@/lib/data';

interface ProfileCard {
  id: number;
  name: string;
  age: number;
  city: string;
  image: string;
  rating: number;
  isOnline: boolean;
  price: string;
}

// Use our local female profile images instead of Unsplash URLs

const generateProfileCards = (count: number): ProfileCard[] => {
  const names = [
    'Sofia',
    'Isabella',
    'Valentina',
    'Camila',
    'Aria',
    'Luna',
    'Zara',
    'Mia',
    'Elena',
    'Natalia',
    'Carmen',
    'Lucia',
    'Gabriela',
    'Adriana',
    'Paloma',
    'Catalina',
    'Esperanza',
    'Fernanda',
    'Jimena',
    'Marisol',
    'Pilar',
    'Rocio',
    'Soledad',
    'Ximena',
    'Yolanda',
    'Beatriz',
    'Dolores',
    'Estrella',
    'Gloria',
    'Inmaculada',
    'Lourdes',
    'Mercedes',
    'Alejandra',
    'Daniela',
    'Victoria',
  ];

  const cities = [
    'Miami',
    'Los Angeles',
    'New York',
    'Las Vegas',
    'Chicago',
    'San Francisco',
    'Atlanta',
    'Phoenix',
    'Seattle',
    'Denver',
    'Austin',
    'Boston',
    'Dallas',
    'Orlando',
    'San Diego',
    'Tampa',
    'Houston',
    'Nashville',
    'Charlotte',
    'Portland',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length] || 'Unknown',
    age: Math.floor(Math.random() * 26) + 20,
    city: cities[i % cities.length] || 'Unknown City',
    image: `/public/assets/img/profiles/random${(i % 29) + 1}.jpg`,
    rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
    isOnline: Math.random() > 0.6,
    price: `$${Math.floor(Math.random() * 200) + 100}`,
  }));
};

export function InfiniteScrollGrid() {
  const [profiles, setProfiles] = useState<ProfileCard[]>([]);
  const [visibleRows, setVisibleRows] = useState(2);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setProfiles(generateProfileCards(32));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        setScrollY(scrollTop);

        const rowHeight = 320;
        const newVisibleRows = Math.min(8, Math.max(2, Math.ceil(scrollTop / rowHeight) + 3));
        setVisibleRows(newVisibleRows);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
    return undefined;
  }, []);

  const getRowStyle = (rowIndex: number) => {
    const rowPosition = rowIndex * 320;
    const scrollOffset = scrollY;

    let scale = 1;
    let opacity = 1;

    if (rowIndex >= visibleRows - 1) {
      const fadeDistance = (rowIndex - visibleRows + 2) * 100;
      scale = Math.max(0.7, 1 - fadeDistance / 1000);
      opacity = Math.max(0.3, 1 - fadeDistance / 800);
    }

    return {
      transform: `scale(${scale})`,
      opacity: opacity,
      transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
    };
  };

  const rows = [];
  for (let i = 0; i < profiles.length; i += 4) {
    rows.push(profiles.slice(i, i + 4));
  }

  return (
    <div
      ref={containerRef}
      className="h-[600px] overflow-y-auto scrollbar-hide"
      style={{ scrollBehavior: 'smooth' }}
    >
      <div className="space-y-6 pb-20">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4"
            style={getRowStyle(rowIndex)}
          >
            {row.map(profile => (
              <div
                key={profile.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="relative h-64">
                  <Image
                    src={profile.image || getFemaleImageByIndex(profile.id)}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                  {profile.isOnline && (
                    <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
                    {profile.price}/hr
                  </div>
                </div>

                <div className="p-4">
                  <div className="text-center mb-3">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {profile.name}, {profile.age}
                    </h3>
                    <p className="text-gray-600 text-sm mt-4">{profile.city}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{profile.rating}</span>
                    </div>

                    <div className="flex gap-2">
                      <button className="p-2 rounded-full bg-pink-100 hover:bg-pink-200 transition-colors">
                        <Heart className="h-4 w-4 text-pink-600" />
                      </button>
                      <button className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
