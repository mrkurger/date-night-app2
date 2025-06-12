'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Crown,
  Trophy,
  Heart,
  User,
  Wallet,
  Search,
  Grid3X3,
  DollarSign,
  Zap,
  Menu,
  X,
  Users,
  LogIn,
  LogOut,
  LayoutGrid,
  Film,
  Flame,
  Building,
  UserPlus,
  MessageSquare,
  ChevronDown,
  Home,
  Settings,
  HelpCircle,
  Bell,
  Bookmark,
  Star,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  color?: string;
  description?: string;
  children?: NavItem[];
}

// All the navigation items remain unchanged
const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: <Home className="w-5 h-5" />,
    description: 'Return to the main page',
  },
  // ... other navigation items
  {
    href: '/browse',
    label: 'Browse',
    icon: <LayoutGrid className="w-5 h-5" />,
    description: 'Discover new content',
    children: [
      {
        href: '/2live-casino',
        label: '2Live Casino',
        icon: <Zap className="w-5 h-5" />,
        description: '2Live Casino',
      },
      // ... other child items
    ],
  },
  // ... more navigation items
];

const userNavItems: NavItem[] = [
  {
    href: '/profile',
    label: 'Profile',
    icon: <User className="w-5 h-5" />,
    description: 'View and edit your profile',
  },
  {
    href: '/wallet',
    label: 'Wallet',
    icon: <Wallet className="w-5 h-5" />,
    badge: '$2,500',
    description: 'Manage your balance',
  },
  // ... other user navigation items
];

const moreNavItems: NavItem[] = [
  // ... more navigation items
];

export default function EnhancedNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-background/98 backdrop-blur-xl shadow-lg border-b border-border/20'
            : 'bg-background/85 backdrop-blur-lg shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                  DateNight
                </span>
              </Link>
            </div>

            {/* Main Navigation - Desktop */}
            <div className="hidden md:flex items-center">
              <NavigationMenu>
                <NavigationMenuList>{/* Navigation items */}</NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative rounded-full h-8 w-8 md:h-10 md:w-10"
                      >
                        <Avatar>
                          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                          <AvatarFallback>
                            {user?.name?.charAt(0) || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 bg-background/85 backdrop-blur-lg shadow-lg border border-border/20 z-50"
                    >
                      <DropdownMenuLabel>
                        {user?.name || 'User'}
                        <div className="text-xs text-muted-foreground">{user?.email}</div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {userNavItems.map(item => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href} className="flex items-center gap-2 cursor-pointer">
                            {item.icon}
                            <span>{item.label}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex">
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/signup">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Sign up
                    </Link>
                  </Button>
                </>
              )}

              {/* Mobile menu button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[85%] sm:w-[350px]">
                  <SheetHeader>
                    <SheetTitle>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                          DateNight
                        </span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="py-6">
                    {isAuthenticated && (
                      <div className="mb-6 flex items-center gap-4 pb-4 border-b">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                          <AvatarFallback>
                            {user?.name?.charAt(0) || <User className="h-4 w-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user?.name || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Mobile navigation items */}

                      {!isAuthenticated && (
                        <div className="pt-4 border-t">
                          <div className="flex flex-col gap-2">
                            <Button asChild>
                              <Link href="/signup">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Sign up
                              </Link>
                            </Button>
                            <Button variant="outline" asChild>
                              <Link href="/login">
                                <LogIn className="w-4 h-4 mr-2" />
                                Log in
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}

                      {isAuthenticated && (
                        <div className="pt-4 border-t">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleLogout}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log out
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
