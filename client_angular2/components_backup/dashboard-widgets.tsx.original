"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CryptoWallet } from "@/components/crypto-wallet"
import { Badge } from "@/components/ui/badge"
import { Bell, MessageCircle, Star, Heart } from "lucide-react"
import Link from "next/link"

interface Message {
  id: string
  sender: string
  content: string
  time: string
  isUnread: boolean
}

interface DashboardWidgetsProps {
  className?: string
}

export function DashboardWidgets({ className }: DashboardWidgetsProps) {
  // Mock messages
  const messages: Message[] = [
    {
      id: "1",
      sender: "Sophia",
      content: "Hey there! Are you available tonight?",
      time: "10 min ago",
      isUnread: true,
    },
    {
      id: "2",
      sender: "Emma",
      content: "Thanks for booking! Looking forward to meeting you.",
      time: "1 hour ago",
      isUnread: true,
    },
    {
      id: "3",
      sender: "Olivia",
      content: "I've updated my availability for next week.",
      time: "3 hours ago",
      isUnread: false,
    },
  ]

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Messages Widget */}
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Messages
              </span>
              <Badge className="bg-pink-500">{messages.filter((m) => m.isUnread).length} new</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {messages.map((message) => (
                <Link href={`/messages/${message.id}`} key={message.id}>
                  <div
                    className={`p-3 rounded-lg ${message.isUnread ? "bg-gray-800/80" : "bg-gray-800/40"} hover:bg-gray-700 transition-colors`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-medium text-white">
                        {message.isUnread && (
                          <span className="inline-block w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                        )}
                        {message.sender}
                      </span>
                      <span className="text-xs text-gray-400">{message.time}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 line-clamp-1">{message.content}</p>
                  </div>
                </Link>
              ))}
              <Link href="/messages" className="block text-center text-sm text-pink-400 hover:text-pink-300 mt-2">
                View all messages
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Crypto Wallet Widget */}
        <CryptoWallet />
      </div>

      {/* Activity Widget */}
      <Card className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/40">
              <div className="bg-pink-500/20 p-2 rounded-full">
                <Heart className="h-4 w-4 text-pink-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  <span className="font-medium text-white">Sophia</span> added you to favorites
                </p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/40">
              <div className="bg-amber-500/20 p-2 rounded-full">
                <Star className="h-4 w-4 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  <span className="font-medium text-white">Emma</span> left you a 5-star review
                </p>
                <p className="text-xs text-gray-400">Yesterday</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/40">
              <div className="bg-green-500/20 p-2 rounded-full">
                <MessageCircle className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-300">
                  <span className="font-medium text-white">Olivia</span> sent you a message
                </p>
                <p className="text-xs text-gray-400">2 days ago</p>
              </div>
            </div>
            <Link href="/activity" className="block text-center text-sm text-pink-400 hover:text-pink-300 mt-2">
              View all activity
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
