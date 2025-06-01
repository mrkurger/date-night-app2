'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Gift, DollarSign, Users, Zap, Crown, Timer, TrendingUp } from 'lucide-react';

interface TipRaffleProps {
  advertiserId: number;
  advertiserName: string;
  advertiserImage: string;
  tipAmount: number;
  onTipWithRaffle: (amount: number, raffleEntry: boolean, advertiserMatch: boolean) => void;
}

export default function TipRaffleSystem({
  advertiserId,
  advertiserName,
  advertiserImage,
  tipAmount,
  onTipWithRaffle,
}: TipRaffleProps) {
  const [raffleEntry, setRaffleEntry] = useState(false);
  const [advertiserMatch, setAdvertiserMatch] = useState(false);
  const [loyaltyLevel, setLoyaltyLevel] = useState(2.3); // User's loyalty multiplier with this advertiser
  const [nextDraw, setNextDraw] = useState(180); // seconds until next draw
  const [currentPrize, setCurrentPrize] = useState(1250);

  useEffect(() => {
    const timer = setInterval(() => {
      setNextDraw(prev => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateWinChance = () => {
    const baseChance = 5; // 5% base chance
    const loyaltyBonus = Math.min(loyaltyLevel * 10, 50); // Max 50% from loyalty
    const matchBonus = advertiserMatch ? 25 : 0; // 25% bonus if advertiser matches
    return Math.min(baseChance + loyaltyBonus + matchBonus, 80); // Max 80% chance
  };

  const calculatePrize = () => {
    let basePrize = tipAmount * 2;
    if (raffleEntry) basePrize += currentPrize * 0.1;
    if (advertiserMatch) basePrize *= 2;
    return basePrize;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-sm border-pink-500/30 p-6">
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-pink-500">
          <Image
            src={advertiserImage || '/placeholder.svg'}
            alt={advertiserName}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Tip & Win with {advertiserName}</h3>
        <p className="text-gray-300">Turn your tip into a chance to win big!</p>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-black/30 rounded-lg p-3 text-center">
          <Timer className="w-5 h-5 text-blue-400 mx-auto mb-1" />
          <div className="text-blue-400 font-bold">{formatTime(nextDraw)}</div>
          <div className="text-gray-400 text-xs">Next Draw</div>
        </div>

        <div className="bg-black/30 rounded-lg p-3 text-center">
          <Gift className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <div className="text-yellow-400 font-bold">${currentPrize}</div>
          <div className="text-gray-400 text-xs">Prize Pool</div>
        </div>
      </div>

      {/* Loyalty Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 text-sm">Your Loyalty Level</span>
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
            <Crown className="w-3 h-3 mr-1" />
            {loyaltyLevel.toFixed(1)}x
          </Badge>
        </div>
        <Progress value={(loyaltyLevel / 5) * 100} className="h-2" />
        <div className="text-gray-400 text-xs mt-1">Higher loyalty = Better winning chances!</div>
      </div>

      {/* Tip Options */}
      <div className="space-y-4 mb-6">
        {/* Basic Tip */}
        <div className="bg-black/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">Basic Tip</span>
            <span className="text-green-400 font-bold">${tipAmount}</span>
          </div>
          <div className="text-gray-400 text-sm">
            Standard tip - {advertiserName} gets 85%, site gets 15%
          </div>
        </div>

        {/* Raffle Entry */}
        <div className="bg-black/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={raffleEntry}
                onChange={e => setRaffleEntry(e.target.checked)}
                className="rounded border-gray-600"
              />
              <span className="text-white font-semibold">Enter Raffle</span>
            </div>
            <span className="text-purple-400 font-bold">+${tipAmount}</span>
          </div>
          <div className="text-gray-400 text-sm">Double your tip to enter the 24/7 raffle draw</div>
          {raffleEntry && (
            <div className="mt-2 text-purple-400 text-sm">
              ✨ Win Chance: {calculateWinChance().toFixed(1)}%
            </div>
          )}
        </div>

        {/* Advertiser Match */}
        <div className="bg-black/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={advertiserMatch}
                onChange={e => setAdvertiserMatch(e.target.checked)}
                className="rounded border-gray-600"
              />
              <span className="text-white font-semibold">Advertiser Match</span>
            </div>
            <span className="text-pink-400 font-bold">4x Chance!</span>
          </div>
          <div className="text-gray-400 text-sm">
            {advertiserName} matches your bet - quadruple your winning chances!
          </div>
          {advertiserMatch && (
            <div className="mt-2 text-pink-400 text-sm">
              🚀 Boosted Win Chance: {calculateWinChance().toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Potential Winnings */}
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold">Potential Prize:</span>
          <span className="text-green-400 font-bold text-xl">${calculatePrize().toFixed(0)}</span>
        </div>
        <div className="text-gray-300 text-sm mt-1">
          Split 50/50 with {advertiserName} if you win!
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white h-12"
          onClick={() =>
            onTipWithRaffle(tipAmount * (raffleEntry ? 2 : 1), raffleEntry, advertiserMatch)
          }
        >
          <DollarSign className="w-5 h-5 mr-2" />
          Tip ${tipAmount * (raffleEntry ? 2 : 1)} {raffleEntry && '& Enter Raffle'}
          {advertiserMatch && <Zap className="w-5 h-5 ml-2 text-yellow-400" />}
        </Button>

        <div className="grid grid-cols-3 gap-2">
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
            <TrendingUp className="w-4 h-4 mr-1" />
            Stats
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
            <Users className="w-4 h-4 mr-1" />
            Players
          </Button>
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
            <Gift className="w-4 h-4 mr-1" />
            History
          </Button>
        </div>
      </div>

      {/* Live Feed */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-gray-400 text-sm mb-2">🔴 Live Activity</div>
        <div className="space-y-1 text-xs">
          <div className="text-green-400">💰 Sarah won $340 with Emma!</div>
          <div className="text-blue-400">🎲 Mike entered raffle with Sophia</div>
          <div className="text-purple-400">⚡ Lisa & Olivia matched bet!</div>
        </div>
      </div>
    </Card>
  );
}
