import React, { useEffect, useRef } from 'react'

const GraphBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let w, h
    
    // Grid settings
    const gridSize = 100
    const perspective = 600
    let scrollOffset = 0
    
    // Entities
    let candles = []
    let trendLines = []
    let floatingData = []

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      init()
    }

    const init = () => {
      // Initialize Candlesticks
      candles = []
      for (let i = 0; i < 20; i++) {
        candles.push({
          x: Math.random() * w,
          z: Math.random() * 2000,
          h: Math.random() * 150 + 20,
          w: 12,
          up: Math.random() > 0.4,
          speed: Math.random() * 0.5 + 0.2
        })
      }

      // Initialize Trend Lines
      trendLines = []
      for (let i = 0; i < 3; i++) {
        const line = []
        for (let j = 0; j < 10; j++) {
          line.push({ x: (w / 9) * j, y: h * (0.3 + Math.random() * 0.4), z: i * 500 })
        }
        trendLines.push(line)
      }

      // Floating Data
      floatingData = []
      for (let i = 0; i < 15; i++) {
        floatingData.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random() * 1500,
          value: (Math.random() * 5 * (Math.random() > 0.5 ? 1 : -1)).toFixed(2) + '%',
          opacity: Math.random() * 0.5 + 0.2
        })
      }
    }

    const project = (x, y, z) => {
      const scale = perspective / (perspective + z)
      const px = (x - w / 2) * scale + w / 2
      const py = (y - h / 2) * scale + h / 2
      return { x: px, y: py, scale }
    }

    const draw = (t) => {
      ctx.clearRect(0, 0, w, h)
      scrollOffset += 0.5
      const time = t * 0.001

      // 1. Draw 3D Grid (Perspective)
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.05)'
      ctx.lineWidth = 1

      // Vertical lines moving into distance
      for (let x = -w; x <= w * 2; x += gridSize) {
        const p1 = project(x, -h, 0)
        const p2 = project(x, h * 2, 2500)
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }

      // Horizontal lines (depth rings)
      for (let z = 0; z <= 2500; z += gridSize) {
        const offsetZ = (z - (scrollOffset % gridSize))
        const p1 = project(-w, h * 0.8, offsetZ)
        const p2 = project(w * 2, h * 0.8, offsetZ)
        ctx.lineWidth = (1 - offsetZ / 2500) * 2
        ctx.strokeStyle = `rgba(37, 99, 235, ${0.1 * (1 - offsetZ / 2500)})`
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }

      // 2. Draw Floating Data
      floatingData.forEach(d => {
        d.z -= 1.5
        if (d.z < 0) d.z = 2000
        const p = project(d.x, d.y, d.z)
        const isUp = d.value.startsWith('+')
        ctx.fillStyle = isUp ? `rgba(34, 197, 94, ${p.scale * 0.3})` : `rgba(239, 68, 68, ${p.scale * 0.3})`
        ctx.font = `${Math.floor(12 * p.scale)}px Inter, monospace`
        ctx.fillText(d.value, p.x, p.y)
      })

      // 3. Draw Candlesticks
      candles.forEach(c => {
        c.z -= c.speed
        if (c.z < -perspective) c.z = 2000
        const p = project(c.x, h * 0.6, c.z)
        const h_scaled = c.h * p.scale
        const w_scaled = c.w * p.scale

        ctx.fillStyle = c.up ? `rgba(34, 197, 94, ${p.scale * 0.4})` : `rgba(239, 68, 68, ${p.scale * 0.4})`
        ctx.fillRect(p.x - w_scaled / 2, p.y - h_scaled / 2, w_scaled, h_scaled)
        
        // Wick
        ctx.strokeStyle = ctx.fillStyle
        ctx.lineWidth = 1 * p.scale
        ctx.beginPath()
        ctx.moveTo(p.x, p.y - h_scaled / 2 - 10 * p.scale)
        ctx.lineTo(p.x, p.y + h_scaled / 2 + 10 * p.scale)
        ctx.stroke()
      })

      // 4. Draw Trend Lines
      trendLines.forEach((line, idx) => {
        ctx.beginPath()
        ctx.strokeStyle = idx === 0 ? 'rgba(37, 99, 235, 0.4)' : idx === 1 ? 'rgba(79, 70, 229, 0.2)' : 'rgba(59, 130, 246, 0.1)'
        ctx.lineWidth = 2

        for (let i = 0; i < line.length - 1; i++) {
          const osc = Math.sin(time + i + idx) * 30
          const p1 = project(line[i].x, line[i].y + osc, line[i].z)
          const p2 = project(line[i + 1].x, line[i + 1].y + Math.sin(time + i + 1 + idx) * 30, line[i + 1].z)
          
          if (i === 0) ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
        }
        ctx.stroke()
      })

      animationFrameId = requestAnimationFrame(() => draw(performance.now()))
    }

    window.addEventListener('resize', resize)
    resize()
    draw(0)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none opacity-40 z-0 bg-white"
    />
  )
}

export default GraphBackground
