import app from '../server.js';
import { client } from '../config/db.js';

try {
    await client.connect();
    console.log("📚 Database connection established");
} catch (err) {
    console.error("❌ Failed to connect DB:", err);
}

export default app;
