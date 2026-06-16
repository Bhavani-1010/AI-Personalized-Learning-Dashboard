import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'

function Dashboard() {
  const { userId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('progress')

  // Quiz state
  const [quiz, setQuiz] = useState(null)
  const [quizLoading, setQuizLoading] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [answers, setAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: '👋 Hi! I\'m your AI tutor. Ask me anything about your learning topics!' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatTopic, setChatTopic] = useState('programming')

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/dashboard/${userId}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [userId])

  const updateStatus = async (topicId, status) => {
    await fetch('http://127.0.0.1:5000/api/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id: topicId, status })
    })
    fetchDashboard()
  }

  const generateQuiz = async (topic, skill) => {
    setQuizLoading(true)
    setQuiz(null)
    setAnswers({})
    setQuizSubmitted(false)
    setSelectedTopic(topic)
    try {
      const res = await fetch('http://127.0.0.1:5000/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, skill })
      })
      const json = await res.json()
      setQuiz(json.quiz)
    } catch (err) {
      console.error(err)
    } finally {
      setQuizLoading(false)
    }
  }

  const sendChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)

    try {
      const res = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
        message: userMsg, 
        topic: chatTopic,
        history: chatMessages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n')
        })
      })
      const json = await res.json()
      setChatMessages(prev => [...prev, { role: 'ai', text: json.reply }])
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const getScore = () => {
    if (!quiz) return 0
    return quiz.reduce((score, q, i) => {
      return answers[i] === q.answer ? score + 1 : score
    }, 0)
  }

  const statusClass = (status) => {
    if (status === 'Completed') return 'status-done'
    if (status === 'In Progress') return 'status-progress'
    return 'status-todo'
  }

  if (loading) return <div className="loading-screen"><div className="spinner-lg"></div><p>Loading your dashboard...</p></div>
  if (!data) return <div className="page"><p>No data found. <button onClick={() => navigate('/')}>Go back</button></p></div>

  const { user, topics, stats } = data

  return (
    <div className="page">
      <div className="page-header">
        <h2>Welcome back, {user.name}! 🚀</h2>
        <p className="page-meta">
          <span className="badge">{user.level}</span>
          <span className="badge">{user.goal}</span>
        </p>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Topics</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{stats.in_progress}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-number">{stats.percent}%</span>
          <span className="stat-label">Overall Progress</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${stats.percent}%` }}></div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={activeTab === 'progress' ? 'tab active' : 'tab'} onClick={() => setActiveTab('progress')}>📋 Progress Tracker</button>
        <button className={activeTab === 'quiz' ? 'tab active' : 'tab'} onClick={() => setActiveTab('quiz')}>🧠 Quiz Generator</button>
        <button className={activeTab === 'chat' ? 'tab active' : 'tab'} onClick={() => setActiveTab('chat')}>💬 AI Tutor</button>
      </div>

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="topic-list">
          {topics.map((topic) => (
            <div className={`topic-item ${statusClass(topic.status)}`} key={topic.id}>
              <div className="topic-info">
                <span className="topic-skill">{topic.skill}</span>
                <span className="topic-name">{topic.topic}</span>
                <span className="topic-desc-small">{topic.description}</span>
              </div>
              <div className="topic-actions">
                <span className={`status-badge ${statusClass(topic.status)}`}>{topic.status}</span>
                {topic.status === 'Not Started' && (
                  <button className="btn-sm btn-blue" onClick={() => updateStatus(topic.id, 'In Progress')}>Start</button>
                )}
                {topic.status === 'In Progress' && (
                  <button className="btn-sm btn-green" onClick={() => updateStatus(topic.id, 'Completed')}>Mark Done</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Tab */}
      {activeTab === 'quiz' && (
        <div className="quiz-section">
          <p className="section-hint">Select a topic to generate an AI quiz</p>
          <div className="topic-picker">
            {topics.map((topic) => (
              <button
                key={topic.id}
                className={`topic-pill ${selectedTopic === topic.topic ? 'active' : ''}`}
                onClick={() => generateQuiz(topic.topic, topic.skill)}
              >
                {topic.topic}
              </button>
            ))}
          </div>

          {quizLoading && <div className="loading-inline"><span className="spinner"></span> Generating quiz...</div>}

          {quiz && (
            <div className="quiz-box">
              <h3>Quiz: {selectedTopic}</h3>
              {quiz.map((q, i) => (
                <div className="quiz-question" key={i}>
                  <p className="q-text">{i + 1}. {q.question}</p>
                  <div className="options">
                    {q.options.map((opt, j) => (
                      <label
                        key={j}
                        className={`option ${quizSubmitted ? (opt === q.answer ? 'correct' : answers[i] === opt ? 'wrong' : '') : answers[i] === opt ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`q${i}`}
                          value={opt}
                          disabled={quizSubmitted}
                          onChange={() => setAnswers({ ...answers, [i]: opt })}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {!quizSubmitted ? (
                <button className="btn-primary" onClick={() => setQuizSubmitted(true)}>Submit Quiz</button>
              ) : (
                <div className="quiz-result">
                  You scored <strong>{getScore()} / {quiz.length}</strong> 🎉
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="chat-section">
          <div className="chat-topic-select">
            <label>Topic context: </label>
            <select value={chatTopic} onChange={e => setChatTopic(e.target.value)}>
              {topics.map(t => (
                <option key={t.id} value={t.topic}>{t.topic}</option>
              ))}
            </select>
          </div>

          <div className="chat-window">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role === 'user' ? 'user-msg' : 'ai-msg'}`}>
                <span className="msg-role">{msg.role === 'user' ? '🧑' : '🤖'}</span>
                <span className="msg-text">
                  {msg.role === 'ai' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
                </span>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-msg ai-msg">
                <span className="msg-role">🤖</span>
                <span className="msg-text typing">Thinking...</span>
              </div>
            )}
          </div>

          <div className="chat-input-row">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Ask your AI tutor anything..."
            />
            <button className="btn-primary" onClick={sendChat} disabled={chatLoading}>Send</button>
          </div>
        </div>
      )}

      <div className="dashboard-footer">
        <button className="btn-secondary" onClick={() => navigate('/')}>← New Profile</button>
      </div>
    </div>
  )
}

export default Dashboard