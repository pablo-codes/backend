import { db } from "../config/db.js";

/**
 * Save lead data to MongoDB
 * @param {Object} leadData - Lead data to save
 * @returns {Promise<Object>} Saved lead document
 */
export const saveLeadToDB = async (leadData) => {
    if (!leadData.ip || !leadData.country || !leadData.timestamp || !leadData.ctaType || !leadData.ctaUrl) {
        throw new Error('Invalid lead data');
    }

    try {

        const collection = db.collection(process.env.LEAD_COLLECTION || 'leads');

        const leadDocument = {
            ...leadData,
            createdAt: new Date()
        };

        const result = await collection.insertOne(leadDocument);
        return { ...leadDocument, _id: result.insertedId };
    } catch (error) {
        console.error('Error saving lead to DB:', error.message);
        throw error;
    }
};

/**
 * Get all leads from MongoDB
 * @returns {Promise<Array>} Array of lead documents
 */
export const getAllLeadsFromDB = async () => {
    try {

        const collection = db.collection(process.env.LEAD_COLLECTION || 'leads');

        const leads = await collection.find({}).sort({ timestamp: -1 }).toArray();
        return leads;
    } catch (error) {
        console.error('Error fetching leads from DB:', error.message);
        throw error;
    }
};

/**
 * Clear all leads from MongoDB (optional)
 * @returns {Promise<Object>} Delete result
 */
export const clearLeadsFromDB = async () => {
    try {

        const collection = db.collection(process.env.LEAD_COLLECTION || 'leads');

        const result = await collection.deleteMany({});
        return result;
    } catch (error) {
        console.error('Error clearing leads from DB:', error.message);
        throw error;
    }
};