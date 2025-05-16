"use client"

import { useRouter } from "next/navigation"
import { Grid, Tv, Heart, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TabNavigationProps {
  activeView: string
  onChange: (view: string) => void
}

export default function TabNavigation({ activeView, onChange }: TabNavigationProps) {
  const router = useRouter()

  const tabs = [
    { id: "grid", label: "Grid View", icon: Grid },
    { id: "cards", label: "Cards View", icon: Tv },
    { id: "tinder", label: "Tinder View", icon: Heart },
    { id: "map", label: "Map", icon: MapPin },
    { id: "nearby", label: "Nearby", icon: Users },
  ]

  return (
    <div className="sticky top-0 z-10 flex items-center gap-2 border-b bg-background px-4 py-2">
      {tabs.map((tab) => {
        const Icon = tab.icon
        return (
          <Button
            key={tab.id}
            variant={activeView === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onChange(tab.id)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </Button>
        )
      })}
    </div>
  )
}
