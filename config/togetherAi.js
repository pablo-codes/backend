import dotenv from 'dotenv';
import OpenAI from 'openai';
import logger from '../utils/logger.util.js';

dotenv.config();

// TogetherAI API Configuration
const togetherAIConfig = {
    apiKey: process.env.TOGETHERAI_API_KEY,
    baseUrl: 'https://api.together.xyz/v1',

    // Embedding model configuration
    embeddingModel: {
        name: 'BAAI/bge-base-en-v1.5',
        dimensions: 768
    },

    // Chat model configuration
    chatModel: {
        name: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        maxTokens: 2048,
        temperature: 0.7
    },


};

// Initialize OpenAI client for TogetherAI
const togetherAIClient = new OpenAI({
    apiKey: togetherAIConfig.apiKey,
    baseURL: togetherAIConfig.baseUrl,
});

// Verify API key presence
if (!togetherAIConfig.apiKey) {
    logger.warn('⚠️ TOGETHERAI_API_KEY not found in environment variables');
}

export { togetherAIConfig, togetherAIClient };
