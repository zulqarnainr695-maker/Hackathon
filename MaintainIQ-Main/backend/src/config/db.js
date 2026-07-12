const mongoose = require('mongoose');
const {config} = require('dotenv');
config();

const connectDB = async () => {
  try {
    console.log('[Database] Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/maintainiq', {
      serverSelectionTimeoutMS: 8000 // 8s selection timeout limit
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.warn('[Database Alert] Booting server without active connection. Mongoose will auto-reconnect once database node is accessible.');
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[Database Alert] Mongoose connection disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
  console.error(`[Database Error] Mongoose connection error: ${err.message}`);
});

module.exports = connectDB;
