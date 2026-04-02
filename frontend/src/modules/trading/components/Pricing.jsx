import React from 'react'

const Pricing = ({ courses, onPlanSelect }) => {
  const DEFAULT_PRICING = [
    {
      id: 'basic',
      name: 'Basic',
      price: 4999,
      period: 'one-time',
      description: 'Perfect for beginners wanting to learn the fundamentals',
      features: ['Market Basics Course', 'Technical Analysis Fundamentals', '5 Pre-recorded Sessions', 'Email Support', 'Basic Chart Patterns Guide', 'Community Access'],
      highlighted: false,
      badge: '',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9999,
      period: 'one-time',
      description: 'Most popular plan for serious traders',
      features: ['Everything in Basic', 'Intraday Trading Masterclass', 'Swing Trading Strategies', '12 Live Sessions/month', 'Risk Management Toolkit', 'Priority WhatsApp Support', 'Weekly Market Analysis', 'Trading Journal Template'],
      highlighted: true,
      badge: 'MOST POPULAR',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19999,
      period: 'one-time',
      description: 'Complete mentorship for aspiring professional traders',
      features: ['Everything in Pro', '1-on-1 Mentorship Calls', 'Unlimited Live Sessions', 'Personal Trading Plan', 'Portfolio Review', 'Lifetime Access to Updates', 'Direct Mentor WhatsApp', 'Certificate of Completion'],
      highlighted: false,
      badge: '',
    },
  ]

  const displayData = courses && courses.length > 0 ? courses.map(c => ({
    id: c.id,
    name: c.name,
    price: c.price,
    period: 'one-time',
    description: c.description || '',
    features: c.features || [],
    highlighted: c.highlighted || false,
    badge: c.badge || '',
  })) : DEFAULT_PRICING

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
              className={`relative rounded-3xl p-8 bg-white border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                plan.highlighted ? 'border-blue-500 shadow-xl' : 'border-slate-200 shadow-sm'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black tracking-widest bg-blue-600 text-white uppercase">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900 mb-2 mt-2">{plan.name}</h3>
              <p className="text-slate-500 text-sm mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-black text-slate-900">₹{plan.price.toLocaleString('en-IN')}</span>
                <span className="text-slate-400 text-sm ml-1">/{plan.period}</span>
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
