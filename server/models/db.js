import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI not set');

mongoose.set('strictQuery', false);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('🚀 Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  }
};

// Execute the connection
connectDB();

export default mongoose;
