import ChatPanel from '../components/ChatPanel'
import { EmployeePageHeader, EmployeeSurface } from './EmployeePanelUI'

export default function EmployeeChatRefined() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <EmployeePageHeader
        eyebrow="Communication"
        title="Messages"
        description="Manage conversations with team members and students in one place. The chat view matches the updated employee panel layout."
      />

      <EmployeeSurface
        title="Conversation Panel"
        description="Embedded workspace for live messages, follow-ups, and support replies."
        className="overflow-hidden p-0"
      >
        <div className="h-[calc(100vh-18rem)] min-h-[38rem]">
          <ChatPanel embedded />
        </div>
      </EmployeeSurface>
    </div>
  )
}
