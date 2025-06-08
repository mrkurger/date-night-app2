'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Heart,
  Star,
  DollarSign,
  Users,
  Play,
  Gift,
  Zap,
  Crown,
  Flame,
  MessageCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { getFemaleImageByIndex } from '@/lib/data';

// Mock data for dating-casino hybrid
const liveDealers = [
  {
    id: 1,
    name: 'Sophia',
    age: 24,
    rating: 9.2,
    game: 'Love Roulette',
    viewers: 234,
    tips: 1250,
    image: getFemaleImageByIndex(1),
    status: 'live',
    compatibility: 87,
  },
  {
    id: 2,
    name: 'Isabella',
    age: 26,
    rating: 8.8,
    game: 'Heart Slots',
    viewers: 189,
    tips: 890,
    image: getFemaleImageByIndex(2),
    status: 'live',
    compatibility: 92,
  },
  {
    id: 3,
    name: 'Emma',
    age: 23,
    rating: 9.5,
    game: 'Flirt Poker',
    viewers: 312,
    tips: 2100,
    image: getFemaleImageByIndex(3),
    status: 'live',
    compatibility: 78,
  },
  {
    id: 4,
    name: 'Olivia',
    age: 25,
    rating: 8.9,
    game: 'Tip Blackjack',
    viewers: 156,
    tips: 675,
    image: getFemaleImageByIndex(4),
    status: 'live',
    compatibility: 85,
  },
];

const recentWins = [
  { player: 'Alex', amount: 2500, game: 'Love Roulette', dealer: 'Sophia' },
  { player: 'Mike', amount: 1800, game: 'Heart Slots', dealer: 'Isabella' },
  { player: 'David', amount: 3200, game: 'Flirt Poker', dealer: 'Emma' },
  { player: 'Ryan', amount: 950, game: 'Tip Blackjack', dealer: 'Olivia' },
];

export default function EnhancedLiveCasinoPage() {
  const [selectedDealer, setSelectedDealer] = useState(liveDealers[0]);
  const [userChips, setUserChips] = useState(5000);
  const [totalPlayers, setTotalPlayers] = useState(1247);

  useEffect(() => {
    // Simulate live updates
    const interval = setInterval(() => {
      setTotalPlayers(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden">
      <EnhancedNavbar />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-pink-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400 rounded-full animate-bounce opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-50"></div>
        <div className="absolute bottom-20 right-1/3 w-5 h-5 bg-blue-400 rounded-full animate-pulse opacity-30"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
            💖 Love Casino 💖
          </h1>
          <p className="text-2xl md:text-3xl text-white/90 mb-6 font-semibold">
            Where Hearts Meet Fortune ✨
          </p>
          <div className="flex justify-center items-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-400" />
              <span className="text-xl font-bold">{totalPlayers.toLocaleString()}</span>
              <span>Players Online</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <span className="text-xl font-bold">{userChips.toLocaleString()}</span>
              <span>Your Chips</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Dealers Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Heart className="w-6 h-6 text-pink-400" />
                  Live Dating Dealers
                  <Badge variant="secondary" className="bg-pink-500/20 text-pink-300">
                    {liveDealers.length} Online
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveDealers.map(dealer => (
                    <Card
                      key={dealer.id}
                      className={`cursor-pointer transition-all duration-300 overflow-hidden ${
                        selectedDealer?.id === dealer.id
                          ? 'border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20'
                          : 'border-gray-600 hover:border-pink-400 bg-gray-800/50 hover:bg-pink-500/5'
                      }`}
                      onClick={() => setSelectedDealer(dealer)}
                    >
                      <div className="relative">
                        <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                          <Avatar className="w-20 h-20 border-2 border-pink-400">
                            <AvatarImage src={dealer.image} alt={dealer.name} />
                            <AvatarFallback className="bg-pink-500 text-white text-xl">
                              {dealer.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-red-500 text-white animate-pulse">🔴 LIVE</Badge>
                        </div>
                        <div className="absolute bottom-2 left-2">
                          <Badge className="bg-black/60 text-white">
                            {dealer.viewers} watching
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-white font-bold text-lg">
                              {dealer.name}, {dealer.age}
                            </h3>
                            <p className="text-pink-300 text-sm">{dealer.game}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-white font-bold">{dealer.rating}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Heart className="w-3 h-3 text-pink-400" />
                              <span className="text-pink-300">{dealer.compatibility}% match</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <Gift className="w-4 h-4 text-yellow-400" />
                            <span className="text-yellow-300 font-semibold">${dealer.tips}</span>
                            <span className="text-gray-400 text-sm">tips</span>
                          </div>
                          <Button size="sm" className="bg-pink-500 hover:bg-pink-600 text-white">
                            Join Game
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured Game Section */}
            <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Play className="w-6 h-6 text-pink-400" />
                  Now Playing: {selectedDealer?.game}
                  <Badge className="bg-green-500/20 text-green-300">
                    Live with {selectedDealer?.name}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-pink-400">
                      <AvatarImage src={selectedDealer?.image} alt={selectedDealer?.name} />
                      <AvatarFallback className="bg-pink-500 text-white text-4xl">
                        {selectedDealer?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-white text-2xl font-bold mb-2">{selectedDealer?.name}</h3>
                    <p className="text-pink-300 mb-4">Hosting {selectedDealer?.game}</p>
                    <div className="flex justify-center gap-4">
                      <Button className="bg-pink-500 hover:bg-pink-600">
                        <Heart className="w-4 h-4 mr-2" />
                        Send Tip
                      </Button>
                      <Button
                        variant="outline"
                        className="border-pink-500 text-pink-300 hover:bg-pink-500/10"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Wins */}
            <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Recent Big Wins
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentWins.map((win, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                  >
                    <div>
                      <p className="text-white font-semibold">{win.player}</p>
                      <p className="text-green-300 text-sm">{win.game}</p>
                      <p className="text-gray-400 text-xs">with {win.dealer}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-lg">${win.amount}</p>
                      <Sparkles className="w-4 h-4 text-yellow-400 mx-auto" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Game Lobby */}
            <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Game Lobby
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Love Roulette', players: 45, icon: '💕' },
                  { name: 'Heart Slots', players: 78, icon: '🎰' },
                  { name: 'Flirt Poker', players: 23, icon: '🃏' },
                  { name: 'Tip Blackjack', players: 34, icon: '🖤' },
                  { name: 'Match Bingo', players: 67, icon: '🎯' },
                ].map((game, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-between border-pink-500/30 text-white hover:bg-pink-500/10"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{game.icon}</span>
                      {game.name}
                    </span>
                    <Badge variant="secondary" className="bg-pink-500/20 text-pink-300">
                      {game.players}
                    </Badge>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* VIP Section */}
            <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  VIP Love Lounge
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-yellow-200 text-sm mb-4">
                  Exclusive games with premium dating profiles
                </p>
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold">
                  <Flame className="w-4 h-4 mr-2" />
                  Upgrade to VIP
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
