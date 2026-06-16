import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProfileForm from './components/ProfileForm'
import LearningPath from './components/LearningPath'
import Dashboard from './components/Dashboard'
import './styles/style.css'

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-inner">
            <span className="logo">🎯 LearnAI</span>
            <span className="tagline">Your AI-powered learning companion</span>
          </div>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<ProfileForm />} />
            <Route path="/learning-path" element={<LearningPath />} />
            <Route path="/dashboard/:userId" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App