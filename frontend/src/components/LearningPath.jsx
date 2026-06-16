import { useLocation, useNavigate } from 'react-router-dom'

function LearningPath() {
  const { state } = useLocation()
  const navigate = useNavigate()

  if (!state) {
    navigate('/')
    return null
  }

  const { userId, learningPath, name, level, goal } = state

  const skillColors = {}
  const palette = ['tag-blue', 'tag-purple', 'tag-green', 'tag-orange', 'tag-pink']
  let colorIndex = 0
  learningPath.forEach(item => {
    if (!skillColors[item.skill]) {
      skillColors[item.skill] = palette[colorIndex % palette.length]
      colorIndex++
    }
  })

  return (
    <div className="page">
      <div className="page-header">
        <h2>Hey {name}! 👋 Here's your personalized path</h2>
        <p className="page-meta">
          <span className="badge">{level}</span>
          <span className="badge">{goal}</span>
          <span className="badge">{learningPath.length} topics</span>
        </p>
      </div>

      <div className="path-grid">
        {learningPath.map((item, index) => (
          <div className="path-card" key={index}>
            <div className="path-card-top">
              <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
              <span className={`skill-tag ${skillColors[item.skill]}`}>{item.skill}</span>
            </div>
            <h3 className="topic-title">{item.topic}</h3>
            <p className="topic-desc">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="path-actions">
        <button
          className="btn-primary"
          onClick={() => navigate(`/dashboard/${userId}`, { state: { name } })}
        >
          Go to Dashboard →
        </button>
        <button className="btn-secondary" onClick={() => navigate('/')}>
          Start Over
        </button>
      </div>
    </div>
  )
}

export default LearningPath