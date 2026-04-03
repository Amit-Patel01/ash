import React, { useState, useEffect, useRef } from 'react'

const SYMBOLS = [
  { symbol: 'BINANCE:BTCUSDT', name: 'BTC/USD' },
  { symbol: 'NSE:TCS', name: 'TCS' },
  { symbol: 'NSE:RELIANCE', name: 'RELIANCE' },
  { symbol: 'BINANCE:ETHUSDT', name: 'ETH/USD' },
  { symbol: 'AAPL', name: 'APPLE' },
  { symbol: 'GOOGL', name: 'GOOGLE' },
]

const API_KEY = 'd7808bhr01qsamsiepegd7808bhr01qsamsiepf0'

const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) return '0.00'
  if (price >= 1000) {
    return price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  return price.toFixed(2)
}

const formatChange = (change) => {
  if (change === null || change === undefined || isNaN(change)) return '0.00'
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}`
}

const TickerTape = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [transitions, setTransitions] = useState({})
  const prevDataRef = useRef({})

  const fetchData = async () => {
    try {
      const promises = SYMBOLS.map(async ({ symbol, name }) => {
        try {
          const response = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`
          )
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const json = await response.json()
          
          const prevPrice = prevDataRef.current[symbol]
          const price = json.c
          const change = json.d || 0
          const up = change >= 0
          
          prevDataRef.current[symbol] = price
          
          const priceChanged = prevPrice !== undefined && prevPrice !== price
          if (priceChanged) {
            setTransitions(prev => ({ ...prev, [name]: true }))
            setTimeout(() => {
              setTransitions(prev => ({ ...prev, [name]: false }))
            }, 300)
          }
          
          return {
            name,
            price: price || 0,
            change,
            up,
          }
        } catch (err) {
          console.warn(`Failed to fetch ${symbol}:`, err.message)
          return null
        }
      })

      const results = await Promise.all(promises)
      const validResults = results.filter(Boolean)
      
      if (validResults.length > 0) {
        setData(validResults)
        setError(null)
      }
      setLoading(false)
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const displayData = data.length > 0 ? [...data, ...data] : []

  if (loading && data.length === 0) {
    return (
      <div className="fixed top-0 left-0 right-0 h-9 bg-white/50 backdrop-blur-md border-b border-slate-100 overflow-hidden py-1 select-none z-[150]">
        <div className="flex items-center justify-center h-full">
          <span className="text-xs text-slate-400">Loading market data...</span>
        </div>
      </div>
    )
  }

  if (error && data.length === 0) {
    return (
      <div className="fixed top-0 left-0 right-0 h-9 bg-white/50 backdrop-blur-md border-b border-slate-100 overflow-hidden py-1 select-none z-[150]">
        <div className="flex items-center justify-center h-full">
          <span className="text-xs text-red-400">Unable to load market data</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-9 bg-white/50 backdrop-blur-md border-b border-slate-100 overflow-hidden py-1 select-none z-[150]">
      <div className="flex animate-marquee whitespace-nowrap">
        {displayData.map((item, i) => (
          <div key={i} className="inline-flex items-center gap-4 px-8 border-r border-slate-100 last:border-r-0 group/ticker">
            <span className="text-xs font-bold text-slate-400 tracking-tight group-hover/ticker:text-blue-500 transition-colors uppercase">{item.name}</span>
            <div className="flex flex-col">
              <span className={`text-sm font-mono font-black text-slate-800 leading-none transition-all duration-300 ${transitions[item.name] ? 'scale-105' : ''}`}>
                {formatPrice(item.price)}
              </span>
              <div className={`h-0.5 w-0 bg-current transition-all duration-500 group-hover/ticker:w-full ${item.up ? 'text-green-500' : 'text-red-500'}`}></div>
            </div>
            <span className={`text-[10px] font-black flex items-center gap-0.5 px-2 py-0.5 rounded-md ${item.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} animate-pulse`}>
              {item.up ? '▲' : '▼'} {formatChange(item.change)}
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