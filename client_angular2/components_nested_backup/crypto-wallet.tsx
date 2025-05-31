"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface CryptoWalletProps {
  className?: string
}

export function CryptoWallet({ className }: CryptoWalletProps) {
  const [walletAddress, setWalletAddress] = useState("0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t")
  const [balance, setBalance] = useState({
    eth: "0.245",
    btc: "0.0021",
    usdt: "150.00",
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const handleRefreshBalance = () => {
    setIsRefreshing(true)
    // Simulate API call to refresh balance
    setTimeout(() => {
      setBalance({
        eth: (Number.parseFloat(balance.eth) + Math.random() * 0.01).toFixed(4),
        btc: (Number.parseFloat(balance.btc) + Math.random() * 0.0001).toFixed(6),
        usdt: (Number.parseFloat(balance.usdt) + Math.random() * 1).toFixed(2),
      })
      setIsRefreshing(false)
    }, 1000)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Card className={cn("bg-gradient-to-br from-gray-900 to-gray-800", className)}>
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Crypto Wallet</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-300 hover:text-white hover:bg-gray-700"
            onClick={handleRefreshBalance}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </CardTitle>
        <CardDescription className="text-gray-400">Manage your cryptocurrency</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="wallet-address" className="text-gray-300">
            Wallet Address
          </Label>
          <div className="flex mt-1">
            <Input
              id="wallet-address"
              value={walletAddress}
              readOnly
              className="flex-1 bg-gray-800 border-gray-700 text-gray-300"
            />
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 text-gray-300 hover:text-white hover:bg-gray-700"
              onClick={copyToClipboard}
            >
              <Copy className="h-4 w-4" />
              <span className="sr-only">Copy</span>
            </Button>
          </div>
          {isCopied && <p className="text-xs text-green-500 mt-1">Copied to clipboard!</p>}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-300">Balance</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-xs text-gray-400">ETH</div>
              <div className="text-lg font-semibold text-white">{balance.eth}</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-xs text-gray-400">BTC</div>
              <div className="text-lg font-semibold text-white">{balance.btc}</div>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-xs text-gray-400">USDT</div>
              <div className="text-lg font-semibold text-white">{balance.usdt}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700">
          Deposit
        </Button>
        <Button className="bg-pink-600 hover:bg-pink-700">Send Payment</Button>
      </CardFooter>
    </Card>
  )
}
