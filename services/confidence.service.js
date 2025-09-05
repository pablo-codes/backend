

/**
 * Calculate confidence score for AI responses
 * @param {string} response - The AI response content
 * @param {Object} usage - Token usage information
 * @param {Array} contextData - Context data used to generate response
 * @returns {number} Confidence score between 0 and 1
 */
const calculateResponseConfidence = (response, usage, contextData = []) => {
    try {
        // Validate inputs
        if (!response || typeof response !== 'string') {
            return 0.1; // Very low confidence for invalid response
        }

        // Simple confidence calculation based on response quality
        const contentLength = response.length;
        const tokenCount = usage?.completion_tokens || 0;
        const contextCount = Array.isArray(contextData) ? contextData.length : 0;

        // Base confidence
        let confidence = 0.5;

        // Increase confidence based on content length (up to 300 chars)
        if (contentLength > 50) confidence += 0.1;
        if (contentLength > 100) confidence += 0.1;
        if (contentLength > 200) confidence += 0.1;
        if (contentLength > 300) confidence += 0.1;

        // Increase confidence based on token usage
        if (tokenCount > 50) confidence += 0.05;
        if (tokenCount > 100) confidence += 0.05;

        // Increase confidence based on context usage (more context = more reliable)
        if (contextCount > 0) confidence += 0.05;
        if (contextCount > 2) confidence += 0.05;

        // Cap confidence at 0.95
        return Math.min(confidence, 0.95);
    } catch (error) {
        console.error(error, 'Error calculating response confidence:');
        return 0.5; // Default confidence
    }
};

/**
 * Determine if response confidence is sufficient for autonomous response
 * @param {number} confidence - Confidence score
 * @param {string} responseType - Type of response (standard, complex, sensitive)
 * @returns {boolean} Whether confidence is sufficient
 */
const isConfidenceSufficient = (confidence, responseType = 'standard') => {
    try {
        // Different confidence thresholds based on response type
        const thresholds = {
            standard: 0.7,    // 70% confidence needed for standard responses
            complex: 0.75,    // 75% confidence needed for complex responses
            sensitive: 0.8    // 80% confidence needed for sensitive responses
        };

        const threshold = thresholds[responseType] || thresholds.standard;
        return confidence >= threshold;
    } catch (error) {
        console.error(error, 'Error determining confidence sufficiency:');
        return false;
    }
};



/**
 * Calculate confidence for search results
 * @param {Array} searchResults - Array of search results with scores
 * @returns {number} Overall confidence score for search results
 */
const calculateSearchConfidence = (searchResults) => {
    try {
        if (!Array.isArray(searchResults) || searchResults.length === 0) {
            return 0.1; // Very low confidence if no results
        }

        // Calculate average score of search results
        const totalScore = searchResults.reduce((sum, result) => {
            return sum + (result.score || 0);
        }, 0);

        const averageScore = totalScore / searchResults.length;

        // Convert to confidence (0.1 to 0.9 range)
        // Search scores are typically between 0 and 1, so we map them directly
        return Math.min(Math.max(averageScore, 0.1), 0.9);
    } catch (error) {
        console.error(error, 'Error calculating search confidence:',);
        return 0.3; // Low confidence fallback
    }
};

/**
 * Adjust confidence based on content quality
 * @param {number} baseConfidence - Base confidence score
 * @param {Array} contextData - Context data used
 * @returns {number} Adjusted confidence score
 */
const adjustConfidenceForContentQuality = (baseConfidence, contextData = []) => {
    try {
        let adjustedConfidence = baseConfidence;

        // If no context data, reduce confidence
        if (!contextData || contextData.length === 0) {
            adjustedConfidence *= 0.7; // Reduce by 30%
        }

        // If context data is very short, reduce confidence
        const totalContextLength = contextData.reduce((sum, item) => {
            return sum + (item.content?.length || item.chunk?.length || 0);
        }, 0);

        if (totalContextLength < 100) {
            adjustedConfidence *= 0.8; // Reduce by 20%
        }

        // Cap at reasonable bounds
        return Math.min(Math.max(adjustedConfidence, 0.1), 0.95);
    } catch (error) {
        console.error(error, 'Error adjusting confidence for content quality:');
        return baseConfidence;
    }
};

export {
    calculateResponseConfidence,
    isConfidenceSufficient,
    calculateSearchConfidence,
    adjustConfidenceForContentQuality
};