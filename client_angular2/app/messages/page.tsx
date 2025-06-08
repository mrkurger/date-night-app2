'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import EnhancedNavbar from '@/components/enhanced-navbar'; // Corrected import
import { Footer } from '@/components/footer'; // Corrected import
import { SendHorizonal, Paperclip, Smile, Search } from 'lucide-react';
import { getFemaleImageByIndex } from '@/lib/data';

// Mock data - replace with actual data from API or context
interface User {
  id: string;
  name: string;
  avatar: string;
  isOnline?: boolean;
}

interface Message {
  id: string;
  conversationId: string; // Added conversationId
  sender: string;
  text: string;
  timestamp: string;
  avatar?: string;
  unread?: boolean;
  isRead?: boolean; // Added isRead
}

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: Message; // Changed to Message type
  timestamp: string;
  unreadCount?: number;
  participants: User[]; // Added participants array
}

const mockUser1: User = {
  id: 'currentUser',
  name: 'You',
  avatar: getFemaleImageByIndex(1),
};

const mockUser2: User = {
  id: 'user2',
  name: 'Sarah Miller',
  avatar: getFemaleImageByIndex(2),
  isOnline: true,
};

const mockUser3: User = {
  id: 'user3',
  name: 'Jessica Doe',
  avatar: getFemaleImageByIndex(3),
  isOnline: false,
};

const mockUser4: User = {
  id: 'user4',
  name: 'Lisa Brown',
  avatar: getFemaleImageByIndex(4),
  isOnline: true,
};

const mockMessages: Message[] = [
  {
    id: 'msg1',
    conversationId: 'conv1',
    sender: 'user2', // Changed from senderId
    text: 'Hey, how are you?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    avatar: mockUser2.avatar,
  },
  {
    id: 'msg2',
    conversationId: 'conv1',
    sender: 'currentUser', // Changed from senderId
    text: "I'm good, thanks! How about you?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    avatar: mockUser1.avatar,
    isRead: true,
  },
  {
    id: 'msg3',
    conversationId: 'conv1',
    sender: 'user2', // Changed from senderId
    text: 'Doing well! Working on a new project.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    avatar: mockUser2.avatar,
  },
  {
    id: 'msg4',
    conversationId: 'conv2',
    sender: 'user2', // Changed from senderId
    text: 'Lunch tomorrow?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    avatar: mockUser2.avatar,
  },
  {
    id: 'msg5',
    conversationId: 'conv2',
    sender: 'currentUser', // Changed from senderId
    text: 'Sounds good! Where?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    avatar: mockUser1.avatar,
    isRead: true,
  },
  {
    id: 'msg6',
    conversationId: 'conv3',
    sender: 'user3', // Changed from senderId
    text: 'Can you send me the report?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    avatar: mockUser3.avatar,
  },
  {
    id: 'msg7',
    conversationId: 'conv3',
    sender: 'currentUser', // Changed from senderId
    text: 'Sure, sending it now.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    avatar: mockUser1.avatar,
    isRead: true,
  },
  {
    id: 'msg8',
    conversationId: 'conv4',
    sender: 'user4', // Changed from senderId
    text: 'Happy Birthday!',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    avatar: mockUser4.avatar,
  },
];

