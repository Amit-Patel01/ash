import { useState, useEffect, useRef } from 'react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import ChatPanel from '../components/ChatPanel'

export default function UserSupport() {
  const { currentUser, getAllUsers } = useAuth()
  const { getOrCreateChat, setActiveChatId, chats } = useChat()
  const [initialized, setInitialized] = useState(false)
  const initializingRef = useRef(false)

  useEffect(() => {
    if (!currentUser?.uid || initialized || initializingRef.current) return
    const initChat = async () => {
      initializingRef.current = true

      // Check if there's already a chat with admin
      const existingChat = chats.find(c => {
        const partner = c.participantInfo && Object.keys(c.participantInfo).find(id => id !== currentUser.uid)
        return partner && c.participantInfo[partner]?.email === 'amitp@solutionhub.com'
      })

      if (existingChat) {
        setActiveChatId(existingChat.id)
        setInitialized(true)
        initializingRef.current = false
        return
      }

      // Try to find admin user
      try {
        const users = await getAllUsers()
        const admin = users.find(u => u.email === 'amitp@solutionhub.com' || u.role === 'admin' || u.role === 'employee')
        if (admin) {
          const chatId = await getOrCreateChat(admin.uid, admin.displayName || admin.name || 'Support Team', admin.email, admin.role)
          if (chatId) {
            setActiveChatId(chatId)
          }
        }
      } catch (err) {
        console.error('Error initializing support chat:', err)
      } finally {
        initializingRef.current = false
      }
      setInitialized(true)
    }

    initChat()
  }, [currentUser?.uid, chats, initialized, getOrCreateChat, setActiveChatId, getAllUsers])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-12rem)]">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Support Chat</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">Chat with our support team and technical mentors in real-time</p>
      </div>


      <div className="h-[calc(100%-5rem)]">
        <ChatPanel embedded />
      </div>
    </div>
  )
}
