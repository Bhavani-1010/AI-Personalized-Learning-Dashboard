# 🎯 LearnAI – AI Personalized Learning Dashboard

An AI-powered learning dashboard that generates personalized study roadmaps, quizzes, and provides a real-time AI chat tutor — built with React, Flask, and Groq LLM.

---

## 🚀 Features

- **AI Learning Path Generator** — Enter your skills, level, and goal; Groq LLM generates a personalized roadmap
- **Progress Tracker** — Track topics as Not Started → In Progress → Completed with a live progress bar
- **AI Quiz Generator** — Generate 5 MCQs on any topic instantly with auto-scoring
- **AI Chat Tutor** — Chat with an LLM-powered tutor that remembers conversation context

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite), React Router, React Markdown |
| Backend | Python, Flask, Flask-CORS |
| AI / LLM | Groq API (LLaMA 3.3 70B) |
| Database | SQLite |
| Styling | Custom CSS (dark theme) |

---

## 📁 Project Structure

```
AI_PERSONALIZED_LEARNING_DASHBOARD/
├── backend/
│   ├── app.py            # Flask API with 5 routes
│   ├── requirements.txt  # Python dependencies
│   └── .env              # API keys (not committed)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProfileForm.jsx    # User input form
│   │   │   ├── LearningPath.jsx   # AI generated roadmap
│   │   │   └── Dashboard.jsx      # Progress, Quiz, Chat
│   │   ├── styles/
│   │   │   └── style.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Bhavani-1010/AI-Personalized-Learning-Dashboard.git
cd AI-Personalized-Learning-Dashboard
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:
```
GROQ_API_KEY=your_groq_api_key_here
```

Get your free Groq API key at [console.groq.com](https://console.groq.com)

Start the Flask server:
```bash
python app.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app
Visit `http://localhost:5173` in your browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/generate-path` | Generate AI learning path |
| GET | `/api/dashboard/:id` | Get user dashboard data |
| POST | `/api/update-status` | Update topic status |
| POST | `/api/quiz` | Generate AI quiz |
| POST | `/api/chat` | AI tutor chat |

---

## 💡 How It Works

1. User enters name, skills, level, and goal
2. Flask sends a prompt to **Groq LLM (LLaMA 3.3 70B)**
3. LLM returns a structured JSON learning path
4. React renders the roadmap and saves it to SQLite
5. User tracks progress, takes quizzes, and chats with the AI tutor — all powered by Groq

---

## 🙋 Author

**Bhavani B**  
MCA Student | Aspiring Full Stack Developer  
[GitHub](https://github.com/Bhavani-1010)