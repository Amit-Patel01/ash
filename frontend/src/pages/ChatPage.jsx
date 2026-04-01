import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ChatPanel from '../components/ChatPanel'

export default function ChatPage() {
  const { currentUser, userProfile, getAllUsers } = useAuth()
  const { getOrCreateChat, setActiveChatId, chats } = useChat()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (!currentUser || initialized || userProfile?.role === 'admin' || userProfile?.role === 'employee') return

    const initChat = async () => {
      // Check if there's already a chat with admin
      const existingChat = chats.find(c => {
        const partner = c.participantInfo && Object.keys(c.participantInfo).find(id => id !== currentUser.uid)
        return partner && c.participantInfo[partner]?.email === 'amitp@solutionhub.com'
      })

      if (existingChat) {
        setActiveChatId(existingChat.id)
        setInitialized(true)
        return
      }

      try {
        const users = await getAllUsers()
        const admin = users.find(u => u.email === 'amitp@solutionhub.com' || u.role === 'admin')
        if (admin) {
          const chatId = await getOrCreateChat(admin.uid, admin.displayName || 'Support Team', admin.email)
          if (chatId) {
            setActiveChatId(chatId)
          }
        }
      } catch (err) {
        console.error('Error initializing chat:', err)
      }
      setInitialized(true)
    }

    initChat()
  }, [currentUser, chats, initialized, getOrCreateChat, setActiveChatId, getAllUsers])

  if (!currentUser) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <div className="bg-white rounded-2xl p-12 shadow-lg">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Live Chat Support</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Sign in to start chatting with our support team in real-time. Send messages, share images, and get instant help.</p>
            <button
              onClick={() => navigate('/employee-login')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20"
            >
              Sign In to Chat
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative h-screen bg-slate-50 dark:bg-gray-950 overflow-hidden transition-colors duration-500 flex flex-col">
      {/* Animated Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[70%] sm:w-[50%] h-[50%] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[80px] sm:blur-[120px] animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] sm:w-[45%] h-[45%] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[80px] sm:blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] sm:w-[40%] h-[40%] bg-indigo-400/15 dark:bg-indigo-600/5 rounded-full blur-[80px] sm:blur-[120px] animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header Area */}
      <div className="relative z-20 flex-shrink-0 px-4 py-3 sm:px-6 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 border border-transparent hover:border-slate-300 dark:hover:border-white/20 group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="hidden sm:block font-bold text-sm tracking-tight">Back to Website</span>
          </button>

          <div className="h-8 w-px bg-gray-200 dark:bg-white/10 hidden sm:block"></div>

          <div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              <span className="sm:hidden">Support Center</span>
              <span className="hidden sm:block">Amit Solution Hub Support Center</span>
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1 uppercase tracking-[0.2em] font-black hidden sm:block">Real-time assistance</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M14.25 12a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none">Online</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex-1 min-h-0 w-full">
        <ChatPanel embedded />
      </div>
    </section>
  )
}
