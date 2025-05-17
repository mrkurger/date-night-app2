"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Wallet,
  CreditCardIcon,
  Bitcoin,
} from "lucide-react"

// Mock wallet data
const walletData = {
  balance: {
    fiat: {
      USD: 1250.75,
      EUR: 980.5,
      NOK: 8500.0,
      SEK: 7200.0,
      DKK: 5600.0,
    },
    crypto: {
      BTC: 0.025,
      ETH: 0.75,
      USDT: 500,
      BNB: 2.5,
      XRP: 1200,
      ADA: 2000,
      SOL: 15,
      DOGE: 5000,
      DOT: 100,
      MATIC: 500,
    },
  },
  transactions: [
    { id: 1, type: "deposit", amount: 500, currency: "USD", date: "2023-05-10T14:32:00", status: "completed" },
    { id: 2, type: "withdrawal", amount: 200, currency: "USD", date: "2023-05-08T09:15:00", status: "completed" },
    {
      id: 3,
      type: "tip",
      amount: 50,
      currency: "USD",
      date: "2023-05-07T18:45:00",
      status: "completed",
      recipient: "Sophia",
    },
    {
      id: 4,
      type: "purchase",
      amount: 100,
      currency: "USD",
      date: "2023-05-05T11:20:00",
      status: "completed",
      description: "VIP Content",
    },
    { id: 5, type: "deposit", amount: 1000, currency: "USD", date: "2023-05-01T16:10:00", status: "completed" },
    { id: 6, type: "withdrawal", amount: 300, currency: "BTC", date: "2023-04-28T13:45:00", status: "pending" },
  ],
  paymentMethods: [
    { id: 1, type: "card", last4: "4242", brand: "Visa", expMonth: 12, expYear: 2025 },
    { id: 2, type: "bank", accountLast4: "1234", bankName: "Chase" },
    { id: 3, type: "crypto", address: "0x1234...5678", currency: "ETH" },
  ],
}

