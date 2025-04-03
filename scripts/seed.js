const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Profile image placeholders using Lorem Picsum for random fortune teller themed images
const profileImagePlaceholders = {
  mysticmadame: 'https://picsum.photos/seed/mystic/300/300',  // Random but consistent image
  tarotmaster: 'https://picsum.photos/seed/tarot/300/300',
  crystalgazer: 'https://picsum.photos/seed/crystal/300/300',
  default: 'https://picsum.photos/seed/fortune/300/300'
};

const dummyUsers = [
  {
    username: "mysticmadame",
    password: "test123",
    role: "advertiser",
    lastActive: new Date(),
    online: true,
    album: [
      "https://picsum.photos/seed/mystic1/300/300",
      "https://picsum.photos/seed/mystic2/300/300",
      "https://picsum.photos/seed/mystic3/300/300"
    ]
  },
  {
    username: "tarotmaster",
    password: "test123",
    role: "advertiser",
    lastActive: new Date(),
    online: true,
    album: [
      "https://picsum.photos/seed/tarot1/300/300",
      "https://picsum.photos/seed/tarot2/300/300",
      "https://picsum.photos/seed/tarot3/300/300"
    ]
  },
  {
    username: "crystalgazer",
    password: "test123",
    role: "advertiser",
    lastActive: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
    online: false,
    album: [
      "https://picsum.photos/seed/crystal1/300/300",
      "https://picsum.photos/seed/crystal2/300/300",
      "https://picsum.photos/seed/crystal3/300/300"
    ]
  },
  {
    username: "spiritualseeker1",
    password: "test123",
    role: "user"
  },
  {
    username: "futureexplorer",
    password: "test123",
    role: "user"
  }
];

// Define 15 counties in Norway
const counties = [
  "Oslo", "Viken", "Innlandet", "Vestfold og Telemark", "Agder",
  "Rogaland", "Vestland", "Møre og Romsdal", "Trøndelag", "Nordland",
  "Troms og Finnmark", "Sogn og Fjordane", "Telemark", "Hordaland", "Buskerud"
];

// Original dummyAds array (6 ads)
const dummyAds = [
  {
    title: "Crystal Ball Revelations 🔮",
    description: "Peer into your future with my ancestral crystal ball. Specializing in career paths and romantic insights. 30+ years experience in divination arts.",
    contact: "+1 555-0123",
    location: "Mystic Valley, CA",
    coordinates: { type: "Point", coordinates: [-122.419416, 37.774929] },
    profileImage: 'https://picsum.photos/seed/crystal-ball/300/300'
  },
  {
    title: "Ancient Tarot Wisdom",
    description: "Using a rare 15th century deck passed down through generations. Deep insights into life's major crossroads. Love, career, spiritual path revealed.",
    contact: "+1 555-0124",
    location: "Enchanted Hills, CA",
    coordinates: { type: "Point", coordinates: [-122.429416, 37.784929] },
    profileImage: 'https://picsum.photos/seed/tarot-deck/300/300'
  },
  {
    title: "Palmistry & Aura Reading Combined",
    description: "Unique blend of traditional palmistry with modern aura interpretation. Discover your life path and hidden talents. Special couples readings available.",
    contact: "+1 555-0125",
    location: "Starlight District, CA",
    coordinates: { type: "Point", coordinates: [-122.409416, 37.764929] },
    profileImage: 'https://picsum.photos/seed/palmistry/300/300'
  },
  {
    title: "Astrology & Numerology Expert",
    description: "Comprehensive birth chart analysis with numerological insights. Career timing, relationship compatibility, and life purpose readings.",
    contact: "+1 555-0126",
    location: "Cosmic Corner, CA",
    coordinates: { type: "Point", coordinates: [-122.439416, 37.754929] },
    profileImage: 'https://picsum.photos/seed/astrology/300/300'
  },
  {
    title: "Tea Leaf & Rune Reading Sessions",
    description: "Ancient Norse rune casting combined with traditional tea leaf interpretation. Uncover messages from the past and glimpses of the future.",
    contact: "+1 555-0127",
    location: "Serenity Square, CA",
    coordinates: { type: "Point", coordinates: [-122.449416, 37.794929] },
    profileImage: 'https://picsum.photos/seed/tea-leaf/300/300'
  },
  {
    title: "Dream Interpretation Specialist",
    description: "Professional dream analysis using Jungian psychology and ancient symbolism. Remote sessions available. Dream journal consultation included.",
    contact: "+1 555-0128",
    location: "Dreamweaver's Haven, CA",
    coordinates: { type: "Point", coordinates: [-122.459416, 37.804929] },
    profileImage: 'https://picsum.photos/seed/dream/300/300'
  }
];

// Expand dummy ads: for each county and for each dummy ad, create a new ad object.
let expandedDummyAds = [];
counties.forEach(county => {
  dummyAds.forEach(ad => {
    expandedDummyAds.push({
      ...ad,
      county, // assign current county
      datePosted: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
    });
  });
});

const dummyChatMessages = [
  {
    message: "Hi, I'm interested in a reading. Are you available today?",
    timestamp: new Date(Date.now() - 3600000) // 1 hour ago
  },
  {
    message: "Yes, I have a slot at 3 PM. Would that work for you?",
    timestamp: new Date(Date.now() - 3540000) // 59 minutes ago
  },
  {
    message: "Do you offer remote readings?",
    timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/travelling_fortune_tellers', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const { User, Ad, ChatMessage } = require('../models');

    // Clear existing data
    await User.deleteMany({});
    await Ad.deleteMany({});
    await ChatMessage.deleteMany({});

    // Create users with profile images
    const createdUsers = await Promise.all(
      dummyUsers.map(async user => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return User.create({
          ...user,
          password: hashedPassword,
          profileImage: profileImagePlaceholders[user.username] || profileImagePlaceholders.default
        });
      })
    );

    const advertisers = createdUsers.filter(user => user.role === 'advertiser');
    const users = createdUsers.filter(user => user.role === 'user');
    
    // Create ads with references to advertisers
    await Promise.all(
      expandedDummyAds.map((ad, index) => {
        const advertiser = advertisers[index % advertisers.length];
        return Ad.create({
          ...ad,
          advertiser: advertiser._id
        });
      })
    );

    // Create sample chat messages
    await Promise.all(
      advertisers.flatMap(advertiser => 
        users.map(user =>
          dummyChatMessages.map((msg, i) => 
            ChatMessage.create({
              sender: i % 2 === 0 ? user._id : advertiser._id,
              recipient: i % 2 === 0 ? advertiser._id : user._id,
              message: msg.message,
              timestamp: msg.timestamp,
              read: false
            })
          )
        )
      ).flat()
    );

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
