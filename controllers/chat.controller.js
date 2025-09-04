import { generateEmbedding } from '../services/embedding.service.js';
import { searchRelevantContent } from '../services/knowledge.service.js';
import { generateChatResponse } from '../services/chat.service.js';
import {
    calculateResponseConfidence,
    calculateSearchConfidence,
    adjustConfidenceForContentQuality
} from '../services/confidence.service.js';
import { constructPrompt, generateCTA, formatSources } from '../utils/prompt.util.js';
import logger from '../utils/logger.util.js';

/**
 * Handle chat message processing
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleChatMessage = async (req, res) => {
    try {
        logger.info(req.body)
        const { message } = req.body;

        // Validate input
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                error: 'Message is required and must be a string'
            });
        }

        logger.info(`Processing chat message: "${message}"`);

        // Step 1: Generate query embedding
        const queryEmbedding = await generateEmbedding(message);

        // Step 2: Search for relevant content in knowledge base
        const relevantContent = await searchRelevantContent(queryEmbedding, 5, 0.7, message);

        // Step 3: Calculate search confidence
        const searchConfidence = calculateSearchConfidence(relevantContent);

        // Step 4: Adjust confidence based on content quality
        const qualityAdjustedConfidence = adjustConfidenceForContentQuality(searchConfidence, relevantContent);

        // Step 5: Construct prompt with context
        const promptMessages = constructPrompt(message, relevantContent);

        // Step 6: Generate AI response
        const aiResponse = await generateChatResponse(promptMessages);

        // Step 7: Calculate response confidence
        const responseConfidence = calculateResponseConfidence(
            aiResponse.content,
            aiResponse.usage,
            relevantContent
        );

        // Step 8: Combine confidences (weighted average)
        const finalConfidence = (qualityAdjustedConfidence * 0.3) + (responseConfidence * 0.7);

        // Step 9: Generate contextual CTA
        const cta = generateCTA(message, finalConfidence);

        // Step 10: Format sources
        const sources = formatSources(relevantContent);

        // Step 11: Return structured response
        res.json({
            response: aiResponse.content,
            confidence: finalConfidence,
            cta: cta,
            sources: sources,
            usage: aiResponse.usage
        });

    } catch (error) {
        logger.error(error.message, 'Error handling chat message:');

        // Return fallback response
        res.json({
            response: "I'm currently experiencing technical difficulties. I can still help with general information about Business Analysis School courses  or our coaching program. Please visit our website for the most accurate information.",
            confidence: 0.3,
            cta: {
                text: "Visit our website for more information",
                type: "server_error",
                url: "https://www.businessanalysisschool.com"
            },
            sources: [],
            usage: {
                prompt_tokens: req.body.message.length,
                completion_tokens: 150,
                total_tokens: req.body.message.length + 150
            }
        });
    }
};



/**
 * Get system health status for chat service
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getChatHealth = async (req, res) => {
    try {
        res.json({
            status: 'OK',
            message: 'Chat service is operational',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error(error, "Chat Health error")
        res.status(500).json({
            status: 'ERROR',
            message: 'Chat service health check failed',
            error: error.message
        });
    }
};

export {
    handleChatMessage,
    getChatHealth
};