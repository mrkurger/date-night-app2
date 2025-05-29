'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  color?: string;
  description?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: <Home className="w-5 h-5" />,
    description: 'Return to the main page',
  },
  {
    href: '/browse',
    label: 'Browse',
    icon: <LayoutGrid className="w-5 h-5" />,
    description: 'Discover new content',
    children: [
      {
        href: '/netflix-view',
        label: 'Netflix View',
        icon: <Grid3X3 className="w-5 h-5" />,
        description: 'Grid-based content layout',
      },
      {
        href: '/carousely',
        label: 'Carousely',
        icon: <Film className="w-5 h-5" />,
        description: 'Carousel-based content layout',
      },
      {
        href: '/jacky-winter-view',
        label: 'Jacky Winter',
        icon: <Flame className="w-5 h-5" />,
        description: 'Tinder-like swipe interface',
      },
    ],
  },
  {
    href: '/favorites',
    label: 'Favorites',
    icon: <Heart className="w-5 h-5" />,
    description: 'Your saved content',
  },
  {
    href: '/rankings',
    label: 'Rankings',
    icon: <Trophy className="w-5 h-5" />,
    description: 'Top rated content',
  },
  {
    href: '/search',
    label: 'Search',
    icon: <Search className="w-5 h-5" />,
    description: 'Find specific content',
  },
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
  {
    href: '/vip',
    label: 'VIP',
    icon: <Crown className="w-5 h-5" />,
    badge: 'Premium',
    description: 'Exclusive premium features',
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings className="w-5 h-5" />,
    description: 'Configure your preferences',
  },
  {
    href: '/notifications',
    label: 'Notifications',
    icon: <Bell className="w-5 h-5" />,
    badge: '3',
    description: 'View your notifications',
  },
  {
    href: '/bookmarks',
    label: 'Bookmarks',
    icon: <Bookmark className="w-5 h-5" />,
    description: 'Your saved items',
  },
];

const moreNavItems: NavItem[] = [
  {
    href: '/advertisers',
    label: 'Advertisers',
    icon: <Users className="w-5 h-5" />,
    description: 'Information for advertisers',
  },
  {
    href: '/casino',
    label: 'Casino',
    icon: <Building className="w-5 h-5" />,
    description: 'Play casino games',
  },
  {
    href: '/messages',
    label: 'Messages',
    icon: <MessageSquare className="w-5 h-5" />,
    badge: '5',
    description: 'Your conversations',
  },
  {
    href: '/help',
    label: 'Help & Support',
    icon: <HelpCircle className="w-5 h-5" />,
    description: 'Get assistance',
  },
];

export default function EnhancedNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // For demo purposes - toggle login state
  const toggleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  return (
    <>
      {/* Desktop Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md shadow-md'
            : 'bg-background/50 backdrop-blur-sm'
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
                <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  HotTips
                </span>
              </Link>
            </div>

            {/* Main Navigation - Desktop */}
            <div className="hidden md:flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {navItems.map(item => {
                    if (item.children) {
                      return (
                        <NavigationMenuItem key={item.href}>
                          <NavigationMenuTrigger
                            className={
                              pathname === item.href ? 'bg-accent text-accent-foreground' : ''
                            }
                          >
                            <span className="flex items-center gap-2">
                              {item.icon}
                              {item.label}
                            </span>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                              {item.children.map(child => (
                                <li key={child.href}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      href={child.href}
                                      className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                        pathname === child.href
                                          ? 'bg-accent text-accent-foreground'
                                          : ''
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        {child.icon}
                                        <span className="text-sm font-medium">{child.label}</span>
                                        {child.badge && (
                                          <Badge variant="secondary" className="ml-auto">
                                            {child.badge}
                                          </Badge>
                                        )}
                                      </div>
                                      {child.description && (
                                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                          {child.description}
                                        </p>
                                      )}
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      );
                    }

                    return (
                      <NavigationMenuItem key={item.href}>
                        <Link href={item.href} legacyBehavior passHref>
                          <NavigationMenuLink
                            className={`flex items-center gap-2 px-4 py-2 ${
                              pathname === item.href ? 'bg-accent text-accent-foreground' : ''
                            }`}
                          >
                            {item.icon}
                            {item.label}
                            {item.badge && <Badge variant="secondary">{item.badge}</Badge>}
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    );
                  })}

                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      <span className="flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5" />
                        More
                      </span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {moreNavItems.map(item => (
                          <li key={item.href}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={item.href}
                                className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                              >
                                <div className="flex items-center gap-2">
                                  {item.icon}
                                  <span className="text-sm font-medium">{item.label}</span>
                                  {item.badge && (
                                    <Badge variant="secondary" className="ml-auto">
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                                {item.description && (
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    {item.description}
                                  </p>
                                )}
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    <span>$2,500</span>
                  </Button>

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
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                      <DropdownMenuItem onClick={toggleLogin}>
                        <LogIn className="w-4 h-4 mr-2" />
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
                  {/* For demo purposes */}
                  <Button variant="outline" size="icon" className="md:hidden" onClick={toggleLogin}>
                    <LogIn className="h-4 w-4" />
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
                        <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                          HotTips
                        </span>
                      </div>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="py-6">
                    {isLoggedIn && (
                      <div className="mb-6 flex items-center gap-4 pb-4 border-b">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">John Doe</p>
                          <p className="text-xs text-muted-foreground">john.doe@example.com</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground px-2">
                          Navigation
                        </h3>
                        {navItems.map(item => (
                          <div key={item.href}>
                            {item.children ? (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between px-2 py-1.5 text-sm font-medium">
                                  <div className="flex items-center gap-2">
                                    {item.icon}
                                    {item.label}
                                  </div>
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="pl-4 space-y-1">
                                  {item.children.map(child => (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                                        pathname === child.href
                                          ? 'bg-accent text-accent-foreground'
                                          : 'hover:bg-accent hover:text-accent-foreground'
                                      }`}
                                    >
                                      {child.icon}
                                      {child.label}
                                      {child.badge && (
                                        <Badge variant="secondary" className="ml-auto">
                                          {child.badge}
                                        </Badge>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <Link
                                href={item.href}
                                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                                  pathname === item.href
                                    ? 'bg-accent text-accent-foreground'
                                    : 'hover:bg-accent hover:text-accent-foreground'
                                }`}
                              >
                                {item.icon}
                                {item.label}
                                {item.badge && (
                                  <Badge variant="secondary" className="ml-auto">
                                    {item.badge}
                                  </Badge>
                                )}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>

                      {isLoggedIn && (
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium text-muted-foreground px-2">
                            Account
                          </h3>
                          {userNavItems.map(item => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                                pathname === item.href
                                  ? 'bg-accent text-accent-foreground'
                                  : 'hover:bg-accent hover:text-accent-foreground'
                              }`}
                            >
                              {item.icon}
                              {item.label}
                              {item.badge && (
                                <Badge variant="secondary" className="ml-auto">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}

                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-muted-foreground px-2">More</h3>
                        {moreNavItems.map(item => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${
                              pathname === item.href
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            {item.icon}
                            {item.label}
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        ))}
                      </div>

                      {!isLoggedIn && (
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
                            {/* For demo purposes */}
                            <Button variant="ghost" onClick={toggleLogin}>
                              Demo: Toggle Login State
                            </Button>
                          </div>
                        </div>
                      )}

                      {isLoggedIn && (
                        <div className="pt-4 border-t">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={toggleLogin}
                          >
                            <LogIn className="w-4 h-4 mr-2" />
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
