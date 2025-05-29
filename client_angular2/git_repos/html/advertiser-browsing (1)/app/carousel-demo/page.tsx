import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AdvertiserCarousel } from "@/components/advertiser-carousel"
import { getAdvertisers } from "@/lib/data"

export default function CarouselDemoPage() {
  // Get advertisers from the data
  const advertisers = getAdvertisers().map((advertiser) => ({
    ...advertiser,
    distance: Math.floor(Math.random() * 20) + 1, // Add random distance for demo
  }))

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">Discover Advertisers</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Browse through our selection of top advertisers. Swipe or use the arrows to navigate. Tap on a card to see
            more details.
          </p>
        </div>

        <AdvertiserCarousel advertisers={advertisers} />

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-pink-100 text-pink-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Browse</h3>
              <p className="text-gray-500">Swipe left or right to browse through available advertisers</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 text-pink-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">View Details</h3>
              <p className="text-gray-500">Tap on a card to see more information about the advertiser</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 text-pink-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Connect</h3>
              <p className="text-gray-500">Visit their profile to contact and book their services</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
