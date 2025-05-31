'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Video,
  VideoOff,
  Heart,
  DollarSign,
  Eye,
  Gift,
  Zap,
  Crown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  MessageCircle,
} from 'lucide-react';
import { getFemaleImageByIndex } from '@/lib/data';

interface LiveAdvertiser {
  id: number;
  name: string;
  image: string;
  isLive: boolean;
  viewers: number;
  streamUrl: string;
  cardRank: string;
  cardSuit: string;
  totalTips: number;
  currentGame?: 'keno' | 'blackjack' | 'raffle';
  gameMultiplier: number;
  isInteractive: boolean;
  streamQuality: 'HD' | '4K';
  showType: 'public' | 'private' | 'group';
  pricePerMinute: number;
}

const liveAdvertisers: LiveAdvertiser[] = [
  {
    id: 1,
    name: 'Sophia',
    image: getFemaleImageByIndex(1),
    isLive: true,
    viewers: 234,
    streamUrl: 'https://example.com/stream1',
    cardRank: 'Ace',
    cardSuit: 'Hearts',
    totalTips: 1250,
    currentGame: 'keno',
    gameMultiplier: 2.5,
    isInteractive: true,
    streamQuality: '4K',
    showType: 'public',
    pricePerMinute: 3.99,
  },
  {
    id: 2,
    name: 'Isabella',
    image: getFemaleImageByIndex(2),
    isLive: true,
    viewers: 189,
    streamUrl: 'https://example.com/stream2',
    cardRank: 'King',
    cardSuit: 'Diamonds',
    totalTips: 890,
    currentGame: 'blackjack',
    gameMultiplier: 1.8,
    isInteractive: true,
    streamQuality: 'HD',
    showType: 'group',
    pricePerMinute: 2.99,
  },
  {
    id: 3,
    name: 'Emma',
    image: getFemaleImageByIndex(3),
    isLive: true,
    viewers: 156,
    streamUrl: 'https://example.com/stream3',
    cardRank: 'Queen',
    cardSuit: 'Spades',
    totalTips: 2100,
    currentGame: 'raffle',
    gameMultiplier: 3.2,
    isInteractive: false,
    streamQuality: '4K',
    showType: 'private',
    pricePerMinute: 5.99,
  },
];

