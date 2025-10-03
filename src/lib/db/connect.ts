import mongoose from "mongoose";
import { ApiError } from "../utils/apiError";
import logger from "../utils/logger";

class DBConnection {
  private static instance: DBConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DBConnection {
    if (!DBConnection.instance) {
      DBConnection.instance = new DBConnection();
    }
    return DBConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      const mongoUri = process.env.MONGODB_URI;

      if (!mongoUri) {
        throw ApiError.notFound("MONGODB_URI is not defined");
      }

      await mongoose.connect(mongoUri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      logger.info("MongoDB connected successfully");
    } catch (error) {
      logger.error("Error connecting to MongoDB", error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info("MongoDB disconnected successfully");
    } catch (error) {
      logger.error("Error disconnecting from MongoDB", error);
      throw error;
    }
  }

  public connectionStatus(): boolean {
    return this.isConnected;
  }
}

export default DBConnection;
