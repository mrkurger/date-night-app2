'use client';

import { useState } from 'react';
// import { Header } from "@/components/header" // Removed Header
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  Send,
  ReceiptIcon as Receive,
  History,
} from 'lucide-react';
import EnhancedNavbar from '@/components/enhanced-navbar'; // Added EnhancedNavbar

export default function WalletPage() {
  const [balance] = useState(1250.75);
  const [cryptoBalance] = useState(0.0234);

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedNavbar /> {/* Added EnhancedNavbar */}
      {/* <Header /> */} {/* Removed Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-gray-800 flex items-center gap-3">
            <Wallet className="h-8 w-8 text-pink-600" />
            Crypto Wallet
          </h1>

          {/* Balance Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  USD Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">${balance.toFixed(2)}</div>
                <p className="text-gray-600 mt-2">Available for transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  Bitcoin Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{cryptoBalance} BTC</div>
                <p className="text-gray-600 mt-2">≈ ${(cryptoBalance * 45000).toFixed(2)} USD</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Button className="bg-green-600 hover:bg-green-700 text-white py-6">
              <Send className="h-5 w-5 mr-2" />
              Send Money
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white py-6">
              <Receive className="h-5 w-5 mr-2" />
              Receive Money
            </Button>
            <Button variant="outline" className="py-6">
              <History className="h-5 w-5 mr-2" />
              Transaction History
            </Button>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <div className="font-medium">Payment to Sofia</div>
                    <div className="text-sm text-gray-600">Premium session - 2 hours</div>
                  </div>
                  <div className="text-red-600 font-semibold">-$400.00</div>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <div>
                    <div className="font-medium">Wallet Top-up</div>
                    <div className="text-sm text-gray-600">Credit card deposit</div>
                  </div>
                  <div className="text-green-600 font-semibold">+$500.00</div>
                </div>
                <div className="flex justify-between items-center py-3">
                  <div>
                    <div className="font-medium">Payment to Isabella</div>
                    <div className="text-sm text-gray-600">VIP experience - 3 hours</div>
                  </div>
                  <div className="text-red-600 font-semibold">-$900.00</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
