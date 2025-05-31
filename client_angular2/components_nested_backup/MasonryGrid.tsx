"use client"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"

interface AdvertiserItem {
  id: string
  name: string
  age: number
  location: string
  image: string
  images: string[]
  tags: string[]
  isOnline?: boolean
  isVip?: boolean
  isPremium?: boolean
  rating?: number
}

interface MasonryGridProps {
  items?: AdvertiserItem[]
  compact?: boolean
}

const defaultItems: AdvertiserItem[] = [
  {
    id: "1",
    name: "Sophia",
    age: 28,
    location: "Stockholm",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    ],
    tags: ["Massage", "Wellness", "Premium"],
    isOnline: true,
    isVip: true,
    rating: 4.9,
  },
  {
    id: "2",
    name: "Emma",
    age: 25,
    location: "Gothenburg",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    ],
    tags: ["Dance", "Entertainment"],
    isPremium: true,
    rating: 4.8,
  },
  {
    id: "3",
    name: "Olivia",
    age: 27,
    location: "Malmö",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    ],
    tags: ["Massage", "Therapy"],
    isOnline: true,
    rating: 4.7,
  },
  {
    id: "4",
    name: "Isabella",
    age: 24,
    location: "Uppsala",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    ],
    tags: ["Dance", "Entertainment", "Premium"],
    isVip: true,
    rating: 4.6,
  },
  {
    id: "5",
    name: "Mia",
    age: 26,
    location: "Stockholm",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    ],
    tags: ["Massage", "Wellness", "VIP"],
    isOnline: true,
    rating: 4.5,
  },
  {
    id: "6",
    name: "Charlotte",
    age: 29,
    location: "Gothenburg",
    image:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    ],
    tags: ["Dance", "Entertainment", "VIP"],
    isPremium: true,
    rating: 4.4,
  },
  {
    id: "7",
    name: "Amelia",
    age: 27,
    location: "Stockholm",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    ],
    tags: ["Massage", "Wellness", "Premium"],
    isOnline: true,
    isVip: true,
    rating: 4.3,
  },
]

export default function MasonryGrid({ items, compact = false }: MasonryGridProps) {
  const [displayItems, setDisplayItems] = useState<AdvertiserItem[]>([])
  const [layoutClasses] = useState(["tall-left", "wide-top", "medium", "small", "small", "wide-bottom", "tall-right"])

  useEffect(() => {
    // Set items after component mounts to avoid state update during render
    setDisplayItems(items || defaultItems)
  }, [items])

  const getItemClass = (index: number): string => {
    return layoutClasses[index % layoutClasses.length]
  }

  if (displayItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className={`masonry-grid ${compact ? "compact" : ""}`}>
      {displayItems.map((item, index) => (
        <div key={item.id} className={`masonry-item ${getItemClass(index)}`}>
          <div className="item-image-container">
            <img src={item.image || item.images[0]} alt={item.name} className="item-image" />
            <div className="item-overlay"></div>
          </div>

          <div className="item-badges">
            {item.isOnline && <span className="badge online">Online</span>}
            {item.isVip && <span className="badge vip">VIP</span>}
            {item.isPremium && <span className="badge premium">Premium</span>}
          </div>

          <div className="item-content">
            <h3 className="item-title">
              {item.name}
              {item.age && <span>, {item.age}</span>}
            </h3>
            <p className="item-location">{item.location}</p>

            {!compact && item.tags && item.tags.length > 0 && (
              <div className="item-tags">
                {item.tags.slice(0, 3).map((tag, tagIndex) => (
                  <span key={tagIndex} className="tag">
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && <span className="tag more">+{item.tags.length - 3}</span>}
              </div>
            )}
          </div>

          <div className="item-action">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      ))}
    </div>
  )
}
