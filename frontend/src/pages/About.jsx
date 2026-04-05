import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import SEO from '../components/SEO'
import logo from '../assets/logo.png'
import msmeLogo from '../assets/msme.png'
import msmeQR from '../assets/msme-qr.png'

/* ══════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Syne:wght@700;800&display=swap');

  .abt { font-family:'Inter',sans-serif; }
  .abt * { box-sizing:border-box; margin:0; padding:0; }

  /* ── Background ── */
  .abt-bg {
    position:fixed; inset:0; z-index:0; pointer-events:none;
    background:linear-gradient(160deg,#f0f4ff 0%,#faf8ff 50%,#f0f7ff 100%);
  }
  .abt-bg::before {
    content:''; position:absolute; inset:0;
    background:
      radial-gradient(ellipse 65% 55% at 8% 5%,  rgba(99,102,241,.09) 0%,transparent 55%),
      radial-gradient(ellipse 55% 45% at 92% 10%, rgba(59,130,246,.07) 0%,transparent 50%),
      radial-gradient(ellipse 45% 40% at 50% 72%, rgba(139,92,246,.05) 0%,transparent 55%),
      radial-gradient(ellipse 55% 45% at 0% 92%,  rgba(6,182,212,.06)  0%,transparent 50%);
  }
  .abt-grid {
    position:absolute; inset:0;
    background-image:
      linear-gradient(rgba(99,102,241,.032) 1px,transparent 1px),
      linear-gradient(90deg,rgba(99,102,241,.032) 1px,transparent 1px);
    background-size:56px 56px;
  }

  /* ── Keyframes ── */
  @keyframes abt-up    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
  @keyframes abt-spin  { to{transform:translate(-50%,-50%) rotate(360deg)} }
  @keyframes abt-spinr { to{transform:translate(-50%,-50%) rotate(-360deg)} }
  @keyframes abt-pulse { 0%,100%{box-shadow:0 0 0 3px rgba(34,197,94,.2)} 50%{box-shadow:0 0 0 7px rgba(34,197,94,.07)} }
  @keyframes abt-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes abt-shine {
    0%   { transform:translateX(-100%) skewX(-20deg); }
    100% { transform:translateX(250%)  skewX(-20deg); }
  }

  .abt-in { animation:abt-up .65s cubic-bezier(.22,1,.36,1) both; }
  .d1{animation-delay:.06s} .d2{animation-delay:.14s} .d3{animation-delay:.24s}
  .d4{animation-delay:.36s} .d5{animation-delay:.50s} .d6{animation-delay:.66s}

  /* ── Glass card ── */
  .abt-glass {
    background:rgba(255,255,255,.78);
    backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px);
    border:1px solid rgba(255,255,255,.92);
    border-radius:22px;
    box-shadow:0 4px 24px rgba(99,102,241,.07),0 1px 4px rgba(0,0,0,.04);
    transition:transform .32s ease,box-shadow .32s ease,border-color .32s ease;
    position:relative; overflow:hidden;
  }
  .abt-glass::before {
    content:''; position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(99,102,241,.025) 0%,transparent 55%);
    pointer-events:none;
  }
  .abt-glass:hover {
    transform:translateY(-5px);
    border-color:rgba(99,102,241,.22);
    box-shadow:0 14px 44px rgba(99,102,241,.11),0 4px 12px rgba(0,0,0,.06);
  }

  /* ── Brand pill ── */
  .abt-pill {
    display:inline-flex; align-items:center; gap:7px;
    padding:5px 16px; border-radius:999px;
    background:rgba(99,102,241,.08); border:1px solid rgba(99,102,241,.18);
    font-size:11px; font-weight:700; letter-spacing:.07em;
    text-transform:uppercase; color:#6366f1;
  }
  .abt-pill-dot { width:6px;height:6px;border-radius:50%;background:#22c55e;animation:abt-pulse 2s infinite; }

  /* ── Gradient text ── */
  .abt-grad {
    background:linear-gradient(130deg,#6366f1 0%,#3b82f6 45%,#8b5cf6 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  /* ── Avatar frame ── */
  .abt-av-frame {
    background:linear-gradient(135deg,#6366f1,#3b82f6,#8b5cf6);
    padding:3px; border-radius:50%;
    box-shadow:0 0 0 9px rgba(99,102,241,.08),0 20px 64px rgba(99,102,241,.24);
    transition:transform .4s,box-shadow .4s;
  }
  .abt-av-frame:hover {
    transform:scale(1.06);
    box-shadow:0 0 0 14px rgba(99,102,241,.1),0 28px 80px rgba(99,102,241,.32);
  }
  .abt-av-frame img { border-radius:50%; display:block; background:#e0e7ff; }

  /* ── Social btn ── */
  .abt-soc {
    display:inline-flex; align-items:center; gap:7px;
    padding:9px 16px; border-radius:12px;
    font-size:13px; font-weight:600;
    text-decoration:none; border:1px solid; cursor:pointer;
    transition:transform .22s ease,box-shadow .22s ease,background .22s ease;
  }
  .abt-soc:hover { transform:translateY(-2px); }

  /* ── CTA button ── */
  .abt-btn {
    display:inline-flex; align-items:center; gap:9px;
    padding:13px 28px; border-radius:999px;
    background:linear-gradient(135deg,#6366f1,#3b82f6);
    color:white; font-weight:700; font-size:14px;
    text-decoration:none; border:none; cursor:pointer;
    box-shadow:0 4px 20px rgba(99,102,241,.35),inset 0 1px 0 rgba(255,255,255,.15);
    transition:transform .25s,box-shadow .25s; position:relative; overflow:hidden;
  }
  .abt-btn::after {
    content:''; position:absolute; top:0; left:0; width:40%; height:100%;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent);
    animation:abt-shine 2.5s infinite;
  }
  .abt-btn:hover { transform:translateY(-3px); box-shadow:0 12px 36px rgba(99,102,241,.45); }

  /* ── Divider ── */
  .abt-div {
    height:1px; margin:clamp(36px,5vw,56px) 0;
    background:linear-gradient(90deg,transparent,rgba(99,102,241,.15),rgba(59,130,246,.12),transparent);
  }

  /* ── Section title ── */
  .abt-stitle {
    font-family:'Syne',sans-serif; font-weight:800;
    font-size:clamp(1.45rem,3.5vw,2.1rem);
    color:#0f172a; letter-spacing:-.02em;
  }

  /* ── Trust card ── */
  .abt-trust {
    display:flex; align-items:center; gap:13px;
    padding:16px 18px; border-radius:18px;
    background:rgba(255,255,255,.8);
    border:1px solid rgba(255,255,255,.95);
    box-shadow:0 2px 14px rgba(99,102,241,.07);
    transition:transform .3s,box-shadow .3s;
  }
  .abt-trust:hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(99,102,241,.12); }
  .abt-trust-icon {
    width:46px; height:46px; border-radius:13px;
    display:flex; align-items:center; justify-content:center;
    font-size:22px; flex-shrink:0;
  }

  /* ── Gradient MV card ── */
  .abt-mv {
    padding:clamp(22px,4vw,32px); border-radius:22px; color:white;
    position:relative; overflow:hidden;
    transition:transform .3s,box-shadow .3s;
  }
  .abt-mv::after {
    content:''; position:absolute; border-radius:50%;
    width:150px; height:150px; background:rgba(255,255,255,.07);
    bottom:-45px; right:-45px; pointer-events:none;
  }
  .abt-mv:hover { transform:translateY(-5px); }

  /* ── MSME Banner ── */
  .abt-msme {
    background:linear-gradient(135deg,#7c3aed,#6d28d9);
    border-radius:18px; padding:clamp(18px,4vw,26px);
    display:flex; align-items:center; gap:18px; flex-wrap:wrap;
    box-shadow:0 8px 32px rgba(124,58,237,.28);
    position:relative; overflow:hidden;
    transition:transform .3s,box-shadow .3s;
  }
  .abt-msme::before {
    content:''; position:absolute;
    width:220px; height:220px; border-radius:50%;
    background:rgba(255,255,255,.06); top:-70px; right:-70px; pointer-events:none;
  }
  .abt-msme:hover { transform:translateY(-3px); box-shadow:0 12px 40px rgba(124,58,237,.38); }

  /* ══════════════════════════
     PREMIUM TEAM CARDS
  ══════════════════════════ */
  .abt-team-grid {
    display:grid;
    grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));
    gap:24px;
  }

  .abt-tc {
    background:rgba(255,255,255,.82);
    backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px);
    border:1px solid rgba(255,255,255,.95);
    border-radius:24px;
    box-shadow:0 4px 24px rgba(99,102,241,.08);
    transition:transform .35s ease,box-shadow .35s ease,border-color .35s ease;
    overflow:hidden; position:relative;
    display:flex; flex-direction:column; align-items:center;
    padding:0 0 24px 0;
  }
  /* top gradient bar */
  .abt-tc::before {
    content:''; position:absolute; top:0; left:0; right:0; height:4px;
    background:linear-gradient(90deg,#6366f1,#3b82f6,#8b5cf6);
  }
  .abt-tc:hover {
    transform:translateY(-8px);
    border-color:rgba(99,102,241,.25);
    box-shadow:0 20px 56px rgba(99,102,241,.14),0 4px 16px rgba(0,0,0,.07);
  }

  /* photo wrapper */
  .abt-tc-photo-wrap {
    width:96px; height:96px; margin:32px auto 16px;
    border-radius:50%; flex-shrink:0; position:relative;
  }
  .abt-tc-photo-wrap::before {
    content:''; position:absolute; inset:-3px; border-radius:50%;
    background:linear-gradient(135deg,#6366f1,#3b82f6,#8b5cf6);
    z-index:0;
  }
  .abt-tc-photo-wrap img,
  .abt-tc-photo-wrap .abt-tc-init {
    position:relative; z-index:1; width:100%; height:100%;
    border-radius:50%; object-fit:cover; background:#e0e7ff;
    border:3px solid white;
  }
  .abt-tc-photo-wrap .abt-tc-init {
    display:flex; align-items:center; justify-content:center;
    font-size:2rem; font-weight:900; color:white;
    font-family:'Syne',sans-serif;
    background:linear-gradient(135deg,#6366f1,#3b82f6);
  }

  /* online dot */
  .abt-tc-dot {
    position:absolute; bottom:4px; right:4px; z-index:10;
    width:16px; height:16px; border-radius:50%;
    background:#22c55e; border:2px solid white;
    box-shadow:0 0 0 3px rgba(34,197,94,.2);
    animation:abt-pulse 2s infinite;
  }

  /* role badge */
  .abt-tc-role-badge {
    font-size:10px; font-weight:800; letter-spacing:.07em;
    text-transform:uppercase; padding:3px 12px; border-radius:999px;
    background:rgba(99,102,241,.08); color:#6366f1;
    border:1px solid rgba(99,102,241,.18); margin-bottom:8px;
  }

  /* name */
  .abt-tc-name {
    font-family:'Syne',sans-serif; font-weight:800;
    font-size:clamp(1rem,2vw,1.1rem); color:#0f172a;
    text-align:center; padding:0 20px; line-height:1.25;
  }

  /* job title */
  .abt-tc-job {
    font-size:11px; font-weight:700; color:#6366f1;
    text-transform:uppercase; letter-spacing:.07em;
    text-align:center; padding:0 20px; margin:5px 0 12px;
  }

  /* divider line */
  .abt-tc-hr {
    width:40px; height:2px; border-radius:99px;
    background:linear-gradient(90deg,#6366f1,#3b82f6);
    margin:0 auto 14px;
  }

  /* bio */
  .abt-tc-bio {
    font-size:12px; color:#64748b; line-height:1.75;
    text-align:center; padding:0 20px 14px;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
    overflow:hidden;
  }

  /* skill tags */
  .abt-tc-skills {
    display:flex; flex-wrap:wrap; gap:6px;
    justify-content:center; padding:0 16px 14px;
  }
  .abt-tc-skill {
    font-size:10px; font-weight:700; padding:3px 10px;
    border-radius:999px; background:#f0f0ff;
    color:#6366f1; border:1px solid rgba(99,102,241,.15);
  }

  /* social icons */
  .abt-tc-socials {
    display:flex; gap:8px; justify-content:center;
    padding:0 16px;
  }
  .abt-tc-soc-btn {
    width:32px; height:32px; border-radius:10px;
    display:flex; align-items:center; justify-content:center;
    transition:transform .2s,opacity .2s;
    text-decoration:none;
  }
  .abt-tc-soc-btn:hover { transform:scale(1.18); opacity:.9; }

  /* ── AICTE credibility bar ── */
  .abt-aicte-bar {
    display:flex; align-items:stretch; gap:0;
    background:rgba(255,255,255,.78);
    backdrop-filter:blur(20px);
    border:1px solid rgba(255,255,255,.92);
    border-radius:20px;
    box-shadow:0 4px 24px rgba(99,102,241,.07);
    overflow:hidden;
  }
  .abt-aicte-item {
    flex:1; display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    padding:clamp(14px,3vw,22px) clamp(10px,2vw,20px);
    text-align:center; position:relative;
    transition:background .25s;
  }
  .abt-aicte-item:not(:last-child)::after {
    content:''; position:absolute; right:0; top:20%; bottom:20%;
    width:1px; background:rgba(99,102,241,.1);
  }
  .abt-aicte-item:hover { background:rgba(99,102,241,.03); }
  .abt-aicte-num {
    font-family:'Syne',sans-serif; font-weight:800;
    font-size:clamp(1.4rem,4vw,2rem); color:#6366f1; line-height:1;
  }
  .abt-aicte-label {
    font-size:11px; font-weight:600; color:#64748b;
    text-transform:uppercase; letter-spacing:.05em; margin-top:4px;
  }

  /* scrollbar hide */
  .ab-noscroll::-webkit-scrollbar{display:none}
  .ab-noscroll{-ms-overflow-style:none;scrollbar-width:none}

  /* ── 3D CAROUSEL STYLES ── */
  .abt-slider-wrap {
    position:relative; width:100%; max-width:1100px; margin:0 auto;
    height:540px; display:flex; align-items:center; justify-content:center;
    overflow:visible; perspective: 1000px;
  }
  .abt-tcard-new {
    position:absolute;
    width:280px; height:440px;
    background:white; border-radius:12px;
    box-shadow:0 15px 35px rgba(0,0,0,0.08); 
    transition:transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease;
    display:flex; flex-direction:column; overflow:hidden;
  }
  .abt-tcard-img-wrap {
    width:100%; height:240px; position:relative; background:#e2e8f0; flex-shrink:0;
  }
  .abt-tcard-img-wrap img, .abt-tc-init-new {
    width:100%; height:100%; object-fit:cover;
  }
  .abt-tc-init-new {
    display:flex; align-items:center; justify-content:center;
    font-size:3rem; font-weight:800; color:white;
    background:linear-gradient(135deg,#6366f1,#3b82f6);
  }
  .abt-tcard-role {
    position:absolute; bottom:-14px; left:16px;
    background:#dc2626; color:white;
    font-size:11px; font-weight:700;
    padding:6px 14px; border-radius:6px;
    box-shadow:0 4px 10px rgba(220,38,38,0.3);
    z-index:2; text-transform:uppercase; letter-spacing:0.04em;
  }
  .abt-tcard-body {
    flex:1; padding:28px 20px 20px;
    display:flex; flex-direction:column;
    text-align:center; align-items:center;
    background:white;
  }
  .abt-tcard-name {
    color:#be123c; font-family:'Syne',sans-serif;
    font-size:22px; font-weight:700; margin-bottom:10px;
  }
  .abt-tcard-bio {
    font-size:13px; color:#64748b; line-height:1.6;
    display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;
    margin-bottom:14px; flex:1;
  }
  .slider-btn {
    position:absolute; top:50%; transform:translateY(-50%);
    width:48px; height:48px; background:white;
    border-radius:50%; display:flex; align-items:center; justify-content:center;
    box-shadow:0 4px 16px rgba(0,0,0,0.08); border:1px solid #f1f5f9;
    cursor:pointer; z-index:20; transition:all 0.2s; color:#0f172a;
  }
  .slider-btn:hover { background:#f8fafc; transform:translateY(-50%) scale(1.08); box-shadow:0 6px 20px rgba(0,0,0,0.12); }
  .slider-btn.prev { left:10px; }
  .slider-btn.next { right:10px; }
  .slider-btn:active { transform:translateY(-50%) scale(0.95); }

  /* ══ MOBILE RESPONSIVE ══ */
  @media (min-width:768px) {
    .abt-tcard-new { width:320px; height:470px; }
    .abt-tcard-img-wrap { height:260px; }
    .slider-btn.prev { left:40px; }
    .slider-btn.next { right:40px; }
  }
  @media (max-width:768px) {
    .abt-aicte-bar { flex-wrap:wrap; }
    .abt-aicte-item { min-width:50%; }
    .abt-aicte-item:not(:last-child)::after { display:none; }
  }
  @media (max-width:480px) {
    .abt-soc  { padding:8px 11px; font-size:12px; }
    .abt-btn  { padding:12px 20px; font-size:13px; }
    .abt-trust { flex-direction:column; text-align:center; padding:18px 14px; }
    .abt-msme { flex-direction:column; }
    
    .slider-btn.prev { left:0px; width:40px; height:40px; }
    .slider-btn.next { right:0px; width:40px; height:40px; }
    .abt-tcard-new { width:260px; height:420px; }
    .abt-tcard-img-wrap { height:220px; }
    .abt-slider-wrap { height:480px; }
  }
`

/* ══ Typing hook ══ */
function useTyping(text, speed = 52, delay = 800) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => {
      const id = setInterval(() => setN(c => { if (c >= text.length) { clearInterval(id); return c } return c + 1 }), speed)
      return () => clearInterval(id)
    }, delay)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line
  return text.slice(0, n)
}

/* ══ Trust Badge Data ══ */
const TRUST_BADGES = [
  { icon: '🏢', bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', title: 'MSME Certified', desc: 'Officially registered under Ministry of MSME, Govt. of India' },
  { icon: '✅', bg: 'linear-gradient(135deg,#10b981,#059669)', title: 'Trusted by Clients',  desc: 'Serving businesses & individuals across India consistently' },
  { icon: '🔒', bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', title: 'Secure & Reliable', desc: 'Industry-standard security in every project we deliver' },
  { icon: '⚡', bg: 'linear-gradient(135deg,#f59e0b,#d97706)', title: '24/7 Support Ready', desc: 'Round-the-clock technical assistance for all our clients' },
]

/* ══ AICTE Credibility Numbers ══ */
const AICTE_STATS = [
  { num: '3+',   label: 'Years Active' },
  { num: '50+',  label: 'Projects Done' },
  { num: '100%', label: 'Client Trust' },
  { num: 'MSME', label: 'Govt. Certified' },
]

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
const About = () => {
  const { users, teamMembers } = useStore()
  const [loaded, setLoaded] = useState(false)
  const [activeIndexTeam, setActiveIndexTeam] = useState(0)
  const [activeIndexMentor, setActiveIndexMentor] = useState(0)
  const role = useTyping('Full-Stack Developer & Tech Entrepreneur')

  /* ── Team merge (real Firebase data only) ── */
  const finalTeam = (() => {
    const out = [], seen = new Set()
    const safeT = Array.isArray(teamMembers) ? teamMembers : []
    const safeU = Array.isArray(users) ? users : []
    safeT.forEach(m => {
      if (!m) return
      const em = (m.email || '').toLowerCase()
      const lu = safeU.find(u =>
        (u.employeeId && m.employeeId && u.employeeId === m.employeeId) ||
        (u.email && em && u.email.toLowerCase() === em)
      )
      if (lu) {
        out.push({ ...m, ...lu, displayName: lu.displayName || m.name, jobTitle: lu.jobTitle || m.role, id: m.id || lu.uid })
        if (em) seen.add(em)
      } else {
        out.push({ ...m, displayName: m.name, jobTitle: m.role })
        if (em) seen.add(em)
      }
    })
    safeU.forEach(u => {
      if (!u) return
      const e = (u.email || '').toLowerCase()
      if (u.showOnTeam && u.status === 'active' && !seen.has(e))
        out.push({ ...u, displayName: u.displayName, jobTitle: u.jobTitle, id: u.uid || u.id })
    })
    return out
  })()

  const mentors = finalTeam.filter(m => m.isMentor === true);

  const regularTeam = finalTeam.filter(m => !m.isMentor);

  const getImageUrl = m => {
    if (!m) return null
    if (m.avatarSource === 'custom' && m.customImageUrl) return m.customImageUrl
    if (m.avatarSource === 'linkedin' && m.linkedin && !m.linkedin.includes('linkedin.com')) return m.linkedin
    if (m.github) return m.github.startsWith('http') ? m.github : `https://github.com/${m.github}.png`
    return null
  }

  const nextSlideTeam = () => setActiveIndexTeam(i => (regularTeam.length > 0 ? (i + 1) % regularTeam.length : 0))
  const prevSlideTeam = () => setActiveIndexTeam(i => (regularTeam.length > 0 ? (i === 0 ? regularTeam.length - 1 : i - 1) : 0))

  const nextSlideMentor = () => setActiveIndexMentor(i => (mentors.length > 0 ? (i + 1) % mentors.length : 0))
  const prevSlideMentor = () => setActiveIndexMentor(i => (mentors.length > 0 ? (i === 0 ? mentors.length - 1 : i - 1) : 0))

  const renderSlider = (teamArray, activeIdx, prevFn, nextFn) => (
    <div className="abt-slider-wrap">
      {teamArray.length > 1 && (
        <button className="slider-btn prev" onClick={prevFn}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
      )}

      {teamArray.map((m, i) => {
        const imgUrl = getImageUrl(m)
        const total = teamArray.length;
        let diff = (i - activeIdx) % total;
        if (diff < -Math.floor(total/2)) diff += total;
        if (diff > Math.floor(total/2)) diff -= total;
        
        const absDiff = Math.abs(diff);
        let xOffset = diff * 290;
        let scale = 1 - absDiff * 0.15;
        let opacity = 1 - absDiff * 0.4;
        let zIndex = 10 - absDiff;

        if (absDiff > 1) {
          opacity = 0;
        }

        return (
          <div key={m.uid || m.id} className="abt-tcard-new" style={{
            transform: `translateX(${xOffset}px) scale(${scale})`,
            opacity: opacity,
            zIndex: zIndex,
            pointerEvents: absDiff === 0 ? 'auto' : 'none'
          }}>
            <div className="abt-tcard-img-wrap">
              {imgUrl
                ? <img src={imgUrl} alt={m.displayName} loading="lazy" />
                : <div className="abt-tc-init-new">{(m.displayName || 'U').charAt(0)}</div>
              }
              <div className="abt-tcard-role">{m.jobTitle || m.role || 'Team Member'}</div>
            </div>

            <div className="abt-tcard-body">
              <h3 className="abt-tcard-name">{m.displayName}</h3>
              <p className="abt-tcard-bio">{m.bio || 'Passionate about building digital solutions that make an impact.'}</p>
              
              {(m.github || m.linkedin || m.portfolio) && (
                <div className="abt-tc-socials" style={{ marginTop: 'auto' }}>
                  {m.github && (
                    <a href={m.github.startsWith('http') ? m.github : `https://github.com/${m.github}`}
                      target="_blank" rel="noreferrer" className="abt-tc-soc-btn" style={{ background:'#0f172a' }}>
                      <svg width="15" height="15" fill="white" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                    </a>
                  )}
                  {m.linkedin && m.linkedin.includes('linkedin.com') && (
                    <a href={m.linkedin.startsWith('http') ? m.linkedin : `https://linkedin.com/in/${m.linkedin}`}
                      target="_blank" rel="noreferrer" className="abt-tc-soc-btn" style={{ background:'#0a66c2' }}>
                      <svg width="15" height="15" fill="white" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                  )}
                  {m.portfolio && (
                    <a href={m.portfolio.startsWith('http') ? m.portfolio : `https://${m.portfolio}`}
                      target="_blank" rel="noreferrer" className="abt-tc-soc-btn" style={{ background:'#8b5cf6' }} title="Portfolio">
                      <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {teamArray.length > 1 && (
        <button className="slider-btn next" onClick={nextFn}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      )}
    </div>
  )

  useEffect(() => { setTimeout(() => setLoaded(true), 80) }, [])

  return (
    <>
      <SEO title="About Us | AmitSolutionHub" 
           description="Learn about the team, mentors, and the vision behind AmitSolutionHub, a verified MSME technology services provider." />
      <style>{CSS}</style>
      <div className="abt" style={{ position:'relative', minHeight:'100vh' }}>

        {/* BG */}
        <div className="abt-bg"><div className="abt-grid"/></div>
        <div style={{ position:'fixed',width:360,height:360,borderRadius:'50%',top:'-8%',right:'2%',background:'radial-gradient(circle,rgba(99,102,241,.08),transparent 70%)',filter:'blur(55px)',animation:'abt-float 10s ease-in-out infinite',pointerEvents:'none',zIndex:0 }}/>
        <div style={{ position:'fixed',width:440,height:440,borderRadius:'50%',bottom:'5%',left:'-10%',background:'radial-gradient(circle,rgba(59,130,246,.07),transparent 70%)',filter:'blur(65px)',animation:'abt-float 13s ease-in-out infinite',animationDelay:'-5s',pointerEvents:'none',zIndex:0 }}/>

        {/* ══ MAIN ══ */}
        <div style={{
          position:'relative', zIndex:10, maxWidth:1040, margin:'0 auto',
          padding:'clamp(110px,13vw,155px) clamp(16px,5vw,28px) 80px',
          opacity:loaded ? 1 : 0, transform:loaded ? 'none' : 'translateY(20px)',
          transition:'opacity .7s ease,transform .7s ease',
        }}>

          {/* ═══ HERO ════════════════════════════════════════════════ */}
          <section style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', marginBottom:'clamp(48px,8vw,80px)' }}>

            <div className="abt-pill abt-in d1" style={{ marginBottom:26 }}>
              <span className="abt-pill-dot"/>
              AmitSolutionHub · MSME Registered · Est. 2021
            </div>

            {/* Avatar with rings */}
            <div className="abt-in d1" style={{ position:'relative', marginBottom:28 }}>
              <svg width="196" height="196" viewBox="0 0 196 196" style={{ position:'absolute',top:'50%',left:'50%',animation:'abt-spin 14s linear infinite',pointerEvents:'none' }}>
                <circle cx="98" cy="98" r="93" fill="none" stroke="url(#rg1)" strokeWidth="1.5" strokeDasharray="7 11"/>
                <defs><linearGradient id="rg1" x1="0" y1="0" x2="196" y2="196" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#6366f1" stopOpacity=".7"/><stop offset="60%" stopColor="#3b82f6" stopOpacity=".25"/><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0"/></linearGradient></defs>
              </svg>
              <svg width="158" height="158" viewBox="0 0 158 158" style={{ position:'absolute',top:'50%',left:'50%',animation:'abt-spinr 9s linear infinite',pointerEvents:'none' }}>
                <circle cx="79" cy="79" r="75" fill="none" stroke="url(#rg2)" strokeWidth="1" strokeDasharray="4 14"/>
                <defs><linearGradient id="rg2" x1="0" y1="0" x2="158" y2="158" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#8b5cf6" stopOpacity=".55"/><stop offset="100%" stopColor="#6366f1" stopOpacity="0"/></linearGradient></defs>
              </svg>
              <div className="abt-av-frame" style={{ width:'clamp(108px,17vw,136px)', height:'clamp(108px,17vw,136px)', position:'relative', zIndex:1 }}>
                <img src="https://github.com/Amit-Patel01.png" alt="Amit Patel" style={{ width:'100%', height:'100%' }}/>
              </div>
              <div style={{ position:'absolute',bottom:2,right:-4,zIndex:10,background:'white',borderRadius:999,padding:'4px 9px 4px 7px',border:'1px solid rgba(34,197,94,.3)',display:'flex',alignItems:'center',gap:5,fontSize:11,fontWeight:700,color:'#16a34a',boxShadow:'0 2px 10px rgba(34,197,94,.14)' }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:'#22c55e',display:'inline-block' }}/>Active
              </div>
            </div>

            <h1 className="abt-in d2" style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(2rem,5.5vw,3.6rem)',color:'#0f172a',letterSpacing:'-.03em',lineHeight:1.1,marginBottom:10 }}>
              Hi, I'm <span className="abt-grad">Amit Patel</span>
            </h1>
            <p className="abt-in d2" style={{ fontSize:'clamp(.9rem,2vw,1rem)',fontWeight:600,color:'#6366f1',marginBottom:8 }}>
              Founder & CEO — AmitSolutionHub
            </p>
            <p className="abt-in d3" style={{ fontSize:'clamp(.88rem,2vw,.98rem)',fontWeight:500,color:'#475569',minHeight:'1.5em',marginBottom:16 }}>
              {role}<span style={{ color:'#6366f1',opacity:.7 }}>|</span>
            </p>
            <p className="abt-in d3" style={{ color:'#64748b',fontSize:'clamp(.88rem,2vw,1rem)',maxWidth:540,lineHeight:1.88,marginBottom:32 }}>
              I specialize in crafting <strong style={{ color:'#334155',fontWeight:700 }}>premium digital products</strong> and expert technology solutions.
              AmitSolutionHub is a <strong style={{ color:'#334155',fontWeight:700 }}>MSME-certified</strong>, trusted tech company serving businesses and individuals across India.
            </p>

            {/* Social links */}
            <div className="abt-in d4" style={{ display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',marginBottom:28 }}>
              <a href="https://portfolio.amitsolutionhub.com/" target="_blank" rel="noreferrer" className="abt-soc" style={{ background:'#f0f0ff',borderColor:'rgba(99,102,241,.22)',color:'#6366f1' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='#e0e7ff'; e.currentTarget.style.boxShadow='0 4px 16px rgba(99,102,241,.18)' }}
                onMouseLeave={e=>{ e.currentTarget.style.background='#f0f0ff'; e.currentTarget.style.boxShadow='none' }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                Portfolio
              </a>
              <a href="https://github.com/Amit-Patel01" target="_blank" rel="noreferrer" className="abt-soc" style={{ background:'#0f172a',borderColor:'transparent',color:'white' }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow='0 4px 16px rgba(15,23,42,.28)'}
                onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                GitHub
              </a>
              <a href="https://www.linkedin.com/in/amit-patel-341a02195/" target="_blank" rel="noreferrer" className="abt-soc" style={{ background:'#eff6ff',borderColor:'rgba(59,130,246,.22)',color:'#2563eb' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='#dbeafe'; e.currentTarget.style.boxShadow='0 4px 16px rgba(59,130,246,.18)' }}
                onMouseLeave={e=>{ e.currentTarget.style.background='#eff6ff'; e.currentTarget.style.boxShadow='none' }}>
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                LinkedIn
              </a>
            </div>

            {/* CTA */}
            <div className="abt-in d5" style={{ display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center' }}>
              <button className="abt-btn" onClick={() => document.getElementById('team-section')?.scrollIntoView({ behavior:'smooth' })}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                Meet the Team
              </button>
              <Link to="/contact" style={{ display:'inline-flex',alignItems:'center',gap:8,padding:'13px 22px',borderRadius:999,background:'rgba(99,102,241,.07)',border:'1px solid rgba(99,102,241,.2)',color:'#6366f1',fontWeight:700,fontSize:14,textDecoration:'none',transition:'all .25s' }}
                onMouseEnter={e=>{ e.currentTarget.style.background='rgba(99,102,241,.12)'; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseLeave={e=>{ e.currentTarget.style.background='rgba(99,102,241,.07)'; e.currentTarget.style.transform='none' }}>
                Let's Work Together
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
              </Link>
            </div>
          </section>

          {/* ═══ AICTE CREDIBILITY BAR ═══════════════════════════════ */}
          <section className="abt-in d6" style={{ marginBottom:'clamp(36px,5vw,52px)' }}>
            <div className="abt-aicte-bar">
              {AICTE_STATS.map(({ num, label }) => (
                <div key={label} className="abt-aicte-item">
                  <div className="abt-aicte-num">{num}</div>
                  <div className="abt-aicte-label">{label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══ MSME CERTIFICATION SECTION (PROMOTED) ═══════════════ */}
          <section className="abt-in d6" style={{ marginBottom:'clamp(48px,7vw,72px)' }}>
            <div style={{ 
              background:'linear-gradient(135deg, #1e3a8a, #1e40af)', 
              borderRadius:24, 
              padding:'clamp(20px,4vw,32px)',
              display:'flex',
              alignItems:'center',
              gap:24,
              flexWrap:'wrap',
              boxShadow:'0 15px 45px rgba(29,78,216,.2)',
              position:'relative',
              overflow:'hidden',
              border:'1px solid rgba(255,255,255,.1)'
            }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.08),transparent_50%)] pointer-events-none" />
              
              {/* Left: Building Icon (replaced with logo.png) */}
              <div style={{ 
                background:'rgba(255,255,255,.12)', 
                borderRadius:18, 
                padding:16, 
                display:'flex', 
                alignItems:'center', 
                justifyContent:'center', 
                flexShrink:0,
                width:84,
                height:84,
                border:'1px solid rgba(255,255,255,.2)',
                backdropFilter:'blur(10px)'
              }}>
                <img src={logo} alt="AmitSolutionHub Logo" style={{ width:'100%', height:'100%', objectFit:'contain', filter:'brightness(0) invert(1)' }} />
              </div>

              <div style={{ flex:1, minWidth:0, position:'relative', zIndex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:8 }}>
                  <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, color:'white', fontSize:'clamp(1.15rem,2.8vw,1.4rem)', letterSpacing:'-0.01em' }}>
                    Officially Recognized & Trusted
                  </h3>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:'3px 12px', borderRadius:999, background:'rgba(255,255,255,.18)', color:'white', letterSpacing:'.06em', textTransform:'uppercase' }}>MSME · Govt. of India</span>
                    <span style={{ fontSize:10, fontWeight:700, padding:'3px 12px', borderRadius:999, background:'rgba(255,255,255,.12)', color:'rgba(255,255,255,.8)', letterSpacing:'.06em', textTransform:'uppercase' }}>AICTE (In Process)</span>
                  </div>
                </div>
                <p style={{ color:'rgba(255,255,255,.82)', fontSize:'clamp(13px,2vw,14px)', lineHeight:1.7, marginBottom:10 }}>
                  AmitSolutionHub is a <strong style={{ color:'white' }}>MSME-registered</strong> organization under the Ministry of MSME, Government of India. 
                  We follow all statutory guidelines to ensure high-quality delivery and authentic certification.
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>UDYAM Registration:</div>
                  <div style={{ fontSize:13, color:'white', fontWeight:800, background:'rgba(255,255,255,.08)', padding:'4px 12px', borderRadius:8 }}>UDYAM-GJ-17-0037282</div>
                </div>
              </div>

              {/* Right: Verification Block */}
              <div style={{ flexShrink:0, display:'flex', gap:16, alignItems:'center', position:'relative', zIndex:1 }}>
                <div style={{ 
                  background:'white', 
                  borderRadius:12, 
                  padding:6, 
                  width:90, 
                  height:90, 
                  display:'flex', 
                  alignItems:'center', 
                  justifyContent:'center',
                  boxShadow:'0 8px 25px rgba(0,0,0,.2)',
                  transform:'rotate(-2deg)'
                }}>
                  <img src={msmeQR} alt="Verify MSME" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ 
                    background:'rgba(255,255,255,.1)', 
                    borderRadius:14, 
                    padding:'10px 16px', 
                    border:'1px solid rgba(255,255,255,.2)',
                    display:'flex',
                    alignItems:'center',
                    gap:10
                  }}>
                    <img src={msmeLogo} alt="MSME Logo" style={{ height:26, borderRadius:4, background:'white', padding:3 }} />
                    <div>
                      <div style={{ fontSize:9, color:'rgba(255,255,255,.5)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em' }}>Status</div>
                      <div style={{ fontSize:12, color:'white', fontWeight:800 }}>🟢 Active</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="abt-div"/>

          {/* ═══ TRUST & CERTIFIED ════════════════════════════════════ */}
          <section className="abt-in d6" style={{ marginBottom:'clamp(40px,6vw,60px)' }}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div className="abt-pill" style={{ marginBottom:12 }}>Why Choose Us</div>
              <h2 className="abt-stitle">Trusted &amp; <span className="abt-grad">Certified</span></h2>
              <p style={{ color:'#64748b',fontSize:14,marginTop:8 }}>We are a verified, government-recognized tech company</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap:14 }}>
              {TRUST_BADGES.map(({ icon, bg, title, desc }) => (
                <div key={title} className="abt-trust">
                  <div className="abt-trust-icon" style={{ background:bg }}>{icon}</div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:14,color:'#0f172a',marginBottom:3 }}>{title}</div>
                    <div style={{ fontSize:12,color:'#64748b',lineHeight:1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="abt-div"/>


          <div className="abt-div"/>

          {/* ═══ MISSION / VISION / VALUES ══════════════════════════ */}
          <section style={{ marginBottom:'clamp(40px,6vw,60px)' }}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div className="abt-pill" style={{ marginBottom:12 }}>Our Foundation</div>
              <h2 className="abt-stitle">What <span className="abt-grad">Drives</span> Us</h2>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,230px),1fr))',gap:18 }}>
              <div className="abt-mv" style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)',boxShadow:'0 8px 32px rgba(99,102,241,.28)' }}>
                <div style={{ fontSize:30,marginBottom:14 }}>🎯</div>
                <h3 style={{ fontFamily:'Syne,sans-serif',fontSize:'1rem',fontWeight:800,marginBottom:10 }}>Mission</h3>
                <p style={{ fontSize:13,lineHeight:1.85,opacity:.9 }}>To build reliable, practical digital solutions that solve real-world problems efficiently and at scale.</p>
              </div>
              <div className="abt-mv" style={{ background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',boxShadow:'0 8px 32px rgba(59,130,246,.28)' }}>
                <div style={{ fontSize:30,marginBottom:14 }}>🔭</div>
                <h3 style={{ fontFamily:'Syne,sans-serif',fontSize:'1rem',fontWeight:800,marginBottom:10 }}>Vision</h3>
                <p style={{ fontSize:13,lineHeight:1.85,opacity:.9 }}>To grow AmitSolutionHub into a trusted, full-spectrum tech platform combining development, hardware, and mentorship.</p>
              </div>
              <div className="abt-glass" style={{ padding:'clamp(22px,4vw,32px)' }}>
                <div style={{ fontSize:30,marginBottom:14 }}>💡</div>
                <h3 style={{ fontFamily:'Syne,sans-serif',fontSize:'1rem',fontWeight:800,color:'#0f172a',marginBottom:14 }}>Core Values</h3>
                <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                  {['Security First','Creativity','Growth','Learning','Performance'].map(v => (
                    <span key={v} style={{ fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:999,background:'#f0f0ff',color:'#6366f1',border:'1px solid rgba(99,102,241,.18)' }}>{v}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═══ MENTORS ════════════════════════════════════════════════ */}
          {mentors.length > 0 && (
            <>
              <div className="abt-div"/>
              <section id="mentor-section" style={{ marginBottom:'clamp(40px,6vw,60px)', scrollMarginTop:100 }}>
                <div style={{ textAlign:'center', marginBottom:36 }}>
                  <div className="abt-pill" style={{ marginBottom:14 }}>Guidance & Leadership</div>
                  <h2 className="abt-stitle">Meet our <span className="abt-grad">Mentors</span></h2>
                  <p style={{ color:'#64748b',fontSize:14,marginTop:10,lineHeight:1.7 }}>
                    The visionary leaders guiding <strong style={{ color:'#6366f1' }}>AmitSolutionHub</strong>
                  </p>
                </div>
                {renderSlider(mentors, activeIndexMentor, prevSlideMentor, nextSlideMentor)}
              </section>
            </>
          )}

          {/* ═══ TEAM ════════════════════════════════════════════════ */}
          {regularTeam.length > 0 && (
            <>
              {mentors.length === 0 && <div className="abt-div"/>}
              <section id="team-section" style={{ marginBottom:'clamp(40px,6vw,60px)', scrollMarginTop:100 }}>
                <div style={{ textAlign:'center', marginBottom:36 }}>
                  <div className="abt-pill" style={{ marginBottom:14 }}>Our People</div>
                  <h2 className="abt-stitle">Meet the <span className="abt-grad">Team</span></h2>
                  <p style={{ color:'#64748b',fontSize:14,marginTop:10,lineHeight:1.7 }}>
                    The talented professionals powering <strong style={{ color:'#6366f1' }}>AmitSolutionHub</strong>
                  </p>
                </div>
                {renderSlider(regularTeam, activeIndexTeam, prevSlideTeam, nextSlideTeam)}
              </section>
            </>
          )}

          <div className="abt-div"/>

          {/* ═══ CTA ═════════════════════════════════════════════════ */}
          <section style={{ textAlign:'center', paddingBottom:20 }}>
            <div style={{
              maxWidth:560, margin:'0 auto',
              background:'linear-gradient(135deg,rgba(99,102,241,.06),rgba(59,130,246,.04))',
              border:'1px solid rgba(99,102,241,.13)',
              borderRadius:'clamp(18px,4vw,26px)',
              padding:'clamp(32px,6vw,52px) clamp(20px,5vw,40px)',
            }}>
              <p style={{ fontSize:13,color:'#94a3b8',fontStyle:'italic',marginBottom:12 }}>
                ⭐ "Building Solutions. Solving Problems. Creating Impact."
              </p>
              <h2 style={{ fontFamily:'Syne,sans-serif',fontWeight:800,fontSize:'clamp(1.3rem,3.5vw,1.9rem)',color:'#0f172a',marginBottom:10,letterSpacing:'-.02em' }}>
                Let's Build Something <span className="abt-grad">Amazing</span>
              </h2>
              <p style={{ color:'#64748b',fontSize:14,lineHeight:1.8,marginBottom:28 }}>
                Have a project in mind? Partner with a trusted, MSME-certified tech company.
              </p>
              <Link to="/contact" className="abt-btn">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
                Start a Project
              </Link>
            </div>
          </section>

        </div>
      </div>
    </>
  )
}

export default About