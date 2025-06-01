'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Eye,
  TrendingUp,
  Crown,
  Zap,
  Heart,
  DollarSign,
  Timer,
  Star,
  Lock,
  Unlock,
  Camera,
  MapPin,
  Trophy,
  Coins,
} from 'lucide-react';

interface SocialGamblingSession {
  id: string;
  type: 'data_betting' | 'group_casino' | 'match_prediction' | 'rating_bet';
  title: string;
  participants: number;
  maxParticipants: number;
  stakes: string;
  timeLeft: number;
  creator: {
    name: string;
    avatar: string;
    rating: number;
  };
  currentPot: number;
  isActive: boolean;
  requiresVIP: boolean;
}

interface DataBet {
  id: string;
  user: {
    name: string;
    avatar: string;
    rating: number;
  };
  stake: 'profile_visibility' | 'private_photos' | 'location' | 'personal_info';
  description: string;
  odds: number;
  timeLeft: number;
  currentBets: number;
  totalPot: number;
}

const mockSessions: SocialGamblingSession[] = [
  {
    id: '1',
    type: 'group_casino',
    title: 'VIP Blackjack Tournament',
    participants: 8,
    maxParticipants: 12,
    stakes: '500 NOK entry',
    timeLeft: 1800,
    creator: {
      name: 'Emma',
      avatar: '/public/assets/img/profiles/random1.jpg',
      rating: 4.8,
    },
    currentPot: 6000,
    isActive: true,
    requiresVIP: true,
  },
  {
    id: '2',
    type: 'data_betting',
    title: 'Photo Reveal Challenge',
    participants: 15,
    maxParticipants: 20,
    stakes: 'Private photos',
    timeLeft: 3600,
    creator: {
      name: 'Sofia',
      avatar: '/public/assets/img/profiles/random2.jpg',
      rating: 4.9,
    },
    currentPot: 2500,
    isActive: true,
    requiresVIP: false,
  },
  {
    id: '3',
    type: 'match_prediction',
    title: 'Match Prediction Market',
    participants: 23,
    maxParticipants: 50,
    stakes: '100-1000 NOK',
    timeLeft: 7200,
    creator: {
      name: 'Astrid',
      avatar: '/public/assets/img/profiles/random3.jpg',
      rating: 4.7,
    },
    currentPot: 12500,
    isActive: true,
    requiresVIP: false,
  },
];

const mockDataBets: DataBet[] = [
  {
    id: '1',
    user: {
      name: 'Isabella',
      avatar: '/public/assets/img/profiles/random4.jpg',
      rating: 4.6,
    },
    stake: 'private_photos',
    description: "Betting my private photo gallery on tonight's keno draw",
    odds: 3.2,
    timeLeft: 2400,
    currentBets: 8,
    totalPot: 1600,
  },
  {
    id: '2',
    user: {
      name: 'Ingrid',
      avatar: '/public/assets/img/profiles/random5.jpg',
      rating: 4.8,
    },
    stake: 'location',
    description: 'Will reveal my exact location if I lose this blackjack hand',
    odds: 2.1,
    timeLeft: 900,
    currentBets: 12,
    totalPot: 2400,
  },
];

export default function SocialGamblingHub() {
  const [activeTab, setActiveTab] = useState('live_sessions');
  const [userCoins, setUserCoins] = useState(2500);
  const [userRank, setUserRank] = useState(15);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStakeIcon = (stake: string) => {
    switch (stake) {
      case 'private_photos':
        return <Camera className="h-4 w-4" />;
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'profile_visibility':
        return <Eye className="h-4 w-4" />;
      default:
        return <Lock className="h-4 w-4" />;
    }
  };

  const getStakeColor = (stake: string) => {
    switch (stake) {
      case 'private_photos':
        return 'text-pink-400';
      case 'location':
        return 'text-blue-400';
      case 'profile_visibility':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-primary/10 backdrop-blur-sm border-primary/20">
          <CardContent className="p-4 text-center">
            <Coins className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">{userCoins.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Your Coins</div>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 backdrop-blur-sm border-primary/20">
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-500">#{userRank}</div>
            <div className="text-sm text-muted-foreground">Global Rank</div>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 backdrop-blur-sm border-primary/20">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-500">{mockSessions.length}</div>
            <div className="text-sm text-muted-foreground">Live Sessions</div>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 backdrop-blur-sm border-primary/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-500">+15%</div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm">
          <TabsTrigger value="live_sessions" className="data-[state=active]:bg-primary">
            <Users className="h-4 w-4 mr-2" />
            Live Sessions
          </TabsTrigger>
          <TabsTrigger value="data_betting" className="data-[state=active]:bg-primary">
            <Lock className="h-4 w-4 mr-2" />
            Data Betting
          </TabsTrigger>
          <TabsTrigger value="spectator" className="data-[state=active]:bg-primary">
            <Eye className="h-4 w-4 mr-2" />
            Spectator
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-primary">
            <Crown className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {/* Live Sessions Tab */}
        <TabsContent value="live_sessions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockSessions.map(session => (
              <Card
                key={session.id}
                className="bg-card/50 backdrop-blur-sm border-primary/20 overflow-hidden"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    {session.requiresVIP && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                        <Crown className="h-3 w-3 mr-1" />
                        VIP
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={session.creator.avatar} />
                      <AvatarFallback>{session.creator.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">by {session.creator.name}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs">{session.creator.rating}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Participants</div>
                      <div className="font-semibold">
                        {session.participants}/{session.maxParticipants}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Current Pot</div>
                      <div className="font-semibold text-green-500">{session.currentPot} NOK</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Stakes</div>
                      <div className="font-semibold">{session.stakes}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Time Left</div>
                      <div className="font-semibold text-orange-500">
                        {formatTime(session.timeLeft)}
                      </div>
                    </div>
                  </div>

                  <Progress
                    value={(session.participants / session.maxParticipants) * 100}
                    className="h-2"
                  />

                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Join Session
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Data Betting Tab */}
        <TabsContent value="data_betting">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockDataBets.map(bet => (
              <Card key={bet.id} className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={bet.user.avatar} />
                      <AvatarFallback>{bet.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{bet.user.name}</div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-muted-foreground">{bet.user.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className={getStakeColor(bet.stake)}>{getStakeIcon(bet.stake)}</div>
                    <span className="font-semibold capitalize">
                      {bet.stake.replace('_', ' ')} at Stake
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">{bet.description}</p>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Odds</div>
                      <div className="font-semibold text-green-500">{bet.odds}x</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Bets</div>
                      <div className="font-semibold">{bet.currentBets}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Pot</div>
                      <div className="font-semibold">{bet.totalPot} NOK</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Timer className="h-4 w-4 text-orange-500" />
                    <span className="text-orange-500">{formatTime(bet.timeLeft)} left</span>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      <Heart className="h-4 w-4 mr-2" />
                      Bet For
                    </Button>
                    <Button variant="outline" className="flex-1" size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      Bet Against
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Spectator Tab */}
        <TabsContent value="spectator">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>Live Spectator Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Watch Others Gamble</h3>
                <p className="text-muted-foreground mb-4">
                  Spectate live gambling sessions and bet on the outcomes
                </p>
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Browse Live Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>Social Gambling Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Top Social Gamblers</h3>
                <p className="text-muted-foreground mb-4">
                  See who&apos;s winning big in social gambling
                </p>
                <Button>
                  <Trophy className="h-4 w-4 mr-2" />
                  View Rankings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
