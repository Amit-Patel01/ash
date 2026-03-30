import React from 'react';

const GlowBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Animated Background Blobs - High Performance Infinite Motion */}
      <div className="absolute inset-0 z-[1]">
        {/* Blue Sphere - Slow Spin */}
        <div className="absolute top-[2%] left-[-10%] w-[40rem] h-[40rem] bg-blue-500/20 rounded-full blur-[120px] animate-spin-slow opacity-60"></div>

        
        {/* Purple Sphere - Fluid Pulse */}
        <div className="absolute top-[20%] right-[-10%] w-[35rem] h-[35rem] bg-purple-500/20 rounded-full blur-[120px] animate-blob opacity-60"></div>
        
        {/* Indigo Sphere - Floating Drift */}
        <div className="absolute bottom-[-10%] left-[20%] w-[45rem] h-[45rem] bg-indigo-500/20 rounded-full blur-[120px] animate-float opacity-60"></div>
      </div>

      {/* Premium Radial Grid Pattern */}
      <div className="absolute inset-0 z-[2] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      
      {/* Soft Vignette for Depth */}
      <div className="absolute inset-0 z-[3] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,255,255,0.2)_100%)]"></div>
    </div>
  );
};

export default GlowBackground;
