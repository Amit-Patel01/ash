import React from 'react'

const indices = [
  { name: 'NIFTY 50', price: '22,453.80', change: '+124.50', up: true },
  { name: 'BANK NIFTY', price: '47,210.25', change: '-45.10', up: false },
  { name: 'SENSEX', price: '72,123.44', change: '+342.12', up: true },
  { name: 'US TECH 100', price: '18,124.55', change: '+12.44', up: true },
  { name: 'BTC/USD', price: '68,245', change: '+241.10', up: true },
  { name: 'EUR/INR', price: '89.44', change: '-0.12', up: false },
  { name: 'RELIANCE', price: '2,984.10', change: '+24.55', up: true },
  { name: 'TCS', price: '3,844.20', change: '-12.30', up: false },
]

const TickerTape = () => {
  return (
    <div className="fixed top-0 left-0 right-0 h-9 bg-white/50 backdrop-blur-md border-b border-slate-100 overflow-hidden py-1 select-none z-[150]">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...indices, ...indices].map((item, i) => (
          <div key={i} className="inline-flex items-center gap-4 px-8 border-r border-slate-100 last:border-r-0 group/ticker">
            <span className="text-xs font-bold text-slate-400 tracking-tight group-hover/ticker:text-blue-500 transition-colors uppercase">{item.name}</span>
            <div className="flex flex-col">
              <span className="text-sm font-mono font-black text-slate-800 leading-none">{item.price}</span>
              <div className={`h-0.5 w-0 bg-current transition-all duration-500 group-hover/ticker:w-full ${item.up ? 'text-green-500' : 'text-red-500'}`}></div>
            </div>
            <span className={`text-[10px] font-black flex items-center gap-0.5 px-2 py-0.5 rounded-md ${item.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} animate-pulse`}>
              {item.up ? '▲' : '▼'} {item.change}
            </span>
          </div>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  )
}

export default TickerTape