export default function LiveCasinoHub() {
  const [selectedStream, setSelectedStream] = useState<LiveAdvertiser | null>(liveAdvertisers[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [chatMessages, setChatMessages] = useState<
    Array<{ id: number; user: string; message: string; tip?: number }>
  >([
    { id: 1, user: 'Mike92', message: 'Looking gorgeous tonight! 😍' },
    { id: 2, user: 'Alex_VIP', message: "Let's play some blackjack!", tip: 25 },
    { id: 3, user: 'Sarah_K', message: 'Your keno picks are amazing!' },
    { id: 4, user: 'Rich_Player', message: 'Going all in on this hand! 🎰', tip: 100 },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [activeBets, setActiveBets] = useState<
    Array<{ game: string; amount: number; advertiser: string }>
  >([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStreamSelect = (advertiser: LiveAdvertiser) => {
    setSelectedStream(advertiser);
    setIsPlaying(true);
  };

  const handleTipDuringStream = (amount: number) => {
    if (selectedStream) {
      // Add tip message to chat
      const tipMessage = {
        id: Date.now(),
        user: 'You',
        message: `Tipped $${amount} during ${selectedStream.currentGame} game! 🎰`,
        tip: amount,
      };
      setChatMessages(prev => [...prev, tipMessage]);

      // Add to active bets if there's a current game
      if (selectedStream.currentGame) {
        setActiveBets(prev => [
          ...prev,
          {
            game: selectedStream.currentGame!,
            amount: amount * selectedStream.gameMultiplier,
            advertiser: selectedStream.name,
          },
        ]);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 h-screen">
        {/* Main Stream Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Stream Player */}
          <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 overflow-hidden">
            <div className="relative aspect-video bg-black">
              {selectedStream ? (
                <>
                  {/* Video Player Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                    <img
                      src={selectedStream.image || getFemaleImageByIndex(selectedStream.id)}
                      alt={selectedStream.name}
                      className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                  </div>

                  {/* Stream Overlay */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <div className="flex gap-2">
                      <Badge className="bg-red-500 text-white animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                        LIVE
                      </Badge>
                      <Badge className="bg-black/60 text-white">
                        <Eye className="w-3 h-3 mr-1" />
                        {selectedStream.viewers}
                      </Badge>
                      <Badge className="bg-purple-600 text-white">
                        {selectedStream.streamQuality}
                      </Badge>
                      {selectedStream.currentGame && (
                        <Badge className="bg-yellow-500 text-black">
                          🎰 {selectedStream.currentGame.toUpperCase()}{' '}
                          {selectedStream.gameMultiplier}x
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" className="bg-black/60">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-black/60"
                        onClick={toggleFullscreen}
                      >
                        <Maximize className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Stream Info Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={selectedStream.image || getFemaleImageByIndex(selectedStream.id)}
                            alt={selectedStream.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-pink-500"
                          />
                          <div>
                            <h3 className="text-white font-bold text-lg">{selectedStream.name}</h3>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-300">
                                {selectedStream.cardRank} of {selectedStream.cardSuit}
                              </span>
                              <span className="text-green-400">
                                ${selectedStream.totalTips} earned today
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleTipDuringStream(10)}
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            Tip $10
                          </Button>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => handleTipDuringStream(25)}
                          >
                            <Gift className="w-4 h-4 mr-1" />
                            Tip $25
                          </Button>
                          <Button
                            size="sm"
                            className="bg-pink-600 hover:bg-pink-700"
                            onClick={() => handleTipDuringStream(50)}
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            Tip $50
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Game Integration Overlay */}
                  {selectedStream.currentGame && (
                    <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                      <Card className="bg-black/80 backdrop-blur-sm border-yellow-500/50 p-4 max-w-xs">
                        <div className="text-center">
                          <div className="text-yellow-400 font-bold mb-2">
                            🎰 {selectedStream.currentGame.toUpperCase()} GAME ACTIVE
                          </div>
                          <div className="text-white text-sm mb-3">
                            Tips during this game get {selectedStream.gameMultiplier}x multiplier!
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600"
                            onClick={() => handleTipDuringStream(100)}
                          >
                            <Zap className="w-4 h-4 mr-1" />
                            Power Tip $100
                          </Button>
                        </div>
                      </Card>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <VideoOff className="w-16 h-16 mb-4" />
                  <p>Select a live stream to watch</p>
                </div>
              )}
            </div>
          </Card>

          {/* Active Bets */}
          {activeBets.length > 0 && (
            <Card className="bg-black/40 backdrop-blur-sm border-green-500/30 p-4">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Active Casino Bets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeBets.map((bet, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">{bet.game.toUpperCase()}</span>
                      <span className="text-green-400 font-bold">${bet.amount}</span>
                    </div>
                    <div className="text-gray-400 text-xs">with {bet.advertiser}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Live Stream Grid */}
          <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 p-4">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-pink-400" />
              Live Casino Streams
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {liveAdvertisers.map(advertiser => (
                <Card
                  key={advertiser.id}
                  className={`cursor-pointer transition-all overflow-hidden ${
                    selectedStream?.id === advertiser.id
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-gray-600 hover:border-pink-400 bg-gray-800/50'
                  }`}
                  onClick={() => handleStreamSelect(advertiser)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={advertiser.image || getFemaleImageByIndex(advertiser.id)}
                      alt={advertiser.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Live Badge */}
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                      <div className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></div>
                      LIVE
                    </Badge>

                    {/* Game Badge */}
                    {advertiser.currentGame && (
                      <Badge className="absolute top-2 right-2 bg-yellow-500 text-black text-xs">
                        🎰 {advertiser.gameMultiplier}x
                      </Badge>
                    )}

                    {/* Stream Info */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="text-white font-bold text-sm">{advertiser.name}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-300 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {advertiser.viewers}
                        </span>
                        <span className="text-green-400">${advertiser.pricePerMinute}/min</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat & Controls Sidebar */}
        <div className="space-y-4">
          {/* Stream Controls */}
          <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 p-4">
            <h3 className="text-white font-bold mb-3">Stream Controls</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant={isPlaying ? 'default' : 'outline'}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant={isMuted ? 'outline' : 'default'}
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          </Card>

          {/* Quick Tips */}
          <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 p-4">
            <h3 className="text-white font-bold mb-3">Quick Tips</h3>
            <div className="grid grid-cols-2 gap-2">
              {[5, 10, 25, 50, 100, 250].map(amount => (
                <Button
                  key={amount}
                  size="sm"
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  onClick={() => handleTipDuringStream(amount)}
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </Card>

          {/* Live Chat */}
          <Card className="bg-black/40 backdrop-blur-sm border-pink-500/30 p-4 flex-1">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Chat
            </h3>

            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {chatMessages.map(msg => (
                <div key={msg.id} className="text-sm">
                  <span className="text-pink-400 font-semibold">{msg.user}:</span>
                  <span className="text-gray-300 ml-2">{msg.message}</span>
                  {msg.tip && (
                    <Badge className="ml-2 bg-green-500 text-white text-xs">
                      <DollarSign className="w-3 h-3 mr-1" />${msg.tip}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white text-sm"
              />
              <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
                Send
              </Button>
            </div>
          </Card>

          {/* Private Show Options */}
          {selectedStream && (
            <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30 p-4">
              <h3 className="text-white font-bold mb-3">Private Options</h3>
              <div className="space-y-2">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  <Crown className="w-4 h-4 mr-2" />
                  Private Show (${selectedStream.pricePerMinute}/min)
                </Button>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Video className="w-4 h-4 mr-2" />
                  Cam2Cam (+$2/min)
                </Button>
                <Button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Casino Challenge
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
