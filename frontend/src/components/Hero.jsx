import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { useStore } from '../store/StoreContext'
import SEO from './SEO'
import msmeQR from '../assets/msme-qr.png'
import msmeLogo from '../assets/msme.png'

/* ══════════════════════════════════════════════════════════════
   INLINE STYLES — No external CSS dependencies
══════════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');

  .hp { font-family:'Inter',sans-serif; color:#0f172a; }
  .hp * { box-sizing:border-box; margin:0; padding:0; }

  /* ── Animations ── */
  @keyframes hp-up   { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:none} }
  @keyframes hp-pulse{ 0%,100%{box-shadow:0 0 0 3px rgba(34,197,94,.18)} 50%{box-shadow:0 0 0 8px rgba(34,197,94,.06)} }
  @keyframes hp-float{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes hp-shine{ 0%{transform:translateX(-100%) skewX(-18deg)} 100%{transform:translateX(260%) skewX(-18deg)} }
  @keyframes hp-spin  { to{transform:rotate(360deg)} }
  @keyframes hp-bounce{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }

  .hp-in  { animation:hp-up .65s cubic-bezier(.22,1,.36,1) both; }
  .d1{animation-delay:.06s} .d2{animation-delay:.14s} .d3{animation-delay:.24s}
  .d4{animation-delay:.34s} .d5{animation-delay:.46s} .d6{animation-delay:.60s}
  .d7{animation-delay:.76s}

  /* ── Gradient text ── */
  .hp-grad {
    background:linear-gradient(130deg,#1d4ed8 0%,#4f46e5 50%,#7c3aed 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  /* ── Section pill ── */
  .hp-pill {
    display:inline-flex; align-items:center; gap:7px;
    padding:5px 16px; border-radius:999px;
    background:rgba(99,102,241,.08); border:1px solid rgba(99,102,241,.18);
    font-size:11px; font-weight:700; letter-spacing:.07em;
    text-transform:uppercase; color:#6366f1; margin-bottom:12px;
  }

  /* ── CTA Primary ── */
  .hp-cta-primary {
    display:inline-flex; align-items:center; gap:9px;
    padding:14px 30px; border-radius:999px;
    background:linear-gradient(135deg,#1d4ed8,#6366f1);
    color:white; font-weight:700; font-size:15px;
    text-decoration:none; border:none; cursor:pointer;
    box-shadow:0 6px 24px rgba(29,78,216,.36),inset 0 1px 0 rgba(255,255,255,.18);
    transition:transform .28s,box-shadow .28s; position:relative; overflow:hidden;
  }
  .hp-cta-primary::after {
    content:''; position:absolute; top:0; left:0; width:38%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);
    animation:hp-shine 2.8s infinite;
  }
  .hp-cta-primary:hover { transform:translateY(-3px); box-shadow:0 14px 38px rgba(29,78,216,.46); }

  /* ── CTA Secondary ── */
  .hp-cta-secondary {
    display:inline-flex; align-items:center; gap:9px;
    padding:14px 28px; border-radius:999px;
    background:white; border:1.5px solid rgba(29,78,216,.22);
    color:#1d4ed8; font-weight:700; font-size:15px;
    text-decoration:none; cursor:pointer;
    box-shadow:0 4px 16px rgba(29,78,216,.1);
    transition:transform .28s,box-shadow .28s,background .25s;
  }
  .hp-cta-secondary:hover { transform:translateY(-3px); background:#eff6ff; box-shadow:0 10px 28px rgba(29,78,216,.18); }

  /* ── Glass card ── */
  .hp-glass {
    background:rgba(255,255,255,.82);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
    border:1px solid rgba(255,255,255,.95);
    border-radius:22px;
    box-shadow:0 4px 24px rgba(29,78,216,.07);
    transition:transform .32s,box-shadow .32s,border-color .32s;
    position:relative; overflow:hidden;
  }
  .hp-glass::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(29,78,216,.022) 0%,transparent 55%);
    pointer-events:none;
  }
  .hp-glass:hover {
    transform:translateY(-6px);
    border-color:rgba(99,102,241,.22);
    box-shadow:0 16px 48px rgba(29,78,216,.12);
  }

  /* ── Section title ── */
  .hp-stitle {
    font-family:'Syne',sans-serif; font-weight:800;
    font-size:clamp(1.5rem,3.8vw,2.3rem);
    color:#0f172a; letter-spacing:-.025em; line-height:1.18;
  }

  /* ── Divider ── */
  .hp-div {
    height:1px; margin:clamp(48px,7vw,72px) 0;
    background:linear-gradient(90deg,transparent,rgba(29,78,216,.15),rgba(99,102,241,.12),transparent);
  }

  /* ── Internship card top bar ── */
  .hp-icard {
    padding:28px 24px;
    border-radius:20px;
    background:rgba(255,255,255,.85);
    border:1px solid rgba(255,255,255,.96);
    box-shadow:0 4px 22px rgba(29,78,216,.07);
    transition:transform .3s,box-shadow .3s,border-color .3s;
    position:relative; overflow:hidden;
  }
  .hp-icard::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
  }
  .hp-icard:hover { transform:translateY(-7px); box-shadow:0 18px 48px rgba(29,78,216,.13); border-color:rgba(99,102,241,.24); }

  /* ── Why choose item ── */
  .hp-why-item {
    display:flex; align-items:flex-start; gap:14px;
    padding:20px 22px; border-radius:18px;
    background:rgba(255,255,255,.8);
    border:1px solid rgba(255,255,255,.96);
    box-shadow:0 2px 14px rgba(29,78,216,.06);
    transition:transform .28s,box-shadow .28s;
  }
  .hp-why-item:hover { transform:translateY(-4px); box-shadow:0 10px 32px rgba(29,78,216,.1); }
  .hp-why-icon {
    width:48px; height:48px; border-radius:14px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; font-size:22px;
  }

  /* ── Testimonial card ── */
  .hp-tcard {
    padding:26px 24px; border-radius:20px;
    background:rgba(255,255,255,.85);
    border:1px solid rgba(255,255,255,.96);
    box-shadow:0 4px 20px rgba(29,78,216,.07);
    transition:transform .3s,box-shadow .3s;
    position:relative;
  }
  .hp-tcard::before {
    content:'"'; position:absolute; top:14px; left:20px;
    font-size:4rem; color:rgba(99,102,241,.15); line-height:1;
    font-family:'Syne',sans-serif; font-weight:800;
  }
  .hp-tcard:hover { transform:translateY(-5px); box-shadow:0 14px 40px rgba(29,78,216,.11); }

  /* ── Trust / MSME bar ── */
  .hp-trust {
    background:linear-gradient(135deg,#1e3a8a,#312e81);
    border-radius:20px; padding:clamp(22px,4vw,32px);
    display:flex; align-items:center; gap:20px; flex-wrap:wrap;
    box-shadow:0 8px 36px rgba(30,58,138,.3);
    position:relative; overflow:hidden;
  }
  .hp-trust::before {
    content:''; position:absolute;
    width:280px; height:280px; border-radius:50%;
    background:rgba(255,255,255,.04); top:-80px; right:-80px; pointer-events:none;
  }

  /* ── Certificate card ── */
  .hp-cert {
    background:linear-gradient(135deg,#f8faff,#eff6ff);
    border:2px dashed rgba(29,78,216,.25);
    border-radius:20px; padding:clamp(24px,4vw,36px);
    text-align:center;
    box-shadow:0 4px 20px rgba(29,78,216,.06);
    transition:transform .3s;
  }
  .hp-cert:hover { transform:scale(1.015); }

  /* ── Stats bar ── */
  .hp-stats {
    display:flex; align-items:stretch; flex-wrap:wrap;
    background:rgba(255,255,255,.8);
    backdrop-filter:blur(20px);
    border:1px solid rgba(255,255,255,.95); border-radius:20px;
    box-shadow:0 4px 24px rgba(29,78,216,.07); overflow:hidden;
  }
  .hp-stat-item {
    flex:1; min-width:160px; padding:clamp(16px,3vw,26px) 20px;
    text-align:center; position:relative;
    transition:background .25s;
  }
  .hp-stat-item:not(:last-child)::after {
    content:''; position:absolute; right:0; top:20%; bottom:20%;
    width:1px; background:rgba(29,78,216,.1);
  }
  .hp-stat-num {
    font-family:'Syne',sans-serif; font-weight:800;
    font-size:clamp(1.5rem,4vw,2.2rem); color:#1d4ed8; line-height:1;
  }
  .hp-stat-label { font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.05em; margin-top:5px; }

  /* ══ MOBILE ══ */
  @media (max-width:768px) {
    .hp-stat-item:not(:last-child)::after { display:none; }
    .hp-stat-item { min-width:50%; border-bottom:1px solid rgba(29,78,216,.06); }
  }
  @media (max-width:480px) {
    .hp-cta-primary, .hp-cta-secondary { width:100%; justify-content:center; padding:13px 20px; font-size:14px; }
    .hp-trust { flex-direction:column; }
    .hp-glass { border-radius:16px; }
  }
`

const SvgIcon = ({ name, size = 20, color = 'currentColor', strokeWidth = 1.9, style = {} }) => {
  const iconName = typeof name === 'string' ? name : ''
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    style,
    'aria-hidden': 'true',
  }

  switch (iconName) {
    case 'academy':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-4 9 4-9 4-9-4Z" /><path d="M7 10.8v3.2c0 1.8 2.7 3.5 5 3.5s5-1.7 5-3.5v-3.2" /><path d="M21 9v5" /></svg>
    case 'projects':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M4 14l4-4 4 4 8-8" /><path d="M15 6h5v5" /><path d="M4 20h16" /></svg>
    case 'briefcase':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="7" width="17" height="11" rx="2.5" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" /><path d="M3.5 11.5h17" /></svg>
    case 'certificate':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="4" width="14" height="16" rx="2.5" /><path d="M9 8h6M9 12h6M9 16h3" /><path d="m15.5 17.5 1.5 2 1.5-2" /></svg>
    case 'mentor':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M4.5 18a4.5 4.5 0 0 1 9 0" /><path d="M16.5 7.5h4M18.5 5.5v4" /></svg>
    case 'clock':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>
    case 'device':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="3.5" width="10" height="17" rx="2.5" /><path d="M11 17.5h2" /></svg>
    case 'status':
      return <svg {...props} viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill={color} fillOpacity="0.18" /><circle cx="10" cy="10" r="4.5" fill={color} /></svg>
    case 'office':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16" /><path d="M6 20V6.5A1.5 1.5 0 0 1 7.5 5H16a2 2 0 0 1 2 2v13" /><path d="M9 9h1M9 12h1M9 15h1M13 9h1M13 12h1M13 15h1" /></svg>
    case 'courses':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v14H7.5A2.5 2.5 0 0 0 5 20V6.5Z" /><path d="M9 8h6M9 11h6" /></svg>
    case 'comingSoon':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M6 9.5h12v4H6z" /><path d="M8 9.5 10 6h4l2 3.5" /><path d="M8 13.5v4M16 13.5v4" /><path d="M8 9.5l2.2 2.2M12 9.5l2.2 2.2M14.8 9.5 17 11.7" /></svg>
    case 'check':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
    case 'trophy':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M8 4h8v2a4 4 0 0 1-8 0V4Z" /><path d="M9 14h6M10 18h4" /><path d="M12 10v4" /><path d="M8 6H5a2 2 0 0 0 2 2h1M16 6h3a2 2 0 0 1-2 2h-1" /></svg>
    case 'rocket':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M14 4c2.8.8 4.6 3.2 5 6-2.2.6-4.6.2-6.4-1.2C10.8 7 10.1 4.7 10 3c1.3-.1 2.7.1 4 .4Z" /><path d="M10.5 9.5 6 14l-1.5 4.5L9 17l4.5-4.5" /><path d="M6.5 10.5 4 8c.6-1.8 2.2-3.4 4-4l2.5 2.5M13.5 17.5 16 20c1.8-.6 3.4-2.2 4-4l-2.5-2.5" /><circle cx="14.5" cy="8.5" r="1.2" fill={color} stroke="none" /></svg>
    case 'trading':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M4 16l4-4 3 3 6-7" /><path d="M13 8h4v4" /><path d="M4 20h16" /></svg>
    case 'web':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="12" rx="2" /><path d="M3.5 9h17M8 19h8" /></svg>
    case 'python':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M9 4.5h3.5A2.5 2.5 0 0 1 15 7v2.5H9a2 2 0 0 0-2 2V14A2.5 2.5 0 0 0 9.5 16.5H13" /><path d="M15 19.5h-3.5A2.5 2.5 0 0 1 9 17v-2.5h6a2 2 0 0 0 2-2V10A2.5 2.5 0 0 0 14.5 7.5H11" /><circle cx="10" cy="7.5" r="0.8" fill={color} stroke="none" /><circle cx="14" cy="16.5" r="0.8" fill={color} stroke="none" /></svg>
    case 'marketing':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M4 14V10a2 2 0 0 1 2-2h2l7-3v14l-7-3H6a2 2 0 0 1-2-2Z" /><path d="M15 10.5a4 4 0 0 1 0 3" /><path d="M17.5 8.5a7 7 0 0 1 0 7" /></svg>
    case 'design':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M12 4a8 8 0 1 0 0 16h1a2 2 0 0 0 2-2 2 2 0 0 1 2-2h1a4 4 0 0 0 0-8 6 6 0 0 0-6-4Z" /><circle cx="7.5" cy="10" r="1" fill={color} stroke="none" /><circle cx="10" cy="7.5" r="1" fill={color} stroke="none" /><circle cx="14" cy="7.5" r="1" fill={color} stroke="none" /><circle cx="16.5" cy="11" r="1" fill={color} stroke="none" /></svg>
    case 'data':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M5 19V11M10 19V7M15 19v-5M20 19V9" /><path d="M3 19h18" /></svg>
    case 'ai':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M12 4.5 13.8 8.2 17.5 10 13.8 11.8 12 15.5 10.2 11.8 6.5 10 10.2 8.2 12 4.5Z" /><path d="M18.2 4.8v2.6M19.5 6.1h-2.6" /><path d="M5.4 15.6v2.2M6.5 16.7H4.3" /></svg>
    default:
      if (iconName.includes('👨') || iconName.includes('ðŸ‘¨')) {
        return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3" /><path d="M4.5 18a4.5 4.5 0 0 1 9 0" /><path d="M16.5 7.5h4M18.5 5.5v4" /></svg>
      }
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v14H7.5A2.5 2.5 0 0 0 5 20V6.5Z" /><path d="M9 8h6M9 11h6M9 14h4" /></svg>
  }
}

const getCourseIconName = (course, catMeta) => {
  const value = `${catMeta?.name || ''} ${catMeta?.icon || ''} ${course?.title || ''}`.toLowerCase()

  if (value.includes('trading') || value.includes('stock') || value.includes('📈')) return 'trading'
  if (value.includes('web') || value.includes('development') || value.includes('💻')) return 'web'
  if (value.includes('python') || value.includes('🐍')) return 'python'
  if (value.includes('marketing') || value.includes('📣')) return 'marketing'
  if (value.includes('design') || value.includes('🎨') || value.includes('ui/ux')) return 'design'
  if (value.includes('excel') || value.includes('data') || value.includes('analytics') || value.includes('📊')) return 'data'
  if (value.includes('ai') || value.includes('artificial intelligence')) return 'ai'

  return 'courses'
}


/* ── Why Choose Us ── */
const WHY = [
  { icon: 'academy', bg: 'rgba(29,78,216,.08)', title: 'Industry-Based Learning', desc: 'Curriculum aligned with current industry demands and real company workflows.', color: '#1d4ed8' },
  { icon: 'projects', bg: 'rgba(124,58,237,.08)', title: 'Real-World Projects', desc: 'Work on live projects that build your portfolio and sharpen your skills.', color: '#7c3aed' },
  { icon: 'certificate', bg: 'rgba(5,150,105,.08)', title: 'Verified Certification', desc: 'Receive a valid, verifiable certificate recognized by organizations nationwide.', color: '#059669' },
  { icon: 'mentor', bg: 'rgba(217,119,6,.08)', title: 'Expert Mentorship', desc: 'Learn directly from experienced professionals with industry backgrounds.', color: '#d97706' },
  { icon: 'clock', bg: 'rgba(220,38,38,.08)', title: 'Flexible Online Schedule', desc: 'Study at your own pace with recorded sessions available 24/7 anytime.', color: '#dc2626' },
  { icon: 'device', bg: 'rgba(8,145,178,.08)', title: 'Dedicated Support', desc: 'Get personalized support from mentors and our responsive team throughout.', color: '#0891b2' },
]


/* ══════════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════════ */
const Hero = () => {
  const [loaded, setLoaded] = useState(false)
  const { courses, courseCategories } = useStore()
  const navigate = useNavigate()

  const activeCourses = useMemo(() => {
    return courses?.filter(c => c.published !== false).slice(0, 3) || []
  }, [courses])

  const getCatMeta = (catId) => {
    return courseCategories?.find(c => c.id === catId) || null
  }

  useEffect(() => { setTimeout(() => setLoaded(true), 80) }, [])

  return (
    <>
      <SEO />
      <style>{CSS}</style>

      {/* Fixed background */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:'linear-gradient(160deg,#f0f7ff 0%,#faf8ff 50%,#eff6ff 100%)' }}>
        <div style={{ position:'absolute', inset:0,
          backgroundImage:'linear-gradient(rgba(29,78,216,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(29,78,216,.03) 1px,transparent 1px)',
          backgroundSize:'56px 56px' }}/>
        <div style={{ position:'absolute', width:480, height:480, borderRadius:'50%', top:'-10%', right:'-5%',
          background:'radial-gradient(circle,rgba(99,102,241,.08),transparent 70%)',
          filter:'blur(60px)', animation:'hp-float 12s ease-in-out infinite', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', width:560, height:560, borderRadius:'50%', bottom:'-8%', left:'-8%',
          background:'radial-gradient(circle,rgba(29,78,216,.07),transparent 70%)',
          filter:'blur(70px)', animation:'hp-float 15s ease-in-out infinite', animationDelay:'-6s', pointerEvents:'none' }}/>
      </div>

      <div className="hp" style={{ position:'relative', zIndex:10 }}>
        <div style={{
          opacity: loaded ? 1 : 0, transform: loaded ? 'none' : 'translateY(16px)',
          transition:'opacity .7s ease,transform .7s ease',
        }}>

          {/* ════════════════════════════════════════════
              HERO SECTION
          ════════════════════════════════════════════ */}
          <section style={{
            minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
            padding:'clamp(100px,13vw,140px) clamp(16px,5vw,28px) clamp(60px,8vw,80px)',
          }}>
            <div style={{ maxWidth:1040, width:'100%', margin:'0 auto', textAlign:'center' }}>
              {/* Status badge */}
              <div className="hp-in d1" style={{ display:'inline-flex', alignItems:'center', gap:8,
                padding:'7px 18px', borderRadius:999, marginBottom:28,
                background:'rgba(255,255,255,.75)', backdropFilter:'blur(12px)',
                border:'1px solid rgba(255,255,255,.9)',
                boxShadow:'0 2px 14px rgba(29,78,216,.1)' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', display:'inline-block', animation:'hp-pulse 2s infinite' }}/>
                <span style={{ fontSize:13, fontWeight:700, color:'#1d4ed8' }}>
                  Applied for AICTE Internship Portal
                </span>
              </div>

              {/* Tagline */}
              <p className="hp-in d1" style={{ fontSize:12, fontWeight:700, color:'#6366f1', letterSpacing:'.12em', textTransform:'uppercase', marginBottom:14 }}>
                Empowering Students with Real-World Skills
              </p>

              {/* Main headline */}
              <h1 className="hp-in d2" style={{
                fontFamily:'Syne,sans-serif', fontWeight:900,
                fontSize:'clamp(2rem,6vw,3.8rem)', color:'#0f172a',
                letterSpacing:'-.045em', lineHeight:1.10, marginBottom:20,
              }}>
                Industry-Oriented{' '}
                <span className="hp-grad">Internship Programs</span>
                <br/>for Future Professionals
              </h1>

              {/* Subheading */}
              <p className="hp-in d3" style={{
                fontSize:'clamp(.95rem,2.2vw,1.15rem)', color:'#475569',
                maxWidth:620, margin:'0 auto 36px', lineHeight:1.85,
              }}>
                Providing practical training in{' '}
                <strong style={{ color:'#1d4ed8' }}>Web Development</strong>,{' '}
                <strong style={{ color:'#7c3aed' }}>AI</strong>,{' '}
                <strong style={{ color:'#059669' }}>Stock Market</strong>, and{' '}
                <strong style={{ color:'#0891b2' }}>Emerging Technologies</strong>
              </p>

              {/* CTA Buttons */}
              <div className="hp-in d4" style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:52 }}>
                <Link to="/signup" className="hp-cta-primary">
                  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                  Apply for Internship
                </Link>
                <a href="#programs" className="hp-cta-secondary">
                  <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                  View Programs
                </a>
              </div>

              {/* Trust pills row */}
              <div className="hp-in d5" style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', maxWidth:720, margin:'0 auto' }}>
                {[
                  { icon:'status', text:'100% Online', bg:'rgba(5,150,105,.07)', color:'#059669', border:'rgba(5,150,105,.18)' },
                  { icon:'office', text:'MSME Govt. Certified', bg:'rgba(124,58,237,.07)', color:'#7c3aed', border:'rgba(124,58,237,.18)' },
                  { icon:'certificate', text:'Verified Certificate', bg:'rgba(29,78,216,.07)', color:'#1d4ed8', border:'rgba(29,78,216,.18)' },
                  { icon:'👨\u200d🏫', text:'Expert Mentorship',  bg:'rgba(217,119,6,.07)',  color:'#b45309', border:'rgba(217,119,6,.18)' },
                ].map(({ icon, text, bg, color, border }) => (
                  <div key={text} style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'9px 18px', borderRadius:999, background:bg, border:`1px solid ${border}`, color, fontWeight:700, fontSize:13 }}>
                    <SvgIcon name={text === 'Expert Mentorship' ? 'mentor' : icon} size={16} color={color} /> {text}
                  </div>
                ))}
              </div>

              <div className="hp-in d6" style={{ marginTop:28 }}>
                <div style={{
                  display:'grid',
                  gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',
                  gap:12,
                  maxWidth:860,
                  margin:'0 auto',
                }}>
                  {[
                    { label:'About', sub:'Founder, team, and public profiles', to:'/about' },
                    { label:'Courses', sub:'Internships and skill tracks', to:'/courses' },
                    { label:'Services', sub:'Business and technical solutions', to:'/services' },
                    { label:'Contact', sub:'Quick enquiry and support', to:'/contact' },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      style={{
                        textDecoration:'none',
                        padding:'16px 18px',
                        borderRadius:20,
                        background:'rgba(255,255,255,.82)',
                        border:'1px solid rgba(255,255,255,.96)',
                        boxShadow:'0 16px 38px -26px rgba(15,23,42,.34)',
                        textAlign:'left',
                        transition:'transform .28s ease, box-shadow .28s ease, border-color .28s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = '0 24px 48px -24px rgba(37,99,235,.24)'
                        e.currentTarget.style.borderColor = 'rgba(59,130,246,.18)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none'
                        e.currentTarget.style.boxShadow = '0 16px 38px -26px rgba(15,23,42,.34)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,.96)'
                      }}
                    >
                      <div style={{ fontSize:15, fontWeight:800, color:'#0f172a', marginBottom:5 }}>{item.label}</div>
                      <div style={{ fontSize:12, lineHeight:1.6, color:'#64748b' }}>{item.sub}</div>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* ════════════════════════════════════════════
              INTERNSHIP PROGRAMS — COMING SOON
          ════════════════════════════════════════════ */}
          <section id="programs" style={{ padding:'0 clamp(16px,5vw,28px) clamp(60px,8vw,80px)' }}>
            <div style={{ maxWidth:1040, margin:'0 auto' }}>

              <div style={{ textAlign:'center', marginBottom:36 }}>
                <div className="hp-pill"><SvgIcon name="academy" size={14} color="currentColor" /> Our Programs</div>
                <h2 className="hp-stitle">Internship <span className="hp-grad">Categories</span></h2>
              </div>

              {/* Programs Cards Container */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'stretch' }}>
                
                {activeCourses.map(course => {
                  const catMeta = getCatMeta(course.category)
                  
                  // Use a default color based on category if available
                  const btnColor = catMeta?.color || '#3b82f6';
                  
                  return (
                    <div key={course.id} style={{
                      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                      padding:'32px 24px',
                      borderRadius:24,
                      background:'rgba(255,255,255,.9)',
                      border:'1px solid rgba(255,255,255,.95)',
                      textAlign:'center',
                      gap:16,
                      boxShadow:'0 10px 30px -10px rgba(0,0,0,0.06)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.3s, box-shadow 0.3s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px -10px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 10px 30px -10px rgba(0,0,0,0.06)'; }}
                    >
                      {/* Badge */}
                      {course.badge && (
                        <div style={{ display:'inline-block', padding:'4px 12px', background: btnColor, color:'white', fontSize:11, fontWeight:800, borderRadius:99, marginBottom:10, letterSpacing:1, textTransform:'uppercase', animation: course.highlighted ? 'hp-pulse 2s infinite' : 'none' }}>
                          {course.badge}
                        </div>
                      )}
                      
                      {/* Icon */}
                      <div style={{
                        width:72,
                        height:72,
                        borderRadius:22,
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        color: btnColor,
                        background:`linear-gradient(145deg, ${btnColor}18, ${btnColor}08)`,
                        border:`1px solid ${btnColor}22`,
                        boxShadow:`inset 0 1px 0 rgba(255,255,255,.8), 0 10px 24px ${btnColor}14`,
                        animation: course.highlighted ? 'hp-float 3s ease-in-out infinite' : 'none',
                      }}>
                        <SvgIcon name={getCourseIconName(course, catMeta)} size={34} color={btnColor} strokeWidth={1.8} />
                      </div>
                      
                      <div>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'clamp(1.2rem,2.5vw,1.6rem)', color:'#0f172a', marginBottom:8 }}>
                          {course.title}
                        </div>
                        <p style={{ fontSize:13, color:'#64748b', lineHeight:1.6, maxWidth:300, margin:'0 auto' }}>
                          {course.description?.substring(0, 80) || 'Master practical skills with our premium program.'}...
                        </p>
                      </div>
                      <Link to={`/courses/${course.slug || course.id}`} style={{ 
                        marginTop:'auto', padding:'10px 24px', background: `linear-gradient(135deg, ${btnColor}, ${btnColor}dd)`, 
                        color:'white', fontWeight:700, borderRadius:99, fontSize:14, textDecoration:'none',
                        boxShadow:`0 4px 14px ${btnColor}40`, transition:'0.3s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                      >
                        Course Details ➔
                      </Link>
                    </div>
                  )
                })}

                {/* Coming Soon / View All banner */}
                <div style={{
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  padding:'32px 24px',
                  borderRadius:24,
                  background:'linear-gradient(135deg,rgba(29,78,216,.03),rgba(99,102,241,.02))',
                  border:'2px dashed rgba(99,102,241,.2)',
                  textAlign:'center',
                  gap:16,
                }}>
                  <div style={{ opacity:0.8, color:'#8b5cf6' }}>
                    <SvgIcon name="comingSoon" size={40} color="#8b5cf6" strokeWidth={1.7} />
                  </div>
                  <div>
                    <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'clamp(1.1rem,2vw,1.4rem)', color:'#334155', marginBottom:6 }}>
                      More Programs <span style={{ color:'#8b5cf6' }}>Soon</span>
                    </div>
                    <p style={{ fontSize:12, color:'#64748b', lineHeight:1.6, maxWidth:320, margin:'0 auto 16px' }}>
                      Web Development, AI, Data Science, UI/UX, and Cyber Security internships launching shortly.
                    </p>
                  </div>
                  
                  <Link to="/courses" className="hp-cta-primary" style={{ marginTop:'auto', padding:'10px 24px', fontSize:14, width:'80%', textAlign:'center', justifyContent: 'center' }}>
                    View All Courses →
                  </Link>
                </div>

              </div>

              {/* Adjust grid to single column on mobile */}
              <style dangerouslySetInnerHTML={{__html:`
                @media (max-width: 768px) {
                  #programs > div > div:nth-child(2) {
                    grid-template-columns: 1fr !important;
                  }
                }
              `}} />

            </div>
          </section>

          <div className="hp-div" style={{ padding:'0 clamp(16px,5vw,28px)' }}/>

          {/* ════════════════════════════════════════════
              WHY CHOOSE US
          ════════════════════════════════════════════ */}
          <section style={{ padding:'0 clamp(16px,5vw,28px) clamp(60px,8vw,80px)' }}>
            <div style={{ maxWidth:1040, margin:'0 auto' }}>

              <div style={{ textAlign:'center', marginBottom:40 }}>
                <div className="hp-pill"><SvgIcon name="check" size={14} color="currentColor" /> Why Choose Us</div>
                <h2 className="hp-stitle">Why <span className="hp-grad">AmitSolutionHub?</span></h2>
                <p style={{ color:'#64748b', fontSize:14, marginTop:10, lineHeight:1.8 }}>
                  We are committed to quality education, real skill-building, and professional growth
                </p>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,290px),1fr))', gap:14 }}>
                {WHY.map(({ icon, bg, title, desc, color }) => (
                  <div key={title} className="hp-why-item">
                    <div className="hp-why-icon" style={{ background:`linear-gradient(145deg, ${bg}, rgba(255,255,255,.7))`, color, border:`1px solid ${color}18`, boxShadow:`inset 0 1px 0 rgba(255,255,255,.7), 0 10px 22px ${color}12` }}>
                      <SvgIcon name={icon} size={22} color={color} strokeWidth={2} />
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, color:'#0f172a', marginBottom:4 }}>{title}</div>
                      <div style={{ fontSize:12, color:'#64748b', lineHeight:1.7 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="hp-div" style={{ padding:'0 clamp(16px,5vw,28px)' }}/>

          {/* ════════════════════════════════════════════
              CERTIFICATE SECTION
          ════════════════════════════════════════════ */}
          <section style={{ padding:'0 clamp(16px,5vw,28px) clamp(60px,8vw,80px)' }}>
            <div style={{ maxWidth:1040, margin:'0 auto' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap:32, alignItems:'center' }}>

                {/* Left text */}
                <div>
                  <div className="hp-pill"><SvgIcon name="certificate" size={14} color="currentColor" /> Certification</div>
                  <h2 className="hp-stitle" style={{ marginBottom:16 }}>
                    Get a <span className="hp-grad">Verified Certificate</span>
                  </h2>
                  <p style={{ color:'#64748b', fontSize:'clamp(.9rem,2vw,1rem)', lineHeight:1.85, marginBottom:20 }}>
                    Upon successful completion of your internship program, you will receive an official, verifiable certificate from <strong style={{ color:'#1d4ed8' }}>AmitSolutionHub</strong> — recognized by companies during job applications.
                  </p>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {[
                      'Certificate issued within 7 days of completion',
                      'Shareable on LinkedIn & resume',
                      'Verifiable online via our portal',
                      'Co-signed by industry mentor',
                    ].map(item => (
                      <div key={item} style={{ fontSize:14, fontWeight:500, color:'#374151', display:'flex', alignItems:'center', gap:8 }}>
                        <SvgIcon name="check" size={16} color="#059669" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/verify" style={{ display:'inline-flex', alignItems:'center', gap:8, marginTop:24, padding:'11px 22px', borderRadius:999, background:'rgba(29,78,216,.08)', border:'1px solid rgba(29,78,216,.2)', color:'#1d4ed8', fontWeight:700, fontSize:14, textDecoration:'none', transition:'all .25s' }}
                    onMouseEnter={e=>{ e.currentTarget.style.background='rgba(29,78,216,.14)'; e.currentTarget.style.transform='translateY(-2px)' }}
                    onMouseLeave={e=>{ e.currentTarget.style.background='rgba(29,78,216,.08)'; e.currentTarget.style.transform='none' }}>
                    Verify a Certificate →
                  </Link>
                </div>

                {/* Right: Certificate preview */}
                <div className="hp-cert">
                  <div style={{ color:'#1d4ed8', marginBottom:12 }}>
                    <SvgIcon name="trophy" size={36} color="#1d4ed8" strokeWidth={1.7} />
                  </div>
                  <div style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'clamp(1rem,2.5vw,1.3rem)', color:'#1d4ed8', marginBottom:4 }}>
                    Certificate of Completion
                  </div>
                  <div style={{ fontSize:12, color:'#94a3b8', fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', marginBottom:16 }}>
                    AmitSolutionHub
                  </div>
                  <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(29,78,216,.2),transparent)', margin:'0 0 16px' }}/>
                  <div style={{ fontFamily:'cursive', fontSize:22, color:'#0f172a', marginBottom:4 }}>Student Name</div>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:16 }}>has successfully completed the</div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#1d4ed8', padding:'8px 20px', borderRadius:999, background:'rgba(29,78,216,.08)', border:'1px solid rgba(29,78,216,.18)', display:'inline-block', marginBottom:16 }}>
                    Web Development Internship
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#94a3b8', fontWeight:600, paddingTop:12, borderTop:'1px solid rgba(29,78,216,.1)' }}>
                    <span>Duration: 6 Weeks</span>
                    <span>MSME Certified</span>
                    <span>Year: 2025</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="hp-div" style={{ padding:'0 clamp(16px,5vw,28px)' }}/>

          {/* ════════════════════════════════════════════
              TRUST / MSME SECTION
          ════════════════════════════════════════════ */}
          <section style={{ padding:'0 clamp(16px,5vw,28px) clamp(60px,8vw,80px)' }}>
            <div style={{ maxWidth:1040, margin:'0 auto' }}>
              <div className="hp-trust">
                <div style={{ background:'rgba(255,255,255,.12)', borderRadius:16, padding:'18px 22px', display:'flex', alignItems:'center', justifyCenter:'center', flexShrink:0, color:'white' }}>
                  <SvgIcon name="office" size={46} color="white" strokeWidth={1.6} />
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:8 }}>
                    <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, color:'white', fontSize:'clamp(1rem,2.5vw,1.25rem)' }}>
                      Officially Recognized &amp; Trusted
                    </span>
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 11px', borderRadius:999, background:'rgba(255,255,255,.18)', color:'white', letterSpacing:'.06em', textTransform:'uppercase' }}>MSME · Govt. of India</span>
                    <span style={{ fontSize:11, fontWeight:700, padding:'3px 11px', borderRadius:999, background:'rgba(255,255,255,.14)', color:'rgba(255,255,255,.9)', letterSpacing:'.06em', textTransform:'uppercase' }}>AICTE (In Process)</span>
                  </div>
                  <p style={{ color:'rgba(255,255,255,.85)', fontSize:'clamp(12px,2vw,14px)', lineHeight:1.8 }}>
                    AmitSolutionHub is a <strong style={{ color:'white' }}>MSME-registered</strong> organization under the Ministry of MSME, Government of India.
                    We are in the process of listing on the <strong style={{ color:'white' }}>AICTE National Internship Portal</strong>.
                  </p>
                  <p style={{ color:'rgba(255,255,255,.85)', fontSize:13, marginTop:8, fontWeight:600 }}>
                    <span style={{ color:'#60a5fa' }}>UDYAM REGISTRATION:</span> UDYAM-GJ-17-0037282
                  </p>
                </div>
                {/* Verification Action / QR */}
                <div style={{ flexShrink:0, display:'flex', gap:12, alignItems:'center' }}>
                  <div style={{ background:'white', borderRadius:10, padding:6, height:80, width:80, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(0,0,0,0.2)' }}>
                    <img src={msmeQR} alt="Scan to Verify MSME" style={{ width:'100%', height:'100%', objectFit:'contain' }} onError={(e) => e.target.style.display='none'} />
                    <div style={{ position:'absolute', width:68, height:68, display:!('src' in document.createElement('img') && msmeQR) ? 'flex' : 'none', alignItems:'center', justifyContent:'center', background:'#f8fafc', fontSize:10, color:'#94a3b8', textAlign:'center', borderRadius:6 }}>QR<br/>Code</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    <div style={{ background:'rgba(255,255,255,.14)', borderRadius:12, padding:'10px 16px', border:'1px solid rgba(255,255,255,.25)', display:'flex', alignItems:'center', gap:10 }}>
                      <img src={msmeLogo} alt="MSME Logo" style={{ height: 28, background:'white', borderRadius:4, padding:2 }} />
                      <div>
                        <div style={{ fontSize:10, color:'rgba(255,255,255,.65)', fontWeight:600, letterSpacing:'.04em', textTransform:'uppercase', marginBottom:2 }}>Status</div>
                        <div style={{ fontSize:12, color:'white', fontWeight:800, display:'flex', alignItems:'center', gap:6 }}>
                          <SvgIcon name="status" size={12} color="#22c55e" />
                          <span>Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>



          {/* ════════════════════════════════════════════
              CONTACT CTA
          ════════════════════════════════════════════ */}
          <section style={{ padding:'0 clamp(16px,5vw,28px) clamp(60px,8vw,80px)' }}>
            <div style={{ maxWidth:1040, margin:'0 auto' }}>
              <div style={{
                textAlign:'center',
                background:'linear-gradient(135deg,rgba(29,78,216,.08),rgba(99,102,241,.06))',
                border:'1px solid rgba(29,78,216,.14)',
                borderRadius:'clamp(20px,4vw,28px)',
                padding:'clamp(40px,7vw,64px) clamp(24px,6vw,50px)',
                position:'relative', overflow:'hidden',
              }}>
                <div style={{ position:'absolute', top:-60, right:-60, width:200, height:200, borderRadius:'50%', background:'rgba(99,102,241,.06)', pointerEvents:'none' }}/>
                <div className="hp-pill" style={{ marginBottom:16 }}><SvgIcon name="rocket" size={14} color="currentColor" /> Join Us Today</div>
                <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'clamp(1.5rem,4vw,2.4rem)', color:'#0f172a', marginBottom:12, letterSpacing:'-.025em', lineHeight:1.18 }}>
                  Start Your <span className="hp-grad">Career Journey</span> Today
                </h2>
                <p style={{ color:'#64748b', fontSize:'clamp(.9rem,2vw,1rem)', lineHeight:1.85, maxWidth:520, margin:'0 auto 32px' }}>
                  Join hundreds of students who have already kickstarted their careers through our structured, industry-aligned internship programs.
                </p>
                <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
                  <Link to="/signup" className="hp-cta-primary">
                    <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                    Apply Now
                  </Link>
                  <Link to="/contact" className="hp-cta-secondary">
                    <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}

export default Hero
