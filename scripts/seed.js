require('dotenv').config();
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../server/models/user.model';
import Ad from '../server/models/ad.model';

const COUNTIES = [
  'Oslo', 'Viken', 'Innlandet', 'Vestfold og Telemark', 
  'Agder', 'Rogaland', 'Vestland', 'Møre og Romsdal', 
  'Trøndelag', 'Nordland', 'Troms og Finnmark'
];

const CATEGORIES = ['Escort', 'Striptease', 'Massage'];

async function seedDatabase() {
  try {
    // Connect with explicit timeouts
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/date_night', {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✓ Connected to MongoDB');

    // Use MongoDB driver directly for cleanup
    console.log('Clearing existing data...');
    const db = mongoose.connection.db;
    await Promise.all([
      db.collection('users').deleteMany({}),
      db.collection('ads').deleteMany({})
    ]);
    console.log('✓ Existing data cleared');

    // Create advertisers using MongoDB driver
    console.log('Creating advertisers...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const advertisers = await db.collection('users').insertMany([
      {
        username: 'oslo_escort1',
        password: hashedPassword,
        role: 'advertiser',
        travelPlan: ['Oslo', 'Viken'],
      },
      {
        username: 'bergen_massage',
        password: hashedPassword,
        role: 'advertiser',
        travelPlan: ['Vestland', 'Møre og Romsdal'],
      },
      {
        username: 'trondheim_strip',
        password: hashedPassword,
        role: 'advertiser',
        travelPlan: ['Trøndelag', 'Nordland'],
      }
    ]);
    console.log('✓ Advertisers created');

    // Create regular users
    console.log('Creating users...');
    const users = await db.collection('users').insertMany([
      {
        username: 'user1',
        password: hashedPassword,
        role: 'user'
      },
      {
        username: 'user2',
        password: hashedPassword,
        role: 'user'
      }
    ]);
    console.log('✓ Users created');

    // Create ads - Fixed iteration over advertisers
    console.log('Creating ads...');
    const ads = [];
    const advertiserDocs = Object.values(advertisers.insertedIds);
    
    for (const advertiserId of advertiserDocs) {
      const numAds = Math.floor(Math.random() * 5) + 3; // 3-7 ads each
      
      for (let i = 0; i < numAds; i++) {
        const county = COUNTIES[Math.floor(Math.random() * COUNTIES.length)];
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        
        ads.push({
          title: `${category} Services in ${county}`,
          description: `Professional ${category.toLowerCase()} services available in ${county}. Flexible hours, discrete location.`,
          advertiser: advertiserId,
          category,
          county,
          contact: `+47 ${Math.floor(10000000 + Math.random() * 90000000)}`,
          location: {
            type: 'Point',
            coordinates: [
              5.3220 + (Math.random() - 0.5) * 2,
              60.3913 + (Math.random() - 0.5) * 2
            ]
          },
          active: true,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
      }
    }

    await db.collection('ads').insertMany(ads);
    console.log('✓ Ads created');

    console.log('\n✨ Database seeded successfully!');
    console.log(`Created ${advertisers.insertedCount} advertisers`);
    console.log(`Created ${users.insertedCount} users`);
    console.log(`Created ${ads.length} ads`);

    console.log('\nTest accounts:');
    console.log('Advertiser: oslo_escort1 / password123');
    console.log('User: user1 / password123');

  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
  } finally {
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
    process.exit(0);
  }
}

seedDatabase();
