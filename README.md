# Business Analysis School AI API

## Overview
This project is a backend API built with Express.js and Node.js. It leverages MongoDB for vector-based knowledge retrieval and integrates with the TogetherAI API to power an intelligent chatbot for the Business Analysis School support portal.

## Features
- **Express.js**: Serves as the robust framework for building the RESTful API endpoints.
- **MongoDB**: Utilized as a vector database to store and perform similarity searches on text embeddings for a Retrieval-Augmented Generation (RAG) system.
- **TogetherAI**: Provides state-of-the-art models for generating text embeddings and powering conversational AI responses.
- **GeoIP-lite**: Enables geolocation of user IP addresses for lead tracking and analytics.
- **Pino**: Implements high-performance, structured logging for monitoring and debugging.

## Getting Started
### Installation
Follow these steps to set up the project locally.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/eny-consulting-backend.git
    cd eny-consulting-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and populate it using the `.env-example` file as a template.

4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The server will be running at `http://localhost:5000`.

### Environment Variables
The following environment variables are required for the application to run.

```ini
# Server Configuration
PORT=5000
NODE_ENV=development
BACKEND_URL=http://localhost:5000

# TogetherAI Configuration
TOGETHERAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DATABASE=vector_db
MONGODB_COLLECTION=embeddings
LEAD_COLLECTION=leads

# File Storage
LEAD_DATA_FILE=./data/lead_data.txt
```

## API Documentation
### Base URL
`/api`

### Endpoints
#### GET /health
A health check endpoint to verify that the API is running correctly.

**Request**:
No payload required.

**Response**:
```json
{
    "status": "OK",
    "message": "Business Analysis School AI Portal API is running",
    "timestamp": "2024-09-05T10:00:00.000Z"
}
```

**Errors**:
- `500 Internal Server Error`: The server encountered an unexpected condition.

---
#### POST /chat/message
Processes a user's message, searches the knowledge base, and generates a response using the AI model.

**Request**:
```json
{
  "message": "What is the course on Data Analytics?"
}
```

**Response**:
```json
{
    "response": "Our Data Analytics Accelerator is a 6-week, certified program designed to launch your career. It covers key concepts and practical skills.",
    "confidence": 0.85,
    "cta": {
        "text": "Launch your Data Analytics career in just 6 weeks. Enroll in our Accelerator Course.",
        "type": "data_analytics_course_enrollment",
        "url": "https://www.businessanalysisschool.com/data-analytics-accelerator-course#payment"
    },
    "sources": [
        "https://www.businessanalysisschool.com/data-analytics-accelerator-course"
    ],
    "usage": {
        "prompt_tokens": 150,
        "completion_tokens": 75,
        "total_tokens": 225
    }
}
```

**Errors**:
- `400 Bad Request`: `Message is required and must be a string`.
- `500 Internal Server Error`: An error occurred during embedding generation, search, or AI response generation.

---
#### GET /chat/health
Checks the health and operational status of the chat service.

**Request**:
No payload required.

**Response**:
```json
{
    "status": "OK",
    "message": "Chat service is operational",
    "timestamp": "2024-09-05T10:05:00.000Z"
}
```

**Errors**:
- `500 Internal Server Error`: The service health check failed.

---
#### POST /track/lead
Tracks a lead when a user clicks a Call-to-Action (CTA) link. It captures the user's IP and geolocation.

**Request**:
```json
{
  "ctaType": "data_analytics_course_enrollment",
  "ctaUrl": "https://www.businessanalysisschool.com/data-analytics-accelerator-course#payment"
}
```

**Response**:
```json
{
    "success": true,
    "message": "Lead tracked successfully"
}
```

**Errors**:
- `400 Bad Request`: `CTA type is required` or `CTA URL is required`.
- `500 Internal Server Error`: `Failed to track lead`.

---
#### GET /track/export-csv
Exports all captured lead data as a downloadable CSV file.

**Request**:
No payload required.

**Response**:
A `text/csv` file with the following headers: `ip_address,country,city,region,timestamp,cta_type,cta_url`.

**Errors**:
- `500 Internal Server Error`: `Failed to generate CSV`.

---
#### GET /track/health
Checks the health and operational status of the lead tracking service.

**Request**:
No payload required.

**Response**:
```json
{
    "status": "OK",
    "message": "Lead service is operational",
    "timestamp": "2024-09-05T10:10:00.000Z"
}
```

**Errors**:
- `500 Internal Server Error`: `Lead service health check failed`.

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://www.npmjs.com/package/dokugen)