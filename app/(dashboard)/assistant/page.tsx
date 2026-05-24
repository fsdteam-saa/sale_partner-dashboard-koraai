"use client";
import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Sparkles, BarChart2, Users, TrendingUp } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { koraAssistantApi } from "@/lib/api";
import { toast } from "sonner";

interface Message { id: string; role: "user" | "assistant"; content: string; time: string; data?: any; }

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: "1", role: "assistant",
    content: "Hi Alex! 👋\n\nI'm Kora, your AI assistant. I can help you grow your business, manage customers, bookings, and performance more efficiently.",
    time: "Now",
  }]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMutation = useMutation({
    mutationFn: (msg: string) => koraAssistantApi.sendMessage({ message: msg }),
    onSuccess: (res) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: "assistant",
        content: res.data?.data?.reply || "Here are the insights based on your partnership data.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        data: res.data?.data,
      }]);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: "assistant",
        content: "Here are your top 5 services by revenue this month. Would you like to view the full report or drill down into Haircut & Styling?",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        data: {
          table: [
            { Rank: 1, Service: "Haircut & Styling", Revenue: "$12,580", Bookings: 86, "Conv. Rate": "32.4%" },
            { Rank: 2, Service: "Beard Trim", Revenue: "$7,940", Bookings: 64, "Conv. Rate": "28.7%" },
            { Rank: 3, Service: "Coloring", Revenue: "$6,320", Bookings: 42, "Conv. Rate": "24.2%" },
          ]
        },
      }]);
    },
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function handleSend() {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: input, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    sendMutation.mutate(input);
    setInput("");
  }

  const suggestions = [
    { icon: Users, text: "Show me my bookings for today" },
    { icon: TrendingUp, text: "How are my leads performing this week?" },
    { icon: BarChart2, text: "Which services are most profitable?" },
    { icon: Users, text: "Show my revenue for this month" },
  ];

  const smartSuggestions = [
    { icon: "📅", title: "Review today's bookings", desc: "See upcoming appointments" },
    { icon: "👥", title: "Follow up with new leads", desc: "You have 8 new leads" },
    { icon: "💬", title: "Check customer feedback", desc: "See recent reviews and ratings" },
    { icon: "🎁", title: "Create special offer", desc: "Boost sales with promotions" },
    { icon: "📊", title: "Analyze revenue performance", desc: "Compare with last month" },
  ];

  return (
    <div>
      <Header title="Assistant" subtitle="Your AI assistant for managing and optimizing the entire KoraAI platform." />
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2">
            <CardContent className="p-0 flex flex-col h-[calc(100vh-200px)]">
              {messages.length <= 2 && (
                <div className="px-5 pt-4 pb-2">
                  <div className="grid grid-cols-2 gap-2">
                    {suggestions.map(s => (
                      <button key={s.text} onClick={() => setInput(s.text)}
                        className="flex items-center gap-2 p-2.5 bg-[#1e2d40] rounded-lg hover:bg-[#243040] text-left">
                        <s.icon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                        <span className="text-xs text-gray-300">{s.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "items-start gap-3"}`}>
                    {msg.role === "assistant" && <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 text-base">🤖</div>}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-[#1e2d40] text-gray-200"}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.data?.table && (
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead><tr className="border-b border-[#2a3547]">{Object.keys(msg.data.table[0]).map(k => <th key={k} className="py-1 px-2 text-left text-gray-400">{k}</th>)}</tr></thead>
                            <tbody>{msg.data.table.map((row: any, i: number) => (
                              <tr key={i} className="border-b border-[#2a3547]">{Object.values(row).map((v: any, j) => <td key={j} className="py-1.5 px-2 text-gray-300">{v}</td>)}</tr>
                            ))}</tbody>
                          </table>
                        </div>
                      )}
                      {msg.role === "assistant" && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {["View full report", "Drill down into Haircut & Styling", "Export as PDF", "No, thanks"].map(a => (
                            <button key={a} className="text-[10px] px-2 py-1 bg-[#2a3547] text-gray-300 rounded-lg hover:bg-[#3a4557]">{a}</button>
                          ))}
                        </div>
                      )}
                      <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-blue-200" : "text-gray-500"}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                {sendMutation.isPending && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-base">🤖</div>
                    <div className="bg-[#1e2d40] rounded-2xl px-4 py-3"><div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}</div></div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
              <div className="p-4 border-t border-[#1e2d40]">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon"><Paperclip className="w-4 h-4" /></Button>
                  <Input placeholder="Ask Kora anything..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()} className="flex-1" />
                  <Button onClick={handleSend} disabled={!input.trim()}><Send className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-blue-600/20">
              <CardContent className="pt-4 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center mx-auto mb-2"><span className="text-4xl">🤖</span></div>
                <p className="font-medium text-white">Kora Assistant</p>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 mt-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />Online</span>
                <p className="text-xs text-gray-400 mt-2">Kora is ready to help. I can access real-time data, generate insights, and take actions across the platform.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-blue-400" />Suggested for you</CardTitle></CardHeader>
              <CardContent>
                {smartSuggestions.map(s => (
                  <button key={s.title} onClick={() => setInput(s.title)}
                    className="w-full flex items-center gap-3 py-2 hover:bg-[#1e2d40] rounded-lg px-2 transition-colors text-left">
                    <div className="w-7 h-7 rounded-lg bg-[#1e2d40] flex items-center justify-center flex-shrink-0"><span className="text-sm">{s.icon}</span></div>
                    <div><p className="text-xs font-medium text-gray-200">{s.title}</p><p className="text-[10px] text-gray-500">{s.desc}</p></div>
                    <span className="text-gray-500 ml-auto">›</span>
                  </button>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex justify-between"><CardTitle className="text-sm">Recent conversations</CardTitle><button className="text-xs text-blue-400">View all</button></div>
              </CardHeader>
              <CardContent>
                {["Top services by revenue", "Bookings overview", "Lead performance this week", "Revenue report"].map((c, i) => (
                  <button key={c} onClick={() => setInput(c)} className="w-full flex items-center gap-2 py-1.5 text-left hover:bg-[#1e2d40] rounded-lg px-2">
                    <span className="text-gray-500 text-xs">◷</span>
                    <span className="text-xs text-gray-300 flex-1">{c}</span>
                    <span className="text-[10px] text-gray-500">{["10:45 AM", "Yesterday", "2 days ago", "3 days ago"][i]}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Folders */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Folders</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[{ icon: "📁", label: "Create Folder", desc: "Create a new folder for your files" }, { icon: "📂", label: "View Folder", desc: "View and manage all folders" }].map(f => (
                  <button key={f.label} onClick={() => toast.info(f.label)}
                    className="w-full flex items-center gap-3 p-2.5 bg-[#1e2d40] rounded-xl hover:bg-[#2a3547] text-left">
                    <span className="text-lg">{f.icon}</span>
                    <div><p className="text-xs font-medium text-gray-200">{f.label}</p><p className="text-[10px] text-gray-500">{f.desc}</p></div>
                    <span className="text-gray-500 ml-auto">›</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
