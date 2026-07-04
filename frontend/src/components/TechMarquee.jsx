/**
 * TechMarquee – "Powered By" infinite marquee
 * Uses REAL brand logos from Simple Icons CDN + Devicons CDN.
 * CSS-only animations – zero JS scroll logic → smooth 60 fps.
 */

import { useEffect, useRef, useState } from 'react'

/* ── Logo URLs from reliable CDNs ──────────────────────────────────────
 *  Simple Icons:  https://cdn.simpleicons.org/{slug}/{hex}
 *  Devicons:      https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/{n}/{n}-original.svg
 * ─────────────────────────────────────────────────────────────────────*/
const TECHS = [
  {
    name: 'Google Cloud',
    logo: 'https://cdn.simpleicons.org/googlecloud/4285F4',
  },
  {
    name: 'Google Gemini',
    logo: 'https://cdn.simpleicons.org/googlegemini/8E75B2',
  },
  {
    name: 'AWS',
    logo: 'https://cdn.simpleicons.org/amazonwebservices/FF9900',
  },
  {
    name: 'MongoDB',
    logo: 'https://cdn.simpleicons.org/mongodb/47A248',
  },
  {
    name: 'Razorpay',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg',
  },
  {
    name: 'Cashfree',
    logo: 'https://cdn.simpleicons.org/cashfree/00B4D8',
  },
  {
    name: 'Clerk',
    logo: 'https://cdn.simpleicons.org/clerk/6C47FF',
  },
  {
    name: 'Meta',
    logo: 'https://cdn.simpleicons.org/meta/0081FB',
  },
  {
    name: 'GitHub',
    logo: 'https://cdn.simpleicons.org/github/ffffff',
  },
  {
    name: 'Node.js',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg',
  },
  {
    name: 'React',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
  },
  {
    name: 'Express.js',
    logo: 'https://cdn.simpleicons.org/express/ffffff',
  },
  {
    name: 'Docker',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg',
  },
  {
    name: 'Firebase',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg',
  },
  {
    name: 'Cloudflare',
    logo: 'https://cdn.simpleicons.org/cloudflare/F38020',
  },
  {
    name: 'Vercel',
    logo: 'https://cdn.simpleicons.org/vercel/ffffff',
  },
  {
    name: 'Git',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg',
  },
  {
    name: 'Figma',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg',
  },
  {
    name: 'Adobe Photoshop',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/photoshop/photoshop-original.svg',
  },
  {
    name: 'Adobe After Effects',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/aftereffects/aftereffects-original.svg',
  },
  {
    name: 'Adobe Premiere Pro',
    logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/premierepro/premierepro-original.svg',
  },
]

/* Split into two rows for the dual-direction marquee */
const mid   = Math.ceil(TECHS.length / 2)
const ROW1  = TECHS.slice(0, mid)
const ROW2  = TECHS.slice(mid)

/* ── Logo Card ─────────────────────────────────────────────────────── */
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
          /* Fallback: first letter of name */
          <div className="tm-logo-fallback">
            {tech.name.charAt(0)}
          </div>
        )}
        <span className="tm-name">{tech.name}</span>
      </div>
    </div>
  )
}

/* ── Marquee Row ────────────────────────────────────────────────────── */
function MarqueeRow({ items, direction = 'left' }) {
  // Triple items so the seam is never visible
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

/* ── Heading – fade-up on scroll into view ──────────────────────────── */
function AnimatedHeading() {
  const ref     = useRef(null)
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
      <p className="tm-heading-small">We are</p>
      <h2 className="tm-heading-large">Powered By</h2>
    </div>
  )
}

/* ── Main export ────────────────────────────────────────────────────── */
export default function TechMarquee() {
  return (
    <section className="tm-section">
      <style>{STYLES}</style>
      <AnimatedHeading />
      <div className="tm-rows">
        <MarqueeRow items={ROW1} direction="left"  />
        <MarqueeRow items={ROW2} direction="right" />
      </div>
    </section>
  )
}

