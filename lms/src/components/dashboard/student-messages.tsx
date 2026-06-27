"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquareText, Send, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth-store";
import { http } from "@/services/http";

interface Contact {
  id: string;
  name: string;
  role: string;
  online: boolean;
  avatar?: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export function StudentMessages() {
  const user = useAuthStore((s) => s.user);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Connect to Socket.IO
  useEffect(() => {
    if (!user) return;
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    
    socketRef.current = io(socketUrl, {
      autoConnect: false,
      withCredentials: true
    });

    socketRef.current.connect();

    socketRef.current.on("connect", () => {
      setSocketConnected(true);
      // Join user's personal channel for receiving messages
      socketRef.current?.emit("join", user.id);
    });

    socketRef.current.on("message", (msg: Message) => {
      // Check if incoming message is from the currently active contact
      if (selectedContact && msg.senderId === selectedContact.id) {
        setMessages((prev) => [...prev, {
          id: msg.id,
          senderId: msg.senderId,
          senderName: msg.senderName,
          text: msg.text,
          timestamp: msg.timestamp
        }]);
      }
    });

    socketRef.current.on("disconnect", () => {
      setSocketConnected(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user, selectedContact]);

  // Fetch real users from DB to populate contacts list defensively
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res: any = await http.get("/users");
        const items = Array.isArray(res) ? res : (res && res.items ? res.items : []);
        const list = items
          .filter((u: any) => u && u._id && u._id !== user?.id)
          .map((u: any) => ({
            id: u._id,
            name: u.name || "User",
            role: u.role ? (u.role === "super-admin" ? "Admin" : u.role.charAt(0).toUpperCase() + u.role.slice(1)) : "Student",
            online: true
          }));
        setContacts(list);
        if (list.length > 0) {
          setSelectedContact((prev) => prev || list[0]);
        }
      } catch (err) {
        console.error("Failed to load contacts", err);
      }
    };
    fetchUsers();
  }, [user]);

  // Fetch past messages for the selected contact
  useEffect(() => {
    if (!user || !selectedContact) return;
    const fetchRoomMessages = async () => {
      setLoading(true);
      try {
        const roomId = [user.id, selectedContact.id].sort().join("_");
        const res: any = await http.get("/messages");
        const items = Array.isArray(res) ? res : (res && res.items ? res.items : []);
        
        // Filter messages belonging to this specific room
        const filtered = items
          .filter((m: any) => m && m.roomId === roomId)
          .reverse() // Sort chronologically (latest at bottom)
          .map((m: any) => ({
            id: m._id,
            senderId: m.senderId === user.id ? "student" : m.senderId,
            senderName: m.senderId === user.id ? "You" : selectedContact.name,
            text: m.body,
            timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
        setMessages(filtered);
      } catch (err) {
        console.error("Failed to load chat history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoomMessages();
  }, [user, selectedContact]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user || !selectedContact) return;

    const roomId = [user.id, selectedContact.id].sort().join("_");
    const timestampStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Optimistically append message to local state
    const newMsg: Message = {
      id: Math.random().toString(),
      senderId: "student",
      senderName: "You",
      text: messageText,
      timestamp: timestampStr
    };
    setMessages((prev) => [...prev, newMsg]);

    // 2. Save message to database via REST API
    try {
      await http.post("/messages", {
        roomId,
        senderId: user.id,
        recipientId: selectedContact.id,
        body: messageText
      });
    } catch (err) {
      console.error("Failed to persist message in DB", err);
    }

    // 3. Emit message in real-time through WebSockets
    if (socketConnected && socketRef.current) {
      socketRef.current.emit("private_message", {
        to: selectedContact.id,
        text: messageText,
        senderId: user.id,
        senderName: user.name
      });
    }

    setMessageText("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr] h-[72vh] border rounded-xl overflow-hidden bg-card shadow-sm border-slate-200 dark:border-slate-800">
      {/* Contacts Column */}
      <div className="border-r flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b space-y-3 border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Conversations</h3>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chat logs..."
              className="w-full h-8 pl-8 rounded-md border border-slate-200 dark:border-slate-800 px-3 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Contacts list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left text-xs transition ${
                selectedContact && selectedContact.id === contact.id
                  ? "bg-primary/5 text-primary border border-primary/20"
                  : "hover:bg-slate-100/50 dark:hover:bg-slate-900/50 border border-transparent"
              }`}
            >
              <div className="relative shrink-0">
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-800 grid place-items-center font-bold text-slate-500 capitalize">
                  {contact.name[0]}
                </div>
                {contact.online && (
                  <div className="absolute right-0 bottom-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-card" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{contact.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{contact.role}</span>
              </div>
            </button>
          ))}

          {contacts.length === 0 && (
            <div className="text-center p-6 text-slate-400 text-xs">No active users found.</div>
          )}
        </div>
        <div className="p-3 border-t text-[10px] text-muted-foreground text-center bg-slate-100/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800">
          Status: {socketConnected ? "Connected" : "Local Simulator Mode"}
        </div>
      </div>

      {/* Active Conversation Column */}
      <div className="flex flex-col h-full bg-background">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center border-slate-200 dark:border-slate-800 bg-slate-50/20">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedContact.name}</h4>
                <p className="text-[10px] text-muted-foreground">{selectedContact.role} &bull; {selectedContact.online ? "Online" : "Offline"}</p>
              </div>
            </div>

            {/* Message Logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading && (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-primary mr-1.5" />
                  <span className="text-xs text-slate-400">Loading history...</span>
                </div>
              )}
              {!loading && messages.map((msg) => {
                const isSelf = msg.senderId === "student";
                return (
                  <div key={msg.id} className={`flex gap-2.5 max-w-[80%] ${isSelf ? "ml-auto flex-row-reverse" : "mr-auto"}`}>
                    <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 grid place-items-center text-[10px] font-bold text-slate-500 capitalize shrink-0 mt-1">
                      {isSelf ? "Y" : msg.senderName[0]}
                    </div>
                    <div className="space-y-1">
                      <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                        isSelf
                          ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                          : "bg-slate-100 dark:bg-slate-900 border text-slate-800 dark:text-slate-200 rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                      <p className={`text-[9px] text-muted-foreground ${isSelf ? "text-right" : "text-left"}`}>
                        {msg.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 border-slate-200 dark:border-slate-800 bg-slate-50/30">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Message ${selectedContact.name}...`}
                className="flex-1 h-10 rounded-md border border-slate-200 dark:border-slate-800 px-3 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" className="h-10 w-10 p-0">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-slate-400">
            <MessageSquareText className="h-12 w-12 text-slate-300 mb-2" />
            <p className="text-sm">Select a contact to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
