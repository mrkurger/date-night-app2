"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Camera, 
  MapPin, 
  Eye, 
  User, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  DollarSign, 
  Timer,
  Zap,
  Shield,
  Star,
  Heart
} from "lucide-react"

interface DataStake {
  type: 'profile_visibility' | 'private_photos' | 'location' | 'personal_info' | 'contact_info'
  label: string
  description: string
  icon: React.ReactNode
  riskLevel: 'low' | 'medium' | 'high'
  baseValue: number
  isEnabled: boolean
}

interface BettingGame {
  id: string
  name: string
  type: 'keno' | 'blackjack' | 'roulette' | 'dice'
  minBet: number
  maxBet: number
  winChance: number
  multiplier: number
}

const dataStakes: DataStake[] = [
  {
    type: 'profile_visibility',
    label: 'Profile Visibility',
    description: 'Make your profile private/public for 24 hours',
    icon: <Eye className="h-4 w-4" />,
    riskLevel: 'low',
    baseValue: 100,
    isEnabled: true
  },
  {
    type: 'private_photos',
    label: 'Private Photo Gallery',
    description: 'Grant access to your private photos',
    icon: <Camera className="h-4 w-4" />,
    riskLevel: 'high',
    baseValue: 500,
    isEnabled: true
  },
  {
    type: 'location',
    label: 'Exact Location',
    description: 'Reveal your precise location for 12 hours',
    icon: <MapPin className="h-4 w-4" />,
    riskLevel: 'medium',
    baseValue: 250,
    isEnabled: true
  },
  {
    type: 'personal_info',
    label: 'Personal Details',
    description: 'Share occupation, education, and interests',
    icon: <User className="h-4 w-4" />,
    riskLevel: 'low',
    baseValue: 150,
    isEnabled: true
  },
  {
    type: 'contact_info',
    label: 'Contact Information',
    description: 'Share phone number or social media',
    icon: <Shield className="h-4 w-4" />,
    riskLevel: 'high',
    baseValue: 750,
    isEnabled: false
  }
]

const bettingGames: BettingGame[] = [
  { id: '1', name: 'Lucky Keno', type: 'keno', minBet: 50, maxBet: 1000, winChance: 25, multiplier: 3.5 },
  { id: '2', name: 'High Stakes Blackjack', type: 'blackjack', minBet: 100, maxBet: 2000, winChance: 45, multiplier: 2.1 },
  { id: '3', name: 'Roulette Royale', type: 'roulette', minBet: 25, maxBet: 500, winChance: 35, multiplier: 2.8 },
  { id: '4', name: 'Dice Dreams', type: 'dice', minBet: 75, maxBet: 1500, winChance: 40, multiplier: 2.4 }
]

