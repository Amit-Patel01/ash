export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: "'Outfit', sans-serif",
      color: 'white',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ fontSize: '8rem', fontWeight: 900, lineHeight: 1, background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        404
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '1rem 0 0.5rem', color: '#e2e8f0' }}>
        Page Not Found
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '2rem', maxWidth: '400px', lineHeight: 1.6 }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <a
        href="/"
        style={{
          padding: '0.75rem 2rem',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white',
          fontWeight: 700,
          textDecoration: 'none',
          fontSize: '0.95rem',
          boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
        }}
      >
        Back to Home
      </a>
    </div>
  )
}
