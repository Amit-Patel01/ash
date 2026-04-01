import { useState, useEffect, useRef, useCallback } from 'react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'

function formatTime(timestamp) {
  if (!timestamp?.seconds) return ''
  const date = new Date(timestamp.seconds * 1000)
  const now = new Date()
  const diff = now - date
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatMessageTime(timestamp) {
  if (!timestamp?.seconds) return ''
  const date = new Date(timestamp.seconds * 1000)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function getDayLabel(timestamp) {
  if (!timestamp?.seconds) return ''
  const date = new Date(timestamp.seconds * 1000)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (messageDate.getTime() === today.getTime()) return 'Today'
  if (messageDate.getTime() === yesterday.getTime()) return 'Yesterday'
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export default function ChatPanel({ embedded = false }) {
  const {
    chats, activeChatId, setActiveChatId, messages,
    sendMessage, clearChat, deleteSpecificMessages, requestNotificationPermission, handleTyping, typingUsers, markAsRead,
    getChatPartner, unreadCounts, userStatuses, getOrCreateChat, createGroupChat, startVideoCall, currentUser
  } = useChat()
  const { getAllUsers, userProfile } = useAuth()
  const [messageText, setMessageText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sending, setSending] = useState(false)
  const [imageView, setImageView] = useState(null)
  const [showInfo, setShowInfo] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const messageInputRef = useRef(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef(null)
  const [showGroupCreate, setShowGroupCreate] = useState(false)
  const [selectedUsersForGroup, setSelectedUsersForGroup] = useState([])
  const [newGroupName, setNewGroupName] = useState('')
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const moreMenuRef = useRef(null)

  const emojis = [
    { cat: 'Smileys', icons: ['😀', '😃', '😄', '😁', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕'] },
    { cat: 'Gestures', icons: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍', '💅', '🤳', '💪', '🦾'] },
    { cat: 'Hearts', icons: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'] },
    { cat: 'Nature', icons: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔'] },
    { cat: 'Objects', icons: ['⌚', '📱', '📲', '💻', '⌨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', ' DVD', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒', '🛠', '⛏', '🪚', '🔩', '⚙', '🪗', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡', '⚔', '🛡', '🚬', '⚰', '🪦', '⚱', '🏺', '🔮', '📿', '🧿', '💈', '⚗', '🔭', '🔬', '🕳', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🪠', '🧺', '🧻', '🧼', '🪥', '🧽', '🧯', '🛒', '🚬', '🔔', '🔕'] }
  ]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false)
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addEmoji = (emoji) => {
    setMessageText(prev => prev + emoji)
    // Don't close so they can add multiple
  }

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    scrollToBottom()
    // Small delay to ensure images are partially rendered
    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [messages, typingUsers, imagePreview])

  useEffect(() => {
    if (activeChatId) {
      markAsRead(activeChatId)
      messageInputRef.current?.focus()
    }
  }, [activeChatId, markAsRead])

  useEffect(() => {
    if (showNewChat && getAllUsers) {
      getAllUsers().then(users => {
        let filtered = users.filter(u => u.uid !== currentUser?.uid)
        
        // CUSTOMER PRIVACY: Hide other customers from search if current user is a customer
        if (userProfile?.role === 'customer') {
          filtered = filtered.filter(u => u.role === 'admin' || u.role === 'employee')
        }
        
        setAllUsers(filtered)
      }).catch(console.error)
    }
  }, [showNewChat, getAllUsers, currentUser, userProfile])

  const handleSend = async () => {
    if ((!messageText.trim() && !imageFile) || sending) return
    setSending(true)
    try {
      await sendMessage(activeChatId, messageText.trim(), imageFile)
      setMessageText('')
      setImageFile(null)
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error('Send error:', err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedUsersForGroup.length === 0) {
      alert('Please provide a group name and select at least one member')
      return
    }
    setSending(true)
    try {
      const chatId = await createGroupChat(selectedUsersForGroup, newGroupName)
      if (chatId) {
        setActiveChatId(chatId)
        setShowGroupCreate(false)
        setShowNewChat(false)
        setSelectedUsersForGroup([])
        setNewGroupName('')
      }
    } catch (err) {
      console.error('Group creation error:', err)
    } finally {
      setSending(false)
    }
  }

  const toggleUserSelection = (user) => {
    const isSelected = selectedUsersForGroup.find(u => u.uid === user.uid)
    if (isSelected) {
      setSelectedUsersForGroup(selectedUsersForGroup.filter(u => u.uid !== user.uid))
    } else {
      setSelectedUsersForGroup([...selectedUsersForGroup, user])
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const startNewChat = async (user) => {
    const chatId = await getOrCreateChat(user.uid, user.displayName, user.email, user.role)
    if (chatId) {
      setActiveChatId(chatId)
      setShowNewChat(false)
    }
  }

  const toggleMessageSelection = (msgId) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(msgId)) next.delete(msgId)
      else next.add(msgId)
      return next
    })
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    await deleteSpecificMessages(activeChatId, Array.from(selectedIds))
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  const activeChat = chats.find(c => c.id === activeChatId)
  const partner = activeChat ? getChatPartner(activeChat) : null
  const isPartnerTyping = partner && typingUsers[partner.uid]
  const isPartnerOnline = partner?.status === 'online'

  const filteredChats = chats.filter(chat => {
    const p = getChatPartner(chat)
    if (!p) return false
    
    // CUSTOMER PRIVACY: Hide conversations with other customers if current user is a customer
    if (userProfile?.role === 'customer' && p.role === 'customer') {
      return false
    }

    if (!searchQuery) return true
    return p?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const filteredUsers = allUsers.filter(u => {
    if (!searchQuery) return true
    return u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <div className={`flex h-full w-full bg-white/20 dark:bg-gray-950/20 backdrop-blur-3xl transition-colors duration-300 relative ${embedded ? '' : 'rounded-3xl shadow-2xl border border-white dark:border-white/5 overflow-hidden'}`}>
      {/* Sidebar - List of messages */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-gray-900/40 backdrop-blur-2xl transition-all duration-300 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Messages</h2>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all shadow-sm dark:shadow-none"
            />
          </div>
        </div>

        {showNewChat ? (
          <div className="flex-1 overflow-y-auto px-2 py-4 scrollbar-thin">
            <p className="text-[10px] text-slate-500 px-3 mb-2 font-black uppercase tracking-widest">New Conversation</p>
            {filteredUsers.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-12 italic">No users found</p>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.uid}
                  onClick={() => startNewChat(user)}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-left"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                      {(user.displayName || user.email)?.charAt(0).toUpperCase()}
                    </div>
                    {userStatuses[user.uid]?.state === 'online' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.displayName || 'Unknown'}</p>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-bold truncate uppercase tracking-wider">{user.role || 'User'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
            {filteredChats.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm font-medium">No conversations yet</p>
                <button onClick={() => setShowNewChat(true)} className="mt-2 text-blue-400 text-xs hover:text-blue-300">Start one</button>
              </div>
            ) : (
              filteredChats.map(chat => {
                const p = getChatPartner(chat)
                if (!p) return null
                const unread = unreadCounts[chat.id] || 0
                const isActive = chat.id === activeChatId
                return (
                  <button
                    key={chat.id}
                    onClick={() => { setActiveChatId(chat.id); setShowNewChat(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${isActive ? 'bg-blue-500/10 border border-blue-500/20' : 'hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'}`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-sm font-bold text-white">
                        {p.name?.charAt(0).toUpperCase()}
                      </div>
                      {p.status === 'online' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-bold truncate ${unread > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{p.name}</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0 ml-2">{formatTime(chat.lastMessageAt)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className={`text-[13px] truncate ${unread > 0 ? 'text-slate-700 dark:text-gray-200 font-semibold' : 'text-slate-500 dark:text-gray-500'}`}>{chat.lastMessage || 'No messages yet'}</p>
                        {unread > 0 && (
                          <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Chat View */}
      {activeChatId && partner ? (
        <div className={`flex-1 flex flex-col ${!activeChatId && 'hidden md:flex'}`}>
          {/* Header */}
          <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-200/50 dark:border-white/5 bg-white/60 dark:bg-gray-900/50 backdrop-blur-md">
            <button
              onClick={() => setActiveChatId(null)}
              className="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-gray-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-sm font-black text-white shadow-lg">
                {partner.name?.charAt(0).toUpperCase()}
              </div>
              {isPartnerOnline && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"></span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-slate-900 dark:text-white leading-tight">{partner.name}</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isPartnerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400 dark:bg-slate-600'}`}></span>
                <p className={`text-[11px] font-black tracking-tighter ${isPartnerOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {isPartnerTyping ? 'typing...' : isPartnerOnline ? 'Online' : partner.lastSeen ? `Last seen ${formatTime({ seconds: new Date(partner.lastSeen).getTime() / 1000 })}` : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Video Call Button (For Staff/Groups) - Visible on all screens if eligible */}
              {((partner.role !== 'customer' && userProfile?.role !== 'customer') || partner.isGroup) && (
                <button
                  onClick={() => startVideoCall(activeChatId)}
                  className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-500/10 transition-all group"
                  title="Start Video Call"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </button>
              )}

              {/* Desktop Actions (Hidden on Mobile) */}
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2">
                {/* Notification Toggle */}
                <button
                  onClick={requestNotificationPermission}
                  className={`p-2 rounded-xl transition-all ${Notification.permission === 'granted' ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-500 hover:text-blue-500 hover:bg-blue-500/10'}`}
                  title={Notification.permission === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
                >
                  {Notification.permission === 'granted' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  )}
                </button>

                {/* Select Mode Toggle */}
                <button
                  onClick={() => {
                    setSelectionMode(!selectionMode)
                    setSelectedIds(new Set())
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${selectionMode ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-500 hover:bg-blue-500/20'}`}
                >
                  {selectionMode ? 'Cancel' : 'Select'}
                </button>

                {/* Clear Chat Button */}
                {!selectionMode && (
                  <button
                    onClick={() => clearChat(activeChatId)}
                    className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all group"
                    title="Clear Conversation"
                  >
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                )}

                {/* Info Button */}
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className={`p-2 rounded-xl transition-all ${showInfo ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'}`}
                  title="Chat Info"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                  </svg>
                </button>
              </div>

              {/* Mobile More Menu */}
              <div className="relative sm:hidden" ref={moreMenuRef}>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className={`p-2 rounded-xl transition-all ${showMoreMenu ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' : 'text-slate-500'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                  </svg>
                </button>

                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-2 z-[60] animate-in slide-in-from-top-2 fade-in duration-200">
                    <button
                      onClick={() => {
                        setSelectionMode(!selectionMode)
                        setSelectedIds(new Set())
                        setShowMoreMenu(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 text-sm font-bold transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {selectionMode ? 'Cancel Selection' : 'Select Messages'}
                    </button>
                    
                    <button
                      onClick={() => { requestNotificationPermission(); setShowMoreMenu(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 text-sm font-bold transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                      </svg>
                      Notifications
                    </button>

                    <button
                      onClick={() => { setShowInfo(true); setShowMoreMenu(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-gray-300 text-sm font-bold transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                      </svg>
                      Contact Info
                    </button>

                    <div className="h-px bg-gray-100 dark:bg-white/5 my-1 mx-2"></div>

                    <button
                      onClick={() => { clearChat(activeChatId); setShowMoreMenu(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-bold transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                      Clear Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20 dark:bg-transparent scrollbar-thin">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 dark:text-gray-400 text-sm">Start your conversation with {partner.name}</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUser?.uid
                const showAvatar = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId
                
                // Day separator logic
                const currentDate = getDayLabel(msg.timestamp)
                const prevDate = idx > 0 ? getDayLabel(messages[idx - 1].timestamp) : null
                const showDateHeader = currentDate !== prevDate

                return (
                  <div key={msg.id} className="space-y-6">
                    {showDateHeader && (
                      <div className="flex items-center justify-center py-4">
                        <div className="px-5 py-1.5 rounded-full bg-slate-200/50 dark:bg-white/5 border border-slate-300/30 dark:border-white/10 backdrop-blur-sm">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-gray-400">
                            {currentDate}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full relative group/row`}>
                      <div className={`flex items-end gap-2 max-w-[92%] sm:max-w-[70%] ${isMe ? 'flex-row-reverse' : ''}`}>
                        {selectionMode ? (
                          <div 
                            onClick={() => toggleMessageSelection(msg.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all self-center shrink-0 ${selectedIds.has(msg.id) ? 'bg-blue-500 border-blue-500 scale-110 shadow-lg shadow-blue-500/20' : 'bg-transparent border-slate-300 dark:border-white/20 hover:border-blue-500'}`}
                          >
                            {selectedIds.has(msg.id) && (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            )}
                          </div>
                        ) : (
                          !isMe && (
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mb-1 ${showAvatar ? 'visible' : 'invisible'}`}>
                              {msg.senderName?.charAt(0).toUpperCase()}
                            </div>
                          )
                        )}
                        <div 
                          onClick={() => selectionMode && toggleMessageSelection(msg.id)}
                          className={`group relative ${isMe ? 'items-end' : 'items-start'} flex flex-col ${selectionMode ? 'cursor-pointer' : ''}`}
                        >
                          <div className={`rounded-2xl px-4 py-3 shadow-md transition-all ${selectedIds.has(msg.id) ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900 opacity-90' : ''} ${isMe ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-blue-500/10' : 'bg-slate-50 dark:bg-gray-800/80 text-slate-900 dark:text-white rounded-bl-none border border-gray-100 dark:border-white/5 shadow-sm'}`}>
                            {msg.type === 'video-call' ? (
                              <div className="flex flex-col gap-4 p-2 min-w-[200px] sm:min-w-[280px]">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                                    <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-black text-[13px] uppercase tracking-wider text-blue-400">Team Video Call</p>
                                    <p className="text-[11px] opacity-70 font-medium">{isMe ? 'You started a call' : 'A call has started'}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (msg.callUrl) window.open(msg.callUrl, '_blank');
                                  }}
                                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95"
                                >
                                  Join Call
                                </button>
                              </div>
                            ) : (
                              <>
                                {msg.imageUrl && (
                                  <div className="relative group/img mb-2 max-w-[300px]">
                                    <img
                                      src={msg.imageUrl}
                                      alt="Shared"
                                      className="rounded-xl object-cover cursor-pointer hover:brightness-90 transition-all shadow-md"
                                      onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                      onClick={(e) => {
                                        if (selectionMode) {
                                          e.stopPropagation()
                                          toggleMessageSelection(msg.id)
                                        } else {
                                          setImageView(msg.imageUrl)
                                        }
                                      }}
                                    />
                                  </div>
                                )}
                                {msg.text && <p className="text-[14px] leading-relaxed font-medium whitespace-pre-wrap break-words">{msg.text}</p>}
                              </>
                            )}
                          </div>
                          <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] text-gray-600 font-medium">{formatMessageTime(msg.timestamp)}</span>
                            {isMe && (
                              <span className="flex items-center">
                                {msg.status === 'read' || msg.status === 'seen' ? (
                                  <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 12.8571L9 17.5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M9 12.1429L14.5 17.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 12.8571L9 17.5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                                {(msg.status === 'read' || msg.status === 'seen') && <span className="text-[9px] text-blue-500/80 ml-0.5 font-bold uppercase tracking-tighter">Seen</span>}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}

            {/* Typing indicator */}
            {isPartnerTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {partner.name?.charAt(0).toUpperCase()}
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div className="h-6"></div>
            <div ref={messagesEndRef} />
          </div>

          {/* Selection Actions (Floating Bar) */}
          {selectionMode && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
              <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-white/10 dark:border-slate-200">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest opacity-50">Selected</span>
                  <span className="text-lg font-bold leading-none">{selectedIds.size} Messages</span>
                </div>
                <div className="h-8 w-px bg-white/10 dark:bg-slate-200"></div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectionMode(false)
                      setSelectedIds(new Set())
                    }}
                    className="px-4 py-2 text-sm font-bold hover:bg-white/10 dark:hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    disabled={selectedIds.size === 0}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {imagePreview && (
            <div className="px-4 py-2 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-gray-900/50">
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
                <button onClick={removeImage} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-950/50 backdrop-blur-md pb-[env(safe-area-inset-bottom,16px)]">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 sm:p-2.5 rounded-full text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex-shrink-0 active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 sm:p-2.5 rounded-full transition-all active:scale-95 ${showEmojiPicker ? 'bg-blue-500/20 text-blue-500' : 'text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                </button>

                {showEmojiPicker && (
                  <div 
                    ref={emojiPickerRef}
                    className="absolute bottom-full left-0 mb-4 w-[280px] sm:w-[320px] max-h-[300px] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl z-[60] p-4 scrollbar-thin animate-in slide-in-from-bottom-2 fade-in duration-200"
                  >
                    {emojis.map((group, idx) => (
                      <div key={idx} className="mb-4 last:mb-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 px-1">{group.cat}</p>
                        <div className="grid grid-cols-7 sm:grid-cols-8 gap-1">
                          {group.icons.map((emoji, i) => (
                            <button
                              key={i}
                              onClick={() => addEmoji(emoji)}
                              className="text-xl hover:bg-slate-100 dark:hover:bg-white/5 p-1.5 rounded-lg transition-all hover:scale-125 active:scale-95"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 relative">
                <textarea
                  ref={messageInputRef}
                  value={messageText}
                  onChange={e => {
                    setMessageText(e.target.value)
                    if (activeChatId) handleTyping(activeChatId)
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  rows={1}
                  className="w-full px-3 sm:px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all shadow-sm dark:shadow-none resize-none"
                  style={{ maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={sending || (!messageText.trim() && !imageFile)}
                className="p-2 sm:p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 active:scale-95 shadow-lg shadow-blue-500/20"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`flex-1 flex items-center justify-center bg-slate-50/10 dark:bg-transparent ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-medium">Select a conversation to start messaging</p>
            <p className="text-gray-600 text-xs mt-1">or start a new one</p>
          </div>
        </div>
      )}

      {/* New Chat / Group Create Overlay */}
      {showNewChat && (
        <div className="absolute inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col p-4 sm:p-6 animate-in slide-in-from-left duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {showGroupCreate ? 'Create Team Group' : 'New Conversation'}
            </h2>
            <button 
              onClick={() => { setShowNewChat(false); setShowGroupCreate(false); setSelectedUsersForGroup([]) }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!showGroupCreate && (userProfile?.role === 'admin' || userProfile?.role === 'employee') && (
            <button
              onClick={() => setShowGroupCreate(true)}
              className="mb-4 w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-500/20 transition-all border border-blue-500/20"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              Create Team Group
            </button>
          )}

          {showGroupCreate && (
            <div className="mb-4 space-y-2">
              <input
                type="text"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="Group Name (e.g., Marketing Team)"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 transition-all font-bold"
              />
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 px-1">Selected: {selectedUsersForGroup.length} members</p>
            </div>
          )}

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:border-blue-500 transition-all shadow-sm dark:shadow-none"
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-thin">
            {allUsers.filter(u => u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).map(u => {
              const isSelected = selectedUsersForGroup.find(s => s.uid === u.uid)
              return (
                <button
                  key={u.uid}
                  onClick={() => showGroupCreate ? toggleUserSelection(u) : getOrCreateChat(u.uid, u.displayName, u.email, u.role).then(id => { if (id) { setActiveChatId(id); setShowNewChat(false) } })}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${isSelected ? 'bg-blue-500/10 border-blue-500/50' : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 shadow-sm hover:shadow-md'}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                      {u.displayName?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase()}
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-in zoom-in">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold text-slate-800 dark:text-gray-100 group-hover:text-blue-600 transition-colors">{u.displayName || 'Unknown User'}</p>
                    <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5 truncate">{u.role} • {u.email}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {showGroupCreate && (
            <button
              onClick={handleCreateGroup}
              disabled={sending || selectedUsersForGroup.length === 0}
              className="mt-6 w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {sending ? 'Creating Group...' : `Create Group with ${selectedUsersForGroup.length} Members`}
            </button>
          )}
        </div>
      )}

      {/* Info Sidebar Overlay for Mobile / Sidebar for Desktop */}
      {showInfo && partner && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-[40] md:hidden animate-in fade-in duration-300"
            onClick={() => setShowInfo(false)}
          />
          <div className="fixed md:relative inset-y-0 right-0 w-full xs:w-80 md:w-72 border-l border-slate-200/50 dark:border-white/5 bg-white dark:bg-gray-900 backdrop-blur-2xl p-6 flex flex-col z-[50] md:z-10 animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-slate-900 dark:text-white font-black tracking-tight">Contact Info</h3>
              <button 
                onClick={() => setShowInfo(false)} 
                className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                {partner.name?.charAt(0).toUpperCase()}
              </div>
              <h4 className="text-slate-900 dark:text-white font-bold text-lg leading-none mb-1">{partner.name}</h4>
              <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">{partner.role}</p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-500/5 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200/50 dark:border-white/10 shadow-sm dark:shadow-lg">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 uppercase font-black tracking-widest">Availability</p>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shadow-lg ${isPartnerOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500/50'}`}></div>
                  <p className={`text-base ${isPartnerOnline ? 'text-emerald-500 font-bold' : 'text-slate-900 dark:text-white font-black'}`}>
                    {isPartnerOnline ? 'Online now' : 'Offline'}
                  </p>
                </div>
                {!isPartnerOnline && partner.lastSeen && (
                  <p className="text-[11px] text-slate-500 dark:text-blue-200 mt-2 ml-6 font-medium italic opacity-80">
                    Last seen {formatTime({ seconds: new Date(partner.lastSeen).getTime() / 1000 })}
                  </p>
                )}
              </div>

              <div className="bg-slate-500/5 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-200/50 dark:border-white/10 shadow-sm dark:shadow-lg">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 uppercase font-black tracking-widest">Messaging Status</p>
                <p className="text-[13px] text-slate-800 dark:text-white leading-relaxed font-bold">
                  Messages to this user are delivered instantly.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Image Viewer Modal */}
      {imageView && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90" onClick={() => setImageView(null)}>
          <img src={imageView} alt="Full view" className="max-w-full max-h-full rounded-lg" />
          <button onClick={() => setImageView(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
