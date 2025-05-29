// Core database setup shared by other modules
// Loads mongoose and configures the main connection
import mongoose from 'mongoose';
import config from './environment.js';

// Example: Connect to MongoDB using config
mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Export the connected mongoose instance, or any helpers needed by other modules
export default mongoose;
