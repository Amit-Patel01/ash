'use client'
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

      // Check if there's already a chat with an admin or staff member
      const existingChat = chats.find(c => {
        const partnerId = c.participantInfo && Object.keys(c.participantInfo).find(id => id !== currentUser.uid)
        const partnerInfo = partnerId ? c.participantInfo[partnerId] : null
        return partnerInfo && (partnerInfo.role === 'admin' || partnerInfo.role === 'employee' || partnerInfo.email?.includes('solutionhub'))
      }) || chats[0]

      if (existingChat) {
        setActiveChatId(existingChat.id)
        setInitialized(true)
        initializingRef.current = false
        return
      }

      // Try to find support admin/employee
      try {
        const users = await getAllUsers()
        const supportAgent = users.find(u => u.role === 'admin') || users.find(u => u.role === 'employee') || users[0]
        if (supportAgent) {
          const chatId = await getOrCreateChat(
            supportAgent.uid || supportAgent.id,
            supportAgent.displayName || supportAgent.name || 'Support Team',
            supportAgent.email || 'support@Ashnexa Systems.com',
            supportAgent.role || 'admin'
          )
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
