import { togetherAIClient, togetherAIConfig } from '../config/togetherAi.js';


/**
 * Generate chat response using Meta-Llama-3.1-8B-Instruct-Turbo
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options for the chat completion
 * @returns {Promise<Object>} Chat response with content and metadata
 */
const generateChatResponse = async (messages, options = {}) => {
    try {
        if (!togetherAIConfig.apiKey) {
            throw new Error('TOGETHERAI_API_KEY not configured');
        }

        // Validate messages input
        if (!Array.isArray(messages) || messages.length === 0) {
            throw new Error('Messages array is required and cannot be empty');
        }

        const requestBody = {
            model: togetherAIConfig.chatModel.name,
            messages: messages,
            max_tokens: options.maxTokens || togetherAIConfig.chatModel.maxTokens,
            temperature: options.temperature || togetherAIConfig.chatModel.temperature,
            top_p: options.topP || 0.7,
            top_k: options.topK || 50,
            repetition_penalty: options.repetitionPenalty || 1,
            stream: false
        };

        const response = await togetherAIClient.chat.completions.create(requestBody);

        const choice = response.choices[0];

        return {
            content: choice.message.content,
            finishReason: choice.finish_reason,
            usage: response.usage
        };
    } catch (error) {
        console.error(error, 'Error generating chat response:');
        if (error.response) {
            console.error(error.response, 'API Error Response:');
        }
        throw new Error(`Failed to generate chat response: ${error.message}`);
    }
};




export {
    generateChatResponse,

};