"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getAdvertisers, getAdvertiserById, type Advertiser } from "@/lib/data"

interface DataContextType {
  advertisers: Advertiser[]
  getAdvertiser: (id: string | number) => Advertiser | undefined
  loading: boolean
  error: string | null
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const data = getAdvertisers()
      setAdvertisers(data)
    } catch (err) {
      console.error("Error loading advertisers:", err)
      setError("Failed to load advertisers data")
    } finally {
      setLoading(false)
    }
  }, [])

  const getAdvertiser = (id: string | number): Advertiser | undefined => {
    // First try to find in the loaded advertisers
    const advertiser = advertisers.find((adv) => String(adv.id) === String(id))

    // If not found, try the direct function
    if (!advertiser) {
      return getAdvertiserById(id)
    }

    return advertiser
  }

  return <DataContext.Provider value={{ advertisers, getAdvertiser, loading, error }}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
