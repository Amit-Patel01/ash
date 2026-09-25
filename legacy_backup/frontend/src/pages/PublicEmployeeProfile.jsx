import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import { useStore } from '../store/StoreContext'
import { useTheme } from '../context/ThemeContext'
import {
  buildTeamProfiles,
  fetchPublicTeamProfiles,
  getTeamMemberImageUrl,
  getTeamMemberKeys,
} from '../utils/teamProfiles'

const CSS = `
  .profile-page {
    font-family: inherit;
    color: rgb(var(--fg));
    background: rgb(var(--bg));
    min-height: 100vh;
    transition: background-color 0.35s ease, color 0.35s ease;
  }

  @keyframes profile-fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .profile-animate { animation: profile-fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .profile-d1 { animation-delay: 0.1s; }
  .profile-d2 { animation-delay: 0.2s; }
  .profile-d3 { animation-delay: 0.3s; }

  .profile-hero {
    background: var(--grad-hero);
    position: relative;
    overflow: hidden;
    padding: clamp(100px, 12vw, 140px) clamp(16px, 5vw, 28px) clamp(50px, 8vw, 70px);
  }

  .profile-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 clamp(16px, 5vw, 28px);
  }

  .profile-card {
    background: rgba(var(--card), 0.9);
    border: 1px solid rgba(var(--border), 0.8);
    border-radius: 24px;
    padding: clamp(24px, 4vw, 32px);
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .profile-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(99, 102, 241, 0.12);
  }

  .profile-avatar {
    width: 160px;
    height: 160px;
    border-radius: 24px;
    overflow: hidden;
    border: 4px solid rgba(var(--border), 0.5);
    position: relative;
    flex-shrink: 0;
  }

  .profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3.5rem;
    font-weight: 900;
    color: white;
    background: linear-gradient(135deg, #6366f1, #3b82f6);
  }

  .profile-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 999px;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.2);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #6366f1;
  }

  .dark .profile-badge {
    background: rgba(129, 140, 248, 0.12);
    border-color: rgba(129, 140, 248, 0.25);
    color: #818cf8;
  }

  .profile-name {
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 900;
    color: rgb(var(--fg));
    line-height: 1.1;
    margin: 12px 0 8px;
  }

  .profile-role {
    font-size: 1.1rem;
    font-weight: 600;
    color: #6366f1;
    margin-bottom: 8px;
  }

  .profile-bio {
    font-size: 15px;
    color: rgb(var(--fg-muted));
    line-height: 1.75;
    margin-top: 16px;
  }

  .profile-link-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #6366f1, #3b82f6);
    color: white;
    font-weight: 700;
    font-size: 14px;
    border-radius: 999px;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
    border: none;
    cursor: pointer;
  }

  .profile-link-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
  }

  .profile-link-btn.secondary {
    background: rgba(var(--bg-subtle), 0.8);
    color: #6366f1;
    border: 1px solid rgba(99, 102, 241, 0.2);
    box-shadow: none;
  }

  .profile-link-btn.secondary:hover {
    background: rgba(99, 102, 241, 0.08);
  }

  .profile-section-title {
    font-size: 1.4rem;
    font-weight: 800;
    color: rgb(var(--fg));
    margin-bottom: 16px;
  }

  .profile-stat {
    text-align: center;
    padding: 20px;
    background: rgba(var(--card), 0.7);
    border: 1px solid rgba(var(--border), 0.6);
    border-radius: 16px;
  }

  .profile-stat-value {
    font-size: 1.3rem;
    font-weight: 800;
    color: #6366f1;
    margin-bottom: 4px;
  }

  .profile-stat-label {
    font-size: 11px;
    font-weight: 600;
    color: rgb(var(--fg-muted));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @media (max-width: 768px) {
    .profile-avatar {
      width: 120px;
      height: 120px;
    }
    .profile-fallback {
      font-size: 2.5rem;
    }
    .profile-hero {
      padding-top: 80px;
    }
    .profile-card > div[style*="grid-template-columns"] {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
      text-align: center;
    }
    .profile-avatar {
      margin: 0 auto;
    }
    .profile-bio {
      text-align: left;
    }
  }
`

