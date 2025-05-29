'use client';

import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedNavbar from '@/components/enhanced-navbar';
import { Footer } from '@/components/footer';
import { 
  Heart, 
  MessageCircle, 
  Star, 
  Search, 
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  Gift,
  DollarSign
} from 'lucide-react';

interface Match {
  id: string;
  name: string;
  age: number;
  avatar: string;
  location: string;
  distance: number;
  bio: string;
  interests: string[];
  isOnline: boolean;
  lastSeen: Date;
  matchDate: Date;
  isVerified: boolean;
  rating: number;
  hasUnreadMessages: boolean;
  mutualInterests: number;
  photos: string[];
}

const mockMatches: Match[] = [
  {
    id: '1',
    name: 'Emma Wilson',
    age: 26,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
    location: 'Oslo, Norway',
    distance: 2.5,
    bio: 'Adventure seeker and coffee enthusiast. Love hiking and exploring new places!',
    interests: ['Travel', 'Photography', 'Hiking', 'Coffee'],
    isOnline: true,
    lastSeen: new Date(),
    matchDate: new Date(Date.now() - 86400000), // 1 day ago
    isVerified: true,
    rating: 4.8,
    hasUnreadMessages: true,
    mutualInterests: 3,
    photos: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400']
  },
  {
    id: '2',
    name: 'Sofia Larsen',
    age: 24,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    location: 'Bergen, Norway',
    distance: 5.2,
    bio: 'Artist and yoga instructor. Looking for someone who appreciates creativity and mindfulness.',
    interests: ['Art', 'Yoga', 'Music', 'Nature'],
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
    matchDate: new Date(Date.now() - 172800000), // 2 days ago
    isVerified: true,
    rating: 4.9,
    hasUnreadMessages: false,
    mutualInterests: 2,
    photos: ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400']
  },
  {
    id: '3',
    name: 'Ingrid Hansen',
    age: 29,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    location: 'Trondheim, Norway',
    distance: 8.1,
    bio: 'Tech entrepreneur and fitness enthusiast. Love building things and staying active.',
    interests: ['Technology', 'Fitness', 'Entrepreneurship', 'Travel'],
    isOnline: true,
    lastSeen: new Date(),
    matchDate: new Date(Date.now() - 259200000), // 3 days ago
    isVerified: false,
    rating: 4.6,
    hasUnreadMessages: true,
    mutualInterests: 4,
    photos: ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400']
  },
  {
    id: '4',
    name: 'Astrid Nordahl',
    age: 27,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    location: 'Stavanger, Norway',
    distance: 12.3,
    bio: 'Marine biologist with a passion for ocean conservation. Love diving and underwater photography.',
    interests: ['Marine Biology', 'Diving', 'Photography', 'Conservation'],
    isOnline: false,
    lastSeen: new Date(Date.now() - 7200000), // 2 hours ago
    matchDate: new Date(Date.now() - 432000000), // 5 days ago
    isVerified: true,
    rating: 4.7,
    hasUnreadMessages: false,
    mutualInterests: 1,
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400']
  }
];

const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredMatches = matches.filter(match => {
    const matchesSearch = match.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         match.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (activeTab) {
      case 'recent':
        return matchesSearch && (Date.now() - match.matchDate.getTime()) < 604800000; // 7 days
      case 'online':
        return matchesSearch && match.isOnline;
      case 'messages':
        return matchesSearch && match.hasUnreadMessages;
      default:
        return matchesSearch;
    }
  });

  const formatMatchDate = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  const formatLastSeen = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      <EnhancedNavbar />
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <main className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Your Matches</h1>
            <p className="text-muted-foreground">
              Connect with people who liked you back
            </p>
          </header>

          {/* Search and Filter */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Match Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{matches.length}</div>
                <div className="text-sm text-muted-foreground">Total Matches</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">
                  {matches.filter(m => m.isOnline).length}
                </div>
                <div className="text-sm text-muted-foreground">Online Now</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {matches.filter(m => m.hasUnreadMessages).length}
                </div>
                <div className="text-sm text-muted-foreground">New Messages</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-500">
                  {matches.filter(m => (Date.now() - m.matchDate.getTime()) < 604800000).length}
                </div>
                <div className="text-sm text-muted-foreground">This Week</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Matches</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="online">Online</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredMatches.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 'Try adjusting your search terms' : 'Keep swiping to find your perfect match!'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMatches.map((match) => (
                    <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={match.photos[0]}
                          alt={match.name}
                          className="w-full h-48 object-cover"
                        />
                        
                        {/* Online indicator */}
                        {match.isOnline && (
                          <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="bg-green-500 text-white">
                              Online
                            </Badge>
                          </div>
                        )}
                        
                        {/* New messages indicator */}
                        {match.hasUnreadMessages && (
                          <div className="absolute top-3 left-3">
                            <Badge variant="default">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              New
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{match.name}, {match.age}</h3>
                              {match.isVerified && (
                                <Star className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {match.distance} km away
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">★ {match.rating}</div>
                            <div className="text-xs text-muted-foreground">
                              {match.mutualInterests} mutual
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {match.bio}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-3">
                          {match.interests.slice(0, 3).map((interest, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                          {match.interests.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{match.interests.length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Matched {formatMatchDate(match.matchDate)}
                          </div>
                          <div>
                            {match.isOnline ? 'Online now' : `Active ${formatLastSeen(match.lastSeen)}`}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button asChild className="flex-1" size="sm">
                            <Link href={`/messages/${match.id}`}>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Message
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Gift className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default MatchesPage;
