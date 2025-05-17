"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

// Country data with flags
const countries = [
  { name: "Norway", flag: "🇳🇴", regions: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Kristiansand"] },
  { name: "Sweden", flag: "🇸🇪", regions: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås"] },
  { name: "Denmark", flag: "🇩🇰", regions: ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg"] },
  { name: "Finland", flag: "🇫🇮", regions: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu"] },
  { name: "Iceland", flag: "🇮🇸", regions: ["Reykjavík", "Kópavogur", "Hafnarfjörður", "Akureyri"] },
  { name: "Germany", flag: "🇩🇪", regions: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt"] },
  { name: "Netherlands", flag: "🇳🇱", regions: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"] },
  { name: "Belgium", flag: "🇧🇪", regions: ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège"] },
  { name: "France", flag: "🇫🇷", regions: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice"] },
  { name: "United Kingdom", flag: "🇬🇧", regions: ["London", "Birmingham", "Manchester", "Glasgow", "Liverpool"] },
]

export function CollapsibleLocationSidebar() {
  const { state, toggleSidebar } = useSidebar()
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)

  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">Locations</h2>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
            {state === "expanded" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </SidebarHeader>
        <SidebarContent>
          {countries.map((country) => (
            <SidebarGroup key={country.name}>
              <SidebarGroupLabel
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setSelectedCountry(selectedCountry === country.name ? null : country.name)}
              >
                <span className="text-xl mr-2">{country.flag}</span>
                {country.name}
              </SidebarGroupLabel>
              {selectedCountry === country.name && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {country.regions.map((region) => (
                      <SidebarMenuItem key={region}>
                        <SidebarMenuButton asChild>
                          <a href={`/browse?country=${country.name}&region=${region}`}>
                            <MapPin className="h-4 w-4" />
                            <span>{region}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarRail className="flex flex-col items-center py-4 space-y-4 w-12">
          {countries.map((country) => (
            <div
              key={country.name}
              className="text-2xl cursor-pointer tooltip-wrapper"
              onClick={() => {
                if (state !== "expanded") toggleSidebar()
                setSelectedCountry(country.name)
              }}
            >
              {country.flag}
              <span className="tooltip">{country.name}</span>
            </div>
          ))}
        </SidebarRail>
      </Sidebar>
    </>
  )
}
