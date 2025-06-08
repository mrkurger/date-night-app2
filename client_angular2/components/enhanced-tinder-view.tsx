'use client';

import type React from 'react';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Heart, X, Star, DollarSign, Zap, Crown, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getProfileImage, getFallbackFemaleImage } from '@/lib/data';

interface Advertiser {
  id: number;
  name: string;
  age: number;
  location: string;
  image: string;
  isOnline: boolean;
  isVip: boolean;
  price: number;
  rating: number;
  totalEarnings: number;
}

const advertisers: Advertiser[] = [
  {
    id: 1,
    name: 'Sophia',
    age: 24,
    location: 'Miami, FL',
    image: getFallbackFemaleImage(1),
    isOnline: true,
    isVip: true,
    price: 150,
    rating: 4.9,
    totalEarnings: 12500,
  },
  {
    id: 2,
    name: 'Isabella',
    age: 28,
    location: 'Los Angeles, CA',
    image: getFallbackFemaleImage(2),
    isOnline: true,
    isVip: false,
    price: 120,
    rating: 4.7,
    totalEarnings: 8900,
  },
  {
    id: 3,
    name: 'Emma',
    age: 22,
    location: 'New York, NY',
    image: getFallbackFemaleImage(3),
    isOnline: false,
    isVip: true,
    price: 180,
    rating: 4.8,
    totalEarnings: 15200,
  },
  {
    id: 4,
    name: 'Olivia',
    age: 26,
    location: 'Las Vegas, NV',
    image: getFallbackFemaleImage(4),
    isOnline: true,
    isVip: false,
    price: 100,
    rating: 4.6,
    totalEarnings: 6800,
  },
  {
    id: 5,
    name: 'Ava',
    age: 25,
    location: 'Chicago, IL',
    image: getFallbackFemaleImage(5),
    isOnline: true,
    isVip: true,
    price: 160,
    rating: 4.9,
    totalEarnings: 11400,
  },
];

const tipAmounts = [5, 10, 25, 50, 100, 250, 500, 1000];

