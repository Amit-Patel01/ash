import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Share2, Award, ShieldCheck, Printer, FileText, Image as ImageIcon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function CertificateModal({ isOpen, onClose, certData }) {
  const certificateRef = useRef(null)
  const [isDownloading, setIsDownloading] = useState(false)

  if (!isOpen || !certData) return null

  const downloadAsPDF = async () => {
    setIsDownloading(true)
    const element = certificateRef.current
    const canvas = await html2canvas(element, { scale: 3, useCORS: true })
    const imgData = canvas.toDataURL('image/png')
    
    const pdf = new jsPDF('l', 'mm', 'a4')
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`Certificate_${certData.certificate_id}.pdf`)
    setIsDownloading(false)
  }

  const downloadAsImage = async () => {
    setIsDownloading(true)
    const element = certificateRef.current
    const canvas = await html2canvas(element, { scale: 3, useCORS: true })
    const link = document.createElement('a')
    link.download = `Certificate_${certData.certificate_id}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    setIsDownloading(false)
  }

  const verifyUrl = `https://amitsolutionhub.com/verify?id=${certData.certificate_id}`

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-5xl bg-[#111418] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
        >
          {/* Top Bar */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <Award className="text-yellow-500" size={24} />
              <h2 className="text-lg font-black text-white tracking-tight uppercase">Achievement Certificate</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-all hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-10 custom-scrollbar">
            {/* The Certificate Paper (A4 Landscape aspect ratio) */}
            <div className="relative mx-auto w-full max-w-4xl shadow-2xl overflow-hidden bg-white" ref={certificateRef}>
              
              {/* Frame Part 1: Outer Border */}
              <div className="absolute inset-0 border-[20px] border-[#1e40af]" />
              {/* Frame Part 2: Thin Gold Inset */}
              <div className="absolute inset-[10px] border-2 border-[#d4af37]" />
              
              <div className="relative px-20 py-24 text-center">
                {/* Patterns */}
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Award size={200} />
                </div>
                <div className="absolute bottom-0 left-0 p-10 opacity-5">
                    <ShieldCheck size={200} />
                </div>

                {/* Content */}
                <div className="space-y-12">
                  {/* Header Logo or Icon */}
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-[#1e40af] rounded-full flex items-center justify-center text-white mb-4 shadow-xl border-4 border-[#d4af37]">
                        <Award size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-[#1e40af] uppercase tracking-widest leading-none">Amit Solution Hub</h3>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black mt-2">Professional Web & Software Solutions</p>
                  </div>

                  {/* Title */}
                  <div className="space-y-4">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter">CERTIFICATE <span className="text-[#1e40af]">OF COMPLETION</span></h1>
                    <div className="w-40 h-1 bg-[#d4af37] mx-auto rounded-full" />
                  </div>

                  {/* Body Text */}
                  <div className="max-w-2xl mx-auto space-y-8">
                    <p className="text-gray-500 text-lg italic serif">This is to certify that</p>
                    <h2 className="text-5xl font-black text-gray-900 underline decoration-[#d4af37] decoration-4 underline-offset-8 uppercase leading-tight">
                        {certData.userName}
                    </h2>
                    <p className="text-gray-500 text-lg leading-relaxed font-serif max-w-lg mx-auto">
                      has successfully completed the intensive course in <br/>
                      <span className="font-black text-gray-900 uppercase not-italic">"{certData.courseName}"</span> <br/>
                      demonstrating exceptional dedication and technical proficiency.
                    </p>
                  </div>

                  {/* Bottom Row: Signatures + Date + QR */}
                  <div className="pt-12 grid grid-cols-3 items-end gap-8">
                    {/* Date */}
                    <div className="flex flex-col items-center">
                      <p className="text-gray-900 font-black text-lg border-b-2 border-gray-900 w-full pb-2">
                        {certData.approval_date?.toDate ? certData.approval_date.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
                      </p>
                      <p className="text-[10px] uppercase font-black tracking-widest text-[#d4af37] mt-2">Achievement Date</p>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center">
                      <div className="p-2 border-2 border-gray-100 rounded-lg">
                        <QRCodeSVG value={verifyUrl} size={80} />
                      </div>
                      <div className="mt-4 space-y-1">
                        <p className="text-[8px] uppercase font-black tracking-tighter text-gray-400">Scannable Verification</p>
                        <p className="text-[9px] font-mono text-[#1e40af] font-bold">{certData.certificate_id}</p>
                      </div>
                    </div>

                    {/* Signature */}
                    <div className="flex flex-col items-center">
                        <div className="w-full text-[#1e40af] pb-2 font-black text-2xl italic tracking-tight border-b-2 border-gray-900">
                             Amit Patel
                        </div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-[#d4af37] mt-2">Founder & CEO</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Hologram style seal */}
              <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full border-4 border-[#d4af37]/30 flex items-center justify-center opacity-40">
                  <div className="w-16 h-16 rounded-full border-2 border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] font-black text-[8px] text-center">
                      OFFICIAL <br/> SEAL
                  </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="px-8 py-6 border-t border-white/10 bg-white/[0.02] grid grid-cols-2 sm:flex sm:items-center sm:justify-center gap-4">
            <button
               onClick={downloadAsPDF}
               disabled={isDownloading}
               className="flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 rounded-2xl text-white font-black hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
            >
               <FileText size={18} />
               {isDownloading ? 'Processing...' : 'Download PDF'}
            </button>
            <button
               onClick={downloadAsImage}
               disabled={isDownloading}
               className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
            >
               <ImageIcon size={18} />
               Download Image
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
