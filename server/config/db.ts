// Campus Pace - Stable Upload & Sync Update - 2026-04-11
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Use global to persist connection across HMR reloads in development
 */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
    mongoServer: any | null;
}

let cached: MongooseCache = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null, mongoServer: null };
}

export const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = (async () => {
            let uri = process.env.MONGO_URI || process.env.MONGODB_URI;
            
            if (!uri) {
                if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
                    console.error("--------------------------------------------------");
                    console.error("WARNING: MONGO_URI is missing in production.");
                    console.error("Database connection features will be disabled.");
                    console.error("Please add MONGO_URI to your Vercel Environment Variables.");
                    console.error("--------------------------------------------------");
                    return null;
                }

                console.log("No MONGO_URI found, initializing singleton in-memory DB...");
                const { MongoMemoryServer } = await import('mongodb-memory-server');
                
                if (!cached.mongoServer) {
                    cached.mongoServer = await MongoMemoryServer.create();
                }
                uri = cached.mongoServer.getUri();
            }

            console.log("Attempting to connect to MongoDB...");
            return mongoose.connect(uri as string, {
                serverSelectionTimeoutMS: 5000,
            });
        })();
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error(`Database Connection Error: ${(e as Error).message}`);
        return null;
    }

    console.log(`MongoDB Connected: ${cached.conn.connection.host}`);
    return cached.conn;
};
