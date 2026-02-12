import { MongoClient, Db, Collection } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB_NAME || "ats";

let client: MongoClient;
let db: Db;

export async function connectDB(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  // Create indexes
  await db.collection("candidates").createIndex({ skills: 1 });
  await db.collection("candidates").createIndex({ years_exp: 1 });
  await db.collection("candidates").createIndex({ location: 1 });

  console.error(`[ats-mcp] Connected to MongoDB: ${dbName}`);
  return db;
}

export function getDB(): Db {
  if (!db) throw new Error("Database not connected. Call connectDB() first.");
  return db;
}

export function candidates(): Collection {
  return getDB().collection("candidates");
}

export function jobDescriptions(): Collection {
  return getDB().collection("job_descriptions");
}
