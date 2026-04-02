import React from 'react'

const Pricing = ({ courses, onPlanSelect }) => {
  const displayData = courses && courses.length > 0 ? courses.map(c => ({
    id: c.id,
    name: c.name,
    price: c.price,
    period: 'one-time',
    description: c.description || '',
    features: c.features || [],
    highlighted: c.highlighted || false,
    badge: c.badge || '',
  })) : []

  if (displayData.length === 0) return null;

  return (
    <section id="pricing" className="py-20 px-4 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
            Invest in Your <span className="text-blue-600">Trading Future</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">Choose a plan that fits your experience level and goals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayData.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 bg-white border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                plan.highlighted ? 'border-blue-500 shadow-xl ring-4 ring-blue-50' : 'border-slate-200 shadow-sm'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-6 px-3 py-1 bg-green-500 text-white text-[10px] font-black rounded-lg shadow-lg flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                  BULLISH SETUP
                </div>
              )}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black tracking-widest bg-blue-600 text-white uppercase">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900 mb-2 mt-2">{plan.name}</h3>
              <p className="text-slate-500 text-sm mb-6">{plan.description}</p>

              <div className="flex flex-col mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 tracking-tighter">₹{plan.price.toLocaleString('en-IN')}</span>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">/ {plan.period}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">Market Value ★ Low Entry</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-3 text-sm text-slate-600">
                    <svg className="w-5 h-5 flex-shrink-0 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (onPlanSelect) {
                    onPlanSelect(plan)
                  }
                }}
                className={`block w-full text-center py-4 rounded-2xl font-bold transition-all duration-300 cursor-pointer ${
                  plan.highlighted
                    ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-[1.02]'
                    : 'bg-slate-50 text-slate-900 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Pricing
