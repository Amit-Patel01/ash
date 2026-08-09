import ChatPanel from '../components/ChatPanel'

export default function EmployeeChat() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-10rem)]">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Messages</h1>
        <p className="text-sm text-slate-500 mt-1">Chat with team members and students</p>
      </div>

      <div className="h-[calc(100%-5rem)]">
        <ChatPanel embedded />
      </div>
    </div>
  )
}
