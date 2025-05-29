"use client"

import { useState, useEffect } from "react"
import { Heart, X, Info, ChevronDown, Star } from "lucide-react"

interface Advertiser {
  id: string
  name: string
  age: number
  location: string
  distance: number
  images: string[]
  rating: number
  tags: string[]
  description?: string
  services?: Array<{ name: string; price: string }>
  availability?: Array<{ day: string; hours: string }>
  isVip?: boolean
  isOnline?: boolean
}

const mockAdvertisers: Advertiser[] = [
  {
    id: "1",
    name: "Sophia",
    age: 28,
    location: "Stockholm",
    distance: 2,
    images: [
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    ],
    rating: 4.9,
    tags: ["Massage", "Wellness", "Premium", "VIP"],
    description:
      "Professional massage therapist with over 5 years of experience. Specializing in Swedish and deep tissue massage.",
    isVip: true,
    isOnline: true,
  },
  {
    id: "2",
    name: "Emma",
    age: 25,
    location: "Gothenburg",
    distance: 5,
    images: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    ],
    rating: 4.8,
    tags: ["Dance", "Entertainment", "VIP"],
    description: "Professional dancer and entertainer. Available for private events and performances.",
    isVip: false,
    isOnline: false,
  },
  {
    id: "3",
    name: "Olivia",
    age: 27,
    location: "Malmö",
    distance: 3,
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    ],
    rating: 4.7,
    tags: ["Massage", "Therapy"],
    description: "Certified therapeutic massage specialist focusing on wellness and relaxation.",
    isVip: false,
    isOnline: true,
  },
]

const sponsoredAdvertisers: Advertiser[] = [
  {
    id: "sp1",
    name: "Isabella",
    age: 24,
    location: "Uppsala",
    distance: 7,
    images: [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    ],
    rating: 4.6,
    tags: ["Dance", "Entertainment"],
    isVip: true,
    isOnline: false,
  },
  {
    id: "sp2",
    name: "Mia",
    age: 26,
    location: "Stockholm",
    distance: 4,
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    ],
    rating: 4.5,
    tags: ["Massage", "Wellness"],
    isVip: false,
    isOnline: true,
  },
  {
    id: "sp3",
    name: "Charlotte",
    age: 29,
    location: "Gothenburg",
    distance: 6,
    images: [
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    ],
    rating: 4.4,
    tags: ["Dance", "VIP"],
    isVip: true,
    isOnline: true,
  },
]

const defaultServices = [
  { name: "Standard Service", price: "1000 kr" },
  { name: "Premium Service", price: "2000 kr" },
  { name: "VIP Experience", price: "3000 kr" },
]

const defaultAvailability = [
  { day: "Weekdays", hours: "10:00 - 22:00" },
  { day: "Weekends", hours: "12:00 - 00:00" },
]

