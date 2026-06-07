import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import api, { readApiJson } from '../config/api'
import { useAuth } from './AuthContext'

const ChatContext = createContext(null)
const AI_ASSISTANT_ID = 'solutionhub-ai'
const AI_ASSISTANT_NAME = 'SolutionHub AI'

const getTimestampMs = (timestamp) => {
  if (!timestamp) return 0
  const parsed = new Date(timestamp).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

const getChatSortMs = (chat) => (
  getTimestampMs(chat?.lastMessageAt) ||
  getTimestampMs(chat?.updatedAt) ||
  getTimestampMs(chat?.createdAt)
)

const getDirectPairKey = (firstUserId, secondUserId) =>
  [firstUserId, secondUserId].filter(Boolean).sort().join('__')

const getConversationKey = (chat, currentUserId) => {
  if (!chat) return ''
  if (chat.isGroup) return `group:${chat.id}`

  const participants = Array.isArray(chat.participants) ? chat.participants : []
  if (participants.length === 2) {
    return `direct:${getDirectPairKey(participants[0], participants[1])}`
  }

  const partnerId = participants.find(uid => uid !== currentUserId)
  return partnerId ? `direct:${getDirectPairKey(currentUserId, partnerId)}` : `chat:${chat.id}`
}

const dedupeChats = (chatList, currentUserId) => {
  const seen = new Set()
  return chatList.filter(chat => {
    const key = getConversationKey(chat, currentUserId)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const getReadableName = (person = {}, fallback = 'Unknown') => {
  const rawName = String(person.displayName || person.name || '').trim()
  const rawEmail = String(person.email || '').trim()

  if (rawName && rawName.toLowerCase() !== 'user') return rawName
  if (rawEmail) return rawEmail.split('@')[0] || rawEmail
  return rawName || fallback
}

export function ChatProvider({ children }) {
  const { userProfile } = useAuth()
  const [currentUser, setCurrentUser] = useState(null)
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [userStatuses] = useState({})
  const [typingUsers] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})

  const prevChatsRef = useRef([])
  const activeChatIdRef = useRef(null)

  useEffect(() => {
    if (userProfile) {
      setCurrentUser(userProfile)
    } else {
      setCurrentUser(null)
    }
  }, [userProfile])

  useEffect(() => {
    activeChatIdRef.current = activeChatId
  }, [activeChatId])

  // Poll chats / rooms list
  useEffect(() => {
    if (!currentUser?.uid) {
      setChats([])
      setUnreadCounts({})
      return
    }

    const roleParam = (currentUser?.role && ['employee', 'staff'].includes(String(currentUser.role).toLowerCase())) ? currentUser.role : null

    const fetchRooms = async () => {
      try {
        const response = await fetch(api.supportChat.rooms(roleParam, currentUser.uid))
        if (!response.ok) return
        const data = await readApiJson(response)
        
        if (data.success && Array.isArray(data.rooms)) {
          let userChats = data.rooms
          const currentRole = String(currentUser.role || '').toLowerCase()
          
          if (currentRole === 'customer') {
            userChats = userChats.filter(r => r.participants.includes(currentUser.uid))
          }
          
          userChats.sort((a, b) => getChatSortMs(b) - getChatSortMs(a))
          const dedupedChats = dedupeChats(userChats, currentUser.uid)
          
          // Handle web notifications for new messages in other chat rooms
          if (prevChatsRef.current && prevChatsRef.current.length > 0) {
            dedupedChats.forEach(chat => {
              const prevChat = prevChatsRef.current.find(c => c.id === chat.id)
              const hasNewMessage = !prevChat || chat.lastMessageAt !== prevChat.lastMessageAt
              if (hasNewMessage && chat.lastSenderId !== currentUser.uid && chat.id !== activeChatIdRef.current) {
                const canNotify = typeof window !== 'undefined' && 'Notification' in window
                if (canNotify && window.Notification.permission === 'granted') {
                  new window.Notification(chat.lastSenderName || 'New Message', {
                    body: chat.lastMessage || 'New message received.',
                    icon: '/favicon.ico',
                  })
                }
              }
            })
          }
          
          prevChatsRef.current = dedupedChats
          setChats(dedupedChats)

          // Map unread counts from rooms
          const unreads = {}
          dedupedChats.forEach(chat => {
            unreads[chat.id] = chat.unreadCount || 0
          })
          setUnreadCounts(unreads)
        }
      } catch (err) {
        console.warn('Error fetching rooms:', err)
      }
    }

    fetchRooms()
    const interval = setInterval(fetchRooms, 2000)
    return () => clearInterval(interval)
  }, [currentUser])

  // Poll messages for the active chat
  useEffect(() => {
    if (!activeChatId) {
      setMessages([])
      return
    }

    const fetchMessages = async () => {
      try {
        const response = await fetch(api.supportChat.messages(activeChatId))
        if (!response.ok) return
        const data = await readApiJson(response)
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages)
        }
      } catch (err) {
        console.warn('Error fetching messages:', err)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 1200)
    return () => clearInterval(interval)
  }, [activeChatId])

  const getOrCreateChat = useCallback(async (otherUserId, otherUserName, otherUserEmail, otherUserRole) => {
    if (!currentUser?.uid || !otherUserId || otherUserId === currentUser.uid) return null

    const currentRole = String(currentUser.role || '').toLowerCase()
    const otherRole = String(otherUserRole || '').toLowerCase()

    if (currentRole === 'customer' && otherRole === 'customer') {
      console.warn("Unauthorized chat: Customers cannot chat with other customers.")
      return null
    }

    try {
      const response = await fetch(api.supportChat.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          userName: getReadableName(currentUser),
          userEmail: currentUser.email,
          userRole: currentUser.role || 'Customer',
          otherUserId,
          otherUserName,
          otherUserEmail,
          otherUserRole: otherUserRole || 'User',
        })
      })

      const data = await readApiJson(response)
      if (data.success && data.chatId) {
        return data.chatId
      }
    } catch (err) {
      console.error('Error starting chat:', err)
      alert(`Failed to start chat: ${err.message}`)
    }
    return null
  }, [currentUser])

  const createGroupChat = useCallback(async (selectedUsers, groupName) => {
    if (!currentUser?.uid || !selectedUsers.length) return null

    const participants = [currentUser.uid, ...selectedUsers.map(u => u.uid)]
    const participantInfo = {
      [currentUser.uid]: {
        name: getReadableName(currentUser),
        email: currentUser.email || '',
        role: currentUser.role || 'User'
      }
    }

    selectedUsers.forEach(u => {
      participantInfo[u.uid] = {
        name: getReadableName(u),
        email: u.email || '',
        role: u.role || 'User'
      }
    })

    try {
      const response = await fetch(api.supportChat.createGroup, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participants,
          participantInfo,
          groupName: groupName || 'New Team Group',
          createdBy: currentUser.uid
        })
      })

      const data = await readApiJson(response)
      if (data.success && data.chatId) {
        return data.chatId
      }
    } catch (err) {
      console.error('Error creating group chat:', err)
      throw err
    }
    return null
  }, [currentUser])

  const sendMessage = useCallback(async (chatId, text, imageFile) => {
    if (!currentUser?.uid || !chatId) return

    try {
      let imageUrl = null

      if (imageFile) {
        if (imageFile.size > 10 * 1024 * 1024) {
          throw new Error("Image too large. Please select an image under 10MB.")
        }

        try {
          const formData = new FormData()
          formData.append('chat-image', imageFile)
          
          const response = await fetch(api.uploadChat, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.message || `Upload failed with status ${response.status}`)
          }

          const data = await response.json()
          imageUrl = data.url
        } catch (uploadErr) {
          console.error("Image Upload Error:", uploadErr)
          throw new Error(`Upload Error: ${uploadErr.message}`)
        }
      }

      if (!text?.trim() && !imageUrl) {
        return
      }

      const messagePayload = {
        chatId,
        senderId: currentUser.uid,
        senderName: getReadableName(currentUser),
        senderEmail: currentUser.email,
        text: text?.trim() || '',
        imageUrl: imageUrl || null,
      }

      const response = await fetch(api.supportChat.send, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messagePayload)
      })

      const data = await readApiJson(response)
      if (data.success && data.message) {
        // Optimistically update messages local state
        setMessages(prev => [...prev, data.message])
        return data.message.id
      }
    } catch (err) {
      console.error('sendMessage Error:', err)
      alert(err.message || 'Failed to send message. Please try again.')
      throw err
    }
  }, [currentUser])

  const sendAiReply = useCallback(async (chatId, promptText, recentMessages = []) => {
    // The backend automatically triggers intent classification and AI response on send message.
    // We provide a natural delay here to keep the visual AI typing indicators flowing on screen.
    await new Promise(resolve => setTimeout(resolve, 1500))
    return null
  }, [])

  const clearChat = useCallback(async (chatId) => {
    if (!currentUser?.uid || !chatId) return

    if (!window.confirm('Are you sure you want to clear all messages in this chat? This cannot be undone.')) return

    try {
      const response = await fetch(api.supportChat.clear, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId })
      })

      const data = await readApiJson(response)
      if (data.success) {
        setMessages([])
      }
    } catch (err) {
      console.error('Error clearing chat:', err)
      alert('Failed to clear chat. Please try again.')
    }
  }, [currentUser])

  const deleteSpecificMessages = useCallback(async (chatId, messageIds) => {
    if (!currentUser?.uid || !chatId || !messageIds?.length) return

    if (!window.confirm(`Are you sure you want to delete ${messageIds.length} message(s)?`)) return

    try {
      const response = await fetch(api.supportChat.deleteMessages, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, messageIds })
      })

      const data = await readApiJson(response)
      if (data.success) {
        setMessages(prev => prev.filter(msg => !messageIds.includes(msg.id)))
      }
    } catch (err) {
      console.error('Error deleting messages:', err)
      alert('Failed to delete messages. Please try again.')
    }
  }, [currentUser])

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('This browser does not support desktop notifications.')
      return
    }

    if (window.Notification.permission !== 'granted') {
      const permission = await window.Notification.requestPermission()
      if (permission === 'granted') {
        new window.Notification('Alert Activated', {
          body: 'You will now receive message notifications!',
        })
      }
    }
  }, [])

  const sendTypingIndicator = useCallback(async (chatId, isTyping) => {
    // No-op for REST backend
  }, [])

  const handleTyping = useCallback((chatId) => {
    // No-op for REST backend
  }, [])

  const markAsRead = useCallback(async (chatId) => {
    if (!currentUser?.uid || !chatId) return

    try {
      await fetch(api.supportChat.read, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, readerId: currentUser.uid })
      })
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }, [currentUser])

  const startVideoCall = useCallback(async (chatId) => {
    if (!currentUser?.uid || !chatId) return

    const roomName = `SolutionHub-${chatId}`
    const callUrl = `https://meet.jit.si/${roomName}`
    
    try {
      const response = await fetch(api.supportChat.send, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          senderId: currentUser.uid,
          senderName: getReadableName(currentUser),
          senderEmail: currentUser.email,
          text: `Starting a video call...`,
          type: 'video-call',
          callUrl,
        })
      })

      const data = await readApiJson(response)
      if (data.success && data.message) {
        setMessages(prev => [...prev, data.message])
        window.open(callUrl, '_blank')
      }
    } catch (err) {
      console.error('Error starting video call:', err)
      alert('Failed to start video call.')
    }
  }, [currentUser])

  const getChatPartner = useCallback((chat) => {
    if (!chat || !currentUser?.uid) return null
    
    if (chat.isGroup) {
      return {
        uid: chat.id,
        name: chat.groupName || 'Team Group',
        isGroup: true,
        participantsCount: chat.participants.length,
        status: 'online'
      }
    }

    const partnerId = chat.participants.find(p => p !== currentUser.uid)
    if (!partnerId) return null
    
    const partnerInfo = chat.participantInfo?.[partnerId] || {}
    const roleStr = String(partnerInfo.role || '').toLowerCase()
    const isAlwaysOnline = ['admin', 'employee', 'support'].includes(roleStr) || partnerId === AI_ASSISTANT_ID
    const hasRecentActivity = chat.lastMessageAt && (new Date() - new Date(chat.lastMessageAt)) < 300000

    return {
      uid: partnerId,
      name: getReadableName(partnerInfo),
      email: partnerInfo.email || '',
      role: partnerInfo.role || 'User',
      status: (isAlwaysOnline || hasRecentActivity) ? 'online' : 'offline',
      lastSeen: chat.lastMessageAt ? new Date(chat.lastMessageAt).getTime() : null,
    }
  }, [currentUser])

  const value = {
    currentUser,
    chats,
    activeChatId,
    setActiveChatId,
    messages,
    userStatuses,
    typingUsers,
    unreadCounts,
    getOrCreateChat,
    sendMessage,
    sendAiReply,
    clearChat,
    deleteSpecificMessages,
    requestNotificationPermission,
    sendTypingIndicator,
    handleTyping,
    markAsRead,
    getChatPartner,
    createGroupChat,
    startVideoCall
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) throw new Error('useChat must be used within ChatProvider')
  return context
}