/* ── Scoped CSS ─────────────────────────────────────────────────────── */
const STYLES = `
/* Section */
.tm-section {
  background: #000;
  padding: 96px 0 80px;
  overflow: hidden;
  position: relative;
}

/* Heading */
.tm-heading {
  text-align: center;
  margin-bottom: 64px;
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.85s cubic-bezier(.22,1,.36,1), transform 0.85s cubic-bezier(.22,1,.36,1);
}
.tm-heading--vis {
  opacity: 1;
  transform: translateY(0);
}
.tm-heading-small {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #00AEEF;
  margin: 0 0 10px;
  font-family: -apple-system, 'Inter', sans-serif;
}
.tm-heading-large {
  font-size: clamp(2.4rem, 6vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0;
  line-height: 1.1;
  font-family: -apple-system, 'Inter', sans-serif;
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Rows */
.tm-rows {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Track wrapper with edge fade */
.tm-track-wrapper {
  position: relative;
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
}

/* Scrolling track */
.tm-track {
  display: flex;
  gap: 16px;
  width: max-content;
  animation: tm-left 40s linear infinite;
  will-change: transform;
}
.tm-reverse .tm-track {
  animation-name: tm-right;
  animation-duration: 44s;
}

/* Pause on hover */
.tm-track-wrapper:hover .tm-track {
  animation-play-state: paused;
}

@keyframes tm-left  { 0%{transform:translateX(0)} 100%{transform:translateX(-33.333%)} }
@keyframes tm-right { 0%{transform:translateX(-33.333%)} 100%{transform:translateX(0)} }

/* Card */
.tm-card {
  flex-shrink: 0;
  width: 220px;
  height: 90px;
  border-radius: 20px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.09);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  box-shadow: 0 4px 24px rgba(0,0,0,0.45);
  cursor: default;
  transition:
    transform .35s cubic-bezier(.22,1,.36,1),
    border-color .3s,
    box-shadow .3s,
    background .3s;
}
.tm-card:hover {
  transform: translateY(-7px) scale(1.03);
  background: rgba(255,255,255,0.1);
  border-color: rgba(0,174,239,0.4);
  box-shadow:
    0 16px 48px rgba(0,0,0,0.55),
    0 0 0 1px rgba(0,174,239,0.22),
    0 0 36px rgba(0,174,239,0.1);
}
.tm-card-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 9px;
  height: 100%;
  padding: 12px 16px;
}

/* Real logo image */
.tm-logo-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
  transition: transform .3s cubic-bezier(.22,1,.36,1), filter .3s;
}
.tm-card:hover .tm-logo-img {
  transform: scale(1.12);
  filter: drop-shadow(0 4px 10px rgba(0,174,239,0.25));
}

/* Fallback letter */
.tm-logo-fallback {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00AEEF33, #00AEEF11);
  border: 1px solid rgba(0,174,239,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: #00AEEF;
  font-family: -apple-system, 'Inter', sans-serif;
}

/* Name label */
.tm-name {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.02em;
  text-align: center;
  white-space: nowrap;
  font-family: -apple-system, 'Inter', sans-serif;
  transition: color .25s;
}
.tm-card:hover .tm-name { color: rgba(255,255,255,0.95); }

/* Responsive */
@media (max-width: 768px) {
  .tm-section  { padding: 72px 0 60px; }
  .tm-heading  { margin-bottom: 48px; }
  .tm-card     { width: 180px; height: 80px; border-radius: 16px; }
  .tm-logo-img { width: 30px; height: 30px; }
  .tm-name     { font-size: 10px; }
}
@media (max-width: 480px) {
  .tm-section { padding: 52px 0 44px; }
  .tm-card    { width: 150px; height: 72px; border-radius: 14px; }
  .tm-logo-img{ width: 26px; height: 26px; }
}
@media (prefers-reduced-motion: reduce) {
  .tm-track { animation-play-state: paused; }
}
`
