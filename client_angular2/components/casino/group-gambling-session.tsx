'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Users,
  Crown,
  DollarSign,
  Timer,
  MessageCircle,
  Send,
  Zap,
  Trophy,
  Star,
  Heart,
  Gift,
  TrendingUp,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface GroupParticipant {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  currentBet: number;
  totalWinnings: number;
  isVIP: boolean;
  isOnline: boolean;
  position: number;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'bet' | 'win' | 'system';
  amount?: number;
}

interface GroupSession {
  id: string;
  name: string;
  gameType: 'keno' | 'blackjack' | 'poker' | 'roulette';
  maxParticipants: number;
  entryFee: number;
  currentRound: number;
  totalRounds: number;
  timeLeft: number;
  totalPot: number;
  isActive: boolean;
  creator: GroupParticipant;
}

const mockParticipants: GroupParticipant[] = [
  {
    id: '1',
    name: 'Emma',
    avatar: '/assets/img/profiles/random1.jpg',
    rating: 4.8,
    currentBet: 500,
    totalWinnings: 2400,
    isVIP: true,
    isOnline: true,
    position: 1,
  },
  {
    id: '2',
    name: 'Sofia',
    avatar: '/assets/img/profiles/random2.jpg',
    rating: 4.9,
    currentBet: 750,
    totalWinnings: 1800,
    isVIP: true,
    isOnline: true,
    position: 2,
  },
  {
    id: '3',
    name: 'Isabella',
    avatar: '/assets/img/profiles/random3.jpg',
    rating: 4.6,
    currentBet: 300,
    totalWinnings: 1200,
    isVIP: false,
    isOnline: true,
    position: 3,
  },
  {
    id: '4',
    name: 'Astrid',
    avatar: '/assets/img/profiles/random4.jpg',
    rating: 4.7,
    currentBet: 400,
    totalWinnings: 900,
    isVIP: false,
    isOnline: false,
    position: 4,
  },
];

const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Emma',
    message: 'Good luck everyone! 🍀',
    timestamp: new Date(Date.now() - 300000),
    type: 'message',
  },
  {
    id: '2',
    userId: '2',
    userName: 'Sofia',
    message: 'Betting 750 NOK on this round!',
    timestamp: new Date(Date.now() - 240000),
    type: 'bet',
    amount: 750,
  },
  {
    id: '3',
    userId: 'system',
    userName: 'System',
    message: 'Emma won 1200 NOK!',
    timestamp: new Date(Date.now() - 180000),
    type: 'win',
    amount: 1200,
  },
];

const mockSession: GroupSession = {
  id: '1',
  name: 'VIP High Stakes Tournament',
  gameType: 'blackjack',
  maxParticipants: 8,
  entryFee: 500,
  currentRound: 3,
  totalRounds: 10,
  timeLeft: 1800,
  totalPot: 12500,
  isActive: true,
  creator: mockParticipants[0] || {
    id: 'default',
    name: 'Unknown',
    avatar: '/placeholder.svg',
    rating: 0,
    currentBet: 0,
    totalWinnings: 0,
    isVIP: false,
    isOnline: false,
    position: 0,
  },
};

export default function GroupGamblingSession() {
  const [session] = useState<GroupSession>(mockSession);
  const [participants] = useState<GroupParticipant[]>(mockParticipants);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [newMessage, setNewMessage] = useState('');
  const [currentBet, setCurrentBet] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(session.timeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current_user',
      userName: 'You',
      message: newMessage,
      timestamp: new Date(),
      type: 'message',
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const placeBet = () => {
    const betMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current_user',
      userName: 'You',
      message: `Placed bet of ${currentBet} NOK`,
      timestamp: new Date(),
      type: 'bet',
      amount: currentBet,
    };

    setChatMessages(prev => [...prev, betMessage]);
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-gray-400';
      case 3:
        return 'text-orange-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPositionIcon = (position: number) => {
    if (position <= 3) {
      return <Trophy className={`h-4 w-4 ${getPositionColor(position)}`} />;
    }
    return <span className="text-muted-foreground">#{position}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Session Header */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{session.name}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>
                      Round {session.currentRound}/{session.totalRounds}
                    </span>
                    <span>•</span>
                    <span>
                      {participants.length}/{session.maxParticipants} Players
                    </span>
                    <span>•</span>
                    <span className="capitalize">{session.gameType}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {session.totalPot.toLocaleString()} NOK
                  </div>
                  <div className="text-sm text-muted-foreground">Total Pot</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Game Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardContent className="p-4 text-center">
                <Timer className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-500">{formatTime(timeLeft)}</div>
                <div className="text-sm text-muted-foreground">Time Left</div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-500">
                  {participants.filter(p => p.isOnline).length}
                </div>
                <div className="text-sm text-muted-foreground">Online Players</div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-500">{session.entryFee}</div>
                <div className="text-sm text-muted-foreground">Entry Fee (NOK)</div>
              </CardContent>
            </Card>
          </div>

          {/* Round Progress */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Round Progress</span>
                <span className="text-sm text-muted-foreground">
                  {session.currentRound} of {session.totalRounds}
                </span>
              </div>
              <Progress
                value={(session.currentRound / session.totalRounds) * 100}
                className="h-2"
              />
            </CardContent>
          </Card>

          {/* Betting Interface */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Place Your Bet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Bet Amount (NOK)</label>
                  <Input
                    type="number"
                    value={currentBet}
                    onChange={e => setCurrentBet(Number(e.target.value))}
                    min={50}
                    max={2000}
                    step={50}
                    className="mt-1"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium">Quick Bets</div>
                  <div className="flex gap-2">
                    {[100, 250, 500, 1000].map(amount => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentBet(amount)}
                        className={
                          currentBet === amount ? 'bg-primary text-primary-foreground' : ''
                        }
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={placeBet}>
                  <Zap className="h-4 w-4 mr-2" />
                  Place Bet - {currentBet} NOK
                </Button>
                <Button variant="outline">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline">
                  <Gift className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participants Leaderboard */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {participants.map(participant => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {getPositionIcon(participant.position)}
                  </div>

                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.avatar} />
                    <AvatarFallback>{participant.name[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-medium truncate">{participant.name}</span>
                      {participant.isVIP && <Crown className="h-3 w-3 text-yellow-500" />}
                      {participant.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-muted-foreground">{participant.rating}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-500">
                      {participant.totalWinnings.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">NOK</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Live Chat */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Live Chat
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {chatMessages.map(message => (
                    <div key={message.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            message.type === 'system'
                              ? 'text-blue-500'
                              : message.type === 'bet'
                              ? 'text-orange-500'
                              : message.type === 'win'
                              ? 'text-green-500'
                              : 'text-primary'
                          }`}
                        >
                          {message.userName}:
                        </span>
                        <span className="text-muted-foreground">{message.message}</span>
                        {message.amount && (
                          <Badge variant="outline" className="text-xs">
                            {message.amount} NOK
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button size="sm" onClick={sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
