from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from groq import Groq

import sqlite3
import os
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

DB_FILE = "learning_path.db"

# ─── Database Setup ───────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            skills TEXT,
            level TEXT,
            goal TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS learning_paths (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            skill TEXT,
            topic TEXT,
            description TEXT,
            status TEXT DEFAULT 'Not Started'
        )
    """)
    conn.commit()
    conn.close()

def ask_groq(prompt):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    return response.choices[0].message.content.strip()

# ─── Routes ───────────────────────────────────────────────────

@app.route("/api/generate-path", methods=["POST"])
def generate_path():
    data = request.json
    name = data.get("name")
    skills = data.get("skills")
    level = data.get("level")
    goal = data.get("goal")

    prompt = f"""
    You are an expert learning coach. Create a personalized learning path for:
    - Name: {name}
    - Current Skills: {', '.join(skills)}
    - Current Level: {level}
    - Goal: {goal}

    Return ONLY a JSON array like this (no extra text, no markdown, no backticks):
    [
      {{
        "skill": "Python",
        "topic": "Topic name here",
        "description": "One line about what they will learn"
      }}
    ]

    Generate 8-10 topics total across all skills. Make it practical and goal-focused.
    """

    text = ask_groq(prompt)

    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    learning_path = json.loads(text)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (name, skills, level, goal) VALUES (?, ?, ?, ?)",
        (name, ", ".join(skills), level, goal)
    )
    user_id = cursor.lastrowid

    for item in learning_path:
        cursor.execute(
            "INSERT INTO learning_paths (user_id, skill, topic, description, status) VALUES (?, ?, ?, ?, ?)",
            (user_id, item["skill"], item["topic"], item["description"], "Not Started")
        )

    conn.commit()
    conn.close()

    return jsonify({"user_id": user_id, "learning_path": learning_path})


@app.route("/api/dashboard/<int:user_id>", methods=["GET"])
def get_dashboard(user_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()

    cursor.execute("SELECT * FROM learning_paths WHERE user_id = ?", (user_id,))
    topics = cursor.fetchall()
    conn.close()

    if not user:
        return jsonify({"error": "User not found"}), 404

    total = len(topics)
    completed = sum(1 for t in topics if t["status"] == "Completed")
    in_progress = sum(1 for t in topics if t["status"] == "In Progress")

    return jsonify({
        "user": dict(user),
        "topics": [dict(t) for t in topics],
        "stats": {
            "total": total,
            "completed": completed,
            "in_progress": in_progress,
            "percent": round((completed / total) * 100) if total > 0 else 0
        }
    })


@app.route("/api/update-status", methods=["POST"])
def update_status():
    data = request.json
    topic_id = data.get("topic_id")
    status = data.get("status")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE learning_paths SET status = ? WHERE id = ?",
        (status, topic_id)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Status updated"})


@app.route("/api/quiz", methods=["POST"])
def generate_quiz():
    data = request.json
    topic = data.get("topic")
    skill = data.get("skill")

    prompt = f"""
    Create 5 multiple choice questions about "{topic}" in {skill}.
    Return ONLY a JSON array (no extra text, no markdown, no backticks):
    [
      {{
        "question": "Question here?",
        "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
        "answer": "A) option1"
      }}
    ]
    """

    text = ask_groq(prompt)

    if "```" in text:
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    quiz = json.loads(text)
    return jsonify({"quiz": quiz})


@app.route("/api/chat", methods=["POST"])
def chat_tutor():
    data = request.json
    message = data.get("message")
    topic = data.get("topic", "programming")
    history = data.get("history", "")

    prompt = f"""
    You are a friendly programming tutor helping a student learn {topic}.
    Here is the conversation so far:
    {history}

    Now answer this new message : {message}
    Be conversational and helpful. Use examples where needed.
    Format your response clearly with line breaks between points.
    """

    reply = ask_groq(prompt)
    return jsonify({"reply": reply})


init_db()

if __name__ == "__main__":
    app.run(debug=True, port=5000)