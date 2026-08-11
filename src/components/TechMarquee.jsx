'use client'
/**
 * TechMarquee – "Powered By" infinite marquee
 * Clean light theme with real technology brand icons.
 */

import { useEffect, useRef, useState } from 'react'

const TECHS = [
  { name: 'Google Cloud', logo: 'https://cdn.simpleicons.org/googlecloud/4285F4' },
  { name: 'Google Gemini', logo: 'https://cdn.simpleicons.org/googlegemini/8E75B2' },
  { name: 'AWS', logo: 'https://cdn.simpleicons.org/amazonwebservices/FF9900' },
  { name: 'MongoDB', logo: 'https://cdn.simpleicons.org/mongodb/47A248' },
  { name: 'Razorpay', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg' },
  { name: 'Clerk', logo: 'https://cdn.simpleicons.org/clerk/6C47FF' },
  { name: 'Meta', logo: 'https://cdn.simpleicons.org/meta/0081FB' },
  { name: 'GitHub', logo: 'https://cdn.simpleicons.org/github/181717' },
  { name: 'Node.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg' },
  { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg' },
  { name: 'Express.js', logo: 'https://cdn.simpleicons.org/express/000000' },
  { name: 'Docker', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg' },
  { name: 'Firebase', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg' },
  { name: 'Cloudflare', logo: 'https://cdn.simpleicons.org/cloudflare/F38020' },
  { name: 'Vercel', logo: 'https://cdn.simpleicons.org/vercel/000000' },
  { name: 'Git', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg' },
  { name: 'Figma', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg' },
  { name: 'Photoshop', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/photoshop/photoshop-original.svg' },
]

const mid = Math.ceil(TECHS.length / 2)
const ROW1 = TECHS.slice(0, mid)
const ROW2 = TECHS.slice(mid)

function LogoCard({ tech }) {
  const [imgOk, setImgOk] = useState(true)

  return (
    <div className="tm-card" title={tech.name}>
      <div className="tm-card-inner">
        {imgOk ? (
          <img
            src={tech.logo}
            alt={tech.name}
            loading="lazy"
            decoding="async"
            className="tm-logo-img"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="tm-logo-fallback">
            {tech.name.charAt(0)}
          </div>
        )}
        <span className="tm-name">{tech.name}</span>
      </div>
    </div>
  )
}

function MarqueeRow({ items, direction = 'left' }) {
  const repeated = [...items, ...items, ...items]
  return (
    <div className={`tm-track-wrapper ${direction === 'right' ? 'tm-reverse' : ''}`}>
      <div className="tm-track">
        {repeated.map((tech, i) => (
          <LogoCard key={`${tech.name}-${i}`} tech={tech} />
        ))}
      </div>
    </div>
  )
}

function AnimatedHeading() {
  const ref = useRef(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVis(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={`tm-heading ${vis ? 'tm-heading--vis' : ''}`}>
      <p className="tm-heading-small">Industry Leading Stack</p>
      <h2 className="tm-heading-large">Powered By Technologies You Trust</h2>
    </div>
  )
}

export default function TechMarquee() {
  return (
    <section className="tm-section">
      <style>{STYLES}</style>
      <AnimatedHeading />
      <div className="tm-rows">
        <MarqueeRow items={ROW1} direction="left" />
        <MarqueeRow items={ROW2} direction="right" />
      </div>
    </section>
  )
}

const STYLES = `
.tm-section {
  background: transparent;
  padding: 64px 0 56px;
  overflow: hidden;
  position: relative;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
  border-bottom: 1px solid rgba(226, 232, 240, 0.6);
}

.tm-heading {
  text-align: center;
  margin-bottom: 40px;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.tm-heading--vis {
  opacity: 1;
  transform: translateY(0);
}
.tm-heading-small {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #4F46E5;
  margin: 0 0 6px;
  font-family: ui-sans-serif, system-ui, sans-serif;
}
.tm-heading-large {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  margin: 0;
  color: #0F172A;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

.tm-rows {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tm-track-wrapper {
  position: relative;
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
}

.tm-track {
  display: flex;
  gap: 14px;
  width: max-content;
  animation: tm-left 38s linear infinite;
  will-change: transform;
}
.tm-reverse .tm-track {
  animation-name: tm-right;
  animation-duration: 42s;
}

.tm-track-wrapper:hover .tm-track {
  animation-play-state: paused;
}

@keyframes tm-left  { 0%{transform:translateX(0)} 100%{transform:translateX(-33.333%)} }
@keyframes tm-right { 0%{transform:translateX(-33.333%)} 100%{transform:translateX(0)} }

.tm-card {
  flex-shrink: 0;
  width: 190px;
  height: 72px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(226, 232, 240, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  cursor: default;
  transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
}
.tm-card:hover {
  transform: translateY(-3px);
  background: #FFFFFF;
  border-color: rgba(99, 102, 241, 0.4);
  box-shadow: 0 10px 25px rgba(79, 70, 229, 0.1);
}
.tm-card-inner {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
  height: 100%;
  padding: 0 16px;
}

.tm-logo-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
  display: block;
}

.tm-logo-fallback {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #EEF2FF;
  border: 1px solid #C7D2FE;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #4F46E5;
}

.tm-name {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  letter-spacing: 0.01em;
  white-space: nowrap;
  font-family: ui-sans-serif, system-ui, sans-serif;
}

@media (max-width: 768px) {
  .tm-section  { padding: 48px 0 40px; }
  .tm-heading  { margin-bottom: 32px; }
  .tm-card     { width: 160px; height: 64px; border-radius: 14px; }
  .tm-logo-img { width: 24px; height: 24px; }
  .tm-name     { font-size: 11px; }
}
@media (prefers-reduced-motion: reduce) {
  .tm-track { animation-play-state: paused; }
}
`
