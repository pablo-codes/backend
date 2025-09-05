# Business Analysis School AI Support Portal – Backend

An Express.js + MongoDB + TogetherAI backend that powers AI-driven chat responses, lead tracking, embeddings, and vector search for contextual knowledge retrieval.

---

## 🚀 Features

### Chat Service

- Powered by **Meta-Llama-3.1-8B-Instruct-Turbo** (TogetherAI)
- Context-aware prompt construction
- Confidence scoring:
  - Response confidence
  - Search confidence
  - Content-quality adjustments
- AI response enriched with **dynamic CTAs**

### Embeddings & Knowledge Base

- Generates embeddings using **BAAI/bge-base-en-v1.5** (TogetherAI)
- Stores embeddings in **MongoDB Atlas Vector Search**
- Falls back to regex-based text search when vector search is unavailable

### Lead Tracking

- Tracks CTA clicks (with IP + GeoIP lookup)
- Stores leads in MongoDB
- Exports leads as CSV

### System Health

- `/api/health` – Global health check
- `/api/chat/health` – Chat service status
- `/api/track/health` – Lead tracking service status

### Security & Middleware

- CORS with production & development configs
- Helmet for secure HTTP headers
- Request logger (method, URL, IP, User-Agent, GeoIP location)

---

## 🛠 Tech Stack

- **Backend**: Express.js
- **Database**: MongoDB Atlas
- **AI Models**: TogetherAI (LLaMA-3.1-8B, BAAI/bge-base-en-v1.5)
- **Libraries**: cors, helmet, dotenv, geoip-lite, request-ip

---

## ⚙️ Setup & Installation

1. **Clone repository**

   ```bash
   git clone <repo-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the project root:

   ```env
   NODE_ENV=development
   PORT=5000

   # MongoDB
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net
   MONGODB_DATABASE=business_analysis_portal
   MONGODB_COLLECTION=knowledge_base
   LEAD_COLLECTION=leads

   # TogetherAI
   TOGETHERAI_API_KEY=your_api_key_here
   ```

4. **Run in development**

   ```bash
   npm run dev
   ```

5. **Run in production**

   ```bash
   npm start
   ```

---

## 📡 API Endpoints

### Root

- `GET /` → Welcome message

### System Health

- `GET /api/health` → API health status

### Chat

- `POST /api/chat/message` → Process chat message and return AI response
- `GET /api/chat/health` → Chat service health

### Lead Tracking

- `POST /api/track/lead` → Track CTA click
- `GET /api/track/export-csv` → Export leads as CSV file
- `GET /api/track/health` → Lead tracking service health

---

## 🔄 How It Works

1. User sends a message →
2. Embedding is generated →
3. Vector search in MongoDB →
4. Confidence scoring is applied →
5. AI response generated with TogetherAI →
6. Lead tracking records CTA interactions

---

## ⚠️ Error Handling

- Structured JSON errors
- Stack trace only visible in development mode

---

## 📑 Logging

The request logger captures:

- HTTP Method & URL
- IP Address & GeoIP location
- User-Agent

---
