'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dice1,
  Heart,
  Diamond,
  Spade,
  Club,
  Trophy,
  Gift,
  DollarSign,
  Timer,
  Star,
} from 'lucide-react';
import { getFallbackFemaleImage } from '@/lib/data';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { NumberTicker } from '@/components/ui/number-ticker';
import { RippleButton } from '@/components/ui/ripple-button';
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text';
import Particles from '@/components/ui/particles';
import Confetti from '@/components/ui/confetti';

interface Advertiser {
  id: number;
  name: string;
  image: string;
  cardRank: string;
  cardSuit: string;
  totalEarnings: number;
  winRate: number;
  isOnline: boolean;
  loyaltyMultiplier: number;
}

const advertisers: Advertiser[] = [
  {
    id: 1,
    name: 'Sophia',
    image: getFallbackFemaleImage(1),
    cardRank: 'Ace',
    cardSuit: 'Hearts',
    totalEarnings: 25000,
    winRate: 0.85,
    isOnline: true,
    loyaltyMultiplier: 1.5,
  },
  {
    id: 2,
    name: 'Isabella',
    image: getFallbackFemaleImage(2),
    cardRank: 'King',
    cardSuit: 'Diamonds',
    totalEarnings: 22000,
    winRate: 0.78,
    isOnline: true,
    loyaltyMultiplier: 1.3,
  },
  {
    id: 3,
    name: 'Emma',
    image: getFallbackFemaleImage(3),
    cardRank: 'Queen',
    cardSuit: 'Spades',
    totalEarnings: 20000,
    winRate: 0.82,
    isOnline: false,
    loyaltyMultiplier: 1.4,
  },
  {
    id: 4,
    name: 'Olivia',
    image: getFallbackFemaleImage(4),
    cardRank: 'Jack',
    cardSuit: 'Clubs',
    totalEarnings: 18000,
    winRate: 0.75,
    isOnline: true,
    loyaltyMultiplier: 1.2,
  },
];

