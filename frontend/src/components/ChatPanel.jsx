import { useState, useEffect, useRef } from 'react'
import { useChat } from '../context/ChatContext'
import { useAuth } from '../context/AuthContext'

/* ─── helpers ─────────────────────────────────────────── */
function formatTime(ts) {
  if (!ts?.seconds) return ''
  const d = new Date(ts.seconds * 1000), now = new Date(), diff = now - d
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function formatMsgTime(ts) {
  if (!ts?.seconds) return ''
  return new Date(ts.seconds * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}
function getDayLabel(ts) {
  if (!ts?.seconds) return ''
  const d = new Date(ts.seconds * 1000), now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yest = new Date(today); yest.setDate(yest.getDate() - 1)
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  if (msgDay.getTime() === today.getTime()) return 'Today'
  if (msgDay.getTime() === yest.getTime()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

const EMOJIS = [
  { cat: 'Smileys', icons: ['😀','😃','😄','😁','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😋','😛','😜','🤪','🤨','🧐','🤓','😎','🥳','😏','😒','😞','😔','😟','😕','🙁','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕'] },
  { cat: 'Gestures', icons: ['👋','🤚','🖐','✋','🖖','👌','🤏','✌','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍','💅','🤳','💪','🦾'] },
  { cat: 'Hearts', icons: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💟'] },
  { cat: 'Nature', icons: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🐺','🦄','🐝','🦋','🐌','🐞','🐜','🐢','🐍','🦎','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🐘','🦛','🦏','🦒','🦘','🐕','🐩','🐈','🐓','🦃','🦚','🦜','🦢','🦩','🕊','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿','🦔'] },
  { cat: 'Objects', icons: ['⌚','📱','💻','⌨','🖱','💽','💾','💿','📷','📸','📹','🎥','📞','☎','📺','📻','🎙','🧭','⏱','⏰','🕰','⌛','📡','🔋','🔌','💡','🔦','🕯','💸','💵','💰','💳','💎','⚖','🧰','🔧','🔨','⚒','🛠','⛏','🔩','⚙','🧲','🔫','💣','🔪','⚔','🛡','🔮','📿','🧿','💈','⚗','🔭','🔬','💊','💉','🩸','🧬','🧹','🧺','🧻','🧼','🧽','🛒'] },
]

/* ─── Avatar ─────────────────────────────────────────── */
function Avatar({ name = '?', size = 10, online = false, gradient = 'from-emerald-500 to-cyan-500' }) {
  return (
    <div className="relative flex-shrink-0">
      <div className={`w-${size} h-${size} rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-black shadow-lg`}
        style={{ fontSize: size >= 10 ? 18 : size >= 8 ? 14 : 10 }}>
        {name?.charAt(0)?.toUpperCase() ?? '?'}
      </div>
      {online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#080d1a] shadow-lg shadow-emerald-500/50" />}
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────── */
export default function ChatPanel({ embedded = false }) {
  const {
    chats, activeChatId, setActiveChatId, messages,
    sendMessage, clearChat, deleteSpecificMessages, requestNotificationPermission,
    handleTyping, typingUsers, markAsRead, getChatPartner, unreadCounts,
    userStatuses, getOrCreateChat, createGroupChat, startVideoCall, currentUser
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
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showGroupCreate, setShowGroupCreate] = useState(false)
  const [selectedUsersForGroup, setSelectedUsersForGroup] = useState([])
  const [newGroupName, setNewGroupName] = useState('')
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const messageInputRef = useRef(null)
  const emojiPickerRef = useRef(null)
  const moreMenuRef = useRef(null)

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
  }, [messages, typingUsers, imagePreview])

  /* mark read + focus */
  useEffect(() => {
    if (activeChatId) { markAsRead(activeChatId); messageInputRef.current?.focus() }
  }, [activeChatId, markAsRead])

  /* load users for new chat */
  useEffect(() => {
    if (showNewChat && getAllUsers) {
      getAllUsers().then(users => {
        let f = users.filter(u => u.uid !== currentUser?.uid)
        if (userProfile?.role === 'customer') f = f.filter(u => u.role === 'admin' || u.role === 'employee')
        setAllUsers(f)
      }).catch(console.error)
    }
  }, [showNewChat, getAllUsers, currentUser, userProfile])

  /* derived data */
  const activeChat = chats.find(c => c.id === activeChatId)
  const partner = activeChat ? getChatPartner(activeChat) : null
  const isPartnerTyping = partner && typingUsers[partner.uid]
  const isPartnerOnline = partner?.status === 'online'

  const filteredChats = chats.filter(chat => {
    const p = getChatPartner(chat)
    if (!p) return false
    if (userProfile?.role === 'customer' && p.role === 'customer') return false
    if (!searchQuery) return true
    return p?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  })

  /* actions */
  const handleSend = async () => {
    if ((!messageText.trim() && !imageFile) || sending) return
    setSending(true)
    try {
      await sendMessage(activeChatId, messageText.trim(), imageFile)
      setMessageText(''); setImageFile(null); setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) { console.error(err) }
    finally { setSending(false) }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }
  const handleImageSelect = (e) => {
    const f = e.target.files[0]
    if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) }
  }
  const removeImage = () => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }
  const startNewChat = async (user) => {
    const id = await getOrCreateChat(user.uid, user.displayName, user.email, user.role)
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
  const glass = { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }
  const sidebarBg = { background: 'rgba(8,13,26,0.97)' }
  const mainBg = { background: 'rgba(10,15,30,0.95)' }

  return (
    <div
      className={`flex h-full w-full relative overflow-hidden ${!embedded ? 'rounded-3xl shadow-2xl' : ''}`}
      style={{ background: 'rgba(6,9,20,0.98)', border: embedded ? 'none' : '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* ─── SIDEBAR ────────────────────────────────── */}
      <div
        className={`flex flex-col border-r w-full md:w-80 lg:w-[310px] flex-shrink-0 transition-all duration-300 ${activeChatId ? 'hidden md:flex' : 'flex'}`}
        style={{ ...sidebarBg, borderColor: 'rgba(255,255,255,0.06)' }}
      >
        {/* Sidebar Header */}
        <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-black text-white tracking-tight">Messages</h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mt-0.5">
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
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2.5 text-[12px] text-white placeholder-slate-700 rounded-2xl focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
            />
          </div>
        </div>

        {/* Chat list or New chat users */}
        <div className="flex-1 overflow-y-auto py-2 px-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.05) transparent' }}>
          {showNewChat ? (
            <>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-600 px-3 py-2">People</p>
              {allUsers.filter(u => !searchQuery || u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <p className="text-[12px] text-slate-600 text-center py-10">No users found</p>
              ) : (
                allUsers.filter(u => !searchQuery || u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).map(user => (
                  <button
                    key={user.uid}
                    onClick={() => startNewChat(user)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl mb-0.5 transition-all text-left group"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
                  >
                    <Avatar name={user.displayName || user.email} size={9} online={userStatuses[user.uid]?.state === 'online'} gradient="from-blue-500 to-indigo-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-white truncate">{user.displayName || 'Unknown'}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-indigo-400">{user.role || 'User'}</p>
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
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl mb-0.5 text-left transition-all duration-200"
                  style={isActive ? {
                    background: 'rgba(99,102,241,0.15)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    boxShadow: '0 0 20px rgba(99,102,241,0.1)',
                  } : {
                    border: '1px solid transparent',
                    background: 'transparent',
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' } }}
                >
                  <Avatar name={p.name} size={10} online={p.status === 'online'} gradient="from-emerald-500 to-cyan-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className={`text-[13px] font-bold truncate ${unread > 0 ? 'text-white' : 'text-slate-300'}`}>{p.name}</p>
                      <span className="text-[9px] text-slate-600 flex-shrink-0 ml-2 mt-0.5">{formatTime(chat.lastMessageAt)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className={`text-[11px] truncate ${unread > 0 ? 'text-slate-300 font-semibold' : 'text-slate-600'}`}>
                        {chat.lastMessage || 'No messages yet'}
                      </p>
                      {unread > 0 && (
                        <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full text-white text-[9px] font-black flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 10px rgba(99,102,241,0.5)' }}>
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
        <div className="flex-1 flex flex-col min-w-0" style={mainBg}>
          {/* Chat Header */}
          <div className="h-16 flex items-center px-4 gap-3 flex-shrink-0" style={{ background: 'rgba(8,13,26,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>
            {/* Back on mobile */}
            <button
              onClick={() => setActiveChatId(null)}
              className="md:hidden h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            <Avatar name={partner.name} size={9} online={isPartnerOnline} gradient="from-emerald-500 to-cyan-500" />

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-black text-white truncate leading-tight">{partner.name}</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isPartnerOnline ? 'bg-emerald-500' : 'bg-slate-600'}`}
                  style={isPartnerOnline ? { boxShadow: '0 0 6px #10b981' } : {}} />
                <p className={`text-[10px] font-black uppercase tracking-[0.15em] ${isPartnerOnline ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {isPartnerTyping ? 'Typing...' : isPartnerOnline ? 'Online' : partner.lastSeen ? `Last seen ${formatTime({ seconds: new Date(partner.lastSeen).getTime() / 1000 })}` : 'Offline'}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              {/* Video Call */}
              {((partner.role !== 'customer' && userProfile?.role !== 'customer') || partner.isGroup) && (
                <HeaderBtn onClick={() => startVideoCall(activeChatId)} title="Video Call"
                  icon="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                  hoverColor="rgba(59,130,246,0.2)" hoverBorder="rgba(59,130,246,0.3)" hoverText="#60a5fa"
                />
              )}
              {/* Notifications - desktop only */}
              <div className="hidden sm:block">
                <HeaderBtn onClick={requestNotificationPermission} title="Notifications"
                  icon="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  hoverColor={Notification.permission === 'granted' ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.15)'}
                  hoverBorder={Notification.permission === 'granted' ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.25)'}
                  hoverText={Notification.permission === 'granted' ? '#34d399' : '#a5b4fc'}
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
                const showAvatar = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId
                const curDate = getDayLabel(msg.timestamp)
                const prevDate = idx > 0 ? getDayLabel(messages[idx - 1].timestamp) : null
                const showDate = curDate !== prevDate
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
                          <div className={`w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                            {msg.senderName?.charAt(0)?.toUpperCase()}
                          </div>
                        )}

                        {/* Bubble */}
                        <div onClick={() => selectionMode && toggleMsgSel(msg.id)}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${selectionMode ? 'cursor-pointer' : ''}`}>
                          <div
                            className={`rounded-2xl px-4 py-2.5 transition-all ${isMe ? 'rounded-br-md' : 'rounded-bl-md'} ${selectedIds.has(msg.id) ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                            style={isMe ? {
                              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                              boxShadow: '0 4px 20px rgba(79,70,229,0.3)',
                            } : {
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                            }}
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
                            <span className="text-[9px] text-slate-600">{formatMsgTime(msg.timestamp)}</span>
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
            <div className="px-4 py-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,13,26,0.9)' }}>
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

          {/* Input Area */}
          <div className="flex-shrink-0 px-3 sm:px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,13,26,0.95)', backdropFilter: 'blur(20px)' }}>
            <div className="flex items-center gap-2 p-1.5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {/* File input */}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()}
                className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-300 transition-all flex-shrink-0 hover:bg-white/5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </button>

              {/* Emoji */}
              <div className="relative flex-shrink-0">
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all ${showEmojiPicker ? 'text-indigo-400 bg-indigo-500/15' : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                  </svg>
                </button>
                {showEmojiPicker && (
                  <div ref={emojiPickerRef}
                    className="absolute bottom-full left-0 mb-3 w-72 max-h-64 overflow-y-auto rounded-2xl p-3 z-60"
                    style={{ background: '#0d1120', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.05) transparent', animation: 'fadeInUp 0.2s ease' }}>
                    {EMOJIS.map((group, gi) => (
                      <div key={gi} className="mb-3 last:mb-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 mb-1.5 px-1">{group.cat}</p>
                        <div className="grid grid-cols-8 gap-0.5">
                          {group.icons.map((em, ei) => (
                            <button key={ei} onClick={() => setMessageText(p => p + em)}
                              className="text-lg p-1 rounded-lg hover:bg-white/5 transition-all hover:scale-125 active:scale-95">
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
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-transparent text-[13px] text-white placeholder-slate-700 focus:outline-none resize-none py-2"
                style={{ maxHeight: 120 }}
              />

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={sending || (!messageText.trim() && !imageFile)}
                className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', boxShadow: '0 4px 14px rgba(79,70,229,0.4)' }}
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
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
        <div className="absolute inset-0 z-50 flex flex-col" style={{ background: 'rgba(8,13,26,0.98)', animation: 'fadeInUp 0.25s ease' }}>
          <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-[17px] font-black text-white">{showGroupCreate ? 'Create Team Group' : 'New Conversation'}</h2>
            <button onClick={() => { setShowNewChat(false); setShowGroupCreate(false); setSelectedUsersForGroup([]) }}
              className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Create group button (staff only) */}
            {!showGroupCreate && (userProfile?.role === 'admin' || userProfile?.role === 'employee') && (
              <button onClick={() => setShowGroupCreate(true)}
                className="w-full flex items-center justify-center gap-2.5 p-3.5 rounded-2xl mb-5 text-[13px] font-black transition-all"
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
                  className="w-full px-4 py-3 text-[13px] text-white placeholder-slate-700 rounded-2xl focus:outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.09)'}
                />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mt-2 px-1">
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
              {allUsers.filter(u => !searchQuery || u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())).map(u => {
                const isSel = selectedUsersForGroup.find(s => s.uid === u.uid)
                return (
                  <button key={u.uid}
                    onClick={() => showGroupCreate ? toggleUserSel(u) : getOrCreateChat(u.uid, u.displayName, u.email, u.role).then(id => { if (id) { setActiveChatId(id); setShowNewChat(false) } })}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left"
                    style={isSel ? { background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)' } : { background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                    onMouseEnter={e => !isSel && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                    onMouseLeave={e => !isSel && (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-lg font-black text-white"
                        style={{ boxShadow: '0 4px 14px rgba(79,70,229,0.3)' }}>
                        {u.displayName?.charAt(0)?.toUpperCase() || u.email?.charAt(0)?.toUpperCase()}
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
                      <p className="text-[14px] font-bold text-white truncate">{u.displayName || 'Unknown User'}</p>
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
              <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-3xl font-black text-white mx-auto mb-4"
                style={{ boxShadow: '0 8px 30px rgba(16,185,129,0.3)' }}>
                {partner.name?.charAt(0)?.toUpperCase()}
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
