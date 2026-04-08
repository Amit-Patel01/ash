import ChatPanel from '../components/ChatPanel'
import { EmployeePageHeader, EmployeeSurface } from './EmployeePanelUI'

export default function EmployeeChatRefined() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <EmployeePageHeader
        eyebrow="Communication"
        title="Messages"
        description="Team members aur customers ke saath conversation yahin se manage karo. Employee panel ke new shell ke saath chat view bhi ab consistent hai."
      />

      <EmployeeSurface
        title="Conversation Panel"
        description="Live messages, follow-ups aur support replies ke liye embedded chat workspace."
        className="overflow-hidden p-0"
      >
        <div className="h-[calc(100vh-18rem)] min-h-[38rem]">
          <ChatPanel embedded />
        </div>
      </EmployeeSurface>
    </div>
  )
}