export default function TinderView() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentAdvertiser, setCurrentAdvertiser] = useState<Advertiser | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const [direction, setDirection] = useState("")
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])

  useEffect(() => {
    // Set advertisers after component mounts
    setAdvertisers(mockAdvertisers)
    setCurrentAdvertiser(mockAdvertisers[0])
  }, [])

  const nextAdvertiser = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= advertisers.length) {
      setCurrentAdvertiser(null)
    } else {
      setCurrentIndex(nextIndex)
      setCurrentAdvertiser(advertisers[nextIndex])
      setShowInfo(false)
    }
  }

  const swipeLeft = () => {
    setDirection("left")
    setTimeout(() => {
      nextAdvertiser()
      setDirection("")
    }, 300)
  }

  const swipeRight = () => {
    setDirection("right")
    setTimeout(() => {
      nextAdvertiser()
      setDirection("")
    }, 300)
  }

  const resetCards = () => {
    setCurrentIndex(0)
    setCurrentAdvertiser(advertisers[0])
    setShowInfo(false)
  }

  const toggleInfo = () => {
    setShowInfo(!showInfo)
  }

  if (advertisers.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="tinder-container max-w-7xl mx-auto px-4 py-8">
      <div className="tinder-cards relative h-[70vh] max-h-[700px] flex items-center justify-center mb-8">
        {currentAdvertiser ? (
          <div
            className={`tinder-card relative w-full max-w-md h-full rounded-3xl overflow-hidden shadow-2xl bg-white transition-transform duration-300 cursor-grab active:cursor-grabbing ${
              direction === "left"
                ? "transform -translate-x-24 -rotate-12"
                : direction === "right"
                  ? "transform translate-x-24 rotate-12"
                  : ""
            }`}
          >
            <div className="card-image absolute inset-0">
              <img
                src={currentAdvertiser.images[0] || "/placeholder.svg"}
                alt={currentAdvertiser.name}
                className="w-full h-full object-cover"
              />
              <div
                className={`card-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/10 transition-all duration-300 ${
                  showInfo ? "bg-black/75" : ""
                }`}
              ></div>
            </div>

            <div className="card-badges absolute top-6 right-6 flex flex-col gap-2 z-10">
              {currentAdvertiser.isVip && (
                <span className="badge vip bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  VIP
                </span>
              )}
              {currentAdvertiser.isOnline && (
                <span className="badge online bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Online
                </span>
              )}
            </div>

            <div
              className={`card-content absolute bottom-0 left-0 right-0 p-6 text-white z-10 transition-all duration-300 ${
                showInfo ? "max-h-[75%] overflow-y-auto" : "max-h-[40%] overflow-hidden"
              }`}
            >
              <div className="card-header flex justify-between items-center mb-2">
                <h2 className="card-title text-3xl font-semibold">
                  {currentAdvertiser.name}, {currentAdvertiser.age}
                </h2>
                <div className="card-rating flex items-center gap-1 text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{currentAdvertiser.rating}</span>
                </div>
              </div>

              <p className="card-location text-lg opacity-80 mb-4">
                {currentAdvertiser.location} • {currentAdvertiser.distance} km
              </p>

              <div className="card-tags flex flex-wrap gap-2 mb-6">
                {currentAdvertiser.tags.map((tag, index) => (
                  <span key={index} className="tag bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </div>

              {showInfo && (
                <div className="card-details animate-in fade-in duration-300">
                  <p className="card-description mb-6 leading-relaxed">
                    {currentAdvertiser.description ||
                      "Professional service provider with several years of experience dedicated to providing high-quality experiences."}
                  </p>

                  <div className="card-services mb-6">
                    <h3 className="text-lg font-semibold mb-3">Services</h3>
                    <ul className="space-y-2">
                      {(currentAdvertiser.services || defaultServices).map((service, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0"
                        >
                          <span className="service-name">{service.name}</span>
                          <span className="service-price text-green-400 font-medium">{service.price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card-availability">
                    <h3 className="text-lg font-semibold mb-3">Availability</h3>
                    <div className="availability-grid grid grid-cols-2 gap-3">
                      {(currentAdvertiser.availability || defaultAvailability).map((slot, index) => (
                        <div key={index} className="availability-slot flex justify-between">
                          <span className="day font-medium">{slot.day}</span>
                          <span className={`hours ${slot.hours === "Closed" ? "text-red-400" : "text-green-400"}`}>
                            {slot.hours}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              className="info-toggle absolute top-6 left-6 w-10 h-10 rounded-full bg-black/50 border-none text-white flex items-center justify-center cursor-pointer z-20 transition-all duration-300 hover:bg-black/70"
              onClick={toggleInfo}
            >
              {showInfo ? <ChevronDown className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            </button>

            {/* Swipe indicators */}
            <div
              className={`swipe-indicator like absolute top-24 right-8 w-20 h-20 rounded-full bg-green-500/80 text-white flex items-center justify-center transition-opacity duration-300 z-20 rotate-12 ${
                direction === "right" ? "opacity-100" : "opacity-0"
              }`}
            >
              <Heart className="w-8 h-8 fill-current" />
            </div>
            <div
              className={`swipe-indicator nope absolute top-24 left-8 w-20 h-20 rounded-full bg-red-500/80 text-white flex items-center justify-center transition-opacity duration-300 z-20 -rotate-12 ${
                direction === "left" ? "opacity-100" : "opacity-0"
              }`}
            >
              <X className="w-8 h-8" />
            </div>
          </div>
        ) : (
          <div className="no-more-cards text-center p-8 bg-white rounded-3xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">No more advertisers to show</h2>
            <p className="text-gray-600 mb-6">Check back later for new profiles!</p>
            <button
              className="reset-button bg-pink-500 text-white px-6 py-3 rounded-lg font-medium transition-colors hover:bg-pink-600"
              onClick={resetCards}
            >
              Start Over
            </button>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="tinder-actions flex justify-center gap-8 mb-12">
        <button
          className="action-button dislike w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center transition-all duration-300 hover:bg-red-600 hover:scale-110"
          onClick={swipeLeft}
        >
          <X className="w-6 h-6" />
        </button>
        <button
          className="action-button like w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center transition-all duration-300 hover:bg-green-600 hover:scale-110"
          onClick={swipeRight}
        >
          <Heart className="w-6 h-6 fill-current" />
        </button>
      </div>

      {/* Sponsored advertisers */}
      <div className="sponsored-section">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Sponsored Advertisers</h2>
        <div className="sponsored-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsoredAdvertisers.map((advertiser) => (
            <div
              key={advertiser.id}
              className="sponsored-card rounded-xl overflow-hidden shadow-lg cursor-pointer transition-transform duration-300 hover:-translate-y-2 bg-white"
            >
              <div className="sponsored-image relative h-48">
                <img
                  src={advertiser.images[0] || "/placeholder.svg"}
                  alt={advertiser.name}
                  className="w-full h-full object-cover"
                />
                <span className="sponsored-badge absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  Sponsored
                </span>
              </div>
              <div className="sponsored-content p-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800">
                  {advertiser.name}, {advertiser.age}
                </h3>
                <div className="sponsored-info flex justify-between items-center">
                  <span className="location text-sm text-gray-600">{advertiser.location}</span>
                  <div className="rating flex items-center gap-1 text-yellow-500 text-sm">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{advertiser.rating}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