export default function DataBettingInterface() {
  const [selectedStakes, setSelectedStakes] = useState<string[]>([])
  const [selectedGame, setSelectedGame] = useState<BettingGame | null>(null)
  const [betAmount, setBetAmount] = useState([100])
  const [confirmationStep, setConfirmationStep] = useState(false)
  const [userBalance, setUserBalance] = useState(2500)

  const toggleStake = (stakeType: string) => {
    setSelectedStakes(prev => 
      prev.includes(stakeType) 
        ? prev.filter(s => s !== stakeType)
        : [...prev, stakeType]
    )
  }

  const calculateTotalValue = () => {
    return selectedStakes.reduce((total, stakeType) => {
      const stake = dataStakes.find(s => s.type === stakeType)
      return total + (stake?.baseValue || 0)
    }, 0) + (betAmount[0] || 0)
  }

  const calculateWinnings = () => {
    if (!selectedGame) return 0
    return calculateTotalValue() * selectedGame.multiplier
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500 bg-green-500/10'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10'
      case 'high': return 'text-red-500 bg-red-500/10'
      default: return 'text-gray-500 bg-gray-500/10'
    }
  }

  const placeBet = () => {
    if (!selectedGame || selectedStakes.length === 0) return
    
    // Simulate betting logic
    console.log('Placing data bet:', {
      stakes: selectedStakes,
      game: selectedGame,
      amount: betAmount[0],
      totalValue: calculateTotalValue()
    })
    
    setConfirmationStep(false)
    setSelectedStakes([])
    setSelectedGame(null)
    setBetAmount([100])
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Data Betting Interface</h1>
        <p className="text-muted-foreground">
          Wager your personal data for a chance to win big! Higher stakes = Higher rewards.
        </p>
      </div>

      {/* User Balance */}
      <Card className="bg-primary/10 backdrop-blur-sm border-primary/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-primary" />
            <div>
              <div className="font-semibold">Your Balance</div>
              <div className="text-sm text-muted-foreground">Available for betting</div>
            </div>
          </div>
          <div className="text-2xl font-bold text-primary">{userBalance} NOK</div>
        </CardContent>
      </Card>

      {!confirmationStep ? (
        <>
          {/* Data Stakes Selection */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Select Your Data Stakes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {dataStakes.map((stake) => (
                <div 
                  key={stake.type}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedStakes.includes(stake.type)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  } ${!stake.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => stake.isEnabled && toggleStake(stake.type)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-primary">{stake.icon}</div>
                      <div>
                        <div className="font-semibold">{stake.label}</div>
                        <div className="text-sm text-muted-foreground">{stake.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRiskColor(stake.riskLevel)}>
                        {stake.riskLevel.toUpperCase()}
                      </Badge>
                      <div className="text-right">
                        <div className="font-semibold">{stake.baseValue} NOK</div>
                        <div className="text-xs text-muted-foreground">Base Value</div>
                      </div>
                      {stake.isEnabled ? (
                        <Switch 
                          checked={selectedStakes.includes(stake.type)}
                          onChange={() => toggleStake(stake.type)}
                        />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cash Bet Amount */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Additional Cash Bet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Bet Amount: {betAmount[0]} NOK</span>
                  <span className="text-muted-foreground">Max: {userBalance} NOK</span>
                </div>
                <Slider
                  value={betAmount}
                  onValueChange={setBetAmount}
                  max={userBalance}
                  min={0}
                  step={25}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Game Selection */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Choose Your Game
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bettingGames.map((game) => (
                  <div
                    key={game.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedGame?.id === game.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedGame(game)}
                  >
                    <div className="space-y-2">
                      <div className="font-semibold">{game.name}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Win Chance:</span>
                          <span className="ml-1 font-semibold text-green-500">{game.winChance}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Multiplier:</span>
                          <span className="ml-1 font-semibold text-blue-500">{game.multiplier}x</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Bet Summary */}
          {selectedStakes.length > 0 && selectedGame && (
            <Card className="bg-gradient-to-r from-primary/20 to-blue-500/20 backdrop-blur-sm border-primary/30">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Bet Summary</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Stake Value</div>
                      <div className="text-xl font-bold">{calculateTotalValue()} NOK</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Potential Winnings</div>
                      <div className="text-xl font-bold text-green-500">{calculateWinnings().toFixed(0)} NOK</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Stakes at Risk:</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedStakes.map(stakeType => {
                        const stake = dataStakes.find(s => s.type === stakeType)
                        return (
                          <Badge key={stakeType} variant="outline">
                            {stake?.label}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setConfirmationStep(true)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Place Bet - {calculateTotalValue()} NOK Value
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Confirmation Step */
        <Card className="bg-card/50 backdrop-blur-sm border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Your Data Bet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> You are about to wager personal data. If you lose, 
                the selected information will be made available according to the bet terms.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Game: {selectedGame?.name}</h4>
                <div className="text-sm text-muted-foreground">
                  Win Chance: {selectedGame?.winChance}% | Multiplier: {selectedGame?.multiplier}x
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Stakes at Risk:</h4>
                <div className="space-y-2">
                  {selectedStakes.map(stakeType => {
                    const stake = dataStakes.find(s => s.type === stakeType)
                    return (
                      <div key={stakeType} className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                        <span>{stake?.label}</span>
                        <Badge className={getRiskColor(stake?.riskLevel || 'low')}>
                          {stake?.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded">
                <div>
                  <div className="text-sm text-muted-foreground">Total Risk</div>
                  <div className="text-lg font-bold">{calculateTotalValue()} NOK</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Potential Win</div>
                  <div className="text-lg font-bold text-green-500">{calculateWinnings().toFixed(0)} NOK</div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setConfirmationStep(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-destructive hover:bg-destructive/90"
                onClick={placeBet}
              >
                <Zap className="h-4 w-4 mr-2" />
                Confirm Bet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
