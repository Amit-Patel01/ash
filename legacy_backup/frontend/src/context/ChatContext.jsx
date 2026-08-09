'use client'
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

  const syncRooms = useCallback(async () => {
    if (!currentUser?.uid) return

    const isEmployeeOrAdmin = ['admin', 'employee', 'mentor', 'team member', 'staff', 'developer'].includes(String(currentUser.role || '').toLowerCase())
    const currentRole = String(currentUser.role || '').toLowerCase()

    try {
      const url = isEmployeeOrAdmin && currentRole !== 'admin'
        ? api.supportChat.rooms(currentUser.role, currentUser.uid)
        : api.supportChat.rooms(null, currentUser.uid)

      const response = await fetch(url)
      const data = await readApiJson(response)

      if (response.ok && data.success && Array.isArray(data.rooms)) {
        let userChats = data.rooms

        // For employees/mentors/staff: show all rooms where they are a participant
        if (currentRole !== 'admin' && isEmployeeOrAdmin) {
          userChats = userChats.filter(r =>
            (r.participants && r.participants.includes(currentUser.uid))
          )
        } else if (currentRole === 'student') {
          // Students only see their own chats
          userChats = userChats.filter(r => r.participants && r.participants.includes(currentUser.uid))
        }
        // Admins see all rooms (no filter)

        userChats.sort((a, b) => getChatSortMs(b) - getChatSortMs(a))
        const dedupedChats = dedupeChats(userChats, currentUser.uid)

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

        const unreads = {}
        dedupedChats.forEach(chat => {
          unreads[chat.id] = chat.unreadCount || 0
        })
        setUnreadCounts(unreads)
      }
    } catch (err) {
      console.warn("Failed to sync chat rooms:", err)
    }
  }, [currentUser])

  const syncMessages = useCallback(async () => {
    if (!activeChatId) return

    try {
      const response = await fetch(api.supportChat.messages(activeChatId))
      const data = await readApiJson(response)
      if (response.ok && data.success && Array.isArray(data.messages)) {
        setMessages(data.messages)
      }
    } catch (err) {
      console.warn("Failed to sync messages:", err)
    }
  }, [activeChatId])

  // Sync rooms on interval
  useEffect(() => {
    if (!currentUser?.uid) {
      setChats([])
      setUnreadCounts({})
      return
    }

    syncRooms()
    const interval = setInterval(syncRooms, 5000)
    return () => clearInterval(interval)
  }, [currentUser, syncRooms])

  // Sync messages on interval
  useEffect(() => {
    if (!activeChatId) {
      setMessages([])
      return
    }

    syncMessages()
    const interval = setInterval(syncMessages, 3000)
    return () => clearInterval(interval)
  }, [activeChatId, syncMessages])

  const getOrCreateChat = useCallback(async (otherUserId, otherUserName, otherUserEmail, otherUserRole) => {
    if (!currentUser?.uid || !otherUserId || otherUserId === currentUser.uid) return null

    const currentRole = String(currentUser.role || '').toLowerCase()
    const otherRole = String(otherUserRole || '').toLowerCase()

    if (currentRole === 'student' && otherRole === 'student') {
      console.warn("Unauthorized chat: Customers cannot chat with other students.")
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
          userRole: currentUser.role || 'Student',
          otherUserId,
          otherUserName,
          otherUserEmail,
          otherUserRole: otherUserRole || 'User',
        })
      })

      const data = await readApiJson(response)
      if (data.success && data.chatId) {
        syncRooms()
        return data.chatId
      }
    } catch (err) {
      console.error('Error starting chat:', err)
      alert(`Failed to start chat: ${err.message}`)
    }
    return null
  }, [currentUser, syncRooms])

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
        syncRooms()
        return data.chatId
      }
    } catch (err) {
      console.error('Error creating group chat:', err)
      throw err
    }
    return null
  }, [currentUser, syncRooms])

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
        setMessages(prev => [...prev, data.message])
        syncRooms()
        return data.message.id
      }
    } catch (err) {
      console.error('sendMessage Error:', err)
      alert(err.message || 'Failed to send message. Please try again.')
      throw err
    }
  }, [currentUser, syncRooms])

  const sendAiReply = useCallback(async (chatId, promptText, recentMessages = []) => {
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
        syncRooms()
      }
    } catch (err) {
      console.error('Error clearing chat:', err)
      alert('Failed to clear chat. Please try again.')
    }
  }, [currentUser, syncRooms])

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
        syncRooms()
      }
    } catch (err) {
      console.error('Error deleting messages:', err)
      alert('Failed to delete messages. Please try again.')
    }
  }, [currentUser, syncRooms])

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

  const sendTypingIndicator = useCallback(async (chatId, isTyping) => {}, [])
  const handleTyping = useCallback((chatId) => {}, [])

  const markAsRead = useCallback(async (chatId) => {
    if (!currentUser?.uid || !chatId) return

    try {
      await fetch(api.supportChat.read, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, readerId: currentUser.uid })
      })
      syncRooms()
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }, [currentUser, syncRooms])

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
        syncRooms()
      }
    } catch (err) {
      console.error('Error starting video call:', err)
      alert('Failed to start video call.')
    }
  }, [currentUser, syncRooms])

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

    const participants = Array.isArray(chat.participants) ? chat.participants : []

    // Find the partner: the participant who is NOT the current user
    // If all participants are the same (buggy legacy data), use first participant
    let partnerId = participants.find(p => p !== currentUser.uid)
    if (!partnerId && participants.length > 0) {
      // Degenerate room: both participants are same UID — show self as partner
      partnerId = participants[0]
    }
    if (!partnerId) return null

    // Look up partner info. Also check all participantInfo entries
    // in case the key doesn't match exactly (legacy data)
    const partnerInfo =
      chat.participantInfo?.[partnerId] ||
      Object.values(chat.participantInfo || {}).find(
        (info, _, arr) => arr.length === 1 ? info : null
      ) ||
      {}

    const roleStr = String(partnerInfo.role || '').toLowerCase()
    const isAlwaysOnline = ['admin', 'employee', 'support', 'mentor', 'staff', 'developer'].includes(roleStr) || partnerId === AI_ASSISTANT_ID
    const hasRecentActivity = chat.lastMessageAt && (new Date() - new Date(chat.lastMessageAt)) < 300000

    return {
      uid: partnerId,
      name: getReadableName(partnerInfo),
      email: partnerInfo.email || '',
      role: partnerInfo.role || 'User',
      avatar: partnerInfo.avatar || partnerInfo.photoURL || '',
      photoURL: partnerInfo.avatar || partnerInfo.photoURL || '',
      status: (isAlwaysOnline || hasRecentActivity) ? 'online' : 'offline',
      lastSeen: chat.lastMessageAt ? new Date(chat.lastMessageAt).getTime() : null,
    }
  }, [currentUser])

  const takeoverChat = useCallback(async (chatId) => {
    if (!currentUser?.uid || !chatId) return

    try {
      const response = await fetch(api.supportChat.takeover, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          employeeId: currentUser.uid,
          employeeName: getReadableName(currentUser),
        })
      })

      const data = await readApiJson(response)
      if (data.success) {
        setChats(prev => prev.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              isTakenOver: true,
              assignedTo: getReadableName(currentUser)
            }
          }
          return chat
        }))
        console.log(`[MemoryChat] Successfully took over chat ${chatId}`)
        syncRooms()
      }
    } catch (err) {
      console.error('Error taking over chat:', err)
      alert('Failed to take over chat. Please try again.')
    }
  }, [currentUser, syncRooms])

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
    startVideoCall,
    takeoverChat
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
