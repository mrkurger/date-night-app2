import { MongoClient } from 'mongodb';
import { MockDataService } from './mock-data.js';
async function populateAdvertisers() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'date-night-app';
    const collectionName = 'advertisers';
    try {
        // Connect to MongoDB
        const client = await MongoClient.connect(uri);
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        // Create mock data service
        const mockDataService = new MockDataService();
        // Generate mock advertisers
        const advertisers = mockDataService.generateMockAdvertisers(75);
        // Clear existing advertisers
        await collection.deleteMany({});
        // Insert new advertisers
        const result = await collection.insertMany(advertisers);
        console.log(`Successfully inserted ${result.insertedCount} advertisers`);
        // Create indexes
        await collection.createIndex({ profileName: 1 });
        await collection.createIndex({ age: 1 });
        await collection.createIndex({ nationality: 1 });
        await collection.createIndex({ 'location.city': 1 });
        await collection.createIndex({ 'pricing.hourlyRate': 1 });
        await collection.createIndex({ 'stats.rating': 1 });
        await collection.createIndex({ 'verification.verified': 1 });
        await collection.createIndex({ 'location.coordinates': '2dsphere' }, { sparse: true });
        console.log('Successfully created indexes');
        // Close connection
        await client.close();
        console.log('Database connection closed');
    }
    catch (error) {
        console.error('Error populating database:', error);
        process.exit(1);
    }
}
// Run the script
populateAdvertisers().catch(console.error);
