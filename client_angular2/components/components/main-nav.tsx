"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

const mainNavItems = [
  { name: "Home", href: "/" },
  { name: "Browse", href: "/browse" },
  { name: "Tinder View", href: "/tinder" },
  { name: "Rankings", href: "/rankings" },
  { name: "VIP", href: "/vip" },
]

export function MainNav() {
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect for navigation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // In a real app, you would redirect to search results
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <nav
      className={cn(
        "flex items-center space-x-4 lg:space-x-6 transition-all duration-200",
        isScrolled ? "py-2" : "py-4",
        isSearchExpanded && isMobile ? "w-full" : "",
      )}
    >
      {!isSearchExpanded && (
        <>
          {!isMobile &&
            mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-foreground font-semibold" : "text-muted-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
        </>
      )}

      {/* Search bar - expanded on mobile when search is clicked */}
      <div className={cn("relative", isSearchExpanded && isMobile ? "w-full" : "w-auto")}>
        <form onSubmit={handleSearchSubmit} className="flex items-center">
          {isSearchExpanded && isMobile ? (
            <>
              <Input
                type="search"
                placeholder="Search advertisers..."
                className="w-full pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
                onClick={() => setIsSearchExpanded(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              {!isMobile && (
                <Input
                  type="search"
                  placeholder="Search advertisers..."
                  className="w-[200px] lg:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              )}
              <Button
                type={isMobile ? "button" : "submit"}
                variant={isMobile ? "ghost" : "default"}
                size="icon"
                className={isMobile ? "" : "ml-2"}
                onClick={() => isMobile && setIsSearchExpanded(true)}
              >
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </>
          )}
        </form>
      </div>
    </nav>
  )
}
