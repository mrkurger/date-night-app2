'use client';

import React from 'react';
import { Carousel, TestimonialCard } from '@/components/ui/retro-testimonial';
import { iTestimonial } from '@/components/ui/retro-testimonial';

type TestimonialDetails = {
  [key: string]: iTestimonial & { id: string };
};

const testimonialData = {
  ids: ['sugar-001', 'sugar-002', 'sugar-003', 'sugar-004', 'sugar-005', 'sugar-006'],
  details: {
    'sugar-001': {
      id: 'sugar-001',
      description:
        'This platform completely transformed my dating life. The quality of connections and the sophisticated matching system helped me find exactly what I was looking for. The premium features are worth every penny.',
      profileImage: '/assets/img/profiles/female-01.jpg',
      name: 'Isabella Rose',
      designation: 'Premium Member',
    },
    'sugar-002': {
      id: 'sugar-002',
      description:
        'As someone who values discretion and quality, this app exceeded my expectations. The verification process ensures authentic profiles, and the gamified rating system makes interactions fun and engaging.',
      profileImage: '/assets/img/profiles/female-02.jpg',
      name: 'Victoria Sterling',
      designation: 'VIP Elite Member',
    },
    'sugar-003': {
      id: 'sugar-003',
      description:
        'The microtransaction system is brilliant - I can show appreciation through tips and gifts in a way that feels natural. The casino integration adds an exciting element to the whole experience.',
      profileImage: '/assets/img/profiles/female-03.jpg',
      name: 'Sophia Diamond',
      designation: 'Diamond Tier Member',
    },
    'sugar-004': {
      id: 'sugar-004',
      description:
        "I love how this platform combines dating with entertainment. The star rating system and cryptocurrency rewards make every interaction meaningful. It's like a game where everyone wins.",
      profileImage: '/assets/img/profiles/female-04.jpg',
      name: 'Anastasia Gold',
      designation: 'Gold Member',
    },
    'sugar-005': {
      id: 'sugar-005',
      description:
        'The attention economy here is perfect for someone like me. I can monetize my time and attention while meeting amazing people. The referral system and engagement rewards are fantastic.',
      profileImage: '/assets/img/profiles/female-05.jpg',
      name: 'Valentina Luxe',
      designation: 'Influencer Member',
    },
    'sugar-006': {
      id: 'sugar-006',
      description:
        "This isn't just another dating app - it's a lifestyle platform. The combination of social features, gaming elements, and real financial opportunities makes it addictive in the best way possible.",
      profileImage: '/assets/img/profiles/female-06.jpg',
      name: 'Scarlett Prestige',
      designation: 'Platinum Member',
    },
  },
};

// Create testimonial cards with dating platform theme
const cards = testimonialData.ids
  .map((cardId: string, index: number) => {
    const details = testimonialData.details as TestimonialDetails;
    const testimonial = details[cardId];

    if (!testimonial) {
      return null;
    }

    return (
      <TestimonialCard
        key={cardId}
        testimonial={testimonial}
        index={index}
        backgroundImage="/assets/img/profiles/female-07.jpg"
      />
    );
  })
  .filter((card): card is React.ReactElement => card !== null);

const RetroTestimonialsDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Member Success Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover how our premium dating platform has transformed the lives of our elite members.
            From meaningful connections to financial opportunities, see what makes our community
            special.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            <span className="bg-white/50 px-4 py-2 rounded-full">⭐ 10-Star Rating System</span>
            <span className="bg-white/50 px-4 py-2 rounded-full">💎 Premium Memberships</span>
            <span className="bg-white/50 px-4 py-2 rounded-full">🎰 Gamified Experience</span>
            <span className="bg-white/50 px-4 py-2 rounded-full">💰 Crypto Rewards</span>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-12 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              What Our Elite Members Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real testimonials from verified premium members who have found success on our platform
            </p>
          </div>
          <Carousel items={cards} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-pink-600 mb-2">50K+</div>
              <div className="text-gray-600">Premium Members</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">1M+</div>
              <div className="text-gray-600">Successful Matches</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-indigo-600 mb-2">$2M+</div>
              <div className="text-gray-600">Tips & Gifts Sent</div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl md:text-4xl font-bold text-pink-600 mb-2">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Join Our Elite Community?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Experience the future of premium dating with gamified interactions, crypto rewards, and
            meaningful connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors">
              Start Premium Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RetroTestimonialsDemo;
