"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Header } from "@/components/header"
import { getAdvertisers } from "@/lib/data"
import { ProfileAvatar } from "@/components/profile-avatar"

export default function MessagesPage() {
  const advertisers = getAdvertisers().slice(0, 5)
  const [selectedChat, setSelectedChat] = useState(advertisers[0])
  const [message, setMessage] = useState("")

  // Mock chat data
  const chats = advertisers.map((advertiser) => {
    return {
      advertiser,
      lastMessage: "Hey there! How are you doing today?",
      timestamp: "10:30 AM",
      unread: Math.random() > 0.7,
    }
  })

  // Mock messages for the selected chat
  const messages = [
    {
      id: 1,
      sender: "user",
      text: "Hi there! I'm interested in your services.",
      timestamp: "10:15 AM",
    },
    {
      id: 2,
      sender: "advertiser",
      text: "Hello! Thank you for reaching out. How can I help you today?",
      timestamp: "10:20 AM",
    },
    {
      id: 3,
      sender: "user",
      text: "I was wondering about your availability this weekend.",
      timestamp: "10:25 AM",
    },
    {
      id: 4,
      sender: "advertiser",
      text: "I'm available on Saturday evening and Sunday. Would either of those work for you?",
      timestamp: "10:28 AM",
    },
    {
      id: 5,
      sender: "user",
      text: "Saturday evening would be perfect!",
      timestamp: "10:30 AM",
    },
  ]

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      // In a real app, you would send the message to an API
      console.log("Sending message:", message)
      setMessage("")
    }
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
          {/* Chat list */}
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
              <h2 className="font-semibold">Conversations</h2>
            </div>
            <ScrollArea className="h-[calc(70vh-60px)]">
              {chats.map((chat) => (
                <div
                  key={chat.advertiser.id}
                  className={`p-4 border-b flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedChat?.id === chat.advertiser.id ? "bg-gray-100 dark:bg-gray-800" : ""
                  }`}
                  onClick={() => setSelectedChat(chat.advertiser)}
                >
                  <div className="relative">
                    <ProfileAvatar src={chat.advertiser.image} name={chat.advertiser.name} size="md" />
                    {chat.advertiser.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium truncate">{chat.advertiser.name}</h3>
                      <span className="text-xs text-gray-500">{chat.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread && <div className="w-2 h-2 bg-pink-500 rounded-full"></div>}
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Chat window */}
          <div className="border rounded-lg overflow-hidden md:col-span-2">
            {selectedChat ? (
              <>
                <div className="p-4 border-b bg-gray-50 dark:bg-gray-800 flex items-center gap-3">
                  <ProfileAvatar src={selectedChat.image} name={selectedChat.name} size="md" />
                  <div>
                    <h2 className="font-semibold">{selectedChat.name}</h2>
                    <p className="text-xs text-gray-500">{selectedChat.isOnline ? "Online" : "Last seen recently"}</p>
                  </div>
                </div>

                <ScrollArea className="h-[calc(70vh-140px)] p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.sender === "user"
                              ? "bg-pink-500 text-white rounded-tr-none"
                              : "bg-gray-200 dark:bg-gray-700 rounded-tl-none"
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className="text-xs mt-1 opacity-70 text-right">{msg.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={!message.trim()}>
                      Send
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
