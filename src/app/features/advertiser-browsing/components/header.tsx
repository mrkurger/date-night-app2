"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Heart, Menu, X, Bell, User, Wallet, LayoutDashboard, LogOut } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useIsMobile } from "@/hooks/use-mobile" // Fixed import name
import { cn } from "@/lib/utils"

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const isMobile = useIsMobile() // Using the correct hook

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <header className="relative bg-gray-900 border-b border-gray-800 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-pink-500">
            Sensual<span className="text-white">Meet</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/browse" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md",
                      pathname === "/browse" ? "text-pink-500" : "text-gray-300 hover:text-white",
                    )}
                  >
                    Browse
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/favorites" legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      "px-3 py-2 text-sm font-medium rounded-md",
                      pathname === "/favorites" ? "text-pink-500" : "text-gray-300 hover:text-white",
                    )}
                  >
                    Favorites
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-md",
                    pathname === "/rankings" ? "text-pink-500" : "text-gray-300 hover:text-white",
                  )}
                >
                  Rankings
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/rankings?type=rating"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-pink-500/50 to-pink-700/50 p-6 no-underline outline-none focus:shadow-md"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium text-white">Top Rated</div>
                          <p className="text-sm leading-tight text-white/90">
                            Discover the highest rated advertisers on our platform
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/rankings?type=popular"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-purple-500/50 to-purple-700/50 p-6 no-underline outline-none focus:shadow-md"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium text-white">Most Popular</div>
                          <p className="text-sm leading-tight text-white/90">
                            See the most in-demand advertisers right now
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/rankings?type=reviews"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-500/50 to-blue-700/50 p-6 no-underline outline-none focus:shadow-md"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium text-white">Most Reviewed</div>
                          <p className="text-sm leading-tight text-white/90">
                            Browse advertisers with the most verified reviews
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/rankings?type=new"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-green-500/50 to-green-700/50 p-6 no-underline outline-none focus:shadow-md"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium text-white">Newest</div>
                          <p className="text-sm leading-tight text-white/90">
                            Discover the latest advertisers to join our platform
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {user?.role === "advertiser" && (
                <NavigationMenuItem>
                  <Link href="/advertiser-dashboard" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={cn(
                        "px-3 py-2 text-sm font-medium rounded-md",
                        pathname?.startsWith("/advertiser-dashboard")
                          ? "text-pink-500"
                          : "text-gray-300 hover:text-white",
                      )}
                    >
                      Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Search and user actions */}
        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="relative">
              <Input
                type="search"
                placeholder="Search..."
                className="w-64 pr-8 bg-gray-800 border-gray-700"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
              <X
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                onClick={() => setIsSearchOpen(false)}
              />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="text-gray-300 hover:text-white"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          {user ? (
            /* Logged in user actions */
            <>
              <Link href="/favorites">
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                  <Heart className="h-5 w-5" />
                  <span className="sr-only">Favorites</span>
                </Button>
              </Link>

              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
                <span className="sr-only">Notifications</span>
              </Button>

              <Link href="/wallet">
                <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                  <Wallet className="h-5 w-5" />
                  <span className="sr-only">Wallet</span>
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user.name || "User"} />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-gray-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href="/user-profile">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/wallet">
                    <DropdownMenuItem>
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Wallet</span>
                    </DropdownMenuItem>
                  </Link>
                  {user.role === "advertiser" && (
                    <Link href="/advertiser-dashboard">
                      <DropdownMenuItem>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            /* Login and signup buttons */
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-pink-600 hover:bg-pink-700">Sign up</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/browse"
              className={cn(
                "block px-3 py-2 rounded-md text-base font-medium",
                pathname === "/browse" ? "bg-pink-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
              )}
            >
              Browse
            </Link>
            <Link
              href="/favorites"
              className={cn(
                "block px-3 py-2 rounded-md text-base font-medium",
                pathname === "/favorites"
                  ? "bg-pink-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
              )}
            >
              Favorites
            </Link>
            <Link
              href="/rankings"
              className={cn(
                "block px-3 py-2 rounded-md text-base font-medium",
                pathname === "/rankings"
                  ? "bg-pink-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
              )}
            >
              Rankings
            </Link>
            {user?.role === "advertiser" && (
              <Link
                href="/advertiser-dashboard"
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  pathname?.startsWith("/advertiser-dashboard")
                    ? "bg-pink-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white",
                )}
              >
                Dashboard
              </Link>
            )}

            {!user && (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-pink-600 text-white hover:bg-pink-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