const normalize = (value) => String(value || '').trim().toLowerCase()

const socialLinks = (member) => {
  const links = []

  if (member.github) {
    links.push({
      label: 'GitHub',
      href: member.github.startsWith('http') ? member.github : `https://github.com/${member.github}`,
    })
  }

  if (member.linkedin) {
    links.push({
      label: 'LinkedIn',
      href: member.linkedin.startsWith('http') ? member.linkedin : `https://linkedin.com/in/${member.linkedin}`,
    })
  }

  if (member.portfolio) {
    links.push({
      label: 'Portfolio',
      href: member.portfolio.startsWith('http') ? member.portfolio : `https://${member.portfolio}`,
    })
  }

  if (member.cvFilePath) {
    const rawCvPath = String(member.cvFilePath).trim()
    const cvHref = rawCvPath.startsWith('http')
      ? rawCvPath
      : rawCvPath.startsWith('/')
        ? rawCvPath
        : `/${rawCvPath}`

    links.push({
      label: 'CV',
      href: cvHref,
    })
  }

  return links
}

const ProfileIcon = ({ name, size = 20, color = 'currentColor', strokeWidth = 2 }) => {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
  }

  switch (name) {
    case 'user':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5" /><path d="M4.5 19a7.5 7.5 0 0 1 15 0" /></svg>
    case 'chat':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M20 14a3 3 0 0 1-3 3H9l-5 4V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7Z" /></svg>
    case 'back':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M10 7 5 12l5 5" /><path d="M6 12h13" /></svg>
    default:
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /></svg>
  }
}

