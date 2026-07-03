import { useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext'
import { api } from '../config/api'

function ComposeForm({ onSend }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!form.email || !form.message) {
      setError('Email and message are required')
      return
    }
    setSending(true)
    setError('')
    try {
      const response = await fetch(api.reply, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.name || 'User',
          email: form.email,
          subject: form.subject || 'Message from Amit Solution Hub',
          message: form.message
        })
      })
      if (!response.ok) throw new Error('Failed to send')
      onSend()
    } catch (err) {
      setError('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Recipient name" className="px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Recipient email" className="px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
      </div>
      <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all" />
      <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} placeholder="Write your message..." className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none" />
      <button onClick={handleSend} disabled={sending} className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-slate-900 hover:shadow-lg transition-all disabled:opacity-50">
        {sending ? 'Sending...' : 'Send Message'}
      </button>
    </div>
  )
}

export default function AdminMessages() {
  const { messages, updateMessageStatus, deleteAdminMessage } = useStore()
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showCompose, setShowCompose] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [liveIndicator, setLiveIndicator] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveIndicator(prev => !prev)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const filteredMessages = messages.filter(msg => {
    if (filter === 'unread') return msg.status === 'unread'
    if (filter === 'starred') return msg.starred
    return true
  })

  const unreadCount = messages.filter(m => m.status === 'unread').length

  const markAsRead = async (id) => {
    try {
      await updateMessageStatus(id, { status: 'read' })
    } catch (err) {
      console.error(err)
    }
  }

  const toggleStar = async (id, e) => {
    e.stopPropagation()
    const msg = messages.find(m => m.id === id)
    try {
      await updateMessageStatus(id, { starred: !msg.starred })
    } catch (err) {
      console.error(err)
    }
  }

  const deleteMessage = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this message?')) return
    try {
      setDeletingId(id)
      await deleteAdminMessage(id)
      if (selectedMessage?.id === id) setSelectedMessage(null)
      if (replyingTo?.id === id) {
        setReplyingTo(null)
        setReplyText('')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const deleteAllMessages = async () => {
    if (filteredMessages.length === 0 || bulkDeleting) return

    const filterLabel =
      filter === 'all' ? 'all messages' : filter === 'unread' ? 'all unread messages' : 'all starred messages'

    if (!window.confirm(`Are you sure you want to delete ${filterLabel} (${filteredMessages.length})?`)) return

    try {
      setBulkDeleting(true)
      await Promise.all(filteredMessages.map(message => deleteAdminMessage(message.id)))
      setSelectedMessage(null)
      setReplyingTo(null)
      setReplyText('')
    } catch (err) {
      console.error(err)
    } finally {
      setBulkDeleting(false)
    }
  }

  const archiveMessage = async (id, e) => {
    e.stopPropagation()
    try {
      await updateMessageStatus(id, { archived: true })
      if (selectedMessage?.id === id) setSelectedMessage(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleReply = (message) => {
    setReplyingTo(message)
    setReplyText('')
  }

  const [sending, setSending] = useState(false)

  const sendReply = async () => {
    if (!replyText.trim() || !replyingTo?.email) return
    setSending(true)
    try {
      const response = await fetch(api.reply, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: replyingTo.firstName || replyingTo.name || 'User',
          email: replyingTo.email,
          subject: `Re: ${replyingTo.subject || 'Your Inquiry'}`,
          message: replyText
        })
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to send');
        } else {
          // It's likely an HTML 404 page from Render or a proxy
          const text = await response.text();
          console.error("❌ Non-JSON error response:", text.substring(0, 500));
          throw new Error(`The backend returned a ${response.status} Error. This usually means the code I just added is not yet deployed to Render.`);
        }
      }

      // Update Firestore status to 'replied'
      await updateMessageStatus(replyingTo.id, { status: 'replied', repliedAt: new Date().toISOString() })
      
      setReplyingTo(null)
      setReplyText('')
    } catch (err) {
      console.error('❌ Failed to send reply:', err.message || err)
      alert(`⚠️  Failed to send reply: ${err.message || 'Please check your backend configuration and Resend API key.'}`)
    } finally {
      setSending(false)
    }
  }

  const handleMessageClick = (message) => {
    setSelectedMessage(selectedMessage?.id === message.id ? null : message)
    if (message.status === 'unread') markAsRead(message.id)
  }

  const formatMessageDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
            <p className="text-sm text-slate-500 mt-1">{unreadCount} unread messages</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full">
            <span className={`w-2 h-2 rounded-full ${liveIndicator ? 'bg-emerald-400' : 'bg-emerald-400/40'} transition-opacity`}></span>
            <span className="text-xs text-emerald-400 font-medium">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {filteredMessages.length > 0 && (
            <button
              onClick={deleteAllMessages}
              disabled={bulkDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/15 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              {bulkDeleting ? 'Deleting...' : filter === 'all' ? 'Delete All' : `Delete ${filter}`}
            </button>
          )}
          <button onClick={() => setShowCompose(!showCompose)} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-sm font-medium text-slate-900 hover:shadow-lg hover:shadow-blue-500/25 transition-all">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Compose
          </button>
        </div>
      </div>

      {/* Compose */}
      {showCompose && (
        <div className="bg-white border border-slate-300 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">New Message</h3>
            <button onClick={() => setShowCompose(false)} className="p-1 rounded text-slate-500 hover:text-slate-900"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <ComposeForm onSend={() => setShowCompose(false)} />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        {['all', 'unread', 'starred'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent'}`}>
            {f} {f === 'all' ? `(${messages.length})` : f === 'unread' ? `(${unreadCount})` : `(${messages.filter(m => m.starred).length})`}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="bg-white backdrop-blur-sm border border-slate-200 rounded-2xl overflow-hidden divide-y divide-white/5">
        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-slate-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
            <p className="text-slate-400 text-sm">No messages found</p>
          </div>
        )}
        {filteredMessages.map(message => {
          const senderName = message.firstName ? `${message.firstName} ${message.lastName}` : (message.name || 'Anonymous');
          const isUnread = message.status === 'unread';
          
          return (
            <div key={message.id}>
              <div
                onClick={() => handleMessageClick(message)}
                className={`p-5 cursor-pointer hover:bg-slate-50 transition-colors ${isUnread ? 'bg-blue-500/[0.03]' : ''} ${selectedMessage?.id === message.id ? 'bg-white/[0.03]' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold flex-shrink-0">{senderName.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isUnread ? 'text-slate-900' : 'text-slate-600'}`}>{senderName}</span>
                        {isUnread && <span className="w-2 h-2 rounded-full bg-blue-400" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{formatMessageDate(message.createdAt)}</span>
                        <button onClick={(e) => toggleStar(message.id, e)} className={`p-1 rounded hover:bg-slate-100 ${message.starred ? 'text-amber-400' : 'text-slate-500 hover:text-slate-500'}`}>
                          <svg className="w-4 h-4" fill={message.starred ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
                        </button>
                        <button
                          onClick={(e) => deleteMessage(message.id, e)}
                          disabled={deletingId === message.id || bulkDeleting}
                          className="p-1 rounded text-slate-500 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete message"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm ${isUnread ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{message.subject || 'Inquiry'}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{message.message}</p>

                    {selectedMessage?.id === message.id && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="mb-4 space-y-1">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Contact Info</p>
                          <p className="text-xs text-slate-600">Email: {message.email}</p>
                          {message.mobile && <p className="text-xs text-slate-600">Phone: {message.mobile}</p>}
                          {message.github && <p className="text-xs text-slate-600">GitHub: {message.github}</p>}
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">{message.message}</p>
                        <div className="flex items-center gap-3">
                          <button onClick={(e) => { e.stopPropagation(); handleReply(message) }} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/30 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                            Reply
                          </button>
                          <button onClick={(e) => archiveMessage(message.id, e)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                            Archive
                          </button>
                          <button onClick={(e) => deleteMessage(message.id, e)} disabled={deletingId === message.id || bulkDeleting} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors disabled:cursor-not-allowed disabled:opacity-50">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                            {deletingId === message.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Reply Box */}
              {replyingTo?.id === message.id && (
                <div className="px-5 pb-5 pt-2 bg-slate-50">
                  <div className="bg-white border border-slate-300 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Replying to {senderName} ({replyingTo.email})</span>
                      <button onClick={() => setReplyingTo(null)} className="p-1 rounded text-slate-400 hover:text-slate-900"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                    <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={3} placeholder="Write your reply..." className="w-full px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none" />
                    <div className="flex justify-end">
                      <button onClick={sendReply} disabled={sending} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-xs font-medium text-slate-900 hover:shadow-lg transition-all disabled:opacity-50">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                        {sending ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
}
