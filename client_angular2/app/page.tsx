'use client';
import { EnhancedProfileCarousel } from '@/components/EnhancedProfileCarousel';
import { InfiniteScrollGrid } from '@/components/InfiniteScrollGrid';
import { GamifiedContentHub } from '@/components/GamifiedContentHub';
import EnhancedNavbar from '@/components/enhanced-navbar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedNavbar />
      {/* Hero Section - reduced height and text sizes */}
      <section className="bg-gradient-to-r from-pink-500 to-purple-600 text-white py-14">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-5">Find Your Perfect Match</h1>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Connect with professional service providers in your area. Browse, chat, and book premium
            experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="bg-white text-pink-500 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Browsing
            </button>
            <button className="border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-pink-500 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>
      {/* Enhanced Profile Carousel Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Featured Profiles</h2>
          <EnhancedProfileCarousel />
        </div>
      </section>
      {/* Gamified Content Hub Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <GamifiedContentHub />
        </div>
      </section>
      {/* Infinite Scroll Grid Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Browse All Profiles</h2>
          <InfiniteScrollGrid />
        </div>
      </section>
      {/* Quick Stats */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-pink-500 mb-2">500+</div>
              <div className="text-gray-600">Active Advertisers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-500 mb-2">10k+</div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-500 mb-2">50+</div>
              <div className="text-gray-600">Cities</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-500 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
