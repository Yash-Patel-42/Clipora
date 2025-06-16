import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/Landing_Page'
import EditingPage from './pages/EditingPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/edit" element={<EditingPage />} />
      </Routes>
    </Router>
  )
}

export default App
