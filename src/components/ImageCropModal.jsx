'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Interactive Profile Photo Cropper & Resizer Modal
 * Allows zooming, panning/dragging, rotating, and cropping images cleanly.
 */
export default function ImageCropModal({ isOpen, imageSrc, onClose, onCropComplete }) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    if (imageSrc) {
      const img = new Image()
      img.src = imageSrc
      img.onload = () => {
        imageRef.current = img
        setImgLoaded(true)
        setZoom(1)
        setRotation(0)
        setPosition({ x: 0, y: 0 })
      }
    } else {
      setImgLoaded(false)
    }
  }, [imageSrc])

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      })
    }
  }

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    })
  }

  const handleCropSave = () => {
    if (!imageRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const size = 400 // Output image size 400x400

    canvas.width = size
    canvas.height = size

    ctx.clearRect(0, 0, size, size)

    // Save context state for rotation & scale
    ctx.save()

    // Move origin to center of canvas
    ctx.translate(size / 2, size / 2)
    ctx.rotate((rotation * Math.PI) / 180)

    const img = imageRef.current
    // Calculate aspect ratio scaling
    const minDim = Math.min(img.width, img.height)
    const baseScale = size / minDim
    const finalScale = baseScale * zoom

    const drawWidth = img.width * finalScale
    const drawHeight = img.height * finalScale

    // Map offset
    const mappedX = (position.x / 260) * size
    const mappedY = (position.y / 260) * size

    ctx.drawImage(
      img,
      -drawWidth / 2 + mappedX,
      -drawHeight / 2 + mappedY,
      drawWidth,
      drawHeight
    )

    ctx.restore()

    // Generate clean base64 data URL
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.9)
    onCropComplete(croppedDataUrl)
    onClose()
  }

  if (!isOpen || !imageSrc) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 text-slate-900 dark:text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-lg tracking-tight">Crop &amp; Set Profile Photo</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Drag to position, zoom, or rotate your photo.</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Crop Viewport */}
          <div className="relative flex justify-center items-center">
            <div
              className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-indigo-500 shadow-xl bg-slate-950 cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
            >
              {imgLoaded && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                    transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Crop preview"
                    className="max-w-none max-h-none object-contain"
                    style={{ width: '100%', height: '100%' }}
                    draggable={false}
                  />
                </div>
              )}

              {/* Grid Guide Overlay */}
              <div className="absolute inset-0 rounded-full border border-white/30 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-40">
                <div className="border-r border-b border-white/30" />
                <div className="border-r border-b border-white/30" />
                <div className="border-b border-white/30" />
                <div className="border-r border-b border-white/30" />
                <div className="border-r border-b border-white/30" />
                <div className="border-b border-white/30" />
                <div className="border-r border-white/30" />
                <div className="border-r border-white/30" />
              </div>
            </div>
          </div>

          {/* Hidden Working Canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Controls */}
          <div className="space-y-4 pt-2 font-mono text-xs">
            {/* Zoom Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400 font-bold">
                <span>ZOOM LEVEL: {zoom.toFixed(1)}x</span>
                <button
                  onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Rotate Button */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-600 dark:text-slate-400 font-bold">ROTATION: {rotation}°</span>
              <button
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold transition-colors cursor-pointer"
              >
                ↻ Rotate 90°
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 font-sans">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCropSave}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              ✨ Crop &amp; Set Profile Picture
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
