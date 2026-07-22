# CareerPilot AI 🚀

Build Your Resume. Discover Your Career.

CareerPilot AI is an advanced, MERN-stack career guidance platform that goes beyond standard resume building. It allows users to dynamically craft ATS-friendly resumes, import existing documents, generate pixel-perfect PDFs, and receive deep AI-driven career analysis powered by **Google Gemini**.

---

## ✨ Features

- **Robust Authentication**: Secure JWT-based signup/login and session persistence.
- **Dynamic Resume Builder**: Dual-pane editor with real-time live preview.
- **Multiple Templates**: Switch between Classic, Modern, and Minimal resume formats instantly.
- **Resume Upload & Parsing**: Import existing PDFs and DOCX files. The platform automatically extracts text and maps fields to accelerate resume creation.
- **Client-Side PDF Engine**: Download high-fidelity A4 PDFs directly from the browser using the exact HTML/CSS template without backend processing delays.
- **AI Career Analysis**: Leverage Google Gemini to score your resume, identify missing technical skills/keywords, recommend matching job roles, and generate a personalized weekly learning roadmap.

---

## 🛠️ Tech Stack

**Frontend**:
- React 18 (Vite)
- Tailwind CSS v3
- React Router DOM
- Axios (with interceptors)
- html2pdf.js (PDF generation)

**Backend**:
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Token (JWT) & bcryptjs
- Multer, pdf-parse, mammoth (File parsing)
- @google/generative-ai (Gemini SDK)

---

## 📂 Project Structure

\`\`\`text
CareerPilot_AI/
├── backend/                  # Express.js REST API
│   ├── controllers/          # Business logic (Auth, Resume, Analysis)
│   ├── middleware/           # JWT & File upload protection
│   ├── models/               # Mongoose Schemas (User, Resume)
│   ├── routes/               # API Endpoints
│   ├── server.js             # Entry point
│   └── package.json
└── frontend/                 # React SPA (Vite)
    ├── src/
    │   ├── components/       # Reusable UI & Resume Templates
    │   ├── context/          # Auth Context State
    │   ├── layouts/          # Dashboard & Main Layouts
    │   ├── pages/            # Builder, Dashboard, Profile, Analysis
    │   ├── services/         # Axios API Wrappers
    │   ├── App.jsx           # Routing
    │   └── index.css         # Tailwind directives
    ├── tailwind.config.js
    └── package.json
\`\`\`

---

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on 27017 or an Atlas URI)
- Gemini API Key

### 1. Backend Setup
\`\`\`bash
cd backend
npm install
\`\`\`
Create a \`.env\` file in the `backend/` directory based on the `.env.example` in the root:
\`\`\`env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careerpilot
JWT_SECRET=super_secret_key
GEMINI_API_KEY=your_gemini_key
\`\`\`
Start the server:
\`\`\`bash
npm run dev
\`\`\`

### 2. Frontend Setup
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
The application will be available at \`http://localhost:5173\`.

---

## 🌍 Deployment Instructions

### Backend (Render)
1. Push your repository to GitHub.
2. Create a new Web Service on [Render](https://render.com).
3. Set the Root Directory to \`backend\`.
4. Build Command: \`npm install\`
5. Start Command: \`npm start\`
6. Add the Environment Variables (\`MONGODB_URI\`, \`JWT_SECRET\`, \`GEMINI_API_KEY\`).

### Frontend (Vercel)
1. Import the repository into [Vercel](https://vercel.com).
2. Set the Root Directory to \`frontend\`.
3. Vercel will automatically detect Vite. 
4. In Environment Variables, add:
   - \`VITE_API_URL\`: Your deployed Render backend URL (e.g., \`https://careerpilot-api.onrender.com/api\`).
5. Click **Deploy**.

---

## 🔮 Future Scope
- **Job Board Integration**: Pull live jobs matching the AI's recommended roles.
- **Cover Letter Generator**: AI-driven cover letter generation based on the active resume.
- **OAuth Integration**: Sign in with Google / LinkedIn.
