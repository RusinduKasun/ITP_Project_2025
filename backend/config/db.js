// db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    // MongoDB connection options for better reliability and performance
    const mongooseOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if server not found
      maxPoolSize: 10, // Maintain up to 10 socket connections
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    // Ensure MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle MongoDB connection events
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Retry connection after a delay
    setTimeout(connectDB, 5000);
    // Don't exit process to allow retries
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed due to app termination');
    process.exit(0);
  } catch (err) {
    console.error(`Error closing MongoDB connection: ${err.message}`);
    process.exit(1);
  }
});

export default connectDB;