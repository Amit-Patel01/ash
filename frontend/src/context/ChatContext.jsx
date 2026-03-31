import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  collection, addDoc, onSnapshot, query, orderBy, doc, setDoc,
  updateDoc, deleteDoc, serverTimestamp, where, getDocs, getDoc, limit
} from 'firebase/firestore'
import { db, auth } from '../config/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import api from '../config/api'
import { useAuth } from './AuthContext'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const { userProfile } = useAuth()
  const [currentUser, setCurrentUser] = useState(null)
  const [chats, setChats] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [userStatuses, setUserStatuses] = useState({})
  const [typingUsers, setTypingUsers] = useState({})
  const [unreadCounts, setUnreadCounts] = useState({})
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    if (userProfile) {
      setCurrentUser(userProfile)
    } else {
      setCurrentUser(null)
    }
  }, [userProfile])

  // Listen to user's chats
  useEffect(() => {
    if (!currentUser?.uid) return

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      chatsData.sort((a, b) => {
        const aTime = a.lastMessageAt?.seconds || 0
        const bTime = b.lastMessageAt?.seconds || 0
        return bTime - aTime
      })
      setChats(chatsData)

      // Handle notifications
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const chat = change.doc.data()
          const isNewMessage = chat.lastSenderId !== currentUser.uid
          const isNotActiveChat = change.doc.id !== activeChatId
          const isTabHidden = document.visibilityState === 'hidden'

          if (isNewMessage) {
            if (Notification.permission === 'granted') {
              new Notification(chat.lastSenderName || 'New Message', {
                body: chat.lastMessage,
                icon: '/favicon.ico',
              })
            }
          }
        }
      })
    })

    return unsubscribe
  }, [currentUser?.uid])

  // Listen to messages in active chat
  useEffect(() => {
    if (!activeChatId) {
      setMessages([])
      return
    }

    const q = query(
      collection(db, 'chats', activeChatId, 'messages'),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setMessages(msgs)
    })

    return unsubscribe
  }, [activeChatId])

  // Listen to user statuses
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'status'), (snapshot) => {
      const statuses = {}
      snapshot.docs.forEach(d => {
        statuses[d.id] = d.data()
      })
      setUserStatuses(statuses)
    })
    return unsubscribe
  }, [])

  // Listen to typing indicators in active chat
  useEffect(() => {
    if (!activeChatId) return

    const unsubscribe = onSnapshot(
      collection(db, 'chats', activeChatId, 'typing'),
      (snapshot) => {
        const typing = {}
        snapshot.docs.forEach(d => {
          if (d.id !== currentUser?.uid && d.data().isTyping) {
            typing[d.id] = d.data()
          }
        })
        setTypingUsers(typing)
      }
    )

    return unsubscribe
  }, [activeChatId, currentUser?.uid])

  // Track unread messages
  useEffect(() => {
    if (!currentUser?.uid || chats.length === 0) return

    const unsubscribes = chats.map(chat => {
      const chatUnreadRef = collection(db, 'chats', chat.id, 'messages')
      return onSnapshot(chatUnreadRef, (snapshot) => {
        let count = 0
        snapshot.docs.forEach(d => {
          const msg = d.data()
          if (msg.senderId !== currentUser.uid && msg.status !== 'read') {
            count++
          }
        })
        setUnreadCounts(prev => ({ ...prev, [chat.id]: count }))
      })
    })

    return () => unsubscribes.forEach(unsub => unsub())
  }, [chats, currentUser?.uid])

  const getOrCreateChat = useCallback(async (otherUserId, otherUserName, otherUserEmail, otherUserRole) => {
    if (!currentUser?.uid) return null

    // SECURITY: Prevent customer-to-customer chat creation
    if (currentUser.role === 'customer' && otherUserRole === 'customer') {
      console.warn("Unauthorized chat: Customers cannot chat with other customers.")
      return null
    }

    // Check if chat already exists
    const existingChat = chats.find(c =>
      c.participants.includes(otherUserId) && c.participants.length === 2
    )
    if (existingChat) return existingChat.id

    // Create new chat
    const chatData = {
      participants: [currentUser.uid, otherUserId],
      participantInfo: {
        [currentUser.uid]: {
          name: currentUser.displayName || currentUser.email,
          email: currentUser.email,
          role: currentUser.role || 'User'
        },
        [otherUserId]: {
          name: otherUserName,
          email: otherUserEmail,
          role: otherUserRole || 'User'
        }
      },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    }

    const chatRef = await addDoc(collection(db, 'chats'), chatData)

    // AUTOMATIC WELCOME MESSAGE
    // If a customer starts a chat with a staff member (admin/employee), send an automatic greeting
    if (currentUser.role === 'customer' && (otherUserRole === 'admin' || otherUserRole === 'employee')) {
      const welcomeText = `Hello! 👋 Thanks for reaching out. A member of our support team will be with you shortly. How can we help you today?`
      
      await addDoc(collection(db, 'chats', chatRef.id, 'messages'), {
        senderId: otherUserId,
        senderName: otherUserName,
        text: welcomeText,
        timestamp: serverTimestamp(),
        status: 'sent'
      })

      // Update chat preview
      await updateDoc(chatRef, {
        lastMessage: welcomeText,
        lastMessageAt: serverTimestamp(),
        lastSenderId: otherUserId,
        lastSenderName: otherUserName
      })
    }

    return chatRef.id
  }, [currentUser, chats])

  const createGroupChat = useCallback(async (selectedUsers, groupName) => {
    if (!currentUser?.uid || !selectedUsers.length) return null

    const participants = [currentUser.uid, ...selectedUsers.map(u => u.uid)]
    const participantInfo = {
      [currentUser.uid]: {
        name: currentUser.displayName,
        email: currentUser.email,
        role: currentUser.role
      }
    }

    selectedUsers.forEach(u => {
      participantInfo[u.uid] = {
        name: u.displayName || u.name,
        email: u.email,
        role: u.role
      }
    })

    const chatData = {
      participants,
      participantInfo,
      groupName: groupName || 'New Team Group',
      isGroup: true,
      lastMessage: 'Group created',
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      createdBy: currentUser.uid
    }

    try {
      const chatRef = await addDoc(collection(db, 'chats'), chatData)
      return chatRef.id
    } catch (err) {
      console.error('Error creating group chat:', err)
      throw err
    }
  }, [currentUser])

  const sendMessage = useCallback(async (chatId, text, imageFile) => {
    if (!currentUser?.uid || !chatId) return

    try {
      let imageUrl = null

      if (imageFile) {
        console.log("Starting image upload via backend...", { name: imageFile.name, size: imageFile.size });
        
        if (imageFile.size > 10 * 1024 * 1024) {
          throw new Error("Image too large. Please select an image under 10MB.");
        }

        try {
          const formData = new FormData();
          formData.append('chat-image', imageFile);
          
          const response = await fetch(api.uploadChat, {
            method: 'POST',
            body: formData,
            // Header for FormData is automatically set by fetch with boundary
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Upload failed with status ${response.status}`);
          }

          const data = await response.json();
          imageUrl = data.url;
          console.log("Backend upload successful, URL obtained:", imageUrl);
        } catch (uploadErr) {
          console.error("Backend Upload Error:", uploadErr);
          throw new Error(`Upload Error: ${uploadErr.message}. Make sure the backend server is running.`);
        }
      }

      if (!text?.trim() && !imageUrl) {
        console.warn("Empty message, ignoring.");
        return;
      }

      const messageData = {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        senderEmail: currentUser.email,
        text: text?.trim() || '',
        imageUrl: imageUrl || null,
        timestamp: serverTimestamp(),
        status: 'sent',
      }

      console.log("Adding message to Firestore...", messageData);
      const msgRef = await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);
      console.log("Message added with ID:", msgRef.id);

      // Update chat last message
      const lastMsgPreview = text?.trim() || (imageUrl ? '📷 Image' : (messageData.type === 'video-call' ? '📹 Video Call' : ''));
      const updateData = {
        lastMessage: lastMsgPreview,
        lastMessageAt: serverTimestamp(),
        lastSenderId: currentUser.uid,
        lastSenderName: currentUser.displayName || currentUser.email,
      }
      
      await updateDoc(doc(db, 'chats', chatId), updateData);

      // Clear typing indicator
      try {
        await setDoc(doc(db, 'chats', chatId, 'typing', currentUser.uid), {
          isTyping: false,
          name: currentUser.displayName || currentUser.email,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (typingErr) {
        console.warn("Failed to clear typing indicator:", typingErr.message);
      }

      return msgRef.id;
    } catch (err) {
      console.error('Final sendMessage Error:', err);
      alert(err.message || 'Failed to send message. Please try again.');
      throw err;
    }
  }, [currentUser])

  const clearChat = useCallback(async (chatId) => {
    if (!currentUser?.uid || !chatId) return

    if (!window.confirm('Are you sure you want to clear all messages in this chat? This cannot be undone.')) return

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages')
      const snapshot = await getDocs(messagesRef)
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Update chat last message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: 'Chat cleared',
        lastMessageAt: serverTimestamp(),
      })

      console.log('Chat cleared successfully:', chatId)
    } catch (err) {
      console.error('Error clearing chat:', err)
      alert('Failed to clear chat. Please try again.')
    }
  }, [currentUser])

  const deleteSpecificMessages = useCallback(async (chatId, messageIds) => {
    if (!currentUser?.uid || !chatId || !messageIds?.length) return

    if (!window.confirm(`Are you sure you want to delete ${messageIds.length} message(s)?`)) return

    try {
      const deletePromises = messageIds.map(id => deleteDoc(doc(db, 'chats', chatId, 'messages', id)))
      await Promise.all(deletePromises)

      // Get latest message to update chat preview
      const messagesRef = collection(db, 'chats', chatId, 'messages')
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1))
      const snapshot = await getDocs(q)
      
      let lastMsg = 'Chat cleared'
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data()
        lastMsg = data.text || (data.imageUrl ? '📷 Image' : 'Message deleted')
      }

      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: lastMsg,
        lastMessageAt: serverTimestamp(),
      })

      console.log(`${messageIds.length} messages deleted successfully from chat:`, chatId)
    } catch (err) {
      console.error('Error deleting specific messages:', err)
      alert('Failed to delete messages. Please try again.')
    }
  }, [currentUser])

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.')
      return
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        new Notification('Alert Activated', {
          body: 'You will now receive message notifications!',
        })
      }
    }
  }, [])

  const sendTypingIndicator = useCallback(async (chatId, isTyping) => {
    if (!currentUser?.uid || !chatId) return

    await setDoc(doc(db, 'chats', chatId, 'typing', currentUser.uid), {
      isTyping,
      name: currentUser.displayName || currentUser.email,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }, [currentUser])

  const handleTyping = useCallback((chatId) => {
    sendTypingIndicator(chatId, true)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(chatId, false)
    }, 2000)
  }, [sendTypingIndicator])

  const markAsRead = useCallback(async (chatId) => {
    if (!currentUser?.uid || !chatId) return

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      where('senderId', '!=', currentUser.uid),
      limit(50)
    )

    try {
      const snapshot = await getDocs(q)
      if (snapshot.empty) return

      const promises = snapshot.docs
        .filter(d => d.data().status !== 'read')
        .map(d => 
        updateDoc(doc(db, 'chats', chatId, 'messages', d.id), { status: 'read' })
      )
      await Promise.all(promises)
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }, [currentUser])

  const startVideoCall = useCallback(async (chatId) => {
    if (!currentUser?.uid || !chatId) return

    const roomName = `SolutionHub-${chatId}`
    const callUrl = `https://meet.jit.si/${roomName}`
    
    // Send a special message to the chat
    const messageData = {
      senderId: currentUser.uid,
      senderName: currentUser.displayName || currentUser.email,
      text: `Starting a video call...`,
      type: 'video-call',
      callUrl,
      timestamp: serverTimestamp(),
      status: 'sent'
    }

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), messageData)
      // Also update the chat last message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: '📹 Video Call Started',
        lastMessageAt: serverTimestamp(),
        lastSenderId: currentUser.uid,
        lastSenderName: currentUser.displayName || currentUser.email
      })
      
      // Open the call for the initiator
      window.open(callUrl, '_blank')
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
        status: 'online' // Groups are always "online" for UI
      }
    }

    const partnerId = chat.participants.find(p => p !== currentUser.uid)
    if (!partnerId) return null
    
    const statusData = userStatuses[partnerId]
    return {
      uid: partnerId,
      name: chat.participantInfo?.[partnerId]?.name || 'Unknown',
      email: chat.participantInfo?.[partnerId]?.email || '',
      role: chat.participantInfo?.[partnerId]?.role || 'User',
      status: statusData?.state || 'offline',
      lastSeen: statusData?.lastSeen?.toMillis ? statusData.lastSeen.toMillis() : statusData?.lastSeen,
    }
  }, [currentUser, userStatuses])

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
    sendMessage, clearChat, deleteSpecificMessages, requestNotificationPermission, sendTypingIndicator, handleTyping,
    markAsRead, getChatPartner, createGroupChat, startVideoCall,
    unreadCounts, userStatuses
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
