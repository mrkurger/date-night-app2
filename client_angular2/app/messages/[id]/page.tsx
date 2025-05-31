'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { Footer } from '@/components/footer';
import {
  ArrowLeft,
  Send,
  Phone,
  Video,
  MoreVertical,
  Heart,
  Gift,
  Image as ImageIcon,
  Smile,
  Star,
  DollarSign,
} from 'lucide-react';
import { getFemaleImageByIndex } from '@/lib/data';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'tip' | 'gift';
  amount?: number;
  isRead: boolean;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
  isVerified: boolean;
  rating: number;
}

const mockUser: ChatUser = {
  id: '2',
  name: 'Emma Wilson',
  avatar: getFemaleImageByIndex(1),
  isOnline: true,
  lastSeen: new Date(),
  isVerified: true,
  rating: 4.8,
};

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '2',
    content: 'Hey! I saw your profile and loved your travel photos. Have you been to Japan?',
    timestamp: new Date(Date.now() - 3600000),
    type: 'text',
    isRead: true,
  },
  {
    id: '2',
    senderId: '1',
    content:
      'Hi Emma! Thank you so much! Yes, I went to Tokyo last year. It was absolutely amazing! 🗾',
    timestamp: new Date(Date.now() - 3500000),
    type: 'text',
    isRead: true,
  },
  {
    id: '3',
    senderId: '2',
    content: "That's so cool! I'm planning a trip there next spring. Any recommendations?",
    timestamp: new Date(Date.now() - 3400000),
    type: 'text',
    isRead: true,
  },
  {
    id: '4',
    senderId: '1',
    content:
      'Definitely visit Shibuya Crossing and the Senso-ji Temple. The cherry blossoms should be beautiful in spring!',
    timestamp: new Date(Date.now() - 3300000),
    type: 'text',
    isRead: true,
  },
  {
    id: '5',
    senderId: '2',
    content: 'sent you a tip',
    timestamp: new Date(Date.now() - 1800000),
    type: 'tip',
    amount: 50,
    isRead: true,
  },
  {
    id: '6',
    senderId: '2',
    content: "Thanks for the great recommendations! Can't wait to explore Tokyo 🌸",
    timestamp: new Date(Date.now() - 1700000),
    type: 'text',
    isRead: true,
  },
];

const ChatPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatId = params.id as string;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: '1', // Current user
        content: newMessage,
        timestamp: new Date(),
        type: 'text',
        isRead: false,
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');

      // Simulate typing indicator and response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        // Could add auto-response here
      }, 2000);
    }
  };

  const sendTip = (amount: number) => {
    const tipMessage: Message = {
      id: Date.now().toString(),
      senderId: '1',
      content: 'sent you a tip',
      timestamp: new Date(),
      type: 'tip',
      amount,
      isRead: false,
    };

    setMessages(prev => [...prev, tipMessage]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isCurrentUser = message.senderId === '1';
    const showDate =
      index === 0 || formatDate(message.timestamp) !== formatDate(messages[index - 1].timestamp);

    return (
      <div key={message.id}>
        {showDate && (
          <div className="flex justify-center my-4">
            <Badge variant="secondary" className="text-xs">
              {formatDate(message.timestamp)}
            </Badge>
          </div>
        )}

        <div className={`flex gap-3 mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          {!isCurrentUser && (
            <Avatar className="w-8 h-8">
              <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
              <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
          )}

          <div className={`max-w-[70%] ${isCurrentUser ? 'order-first' : ''}`}>
            {message.type === 'tip' ? (
              <Card
                className={`p-3 ${
                  isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <CardContent className="p-0 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">
                    {isCurrentUser ? 'You sent' : `${mockUser.name} sent you`} a tip of $
                    {message.amount} NOK
                  </span>
                  <Heart className="h-4 w-4 text-red-500" />
                </CardContent>
              </Card>
            ) : (
              <div
                className={`rounded-2xl px-4 py-2 ${
                  isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            )}

            <p
              className={`text-xs text-muted-foreground mt-1 ${
                isCurrentUser ? 'text-right' : 'text-left'
              }`}
            >
              {formatTime(message.timestamp)}
            </p>
          </div>

          {isCurrentUser && (
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder-avatar.jpg" alt="You" />
              <AvatarFallback>You</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <EnhancedNavbar />
      <div className="min-h-screen bg-background flex flex-col">
        {/* Chat Header */}
        <div className="border-b bg-card px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/messages')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <Avatar className="w-10 h-10">
                <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{mockUser.name}</h2>
                  {mockUser.isVerified && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {mockUser.isOnline ? 'Online now' : `Last seen ${formatTime(mockUser.lastSeen)}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {messages.map((message, index) => renderMessage(message, index))}

            {isTyping && (
              <div className="flex gap-3 mb-4">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                  <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="border-t bg-card px-4 py-3">
          <div className="max-w-4xl mx-auto">
            {/* Quick Actions */}
            <div className="flex gap-2 mb-3">
              <Button variant="outline" size="sm" onClick={() => sendTip(25)} className="text-xs">
                <DollarSign className="h-3 w-3 mr-1" />
                Tip 25 NOK
              </Button>
              <Button variant="outline" size="sm" onClick={() => sendTip(50)} className="text-xs">
                <DollarSign className="h-3 w-3 mr-1" />
                Tip 50 NOK
              </Button>
              <Button variant="outline" size="sm" onClick={() => sendTip(100)} className="text-xs">
                <DollarSign className="h-3 w-3 mr-1" />
                Tip 100 NOK
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Gift className="h-4 w-4" />
              </Button>

              <div className="flex-1 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={e => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ChatPage;
