'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Zap, Crown, Gift, Heart, Dice1, Eye, MessageCircle, Star } from 'lucide-react';

interface StreamCasinoProps {
  streamId: number;
  advertiserName: string;
  advertiserImage: string;
  isLive: boolean;
  viewers: number;
  currentGame?: 'keno' | 'blackjack' | 'raffle' | 'wheel';
  gameMultiplier: number;
  onTipWithGame: (amount: number, gameType?: string) => void;
}

export default function StreamCasinoIntegration({
  streamId,
  advertiserName,
  advertiserImage,
  isLive,
  viewers,
  currentGame,
  gameMultiplier,
  onTipWithGame,
}: StreamCasinoProps) {
  const [showGameOverlay, setShowGameOverlay] = useState(false);
  const [recentWinners, setRecentWinners] = useState([
    { user: 'Mike92', amount: 150, game: 'blackjack' },
    { user: 'Sarah_VIP', amount: 75, game: 'keno' },
    { user: 'Alex_K', amount: 300, game: 'raffle' },
  ]);
  const [liveStats, setLiveStats] = useState({
    totalTipped: 2450,
    gamesPlayed: 23,
    biggestWin: 500,
    activeMultiplier: gameMultiplier,
  });

  useEffect(() => {
    // Simulate live updates
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        totalTipped: prev.totalTipped + Math.floor(Math.random() * 50),
        gamesPlayed: prev.gamesPlayed + (Math.random() > 0.8 ? 1 : 0),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleGameTip = (amount: number) => {
    onTipWithGame(amount, currentGame);

    // Add visual feedback
    const newWinner = {
      user: 'You',
      amount: amount * gameMultiplier,
      game: currentGame || 'tip',
    };
    setRecentWinners(prev => [newWinner, ...prev.slice(0, 2)]);
  };

  return (
    <div className="relative">
      {/* Live Stream Stats Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
        <div className="flex gap-2">
          <Badge className="bg-red-500 text-white animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
            LIVE
          </Badge>
          <Badge className="bg-black/60 text-white">
            <Eye className="w-3 h-3 mr-1" />
            {viewers}
          </Badge>
          {currentGame && (
            <Badge className="bg-yellow-500 text-black animate-bounce">
              🎰 {currentGame.toUpperCase()} {gameMultiplier}x
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Badge className="bg-green-500/80 text-white">
            <DollarSign className="w-3 h-3 mr-1" />${liveStats.totalTipped}
          </Badge>
          <Badge className="bg-purple-500/80 text-white">
            <Dice1 className="w-3 h-3 mr-1" />
            {liveStats.gamesPlayed}
          </Badge>
        </div>
      </div>

      {/* Game Active Notification */}
      {currentGame && (
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 z-20">
          <Card className="bg-black/90 backdrop-blur-sm border-yellow-500/50 p-4 animate-pulse">
            <div className="text-center">
              <div className="text-yellow-400 font-bold text-lg mb-2">
                🎰 {currentGame.toUpperCase()} GAME ACTIVE!
              </div>
              <div className="text-white text-sm mb-3">
                Tips get {gameMultiplier}x multiplier during this game!
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-yellow-500 to-orange-600"
                  onClick={() => handleGameTip(25)}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  $25
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-500 to-red-600"
                  onClick={() => handleGameTip(50)}
                >
                  <Crown className="w-4 h-4 mr-1" />
                  $50
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-red-500 to-pink-600"
                  onClick={() => handleGameTip(100)}
                >
                  <Gift className="w-4 h-4 mr-1" />
                  $100
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Winners Ticker */}
      <div className="absolute bottom-20 left-4 right-4 z-20">
        <Card className="bg-black/80 backdrop-blur-sm border-green-500/30 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-semibold text-sm">Recent Winners</span>
          </div>
          <div className="space-y-1">
            {recentWinners.map((winner, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-gray-300">{winner.user}</span>
                <span className="text-green-400 font-bold">
                  +${winner.amount} ({winner.game})
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Interactive Game Controls */}
      <div className="absolute bottom-4 left-4 right-4 z-20">
        <Card className="bg-black/90 backdrop-blur-sm border-pink-500/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <Image
                  src={advertiserImage || '/placeholder.svg'}
                  alt={advertiserName}
                  fill
                  className="rounded-full object-cover border-2 border-pink-500"
                />
              </div>
              <div>
                <h3 className="text-white font-bold">{advertiserName}</h3>
                <div className="text-gray-300 text-sm">
                  {currentGame ? `Playing ${currentGame}` : 'Available for games'}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleGameTip(10)}
              >
                <DollarSign className="w-4 h-4 mr-1" />
                $10
              </Button>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => handleGameTip(25)}
              >
                <Heart className="w-4 h-4 mr-1" />
                $25
              </Button>
              <Button
                size="sm"
                className="bg-pink-600 hover:bg-pink-700"
                onClick={() => setShowGameOverlay(!showGameOverlay)}
              >
                <Dice1 className="w-4 h-4 mr-1" />
                Games
              </Button>
            </div>
          </div>

          {/* Quick Game Actions */}
          {showGameOverlay && (
            <div className="border-t border-gray-700 pt-3 mt-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => onTipWithGame(50, 'keno')}
                >
                  <Dice1 className="w-4 h-4 mr-1" />
                  Keno
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => onTipWithGame(50, 'blackjack')}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  Blackjack
                </Button>
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                  onClick={() => onTipWithGame(50, 'raffle')}
                >
                  <Gift className="w-4 h-4 mr-1" />
                  Raffle
                </Button>
                <Button
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700"
                  onClick={() => onTipWithGame(100, 'wheel')}
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Wheel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Live Chat Integration */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
        <Button
          className="bg-black/80 backdrop-blur-sm border border-pink-500/30 rounded-full w-12 h-12 p-0"
          onClick={() => {
            /* Open chat */
          }}
        >
          <MessageCircle className="w-6 h-6 text-pink-400" />
        </Button>
      </div>
    </div>
  );
}
