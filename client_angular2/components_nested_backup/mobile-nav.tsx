"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { useState } from "react"

export function MobileNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Browse", href: "/browse" },
    { name: "Tinder View", href: "/tinder" },
    { name: "Rankings", href: "/rankings" },
    { name: "Favorites", href: "/favorites", requiresAuth: true },
    { name: "VIP", href: "/vip" },
    { name: "Messages", href: "/messages", requiresAuth: true },
    { name: "Profile", href: "/profile", requiresAuth: true },
  ]

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <div className="flex flex-col h-full py-6">
      <Link href="/" className="flex items-center mb-6">
        <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
          HT
        </span>
      </Link>

      <form onSubmit={handleSearchSubmit} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="search"
            placeholder="Search advertisers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <div className="space-y-1">
        {navItems
          .filter((item) => !item.requiresAuth || isAuthenticated)
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block py-2 px-3 rounded-md text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
      </div>

      {!isAuthenticated && (
        <div className="mt-6 space-y-2">
          <Button asChild className="w-full">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