export default function LoveCasinoHub() {
  const [currentJackpot, setCurrentJackpot] = useState(15420);
  const [nextDraw, setNextDraw] = useState(180); // seconds
  const [userBalance, setUserBalance] = useState(2500);
  const [activeRaffles, setActiveRaffles] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => {
      setNextDraw(prev => (prev > 0 ? prev - 1 : 300)); // Reset to 5 minutes
      if (nextDraw === 0) {
        setCurrentJackpot(prev => prev + Math.floor(Math.random() * 500) + 100);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextDraw]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 p-4 relative overflow-hidden">
      {/* Background Effects */}
      <Particles
        className="absolute inset-0"
        quantity={30}
        color="#ffffff"
        staticity={40}
        ease={60}
      />
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-semibold">Current Jackpot</span>
          </div>
          <div className="text-2xl font-bold text-yellow-400">
            $<NumberTicker value={currentJackpot} />
          </div>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Timer className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold">Next Draw</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{formatTime(nextDraw)}</div>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-5 h-5 text-green-400" />
            <span className="text-white font-semibold">Active Raffles</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            <NumberTicker value={activeRaffles} />
          </div>
        </Card>

        <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            <span className="text-white font-semibold">Your Balance</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">
            $<NumberTicker value={userBalance} />
          </div>
        </Card>
      </div>

      {/* Main Casino Interface */}
      <Tabs defaultValue="keno" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-black/40 backdrop-blur-sm">
          <TabsTrigger value="keno" className="data-[state=active]:bg-pink-600">
            <Dice1 className="w-4 h-4 mr-2" />
            Keno
          </TabsTrigger>
          <TabsTrigger value="cards" className="data-[state=active]:bg-pink-600">
            <Heart className="w-4 h-4 mr-2" />
            Cards
          </TabsTrigger>
          <TabsTrigger value="raffles" className="data-[state=active]:bg-pink-600">
            <Gift className="w-4 h-4 mr-2" />
            Raffles
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-pink-600">
            <Trophy className="w-4 h-4 mr-2" />
            Leaders
          </TabsTrigger>
        </TabsList>

        {/* Keno Game */}
        <TabsContent value="keno" className="mt-6">
          <KenoGame
            advertisers={advertisers}
            userBalance={userBalance}
            setUserBalance={setUserBalance}
          />
        </TabsContent>

        {/* Card Games */}
        <TabsContent value="cards" className="mt-6">
          <CardGames
            advertisers={advertisers}
            userBalance={userBalance}
            setUserBalance={setUserBalance}
          />
        </TabsContent>

        {/* Active Raffles */}
        <TabsContent value="raffles" className="mt-6">
          <ActiveRaffles
            advertisers={advertisers}
            userBalance={userBalance}
            setUserBalance={setUserBalance}
          />
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="mt-6">
          <Leaderboard advertisers={advertisers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Keno Game Component
function KenoGame({ advertisers, userBalance, setUserBalance }: any) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [betAmount, setBetAmount] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWinConfetti, setShowWinConfetti] = useState(false);

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(prev => prev.filter(n => n !== num));
    } else if (selectedNumbers.length < 10) {
      setSelectedNumbers(prev => [...prev, num]);
    }
  };

  const placeBet = () => {
    if (betAmount <= userBalance && selectedNumbers.length > 0) {
      setUserBalance((prev: number) => prev - betAmount);
      setIsPlaying(true);
      // Simulate game logic
      setTimeout(() => {
        const winnings = Math.random() > 0.7 ? betAmount * 2 : 0;
        setUserBalance((prev: number) => prev + winnings);
        if (winnings > 0) {
          setShowWinConfetti(true);
          setTimeout(() => setShowWinConfetti(false), 3000);
        }
        setIsPlaying(false);
      }, 3000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
      {/* Win Confetti */}
      {showWinConfetti && <Confetti globalstart={true} />}
      {/* Betting Controls */}
      <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 p-6">
        <h3 className="text-white font-bold text-lg mb-4">Place Your Bet</h3>

        <div className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm">Bet Amount</label>
            <div className="flex gap-2 mt-2">
              {[5, 10, 25, 50, 100].map(amount => (
                <Button
                  key={amount}
                  size="sm"
                  variant={betAmount === amount ? 'default' : 'outline'}
                  className={betAmount === amount ? 'bg-pink-600' : 'border-gray-600 text-gray-300'}
                  onClick={() => setBetAmount(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-300 text-sm">Selected: {selectedNumbers.length}/10</label>
            <div className="text-pink-400 text-xs mt-1">Pick your favorite advertisers!</div>
          </div>

          <ShimmerButton
            className="w-full"
            background="linear-gradient(45deg, #10b981, #059669)"
            onClick={placeBet}
            disabled={selectedNumbers.length === 0 || betAmount > userBalance || isPlaying}
          >
            {isPlaying ? 'Playing...' : `Bet $${betAmount}`}
          </ShimmerButton>
        </div>
      </Card>

      {/* Keno Grid */}
      <div className="lg:col-span-3">
        <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 p-6">
          <h3 className="text-white font-bold text-lg mb-4">Select Your Lucky Advertisers</h3>

          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 40 }, (_, i) => i + 1).map(num => {
              const advertiser = advertisers[num % advertisers.length];
              const isSelected = selectedNumbers.includes(num);

              return (
                <Button
                  key={num}
                  className={`aspect-square p-2 relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                  onClick={() => toggleNumber(num)}
                >
                  <div className="flex flex-col items-center">
                    <div className="text-lg font-bold">{num}</div>
                    <div className="w-6 h-6 rounded-full overflow-hidden mt-1">
                      <img
                        src={advertiser.image}
                        alt={advertiser.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {advertiser.isOnline && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </Button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Card Games Component
function CardGames({ advertisers, userBalance, setUserBalance }: any) {
  const [selectedCard, setSelectedCard] = useState<Advertiser | null>(null);
  const [gameType, setGameType] = useState<'hilo' | 'blackjack'>('hilo');

  const getSuitIcon = (suit: string) => {
    switch (suit) {
      case 'Hearts':
        return <Heart className="w-6 h-6 text-red-500 fill-current" />;
      case 'Diamonds':
        return <Diamond className="w-6 h-6 text-red-500 fill-current" />;
      case 'Spades':
        return <Spade className="w-6 h-6 text-black fill-current" />;
      case 'Clubs':
        return <Club className="w-6 h-6 text-black fill-current" />;
      default:
        return <Heart className="w-6 h-6 text-red-500 fill-current" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Game Selection */}
      <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 p-6">
        <h3 className="text-white font-bold text-lg mb-4">Choose Your Game</h3>

        <div className="space-y-4">
          <Button
            className={`w-full ${gameType === 'hilo' ? 'bg-pink-600' : 'bg-gray-700'}`}
            onClick={() => setGameType('hilo')}
          >
            Hi/Lo Game
          </Button>

          <Button
            className={`w-full ${gameType === 'blackjack' ? 'bg-pink-600' : 'bg-gray-700'}`}
            onClick={() => setGameType('blackjack')}
          >
            Blackjack
          </Button>

          {selectedCard && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="text-white text-sm mb-2">Selected Card:</div>
              <div className="flex items-center gap-2">
                <img
                  src={selectedCard.image}
                  alt={selectedCard.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <div className="text-white font-bold">{selectedCard.name}</div>
                  <div className="flex items-center gap-1">
                    <span className="text-gray-300">{selectedCard.cardRank}</span>
                    {getSuitIcon(selectedCard.cardSuit)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Card Deck */}
      <div className="lg:col-span-2">
        <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 p-6">
          <h3 className="text-white font-bold text-lg mb-4">Advertiser Card Deck</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {advertisers.map((advertiser: Advertiser) => (
              <Card
                key={advertiser.id}
                className={`p-4 cursor-pointer transition-all ${
                  selectedCard?.id === advertiser.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 border-pink-400'
                    : 'bg-gray-800 hover:bg-gray-700 border-gray-600'
                }`}
                onClick={() => setSelectedCard(advertiser)}
              >
                <div className="text-center">
                  <img
                    src={advertiser.image}
                    alt={advertiser.name}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-2"
                  />
                  <div className="text-white font-bold text-sm">{advertiser.name}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-gray-300 text-xs">{advertiser.cardRank}</span>
                    {getSuitIcon(advertiser.cardSuit)}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-yellow-400 text-xs">
                      {(advertiser.winRate * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Active Raffles Component
function ActiveRaffles({ advertisers, userBalance, setUserBalance }: any) {
  const [selectedRaffle, setSelectedRaffle] = useState<number | null>(null);

  const raffles = [
    { id: 1, advertiser: advertisers[0], prize: 500, entries: 23, timeLeft: 3600, userEntries: 2 },
    { id: 2, advertiser: advertisers[1], prize: 750, entries: 45, timeLeft: 7200, userEntries: 0 },
    { id: 3, advertiser: advertisers[2], prize: 1000, entries: 67, timeLeft: 1800, userEntries: 5 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {raffles.map(raffle => (
        <Card key={raffle.id} className="bg-black/40 backdrop-blur-sm border-pink-500/30 p-6">
          <div className="text-center mb-4">
            <img
              src={raffle.advertiser.image}
              alt={raffle.advertiser.name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
            />
            <h3 className="text-white font-bold text-lg">{raffle.advertiser.name}</h3>
            <div className="text-pink-400 text-sm">Raffle Prize</div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Prize Pool:</span>
              <span className="text-green-400 font-bold">${raffle.prize}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Entries:</span>
              <span className="text-blue-400">{raffle.entries}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Your Entries:</span>
              <span className="text-yellow-400 font-bold">{raffle.userEntries}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Time Left:</span>
              <span className="text-red-400">
                {Math.floor(raffle.timeLeft / 3600)}h {Math.floor((raffle.timeLeft % 3600) / 60)}m
              </span>
            </div>

            <ShimmerButton className="w-full" background="linear-gradient(45deg, #8b5cf6, #ec4899)">
              <Gift className="w-4 h-4 mr-2" />
              Enter Raffle ($5)
            </ShimmerButton>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Leaderboard Component
function Leaderboard({ advertisers }: any) {
  const sortedAdvertisers = [...advertisers].sort((a, b) => b.totalEarnings - a.totalEarnings);

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 p-6">
      <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-400" />
        Top Earning Advertisers
      </h3>

      <div className="space-y-4">
        {sortedAdvertisers.map((advertiser, index) => (
          <div
            key={advertiser.id}
            className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg"
          >
            <div className="text-2xl font-bold text-yellow-400">#{index + 1}</div>

            <img
              src={advertiser.image}
              alt={advertiser.name}
              className="w-12 h-12 rounded-full object-cover"
            />

            <div className="flex-1">
              <div className="text-white font-bold">{advertiser.name}</div>
              <div className="text-gray-400 text-sm">
                {advertiser.cardRank} of {advertiser.cardSuit}
              </div>
            </div>

            <div className="text-right">
              <div className="text-green-400 font-bold">
                ${advertiser.totalEarnings.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Total Earnings</div>
            </div>

            <div className="text-right">
              <div className="text-blue-400 font-bold">
                {(advertiser.winRate * 100).toFixed(0)}%
              </div>
              <div className="text-gray-400 text-sm">Win Rate</div>
            </div>

            {advertiser.isOnline && (
              <Badge className="bg-green-500 text-white">
                <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                Online
              </Badge>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
