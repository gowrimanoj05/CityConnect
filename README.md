# City Service Web App

A comprehensive platform for citizens to report service issues and receive area-specific updates.

## Features

### Citizen Features
- User registration and authentication
- View area-specific notices and announcements
- File complaints for city services
- Track complaint status
- Real-time chatbot support
- Comment on complaints

### Admin Features
- Manage complaints (view, update status, add comments)
- Post and manage notices
- Dashboard with complaint statistics
- Filter and search functionality

## Tech Stack

**Frontend:**
- React 18
- Material UI
- React Router
- Formik + Yup
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt for password hashing

**Deployment:**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

## Installation

### Backend
1. Clone repository
2. Run \`npm install\`
3. Create .env file with required variables
4. Run \`npm run dev\`

### Frontend
1. Navigate to frontend directory
2. Run \`npm install\`
3. Create .env file with VITE_API_URL
4. Run \`npm run dev\`

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Notices
- GET /api/notices (citizen - area specific)
- GET /api/notices/all (admin)
- POST /api/notices (admin)

### Complaints
- GET /api/complaints (citizen)
- GET /api/complaints/admin/all (admin)
- POST /api/complaints (citizen)
- PATCH /api/complaints/:id (admin)
- POST /api/complaints/:id/comment

### Chatbot
- POST /api/chatbot/message

## Project Structure

\`\`\`
project/
├── server.js
├── package.json
├── .env.example
├── middleware/
│   └── auth.js
├── models/
│   ├── User.js
│   ├── Notice.js
│   ├── Complaint.js
│   └── ChatLog.js
├── routes/
│   ├── auth.js
│   ├── notices.js
│   ├── complaints.js
│   └── chatbot.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/
        │   └── api.js
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── CitizenDashboard.jsx
            ├── AdminDashboard.jsx
            ├── NoticesPage.jsx
            ├── ComplaintsPage.jsx
            ├── CreateComplaintPage.jsx
            ├── ChatbotPage.jsx
            ├── AdminComplaintsPage.jsx
            ├── AdminNoticesPage.jsx
            ├── CreateNoticePage.jsx
            └── AdminStatsPage.jsx
\`\`\`
