'use client'
import { useState, useEffect } from 'react'

const Popup = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('popup_dismissed')
    const dismissedTime = localStorage.getItem('popup_dismissed_time')
    
    // Show again after 24 hours
    if (dismissed === 'true' && dismissedTime) {
      const hoursSinceDismiss = (Date.now() - Number(dismissedTime)) / (1000 * 60 * 60)
      if (hoursSinceDismiss < 24) return
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsClosing(true)
    localStorage.setItem('popup_dismissed', 'true')
    localStorage.setItem('popup_dismissed_time', String(Date.now()))
    setTimeout(() => {
      setIsVisible(false)
    }, 300)
  }

  if (!isVisible) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      opacity: isClosing ? 0 : 1,
      transition: 'opacity 0.3s ease'
    }}>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(to right, #2563eb, #9333ea)',
        color: 'white',
        padding: '2rem',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '28rem',
        margin: '1rem',
        textAlign: 'center'
      }}>
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            color: 'rgba(255, 255, 255, 0.8)',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
            Our Programs Are Live!
          </h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
            You can now learn from our courses and download source codes at affordable prices.
          </p>
          <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#fde047' }}>
            Stay connected with AmitSolutionHub!
          </p>
        </div>

        <div style={{ marginTop: '1.5rem' }}>
          <button 
            onClick={handleClose}
            style={{
              backgroundColor: 'white',
              color: '#9333ea',
              fontWeight: '600',
              padding: '0.5rem 1.5rem',
              borderRadius: '9999px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}

export default Popup
