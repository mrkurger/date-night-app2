require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { User, Ad } = require('../server/components');

const COUNTIES = [
  'Oslo', 'Viken', 'Innlandet', 'Vestfold og Telemark', 
  'Agder', 'Rogaland', 'Vestland', 'Møre og Romsdal', 
  'Trøndelag', 'Nordland', 'Troms og Finnmark'
];

const CATEGORIES = ['Escort', 'Striptease', 'Massage'];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/date_night');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Ad.deleteMany({});

    // Create advertisers
    const advertisers = await User.insertMany([
      {
        username: 'oslo_escort1',
        password: await bcrypt.hash('password123', 10),
        role: 'advertiser',
        travelPlan: ['Oslo', 'Viken'],
      },
      {
        username: 'bergen_massage',
        password: await bcrypt.hash('password123', 10),
        role: 'advertiser',
        travelPlan: ['Vestland', 'Møre og Romsdal'],
      },
      {
        username: 'trondheim_strip',
        password: await bcrypt.hash('password123', 10),
        role: 'advertiser',
        travelPlan: ['Trøndelag', 'Nordland'],
      }
    ]);

    // Create regular users
    const users = await User.insertMany([
      {
        username: 'user1',
        password: await bcrypt.hash('password123', 10),
        role: 'user'
      },
      {
        username: 'user2',
        password: await bcrypt.hash('password123', 10),
        role: 'user'
      }
    ]);

    // Create ads for each advertiser
    const ads = [];
    for (const advertiser of advertisers) {
      const numAds = Math.floor(Math.random() * 5) + 3; // 3-7 ads each
      
      for (let i = 0; i < numAds; i++) {
        const county = COUNTIES[Math.floor(Math.random() * COUNTIES.length)];
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        
        ads.push({
          title: `${category} Services in ${county}`,
          description: `Professional ${category.toLowerCase()} services available in ${county}. Flexible hours, discrete location.`,
          advertiser: advertiser._id,
          category,
          county,
          contact: `+47 ${Math.floor(10000000 + Math.random() * 90000000)}`,
          location: {
            type: 'Point',
            coordinates: [
              5.3220 + (Math.random() - 0.5) * 2, // Random around Norway
              60.3913 + (Math.random() - 0.5) * 2
            ]
          },
          active: true,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random within last 30 days
        });
      }
    }

    await Ad.insertMany(ads);

    console.log('Database seeded successfully!');
    console.log(`Created ${advertisers.length} advertisers`);
    console.log(`Created ${users.length} users`);
    console.log(`Created ${ads.length} ads`);

    console.log('\nTest accounts:');
    console.log('Advertiser: oslo_escort1 / password123');
    console.log('User: user1 / password123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedDatabase();
