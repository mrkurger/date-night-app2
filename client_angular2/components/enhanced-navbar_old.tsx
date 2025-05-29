'use client';

import * as React from 'react';
import { useState } from 'react';
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
  Gift,
  Menu,
  X,
  Users,
  LogIn,
  LayoutGrid,
  RadioTower,
  Building, // For Casino
  UserPlus, // For Signup
  MessageSquare, // For Messages
  Flame, // For Tinder
  Film, // For Carousely
} from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button'; // Ensure ButtonProps is imported

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  color?: string;
}

const navItems: NavItem[] = [
  {
    href: '/vip',
    label: 'VIP',
    icon: <Crown className="w-5 h-5" />,
    badge: 'Premium',
    color: 'from-yellow-400 to-orange-500',
  },
  {
    href: '/rankings',
    label: 'Rankings',
    icon: <Trophy className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
  },
  {
    href: '/favorites',
    label: 'Favorites',
    icon: <Heart className="w-5 h-5" />,
    color: 'from-red-500 to-pink-500',
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: <User className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    href: '/wallet',
    label: 'Wallet',
    icon: <Wallet className="w-5 h-5" />,
    badge: '$2,500',
    color: 'from-green-500 to-emerald-500',
  },
  {
    href: '/search',
    label: 'Search',
    icon: <Search className="w-5 h-5" />,
    color: 'from-indigo-500 to-purple-500',
  },
  {
    href: '/netflix-view',
    label: 'Netflix',
    icon: <Grid3X3 className="w-5 h-5" />,
    color: 'from-red-600 to-red-700',
  },
  {
    href: '/advertisers',
    label: 'Advertisers',
    icon: <Users className="w-5 h-5" />,
    color: 'from-teal-500 to-cyan-500',
  },
  {
    href: '/login',
    label: 'Login',
    icon: <LogIn className="w-5 h-5" />,
    color: 'from-slate-500 to-gray-500',
  },
  {
    href: '/browse',
    label: 'Browse',
    icon: <LayoutGrid className="w-5 h-5" />,
    color: 'from-sky-500 to-indigo-500',
  },
  {
    href: '/carousely',
    label: 'Carousely',
    icon: <Film className="w-5 h-5" />,
    color: 'from-rose-400 to-red-500',
  },
  {
    href: '/jacky-winter-view',
    label: 'Jacky Winter',
    icon: <Flame className="w-5 h-5" />,
    color: 'from-orange-500 to-red-500',
  },
];

// Make sure this function is exported
export default function EnhancedNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showTipRain, setShowTipRain] = useState(false);

  const triggerTipRain = () => {
    setShowTipRain(true);
    setTimeout(() => setShowTipRain(false), 2000);
  };

  return (
    <>
      {/* Tip Rain Effect */}
      {showTipRain && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-green-400 text-xl animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${1 + Math.random() * 1}s`,
              }}
            >
              💸
            </div>
          ))}
        </div>
      )}

      {/* Desktop Navbar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                HotTips
              </span>
            </Link>

            {/* Navigation Items */}
            <div className="flex items-center gap-1">
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'} // Corrected: ButtonProps accepts 'variant'
                      className={`relative h-10 px-4 ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-2 hidden lg:inline">{item.label}</span>
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Quick Tip Button */}
            <Button
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg animate-pulse"
              onClick={triggerTipRain}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Make It Rain</span>
              <Gift className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-pink-500/20">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              HotTips
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-14 left-0 right-0 bg-black/95 backdrop-blur-md border-b border-pink-500/20">
            <div className="grid grid-cols-2 gap-2 p-4">
              {navItems.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'} // Corrected: ButtonProps accepts 'variant'
                      className={`w-full h-12 ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} text-white`
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  </Link>
                );
              })}

              {/* Mobile Tip Button */}
              <Button
                className="col-span-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white h-12"
                onClick={() => {
                  triggerTipRain();
                  setIsOpen(false);
                }}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Make It Rain
                <Gift className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-16" />
    </>
  );
}
