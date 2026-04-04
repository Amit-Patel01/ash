import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Image as ImageIcon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import * as htmlToImage from 'html-to-image'
import jsPDF from 'jspdf'

import msmeLogo from '../../../assets/msme.png'
import brandLogo from '../../../assets/logo.png'
import founderSign from '../../../assets/founder-sign.png'
import mentorSign from '../../../assets/mentor-sign.png'

export default function CertificateModal({ isOpen, onClose, certData }) {
  const certificateRef = useRef(null)
  const containerRef = useRef(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    if (!isOpen) return;
    
    const handleResize = () => {
      if (containerRef.current) {
         const containerWidth = containerRef.current.offsetWidth
         const containerHeight = containerRef.current.offsetHeight
         
         // The exact fixed native dimensions of the certificate container (w-[1000px] aspect-[1.414/1])
         const targetWidth = 1000
         const targetHeight = 1000 / 1.414
         
         const scaleX = (containerWidth * 0.9) / targetWidth
         const scaleY = (containerHeight * 0.9) / targetHeight
         
         // Use the smaller scale so it fully fits in both directions
         setScale(Math.min(scaleX, scaleY, 1))
      }
    }
    
    // Slight delay to allow DOM to render
    setTimeout(handleResize, 100)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen])

  if (!isOpen || !certData) return null

  const verifyUrl = `https://amitsolutionhub.com/verify?id=${certData.certificate_id}`

  const isTradingCourse =
    certData.courseName.toLowerCase().includes("stock") ||
    certData.courseName.toLowerCase().includes("trading")

  // PDF Download
  const downloadPDF = async () => {
    setIsDownloading(true)
    try {
      const dataUrl = await htmlToImage.toPng(certificateRef.current, { pixelRatio: 3, cacheBust: true })

      const pdf = new jsPDF('l', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdfWidth / 1.414

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Certificate_${certData.certificate_id}.pdf`)
    } catch (err) {
      console.error("PDF generation failed:", err)
      alert("There was an error generating the PDF. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  // Image Download
  const downloadImage = async () => {
    setIsDownloading(true)
    try {
      const dataUrl = await htmlToImage.toPng(certificateRef.current, { pixelRatio: 3, cacheBust: true })
      
      const link = document.createElement('a')
      link.download = `Certificate_${certData.certificate_id}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error("Image generation failed:", err)
      alert("There was an error generating the image. Please try again.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-[#111] rounded-3xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]"
        >

          {/* Top Bar */}
          <div className="flex justify-between items-center p-4 border-b border-white/10 text-white flex-shrink-0">
            <h2 className="font-bold">Certificate</h2>
            <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-lg transition-colors"><X /></button>
          </div>

          {/* Certificate Area (Responsive Wrapper) */}
          <div ref={containerRef} className="bg-gray-100 flex-1 overflow-hidden flex items-center justify-center min-h-[400px]">
            
            {/* Scaling Viewport */}
            <div 
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'center center',
                width: '1000px',
                height: '707px'
              }}
              className="flex-shrink-0 shadow-2xl relative"
            >
              <div ref={certificateRef} className="bg-white text-gray-900 w-full h-full relative overflow-hidden flex flex-col justify-between p-8">
                
                {/* Subtle Noise / Watermark Background */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                   <img src={brandLogo} className="w-[60%] object-contain grayscale" alt="Watermark" />
                </div>

                {/* Decorative Corner Accents */}
                <div className="absolute top-0 left-0 w-24 h-24 border-t-8 border-l-8 border-blue-900 m-8 opacity-90 z-10" />
                <div className="absolute top-0 right-0 w-24 h-24 border-t-8 border-r-8 border-yellow-500 m-8 opacity-90 z-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 border-b-8 border-l-8 border-yellow-500 m-8 opacity-90 z-10" />
                <div className="absolute bottom-0 right-0 w-24 h-24 border-b-8 border-r-8 border-blue-900 m-8 opacity-90 z-10" />

                {/* Inner Double Line Border */}
                <div className="absolute inset-6 border border-gray-200 outline outline-1 outline-offset-[6px] outline-gray-200 pointer-events-none z-0"></div>

                {/* Content Container */}
                <div className="relative z-20 flex-1 flex flex-col justify-between">
                    
                    {/* Top Logos */}
                    <div className="flex items-start px-8 pt-4">
                        <div className="w-1/3 flex items-center justify-start">
                            <img src={msmeLogo} className="h-20 object-contain drop-shadow-sm" alt="MSME Logo" />
                        </div>
                        <div className="w-1/3 flex items-center justify-center">
                            <img src={brandLogo} className="h-[120px] object-contain drop-shadow-sm" alt="Brand Logo" />
                        </div>
                        <div className="w-1/3"></div> {/* Balance spacer */}
                    </div>

                    {/* Main Title */}
                    <div className="text-center space-y-4 -mt-4">
                        <div className="flex items-center justify-center gap-4 text-xs font-bold text-yellow-600 tracking-[0.4em] uppercase">
                            <span className="w-16 h-[1px] bg-yellow-500/50"></span>
                            Official Certification
                            <span className="w-16 h-[1px] bg-yellow-500/50"></span>
                        </div>
                        <h1 className="text-6xl font-serif text-blue-950 font-black tracking-widest">
                            CERTIFICATE
                        </h1>
                        <h2 className="text-xl text-gray-500 tracking-[0.3em] font-light">
                            OF PARTICIPATION
                        </h2>
                    </div>

                    {/* Body Text */}
                    <div className="flex flex-col items-center justify-center text-center px-20">
                        <p className="text-gray-500 text-lg italic mb-6">
                            This certificate is proudly presented to
                        </p>
                        
                        <h2 className="text-[3.5rem] leading-none font-serif font-bold text-blue-900 border-b border-gray-300 pb-4 px-16 inline-block">
                            {certData.userName}
                        </h2>
                        
                        <p className="text-gray-600 text-lg leading-relaxed mt-6 max-w-2xl">
                            In recognition of their hard work, dedication, and successful completion of the comprehensive curriculum in <span className="font-bold text-blue-950 text-xl whitespace-nowrap">{certData.courseName}</span>.
                        </p>
                    </div>

                    {/* Footer Signatures and Details */}
                    <div className="grid grid-cols-3 items-end w-full px-12 pb-6">
                        
                        {/* Date */}
                        <div className="flex flex-col items-center text-center">
                            <p className="text-xl font-bold text-gray-800 mb-1">
                               {certData.approval_date?.toDate ? certData.approval_date.toDate().toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}
                            </p>
                            <div className="w-32 border-t-2 border-gray-800/80 pt-2">
                                <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Date of Issue</p>
                            </div>
                        </div>

                        {/* QR & Verification */}
                        <div className="flex flex-col items-center text-center justify-end">
                            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 mb-2">
                                <QRCodeSVG value={verifyUrl} size={80} level="M" />
                            </div>
                            <p className="text-[10px] uppercase font-bold tracking-widest text-blue-400">VERIFY ONLINE</p>
                            <p className="text-[9px] font-mono text-gray-400 tracking-wider">ID: {certData.certificate_id}</p>
                        </div>

                        {/* Signatures */}
                        <div className="flex justify-around items-end gap-6">
                            <div className="flex flex-col items-center text-center">
                                <img src={founderSign} className="h-14 object-contain mb-1" alt="Founder Signature" />
                                <div className="w-32 border-t-2 border-gray-800/80 pt-2">
                                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Founder</p>
                                </div>
                            </div>
                            
                            {isTradingCourse && (
                                <div className="flex flex-col items-center text-center">
                                    <img src={mentorSign} className="h-14 object-contain mb-1" alt="Mentor Signature" />
                                    <div className="w-32 border-t-2 border-gray-800/80 pt-2">
                                        <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Mentor</p>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                    
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-shrink-0 flex-wrap items-center justify-center gap-4 p-6 bg-black/40 border-t border-white/10 backdrop-blur-md">
            <button 
              onClick={downloadPDF} 
              disabled={isDownloading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold tracking-wide transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isDownloading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileText size={20} />}
              {isDownloading ? 'Generating PDF...' : 'Download PDF'}
            </button>

            <button 
              onClick={downloadImage} 
              disabled={isDownloading}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl font-bold tracking-wide transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {isDownloading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ImageIcon size={20} />}
              {isDownloading ? 'Generating Image...' : 'Download Image'}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  )
}
