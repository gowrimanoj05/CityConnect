# City Service Web App - Deployment Guide

## Backend Deployment (Render)

1. Create account on Render.com
2. Connect GitHub repository
3. Create new Web Service
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables:
   - MONGODB_URI
   - JWT_SECRET
   - DIALOGFLOW_PROJECT_ID
   - FRONTEND_URL

## Frontend Deployment (Vercel)

1. Create account on Vercel.com
2. Import GitHub repository
3. Select frontend folder
4. Add environment variable:
   - VITE_API_URL=https://your-backend-url/api
5. Deploy

## Database Setup (MongoDB Atlas)

1. Create account on MongoDB Atlas
2. Create cluster
3. Get connection string
4. Add to .env and production environment

## Environment Variables Needed

### Backend
- MONGODB_URI
- JWT_SECRET
- PORT
- DIALOGFLOW_PROJECT_ID
- DIALOGFLOW_TOKEN
- FRONTEND_URL

### Frontend
- VITE_API_URL

## Running Locally

### Backend
\`\`\`bash
npm install
npm run dev
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Visit http://localhost:3000
