import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { useTheme } from '../context/ThemeContext'
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
   Dynamic theme adjustments using CSS variables
══════════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  .abt {
    font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    color:rgb(var(--fg));
    background:rgb(var(--bg));
    transition: background-color 0.35s ease, color 0.35s ease;
  }
  .abt * { box-sizing:border-box; margin:0; padding:0; }
  .abt p { letter-spacing:0; }

  /* ══ KEYFRAMES ══ */
  @keyframes abt-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
  @keyframes abt-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes abt-pulse { 0%,100%{box-shadow:0 0 0 3px rgba(99,102,241,.18)} 50%{box-shadow:0 0 0 8px rgba(99,102,241,.06)} }
  @keyframes abt-shine { 0%{transform:translateX(-100%) skewX(-18deg)} 100%{transform:translateX(260%) skewX(-18deg)} }

  .abt-in { animation:abt-up .65s cubic-bezier(.22,1,.36,1) both; }
  .d1{animation-delay:.06s} .d2{animation-delay:.14s} .d3{animation-delay:.24s}
  .d4{animation-delay:.34s} .d5{animation-delay:.46s} .d6{animation-delay:.60s}
  .d7{animation-delay:.76s}

  /* ══ HERO SECTION ══ */
  .abt-hero {
    background: var(--grad-hero);
    position: relative;
    overflow: hidden;
    padding: clamp(120px,15vw,160px) clamp(16px,5vw,28px) clamp(60px,8vw,80px);
    transition: background-color 0.35s ease;
  }
  .abt-hero-grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(99,102,241,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.02) 1px,transparent 1px);
    background-size: 64px 64px; opacity: 0.9;
    pointer-events: none;
  }
  .abt-hero-glow {
    position: absolute; border-radius: 50%; filter: blur(100px); pointer-events: none; opacity: 0.5; z-index: 0;
  }

  .abt-hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px; border-radius: 999px;
    background: rgba(99,102,241,.08); border: 1px solid rgba(99,102,241,.18);
    font-size: 11px; font-weight: 700; letter-spacing: .08em;
    text-transform: uppercase; color: #6366f1; margin-bottom: 20px;
  }
  .dark .abt-hero-badge {
    background: rgba(129,140,248,.12); border-color: rgba(129,140,248,.25);
    color: #818cf8;
  }

  .abt-hero-title {
    font-weight: 900; font-size: clamp(2.2rem, 5.5vw, 3.8rem);
    line-height: 1.12; letter-spacing: -.03em; color: rgb(var(--fg));
    margin-bottom: 20px;
  }
  .abt-hero-grad {
    background: var(--grad-primary);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }
  .abt-hero-sub {
    font-size: clamp(14px, 2vw, 16px); color: rgb(var(--fg-muted));
    line-height: 1.75; max-width: 540px; margin-bottom: 32px;
  }

  /* ══ STATS ══ */
  .abt-hero-stats {
    display: flex; flex-wrap: wrap; gap: 16px;
  }
  .abt-hero-stat {
    flex: 1; min-width: 120px; padding: 14px 20px;
    background: rgba(var(--card), 0.7);
    border: 1px solid rgba(var(--border), 0.5);
    border-radius: 16px; backdrop-filter: blur(10px);
    transition: transform 0.3s, border-color 0.3s;
  }
  .abt-hero-stat:hover {
    transform: translateY(-3px); border-color: rgba(99,102,241,0.25);
  }
  .abt-hero-stat-num {
    font-weight: 800; font-size: clamp(1.5rem, 3.5vw, 2rem); color: #1d4ed8;
    line-height: 1.1;
  }
  .dark .abt-hero-stat-num { color: #818cf8; }
  .abt-hero-stat-label {
    font-size: 11px; font-weight: 600; color: rgb(var(--fg-muted));
    text-transform: uppercase; letter-spacing: .05em; margin-top: 4px;
  }

  /* ══ GENERAL SECTIONS ══ */
  .abt-sec {
    padding: clamp(60px, 8vw, 90px) 0; position: relative;
  }
  .abt-section {
    max-width: 1040px; margin: 0 auto; padding: 0 clamp(16px, 5vw, 28px);
  }
  .abt-sec-pill {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 5px 16px; border-radius: 999px;
    background: rgba(99,102,241,.08); border: 1px solid rgba(99,102,241,.18);
    font-size: 11px; font-weight: 700; letter-spacing: .07em;
    text-transform: uppercase; color: #6366f1; margin-bottom: 12px;
  }
  .dark .abt-sec-pill {
    background: rgba(129,140,248,.12); border-color: rgba(129,140,248,.25);
    color: #818cf8;
  }
  .abt-sec-title {
    font-weight: 800; font-size: clamp(1.6rem, 3.6vw, 2.3rem);
    color: rgb(var(--fg)); letter-spacing: -.02em; line-height: 1.2;
  }
  .abt-sec-sub {
    color: rgb(var(--fg-muted)); font-size: 14px; margin-top: 8px; line-height: 1.75;
  }

  /* ══ TRUST CARDS ══ */
  .abt-trust-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px; margin-top: 36px;
  }
  .abt-trust-card {
    background: rgba(var(--card), 0.85);
    border: 1px solid rgba(var(--border), 0.8);
    border-radius: 20px; padding: 28px 24px;
    box-shadow: var(--card-shadow);
    transition: transform .3s, box-shadow .3s, border-color .3s;
    position: relative; overflow: hidden;
  }
  .abt-trust-card:hover {
    transform: translateY(-6px);
    border-color: rgba(99,102,241,0.22);
    box-shadow: 0 16px 40px rgba(99,102,241,0.1);
  }
  .abt-trust-icon-wrap {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px;
  }
  .abt-trust-card-title {
    font-size: 14.5px; font-weight: 800; color: rgb(var(--fg));
    margin-bottom: 6px; letter-spacing: -0.01em;
  }
  .abt-trust-card-desc {
    font-size: 12.5px; color: rgb(var(--fg-muted)); line-height: 1.7;
  }

  /* ══ OPERATING STEPS ══ */
  .abt-process-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
    gap: 24px; margin-top: 40px; position: relative;
  }
  .abt-process-item {
    display: flex; flex-direction: column; align-items: center;
    text-align: center; position: relative;
    background: rgba(var(--card), 0.8);
    border: 1px solid rgba(var(--border), 0.7);
    padding: 28px 20px; border-radius: 20px;
    box-shadow: var(--card-shadow);
    transition: transform 0.3s ease, border-color 0.3s ease;
  }
  .abt-process-item:hover {
    transform: translateY(-4px); border-color: rgba(99,102,241,0.25);
  }
  .abt-process-num {
    width: 48px; height: 48px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 15px; color: white;
    background: linear-gradient(135deg,#6366f1,#3b82f6);
    box-shadow: 0 6px 20px rgba(99,102,241,0.3);
    margin-bottom: 16px;
  }
  .abt-process-title {
    font-size: 14px; font-weight: 800; color: rgb(var(--fg));
    margin-bottom: 6px; letter-spacing: -0.01em;
  }
  .abt-process-desc {
    font-size: 12px; color: rgb(var(--fg-muted)); line-height: 1.65;
  }

  /* ══ EXPERTISE ══ */
  .abt-exp-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px; margin-top: 36px;
  }
  .abt-exp-card {
    background: rgba(var(--card), 0.85);
    border: 1px solid rgba(var(--border), 0.8);
    border-radius: 20px; padding: 28px 24px;
    box-shadow: var(--card-shadow);
    transition: transform .35s, box-shadow .35s, border-color .35s;
    position: relative; overflow: hidden;
  }
  .abt-exp-card::after {
    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
    background: linear-gradient(90deg,#6366f1,#3b82f6,#8b5cf6);
    transform: scaleX(0); transform-origin: left; transition: transform .35s;
  }
  .abt-exp-card:hover {
    transform: translateY(-6px);
    border-color: rgba(99,102,241,0.22);
    box-shadow: 0 16px 40px rgba(99,102,241,0.1);
  }
  .abt-exp-card:hover::after { transform: scaleX(1); }
  .abt-exp-icon {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg,rgba(99,102,241,.08),rgba(59,130,246,.08));
    border: 1px solid rgba(99,102,241,.14);
    margin-bottom: 16px; transition: transform .3s;
  }
  .abt-exp-card:hover .abt-exp-icon { transform: scale(1.08) rotate(-2deg); }
  .abt-exp-title {
    font-size: 14.5px; font-weight: 800; color: rgb(var(--fg));
    margin-bottom: 8px; letter-spacing: -0.015em;
  }
  .abt-exp-desc { font-size: 12.5px; color: rgb(var(--fg-muted)); line-height: 1.7; }

  /* ══ COMPANY STORY ══ */
  .abt-story-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 32px; align-items: center; margin-top: 36px;
  }
  .abt-story-fact {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 16px 18px; background: rgba(var(--card), 0.8);
    border: 1px solid rgba(var(--border), 0.8); border-radius: 16px;
    transition: transform .25s, border-color .25s;
  }
  .abt-story-fact:hover {
    transform: translateX(4px); border-color: rgba(99,102,241,0.2);
  }
  .abt-story-fact-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  /* ══ MISSION/VISION/VALUES ══ */
  .abt-mv-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 20px; margin-top: 36px;
  }
  .abt-mv-card {
    border-radius: 20px; padding: 28px 24px; color: white;
    position: relative; overflow: hidden;
    transition: transform .35s, box-shadow .35s;
  }
  .abt-mv-card:hover { transform: translateY(-5px); }
  .abt-mv-card::before {
    content: ''; position: absolute; border-radius: 50%;
    width: 180px; height: 180px; background: rgba(255,255,255,0.05);
    bottom: -50px; right: -50px; pointer-events: none;
  }
  .abt-mv-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px; position: relative; z-index: 1;
  }
  .abt-mv-title {
    font-size: 15px; font-weight: 800; margin-bottom: 8px;
    letter-spacing: -0.02em; position: relative; z-index: 1;
  }
  .abt-mv-text {
    font-size: 12.5px; line-height: 1.75; opacity: 0.9;
    position: relative; z-index: 1;
  }
  .abt-values-card {
    background: rgba(var(--card), 0.85);
    border: 1px solid rgba(var(--border), 0.8);
    border-radius: 20px; padding: 28px 24px;
    box-shadow: var(--card-shadow);
  }
  .abt-value-tag {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 700; padding: 5px 12px;
    border-radius: 999px; background: rgba(99,102,241,0.06);
    color: #6366f1; border: 1px solid rgba(99,102,241,0.15);
    transition: transform .2s, background .2s;
  }
  .dark .abt-value-tag {
    background: rgba(129,140,248,0.1); color: #a5b4fc; border-color: rgba(129,140,248,0.2);
  }
  .abt-value-tag:hover {
    transform: scale(1.04); background: rgba(99,102,241,0.12);
  }

  /* ══ MSME BANNER ══ */
  .abt-msme-card {
    background: linear-gradient(135deg,#1e3a8a 0%,#1e40af 50%,#1d4ed8 100%);
    border-radius: 24px; padding: clamp(24px,4vw,36px);
    position: relative; overflow: hidden;
    box-shadow: 0 16px 48px rgba(29,78,216,0.25);
    border: 1px solid rgba(255,255,255,0.1);
  }
  .abt-msme-card::before {
    content: ''; position: absolute; width: 260px; height: 260px; border-radius: 50%;
    background: rgba(255,255,255,0.04); top: -80px; right: -80px;
  }
  .abt-msme-inner {
    display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
    position: relative; z-index: 1;
  }
  .abt-msme-logo-wrap {
    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.18);
    border-radius: 16px; padding: 14px; backdrop-filter: blur(10px);
    flex-shrink: 0; width: 76px; height: 76px;
    display: flex; align-items: center; justify-content: center;
  }
  .abt-msme-tag {
    font-size: 9.5px; font-weight: 800; padding: 4px 10px; border-radius: 999px;
    letter-spacing: .05em; text-transform: uppercase;
  }
  .abt-msme-reg {
    font-size: 13px; color: white; font-weight: 700;
    background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 8px;
    display: inline-block; font-family: monospace;
  }
  .abt-msme-qr-wrap {
    background: white; border-radius: 12px; padding: 6px; width: 80px; height: 80px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 20px rgba(0,0,0,0.15); transform: rotate(-2deg); flex-shrink: 0;
    transition: transform .3s;
  }
  .abt-msme-qr-wrap:hover { transform: rotate(0deg) scale(1.05); }

  /* ══ TEAM CAROUSAL ══ */
  .abt-slider-wrap {
    position: relative; width: 100%; max-width: 1000px; margin: 32px auto 0;
    height: 480px; display: flex; align-items: center; justify-content: center;
    overflow: visible; perspective: 1200px;
  }
  .abt-tcard-new {
    position: absolute; width: 280px; height: 440px;
    background: rgba(var(--card), 0.95); border-radius: 24px;
    box-shadow: var(--card-shadow);
    transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease, box-shadow 0.5s ease;
    display: flex; flex-direction: column; overflow: hidden;
    border: 1px solid rgba(var(--border), 0.8);
  }
  .abt-tcard-img-wrap {
    width: 100%; height: 220px; position: relative; background: rgba(var(--bg-subtle), 1);
    flex-shrink: 0; overflow: hidden;
  }
  .abt-tcard-img-wrap img {
    width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease;
  }
  .abt-tcard-new:hover .abt-tcard-img-wrap img { transform: scale(1.06); }
  .abt-tc-init-new {
    display: flex; align-items: center; justify-content: center;
    font-size: 2.8rem; font-weight: 900; color: white;
    background: linear-gradient(135deg,#6366f1,#3b82f6);
  }
  .abt-tcard-role {
    position: absolute; bottom: 12px; left: 12px;
    background: linear-gradient(135deg,#dc2626,#b91c1c); color: white;
    font-size: 9.5px; font-weight: 800; padding: 4px 10px; border-radius: 8px;
    box-shadow: 0 4px 10px rgba(220,38,38,0.25); z-index: 2;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  .abt-tcard-body {
    flex: 1; padding: 20px 18px; display: flex; flex-direction: column;
    text-align: center; align-items: center; background: transparent;
  }
  .abt-tcard-name {
    color: rgb(var(--fg)); font-size: 17px; font-weight: 800; margin-bottom: 4px;
    line-height: 1.2; letter-spacing: -0.01em;
  }
  .abt-tcard-bio {
    font-size: 12px; color: rgb(var(--fg-muted)); line-height: 1.6;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    margin-bottom: 16px; font-weight: 500;
  }
  .abt-profile-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px 20px; background: linear-gradient(135deg,#6366f1,#3b82f6);
    color: white; font-weight: 700; font-size: 12.5px; border-radius: 99px;
    text-decoration: none; transition: transform .2s, box-shadow .2s;
    box-shadow: 0 4px 12px rgba(99,102,241,0.25); width: 100%;
  }
  .abt-profile-btn:hover {
    transform: translateY(-2px); box-shadow: 0 8px 16px rgba(99,102,241,0.35);
  }
  .abt-portfolio-btn {
    display: inline-flex; align-items: center; justify-content: center;
    padding: 9px 20px; background: rgba(var(--bg-subtle), 0.6); color: #6366f1;
    font-weight: 700; font-size: 12.5px; border-radius: 99px; text-decoration: none;
    transition: all .2s; width: 100%; margin-top: 8px;
    border: 1px solid rgba(99,102,241,0.2);
  }
  .abt-portfolio-btn:hover {
    background: rgba(99,102,241,0.06); transform: translateY(-2px);
  }
  .abt-tcard-badge {
    position: absolute; top: 12px; left: 12px;
    padding: 4px 10px; border-radius: 8px;
    font-size: 9.5px; font-weight: 800;
    text-transform: uppercase; letter-spacing: .06em;
    z-index: 5; backdrop-filter: blur(8px);
  }
  .abt-tcard-badge.mentor {
    background: linear-gradient(135deg, rgba(245,158,11,0.9), rgba(217,119,6,0.9));
    color: white; border: 1px solid rgba(255,255,255,0.2);
  }
  .slider-btn {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 44px; height: 44px; background: rgba(var(--card), 0.9);
    border-radius: 50%; display: flex; align-items: center; justify-content: center;
    box-shadow: var(--card-shadow); border: 1px solid rgba(var(--border), 0.8);
    cursor: pointer; z-index: 20; transition: all .2s; color: rgb(var(--fg));
  }
  .slider-btn:hover { background: rgb(var(--bg-subtle)); transform: translateY(-50%) scale(1.08); }
  .slider-btn.prev { left: 10px; }
  .slider-btn.next { right: 10px; }
  .slider-btn:active { transform: translateY(-50%) scale(0.96); }

  /* ══ CTA ══ */
  .abt-cta {
    background: linear-gradient(135deg,#0a0f1e 0%,#0f172a 100%);
    border-radius: 28px; padding: clamp(36px,6vw,64px) clamp(20px,4vw,48px);
    text-align: center; position: relative; overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    border: 1px solid rgba(255,255,255,0.06);
  }
  .abt-cta-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(99,102,241,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.03) 1px,transparent 1px); background-size: 48px 48px; pointer-events: none; }
  .abt-cta-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 14px 32px; border-radius: 999px;
    background: linear-gradient(135deg,#6366f1,#3b82f6);
    color: white; font-weight: 800; font-size: 14.5px;
    text-decoration: none; border: none; cursor: pointer;
    box-shadow: 0 6px 24px rgba(99,102,241,0.4),inset 0 1px 0 rgba(255,255,255,0.15);
    transition: transform .25s, box-shadow .25s;
    position: relative; overflow: hidden;
  }
  .abt-cta-btn::after {
    content: ''; position: absolute; top: 0; left: 0; width: 38%; height: 100%;
    background: linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
    animation: abt-shine 2.6s infinite;
  }
  .abt-cta-btn:hover { transform: translateY(-3px); box-shadow: 0 14px 38px rgba(99,102,241,0.5); }

  /* ══ Divider ══ */
  .abt-div {
    height: 1px;
    background: linear-gradient(90deg,transparent,rgba(99,102,241,0.12),transparent);
  }

  /* ══ GRADIENT TEXT ══ */
  .abt-grad {
    background: var(--grad-primary);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  /* ══ EXPERTISE SECTION ══ */
  .abt-exp-section {
    padding: clamp(60px, 8vw, 90px) 0;
    background: rgba(var(--bg-subtle), 0.5);
    position: relative;
  }
  .dark .abt-exp-section {
    background: rgba(8, 14, 36, 0.4);
  }

  /* ══ LEADERSHIP CARDS ══ */
  .abt-lead-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 32px;
    margin-top: 40px;
  }
  .abt-lead-card {
    background: rgba(var(--card), 0.85);
    border: 1px solid rgba(var(--border), 0.85);
    border-radius: 28px;
    padding: clamp(24px, 4vw, 36px);
    box-shadow: var(--card-shadow);
    backdrop-filter: blur(20px);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s, border-color 0.4s;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .abt-lead-card:hover {
    transform: translateY(-8px);
    border-color: rgba(99,102,241,0.3);
    box-shadow: 0 20px 40px rgba(99,102,241,0.12);
  }
  .abt-lead-img-container {
    position: relative;
    width: 140px;
    height: 140px;
    border-radius: 24px;
    overflow: hidden;
    margin-bottom: 24px;
    flex-shrink: 0;
    border: 3px solid rgba(var(--border), 0.8);
    transition: border-color 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .abt-lead-card:hover .abt-lead-img-container {
    border-color: #6366f1;
  }
  .abt-lead-img-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  .abt-lead-card:hover .abt-lead-img-container img {
    transform: scale(1.08);
  }
  .abt-lead-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 900;
    color: white;
    background: linear-gradient(135deg, #6366f1, #3b82f6);
  }
  .abt-lead-glow {
    position: absolute;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%);
    filter: blur(15px);
    top: -40px;
    left: -40px;
    pointer-events: none;
    z-index: 0;
    transition: transform 0.5s ease;
  }
  .abt-lead-card:hover .abt-lead-glow {
    transform: scale(1.2) translate(10px, 10px);
  }

  /* ══ PROCESS STEP CONNECTOR ══ */
  @media (min-width: 640px) {
    .abt-process-grid { position: relative; }
    .abt-process-grid::before {
      content: ''; position: absolute; top: 24px; left: 10%; right: 10%;
      height: 1px; background: linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent);
      z-index: 0; pointer-events: none;
    }
    .abt-process-item { z-index: 1; }
  }

  @media (max-width: 768px) {
    .abt-slider-wrap { height: 440px; }
    .slider-btn.prev { left: 2px; }
    .slider-btn.next { right: 2px; }
    .abt-hero-stats { gap: 12px; }
    .abt-lead-grid { grid-template-columns: 1fr; }
    .abt-mv-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 480px) {
    .abt-tcard-new { width: 250px; height: 420px; }
    .abt-tcard-img-wrap { height: 200px; }
    .slider-btn { width: 38px; height: 38px; }
    .abt-hero { padding-top: 120px; }
    .abt-hero-stat { padding: 10px 16px; min-width: 90px; }
    .abt-msme-inner { justify-content: center; text-align: center; }
    .abt-trust-grid { grid-template-columns: 1fr 1fr; gap: 12px; }
    .abt-exp-grid { grid-template-columns: 1fr; }
  }
`

/* ══════════════════════════════════════════════════════════
   SVG ICONS
══════════════════════════════════════════════════════════ */
const SvgIcon = ({ name, size = 22, color = 'currentColor', strokeWidth = 2 }) => {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': 'true' }
  switch (name) {
    case 'building': return <svg {...p} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h16"/><path d="M6 20V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13"/><path d="M9 9h1M9 12h1M9 15h1M13 9h1M13 12h1M13 15h1"/></svg>
    case 'check': return <svg {...p} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>
    case 'shield': return <svg {...p} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 5.5 6v5c0 4 2.7 7.6 6.5 10 3.8-2.4 6.5-6 6.5-10V6L12 3Z"/><path d="m9.5 12 1.7 1.7 3.3-3.4"/></svg>
    case 'bolt': return <svg {...p} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M13 3 6 13h4l-1 8 7-10h-4l1-8Z"/></svg>
    case 'target': return <svg {...p} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.2" fill={color} stroke="none"/></svg>
    case 'vision': return <svg {...p} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.8"/></svg>
    case 'idea': return <svg {...p} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4"/><path d="M8.3 14.5A5.5 5.5 0 1 1 15.7 14.5c-.8.7-1.2 1.3-1.3 2h-2.8c-.1-.7-.5-1.3-1.3-2Z"/></svg>
    case 'star': return <svg {...p} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z"/></svg>
    case 'arrow': return <svg {...p} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
    case 'status': return <svg {...p} viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill={color} fillOpacity="0.2"/><circle cx="10" cy="10" r="4.5" fill={color}/></svg>
    default: return <svg {...p} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/></svg>
  }
}

/* ══ CONSTANTS ══ */
const TRUST_BADGES = [
  { icon: 'building', bg: 'linear-gradient(135deg,#7c3aed,#6d28d9)', title: 'MSME Certified', desc: 'Officially registered under Ministry of MSME, Govt. of India', accent: '#7c3aed' },
  { icon: 'check',    bg: 'linear-gradient(135deg,#10b981,#059669)', title: 'Trusted by Clients',  desc: 'Serving businesses & individuals across India consistently', accent: '#10b981' },
  { icon: 'shield',   bg: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', title: 'Secure & Reliable', desc: 'Industry-standard security in every project we deliver', accent: '#3b82f6' },
  { icon: 'bolt',     bg: 'linear-gradient(135deg,#f59e0b,#d97706)', title: '24/7 Support Ready', desc: 'Round-the-clock technical assistance for all our clients', accent: '#f59e0b' },
]

const OPERATING_STEPS = [
  { num: '01', title: 'Understand', desc: 'We begin with your goals, users, budget, and the real problem the product needs to solve.' },
  { num: '02', title: 'Plan',       desc: 'We define the scope, technology, milestones, and responsibilities before development starts.' },
  { num: '03', title: 'Build',      desc: 'Our team designs, develops, tests, and shares progress through clear project checkpoints.' },
  { num: '04', title: 'Deliver',    desc: 'We launch carefully, hand over the essentials, and stay available for improvements and support.' },
]

const EXPERTISE = [
  { icon: 'bolt',     title: 'Custom Projects',           desc: 'Purpose-built digital products for businesses, students, and individuals with specific requirements.' },
  { icon: 'building', title: 'Web & Software Development', desc: 'Responsive websites, dashboards, portals, and practical software designed for reliable day-to-day use.' },
  { icon: 'idea',     title: 'Internships & Mentorship',   desc: 'Structured, project-based learning with practical guidance, accountability, and authentic certification.' },
  { icon: 'shield',   title: 'Technical Support',          desc: 'Maintenance, troubleshooting, security-minded improvements, and dependable assistance after delivery.' },
]

const HERO_STATS = [
  { num: '50+',  label: 'Projects Done' },
  { num: '100%', label: 'Client Trust' },
  { num: 'MSME', label: 'Govt. Certified' },
]

const CORE_VALUES = ['Security First', 'Creativity', 'Growth', 'Learning', 'Performance', 'Transparency']

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const About = () => {
  const { users, teamMembers } = useStore()
  const { theme } = useTheme()
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
      .then((profiles) => { if (isMounted) setPublicTeam(profiles) })
      .catch((err) => console.warn('Public team profiles could not be loaded:', err))
      .finally(() => { if (isMounted) setTeamLoading(false) })
    return () => { isMounted = false }
  }, [])

  useEffect(() => { setTimeout(() => setLoaded(true), 80) }, [])

  const nextSlide = () => setActiveIndex(i => (sortedTeam.length > 0 ? (i + 1) % sortedTeam.length : 0))
  const prevSlide = () => setActiveIndex(i => (sortedTeam.length > 0 ? (i === 0 ? sortedTeam.length - 1 : i - 1) : 0))

  const renderSlider = (teamArray, activeIdx, prevFn, nextFn) => (
    <div className="abt-slider-wrap">
      {teamArray.length > 1 && (
        <button className="slider-btn prev" onClick={prevFn} aria-label="Previous">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
        </button>
      )}
      {teamArray.map((m, i) => {
        const imgUrl = getTeamMemberImageUrl(m)
        const profileId = getTeamMemberProfileId(m)
        const total = teamArray.length
        let diff = (i - activeIdx) % total
        if (diff < -Math.floor(total / 2)) diff += total
        if (diff > Math.floor(total / 2)) diff -= total
        const absDiff = Math.abs(diff)
        const xOffset = diff * 300
        const scale = 1 - absDiff * 0.14
        const opacity = absDiff > 1 ? 0 : 1 - absDiff * 0.38
        const zIndex = 10 - absDiff
        return (
          <div key={m.uid || m.id} className="abt-tcard-new" style={{
            transform: `translateX(${xOffset}px) scale(${scale})`,
            opacity, zIndex,
            pointerEvents: absDiff === 0 ? 'auto' : 'none'
          }}>
            <div className="abt-tcard-img-wrap">
              {imgUrl && (
                <img src={imgUrl} alt={m.displayName} loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex' }}
                />
              )}
              <div className="abt-tc-init-new" style={{ display: imgUrl ? 'none' : 'flex' }}>
                {(m.displayName || 'U').charAt(0)}
              </div>
              {m.isMentor && <div className="abt-tcard-badge mentor">⭐ Mentor</div>}
              <div className="abt-tcard-role">{m.jobTitle || m.role || 'Team Member'}</div>
            </div>
            <div className="abt-tcard-body">
              <h3 className="abt-tcard-name">{m.displayName}</h3>
              <p className="abt-tcard-bio">{m.bio || 'Professional team member at AmitSolutionHub.'}</p>
              <Link to={`/team/${profileId}`} className="abt-profile-btn">
                <SvgIcon name="arrow" size={14} color="white" />
                View Profile
              </Link>
              {m.portfolio && (
                <a href={m.portfolio} target="_blank" rel="noopener noreferrer" className="abt-portfolio-btn">
                  Visit Portfolio
                </a>
              )}
            </div>
          </div>
        )
      })}
      {teamArray.length > 1 && (
        <button className="slider-btn next" onClick={nextFn} aria-label="Next">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      )}
    </div>
  )

  return (
    <>
      <SEO
        title="About Us | AmitSolutionHub"
        description="Learn about the team, mentors, and the vision behind AmitSolutionHub, a verified MSME technology services provider."
      />
      <style>{CSS}</style>
      <div className="abt" style={{ opacity: loaded ? 1 : 0, transition: 'opacity .5s ease' }}>

        {/* ════════════════════════════════════
            HERO — DYNAMIC MESH BACKGROUND
        ════════════════════════════════════ */}
        <section className="abt-hero">
          <div className="abt-hero-grid" />
          <div className="abt-hero-glow" style={{ width:500,height:500,top:'-15%',right:'-8%',background:'radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%)' }} />
          <div className="abt-hero-glow" style={{ width:400,height:400,bottom:'-10%',left:'-5%',background:'radial-gradient(circle,rgba(59,130,246,0.12),transparent 70%)' }} />

          <div className="abt-section" style={{ position:'relative', zIndex:10 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,340px),1fr))', gap:48, alignItems:'center' }}>

              {/* Left Column: Headline & Dashboard Stats */}
              <div className="abt-in d1">
                <div className="abt-hero-badge">
                  🚀 India's Growing Tech Partner
                </div>
                <h1 className="abt-hero-title">
                  We Build Things<br />
                  <span className="abt-hero-grad">That Actually Work</span>
                </h1>
                <p className="abt-hero-sub">
                  AmitSolutionHub is an MSME-registered and AICTE-approved organization delivering premium web development, custom software solutions, and internship mentorship to students and businesses nationwide.
                </p>
                <div className="abt-hero-stats">
                  {HERO_STATS.map(({ num, label }) => (
                    <div key={label} className="abt-hero-stat">
                      <div className="abt-hero-stat-num">{num}</div>
                      <div className="abt-hero-stat-label">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Floating High-Tech MSME Shield */}
              <div className="abt-in d3" style={{ display:'flex', justifyContent:'center' }}>
                <div style={{ background:'rgba(var(--card), 0.8)', border:'1px solid rgba(var(--border), 0.95)', borderRadius:28, padding:'32px 28px', width:'100%', maxWidth:380, boxShadow:'var(--card-shadow)', backdropFilter:'blur(20px)', position:'relative', animation:'abt-float 6s ease-in-out infinite' }}>
                  <div style={{ position:'absolute', top:-10, right:-10, width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg, #10b981, #059669)', display:'flex', alignItems:'center', justifyCenter:'center', border:'3px solid rgb(var(--bg))', boxShadow:'0 4px 10px rgba(16,185,129,0.3)', color:'white', fontSize:14, fontWeight:900 }}>
                    ✓
                  </div>
                  <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:20 }}>
                    <div style={{ width:48, height:48, borderRadius:12, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#6366f1' }}>
                      <SvgIcon name="building" size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:'rgb(var(--fg-muted))', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>Statutory Status</div>
                      <div style={{ fontSize:16, fontWeight:900, color:'rgb(var(--fg))' }}>MSME Registered</div>
                    </div>
                  </div>
                  <div style={{ background:'rgba(var(--bg-subtle), 0.7)', borderRadius:12, padding:12, marginBottom:16, border:'1px solid rgba(var(--border), 0.6)' }}>
                    <span style={{ fontSize:10, color:'rgb(var(--fg-muted))', display:'block', marginBottom:2, fontWeight:700 }}>UDYAM REGISTRATION NUMBER</span>
                    <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:800, color:'rgb(var(--fg))', letterSpacing:0.5 }}>UDYAM-GJ-17-0037282</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      { label:'AICTE Approved', color:'#10b981' },
                      { label:'Govt. Verified', color:'#3b82f6' },
                    ].map(({ label, color }) => (
                      <div key={label} style={{ background:'rgba(var(--bg-subtle), 0.6)', border:'1px solid rgba(var(--border), 0.5)', borderRadius:10, padding:'8px 12px', display:'flex', alignItems:'center', gap:6 }}>
                        <SvgIcon name="check" size={12} color={color} />
                        <span style={{ fontSize:11, fontWeight:700, color: 'rgb(var(--fg))' }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════
            CREDENTIALS / TRUST GRID
        ════════════════════════════════════ */}
        <section className="abt-sec">
          <div className="abt-section">
            <div style={{ textAlign:'center' }}>
              <div className="abt-sec-pill">✦ Quality Assured</div>
              <h2 className="abt-sec-title">Our Trust & <span className="abt-grad">Credentials</span></h2>
              <p className="abt-sec-sub" style={{ maxWidth: 500, margin:'8px auto 0' }}>We hold registrations and approvals designed to support and validate learning outcomes and service delivery.</p>
            </div>
            <div className="abt-trust-grid">
              {TRUST_BADGES.map(({ icon, bg, title, desc, accent }) => (
                <div key={title} className="abt-trust-card">
                  <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:bg }} />
                  <div className="abt-trust-icon-wrap" style={{ background:`linear-gradient(135deg, ${accent}15, ${accent}06)`, border:`1px solid ${accent}25`, color:accent }}>
                    <SvgIcon name={icon} size={22} color={accent} />
                  </div>
                  <div className="abt-trust-card-title">{title}</div>
                  <div className="abt-trust-card-desc">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="abt-div" />

        {/* ════════════════════════════════════
            EXPERTISE GRID
        ════════════════════════════════════ */}
        <section className="abt-exp-section">
          <div className="abt-section">
            <div style={{ textAlign:'center' }}>
              <div className="abt-sec-pill">🛠 What We Do</div>
              <h2 className="abt-sec-title">Our <span className="abt-grad">Areas of Expertise</span></h2>
              <p className="abt-sec-sub" style={{ maxWidth:480, margin:'8px auto 0' }}>From custom builds to mentorship, here is what we consistently deliver with quality.</p>
            </div>
            <div className="abt-exp-grid">
              {EXPERTISE.map(({ icon, title, desc }) => (
                <div key={title} className="abt-exp-card">
                  <div className="abt-exp-icon"><SvgIcon name={icon} size={22} color="#6366f1" /></div>
                  <h3 className="abt-exp-title">{title}</h3>
                  <p className="abt-exp-desc">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="abt-div" />

        {/* ════════════════════════════════════
            LEADERSHIP (FOUNDER & CO-FOUNDER)
        ════════════════════════════════════ */}
        <section className="abt-sec">
          <div className="abt-section">
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div className="abt-sec-pill">👤 Leadership</div>
              <h2 className="abt-sec-title">Meet Our <span className="abt-grad">Founders</span></h2>
              <p className="abt-sec-sub" style={{ maxWidth: 500, margin: '8px auto 0' }}>
                Leading our vision and technical execution to build digital solutions that drive success.
              </p>
            </div>
            
            <div className="abt-lead-grid">
              
              {/* Founder: Amit Patel */}
              <div className="abt-lead-card">
                <div className="abt-lead-glow" />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div className="abt-lead-img-container">
                      <img 
                        src="https://cdn.phototourl.com/free/2026-04-17-0ae88615-c6d0-46bb-b3a9-271cc07980a8.jpg" 
                        alt="Amit Patel" 
                        loading="lazy"
                        onError={(e) => { 
                          e.currentTarget.style.display = 'none'; 
                          if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex'; 
                        }}
                      />
                      <div className="abt-lead-fallback" style={{ display: 'none' }}>AP</div>
                    </div>
                    <div className="abt-sec-pill" style={{ margin: 0, background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(59,130,246,0.1))', color: '#6366f1', borderColor: 'rgba(99,102,241,0.25)' }}>
                      Founder & Lead
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: 'rgb(var(--fg))', marginBottom: 4, letterSpacing: '-0.02em' }}>
                    Amit Patel
                  </h3>
                  <div style={{ fontSize: 13, color: 'rgb(var(--fg-muted))', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 16 }}>
                    Founder of AmitSolutionHub
                  </div>
                  
                  <p style={{ fontSize: 14, color: 'rgb(var(--fg-muted))', lineHeight: 1.7, flex: 1, marginBottom: 24 }}>
                    I lead the design and development of digital projects at AmitSolutionHub. With a focus on full-stack technologies and stock market analytics, I guide our software team to implement clean solutions for clients, while mentoring students through hands-on internship courses.
                  </p>
                  
                  {/* Skill Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                    {['React & Node.js', 'System Architecture', 'Mentorship', 'API Design', 'Technical Analysis'].map(tag => (
                      <span key={tag} className="abt-value-tag" style={{ background: 'rgba(var(--bg-muted), 0.6)' }}>{tag}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                    <a href="https://portfolio.amitsolutionhub.com/" target="_blank" rel="noopener noreferrer" className="abt-profile-btn" style={{ flex: 1, padding: '12px 16px' }}>
                      <SvgIcon name="arrow" size={14} color="white" />
                      Portfolio
                    </a>
                    <a href="https://www.linkedin.com/in/amit-patel01/" target="_blank" rel="noopener noreferrer" className="abt-portfolio-btn" style={{ width: 'auto', marginTop: 0, padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>

              {/* Co-Founder: Naivedh Patel */}
              <div className="abt-lead-card">
                <div className="abt-lead-glow" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.18), transparent 70%)' }} />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div className="abt-lead-img-container">
                      <img 
                        src="https://cdn.phototourl.com/free/2026-04-17-535a233f-3c4a-4bf3-9f98-b1131ef6064a.jpg" 
                        alt="Naivedh Patel" 
                        loading="lazy"
                        onError={(e) => { 
                          e.currentTarget.style.display = 'none'; 
                          if (e.currentTarget.nextElementSibling) e.currentTarget.nextElementSibling.style.display = 'flex'; 
                        }}
                      />
                      <div className="abt-lead-fallback" style={{ display: 'none', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>NP</div>
                    </div>
                    <div className="abt-sec-pill" style={{ margin: 0, background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(29,78,216,0.1))', color: '#3b82f6', borderColor: 'rgba(59,130,246,0.25)' }}>
                      Co-Founder
                    </div>
                  </div>
                  
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: 'rgb(var(--fg))', marginBottom: 4, letterSpacing: '-0.02em' }}>
                    Naivedh Patel
                  </h3>
                  <div style={{ fontSize: 13, color: 'rgb(var(--fg-muted))', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 16 }}>
                    Editor & Tech Developer Manager
                  </div>
                  
                  <p style={{ fontSize: 14, color: 'rgb(var(--fg-muted))', lineHeight: 1.7, flex: 1, marginBottom: 24 }}>
                    I manage the content strategy and lead our core technology development division to deliver high-quality digital solutions. Focused on driving design innovation, structured content workflows, and high-performance engineering standards.
                  </p>
                  
                  {/* Skill Badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
                    {['Content Strategy', 'Web Development', 'Operations', 'Team Management', 'Product Design'].map(tag => (
                      <span key={tag} className="abt-value-tag" style={{ background: 'rgba(var(--bg-muted), 0.6)' }}>{tag}</span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                    <a href="https://portfolio-beta-five-50.vercel.app/" target="_blank" rel="noopener noreferrer" className="abt-profile-btn" style={{ flex: 1, padding: '12px 16px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                      <SvgIcon name="arrow" size={14} color="white" />
                      Portfolio
                    </a>
                    <a href="https://www.linkedin.com/in/naivedh2518/" target="_blank" rel="noopener noreferrer" className="abt-portfolio-btn" style={{ width: 'auto', marginTop: 0, padding: '11px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <div className="abt-div" />

        {/* ════════════════════════════════════
            HOW WE OPERATE (PROCESS)
        ════════════════════════════════════ */}
        <section className="abt-sec">
          <div className="abt-section">
            <div style={{ textAlign:'center' }}>
              <div className="abt-sec-pill">⚙ Execution Flow</div>
              <h2 className="abt-sec-title">A Clear Path from <span className="abt-grad">Requirements to Delivery</span></h2>
              <p className="abt-sec-sub" style={{ maxWidth: 520, margin:'8px auto 0' }}>Every collaboration moves through clear steps, ensuring timelines and goals stay aligned.</p>
            </div>
            <div className="abt-process-grid">
              {OPERATING_STEPS.map(({ num, title, desc }) => (
                <div key={title} className="abt-process-item">
                  <div className="abt-process-num">{num}</div>
                  <h3 className="abt-process-title">{title}</h3>
                  <p className="abt-process-desc">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="abt-div" />

        {/* ════════════════════════════════════
            PHILOSOPHY & CORE VALUES
        ════════════════════════════════════ */}
        <section className="abt-sec">
          <div className="abt-section">
            <div style={{ textAlign:'center', marginBottom:36 }}>
              <div className="abt-sec-pill">🎯 Philosophy</div>
              <h2 className="abt-sec-title">What <span className="abt-grad">Drives Our Work</span></h2>
            </div>
            <div className="abt-mv-grid">
              <div className="abt-mv-card" style={{ background:'linear-gradient(135deg,#6366f1,#4f46e5)',boxShadow:'0 10px 30px rgba(99,102,241,0.2)' }}>
                <div className="abt-mv-icon"><SvgIcon name="target" size={24} color="white" /></div>
                <h3 className="abt-mv-title">Our Mission</h3>
                <p className="abt-mv-text">To deliver practical, secure, and reliable software tools and mentorship that help businesses scale and students learn real-world execution.</p>
              </div>
              <div className="abt-mv-card" style={{ background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',boxShadow:'0 10px 30px rgba(59,130,246,0.2)' }}>
                <div className="abt-mv-icon"><SvgIcon name="vision" size={24} color="white" /></div>
                <h3 className="abt-mv-title">Our Vision</h3>
                <p className="abt-mv-text">To establish a transparent tech platform combining agile development, educational excellence, and certified standard training.</p>
              </div>
              <div className="abt-values-card">
                <div style={{ color:'#6366f1',marginBottom:16 }}><SvgIcon name="idea" size={26} color="#6366f1" /></div>
                <h3 style={{ fontSize:15, fontWeight:800, color:'rgb(var(--fg))', marginBottom:12, letterSpacing:'-0.01em' }}>Core Principles</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {CORE_VALUES.map(v => (
                    <span key={v} className="abt-value-tag">{v}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="abt-div" />

        {/* ════════════════════════════════════
            MSME DEEP BANNER
        ════════════════════════════════════ */}
        <section className="abt-sec">
          <div className="abt-section">
            <div className="abt-msme-card">
              <div className="abt-msme-inner">
                {/* Logo wrapper */}
                <div className="abt-msme-logo-wrap">
                  <img src={logo} alt="SolutionHub Logo" style={{ width:'100%', height:'100%', objectFit:'contain', filter:'brightness(0) invert(1)' }} />
                </div>
                {/* Info block */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:10 }}>
                    <h3 style={{ fontWeight:800, color:'white', fontSize:'clamp(1.1rem,2vw,1.35rem)', letterSpacing:'-0.01em' }}>
                      Ministry of MSME Registered Organization
                    </h3>
                    <span className="abt-msme-tag" style={{ background:'rgba(34,197,94,0.25)', color:'#a7f3d0' }}>Active Status</span>
                    <span className="abt-msme-tag" style={{ background:'rgba(255,255,255,0.15)', color:'white' }}>Govt. of India</span>
                  </div>
                  <p style={{ color:'rgba(255,255,255,0.8)', fontSize:13.5, lineHeight:1.7, marginBottom:12 }}>
                    We operate formally as a verified business entity, conforming to learning frameworks (AICTE) and standards required for issuing online, verifiable completion certificates.
                  </p>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.6)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.04em' }}>UDYAM REG:</span>
                    <div className="abt-msme-reg">UDYAM-GJ-17-0037282</div>
                  </div>
                </div>
                {/* Verification QR Box */}
                <div style={{ flexShrink:0, display:'flex', gap:14, alignItems:'center' }}>
                  <div>
                    <div className="abt-msme-qr-wrap">
                      <img src={msmeQR} alt="MSME Verification QR Code" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                    </div>
                    <div style={{ textAlign:'center', marginTop:6, fontSize:9, color:'rgba(255,255,255,0.5)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>Verify Govt. Portal</div>
                  </div>
                  <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:12, padding:'8px 12px', border:'1px solid rgba(255,255,255,0.15)' }}>
                    <img src={msmeLogo} alt="MSME Logo" style={{ height:26, borderRadius:4, background:'white', padding:2 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="abt-div" />

        {/* ════════════════════════════════════
            TEAM CAROUSEL SLIDER
        ════════════════════════════════════ */}
        <section className="abt-sec" id="team-section" style={{ scrollMarginTop:100 }}>
          <div className="abt-section">
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div className="abt-sec-pill">👥 The Team</div>
              <h2 className="abt-sec-title">Our Mentors & <span className="abt-grad">Software Team</span></h2>
              <p className="abt-sec-sub" style={{ maxWidth: 460, margin:'8px auto 0' }}>The industry mentors and builders behind AmitSolutionHub's codebases.</p>
            </div>
            {sortedTeam.length > 0 ? (
              renderSlider(sortedTeam, activeIndex, prevSlide, nextSlide)
            ) : (
              <div style={{ padding:'32px 24px', textAlign:'center', maxWidth:460, margin:'36px auto 0', background:'rgb(var(--card))', border:'1px solid rgb(var(--border))', borderRadius:20, boxShadow:'var(--card-shadow)' }}>
                <div style={{ fontSize:32, marginBottom:10 }}>{teamLoading ? '⏳' : '👷'}</div>
                <h3 style={{ fontWeight:800, color:'rgb(var(--fg))', fontSize:'14px', marginBottom:6 }}>
                  {teamLoading ? 'Loading Profile Data...' : 'Profiles Updating'}
                </h3>
                <p style={{ color:'rgb(var(--fg-muted))', fontSize:12.5, lineHeight:1.6 }}>
                  {teamLoading
                    ? 'Fetching registered public developer and mentor profiles.'
                    : 'Developer profile lists are currently being refreshed by the admin.'}
                </p>
              </div>
            )}
          </div>
        </section>

        <div className="abt-div" />

        {/* ════════════════════════════════════
            FINAL CALL TO ACTION
        ════════════════════════════════════ */}
        <section className="abt-sec">
          <div className="abt-section">
            <div className="abt-cta">
              <div className="abt-cta-grid" />
              <div style={{ position:'absolute',width:250,height:250,borderRadius:'50%',top:'-20%',left:'5%',background:'radial-gradient(circle,rgba(99,102,241,0.18),transparent 75%)',filter:'blur(50px)',pointerEvents:'none' }} />
              
              <div style={{ position:'relative', zIndex:10 }}>
                <div style={{ display:'inline-flex',alignItems:'center',gap:6,fontSize:11,color:'rgba(255,255,255,0.7)',textTransform:'uppercase',letterSpacing:'.08em',marginBottom:16,fontWeight:700 }}>
                  <SvgIcon name="star" size={13} color="#f59e0b" />
                  Building Quality Digital Products
                </div>
                <h2 style={{ fontWeight:900,fontSize:'clamp(1.5rem,3.8vw,2.2rem)',color:'white',marginBottom:12,letterSpacing:'-.02em',lineHeight:1.15 }}>
                  Ready to Turn Your Idea Into <span className="abt-hero-grad">Reality?</span>
                </h2>
                <p style={{ color:'rgba(255,255,255,0.75)',fontSize:14,lineHeight:1.75,marginBottom:28,maxWidth:460,margin:'0 auto 28px' }}>
                  Partner with a trusted, MSME-certified technical team. Let us build your next software tool, dashboard, or application.
                </p>
                <Link to="/contact" className="abt-cta-btn">
                  <SvgIcon name="arrow" size={16} color="white" strokeWidth={2.5} />
                  Start a Conversation
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  )
}

export default About
