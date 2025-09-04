import { togetherAIClient, togetherAIConfig } from '../config/togetherAi.js';
import logger from '../utils/logger.util.js';

/**
 * Generate embedding for a single text using BAAI/bge-base-en-v1.5
 */
const generateEmbedding = async (text) => {
    try {

        // Validate input
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid text input for embedding generation');
        }

        const queryWithPrefix = `query: ${text}`;

        // Truncate text if too long for the model (BAAI/bge-base-en-v1.5 optimal length)
        const truncatedText = queryWithPrefix.substring(0, 512);

        // Generate embedding using TogetherAI's BAAI/bge-base-en-v1.5 model
        const response = await togetherAIClient.embeddings.create({
            input: truncatedText,
            model: togetherAIConfig.embeddingModel.name,
        });
        // Return the embedding vector
        return response.data[0].embedding;
    } catch (error) {
        logger.error(error, 'Error generating embedding:');
        if (error.response) {
            logger.error(JSON.stringify(error.response.data, null, 2), 'API Error Response:');
        }
        throw new Error(`Failed to generate embedding: ${error.message}`);
    }
};

/**
 * Generate embeddings for multiple texts

 */
const generateEmbeddings = async (texts) => {
    try {


        // Validate input
        if (!Array.isArray(texts) || texts.length === 0) {
            throw new Error('Invalid texts input for embeddings generation');
        }

        // Filter out invalid texts and truncate to model limits
        const validTexts = texts
            .filter(text => text && typeof text === 'string')
            .map(text => text.substring(0, 512));

        if (validTexts.length === 0) {
            throw new Error('No valid texts provided for embeddings generation');
        }

        // Generate embeddings using TogetherAI's BAAI/bge-base-en-v1.5 model
        const response = await togetherAIClient.embeddings.create({
            input: validTexts,
            model: togetherAIConfig.embeddingModel.name,
        });

        // Return array of embedding vectors
        return response.data.map(item => item.embedding);
    } catch (error) {
        console.error('Error generating embeddings:', error.message);
        if (error.response) {
            console.error('API Error Response:', JSON.stringify(error.response.data, null, 2));
        }
        throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
};



export { generateEmbedding, generateEmbeddings };