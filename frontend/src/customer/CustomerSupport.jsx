import { useState, useEffect } from 'react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import ChatPanel from '../components/ChatPanel'

export default function CustomerSupport() {
  const { currentUser, userProfile, getAllUsers } = useAuth()
  const { getOrCreateChat, setActiveChatId, chats, getChatPartner } = useChat()
  const [initializing, setInitializing] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const initChat = async () => {
      if (!currentUser?.uid || initialized) return

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

      // Try to find admin user
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
        console.error('Error initializing support chat:', err)
      }
      setInitialized(true)
    }

    initChat()
  }, [currentUser, chats, initialized, getOrCreateChat, setActiveChatId, getAllUsers])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-12rem)]">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Support Chat</h1>
        <p className="text-sm text-gray-400 mt-1">Chat with our support team in real-time</p>
      </div>

      <div className="h-[calc(100%-5rem)]">
        <ChatPanel embedded />
      </div>
    </div>
  )
}