const PublicEmployeeProfile = () => {
  const { profileId } = useParams()
  const { users, teamMembers } = useStore()
  const { theme } = useTheme()
  const [publicTeam, setPublicTeam] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    fetchPublicTeamProfiles()
      .then((profiles) => {
        if (isMounted) setPublicTeam(profiles)
      })
      .catch((error) => {
        console.warn('Public team profiles could not be loaded:', error)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const profiles = useMemo(
    () => buildTeamProfiles({ publicTeam, users, teamMembers }),
    [publicTeam, users, teamMembers]
  )

  const member = useMemo(() => {
    const decodedId = normalize(decodeURIComponent(profileId || ''))

    return (
      profiles.find((item) =>
        getTeamMemberKeys(item).some((key) => normalize(key) === decodedId)
      ) || null
    )
  }, [profileId, profiles])

  if (loading) {
    return (
      <>
        <SEO title="Loading Profile | Ashnexa Systems" />
        <style>{CSS}</style>
        <div className="profile-page">
          <div className="profile-hero">
            <div className="profile-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: 'rgb(var(--fg))', marginBottom: 8 }}>Loading Profile...</h2>
              <p style={{ color: 'rgb(var(--fg-muted))', fontSize: 14 }}>Fetching team member information</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!member) {
    return (
      <>
        <SEO title="Profile Not Found | Ashnexa Systems" description="The requested team profile was not found." />
        <style>{CSS}</style>
        <div className="profile-page">
          <div className="profile-hero">
            <div className="profile-container">
              <div className="profile-card" style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#6366f1' }}>
                  <ProfileIcon name="user" size={32} />
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 900, color: 'rgb(var(--fg))', marginBottom: 12 }}>Profile Not Found</h1>
                <p style={{ color: 'rgb(var(--fg-muted))', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                  The requested team member profile is unavailable. Please go back to the About page to view our team.
                </p>
                <Link to="/about#team-section" className="profile-link-btn">
                  <ProfileIcon name="back" size={16} color="white" />
                  Back to Team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const memberImage = getTeamMemberImageUrl(member)
  const profileLinks = socialLinks(member)

  return (
    <>
      <SEO
        title={`${member.displayName} | Ashnexa Systems`}
        description={`View the team profile for ${member.displayName}, ${member.jobTitle}, at Ashnexa Systems.`}
      />
      <style>{CSS}</style>

      <div className="profile-page">
        {/* Hero Section */}
        <section className="profile-hero">
          <div className="profile-container">
            <Link to="/about#team-section" className="profile-link-btn secondary profile-animate" style={{ marginBottom: 24 }}>
              <ProfileIcon name="back" size={16} />
              Back to Team
            </Link>

            <div className="profile-card profile-animate profile-d1" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Cover Background Image Banner */}
              <div style={{ position: 'relative', height: '180px', width: '100%', background: 'linear-gradient(135deg, #3b82f6, #6366f1, #a855f7)', overflow: 'hidden' }}>
                {member.coverImage ? (
                  <img src={member.coverImage} alt="Cover Background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(59,130,246,0.8), rgba(99,102,241,0.8), rgba(168,85,247,0.8))' }} />
                )}
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 32, alignItems: 'start', padding: '0 32px 32px 32px', marginTop: '-50px', position: 'relative', zIndex: 2 }}>
                {/* Avatar */}
                <div className="profile-avatar" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: '4px solid white' }}>
                  {memberImage ? (
                    <img
                      src={memberImage}
                      alt={member.displayName}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div className="profile-fallback" style={{ display: memberImage ? 'none' : 'flex' }}>
                    {(member.displayName || 'U').charAt(0)}
                  </div>
                </div>

                {/* Info */}
                <div style={{ paddingTop: '58px' }}>
                  <div className="profile-badge">
                    {member.isMentor ? '⭐ Mentor Profile' : '👥 Team Profile'}
                  </div>
                  <h1 className="profile-name">{member.displayName}</h1>
                  <div className="profile-role">{member.jobTitle || 'Team Member'}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(var(--bg-subtle), 0.6)', fontSize: 12, fontWeight: 600, color: 'rgb(var(--fg-muted))' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                    {member.department || 'Core Team'}
                  </div>
                  <p className="profile-bio">{member.bio || 'Professional team member at Ashnexa Systems.'}</p>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="profile-link-btn">
                        <ProfileIcon name="chat" size={16} color="white" />
                        Contact via Email
                      </a>
                    )}
                    <Link to="/contact" className="profile-link-btn secondary">
                      <ProfileIcon name="chat" size={16} />
                      Contact Team
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats & Links Section */}
        <section style={{ padding: 'clamp(40px, 6vw, 60px) 0' }}>
          <div className="profile-container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
              {/* Stats */}
              <div className="profile-card profile-animate profile-d2">
                <h2 className="profile-section-title">Profile Details</h2>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div className="profile-stat">
                    <div className="profile-stat-value">{member.jobTitle || 'Team Member'}</div>
                    <div className="profile-stat-label">Role</div>
                  </div>
                  <div className="profile-stat">
                    <div className="profile-stat-value">{member.department || 'Core Team'}</div>
                    <div className="profile-stat-label">Department</div>
                  </div>
                  <div className="profile-stat">
                    <div className="profile-stat-value">{member.isMentor ? 'Mentor' : 'Active'}</div>
                    <div className="profile-stat-label">Status</div>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="profile-card profile-animate profile-d3">
                <h2 className="profile-section-title">Connect & Resources</h2>
                {profileLinks.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {profileLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '12px 16px',
                          background: 'rgba(var(--bg-subtle), 0.6)',
                          border: '1px solid rgba(var(--border), 0.6)',
                          borderRadius: 12,
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'rgb(var(--fg))',
                          textDecoration: 'none',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(4px)'
                          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)'
                          e.currentTarget.style.borderColor = 'rgba(var(--border), 0.6)'
                        }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }} />
                        {link.label}
                        <span style={{ marginLeft: 'auto', fontSize: 16 }}>→</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: 20, background: 'rgba(var(--bg-subtle), 0.5)', border: '1px solid rgba(var(--border), 0.5)', borderRadius: 12, textAlign: 'center', fontSize: 13, color: 'rgb(var(--fg-muted))' }}>
                    No public links available
                  </div>
                )}

                {/* Info Card */}
                <div style={{ marginTop: 20, padding: 16, background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(59, 130, 246, 0.08))', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgb(var(--fg))', marginBottom: 6 }}>🎯 Why Team Profiles Matter</div>
                  <p style={{ fontSize: 12, color: 'rgb(var(--fg-muted))', lineHeight: 1.65 }}>
                    Public team profiles build trust and credibility, showing the expertise behind Ashnexa Systems's projects and mentorship programs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default PublicEmployeeProfile
