import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';


dotenv.config();

// MongoDB Configuration
const dbConfig = {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    database: process.env.MONGODB_DATABASE || 'business_analysis_school',
    collection: process.env.MONGODB_COLLECTION || 'embeddings'
};


const client = new MongoClient(process.env.MONGODB_URI);

const db = client.db(process.env.MONGODB_DATABASE);



export { db, client, dbConfig };