// Mock data for advertisers
export interface Advertiser {
  id: string
  name: string
  images: string[]
  rating: number
  distance: number
  location: string
  tags: string[]
  isOnline: boolean
  isVip: boolean
  price: string
  description: string
  services: { name: string; price: string }[]
  availability: { day: string; hours: string }[]
  reviews: {
    id: string
    user: string
    rating: number
    comment: string
    date: string
  }[]
  views: number
  favorites: number
  messages: number
  revenue: number
  trafficSources: { source: string; percentage: number }[]
  contentPerformance: { type: string; views: number; engagement: number }[]
}

// Generate mock advertisers
const generateAdvertisers = (): Advertiser[] => {
  const locations = [
    "Stockholm, Sweden",
    "Oslo, Norway",
    "Copenhagen, Denmark",
    "Helsinki, Finland",
    "Gothenburg, Sweden",
    "Bergen, Norway",
    "Malmö, Sweden",
    "Tampere, Finland",
    "Aarhus, Denmark",
    "Trondheim, Norway",
  ]

  const tags = [
    "Massage",
    "Escort",
    "Dancer",
    "Model",
    "GFE",
    "Domination",
    "Fetish",
    "BDSM",
    "Couples",
    "Tantric",
    "Nuru",
    "Outcall",
    "Incall",
    "VIP",
    "Premium",
    "New",
    "Verified",
    "Top Rated",
  ]

  const services = [
    { name: "Standard Massage", price: "1000 kr" },
    { name: "Deep Tissue", price: "1200 kr" },
    { name: "Full Body", price: "1500 kr" },
    { name: "Tantric", price: "2000 kr" },
    { name: "Nuru", price: "2500 kr" },
    { name: "Four Hands", price: "3000 kr" },
    { name: "VIP Package", price: "5000 kr" },
    { name: "Outcall", price: "+1000 kr" },
  ]

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const advertisers: Advertiser[] = []

  for (let i = 1; i <= 50; i++) {
    const randomTags = [
      ...new Set(
        Array.from({ length: Math.floor(Math.random() * 5) + 2 }, () => tags[Math.floor(Math.random() * tags.length)]),
      ),
    ]
    const randomServices = [
      ...new Set(
        Array.from(
          { length: Math.floor(Math.random() * 4) + 3 },
          () => services[Math.floor(Math.random() * services.length)],
        ),
      ),
    ]
    const randomAvailability = days.map((day) => ({
      day,
      hours:
        Math.random() > 0.2
          ? `${10 + Math.floor(Math.random() * 4)}:00 - ${19 + Math.floor(Math.random() * 5)}:00`
          : "Closed",
    }))

    const reviews = Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, index) => ({
      id: `review-${i}-${index}`,
      user: `User${Math.floor(Math.random() * 1000)}`,
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
      comment: "Great service, highly recommended!",
      date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    }))

    const views = Math.floor(Math.random() * 5000) + 500
    const favorites = Math.floor(Math.random() * 200) + 20
    const messages = Math.floor(Math.random() * 100) + 10
    const revenue = Math.floor(Math.random() * 50000) + 5000

    const trafficSources = [
      { source: "Search", percentage: Math.floor(Math.random() * 40) + 20 },
      { source: "Direct", percentage: Math.floor(Math.random() * 30) + 10 },
      { source: "Referral", percentage: Math.floor(Math.random() * 20) + 5 },
      { source: "Social", percentage: Math.floor(Math.random() * 15) + 5 },
    ]

    // Adjust percentages to sum to 100
    const totalPercentage = trafficSources.reduce((sum, source) => sum + source.percentage, 0)
    trafficSources.forEach((source) => {
      source.percentage = Math.round((source.percentage / totalPercentage) * 100)
    })

    const contentPerformance = [
      { type: "Photos", views: Math.floor(Math.random() * 3000) + 300, engagement: Math.floor(Math.random() * 20) + 5 },
      {
        type: "Videos",
        views: Math.floor(Math.random() * 2000) + 200,
        engagement: Math.floor(Math.random() * 30) + 10,
      },
      {
        type: "Blog Posts",
        views: Math.floor(Math.random() * 1000) + 100,
        engagement: Math.floor(Math.random() * 15) + 3,
      },
    ]

    advertisers.push({
      id: `adv-${i}`,
      name: `Advertiser ${i}`,
      images: Array(Math.floor(Math.random() * 3) + 1)
        .fill(null)
        .map((_, index) => `/placeholder.svg?height=400&width=300&text=Advertiser ${i} Image ${index + 1}`),
      rating: Number((Math.random() * 1 + 4).toFixed(1)), // 4.0 to 5.0
      distance: Number((Math.random() * 20).toFixed(1)), // 0 to 20 km
      location: locations[Math.floor(Math.random() * locations.length)],
      tags: randomTags,
      isOnline: Math.random() > 0.3,
      isVip: Math.random() > 0.7,
      price: `${Math.floor(Math.random() * 1500) + 500} kr`,
      description:
        "Professional service provider with years of experience. Offering high-quality services in a clean, comfortable environment.",
      services: randomServices,
      availability: randomAvailability,
      reviews,
      views,
      favorites,
      messages,
      revenue,
      trafficSources,
      contentPerformance,
    })
  }

  return advertisers
}

// Cache the generated advertisers
const advertisers = generateAdvertisers()

// Export functions to access the data
export const getAdvertisers = () => advertisers

export const getAdvertiserById = (id: string) => advertisers.find((adv) => adv.id === id)

export const getTopRatedAdvertisers = (limit = 10) =>
  [...advertisers].sort((a, b) => b.rating - a.rating).slice(0, limit)

export const getMostReviewedAdvertisers = (limit = 10) =>
  [...advertisers].sort((a, b) => b.reviews.length - a.reviews.length).slice(0, limit)

export const getMostPopularAdvertisers = (limit = 10) =>
  [...advertisers].sort((a, b) => b.views - a.views).slice(0, limit)

export const getAdvertisersByLocation = (location: string) =>
  advertisers.filter((adv) => adv.location.includes(location))

export const getOnlineAdvertisers = () => advertisers.filter((adv) => adv.isOnline)

export const getVipAdvertisers = () => advertisers.filter((adv) => adv.isVip)

export const getAdvertisersByTags = (tags: string[]) =>
  advertisers.filter((adv) => tags.some((tag) => adv.tags.includes(tag)))

export const searchAdvertisers = (query: string) =>
  advertisers.filter(
    (adv) =>
      adv.name.toLowerCase().includes(query.toLowerCase()) ||
      adv.location.toLowerCase().includes(query.toLowerCase()) ||
      adv.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
  )
