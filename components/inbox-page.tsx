"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import { Search, Edit, Video, Users, MoreVertical, Paperclip, Smile, Send, FileText, Pin, Calendar } from "lucide-react";

const chats = [
  { id: "1", name: "Max Williams", status: "online", role: "Barber", lastMsg: "Sounds good, let's do it!", time: "11:42 AM", unread: 2 },
  { id: "2", name: "Sarah Taylor", status: "online", role: "Barber", lastMsg: "I'll send you the files shortly.", time: "11:28 AM", unread: 1 },
  { id: "3", name: "Team Planning", status: "group", role: "Group", lastMsg: "Chris: Don't forget our meeting...", time: "10:15 AM", unread: 3 },
  { id: "4", name: "Chris Davis", status: "online", role: "Barber", lastMsg: "See you in the meeting.", time: "9:45 AM", unread: 0 },
  { id: "5", name: "Emily Smith", status: "offline", role: "Barber", lastMsg: "Perfect, thank you!", time: "Yesterday", unread: 0 },
  { id: "6", name: "Design Team", status: "group", role: "Group", lastMsg: "You: Great work everyone!", time: "Yesterday", unread: 0 },
  { id: "7", name: "James Johnson", status: "offline", role: "Barber", lastMsg: "Can you review this?", time: "May 21", unread: 0 },
  { id: "8", name: "Marketing Team", status: "group", role: "Group", lastMsg: "Sophia: New campaign ideas", time: "May 21", unread: 0 },
];

const messages = [
  { id: "1", sender: "other", content: "Hey Alex! Just wanted to confirm our meeting for tomorrow at 10 AM.", time: "11:32 AM" },
  { id: "2", sender: "me", content: "Hi Max! Yes, confirmed ✅ We'll discuss the new promotions.", time: "11:33 AM", seen: true },
  { id: "3", sender: "other", content: "Perfect! Can you also share the Q2 performance report before then?", time: "11:34 AM" },
  { id: "4", sender: "me", content: "Sure thing, I'll send it over in a few minutes.", time: "11:35 AM", seen: true },
  { id: "5", sender: "other", content: "Great, thanks! 🙏", time: "11:41 AM" },
  { id: "6", sender: "me", content: "Sounds good, let's do it! 💪", time: "11:42 AM", seen: true, seenCount: 2 },
];

