import { MongoClient } from "mongodb";

const MONGO_TIMEOUT_MS = 5000;

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getMongoClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Please define the MONGODB_URI environment variable.");
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, {
        connectTimeoutMS: MONGO_TIMEOUT_MS,
        serverSelectionTimeoutMS: MONGO_TIMEOUT_MS,
      });
      global._mongoClientPromise = client.connect().catch((error) => {
        global._mongoClientPromise = undefined;
        throw error;
      });
    }

    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    client = new MongoClient(uri, {
      connectTimeoutMS: MONGO_TIMEOUT_MS,
      serverSelectionTimeoutMS: MONGO_TIMEOUT_MS,
    });
    clientPromise = client.connect().catch((error) => {
      clientPromise = null;
      throw error;
    });
  }

  return clientPromise;
}
