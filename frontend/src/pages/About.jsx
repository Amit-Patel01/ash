import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import SEO from '../components/SEO'
import logo from '../assets/logo.png'
import msmeLogo from '../assets/msme.png'
import msmeQR from '../assets/msme-qr.png'
import {
  buildTeamProfiles,
  fetchPublicTeamProfiles,  
  getTeamMemberImageUrl,
  getTeamMemberProfileId,
} from '../utils/teamProfiles'

/* ══════════════════════════════════════════════════════════
   STYLES
══════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  .abt {
    font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    color:#0f172a;
    text-rendering:optimizeLegibility;
    -webkit-font-smoothing:antialiased;
    -moz-osx-font-smoothing:grayscale;
    font-feature-settings:'cv02','cv03','cv04';
  }
  .abt * { box-sizing:border-box; margin:0; padding:0; }
  .abt p { letter-spacing:0; }

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
  @keyframes abt-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes abt-pulse { 0%,100%{box-shadow:0 0 0 3px rgba(34,197,94,.2)} 50%{box-shadow:0 0 0 7px rgba(34,197,94,.07)} }
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
    padding:6px 17px; border-radius:999px;
    background:rgba(99,102,241,.08); border:1px solid rgba(99,102,241,.18);
    font-family:'Inter',sans-serif;
    font-size:11px; font-weight:700; letter-spacing:.08em;
    text-transform:uppercase; color:#6366f1;
    line-height:1.2;
  }

  /* ── Gradient text ── */
  .abt-grad {
    background:linear-gradient(130deg,#6366f1 0%,#3b82f6 45%,#8b5cf6 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  /* ── CTA button ── */
  .abt-btn {
    display:inline-flex; align-items:center; gap:9px;
    padding:13px 28px; border-radius:999px;
    background:linear-gradient(135deg,#6366f1,#3b82f6);
    color:white; font-weight:700; font-size:14px;
    font-family:'Inter',sans-serif;
    letter-spacing:0;
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
    font-family:'Inter',sans-serif; font-weight:800;
    font-size:clamp(1.55rem,3.6vw,2.25rem);
    line-height:1.16;
    color:#0f172a; letter-spacing:-.025em;
    text-wrap:balance;
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
    font-family:'Inter',sans-serif;
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
    font-family:'Inter',sans-serif; font-weight:800;
    font-size:clamp(1rem,2vw,1.1rem); color:#0f172a;
    text-align:center; padding:0 20px; line-height:1.25;
  }

  .abt-tcard-badge {
    position: absolute;
    top: 14px;
    left: 14px;
    padding: 6px 14px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    z-index: 5;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .abt-tcard-badge.mentor {
    background: linear-gradient(135deg, rgba(245,158,11,0.9), rgba(217,119,6,0.9));
    color: white;
    border: 1px solid rgba(255,255,255,0.2);
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
    font-family:'Inter',sans-serif; font-weight:800;
    font-size:clamp(1.45rem,3.6vw,2.05rem); color:#6366f1; line-height:1;
    letter-spacing:-.025em;
  }
  .abt-aicte-label {
    font-family:'Inter',sans-serif;
    font-size:11px; font-weight:700; color:#64748b;
    text-transform:uppercase; letter-spacing:.06em; margin-top:6px;
  }

  /* ── Company story sections ── */
  .abt-info-grid {
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));
    gap:16px;
  }
  .abt-info-card {
    padding:24px; border-radius:20px;
    background:rgba(255,255,255,.8);
    border:1px solid rgba(255,255,255,.95);
    box-shadow:0 4px 22px rgba(99,102,241,.07);
    transition:transform .28s ease,box-shadow .28s ease,border-color .28s ease;
  }
  .abt-info-card:hover {
    transform:translateY(-4px);
    border-color:rgba(99,102,241,.2);
    box-shadow:0 12px 34px rgba(99,102,241,.12);
  }
  .abt-step-num {
    width:38px; height:38px; border-radius:12px;
    display:flex; align-items:center; justify-content:center;
    margin-bottom:16px; color:white; font-weight:800; font-size:13px;
    background:linear-gradient(135deg,#6366f1,#3b82f6);
    box-shadow:0 6px 18px rgba(99,102,241,.24);
  }
  .abt-info-title {
    font-family:'Inter',sans-serif; font-size:1rem;
    line-height:1.3;
    font-weight:800; color:#0f172a; margin-bottom:10px;
    letter-spacing:-.015em;
  }
  .abt-info-copy {
    color:#64748b; font-size:13px; line-height:1.75;
    font-weight:400;
  }

  /* scrollbar hide */
  .ab-noscroll::-webkit-scrollbar{display:none}
  .ab-noscroll{-ms-overflow-style:none;scrollbar-width:none}

  /* ── 3D CAROUSEL STYLES ── */
  .abt-slider-wrap {
    position:relative; width:100%; max-width:1100px; margin:0 auto;
    height:560px; display:flex; align-items:center; justify-content:center;
    overflow:visible; perspective: 1000px;
  }
  .abt-tcard-new {
    position:absolute;
    width:280px; height:480px;
    background:white; border-radius:24px;
    box-shadow:0 10px 30px rgba(0,0,0,0.05), 0 1px 8px rgba(0,0,0,0.02); 
    transition:transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease;
    display:flex; flex-direction:column; overflow:hidden;
    border: 1px solid rgba(0,0,0,0.03);
  }
  .abt-tcard-img-wrap {
    width:100%; height:260px; position:relative; background:#f8fafc; flex-shrink:0;
    overflow: hidden;
  }
  .abt-tcard-img-wrap img, .abt-tc-init-new {
    width:100%; height:100%; object-fit:cover;
    transition: transform 0.5s ease;
  }
  .abt-tcard-new:hover .abt-tcard-img-wrap img {
    transform: scale(1.05);
  }
  .abt-tc-init-new {
    display:flex; align-items:center; justify-content:center;
    font-size:3rem; font-weight:800; color:white;
    background:linear-gradient(135deg,#6366f1,#3b82f6);
  }
  .abt-tcard-role {
    position:absolute; bottom:12px; left:12px;
    background:#dc2626; color:white;
    font-family:'Inter',sans-serif;
    font-size:10px; font-weight:800;
    padding:5px 12px; border-radius:8px;
    box-shadow:0 4px 12px rgba(220,38,38,0.25);
    z-index:2; text-transform:uppercase; letter-spacing:0.06em;
  }
  .abt-tcard-body {
    flex:1; padding:24px 20px;
    display:flex; flex-direction:column;
    text-align:center; align-items:center;
    background:white;
  }
  .abt-tcard-name {
    color:#0f172a; font-family:'Inter',sans-serif;
    font-size:21px; font-weight:800; margin-bottom:8px;
    line-height:1.2;
    letter-spacing:-.02em; text-transform: capitalize;
  }
  .abt-tcard-bio {
    font-size:13px; color:#64748b; line-height:1.65;
    font-family:'Inter',sans-serif;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
    margin-bottom:18px; font-weight: 500;
  }
  .abt-profile-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 11px 24px;
    background: #eff6ff;
    color: #2563eb;
    font-weight: 700;
    font-size: 13px;
    border-radius: 99px;
    text-decoration: none;
    font-family:'Inter',sans-serif;
    transition: all 0.2s ease;
    border: 1px solid rgba(59,130,246,0.15);
    width: 100%;
  }
  .abt-profile-btn:hover {
    background: #dbeafe;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59,130,246,0.12);
  }

  .abt-portfolio-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 11px 24px;
    background: #2563eb;
    color: white;
    font-weight: 700;
    font-size: 13px;
    border-radius: 99px;
    text-decoration: none;
    font-family:'Inter',sans-serif;
    transition: all 0.2s ease;
    width: 100%;
    margin-top: 10px;
    box-shadow: 0 4px 12px rgba(37,99,235,0.2);
  }
  .abt-portfolio-btn:hover {
    background: #1d4ed8;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(37,99,235,0.3);
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
    .abt-tcard-new { width:310px; height:490px; }
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
    .abt-btn  { padding:12px 20px; font-size:13px; }
    .abt-trust { flex-direction:column; text-align:center; padding:18px 14px; }
    .abt-msme { flex-direction:column; }
    
    .slider-btn.prev { left:0px; width:40px; height:40px; }
    .slider-btn.next { right:0px; width:40px; height:40px; }
    .abt-tcard-new { width:260px; height:460px; }
    .abt-tcard-img-wrap { height:220px; }
    .abt-slider-wrap { height:500px; }
  }
`

const SvgIcon = ({ name, size = 20, color = 'currentColor', strokeWidth = 2 }) => {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
  }

  switch (name) {
    case 'building':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16" /><path d="M6 20V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13" /><path d="M9 9h1M9 12h1M9 15h1M13 9h1M13 12h1M13 15h1" /></svg>
    case 'check':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></svg>
    case 'shield':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 5.5 6v5c0 4 2.7 7.6 6.5 10 3.8-2.4 6.5-6 6.5-10V6L12 3Z" /><path d="m9.5 12 1.7 1.7 3.3-3.4" /></svg>
    case 'bolt':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M13 3 6 13h4l-1 8 7-10h-4l1-8Z" /></svg>
    case 'target':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1.2" fill={color} stroke="none" /></svg>
    case 'vision':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></svg>
    case 'idea':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4" /><path d="M8.3 14.5A5.5 5.5 0 1 1 15.7 14.5c-.8.7-1.2 1.3-1.3 2h-2.8c-.1-.7-.5-1.3-1.3-2Z" /></svg>
    case 'status':
      return <svg {...props} viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill={color} fillOpacity="0.2" /><circle cx="10" cy="10" r="4.5" fill={color} /></svg>
    case 'star':
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z" /></svg>
    default:
      return <svg {...props} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /></svg>
  }
}
/* ══ Trust Badge Data ══ */
const TRUST_BADGES = [
  { icon: 'building', bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', title: 'MSME Certified', desc: 'Officially registered under Ministry of MSME, Govt. of India' },
  { icon: 'check', bg: 'linear-gradient(135deg,#10b981,#059669)', title: 'Trusted by Clients',  desc: 'Serving businesses & individuals across India consistently' },
  { icon: 'shield', bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', title: 'Secure & Reliable', desc: 'Industry-standard security in every project we deliver' },
  { icon: 'bolt', bg: 'linear-gradient(135deg,#f59e0b,#d97706)', title: '24/7 Support Ready', desc: 'Round-the-clock technical assistance for all our clients' },
]

/* ══ AICTE Credibility Numbers ══ */
const AICTE_STATS = [
  { num: '3+',   label: 'Years Active' },
  { num: '50+',  label: 'Projects Done' },
  { num: '100%', label: 'Client Trust' },
  { num: 'MSME', label: 'Govt. Certified' },
]

const OPERATING_STEPS = [
  { num: '01', title: 'Understand', desc: 'We begin with your goals, users, budget, and the real problem the product needs to solve.' },
  { num: '02', title: 'Plan', desc: 'We define the scope, technology, milestones, and responsibilities before development starts.' },
  { num: '03', title: 'Build', desc: 'Our team designs, develops, tests, and shares progress through clear project checkpoints.' },
  { num: '04', title: 'Deliver & Support', desc: 'We launch carefully, hand over the essentials, and stay available for improvements and support.' },
]

const EXPERTISE = [
  { icon: 'bolt', title: 'Custom Projects', desc: 'Purpose-built digital products for businesses, students, and individuals with specific requirements.' },
  { icon: 'building', title: 'Web & Software Development', desc: 'Responsive websites, dashboards, portals, and practical software designed for reliable day-to-day use.' },
  { icon: 'idea', title: 'Internships & Mentorship', desc: 'Structured, project-based learning with practical guidance, accountability, and authentic certification.' },
  { icon: 'shield', title: 'Technical Support', desc: 'Maintenance, troubleshooting, security-minded improvements, and dependable assistance after delivery.' },
]

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
const About = () => {
  const { users, teamMembers } = useStore()
  const [publicTeam, setPublicTeam] = useState([])
  const [teamLoading, setTeamLoading] = useState(true)
  const [loaded, setLoaded] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const sortedTeam = useMemo(
    () => buildTeamProfiles({ publicTeam, users, teamMembers }),
    [publicTeam, users, teamMembers]
  )

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
        if (isMounted) setTeamLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const nextSlide = () => setActiveIndex(i => (sortedTeam.length > 0 ? (i + 1) % sortedTeam.length : 0))
  const prevSlide = () => setActiveIndex(i => (sortedTeam.length > 0 ? (i === 0 ? sortedTeam.length - 1 : i - 1) : 0))

  const renderSlider = (teamArray, activeIdx, prevFn, nextFn) => (
    <div className="abt-slider-wrap">
      {teamArray.length > 1 && (
        <button className="slider-btn prev" onClick={prevFn}>
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
      )}

      {teamArray.map((m, i) => {
        const imgUrl = getTeamMemberImageUrl(m)
        const profileId = getTeamMemberProfileId(m)
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
              {imgUrl && (
                <img 
                  src={imgUrl} 
                  alt={m.displayName} 
                  loading="lazy" 
                  onError={(e) => { 
                    e.currentTarget.style.display = 'none'; 
                    if (e.currentTarget.nextElementSibling) {
                      e.currentTarget.nextElementSibling.style.display = 'flex';
                    }
                  }} 
                />
              )}
              <div 
                className="abt-tc-init-new" 
                style={{ display: imgUrl ? 'none' : 'flex' }}
              >
                {(m.displayName || 'U').charAt(0)}
              </div>
              {m.isMentor && <div className="abt-tcard-badge mentor">Mentor</div>}
              <div className="abt-tcard-role">{m.jobTitle || m.role || 'Team Member'}</div>
            </div>

            <div className="abt-tcard-body">
              <h3 className="abt-tcard-name">{m.displayName}</h3>
              <p className="abt-tcard-bio">{m.bio || 'Professional team member at AmitSolutionHub.'}</p>

              <Link
                to={`/team/${profileId}`}
                className="abt-profile-btn"
              >
                View Team Profile
              </Link>
              
              {m.portfolio && (
                <a
                  href={m.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="abt-portfolio-btn"
                >
                  Visit Portfolio
                </a>
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
                  <h3 style={{ fontFamily:'Inter,sans-serif', fontWeight:800, color:'white', fontSize:'clamp(1.15rem,2.8vw,1.4rem)', letterSpacing:'-0.015em' }}>
                    Officially Recognized & Trusted
                  </h3>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    <span style={{ fontSize:10, fontWeight:700, padding:'3px 12px', borderRadius:999, background:'rgba(255,255,255,.18)', color:'white', letterSpacing:'.06em', textTransform:'uppercase' }}>MSME · Govt. of India</span>
                    <span style={{ fontSize:10, fontWeight:700, padding:'3px 12px', borderRadius:999, background:'rgba(34,197,94,.18)', color:'#bbf7d0', letterSpacing:'.06em', textTransform:'uppercase' }}>AICTE Approved</span>
                  </div>
                </div>
                <p style={{ color:'rgba(255,255,255,.82)', fontSize:'clamp(13px,2vw,14px)', lineHeight:1.7, marginBottom:10 }}>
                  AmitSolutionHub is a <strong style={{ color:'white' }}>MSME-registered</strong> and <strong style={{ color:'white' }}>AICTE-approved</strong> organization.
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
                      <div style={{ fontSize:12, color:'white', fontWeight:800, display:'inline-flex', alignItems:'center', gap:6 }}>
                        <SvgIcon name="status" size={12} color="#22c55e" />
                        Active
                      </div>
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
              <div className="abt-pill" style={{ marginBottom:12 }}>MSME &amp; Trust Section</div>
              <h2 className="abt-stitle">Trusted &amp; <span className="abt-grad">Certified</span></h2>
              <p style={{ color:'#64748b',fontSize:14,marginTop:8 }}>We are a verified, government-recognized tech company</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,220px),1fr))', gap:14 }}>
              {TRUST_BADGES.map(({ icon, bg, title, desc }) => (
                <div key={title} className="abt-trust">
                  <div className="abt-trust-icon" style={{ background:bg }}>
                    <SvgIcon name={icon} size={22} color="white" />
                  </div>
                  <div>
                    <div style={{ fontWeight:700,fontSize:14,color:'#0f172a',marginBottom:3 }}>{title}</div>
                    <div style={{ fontSize:12,color:'#64748b',lineHeight:1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="abt-div"/>

          {/* ═══ HOW WE OPERATE ══════════════════════════════════════ */}
          <section className="abt-in d6" style={{ marginBottom:'clamp(40px,6vw,60px)' }}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div className="abt-pill" style={{ marginBottom:12 }}>How We Operate</div>
              <h2 className="abt-stitle">A Clear Process From <span className="abt-grad">Idea to Launch</span></h2>
              <p style={{ color:'#64748b',fontSize:14,marginTop:8,lineHeight:1.7 }}>
                Every project moves through simple checkpoints so expectations, timelines, and delivery stay clear.
              </p>
            </div>
            <div className="abt-info-grid">
              {OPERATING_STEPS.map(({ num, title, desc }) => (
                <div key={title} className="abt-info-card">
                  <div className="abt-step-num">{num}</div>
                  <h3 className="abt-info-title">{title}</h3>
                  <p className="abt-info-copy">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="abt-div"/>

          {/* ═══ EXPERTISE ═══════════════════════════════════════════ */}
          <section className="abt-in d6" style={{ marginBottom:'clamp(40px,6vw,60px)' }}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div className="abt-pill" style={{ marginBottom:12 }}>What We&apos;re Actually Good At</div>
              <h2 className="abt-stitle">Practical Tech Work That <span className="abt-grad">Ships</span></h2>
              <p style={{ color:'#64748b',fontSize:14,marginTop:8,lineHeight:1.7 }}>
                We focus on dependable, useful solutions instead of flashy features that do not serve the product.
              </p>
            </div>
            <div className="abt-info-grid">
              {EXPERTISE.map(({ icon, title, desc }) => (
                <div key={title} className="abt-info-card">
                  <div className="abt-trust-icon" style={{ background:'linear-gradient(135deg,#6366f1,#3b82f6)', marginBottom:16 }}>
                    <SvgIcon name={icon} size={22} color="white" />
                  </div>
                  <h3 className="abt-info-title">{title}</h3>
                  <p className="abt-info-copy">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="abt-div"/>

          {/* ═══ COMPANY STORY ═══════════════════════════════════════ */}
          <section className="abt-in d6" style={{ marginBottom:'clamp(40px,6vw,60px)' }}>
            <div className="abt-glass" style={{ padding:'clamp(26px,5vw,42px)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap:24, alignItems:'center' }}>
                <div>
                  <div className="abt-pill" style={{ marginBottom:14 }}>The Company Behind the Product You&apos;re About to Build</div>
                  <h2 className="abt-stitle" style={{ marginBottom:14 }}>
                    Built for People Who Need <span className="abt-grad">Real Outcomes</span>
                  </h2>
                  <p style={{ color:'#64748b',fontSize:14,lineHeight:1.85,marginBottom:14 }}>
                    AmitSolutionHub is a technology services company that helps clients turn requirements into working digital products, from websites and dashboards to custom software and guided technical learning.
                  </p>
                  <p style={{ color:'#64748b',fontSize:14,lineHeight:1.85 }}>
                    Our approach is straightforward: understand the problem, build with care, communicate clearly, and support the product after launch so it keeps improving.
                  </p>
                </div>
                <div style={{ display:'grid', gap:12 }}>
                  {[
                    { label:'Registered', value:'MSME-recognized business' },
                    { label:'Focus', value:'Web, software, support, and mentorship' },
                    { label:'Promise', value:'Clean delivery with practical communication' },
                  ].map(({ label, value }) => (
                    <div key={label} className="abt-trust">
                      <div className="abt-trust-icon" style={{ background:'linear-gradient(135deg,#10b981,#059669)' }}>
                        <SvgIcon name="check" size={20} color="white" />
                      </div>
                      <div>
                        <div style={{ fontWeight:800,fontSize:12,color:'#6366f1',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:3 }}>{label}</div>
                        <div style={{ fontSize:13,color:'#0f172a',lineHeight:1.55,fontWeight:700 }}>{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="abt-div"/>

          {/* ═══ MISSION / VISION / VALUES ══════════════════════════ */}
          <section style={{ marginBottom:'clamp(40px,6vw,60px)' }}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div className="abt-pill" style={{ marginBottom:12 }}>Mission / Vision</div>
              <h2 className="abt-stitle">What <span className="abt-grad">Drives</span> Us</h2>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,230px),1fr))',gap:18 }}>
              <div className="abt-mv" style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)',boxShadow:'0 8px 32px rgba(99,102,241,.28)' }}>
                <div style={{ color:'white', marginBottom:14 }}><SvgIcon name="target" size={30} color="white" /></div>
                <h3 style={{ fontFamily:'Inter,sans-serif',fontSize:'1rem',fontWeight:800,marginBottom:10,letterSpacing:'-0.01em' }}>Mission</h3>
                <p style={{ fontSize:13,lineHeight:1.85,opacity:.9 }}>To build reliable, practical digital solutions that solve real-world problems efficiently and at scale.</p>
              </div>
              <div className="abt-mv" style={{ background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',boxShadow:'0 8px 32px rgba(59,130,246,.28)' }}>
                <div style={{ color:'white', marginBottom:14 }}><SvgIcon name="vision" size={30} color="white" /></div>
                <h3 style={{ fontFamily:'Inter,sans-serif',fontSize:'1rem',fontWeight:800,marginBottom:10,letterSpacing:'-0.01em' }}>Vision</h3>
                <p style={{ fontSize:13,lineHeight:1.85,opacity:.9 }}>To grow AmitSolutionHub into a trusted, full-spectrum tech platform combining development, hardware, and mentorship.</p>
              </div>
              <div className="abt-glass" style={{ padding:'clamp(22px,4vw,32px)' }}>
                <div style={{ color:'#6366f1', marginBottom:14 }}><SvgIcon name="idea" size={30} color="#6366f1" /></div>
                <h3 style={{ fontFamily:'Inter,sans-serif',fontSize:'1rem',fontWeight:800,color:'#0f172a',marginBottom:14,letterSpacing:'-0.01em' }}>Core Values</h3>
                <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                  {['Security First','Creativity','Growth','Learning','Performance'].map(v => (
                    <span key={v} style={{ fontSize:11,fontWeight:700,padding:'5px 12px',borderRadius:999,background:'#f0f0ff',color:'#6366f1',border:'1px solid rgba(99,102,241,.18)' }}>{v}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═══ TEAM ════════════════════════════════════════════════ */}
          <div className="abt-div"/>
          <section id="team-section" style={{ marginBottom:'clamp(40px,6vw,60px)', scrollMarginTop:100 }}>
            <div style={{ textAlign:'center', marginBottom:36 }}>
              <div className="abt-pill" style={{ marginBottom:14 }}>Guidance & Delivery</div>
              <h2 className="abt-stitle">Meet the <span className="abt-grad">Team</span></h2>
              <p style={{ color:'#64748b',fontSize:14,marginTop:10,lineHeight:1.7 }}>
                The talented professionals and mentors powering <strong style={{ color:'#6366f1' }}>AmitSolutionHub</strong>
              </p>
            </div>
            {sortedTeam.length > 0 ? (
              renderSlider(sortedTeam, activeIndex, prevSlide, nextSlide)
            ) : (
              <div className="abt-glass" style={{ padding:'clamp(22px,4vw,32px)', textAlign:'center', maxWidth:560, margin:'0 auto' }}>
                <h3 style={{ fontFamily:'Inter,sans-serif', fontWeight:800, color:'#0f172a', fontSize:'1.05rem', marginBottom:8, letterSpacing:'-0.01em' }}>
                  {teamLoading ? 'Loading team profiles...' : 'Team profiles are being updated'}
                </h3>
                <p style={{ color:'#64748b', fontSize:14, lineHeight:1.7 }}>
                  {teamLoading
                    ? 'Please wait while we fetch the latest public team members.'
                    : 'Enabled public profiles will appear here automatically.'}
                </p>
              </div>
            )}
          </section>

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
              <p style={{ fontSize:13,color:'#94a3b8',fontStyle:'italic',marginBottom:12, display:'inline-flex', alignItems:'center', gap:6 }}>
                <SvgIcon name="star" size={14} color="#f59e0b" />
                "Building Solutions. Solving Problems. Creating Impact."
              </p>
              <h2 style={{ fontFamily:'Inter,sans-serif',fontWeight:800,fontSize:'clamp(1.3rem,3.5vw,1.9rem)',color:'#0f172a',marginBottom:10,letterSpacing:'-.02em',lineHeight:1.15 }}>
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
