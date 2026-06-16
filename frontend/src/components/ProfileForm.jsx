import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function ProfileForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    skills: '',
    level: 'Beginner',
    goal: 'Job Preparation'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const skillsArray = form.skills.split(',').map(s => s.trim()).filter(Boolean)

    try {
      const res = await fetch('http://127.0.0.1:5000/api/generate-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          skills: skillsArray,
          level: form.level,
          goal: form.goal
        })
      })

      const data = await res.json()

      navigate('/learning-path', {
        state: {
          userId: data.user_id,
          learningPath: data.learning_path,
          name: form.name,
          level: form.level,
          goal: form.goal
        }
      })
    } catch (err) {
      setError('Something went wrong. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h2 className="form-title">Build Your Learning Path</h2>
        <p className="form-subtitle">Tell us about yourself and AI will create a personalized roadmap for you</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Bhavani"
              required
            />
          </div>

          <div className="form-group">
            <label>Skills <span className="hint">(comma separated)</span></label>
            <input
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="e.g. Python, Java, SQL"
              required
            />
          </div>

          <div className="form-group">
            <label>Current Level</label>
            <select name="level" value={form.level} onChange={handleChange}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="form-group">
            <label>Your Goal</label>
            <select name="goal" value={form.goal} onChange={handleChange}>
              <option>Job Preparation</option>
              <option>Interview Preparation</option>
              <option>Academics</option>
              <option>General Learning</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="spinner"></span> Generating your path...
              </span>
            ) : (
              '✨ Generate My Learning Path'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ProfileForm