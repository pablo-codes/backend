import { db, dbConfig } from '../config/db.js';
import logger from '../utils/logger.util.js';

/**
 * Search for relevant content using vector similarity search
 * @param {Array} queryEmbedding - Query embedding vector
 * @param {number} limit - Number of results to return
 * @param {number} threshold - Minimum similarity threshold
 * @returns {Promise<Array>} Array of relevant documents
 */
const searchRelevantContent = async (queryEmbedding, limit = 5, threshold = 0.7, text = '') => {
    try {
        const collection = db.collection(dbConfig.collection);
        // Perform vector similarity search using MongoDB Atlas Vector Search
        const pipeline = [
            {
                $vectorSearch: {
                    index: "vector_index",
                    path: "embedding",
                    queryVector: queryEmbedding,
                    numCandidates: 100,
                    limit: limit
                }
            },
            {
                $addFields: {
                    score: { $meta: "vectorSearchScore" }
                }
            },
            {
                $match: {
                    score: { $gte: threshold }
                }
            },
            {
                $sort: {
                    score: -1
                }
            }
        ];

        const results = await collection.aggregate(pipeline).toArray();
        return results;
    } catch (error) {
        console.error('Error searching relevant content:', error.message);
        // Fallback to text search if vector search fails
        if (text) {
            return await searchTextContent(text, limit);
        }
        return [];
    }
};



/**
 * Search for relevant content using text-based search
 * @param {string} query - Search query text
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} Array of relevant documents
 */
const searchTextContent = async (query, limit = 5) => {
    try {

        const collection = db.collection(process.env.MONGODB_COLLECTION || 'embeddings');

        // Text search across title, content, and extractedData fields
        const results = await collection.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } },
                { 'extractedData.page_title': { $regex: query, $options: 'i' } },
                { 'extractedData.main_content': { $regex: query, $options: 'i' } },
                { 'extractedData.key_information': { $regex: query, $options: 'i' } }
            ]
        }).limit(limit).toArray();

        return results.map(doc => ({
            ...doc,
            score: 0.5 // Default score for text search
        }));
    } catch (error) {
        console.error('Error in text search:', error.message);
        return [];
    }
};

// /**
//  * Get content by URL
//  * @param {string} url - URL to search for
//  * @returns {Promise<Object|null>} Document or null if not found
//  */
// const getContentByUrl = async (url) => {
//     try {

//         const collection = db.collection(process.env.MONGODB_COLLECTION || 'embeddings');

//         const result = await collection.findOne({ url: url });
//         return result;
//     } catch (error) {
//         console.error('Error getting content by URL:', error.message);
//         return null;
//     }
// };



// /**
//  * Reassemble chunks from the same document
//  * @param {Array} chunks - Array of chunk documents
//  * @returns {Object} Reassembled document with combined content
//  */
// const reassembleChunks = (chunks) => {
//     try {
//         if (!chunks || chunks.length === 0) {
//             return null;
//         }

//         // Sort chunks by chunkIndex to maintain order
//         const sortedChunks = [...chunks].sort((a, b) => (a.chunkIndex || 0) - (b.chunkIndex || 0));

//         // Combine chunk content
//         const combinedContent = sortedChunks.map(chunk => chunk.chunk || chunk.content || '').join('\n\n');

//         // Return reassembled document with combined content
//         return {
//             ...sortedChunks[0], // Use first chunk as base
//             content: combinedContent,
//             chunks: sortedChunks.length,
//             reassembled: true
//         };
//     } catch (error) {
//         console.error('Error reassembling chunks:', error.message);
//         return null;
//     }
// };

export {
    searchRelevantContent,
    searchTextContent,
};