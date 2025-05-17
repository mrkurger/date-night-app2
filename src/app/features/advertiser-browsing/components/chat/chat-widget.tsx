"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, X, Video, Phone, MinusSquare, Maximize2, Send, Paperclip } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { getAdvertisers } from "@/lib/data"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(3)
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const router = useRouter()

  // Get some advertisers to show in the chat list
  const chatContacts = getAdvertisers().slice(0, 5)

  // Mock messages for demonstration
  const mockMessages = [
    { id: "1", senderId: "user", text: "Hello, I'm interested in your services", time: "2:30 PM" },
    { id: "2", senderId: selectedChat, text: "Hi there! Thank you for reaching out.", time: "2:32 PM" },
    { id: "3", senderId: selectedChat, text: "What kind of service are you looking for?", time: "2:32 PM" },
    { id: "4", senderId: "user", text: "I was wondering about your availability this weekend", time: "2:35 PM" },
    {
      id: "5",
      senderId: selectedChat,
      text: "I'm available on Saturday afternoon and Sunday all day. Would either of those work for you?",
      time: "2:37 PM",
    },
    { id: "6", senderId: "user", text: "Saturday afternoon would be perfect", time: "2:40 PM" },
    { id: "7", senderId: selectedChat, text: "Great! What time were you thinking?", time: "2:41 PM" },
  ]

  const handleToggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setUnreadCount(0)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsFullScreen(false)
    setSelectedChat(null)
  }

  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !selectedChat) return

    // In a real app, this would send the message to the backend
    console.log(`Sending message to ${selectedChat}: ${message}`)
    setMessage("")
  }

  const handleSelectChat = (contactId: string) => {
    setSelectedChat(contactId)
  }

  const handleViewProfile = () => {
    if (selectedChat) {
      router.push(`/advertiser/${selectedChat}`)
      handleClose()
    }
  }

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [selectedChat, mockMessages])

  if (!user) {
    return null // Don't show chat widget if user is not logged in
  }

  return (
    <div
      className={cn(
        "fixed z-50 transition-all duration-300",
        isFullScreen ? "inset-4 lg:inset-8" : isOpen ? "bottom-4 right-4 w-80 h-96" : "bottom-4 right-4",
      )}
    >
      {isOpen ? (
        <div
          className={cn(
            "bg-gray-900 border border-gray-800 rounded-lg shadow-lg flex flex-col overflow-hidden h-full",
            isFullScreen ? "w-full" : "w-full",
          )}
        >
          <div className="bg-pink-600 p-3 flex justify-between items-center">
            {selectedChat ? (
              <div className="flex items-center space-x-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${selectedChat}`} />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <h3 className="text-white font-semibold">
                  {chatContacts.find((c) => c.id === selectedChat)?.name || "Chat"}
                </h3>
              </div>
            ) : (
              <h3 className="text-white font-semibold">Messages</h3>
            )}

            <div className="flex items-center space-x-1">
              {selectedChat && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-pink-700 rounded-full"
                    onClick={handleViewProfile}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${selectedChat}`} />
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <span className="sr-only">View Profile</span>
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-pink-700 rounded-full">
                    <Phone className="h-4 w-4" />
                    <span className="sr-only">Call</span>
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-pink-700 rounded-full">
                    <Video className="h-4 w-4" />
                    <span className="sr-only">Video</span>
                  </Button>
                </>
              )}
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-pink-700 rounded-full"
                onClick={handleToggleFullScreen}
              >
                {isFullScreen ? <MinusSquare className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                <span className="sr-only">{isFullScreen ? "Minimize" : "Maximize"}</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-white hover:bg-pink-700 rounded-full"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>

          {selectedChat ? (
            <>
              {/* Chat messages */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-4">
                  {mockMessages.map((msg) => (
                    <div key={msg.id} className={cn("flex", msg.senderId === "user" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] px-3 py-2 rounded-lg",
                          msg.senderId === "user"
                            ? "bg-pink-600 text-white rounded-br-none"
                            : "bg-gray-800 text-gray-100 rounded-bl-none",
                        )}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-70 text-right mt-1">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Chat input */}
              <div className="p-3 bg-gray-800/50 border-t border-gray-800">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <Button type="button" size="icon" variant="ghost" className="h-10 w-10 shrink-0 rounded-full">
                    <Paperclip className="h-5 w-5" />
                    <span className="sr-only">Attach file</span>
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 bg-gray-800/50 border-gray-700"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-full bg-pink-600 hover:bg-pink-700"
                  >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* Chat list */
            <ScrollArea className="flex-1">
              <div className="p-2">
                {chatContacts.map((contact) => (
                  <button
                    key={contact.id}
                    className="w-full flex items-center space-x-3 hover:bg-gray-800/50 p-2 rounded-lg transition-colors"
                    onClick={() => handleSelectChat(contact.id.toString())}
                  >
                    <Avatar>
                      <AvatarImage src={`/placeholder.svg?height=40&width=40&text=${contact.name}`} />
                      <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{contact.name}</p>
                        <p className="text-xs text-gray-400">2m ago</p>
                      </div>
                      <p className="text-xs text-gray-400 truncate">Hello, I'm interested in your services...</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      ) : (
        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-pink-600 hover:bg-pink-700 shadow-lg relative"
          onClick={handleToggleChat}
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs flex items-center justify-center rounded-full w-5 h-5 font-bold">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Open chat</span>
        </Button>
      )}
    </div>
  )
}
