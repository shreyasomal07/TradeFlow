/**
 * database.js — MongoDB Connection Manager with Automatic In-Memory Fallback
 * 
 * Guarantees zero-friction startup:
 * 1. Attempts connection to standard MongoDB (e.g., MONGODB_URI in .env or mongodb://127.0.0.1:27017/tradeflow).
 * 2. If local MongoDB server is offline/unavailable, automatically spins up an in-memory MongoMemoryServer.
 */

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let memoryServer = null;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tradeflow';
  
  try {
    // Attempt standard MongoDB connection with a 2.5s timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500
    });
    console.log(`📦 Connected to MongoDB successfully at: ${uri}`);
  } catch (err) {
    console.warn(`⚠️ Could not connect to local MongoDB (${err.message}).`);
    console.log('🚀 Starting seamless persistent embedded MongoDB for local development...');
    
    try {
      const dbDir = path.resolve(__dirname, '../data/db');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbPath: dbDir,
          storageEngine: 'wiredTiger'
        }
      });
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`⚡ Persistent Embedded MongoDB started and connected at: ${memoryUri}`);
    } catch (memErr) {
      console.error('❌ Failed to start Embedded MongoDB with persistent path, trying fallback:', memErr.message);
      try {
        memoryServer = await MongoMemoryServer.create();
        const memoryUri = memoryServer.getUri();
        await mongoose.connect(memoryUri);
        console.log(`⚡ In-Memory MongoDB started and connected at: ${memoryUri}`);
      } catch (fallbackErr) {
        console.error('❌ Failed to start In-Memory MongoDB:', fallbackErr.message);
        throw fallbackErr;
      }
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}

export default connectDB;
