import mongoose from 'mongoose';
// import { MongoMemoryServer } from 'mongodb-memory-server'; // Removed for production safety
import dotenv from 'dotenv';
dotenv.config();

let cachedConnection: typeof mongoose | null = null;


export const connectDB = async () => {
    // If we have a cached connection, reuse it
    if (cachedConnection && mongoose.connection.readyState >= 1) {
        return cachedConnection;
    }

    try {
        let uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) {
            if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
                console.error("CRITICAL: MONGO_URI is missing in production environment.");
                return null;
            }
            console.log("No MONGO_URI found, starting in-memory Hackathon mock DB database...");
            const { MongoMemoryServer } = await import('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
        }

        console.log("Attempting to connect to MongoDB...");
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s
        });

        cachedConnection = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Database Connection Error: ${(error as Error).message}`);
        return null;
    }
};
