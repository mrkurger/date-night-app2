'use client';

import { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFemaleImageByIndex } from '@/lib/data';

interface ProfileCard {
  id: number;
  name: string;
  age: number;
  city: string;
  image: string;
  description: string;
  pricing: string;
  lastOnline: string;
  membershipLength: string;
  sharedImages: number;
  receivedLikes: number;
  isOnline: boolean;
}

const profileCards: ProfileCard[] = [
  {
    id: 1,
    name: 'Sofia',
    age: 24,
    city: 'Miami',
    image: getFemaleImageByIndex(1),
    description:
      'Professional dancer and fitness enthusiast. I love meeting new people and creating unforgettable experiences.',
    pricing: '$200/hour',
    lastOnline: 'Online now',
    membershipLength: '2 years',
    sharedImages: 45,
    receivedLikes: 1250,
    isOnline: true,
  },
  {
    id: 2,
    name: 'Isabella',
    age: 26,
    city: 'Los Angeles',
    image: getFemaleImageByIndex(2),
    description:
      'Model and actress with a passion for art and culture. Available for exclusive events and companionship.',
    pricing: '$300/hour',
    lastOnline: '2 hours ago',
    membershipLength: '3 years',
    sharedImages: 62,
    receivedLikes: 2100,
    isOnline: false,
  },
  {
    id: 3,
    name: 'Valentina',
    age: 22,
    city: 'New York',
    image: getFemaleImageByIndex(3),
    description:
      'College student and part-time model. Sweet, intelligent, and always ready for adventure.',
    pricing: '$150/hour',
    lastOnline: 'Online now',
    membershipLength: '1 year',
    sharedImages: 28,
    receivedLikes: 890,
    isOnline: true,
  },
  {
    id: 4,
    name: 'Camila',
    age: 28,
    city: 'Las Vegas',
    image: getFemaleImageByIndex(4),
    description:
      'Experienced entertainer with a bubbly personality. Specializing in VIP experiences and events.',
    pricing: '$250/hour',
    lastOnline: '30 minutes ago',
    membershipLength: '4 years',
    sharedImages: 78,
    receivedLikes: 3200,
    isOnline: false,
  },
  {
    id: 5,
    name: 'Aria',
    age: 25,
    city: 'Chicago',
    image: getFemaleImageByIndex(5),
    description:
      'Professional massage therapist and wellness coach. Focused on relaxation and stress relief.',
    pricing: '$180/hour',
    lastOnline: 'Online now',
    membershipLength: '2.5 years',
    sharedImages: 35,
    receivedLikes: 1450,
    isOnline: true,
  },
  {
    id: 6,
    name: 'Luna',
    age: 23,
    city: 'San Francisco',
    image: getFemaleImageByIndex(6),
    description:
      "Tech-savvy and creative, I enjoy deep conversations and exploring the city's hidden gems.",
    pricing: '$220/hour',
    lastOnline: '1 hour ago',
    membershipLength: '1.5 years',
    sharedImages: 41,
    receivedLikes: 1100,
    isOnline: false,
  },
  {
    id: 7,
    name: 'Zara',
    age: 27,
    city: 'Atlanta',
    image: getFemaleImageByIndex(7),
    description:
      'Yoga instructor and spiritual guide. Offering holistic experiences for mind, body, and soul.',
    pricing: '$190/hour',
    lastOnline: 'Online now',
    membershipLength: '3.5 years',
    sharedImages: 52,
    receivedLikes: 1800,
    isOnline: true,
  },
  {
    id: 8,
    name: 'Mia',
    age: 24,
    city: 'Phoenix',
    image: getFemaleImageByIndex(8),
    description:
      "Adventure seeker and travel enthusiast. Let's explore new places and create amazing memories together.",
    pricing: '$170/hour',
    lastOnline: '15 minutes ago',
    membershipLength: '2 years',
    sharedImages: 33,
    receivedLikes: 950,
    isOnline: false,
  },
  {
    id: 9,
    name: 'Elena',
    age: 26,
    city: 'Seattle',
    image: getFemaleImageByIndex(9),
    description:
      'Artist and creative soul with a love for music and poetry. Offering unique and artistic experiences.',
    pricing: '$210/hour',
    lastOnline: 'Online now',
    membershipLength: '2.8 years',
    sharedImages: 47,
    receivedLikes: 1650,
    isOnline: true,
  },
];

export function EnhancedProfileCarousel() {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [centerCardIndex, setCenterCardIndex] = useState(2);
  const carouselRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % profileCards.length);
    setCenterCardIndex(prev => (prev + 1) % profileCards.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + profileCards.length) % profileCards.length);
    setCenterCardIndex(prev => (prev - 1 + profileCards.length) % profileCards.length);
  };

  const centerCard = profileCards[centerCardIndex];

  return (
    <div className="relative w-full">
      {/* Carousel Container - moved up 20px */}
      <div className="relative -mt-5 mb-4">
        {/* Navigation Arrows - moved up 20px */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
          onClick={prevSlide}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
          onClick={nextSlide}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Carousel */}
        <div
          ref={carouselRef}
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${(currentIndex - 2) * 20}%)`,
            width: '140%',
            marginLeft: '-20%',
          }}
        >
          {profileCards.map((card, index) => {
            const isCenter = index === centerCardIndex;
            const distance = Math.abs(index - centerCardIndex);
            const scale = isCenter ? 1 : Math.max(0.8, 1 - distance * 0.1);
            const opacity = isCenter ? 1 : Math.max(0.6, 1 - distance * 0.2);

            return (
              <div
                key={card.id}
                className="flex-shrink-0 px-2 transition-all duration-500"
                style={{
                  width: '20%',
                  transform: `scale(${scale})`,
                  opacity: opacity,
                  zIndex: isCenter ? 10 : 5 - distance,
                }}
              >
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="relative">
                    <img
                      src={card.image || getFemaleImageByIndex(card.id)}
                      alt={card.name}
                      className="w-full h-80 object-cover"
                    />
                    {card.isOnline && (
                      <div className="absolute top-3 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="p-4 text-center">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {card.name}, {card.age}
                    </h3>
                    <p className="text-gray-600 text-sm">{card.city}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Text Field */}
      <div className="mt-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6 shadow-lg min-h-[calc(100vh-400px)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <img
              src={centerCard.image || getFemaleImageByIndex(centerCard.id)}
              alt={centerCard.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {centerCard.name}, {centerCard.age}
              </h2>
              <p className="text-xl text-gray-600">{centerCard.city}</p>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    centerCard.isOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                ></div>
                <span className="text-sm font-medium text-gray-700">{centerCard.lastOnline}</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">About Me</h3>
              <p className="text-gray-700 leading-relaxed mb-6">{centerCard.description}</p>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Pricing:</span>
                  <span className="text-pink-600 font-semibold">{centerCard.pricing}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-700">Member Since:</span>
                  <span className="text-gray-600">{centerCard.membershipLength}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Profile Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-pink-600">{centerCard.sharedImages}</div>
                  <div className="text-sm text-gray-600">Shared Images</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">
                    {centerCard.receivedLikes.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Received Likes</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 text-lg font-semibold">
                  Start Chat
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-pink-600 text-pink-600 hover:bg-pink-50 py-3 text-lg font-semibold"
                >
                  View Full Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
