import SEO from '../components/SEO'

export default function AboutTradingMentorship() {
  return (
    <>
      <SEO title="Trading Mentorship | Ashnexa Systems" description="Learn stock market trading from experienced mentors." />
      <section className="relative w-full min-h-screen pt-[140px] md:pt-[180px] pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 px-4 py-2 rounded-full mb-8">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse"></span>
            <span className="text-amber-700 font-bold text-sm">Trading Mentorship</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-800">
            Stock Market <span className="text-amber-600">Trading</span> Mentorship
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            Our trading mentorship program helps students learn intraday trading, technical analysis, and risk management from professional traders.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/60">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Live Sessions</h3>
              <p className="text-sm text-slate-600">Interactive online sessions with real-time market analysis</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/60">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Technical Analysis</h3>
              <p className="text-sm text-slate-600">Learn chart patterns, indicators, and trading strategies</p>
            </div>
            
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/60">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 mb-2">Risk Management</h3>
              <p className="text-sm text-slate-600">Master position sizing and capital protection techniques</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Interested in Trading Mentorship?</h2>
            <p className="mb-6 opacity-90">Contact us to know more about our programs and enrollment details.</p>
            <a href="/contact" className="inline-flex items-center gap-2 bg-white text-amber-600 px-8 py-3 rounded-full font-bold hover:bg-amber-50 transition-colors">
              Contact Us
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </>
  )
}