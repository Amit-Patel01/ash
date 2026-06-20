import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const GlowBackground = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    const particleCount = 60;
    const connectionDistance = 150;
    let w, h;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 2 + 1,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      const particleColor = isDark
        ? 'rgba(99, 102, 241, 0.35)'
        : 'rgba(56, 189, 248, 0.4)';
      const lineBase = isDark ? [99, 102, 241] : [56, 189, 248];

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < connectionDistance) {
            const opacity = 1 - dist / connectionDistance;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${lineBase[0]}, ${lineBase[1]}, ${lineBase[2]}, ${opacity * (isDark ? 0.15 : 0.2)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  if (isDark) {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
        {/* Dark mode base background — covers Hero.jsx's hardcoded light inline-style background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, #030712 0%, #080d24 45%, #0f0a1e 100%)',
            zIndex: 0,
          }}
        />

        {/* Mesh glow orbs */}
        <div className="absolute inset-0" style={{ zIndex: 1, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '5%', left: '-5%',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }} />
          <div style={{
            position: 'absolute', top: '20%', right: '-10%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', left: '20%',
            width: 700, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }} />
        </div>

        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          opacity: 0.6,
          pointerEvents: 'none',
        }} />

        {/* Particle canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ opacity: 0.4, zIndex: 2 }}
        />
      </div>
    );
  }

  // Light mode — original design
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-br from-slate-50 to-white">
      {/* Dynamic Network Plexus Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60"
      />

      {/* Subtle Perspective Grids */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Hero Glow Accent */}
      <div className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[100px] animate-pulse"></div>
    </div>
  );
};

export default GlowBackground;
