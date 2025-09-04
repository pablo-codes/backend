import express from 'express';
import requestIp from 'request-ip';
import {
    handleChatMessage,
    getChatHealth
} from '../controllers/chat.controller.js';
import {
    trackLead,
    handleCsvExport,
    getLeadHealth
} from '../controllers/leadtracking.controller.js';

const router = express.Router();


// Chat Routes
/**

 * Process chat messages and generate AI responses
 */
router.post('/chat/message', handleChatMessage);


/**
 * GET /api/chat/health
 * Check chat service health status
 */
router.get('/chat/health', getChatHealth);

// Lead Tracking Routes
/**
 * POST /api/track/lead
 * Track lead interactions when CTAs are clicked
 */
router.post('/track/lead', trackLead);

/**
 * GET /api/track/export-csv
 * Export lead data to CSV format
 */
router.get('/track/export-csv', handleCsvExport);

router.get('/track/health', getLeadHealth);


export default router;