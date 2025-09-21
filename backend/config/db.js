// backend/config/db.js
import mongoose from "mongoose";

const connectDB = async () => {
  const maxRetries = 5;
  let retryCount = 0;
  
  const connectWithRetry = async () => {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 60000,
        socketTimeoutMS: 90000,
        connectTimeoutMS: 60000,
        retryWrites: true,
        w: 'majority',
        maxPoolSize: 10,
        heartbeatFrequencyMS: 3000,
        family: 4 // Use IPv4, skip trying IPv6
      });

      mongoose.connection.on('connected', () => {
        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
        console.log('✅ MongoDB connection successful');
        console.log(`MongoDB Connection State: ${mongoose.connection.readyState}`);
        // Reset retry count on successful connection
        retryCount = 0;
      });

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        if (err.name === 'MongoServerSelectionError') {
          console.error('Could not connect to MongoDB server. Please check your connection string and network.');
          process.exit(1);
        }
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Mongoose will try to reconnect automatically...');
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        try {
          await mongoose.connection.close();
          console.log('MongoDB connection closed through app termination');
          process.exit(0);
        } catch (err) {
          console.error('Error during graceful shutdown:', err);
          process.exit(1);
        }
      });

      return conn;

    } catch (error) {
      console.error('MongoDB connection error:', error);
      console.error('Please check your MongoDB Atlas connection string and internet connection');
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Connection failed. Retrying in 5 seconds... Attempt ${retryCount} of ${maxRetries}`);
        setTimeout(connectWithRetry, 5000);
      } else {
        console.error('Failed to connect to MongoDB after maximum retries');
        process.exit(1);
      }
    }
  };

  // Start the connection process
  return await connectWithRetry();
};

export default connectDB;