const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    name: 'Sarah Miller',
    participants: [mockUser1, mockUser2],
    avatar: mockUser2.avatar,
    lastMessage: mockMessages
      .filter(m => m.conversationId === 'conv1')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] || {
      id: 'default',
      conversationId: 'conv1',
      sender: 'System',
      text: 'No messages yet',
      timestamp: new Date().toISOString(),
      avatar: '/placeholder.svg',
      isRead: true
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    unreadCount: 1,
  },
  {
    id: 'conv2',
    name: 'Jessica Doe',
    participants: [mockUser1, mockUser3],
    avatar: mockUser3.avatar,
    lastMessage: mockMessages
      .filter(m => m.conversationId === 'conv2')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] || {
      id: 'default',
      conversationId: 'conv2',
      sender: 'System',
      text: 'No messages yet',
      timestamp: new Date().toISOString(),
      avatar: '/placeholder.svg',
      isRead: true
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    unreadCount: 0,
  },
  {
    id: 'conv3',
    name: 'Lisa Brown',
    participants: [mockUser1, mockUser4],
    avatar: mockUser4.avatar,
    lastMessage: mockMessages
      .filter(m => m.conversationId === 'conv3')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] || {
      id: 'default',
      conversationId: 'conv3',
      sender: 'System',
      text: 'No messages yet',
      timestamp: new Date().toISOString(),
      avatar: '/placeholder.svg',
      isRead: true
    },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    unreadCount: 0,
  },
];

const currentUser: User = mockUser1;

const MessagesPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    mockConversations[0] || null,
  );
  const [messages, setMessages] = useState<Message[]>(
    mockMessages.filter(m => m.conversationId === mockConversations[0]?.id),
  );
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages.filter(m => m.conversationId === selectedConversation.id) || []);
      // Mark messages as read (simulation)
      const updatedConversations = conversations.map((conv: Conversation) =>
        conv.id === selectedConversation.id
          ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, isRead: true } }
          : conv,
      );
      setConversations(updatedConversations);
      // Note: In a real app, you would update the messages in your backend/state management
    } else {
      setMessages([]);
    }
  }, [selectedConversation, conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation.id, // Ensure this is assigned
      sender: 'You', // Replace with actual current user ID/name
      text: newMessage,
      timestamp: new Date().toISOString(),
      avatar: currentUser.avatar, // Example: Current user's avatar
      isRead: false,
    };

    setMessages((prevMessages: Message[]) => [...prevMessages, newMsg]);
    setNewMessage('');

    const updatedConversations = conversations.map((conv: Conversation) =>
      conv.id === selectedConversation.id
        ? { ...conv, lastMessage: newMsg, timestamp: new Date().toISOString() }
        : conv,
    );
    // Sort by most recent message
    setConversations(
      updatedConversations.sort(
        (a: Conversation, b: Conversation) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      ),
    );
  };

  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      setMessages(mockMessages.filter(m => m.conversationId === conversationId));
      // Mark messages as read
      setConversations(prevConvs =>
        prevConvs.map(conv =>
          conv.id === conversationId
            ? { ...conv, unreadCount: 0, lastMessage: { ...conv.lastMessage, isRead: true } }
            : conv,
        ),
      );
    }
  };

  // Scroll to bottom of messages when new message is added or conversation changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedConversation]);

  const filteredConversations = conversations.filter((conv: Conversation) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedConversationMessages = messages.filter(
    (msg: Message) => msg.conversationId === selectedConversation?.id,
  );

  return (
    <>
      <EnhancedNavbar />
      <div className="h-[calc(100vh-var(--navbar-height,80px))] flex flex-col bg-slate-900 text-slate-200">
        <div className="flex-grow flex overflow-hidden">
          {/* Sidebar - Conversation List */}
          <aside className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 bg-slate-800 border-r border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  className="w-full bg-slate-700 border-slate-600 placeholder-slate-400 text-slate-200 pl-10 focus:ring-pink-500 focus:border-pink-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              </div>
            </div>
            <div className="flex-grow overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map(
                  (
                    conv: Conversation, // Added type for conv
                  ) => (
                    <div
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-slate-700/50 transition-colors duration-150 ${
                        selectedConversation?.id === conv.id
                          ? 'bg-pink-500/10 border-l-4 border-pink-500'
                          : 'border-l-4 border-transparent'
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12 border-2 border-slate-600">
                          <AvatarImage src={conv.avatar} alt={conv.name} />
                          <AvatarFallback>{conv.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {conv.participants.find(p => p.id !== currentUser.id)?.isOnline && (
                          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-slate-800"></span>
                        )}
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <div className="flex justify-between items-center">
                          <div className="font-semibold">{conv.name}</div>
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <span className="bg-pink-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {conv.lastMessage.sender === currentUser.id && 'You: '}
                          {conv.lastMessage.text}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ),
                )
              ) : (
                <p className="p-4 text-center text-slate-500">No conversations found.</p>
              )}
            </div>
          </aside>

          {/* Main Chat Area */}
          <main
            className="flex-grow flex flex-col bg-slate-850"
            style={{ backgroundColor: '#1E293B' /* slate-850ish */ }}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <header className="p-4 bg-slate-800 border-b border-slate-700 flex items-center space-x-3 shadow-sm">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={selectedConversation?.avatar}
                      alt={selectedConversation?.name}
                    />
                    <AvatarFallback>{selectedConversation?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{selectedConversation?.name}</div>
                    <div className="text-xs text-gray-500">
                      {selectedConversation?.participants.find(p => p.id !== currentUser.id)
                        ?.isOnline
                        ? 'Online'
                        : 'Offline'}
                    </div>
                  </div>
                  {/* Add more actions here like video call, info, etc. */}
                </header>

                {/* Messages Area */}
                <div className="flex-grow p-4 md:p-6 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-850">
                  {selectedConversationMessages.map((msg: Message, index: number) => (
                    <div
                      key={msg.id}
                      className={`flex items-end mb-4 ${
                        msg.sender === 'You' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.sender !== 'You' && (
                        <Avatar className="w-8 h-8 mr-2 flex-shrink-0">
                          <AvatarImage src={msg.avatar || currentUser.avatar} alt={msg.sender} />
                          <AvatarFallback>
                            {msg.sender === currentUser.id
                              ? currentUser.name.charAt(0)
                              : selectedConversation?.participants
                                  .find(p => p.id === msg.sender)
                                  ?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`p-3 rounded-lg max-w-xs lg:max-w-md break-words ${
                          msg.sender === 'You'
                            ? 'bg-pink-600 text-white rounded-br-none'
                            : 'bg-slate-700 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs text-slate-400 mt-1 text-right">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {msg.sender === 'You' && msg.isRead && <span className="ml-1">✓✓</span>}
                        </p>
                      </div>
                      {msg.sender === 'You' && (
                        <Avatar className="w-8 h-8 ml-2 flex-shrink-0">
                          <AvatarImage src={msg.avatar} alt={msg.sender} />
                          <AvatarFallback>{msg.sender.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Area */}
                <footer className="p-4 bg-slate-800 border-t border-slate-700">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="text-slate-400 hover:text-pink-400"
                    >
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input
                      type="text"
                      value={newMessage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewMessage(e.target.value)
                      }
                      placeholder="Type a message..."
                      className="flex-grow bg-slate-700 border-slate-600 placeholder-slate-400 text-slate-100 focus:ring-pink-500 focus:border-pink-500 rounded-full px-5 py-2.5"
                      autoComplete="off"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      className="text-slate-400 hover:text-pink-400"
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                    <Button
                      type="submit"
                      size="icon"
                      className="bg-pink-600 hover:bg-pink-700 text-white rounded-full p-2.5"
                    >
                      <SendHorizonal className="w-5 h-5" />
                    </Button>
                  </form>
                </footer>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-500 p-8">
                <svg
                  className="w-24 h-24 mb-6 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  {' '}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.86 8.25-8.625 8.25S3.75 16.556 3.75 12s3.86-8.25 8.625-8.25S21 7.444 21 12z"
                  />{' '}
                </svg>
                <h2 className="text-2xl font-semibold mb-2">Select a conversation</h2>
                <p className="text-center">
                  Choose one of your existing conversations or start a new one to begin chatting.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
      {/* Footer might be omitted for a full-height chat app, or placed differently */}
      {/* <Footer /> */}
    </>
  );
};

export default MessagesPage;
