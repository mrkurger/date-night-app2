'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  MessageCircle,
  Video,
  Gift,
  Star,
  Coins,
  Trophy,
  FlameIcon as Fire,
  Lock,
  Crown,
  Zap,
} from 'lucide-react';

interface ContentCreator {
  id: string;
  name: string;
  image: string;
  isOnline: boolean;
  followers: number;
  tips: number;
  rating: number;
  isVip: boolean;
  specialties: string[];
}

interface ContentPost {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorImage: string;
  type: 'image' | 'video' | 'live';
  thumbnail: string;
  title: string;
  tips: number;
  likes: number;
  isLocked: boolean;
  price?: number;
  duration?: string;
}

const contentCreators: ContentCreator[] = [
  {
    id: '1',
    name: 'Sofia',
    image: '/public/assets/img/profiles/random1.jpg',
    isOnline: true,
    followers: 12500,
    tips: 8950,
    rating: 4.9,
    isVip: true,
    specialties: ['Live Shows', 'Custom Content', 'Chat'],
  },
  {
    id: '2',
    name: 'Isabella',
    image: '/public/assets/img/profiles/random2.jpg',
    isOnline: false,
    followers: 9800,
    tips: 6750,
    rating: 4.8,
    isVip: true,
    specialties: ['Photo Sets', 'Video Calls', 'Messages'],
  },
  {
    id: '3',
    name: 'Valentina',
    image: '/public/assets/img/profiles/random3.jpg',
    isOnline: true,
    followers: 15200,
    tips: 11200,
    rating: 4.9,
    isVip: true,
    specialties: ['Live Cam', 'Private Shows', 'Custom Videos'],
  },
];

const contentPosts: ContentPost[] = [
  {
    id: '1',
    creatorId: '1',
    creatorName: 'Sofia',
    creatorImage: '/public/assets/img/profiles/random1.jpg',
    type: 'live',
    thumbnail: '/public/assets/img/profiles/random1.jpg',
    title: 'Live Yoga Session 🧘‍♀️',
    tips: 245,
    likes: 892,
    isLocked: false,
  },
  {
    id: '2',
    creatorId: '2',
    creatorName: 'Isabella',
    creatorImage: '/public/assets/img/profiles/random2.jpg',
    type: 'video',
    thumbnail: '/public/assets/img/profiles/random2.jpg',
    title: 'Behind the Scenes Photoshoot',
    tips: 156,
    likes: 634,
    isLocked: true,
    price: 25,
    duration: '8:32',
  },
  {
    id: '3',
    creatorId: '3',
    creatorName: 'Valentina',
    creatorImage: '/public/assets/img/profiles/random3.jpg',
    type: 'image',
    thumbnail: '/public/assets/img/profiles/random3.jpg',
    title: 'Exclusive Photo Set 📸',
    tips: 89,
    likes: 423,
    isLocked: true,
    price: 15,
  },
];

export function GamifiedContentHub() {
  const [activeTab, setActiveTab] = useState('trending');
  const [userCoins, setUserCoins] = useState(150);

  const handleTip = (creatorId: string, amount: number) => {
    if (userCoins >= amount) {
      setUserCoins(prev => prev - amount);
      // Update creator tips in real app
    }
  };

  const handleUnlock = (postId: string, price: number) => {
    if (userCoins >= price) {
      setUserCoins(prev => prev - price);
      // Unlock content in real app
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with user coins */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Content Hub</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full">
            <Coins className="h-5 w-5" />
            <span className="font-bold">{userCoins}</span>
          </div>
          <Button className="bg-pink-600 hover:bg-pink-700">
            <Zap className="h-4 w-4 mr-2" />
            Buy Coins
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trending">🔥 Trending</TabsTrigger>
          <TabsTrigger value="live">📹 Live Now</TabsTrigger>
          <TabsTrigger value="creators">👑 Top Creators</TabsTrigger>
          <TabsTrigger value="leaderboard">🏆 Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentPosts.map(post => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={post.thumbnail || '/placeholder.svg'}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                  {post.type === 'live' && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                      <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                      LIVE
                    </Badge>
                  )}
                  {post.isLocked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Lock className="h-8 w-8 mx-auto mb-2" />
                        <p className="font-semibold">{post.price} coins</p>
                      </div>
                    </div>
                  )}
                  {post.duration && (
                    <Badge className="absolute bottom-2 right-2 bg-black/70 text-white">
                      {post.duration}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative w-8 h-8">
                      <Image
                        src={post.creatorImage || '/placeholder.svg'}
                        alt={post.creatorName}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <span className="font-medium">{post.creatorName}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{post.title}</h3>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <Gift className="h-4 w-4" />
                        {post.tips}
                      </div>
                    </div>
                    {post.isLocked ? (
                      <Button
                        size="sm"
                        onClick={() => handleUnlock(post.id, post.price!)}
                        disabled={userCoins < (post.price || 0)}
                      >
                        Unlock
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        <Gift className="h-4 w-4 mr-1" />
                        Tip
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentCreators
              .filter(c => c.isOnline)
              .map(creator => (
                <Card key={creator.id} className="overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={creator.image || '/placeholder.svg'}
                      alt={creator.name}
                      fill
                      className="object-cover"
                    />
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                      <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                      LIVE
                    </Badge>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {Math.floor(Math.random() * 500) + 100} viewers
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{creator.name}</h3>
                      {creator.isVip && <Crown className="h-5 w-5 text-yellow-500" />}
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {creator.specialties.map(specialty => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{creator.rating}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
                          <Video className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="creators" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentCreators.map(creator => (
              <Card key={creator.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-16 h-16">
                      <Image
                        src={creator.image || '/placeholder.svg'}
                        alt={creator.name}
                        fill
                        className="rounded-full object-cover"
                      />
                      {creator.isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{creator.name}</h3>
                        {creator.isVip && <Crown className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {creator.rating} • {creator.followers.toLocaleString()} followers
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Tips Received</span>
                      <span className="font-semibold text-green-600">
                        {creator.tips.toLocaleString()} coins
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleTip(creator.id, 10)}
                      disabled={userCoins < 10}
                    >
                      <Gift className="h-4 w-4 mr-1" />
                      Tip 10
                    </Button>
                    <Button size="sm" className="flex-1 bg-pink-600 hover:bg-pink-700">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Earners This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contentCreators
                  .sort((a, b) => b.tips - a.tips)
                  .map((creator, index) => (
                    <div key={creator.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="relative w-10 h-10">
                        <Image
                          src={creator.image || '/placeholder.svg'}
                          alt={creator.name}
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{creator.name}</div>
                        <div className="text-sm text-gray-600">
                          {creator.tips.toLocaleString()} coins
                        </div>
                      </div>
                      {creator.isVip && <Crown className="h-4 w-4 text-yellow-500" />}
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fire className="h-5 w-5 text-red-500" />
                  Most Popular Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contentPosts
                  .sort((a, b) => b.likes - a.likes)
                  .map((post, index) => (
                    <div key={post.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="relative w-10 h-10">
                        <Image
                          src={post.thumbnail || '/placeholder.svg'}
                          alt={post.title}
                          fill
                          className="rounded object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{post.title}</div>
                        <div className="text-xs text-gray-600">
                          {post.likes} likes • {post.tips} tips
                        </div>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
