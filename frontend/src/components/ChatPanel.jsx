import { useState, useEffect, useRef } from 'react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { normalizeUserRole, isEmployeeRole } from '../utils/roles'
import chatbotLogo from '../assets/chatbot-logo.png'

/* ─── helpers ─────────────────────────────────────────── */
function toMessageDate(ts) {
  if (!ts) return null
  if (typeof ts.toDate === 'function') return ts.toDate()
  if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000)

  const date = new Date(ts)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatTime(ts) {
  const d = toMessageDate(ts)
  if (!d) return ''
  const now = new Date(), diff = now - d
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function formatMsgDateTime(ts) {
  const d = toMessageDate(ts)
  if (!d) return ''
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
function getDayLabel(ts) {
  const d = toMessageDate(ts)
  if (!d) return ''
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yest = new Date(today); yest.setDate(yest.getDate() - 1)
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  if (msgDay.getTime() === today.getTime()) return 'Today'
  if (msgDay.getTime() === yest.getTime()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

function getContactName(user = {}) {
  const name = String(user.displayName || user.name || '').trim()
  const email = String(user.email || '').trim()

  if (name && name.toLowerCase() !== 'user') return name
  if (email) return email.split('@')[0] || email
  return name || 'Unknown'
}

const EMOJIS = [
  { cat: 'Smileys', icons: ['😀','😃','😄','😁','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😋','😛','😜','🤪','🤨','🧐','🤓','😎','🥳','😏','😒','😞','😔','😟','😕','🙁','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕'] },
  { cat: 'Gestures', icons: ['👋','🤚','🖐','✋','🖖','👌','🤏','✌','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍','💅','🤳','💪','🦾'] },
  { cat: 'Hearts', icons: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟'] },
  { cat: 'Nature', icons: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🐺','🦄','🐝','🦋','🐌','🐞','🐜','🐢','🐍','🦎','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🐘','🦛','🦏','🦒','🦘','🐕','🐩','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿','🦔'] },
  { cat: 'Objects', icons: ['⌚','📱','💻','⌨','🖱','💽','💾','💿','📷','📸','📹','🎥','📞','☎','📺','📻','🎙','🧭','⏱','⏰','🕰','⌛','📡','🔋','🔌','💡','🔦','🕯','💸','💵','💰','💳','💎','⚖','🧰','🔧','🔨','⚒','🛠','⛏','🔩','⚙','🧲','🔫','💣','🔪','⚔','🛡','🔮','📿','🧿','💈','⚗','🔭','🔬','💊','💉','🩸','🧬','🧹','🧺','🧻','🧼','🧽','🛒'] },
]

/* ─── Avatar ─────────────────────────────────────────── */
function Avatar({ name = '?', size = 10, online = false, gradient = 'from-emerald-500 to-cyan-500', src = '' }) {
  return (
    <div className="relative flex-shrink-0">
      <div className={`w-${size} h-${size} rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.4)] overflow-hidden border border-white/10 ring-1 ring-black/20`}
        style={{ fontSize: size >= 10 ? 18 : size >= 8 ? 14 : 10 }}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          name?.charAt(0)?.toUpperCase() ?? '?'
        )}
      </div>
      {online && (
        <>
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 z-10" />
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping opacity-75" />
        </>
      )}
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────── */
export default function ChatPanel({ embedded = false }) {
  const {
    chats, activeChatId, setActiveChatId, messages,
    sendMessage, sendAiReply, clearChat, deleteSpecificMessages, requestNotificationPermission,
    handleTyping, typingUsers, markAsRead, getChatPartner, unreadCounts,
    userStatuses, getOrCreateChat, createGroupChat, startVideoCall, currentUser, takeoverChat
  } = useChat()
  const { getAllUsers, userProfile } = useAuth()
  const { theme } = useTheme()

  const [messageText, setMessageText] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sending, setSending] = useState(false)
  const [imageView, setImageView] = useState(null)
  const [showInfo, setShowInfo] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGroupCreate, setShowGroupCreate] = useState(false)
  const [selectedUsersForGroup, setSelectedUsersForGroup] = useState([])
  const [newGroupName, setNewGroupName] = useState('')
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [userLoadError, setUserLoadError] = useState('')
  const [aiReplying, setAiReplying] = useState(false)
  const [supportStaff, setSupportStaff] = useState([])

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const messageInputRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const moreMenuRef = useRef(null)
  const currentRole = normalizeUserRole(userProfile?.role || currentUser?.role)

  /* outside click for emoji + more menu */
  useEffect(() => {
    const handler = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) setShowEmojiPicker(false)
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) setShowMoreMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* scroll to bottom */
  useEffect(() => {
    const t = setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80)
    return () => clearTimeout(t)
  }, [messages, typingUsers, imagePreview, aiReplying])

  /* focus active chat */
  useEffect(() => {
    if (activeChatId) messageInputRef.current?.focus()
  }, [activeChatId])

  /* keep active conversation read while it is open */
  useEffect(() => {
    if (activeChatId) markAsRead(activeChatId)
  }, [activeChatId, messages.length, markAsRead])

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  /* load users for new chat */
  useEffect(() => {
    if (showNewChat && getAllUsers) {
      console.log("Loading users for new chat...")
      setUserLoadError('')
      getAllUsers().then(users => {
        console.log("Fetched users:", users)
        let f = users.filter(u => u.uid !== currentUser?.uid)
        if (currentRole === 'student') {
          f = f.filter(u => normalizeUserRole(u.role) === 'admin' || isEmployeeRole(u.role))
        }
        console.log("Filtered users:", f)
        setAllUsers(f)
      }).catch(err => {
        console.error("Error fetching users:", err)
        setAllUsers([])
        setUserLoadError(err.message || 'Unable to load chat contacts.')
      })
    }
  }, [showNewChat, getAllUsers, currentUser?.uid, currentRole])

  /* load staff roster so student chats can fall back to AI when no staff is online */
  useEffect(() => {
    let cancelled = false

    if (currentRole !== 'student' || !getAllUsers) {
      setSupportStaff([])
      return () => { cancelled = true }
    }

    getAllUsers()
      .then(users => {
        if (cancelled) return
        setSupportStaff(users.filter(u => normalizeUserRole(u.role) === 'admin' || isEmployeeRole(u.role)))
      })
      .catch(err => {
        console.warn('Unable to load support staff for AI fallback:', err)
        if (!cancelled) setSupportStaff([])
      })

    return () => { cancelled = true }
  }, [currentRole, getAllUsers])

  /* derived data */
  const activeChat = chats.find(c => c.id === activeChatId)
  const partner = activeChat ? getChatPartner(activeChat) : null
  const isPartnerTyping = partner && typingUsers[partner.uid]
  const isPartnerOnline = partner?.status === 'online'
  const activeParticipantEntries = Object.entries(activeChat?.participantInfo || {})
  const chatStaffParticipants = activeParticipantEntries.filter(([uid, info]) =>
    uid !== currentUser?.uid && ['admin', 'employee'].includes(String(info?.role || '').toLowerCase())
  )
  const isDark = true
  const isTakenOver = activeChat?.isTakenOver
  const shouldUseAiFallback = currentRole === 'student' && !activeChat?.isGroup && !isTakenOver

  /* Premium Glassmorphism Theme Classes */
  const containerClass = embedded 
    ? 'bg-transparent text-white' 
    : 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0f1c] to-slate-950 text-white shadow-[0_16px_48px_0_rgba(0,0,0,0.4)] backdrop-blur-3xl border border-white/10'
  const sidebarClass = 'bg-slate-900/40 backdrop-blur-xl border-r border-white/5'
  const mainClass = 'bg-slate-900/30 backdrop-blur-sm'
  const headerClass = 'bg-slate-950/60 backdrop-blur-xl border-b border-white/5'
  const inputContainerClass = 'bg-white/5 border border-white/10 rounded-3xl'

  const notificationPermission =
    typeof window !== 'undefined' && 'Notification' in window
      ? window.Notification.permission
      : 'unsupported'

  const filteredChats = chats.filter(chat => {
    const p = getChatPartner(chat)
    if (!p) return false
    if (currentRole === 'student' && normalizeUserRole(p.role) === 'student') return false
    if (!searchQuery) return true
    return p?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  /* actions */
  const handleSend = async () => {
    if (!activeChatId || (!messageText.trim() && !imageFile) || sending || aiReplying) return
    const chatId = activeChatId
    const textToSend = messageText.trim()
    const shouldAskAi = shouldUseAiFallback && Boolean(textToSend)

    setSending(true)
    try {
      await sendMessage(chatId, textToSend, imageFile)
      setMessageText(''); setImageFile(null); setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''

      setSending(false)
      if (shouldAskAi) {
        setAiReplying(true)
        await sendAiReply(chatId, textToSend, messages)
      }
    } catch (err) { console.error(err) }
    finally {
      setSending(false)
      setAiReplying(false)
    }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }
  const handleImageSelect = (e) => {
    const f = e.target.files[0]
    if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) }
  }
  const removeImage = () => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }
  const startNewChat = async (user) => {
    const id = await getOrCreateChat(user.uid, getContactName(user), user.email, user.role)
    if (id) { setActiveChatId(id); setShowNewChat(false) }
  }
  const toggleMsgSel = (id) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const handleDeleteSelected = async () => {
    if (!selectedIds.size) return
    await deleteSpecificMessages(activeChatId, Array.from(selectedIds))
    setSelectionMode(false); setSelectedIds(new Set())
  }
  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !selectedUsersForGroup.length) return
    setSending(true)
    try {
      const id = await createGroupChat(selectedUsersForGroup, newGroupName)
      if (id) { setActiveChatId(id); setShowGroupCreate(false); setShowNewChat(false); setSelectedUsersForGroup([]); setNewGroupName('') }
    } catch (err) { console.error(err) }
    finally { setSending(false) }
  }
  const toggleUserSel = (user) => {
    const has = selectedUsersForGroup.find(u => u.uid === user.uid)
    setSelectedUsersForGroup(has ? selectedUsersForGroup.filter(u => u.uid !== user.uid) : [...selectedUsersForGroup, user])
  }

  /* css token shortcuts */
  const mainBg = { background: isDark ? 'rgba(10,15,30,0.95)' : '#f1f5f9' }

  return (
    <div
      className={`flex h-full w-full relative overflow-hidden ${!embedded ? 'rounded-3xl' : ''} ${containerClass}`}
    >
      {/* ─── SIDEBAR ────────────────────────────────── */}
      <div
        className={`flex flex-col w-full md:w-80 lg:w-[310px] flex-shrink-0 transition-all duration-300 ${activeChatId ? 'hidden md:flex' : 'flex'} ${sidebarClass}`}
      >
        {/* Sidebar Header */}
        <div className="px-5 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-black text-slate-800 dark:text-white tracking-tight">Messages</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-600 mt-0.5">
                {filteredChats.length} conversation{filteredChats.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="h-9 w-9 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
              style={{ background: showNewChat ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className={`w-full pl-9 pr-3 py-2.5 text-[12px] text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none transition-all ${inputContainerClass}`}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.6)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>
        </div>

        {/* Chat list or New chat users */}
        <div className="flex-1 overflow-y-auto py-2 px-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.05) transparent' }}>
          {showNewChat ? (
            <>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-600 px-3 py-2">People</p>
              {allUsers.filter(u => !searchQuery || getContactName(u).toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-[12px] text-slate-500 mb-2">
                    {userLoadError ? 'Chat contacts could not be loaded' : 'No users found'}
                  </p>
                  {userLoadError && (
                    <p className="mx-auto max-w-[220px] text-[10px] leading-5 text-amber-300">
                      {userLoadError}
                    </p>
                  )}
                </div>
              ) : (
                allUsers.filter(u => !searchQuery || getContactName(u).toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
                  <button
                    key={user.uid}
                    onClick={() => startNewChat(user)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-0.5 transition-all text-left group"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'; e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                  >
                    <Avatar name={getContactName(user)} size={9} online={userStatuses[user.uid]?.state === 'online'} gradient="from-blue-500 to-indigo-600" src={user.avatar || user.photoURL} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-slate-800 dark:text-white truncate">{getContactName(user)}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-500 dark:text-indigo-400">{user.role || 'User'}</p>
                    </div>
                  </button>
                ))
              )}
            </>
          ) : filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <p className="text-[13px] font-bold text-slate-500 mb-1">No conversations yet</p>
              <button onClick={() => setShowNewChat(true)} className="text-[12px] font-black text-indigo-400 hover:text-indigo-300 transition-colors mt-1">
                Start one →
              </button>
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
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-1 text-left transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group ${isActive ? 'bg-indigo-500/15 border border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.15)] scale-[1.02] z-10' : 'bg-transparent border border-transparent hover:bg-white/5 hover:border-white/10 hover:scale-[1.01] hover:z-10'}`}
                >
                  <Avatar name={p.name} size={10} online={p.status === 'online'} gradient="from-emerald-500 to-cyan-500" src={p.avatar || p.photoURL} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className={`text-[13px] font-bold truncate ${unread > 0 ? 'text-slate-900 dark:text-white font-black' : 'text-slate-700 dark:text-slate-300'}`}>{p.name}</p>
                      <span className="text-[9px] text-slate-500 dark:text-slate-600 flex-shrink-0 ml-2 mt-0.5">{formatTime(chat.lastMessageAt)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`text-[11px] truncate ${unread > 0 ? 'text-slate-900 dark:text-slate-100 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                      {unread > 0 && (
                        <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full text-white text-[9px] font-black flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500 shadow-[0_0_10px_rgba(99,102,241,0.6)] border border-indigo-400/30">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ─── CHAT AREA ───────────────────────────────── */}
      {activeChatId && partner ? (
        <div className={`flex-1 flex flex-col min-w-0 ${mainClass}`}>
          {/* Chat Header */}
          <div className={`h-16 flex items-center px-4 gap-3 flex-shrink-0 ${headerClass}`}>
            {/* Back on mobile */}
            <button
              onClick={() => setActiveChatId(null)}
              className="md:hidden h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors flex-shrink-0"
              style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.06)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <Avatar name={partner.name} size={9} online={isPartnerOnline} gradient="from-emerald-500 to-cyan-500" src={partner.avatar || partner.photoURL} />

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-black text-slate-800 dark:text-white truncate leading-tight">{partner.name}</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isPartnerOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}
                  style={isPartnerOnline ? { boxShadow: '0 0 6px #10b981' } : {}} />
                <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${isPartnerOnline ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>
                  {isPartnerTyping ? 'Typing...' : isPartnerOnline ? 'Online' : partner.lastSeen ? `Last seen ${formatTime({ seconds: new Date(partner.lastSeen).getTime() / 1000 })}` : 'Offline'}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              {/* Video Call */}
              {((partner.role !== 'student' && userProfile?.role !== 'student') || partner.isGroup) && (
                <HeaderBtn onClick={() => startVideoCall(activeChatId)} title="Video Call"
                  icon="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                  hoverColor="rgba(59,130,246,0.2)" hoverBorder="rgba(59,130,246,0.3)" hoverText="#60a5fa"
                />
              )}
              {/* Notifications - desktop only */}
              <div className="hidden sm:block">
                <HeaderBtn onClick={requestNotificationPermission} title="Notifications"
                  icon="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  hoverColor={notificationPermission === 'granted' ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.15)'}
                  hoverBorder={notificationPermission === 'granted' ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.25)'}
                  hoverText={notificationPermission === 'granted' ? '#34d399' : '#a5b4fc'}
                />
              </div>
              {/* Select toggle - desktop */}
              <div className="hidden sm:block">
                <button
                  onClick={() => { setSelectionMode(!selectionMode); setSelectedIds(new Set()) }}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all"
                  style={selectionMode ? { background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24' } : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b' }}
                >
                  {selectionMode ? 'Cancel' : 'Select'}
                </button>
              </div>
              {/* Clear - desktop */}
              {!selectionMode && (
                <div className="hidden sm:block">
                  <HeaderBtn onClick={() => clearChat(activeChatId)} title="Clear Chat"
                    icon="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    hoverColor="rgba(239,68,68,0.15)" hoverBorder="rgba(239,68,68,0.3)" hoverText="#f87171"
                  />
                </div>
              )}
              {/* Info */}
              <HeaderBtn onClick={() => setShowInfo(!showInfo)} title="Info"
                icon="m11.25 11.25.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0Zm-9-3.75h.008v.008H12V8.25Z"
                active={showInfo}
                hoverColor="rgba(99,102,241,0.15)" hoverBorder="rgba(99,102,241,0.3)" hoverText="#a5b4fc"
              />
              {/* Mobile more menu */}
              <div className="relative sm:hidden" ref={moreMenuRef}>
                <HeaderBtn onClick={() => setShowMoreMenu(!showMoreMenu)} title="More"
                  icon="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                  active={showMoreMenu}
                  hoverColor="rgba(255,255,255,0.08)" hoverBorder="rgba(255,255,255,0.12)" hoverText="#94a3b8"
                />
                {showMoreMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl z-60 p-2" style={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', animation: 'fadeInUp 0.2s ease' }}>
                    {[
                      { label: selectionMode ? 'Cancel Selection' : 'Select Messages', action: () => { setSelectionMode(!selectionMode); setSelectedIds(new Set()); setShowMoreMenu(false) }, icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                      { label: 'Notifications', action: () => { requestNotificationPermission(); setShowMoreMenu(false) }, icon: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0' },
                      { label: 'Contact Info', action: () => { setShowInfo(true); setShowMoreMenu(false) }, icon: 'm11.25 11.25.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0Zm-9-3.75h.008v.008H12V8.25Z' },
                    ].map(item => (
                      <button key={item.label} onClick={item.action}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold text-slate-400 hover:text-white transition-all hover:bg-white/5">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                        {item.label}
                      </button>
                    ))}
                    <div className="h-px mx-2 my-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                    <button onClick={() => { clearChat(activeChatId); setShowMoreMenu(false) }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all hover:bg-red-500/10"
                      style={{ color: '#f87171' }}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                      Clear Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {shouldUseAiFallback && (
            <div className="px-4 sm:px-6 py-3 flex-shrink-0" style={{ background: 'rgba(8,13,26,0.82)', borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)' }}>
                <div className="h-8 w-8 rounded-xl flex items-center justify-center text-[10px] font-black text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 4px 14px rgba(79,70,229,0.25)' }}>
                  AI
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-indigo-200">AI support active</p>
                  <p className="text-[11px] leading-4 text-slate-400">Team offline hai, abhi SolutionHub AI reply handle karega.</p>
                </div>
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.05) transparent' }}>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                    </svg>
                  </div>
                  <p className="text-[15px] font-bold text-slate-400">Say hi to {partner.name}!</p>
                  <p className="text-[12px] text-slate-600 mt-1">Start the conversation below</p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUser?.uid
                const isAiMessage = msg.generatedByAi || msg.type === 'ai-assistant'
                const showAvatar = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId
                const curDate = getDayLabel(msg.timestamp)
                const prevDate = idx > 0 ? getDayLabel(messages[idx - 1].timestamp) : null
                const showDate = Boolean(curDate) && curDate !== prevDate
                return (
                  <div key={msg.id}>
                    {/* Date separator */}
                    {showDate && (
                      <div className="flex items-center justify-center py-5">
                        <div className="px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-slate-600"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          {curDate}
                        </div>
                      </div>
                    )}

                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-5' : 'mt-1'}`}>
                      <div className={`flex items-end gap-2 max-w-[88%] sm:max-w-[65%] ${isMe ? 'flex-row-reverse' : ''}`}>
                        {/* Selector checkbox */}
                        {selectionMode && (
                          <div onClick={() => toggleMsgSel(msg.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer flex-shrink-0 self-center transition-all ${selectedIds.has(msg.id) ? 'border-indigo-500 scale-110' : 'border-slate-600 hover:border-indigo-500'}`}
                            style={selectedIds.has(msg.id) ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
                            {selectedIds.has(msg.id) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                          </div>
                        )}

                        {/* Avatar (for received messages) */}
                        {!isMe && !selectionMode && (
                          <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${isAiMessage ? 'from-indigo-500 to-violet-500' : 'from-emerald-500 to-cyan-500'} flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 overflow-hidden border border-white/5 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                            {isAiMessage ? (
                              <img src={chatbotLogo} alt="AI Chatbot" className="w-full h-full object-cover" />
                            ) : (activeChat?.participantInfo?.[msg.senderId]?.avatar || activeChat?.participantInfo?.[msg.senderId]?.photoURL) ? (
                              <img src={activeChat.participantInfo[msg.senderId].avatar || activeChat.participantInfo[msg.senderId].photoURL} alt="Sender" className="w-full h-full object-cover" />
                            ) : (
                              msg.senderName?.charAt(0)?.toUpperCase()
                            )}
                          </div>
                        )}

                        {/* Bubble */}
                        <div onClick={() => selectionMode && toggleMsgSel(msg.id)}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${selectionMode ? 'cursor-pointer' : ''}`}>
                          <div
                            className={`rounded-2xl px-4 py-2.5 transition-all duration-300 ease-out hover:scale-[1.02] ${isMe ? 'rounded-br-sm bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_8px_20px_-4px_rgba(99,102,241,0.4)]' : isAiMessage ? 'rounded-bl-sm bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md shadow-lg shadow-black/20' : 'rounded-bl-sm bg-white/10 border border-white/10 backdrop-blur-md shadow-lg shadow-black/20'} ${selectedIds.has(msg.id) ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0a0f1c]' : ''}`}
                          >
                            {msg.type === 'video-call' ? (
                              <div className="min-w-[220px]">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.2)' }}>
                                    <svg className="w-5 h-5 text-blue-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-black uppercase tracking-wider text-blue-400">Video Call</p>
                                    <p className="text-[10px] text-slate-400">{isMe ? 'You started' : 'Call started'}</p>
                                  </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); if (msg.callUrl) window.open(msg.callUrl, '_blank') }}
                                  className="w-full py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02]"
                                  style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', boxShadow: '0 4px 14px rgba(59,130,246,0.3)' }}>
                                  Join Call
                                </button>
                              </div>
                            ) : (
                              <>
                                {msg.imageUrl && (
                                  <div className="mb-2 max-w-[260px]">
                                    <img src={msg.imageUrl} alt="Shared" className="rounded-xl cursor-pointer hover:brightness-90 transition-all"
                                      onLoad={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                      onClick={e => { e.stopPropagation(); !selectionMode && setImageView(msg.imageUrl) }} />
                                  </div>
                                )}
                                {msg.text && (
                                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words" style={{ color: isMe ? '#fff' : '#cbd5e1' }}>
                                    {msg.text}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                          {/* Timestamp + read receipt */}
                          <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[9px] text-slate-600 whitespace-nowrap">{formatMsgDateTime(msg.timestamp)}</span>
                            {isMe && (
                              <svg className={`w-3.5 h-3.5 ${msg.status === 'read' || msg.status === 'seen' ? 'text-indigo-400' : 'text-slate-600'}`} viewBox="0 0 24 24" fill="none">
                                {msg.status === 'read' || msg.status === 'seen' ? (
                                  <>
                                    <path d="M4 12.8571L9 17.5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 12.1429L14.5 17.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </>
                                ) : (
                                  <path d="M4 12.8571L9 17.5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                )}
                              </svg>
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
              <div className="flex items-end gap-2 mt-4">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-[10px] font-black text-white">
                  {partner.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-1">
                    {[0, 120, 240].map(delay => (
                      <span key={delay} className="w-2 h-2 rounded-full" style={{ background: '#6366f1', animation: `bounce 1.2s ${delay}ms infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {aiReplying && (
              <div className="flex items-end gap-2 mt-4">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-black text-white">
                  AI
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)' }}>
                  <div className="flex items-center gap-1">
                    {[0, 120, 240].map(delay => (
                      <span key={delay} className="w-2 h-2 rounded-full" style={{ background: '#818cf8', animation: `bounce 1.2s ${delay}ms infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="h-4" /><div ref={messagesEndRef} />
          </div>

          {/* Selection floating bar */}
          {selectionMode && (
            <div className="absolute bottom-24 left-0 right-0 flex justify-center px-4 z-50 pointer-events-none">
              <div className="pointer-events-auto flex items-center gap-4 px-6 py-3 rounded-2xl"
                style={{ background: 'rgba(13,17,32,0.95)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', animation: 'fadeInUp 0.3s ease' }}>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Selected</p>
                  <p className="text-[15px] font-black text-white">{selectedIds.size} msg{selectedIds.size !== 1 ? 's' : ''}</p>
                </div>
                <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <button onClick={() => { setSelectionMode(false); setSelectedIds(new Set()) }}
                  className="text-[12px] font-black text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5">
                  Cancel
                </button>
                <button onClick={handleDeleteSelected} disabled={!selectedIds.size}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[12px] font-black text-white transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 14px rgba(239,68,68,0.3)' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Image preview strip */}
          {imagePreview && (
            <div className="px-4 py-2 flex-shrink-0" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)', background: isDark ? 'rgba(8,13,26,0.9)' : '#f8fafc' }}>
              <div className="relative inline-block">
                <img src={imagePreview} alt="Preview" className="h-16 rounded-xl" />
                <button onClick={removeImage}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white"
                  style={{ background: '#ef4444', boxShadow: '0 2px 8px rgba(239,68,68,0.4)' }}>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {currentRole !== 'student' && !activeChat?.isGroup && !isTakenOver ? (
            /* Employee Takeover Banner */
            <div className="flex-shrink-0 px-4 py-8 border-t flex flex-col items-center justify-center gap-3 text-center"
              style={{
                borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
                background: isDark ? 'rgba(8,13,26,0.95)' : '#ffffff'
              }}>
              <div className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{
                  background: isDark ? 'rgba(99,102,241,0.1)' : '#e0e7ff',
                  border: isDark ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(99,102,241,0.2)',
                  color: '#6366f1'
                }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21L14.907 18M18 12h.008v.008H18V12zm-6 0h.008v.008H12V12zm-6 0h.008v.008H6V12z" />
                </svg>
              </div>
              <div className="max-w-md">
                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200">AI Support Active</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">SolutionHub AI is answering this student's inquiries. Take over this chat to type a response directly.</p>
              </div>
              <button
                onClick={() => takeoverChat(activeChatId)}
                className="px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-white transition-all hover:scale-[1.02] shadow-lg shadow-indigo-500/20 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
              >
                Take Over Chat
              </button>
            </div>
          ) : (
            /* Input Area */
            <div className="flex-shrink-0 px-4 py-4 bg-transparent relative z-10">
              <div className="flex items-center gap-3 p-2 rounded-[2rem] bg-slate-900/50 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)]">
                {/* File input */}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()}
                  className="h-10 w-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all flex-shrink-0 hover:bg-white/10 ml-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </button>

                {/* Emoji */}
                <div className="relative flex-shrink-0">
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${showEmojiPicker ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                    </svg>
                  </button>
                  {showEmojiPicker && (
                    <div ref={emojiPickerRef}
                      className="absolute bottom-full left-0 mb-3 w-72 max-h-64 overflow-y-auto rounded-2xl p-3 z-60"
                      style={{ background: isDark ? '#0d1120' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(0,0,0,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.05) transparent', animation: 'fadeInUp 0.2s ease' }}>
                      {EMOJIS.map((group, gi) => (
                        <div key={gi} className="mb-3 last:mb-0">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-600 mb-1.5 px-1">{group.cat}</p>
                          <div className="grid grid-cols-8 gap-0.5">
                            {group.icons.map((em, ei) => (
                              <button key={ei} onClick={() => setMessageText(p => p + em)}
                                className="text-lg p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all hover:scale-125 active:scale-95">
                                {em}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Text input */}
                <textarea
                  ref={messageInputRef}
                  value={messageText}
                  onChange={e => { setMessageText(e.target.value); if (activeChatId) handleTyping(activeChatId) }}
                  onKeyDown={handleKeyDown}
                  placeholder={shouldUseAiFallback ? 'AI support is active...' : 'Type your message...'}
                  rows={1}
                  className="flex-1 bg-transparent text-[14px] text-white placeholder-slate-400 focus:outline-none resize-none py-2.5 px-2"
                  style={{ maxHeight: 120 }}
                />

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={sending || aiReplying || (!messageText.trim() && !imageFile)}
                  className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-out hover:scale-110 active:scale-90 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_4px_14px_rgba(99,102,241,0.5)] border border-indigo-400/30"
                >
                  {sending || aiReplying ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

      ) : (
        /* Empty state */
        <div className={`flex-1 flex items-center justify-center ${activeChatId ? 'hidden md:flex' : 'flex'}`} style={mainBg}>
          <div className="text-center px-4">
            <div className="h-24 w-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', boxShadow: '0 0 40px rgba(99,102,241,0.1)' }}>
              <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <h3 className="text-[17px] font-black text-slate-400 mb-2">Select a conversation</h3>
            <p className="text-[12px] text-slate-600 mb-6">Pick an existing chat or start a new one to begin messaging</p>
            <button onClick={() => setShowNewChat(true)}
              className="px-5 py-2.5 rounded-2xl text-[12px] font-black text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
              + New Conversation
            </button>
          </div>
        </div>
      )}

      {/* ─── NEW CHAT / GROUP OVERLAY ───────────────── */}
      {showNewChat && (
        <div className="absolute inset-0 z-50 flex flex-col" style={{ background: isDark ? 'rgba(8,13,26,0.98)' : '#ffffff', color: isDark ? '#ffffff' : '#0f172a', animation: 'fadeInUp 0.25s ease' }}>
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)' }}>
            <h2 className="text-[17px] font-black text-slate-800 dark:text-white">{showGroupCreate ? 'Create Team Group' : 'New Conversation'}</h2>
            <button onClick={() => { setShowNewChat(false); setShowGroupCreate(false); setSelectedUsersForGroup([]) }}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all hover:bg-white/5"
              style={{ border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Create group button (staff only) */}
            {!showGroupCreate && ['admin', 'employee'].includes(String(userProfile?.role || '').toLowerCase()) && (
              <button onClick={() => setShowGroupCreate(true)}
                className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-2xl mb-5 text-[13px] font-black transition-all cursor-pointer"
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
                Create Team Group
              </button>
            )}

            {/* Group name input */}
            {showGroupCreate && (
              <div className="mb-4">
                <input type="text" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} placeholder="Group name (e.g. Marketing Team)"
                  className="w-full px-4 py-3 text-[13px] text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-700 rounded-2xl focus:outline-none transition-all"
                  style={inputContainerStyle}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
                  onBlur={e => e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)'}
                />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-600 mt-2 px-1">
                  {selectedUsersForGroup.length} member{selectedUsersForGroup.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}

            {/* Search */}
            <div className="relative mb-4">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="text" placeholder="Search people..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-[13px] text-white placeholder-slate-700 rounded-2xl focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
              />
            </div>

            {/* Users list */}
            <div className="space-y-1.5">
              {allUsers.filter(u => !searchQuery || getContactName(u).toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).map(u => {
                const isSel = selectedUsersForGroup.find(s => s.uid === u.uid)
                return (
                  <button key={u.uid}
                    onClick={() => showGroupCreate ? toggleUserSel(u) : getOrCreateChat(u.uid, getContactName(u), u.email, u.role).then(id => { if (id) { setActiveChatId(id); setShowNewChat(false) } })}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left"
                    style={isSel ? { background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' } : { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={e => !isSel && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                    onMouseLeave={e => !isSel && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-black text-white"
                        style={{ boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
                        {getContactName(u).charAt(0).toUpperCase()}
                      </div>
                      {isSel && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2"
                          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderColor: '#080d1a' }}>
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold text-white truncate">{getContactName(u)}</p>
                      <p className="text-[11px] text-slate-600 truncate">{u.role} · {u.email}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {showGroupCreate && (
            <div className="px-6 pb-6 flex-shrink-0">
              <button onClick={handleCreateGroup} disabled={sending || !selectedUsersForGroup.length}
                className="w-full py-4 rounded-2xl text-[13px] font-black text-white transition-all disabled:opacity-40 hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 6px 20px rgba(79,70,229,0.3)' }}>
                {sending ? 'Creating...' : `Create Group · ${selectedUsersForGroup.length} Members`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── INFO PANEL ─────────────────────────────── */}
      {showInfo && partner && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowInfo(false)} />
          <div className="fixed md:relative inset-y-0 right-0 w-72 flex flex-col z-50 md:z-10"
            style={{ background: '#080d1a', borderLeft: '1px solid rgba(255,255,255,0.06)', animation: 'slideInRight 0.25s ease' }}>
            <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-[14px] font-black text-white">Contact Info</h3>
              <button onClick={() => setShowInfo(false)}
                className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-8 text-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-3xl font-black text-white mx-auto mb-4 overflow-hidden border border-white/5"
                style={{ boxShadow: '0 8px 30px rgba(16,185,129,0.3)' }}>
                {partner.avatar || partner.photoURL ? (
                  <img src={partner.avatar || partner.photoURL} alt={partner.name} className="w-full h-full object-cover" />
                ) : (
                  partner.name?.charAt(0)?.toUpperCase()
                )}
              </div>
              <h4 className="text-[16px] font-black text-white mb-1">{partner.name}</h4>
              <span className="inline-block px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em]"
                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
                {partner.role}
              </span>
            </div>
            <div className="p-5 space-y-3">
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">Status</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isPartnerOnline ? 'bg-emerald-500' : 'bg-rose-500/50'}`}
                    style={isPartnerOnline ? { boxShadow: '0 0 8px #10b981' } : {}} />
                  <p className={`text-[13px] font-bold ${isPartnerOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {isPartnerOnline ? 'Online now' : 'Offline'}
                  </p>
                </div>
                {!isPartnerOnline && partner.lastSeen && (
                  <p className="text-[10px] text-slate-600 mt-1.5 ml-4.5">
                    Last seen {formatTime({ seconds: new Date(partner.lastSeen).getTime() / 1000 })}
                  </p>
                )}
              </div>
              <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-2">Messaging</p>
                <p className="text-[12px] text-slate-500 leading-relaxed">Messages are delivered instantly in real time.</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── IMAGE VIEWER ───────────────────────────── */}
      {imageView && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.92)' }} onClick={() => setImageView(null)}>
          <img src={imageView} alt="Full view" className="max-w-full max-h-full rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
          <button onClick={() => setImageView(null)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center text-white transition-all hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Header Icon Button ─────────────────────────────── */
function HeaderBtn({ onClick, title, icon, active = false, hoverColor, hoverBorder, hoverText }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} title={title}
      className="h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-200"
      style={{
        background: (active || hov) ? hoverColor : 'transparent',
        border: `1px solid ${(active || hov) ? hoverBorder : 'transparent'}`,
        color: (active || hov) ? hoverText : '#475569',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
    </button>
  )
}
