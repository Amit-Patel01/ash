import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import PublicPageShell, { PublicGlassCard, PublicSection, PublicSectionHeading } from '../components/public/PublicPageShell'
import { useStore } from '../store/StoreContext'

const normalizeTeam = (teamMembers = [], users = []) => {
  return teamMembers.map((member) => {
    const userMatch =
      users.find(
        (user) =>
          (user.uid && member.uid && user.uid === member.uid) ||
          (user.email && member.email && user.email === member.email) ||
          (user.employeeId && member.employeeId && user.employeeId === member.employeeId)
      ) || {}

    return {
      ...userMatch,
      ...member,
      displayName: member.displayName || userMatch.displayName || member.name || 'Team Member',
      email: member.email || userMatch.email || '',
      department: member.department || userMatch.department || 'Core Team',
      jobTitle: member.jobTitle || userMatch.jobTitle || userMatch.role || 'Team Member',
      bio:
        member.bio ||
        userMatch.bio ||
        'Focused on practical execution, learner support, and reliable digital delivery.',
    }
  })
}

const getMemberKey = (member) => member.uid || member.employeeId || member.id || member.email || member.displayName

const getImageUrl = (member) => {
  if (member.photoURL) return member.photoURL
  if (member.avatarUrl) return member.avatarUrl
  if (member.avatar) return member.avatar
  if (member.avatarSource === 'custom' && member.customImageUrl) return member.customImageUrl
  
  let gb = member.github;
  if (gb) {
    if (gb.startsWith('http')) {
      if (!gb.endsWith('.png')) {
        gb = gb.replace(/\/$/, '');
        return `${gb}.png`;
      }
      return gb;
    } else {
      return `https://github.com/${gb}.png`;
    }
  }

  if (member.avatarSource === 'linkedin' && member.linkedin && !member.linkedin.includes('linkedin.com')) {
    return member.linkedin
  }
  
  return ''
}

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

  return links
}

const PublicEmployeeProfile = () => {
  const { profileId } = useParams()
  const { teamMembers, users } = useStore()

  const profiles = useMemo(() => normalizeTeam(teamMembers, users), [teamMembers, users])

  const member = useMemo(() => {
    const decodedId = decodeURIComponent(profileId || '')

    return profiles.find((item) => getMemberKey(item) === decodedId) || null
  }, [profileId, profiles])

  if (!member) {
    return (
      <>
        <SEO title="Team Profile | AmitSolutionHub" description="Public team profile was not found." />
        <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(186,230,253,0.55),_transparent_32%),linear-gradient(180deg,_#f8fcff_0%,_#f4f8ff_52%,_#f8fbff_100%)] px-4 pt-32">
          <div className="mx-auto max-w-3xl rounded-[32px] border border-white/90 bg-white/85 p-8 text-center shadow-[0_24px_70px_-34px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-12">
            <div className="text-5xl">🧑‍💼</div>
            <h1 className="mt-4 text-3xl font-black text-slate-900">Profile not found</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The requested employee or mentor profile is unavailable right now. You can go back to the About page and choose another team member.
            </p>
            <Link
              to="/about#team-section"
              className="mt-6 inline-flex rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_-20px_rgba(37,99,235,0.85)]"
            >
              Back to Team
            </Link>
          </div>
        </div>
      </>
    )
  }

  const memberImage = getImageUrl(member)
  const profileLinks = socialLinks(member)
  const expertise = [
    member.department,
    member.jobTitle,
    member.isMentor ? 'Mentor Support' : 'Team Delivery',
    member.email ? 'Direct Contact Info' : 'Public Profile',
  ].filter(Boolean)

  return (
    <>
      <SEO
        title={`${member.displayName} | AmitSolutionHub`}
        description={`View the public profile for ${member.displayName}, ${member.jobTitle}, at AmitSolutionHub.`}
      />

      <PublicPageShell
        badge={member.isMentor ? 'Mentor Profile' : 'Team Profile'}
        title={
          <>
            Meet <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">{member.displayName}</span>
          </>
        }
        description={member.bio}
        actions={[
          { label: 'Contact Team', to: '/contact', icon: '💬' },
          { label: 'Back to About', to: '/about#team-section', variant: 'secondary', icon: '↩' },
        ]}
        pills={expertise}
        stats={[
          { value: member.jobTitle || 'Team Member', label: 'Role' },
          { value: member.department || 'Core Team', label: 'Department' },
          { value: member.isMentor ? 'Mentor' : 'Active', label: 'Status' },
        ]}
        aside={
          <div className="space-y-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Profile Summary</div>
              <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900">Public-facing team identity with a cleaner white-glow presentation</h3>
            </div>

            <div className="rounded-[28px] border border-white/90 bg-white/90 p-5">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-[24px] border border-sky-100 bg-sky-50">
                  {memberImage && (
                    <img 
                      src={memberImage} 
                      alt={member.displayName} 
                      className="h-full w-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }
                      }}
                    />
                  )}
                  <div 
                    className="h-full w-full items-center justify-center bg-gradient-to-br from-sky-500 to-indigo-600 text-2xl font-black text-white"
                    style={{ display: memberImage ? 'none' : 'flex' }}
                  >
                    {(member.displayName || 'U').charAt(0)}
                  </div>
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900">{member.displayName}</div>
                  <div className="text-sm font-semibold text-sky-700">{member.jobTitle}</div>
                  <div className="mt-1 text-sm text-slate-500">{member.department}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                'Professional public profile for trust building',
                'Easy mobile viewing without login access',
                'Useful for team credibility and internship presentation',
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 rounded-3xl border border-slate-200/80 bg-white/90 p-4">
                  <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <p className="text-sm leading-6 text-slate-600">{point}</p>
                </div>
              ))}
            </div>
          </div>
        }
      >
        <PublicSection className="space-y-8">
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <PublicGlassCard className="space-y-6">
              <PublicSectionHeading
                badge="About This Member"
                title="Role, focus, and working style"
                description="This public profile helps visitors understand who supports the work behind your projects, courses, and mentorship delivery."
              />

              <div className="space-y-4">
                <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Current Role</div>
                  <div className="mt-2 text-lg font-black text-slate-900">{member.jobTitle}</div>
                </div>
                <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Department</div>
                  <div className="mt-2 text-lg font-black text-slate-900">{member.department}</div>
                </div>
                <div className="rounded-[26px] border border-slate-200/80 bg-white/90 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Bio</div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{member.bio}</p>
                </div>
              </div>
            </PublicGlassCard>

            <PublicGlassCard className="space-y-6">
              <PublicSectionHeading
                badge="Connect"
                title="Public links and collaboration path"
                description="Direct profile links keep the team section more useful without exposing internal dashboards."
              />

              {profileLinks.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {profileLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:text-sky-700"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  No public social links were added for this profile yet.
                </div>
              )}

              <div className="rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 to-indigo-50 p-5">
                <div className="text-sm font-bold text-slate-900">Why this helps your website</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Visible team profiles make the company look more authentic, structured, and serious when someone reviews your public pages.
                </p>
              </div>

              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex w-full items-center justify-center rounded-[22px] bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_38px_-20px_rgba(37,99,235,0.85)]"
                >
                  Contact via Email
                </a>
              )}
            </PublicGlassCard>
          </div>
        </PublicSection>
      </PublicPageShell>
    </>
  )
}

export default PublicEmployeeProfile