export default function InboxPage() {
  const [selected, setSelected] = useState(chats[0]);
  const [msg, setMsg] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("All");
  const [mainTab, setMainTab] = useState("Chats");

  return (
    <div>
      <Header title="Inbox" subtitle="Stay connected with your team and never miss what matters." />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 rounded-xl border border-[#1e2d40] overflow-hidden" style={{ height: "calc(100vh-200px)", minHeight: 500 }}>
          {/* Conversations */}
          <div className="border-r border-[#1e2d40] flex flex-col bg-[#0a1628]">
            <div className="p-4 border-b border-[#1e2d40]">
              <div className="flex justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-200">Conversations</h3>
                <button className="text-gray-500"><Edit className="w-4 h-4" /></button>
              </div>
              <div className="flex gap-2 mb-3">
                <Button variant={mainTab === "Chats" ? "default" : "ghost"} size="sm" className="h-7 text-xs" onClick={() => setMainTab("Chats")}>
                  Chats
                </Button>
                <Button variant={mainTab === "Email" ? "default" : "ghost"} size="sm" className="h-7 text-xs" onClick={() => setMainTab("Email")}>
                  Email
                </Button>
              </div>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                <Input placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
              </div>
              <div className="flex gap-1">
                {["All", "Unread", "Groups"].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-1 rounded-lg text-xs ${tab === t ? "bg-blue-600 text-white" : "text-gray-400"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {chats.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())).map(chat => (
                <div key={chat.id} onClick={() => setSelected(chat)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#1e2d40] transition-colors ${selected.id === chat.id ? "bg-blue-600/10" : "hover:bg-[#0d1a2d]"}`}>
                  <div className="relative">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="text-xs">{chat.status === "group" ? "👥" : getInitials(chat.name)}</AvatarFallback>
                    </Avatar>
                    {chat.status === "online" && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0a1628]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="text-xs font-medium text-gray-200 truncate">{chat.name}</p>
                      <span className="text-[10px] text-gray-500">{chat.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">{chat.lastMsg}</p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center">{chat.unread}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="lg:col-span-2 flex flex-col bg-[#070f1c] border-r border-[#1e2d40]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#1e2d40]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-9 h-9"><AvatarFallback className="text-xs">{getInitials(selected.name)}</AvatarFallback></Avatar>
                  {selected.status === "online" && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#070f1c]" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-200">{selected.name}</p>
                  <p className="text-[10px] text-emerald-400">Online</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1"><Video className="w-3.5 h-3.5" />Start Meeting</Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Users className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><Search className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              <div className="text-center text-[10px] text-gray-500 py-1">Today</div>
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.sender === "me" ? "justify-end" : "items-end gap-2"}`}>
                  {m.sender !== "me" && <Avatar className="w-7 h-7 flex-shrink-0"><AvatarFallback className="text-[9px]">{getInitials(selected.name)}</AvatarFallback></Avatar>}
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${m.sender === "me" ? "bg-blue-600 text-white rounded-br-sm" : "bg-[#1e2d40] text-gray-200 rounded-bl-sm"}`}>
                    <p className="text-sm">{m.content}</p>
                    <div className={`flex items-center gap-1 mt-0.5 ${m.sender === "me" ? "justify-end" : ""}`}>
                      <span className={`text-[10px] ${m.sender === "me" ? "text-blue-200" : "text-gray-500"}`}>{m.time}</span>
                      {(m as any).seen && <span className="text-[10px] text-blue-200">✓✓{(m as any).seenCount ? ` ${(m as any).seenCount}` : ""}</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center text-[10px] text-gray-500 py-1">New Messages</div>
            </div>
            <div className="px-5 py-3 border-t border-[#1e2d40]">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8"><Paperclip className="w-4 h-4" /></Button>
                <Input placeholder="Type a message..." value={msg} onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (() => { toast.success("Message sent"); setMsg(""); })()} className="flex-1" />
                <Button variant="ghost" size="icon" className="h-8 w-8"><Smile className="w-4 h-4" /></Button>
                <Button size="icon" className="h-8 w-8 rounded-full" onClick={() => { toast.success("Sent"); setMsg(""); }}><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col bg-[#0a1628] overflow-y-auto p-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-4">Contact Details</h3>
            <div className="text-center mb-4">
              <Avatar className="w-14 h-14 mx-auto mb-2"><AvatarFallback>{getInitials(selected.name)}</AvatarFallback></Avatar>
              <div className="flex items-center justify-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /><span className="text-xs text-emerald-400">Online</span></div>
              <p className="font-semibold text-gray-100 mt-1">{selected.name}</p>
              <p className="text-xs text-gray-400">{selected.role}</p>
            </div>
            <div className="grid grid-cols-4 gap-1 mb-4">
              {[{ icon: Video, label: "Start Meeting" }, { icon: Calendar, label: "Schedule" }, { icon: FileText, label: "Add Note" }, { icon: Users, label: "Create Task" }].map(a => (
                <div key={a.label} className="flex flex-col items-center gap-1">
                  <button className="w-9 h-9 rounded-xl bg-[#1e2d40] flex items-center justify-center hover:bg-[#2a3547]"><a.icon className="w-4 h-4 text-gray-300" /></button>
                  <span className="text-[9px] text-gray-500 text-center">{a.label}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-xs mb-4">
              {[{ k: "Email", v: "max@fademasters.com" }, { k: "Phone", v: "+49 176 12345678" }, { k: "Department", v: "Barbers" }, { k: "Since", v: "Jan 15, 2023" }].map(d => (
                <div key={d.k} className="flex justify-between py-1.5 border-b border-[#1e2d40]">
                  <span className="text-gray-500">{d.k}</span>
                  <span className="text-gray-200 truncate max-w-[100px]">{d.v}</span>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-2"><p className="text-xs font-medium text-gray-300">Shared Files</p><button className="text-xs text-blue-400">View all</button></div>
              {[{ name: "Q2_Performance_Report.pdf", size: "PDF • 2.4 MB", color: "bg-red-500" }, { name: "Promotion_Banners.zip", size: "ZIP • 12.6 MB", color: "bg-amber-500" }, { name: "Team_Meeting_Notes.docx", size: "DOCX • 1.1 MB", color: "bg-blue-500" }].map(f => (
                <div key={f.name} className="flex items-center gap-2 py-1.5">
                  <div className={`w-6 h-6 rounded ${f.color} flex items-center justify-center flex-shrink-0`}><FileText className="w-3 h-3 text-white" /></div>
                  <div><p className="text-[10px] text-gray-200 truncate">{f.name}</p><p className="text-[10px] text-gray-500">{f.size}</p></div>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between mb-2"><p className="text-xs font-medium text-gray-300">Pinned Messages</p><button className="text-xs text-blue-400">View all</button></div>
              <div className="flex items-start gap-2 p-2.5 bg-[#1e2d40] rounded-lg">
                <Pin className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <div><p className="text-xs text-gray-300">Don't forget: Team meeting every Monday at 9 AM.</p><p className="text-[10px] text-gray-500">Pinned by you • May 12</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
