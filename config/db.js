const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Optional local connection if available
    if (process.env.MONGO_URI && !process.env.MONGO_URI.includes('cluster')) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB Connected Successfully!');
    }
  } catch (error) {
    console.log('Running in local mode.');
  }
};

module.exports = connectDB;
