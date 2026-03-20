import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Hero from './components/Hero'
import About from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Popup from './components/Popup'
import Help from './pages/help'

function App() {
  return (
    <Router>
      <Popup />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Hero />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="contact" element={<Contact />} />
          <Route path="help" element={<Help />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