// Cryptocurrency price data (mock)
const cryptoPrices = {
  BTC: 35000,
  ETH: 2000,
  USDT: 1,
  BNB: 300,
  XRP: 0.5,
  ADA: 0.4,
  SOL: 80,
  DOGE: 0.1,
  DOT: 5,
  MATIC: 0.8,
}

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [depositAmount, setDepositAmount] = useState("")
  const [depositCurrency, setDepositCurrency] = useState("USD")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawCurrency, setWithdrawCurrency] = useState("USD")

  // Calculate total balance in USD
  const calculateTotalBalance = () => {
    let total = 0

    // Add fiat balances
    Object.entries(walletData.balance.fiat).forEach(([currency, amount]) => {
      switch (currency) {
        case "USD":
          total += amount
          break
        case "EUR":
          total += amount * 1.1 // Conversion rate EUR to USD
          break
        case "NOK":
          total += amount * 0.095 // Conversion rate NOK to USD
          break
        case "SEK":
          total += amount * 0.097 // Conversion rate SEK to USD
          break
        case "DKK":
          total += amount * 0.15 // Conversion rate DKK to USD
          break
      }
    })

    // Add crypto balances
    Object.entries(walletData.balance.crypto).forEach(([currency, amount]) => {
      if (cryptoPrices[currency]) {
        total += amount * cryptoPrices[currency]
      }
    })

    return total.toFixed(2)
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Wallet</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance (USD)</p>
                <p className="text-3xl font-bold mt-1">${calculateTotalBalance()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Quick Deposit</p>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">Deposit Funds</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deposit Funds</DialogTitle>
                    <DialogDescription>Add money to your wallet. Choose your currency and amount.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Select defaultValue={depositCurrency} onValueChange={setDepositCurrency}>
                        <SelectTrigger className="col-span-1">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="NOK">NOK</SelectItem>
                          <SelectItem value="BTC">BTC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        className="col-span-3"
                        placeholder="Amount"
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="col-span-4">
                        <p className="text-sm text-muted-foreground">Payment Method</p>
                      </div>
                      <Select defaultValue="card">
                        <SelectTrigger className="col-span-4">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="card">Credit Card (Visa **** 4242)</SelectItem>
                          <SelectItem value="bank">Bank Account (Chase **** 1234)</SelectItem>
                          <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      Deposit ${depositAmount} {depositCurrency}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Quick Withdraw</p>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Withdraw Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                      Withdraw money from your wallet. Choose your currency and amount.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Select defaultValue={withdrawCurrency} onValueChange={setWithdrawCurrency}>
                        <SelectTrigger className="col-span-1">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="NOK">NOK</SelectItem>
                          <SelectItem value="BTC">BTC</SelectItem>
                          <SelectItem value="ETH">ETH</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        className="col-span-3"
                        placeholder="Amount"
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="col-span-4">
                        <p className="text-sm text-muted-foreground">Withdrawal Method</p>
                      </div>
                      <Select defaultValue="bank">
                        <SelectTrigger className="col-span-4">
                          <SelectValue placeholder="Select withdrawal method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Bank Account (Chase **** 1234)</SelectItem>
                          <SelectItem value="card">Credit Card (Visa **** 4242)</SelectItem>
                          <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      Withdraw ${withdrawAmount} {withdrawCurrency}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fiat">Fiat Currencies</TabsTrigger>
          <TabsTrigger value="crypto">Cryptocurrencies</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fiat Balances</CardTitle>
                <CardDescription>Your traditional currency balances</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Currency</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(walletData.balance.fiat).map(([currency, amount]) => (
                      <TableRow key={currency}>
                        <TableCell className="font-medium">{currency}</TableCell>
                        <TableCell className="text-right">{amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("fiat")}>
                  View Details
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crypto Balances</CardTitle>
                <CardDescription>Your cryptocurrency holdings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Currency</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">USD Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(walletData.balance.crypto)
                      .slice(0, 5) // Show only top 5
                      .map(([currency, amount]) => (
                        <TableRow key={currency}>
                          <TableCell className="font-medium">{currency}</TableCell>
                          <TableCell className="text-right">{amount}</TableCell>
                          <TableCell className="text-right">
                            ${(amount * (cryptoPrices[currency] || 0)).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => setActiveTab("crypto")}>
                  View All Cryptocurrencies
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletData.transactions.slice(0, 5).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.type === "deposit" && <ArrowDownLeft className="h-4 w-4 text-green-500" />}
                          {transaction.type === "withdrawal" && <ArrowUpRight className="h-4 w-4 text-red-500" />}
                          {transaction.type === "tip" && <DollarSign className="h-4 w-4 text-blue-500" />}
                          {transaction.type === "purchase" && <CreditCard className="h-4 w-4 text-purple-500" />}
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.type === "withdrawal" ||
                        transaction.type === "purchase" ||
                        transaction.type === "tip"
                          ? "-"
                          : "+"}
                        {transaction.amount} {transaction.currency}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}{" "}
                        {new Date(transaction.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === "completed" ? "default" : "outline"}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {transaction.recipient && `To: ${transaction.recipient}`}
                        {transaction.description && transaction.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("transactions")}>
                View All Transactions
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="fiat">
          <Card>
            <CardHeader>
              <CardTitle>Fiat Currency Balances</CardTitle>
              <CardDescription>Manage your traditional currency holdings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">USD Equivalent</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">USD</TableCell>
                    <TableCell>US Dollar</TableCell>
                    <TableCell className="text-right">{walletData.balance.fiat.USD.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${walletData.balance.fiat.USD.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Deposit
                        </Button>
                        <Button variant="outline" size="sm">
                          Withdraw
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">EUR</TableCell>
                    <TableCell>Euro</TableCell>
                    <TableCell className="text-right">{walletData.balance.fiat.EUR.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(walletData.balance.fiat.EUR * 1.1).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Deposit
                        </Button>
                        <Button variant="outline" size="sm">
                          Withdraw
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">NOK</TableCell>
                    <TableCell>Norwegian Krone</TableCell>
                    <TableCell className="text-right">{walletData.balance.fiat.NOK.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(walletData.balance.fiat.NOK * 0.095).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Deposit
                        </Button>
                        <Button variant="outline" size="sm">
                          Withdraw
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">SEK</TableCell>
                    <TableCell>Swedish Krona</TableCell>
                    <TableCell className="text-right">{walletData.balance.fiat.SEK.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(walletData.balance.fiat.SEK * 0.097).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Deposit
                        </Button>
                        <Button variant="outline" size="sm">
                          Withdraw
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">DKK</TableCell>
                    <TableCell>Danish Krone</TableCell>
                    <TableCell className="text-right">{walletData.balance.fiat.DKK.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${(walletData.balance.fiat.DKK * 0.15).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          Deposit
                        </Button>
                        <Button variant="outline" size="sm">
                          Withdraw
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Add Currency</Button>
              <Button variant="outline">Exchange Currencies</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="crypto">
          <Card>
            <CardHeader>
              <CardTitle>Cryptocurrency Holdings</CardTitle>
              <CardDescription>Manage your digital assets</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Currency</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="text-right">Price (USD)</TableHead>
                    <TableHead className="text-right">Value (USD)</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(walletData.balance.crypto).map(([currency, amount]) => (
                    <TableRow key={currency}>
                      <TableCell className="font-medium">{currency}</TableCell>
                      <TableCell>
                        {currency === "BTC" && "Bitcoin"}
                        {currency === "ETH" && "Ethereum"}
                        {currency === "USDT" && "Tether"}
                        {currency === "BNB" && "Binance Coin"}
                        {currency === "XRP" && "Ripple"}
                        {currency === "ADA" && "Cardano"}
                        {currency === "SOL" && "Solana"}
                        {currency === "DOGE" && "Dogecoin"}
                        {currency === "DOT" && "Polkadot"}
                        {currency === "MATIC" && "Polygon"}
                      </TableCell>
                      <TableCell className="text-right">{amount}</TableCell>
                      <TableCell className="text-right">${cryptoPrices[currency]}</TableCell>
                      <TableCell className="text-right">${(amount * cryptoPrices[currency]).toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            Deposit
                          </Button>
                          <Button variant="outline" size="sm">
                            Withdraw
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Buy Crypto</Button>
              <Button variant="outline">Sell Crypto</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your financial activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {walletData.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.type === "deposit" && <ArrowDownLeft className="h-4 w-4 text-green-500" />}
                          {transaction.type === "withdrawal" && <ArrowUpRight className="h-4 w-4 text-red-500" />}
                          {transaction.type === "tip" && <DollarSign className="h-4 w-4 text-blue-500" />}
                          {transaction.type === "purchase" && <CreditCard className="h-4 w-4 text-purple-500" />}
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.type === "withdrawal" ||
                        transaction.type === "purchase" ||
                        transaction.type === "tip"
                          ? "-"
                          : "+"}
                        {transaction.amount} {transaction.currency}
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}{" "}
                        {new Date(transaction.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === "completed" ? "default" : "outline"}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.recipient && `To: ${transaction.recipient}`}
                        {transaction.description && transaction.description}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Export Transactions</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {walletData.paymentMethods.map((method) => (
                  <Card key={method.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {method.type === "card" && (
                            <>
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <CreditCardIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {method.brand} •••• {method.last4}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Expires {method.expMonth}/{method.expYear}
                                </p>
                              </div>
                            </>
                          )}
                          {method.type === "bank" && (
                            <>
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <DollarSign className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {method.bankName} •••• {method.accountLast4}
                                </p>
                                <p className="text-sm text-muted-foreground">Bank Account</p>
                              </div>
                            </>
                          )}
                          {method.type === "crypto" && (
                            <>
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Bitcoin className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{method.currency} Wallet</p>
                                <p className="text-sm text-muted-foreground">{method.address}</p>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
