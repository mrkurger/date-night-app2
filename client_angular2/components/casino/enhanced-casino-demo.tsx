"use client";

import React, { useState } from "react";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { NumberTicker } from "@/components/ui/number-ticker";
import { SparklesText } from "@/components/ui/sparkles-text";
import { MagicCard } from "@/components/ui/magic-card";
import { BorderBeam } from "@/components/ui/border-beam";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";
import { RippleButton } from "@/components/ui/ripple-button";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import Particles from "@/components/ui/particles";
import Confetti from "@/components/ui/confetti";
import { Meteors } from "@/components/ui/meteors";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, DollarSign, Star, Zap, Crown, Gift } from "lucide-react";

export default function EnhancedCasinoDemo() {
  const [jackpot, setJackpot] = useState(125000);
  const [showConfetti, setShowConfetti] = useState(false);
  const [chips, setChips] = useState(5000);

  const handleBigWin = () => {
    setJackpot(jackpot + 50000);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleBet = (amount: number) => {
    if (chips >= amount) {
      setChips(chips - amount);
      // Simulate random win
      if (Math.random() > 0.7) {
        setChips(chips + amount * 2);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6 relative overflow-hidden">
      {/* Background Effects */}
      <Particles
        className="absolute inset-0"
        quantity={50}
        color="#ffffff"
        staticity={30}
        ease={50}
      />
      <Meteors number={15} className="opacity-30" />
      
      {/* Confetti for wins */}
      {showConfetti && <Confetti globalstart={true} />}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Jackpot */}
        <div className="text-center space-y-4">
          <SparklesText 
            className="text-6xl font-bold text-white"
            colors={{ first: "#FFD700", second: "#FF6B6B" }}
            sparklesCount={15}
          >
            CASINO ROYALE
          </SparklesText>
          
          <NeonGradientCard className="inline-block">
            <div className="flex items-center space-x-4 p-6">
              <Crown className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-sm text-gray-400">PROGRESSIVE JACKPOT</div>
                <div className="text-3xl font-bold text-white">
                  $<NumberTicker value={jackpot} className="text-yellow-400" />
                </div>
              </div>
            </div>
          </NeonGradientCard>
        </div>

        {/* Player Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MagicCard className="p-6 bg-black/50 border-purple-500/30">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-6 h-6 text-green-400" />
              <div>
                <div className="text-sm text-gray-400">Your Chips</div>
                <div className="text-2xl font-bold text-white">
                  <NumberTicker value={chips} />
                </div>
              </div>
            </div>
          </MagicCard>

          <MagicCard className="p-6 bg-black/50 border-blue-500/30">
            <div className="flex items-center space-x-3">
              <Star className="w-6 h-6 text-blue-400" />
              <div>
                <div className="text-sm text-gray-400">VIP Level</div>
                <div className="text-2xl font-bold text-white">Diamond</div>
              </div>
            </div>
          </MagicCard>

          <MagicCard className="p-6 bg-black/50 border-pink-500/30">
            <div className="flex items-center space-x-3">
              <Heart className="w-6 h-6 text-pink-400" />
              <div>
                <div className="text-sm text-gray-400">Wins Today</div>
                <div className="text-2xl font-bold text-white">
                  <NumberTicker value={12} />
                </div>
              </div>
            </div>
          </MagicCard>
        </div>

        {/* Game Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Blackjack Table */}
          <div className="relative">
            <BorderBeam 
              size={300} 
              duration={12} 
              colorFrom="#FFD700" 
              colorTo="#FF6B6B" 
            />
            <Card className="p-8 bg-gradient-to-br from-green-900/80 to-green-800/80 border-green-500/30">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Blackjack VIP</h3>
                  <Badge className="bg-yellow-500 text-black">HOT TABLE</Badge>
                </div>
                
                <div className="text-center">
                  <AnimatedShinyText className="text-lg text-green-300">
                    🃏 Dealer showing: King of Hearts
                  </AnimatedShinyText>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <ShimmerButton
                    onClick={() => handleBet(100)}
                    background="linear-gradient(45deg, #1e40af, #3b82f6)"
                    className="text-white"
                  >
                    Bet $100
                  </ShimmerButton>
                  <ShimmerButton
                    onClick={() => handleBet(500)}
                    background="linear-gradient(45deg, #7c2d12, #ea580c)"
                    className="text-white"
                  >
                    Bet $500
                  </ShimmerButton>
                  <ShimmerButton
                    onClick={() => handleBet(1000)}
                    background="linear-gradient(45deg, #7c2d12, #dc2626)"
                    className="text-white"
                  >
                    Bet $1000
                  </ShimmerButton>
                </div>
              </div>
            </Card>
          </div>

          {/* Roulette Table */}
          <div className="relative">
            <BorderBeam 
              size={300} 
              duration={15} 
              colorFrom="#8B5CF6" 
              colorTo="#EC4899" 
            />
            <Card className="p-8 bg-gradient-to-br from-red-900/80 to-red-800/80 border-red-500/30">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">European Roulette</h3>
                  <Badge className="bg-red-500 text-white">LIVE</Badge>
                </div>
                
                <div className="text-center">
                  <AnimatedShinyText className="text-lg text-red-300">
                    🎰 Last number: 23 Red
                  </AnimatedShinyText>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <RippleButton
                    onClick={() => handleBet(250)}
                    rippleColor="#ef4444"
                    className="bg-red-600 hover:bg-red-700 text-white border-red-500"
                  >
                    Red ($250)
                  </RippleButton>
                  <RippleButton
                    onClick={() => handleBet(250)}
                    rippleColor="#1f2937"
                    className="bg-gray-800 hover:bg-gray-900 text-white border-gray-600"
                  >
                    Black ($250)
                  </RippleButton>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Special Actions */}
        <div className="flex justify-center space-x-6">
          <ShimmerButton
            onClick={handleBigWin}
            background="linear-gradient(45deg, #fbbf24, #f59e0b)"
            className="text-black font-bold px-8 py-4 text-lg"
            shimmerColor="#ffffff"
          >
            <Gift className="w-5 h-5 mr-2" />
            Trigger Big Win!
          </ShimmerButton>
          
          <ShimmerButton
            onClick={() => setChips(chips + 1000)}
            background="linear-gradient(45deg, #10b981, #059669)"
            className="text-white font-bold px-8 py-4 text-lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Add Chips
          </ShimmerButton>
        </div>

        {/* Footer */}
        <div className="text-center">
          <AnimatedShinyText className="text-xl text-gray-300">
            ✨ Experience the magic of premium casino gaming ✨
          </AnimatedShinyText>
        </div>
      </div>
    </div>
  );
}