export default function EnhancedTinderView() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedTipAmount, setSelectedTipAmount] = useState(0);
  const [rainEffect, setRainEffect] = useState(false);
  const [userBalance, setUserBalance] = useState(2500);
  const [totalTipped, setTotalTipped] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentAdvertiser = advertisers[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // Liked - show tip modal
      setShowTipModal(true);
    } else {
      // Passed - move to next
      nextCard();
    }
  };

  const nextCard = () => {
    setCurrentIndex(prev => (prev + 1) % advertisers.length);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleTip = (amount: number) => {
    if (amount <= userBalance) {
      setUserBalance(prev => prev - amount);
      setTotalTipped(prev => prev + amount);
      setStreak(prev => prev + 1);

      // Calculate multiplier based on streak
      const newMultiplier = Math.min(5, 1 + Math.floor(streak / 3) * 0.5);
      setMultiplier(newMultiplier);

      // Trigger rain effect for big tips
      if (amount >= 100) {
        setRainEffect(true);
        setTimeout(() => setRainEffect(false), 3000);
      }

      setShowTipModal(false);
      nextCard();
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY || 0 : e.clientY;

    const handleDragMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveClientX =
        'touches' in moveEvent ? moveEvent.touches[0]?.clientX || 0 : moveEvent.clientX;
      const moveClientY =
        'touches' in moveEvent ? moveEvent.touches[0]?.clientY || 0 : moveEvent.clientY;

      setDragOffset({
        x: moveClientX - clientX,
        y: moveClientY - clientY,
      });
    };

    const handleDragEnd = () => {
      setIsDragging(false);

      if (Math.abs(dragOffset.x) > 100) {
        handleSwipe(dragOffset.x > 0 ? 'right' : 'left');
      } else {
        setDragOffset({ x: 0, y: 0 });
      }

      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };

    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden">
      {/* Money Rain Effect */}
      {rainEffect && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute text-green-400 text-2xl animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              💸
            </div>
          ))}
        </div>
      )}

      {/* Top Stats Bar */}
      <div className="absolute top-4 left-4 right-4 z-40 flex justify-between items-center">
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-400" />
          <span className="text-white font-bold">${userBalance}</span>
        </div>

        <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-white font-bold">{streak}x</span>
          <span className="text-yellow-400 text-sm">Streak</span>
        </div>

        <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
          <Gift className="w-4 h-4 text-pink-400" />
          <span className="text-white font-bold">${totalTipped}</span>
        </div>
      </div>

      {/* Main Card Stack */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative w-full max-w-sm">
          {/* Background Cards */}
          {advertisers.slice(currentIndex + 1, currentIndex + 3).map((advertiser, index) => (
            <Card
              key={advertiser.id}
              className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
              style={{
                transform: `scale(${0.95 - index * 0.05}) translateY(${index * 10}px)`,
                zIndex: 10 - index,
              }}
            >
              <div className="relative h-[600px]">
                <Image
                  src={advertiser.image || '/placeholder.svg'}
                  alt={advertiser.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
            </Card>
          ))}

          {/* Main Card */}
          <Card
            ref={cardRef}
            className="relative rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing"
            style={{
              transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${
                dragOffset.x * 0.1
              }deg)`,
              zIndex: 20,
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
            }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <div className="relative h-[600px]">
              <Image
                src={currentAdvertiser?.image || '/placeholder.svg'}
                alt={currentAdvertiser?.name || 'Profile'}
                fill
                className="object-cover"
              />

              {/* Online Status */}
              {currentAdvertiser?.isOnline && (
                <div className="absolute top-4 right-4 bg-green-500 rounded-full w-4 h-4 border-2 border-white animate-pulse" />
              )}

              {/* VIP Badge */}
              {currentAdvertiser?.isVip && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full px-3 py-1 flex items-center gap-1">
                  <Crown className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-bold">VIP</span>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-3xl font-bold">{currentAdvertiser?.name}</h2>
                  <span className="text-xl text-gray-300">{currentAdvertiser?.age}</span>
                </div>

                <p className="text-gray-300 mb-3">{currentAdvertiser?.location}</p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm">{currentAdvertiser?.rating}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-bold">${currentAdvertiser?.price}/hr</span>
                  </div>

                  <div className="text-xs text-gray-400">
                    ${currentAdvertiser?.totalEarnings?.toLocaleString()} earned
                  </div>
                </div>

                {/* Quick Tip Buttons */}
                <div className="flex gap-2 mb-4">
                  {[10, 25, 50].map(amount => (
                    <Button
                      key={amount}
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 flex-1"
                      onClick={() => handleTip(amount)}
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      {amount}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Swipe Indicators */}
          <div className="absolute inset-0 pointer-events-none">
            {dragOffset.x > 50 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 rounded-full p-4 opacity-80">
                <Heart className="w-8 h-8 text-white fill-current" />
              </div>
            )}
            {dragOffset.x < -50 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full p-4 opacity-80">
                <X className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4">
        <Button
          size="lg"
          className="bg-red-500 hover:bg-red-600 rounded-full w-16 h-16 p-0"
          onClick={() => handleSwipe('left')}
        >
          <X className="w-8 h-8 text-white" />
        </Button>

        <Button
          size="lg"
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-full w-20 h-20 p-0"
          onClick={() => setShowTipModal(true)}
        >
          <DollarSign className="w-10 h-10 text-white" />
        </Button>

        <Button
          size="lg"
          className="bg-green-500 hover:bg-green-600 rounded-full w-16 h-16 p-0"
          onClick={() => handleSwipe('right')}
        >
          <Heart className="w-8 h-8 text-white fill-current" />
        </Button>
      </div>

      {/* Tip Modal */}
      {showTipModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-gradient-to-br from-purple-900 to-pink-900 border-pink-500/30 p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-pink-500 relative">
                <Image
                  src={currentAdvertiser?.image || '/placeholder.svg'}
                  alt={currentAdvertiser?.name || 'Profile'}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Tip {currentAdvertiser?.name}</h3>
              <p className="text-gray-300">Show your appreciation with a tip!</p>
              {multiplier > 1 && (
                <div className="mt-2 bg-yellow-500/20 rounded-full px-3 py-1 inline-block">
                  <span className="text-yellow-400 font-bold">{multiplier}x Streak Bonus!</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {tipAmounts.map(amount => (
                <Button
                  key={amount}
                  className={`bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 ${
                    amount > userBalance ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => handleTip(amount)}
                  disabled={amount > userBalance}
                >
                  ${amount}
                </Button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                onClick={() => setShowTipModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0"
                onClick={() => handleSwipe('right')}
              >
                <Heart className="w-4 h-4 mr-2 fill-current" />
                Like
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Floating Action Button */}
      <Button
        className="fixed bottom-24 right-6 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 rounded-full w-14 h-14 p-0 shadow-lg animate-pulse"
        onClick={() => setShowTipModal(true)}
      >
        <Sparkles className="w-6 h-6 text-white" />
      </Button>
    </div>
  );
}
