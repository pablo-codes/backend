import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { client } from './config/db.js';
import apiRoutes from './routes/api.route.js';
import helmet from 'helmet';
import { requestLogger } from './middleware/request.middleware.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
let corsOptions;
if (process.env.NODE_ENV === 'production') {
    corsOptions = {
        origin: 'https://pablo-codes.github.io',
        preflightContinue: false,
        maxAge: 600,
        optionSuccessStatus: 200
    };
} else {
    corsOptions = {
        origin: 'http://localhost:3000',
        preflightContinue: false,
        maxAge: 600,
        optionSuccessStatus: 200
    };
}
app.use(requestLogger);
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Business Analysis School AI Portal API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Business Analysis School AI Support Portal API',
        documentation: '/api/health'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// Export the app
export default app;
