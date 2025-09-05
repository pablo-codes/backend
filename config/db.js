import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';


dotenv.config();

// MongoDB Configuration
const dbConfig = {
    uri: process.env.MONGODB_URI,
    database: process.env.MONGODB_DATABASE || "vector_db",
    collection: process.env.MONGODB_COLLECTION || "embeddings",
    lead: process.env.LEAD || "lead"
};


const client = new MongoClient(process.env.MONGODB_URI);

const db = client.db(process.env.MONGODB_DATABASE);



export { db, client, dbConfig };