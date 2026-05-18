"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { calendarApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Filter, Settings, Sparkles, RefreshCw } from "lucide-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = ["19", "20", "21", "22", "23", "24", "25"];
const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

const teamMembers = [
  { name: "Admin (me)", color: "#3b82f6" },
  { name: "Partner 1", color: "#22c55e" },
  { name: "Partner 2", color: "#a855f7" },
  { name: "Customer 1", color: "#f59e0b" },
];

const events: Record<string, any[]> = {
  "Mon-09": [{ title: "Leadership Meeting", sub: "Strategy Review", color: "#3b82f6", span: 1 }],
  "Mon-11": [{ title: "Product Roadmap", sub: "Planning", color: "#3b82f6", span: 1 }],
  "Mon-13": [{ title: "Q2 Performance", sub: "Review", color: "#3b82f6", span: 1 }],
  "Mon-15": [{ title: "Budget Planning", sub: "Session", color: "#f59e0b", span: 1 }],
  "Mon-17": [{ title: "Team Standup", sub: "Follow-up", color: "#3b82f6", span: 1 }],
  "Tue-08": [{ title: "Executive Sync", sub: "All Hands", color: "#22c55e", span: 1 }],
  "Tue-10": [{ title: "Marketing Strategy", sub: "Review", color: "#22c55e", span: 1 }],
  "Tue-12": [{ title: "Lead Generation", sub: "Planning", color: "#22c55e", span: 1 }],
  "Wed-09": [{ title: "Precision Grooming", sub: "Strategy Call", color: "#a855f7", span: 1 }],
  "Wed-11": [{ title: "Customer Success", sub: "Update", color: "#a855f7", span: 1 }],
  "Thu-09": [{ title: "Lucas Anderson", sub: "Haircut", color: "#3b82f6", span: 1 }],
  "Thu-11": [{ title: "Justin Thomas", sub: "Beard Trim", color: "#3b82f6", span: 1 }],
  "Fri-08": [{ title: "Executive Board", sub: "Meeting 95%", color: "#f59e0b", span: 1, pct: 95 }],
  "Fri-10": [{ title: "Ryan Walker", sub: "Haircut", color: "#22c55e", span: 1 }],
};

export default function CalendarPage() {
  const [view, setView] = useState("Week");
  const [showInsights, setShowInsights] = useState(true);

  const { data } = useQuery({
    queryKey: ["calendar"],
    queryFn: () => calendarApi.getEvents().then(r => r.data),
  });

  const insights = [
    { text: "Wednesday is your busiest day", sub: "18 appointments scheduled", icon: "📅", color: "bg-blue-600/20" },
    { text: "You have 32 appointments this week", icon: "📅", color: "bg-emerald-600/20" },
    { text: "15 tasks are overdue", sub: "Require your attention", icon: "⭐", color: "bg-amber-600/20" },
  ];

  return (
    <div>
      <Header title="Calendar" subtitle="Manage appointments across your organization. Stay organized, save time." />
      <div className="p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-[#0d1a2d] p-1 rounded-lg">
              {["Day", "Week", "Month", "Agenda"].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${view === v ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}`}>{v}</button>
              ))}
            </div>
            <button className="text-gray-400 hover:text-gray-200"><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-sm text-gray-200 font-medium">May 19 – May 25, 2025</span>
            <button className="text-gray-400 hover:text-gray-200"><ChevronRight className="w-5 h-5" /></button>
            <Button variant="outline" size="sm" className="h-8 text-xs">Today</Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs"><Filter className="w-3.5 h-3.5" />Filters</Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs"><Settings className="w-3.5 h-3.5" /></Button>
            <Button size="sm" className="h-8 text-xs"><Plus className="w-3.5 h-3.5" />Create Appointment</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Calendar Grid */}
          <Card className="lg:col-span-3">
            <CardContent className="p-0">
              {/* Team Members Filter */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2d40]">
                <span className="text-xs text-gray-500">Team Calendars</span>
                <span className="text-gray-500 text-xs">?</span>
                {teamMembers.map((m) => (
                  <button key={m.name} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#1e2d40] hover:bg-[#2a3547] transition-colors">
                    <Avatar className="w-5 h-5 flex-shrink-0">
                      <AvatarFallback className="text-[8px]" style={{ background: m.color + "40", color: m.color }}>
                        {getInitials(m.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-300">{m.name}</span>
                  </button>
                ))}
                <button className="w-7 h-7 rounded-full bg-[#1e2d40] flex items-center justify-center text-gray-400 hover:text-gray-200">+</button>
                <button className="w-7 h-7 rounded-full bg-[#1e2d40] flex items-center justify-center text-gray-400 hover:text-gray-200">+</button>
              </div>

              {/* Kora Insights */}
              {showInsights && (
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1e2d40] bg-[#0a1628]">
                  <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-xs text-gray-300 font-medium mr-2">Kora Insights</span>
                  {insights.map((ins, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${ins.color} cursor-pointer hover:opacity-80`}>
                      <span className="text-sm">{ins.icon}</span>
                      <div>
                        <p className="text-xs text-gray-200">{ins.text}</p>
                        {ins.sub && <p className="text-[10px] text-gray-400">{ins.sub}</p>}
                      </div>
                    </div>
                  ))}
                  <button className="text-xs text-blue-400 hover:text-blue-300 ml-auto whitespace-nowrap">View all insights →</button>
                </div>
              )}

              {/* Week Grid */}
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Header */}
                  <div className="grid grid-cols-8 border-b border-[#1e2d40]">
                    <div className="px-3 py-2 text-xs text-gray-500">GMT+1</div>
                    {days.map((day, i) => (
                      <div key={day} className="px-3 py-2 text-center border-l border-[#1e2d40]">
                        <p className="text-xs text-gray-400">{day}</p>
                        <p className={`text-lg font-bold ${i === 1 ? "text-blue-400" : "text-gray-200"}`}>{dates[i]}</p>
                        {i === 4 && <div className="text-[9px] text-amber-400">● 95%</div>}
                        {i === 5 && <div className="text-[9px] text-amber-400">● 70%</div>}
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  {hours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b border-[#1e2d40] min-h-[52px]">
                      <div className="px-3 py-1 text-[10px] text-gray-500 flex-shrink-0">{hour}</div>
                      {days.map((day) => {
                        const key = `${day}-${hour.slice(0, 2)}`;
                        const evts = events[key] || [];
                        return (
                          <div key={day} className="border-l border-[#1e2d40] px-1 py-0.5 relative">
                            {evts.map((evt, ei) => (
                              <div key={ei} className="rounded-md px-1.5 py-1 mb-0.5 cursor-pointer hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: evt.color + "30", borderLeft: `2px solid ${evt.color}` }}>
                                <p className="text-[10px] font-medium truncate" style={{ color: evt.color }}>{evt.title}</p>
                                {evt.sub && <p className="text-[9px] text-gray-400 truncate">{evt.sub}</p>}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 px-4 py-2 border-t border-[#1e2d40]">
                {teamMembers.map((m) => (
                  <div key={m.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                    <span className="text-[10px] text-gray-400">{m.name}</span>
                  </div>
                ))}
                <button className="ml-auto text-xs text-gray-500 hover:text-gray-300">⚙ Manage calendars</button>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Friday Info */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-200">Friday, May 23</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                      <span className="text-xs text-red-400 font-medium">Overbooked</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">18 Appointments</span>
                  <span className="text-amber-400">120% of capacity</span>
                </div>
                <div className="h-1.5 bg-[#1e2d40] rounded-full mb-4">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: "100%" }} />
                </div>
                <div className="space-y-2">
                  {[
                    { time: "08:30", name: "Executive Board Meeting", type: "Q2 Analysis", status: "Completed", color: "text-emerald-400" },
                    { time: "10:00", name: "Financial Review", type: "Q2 Analysis", status: "In Progress", color: "text-amber-400" },
                    { time: "11:30", name: "Team Training Session", type: "Monthly Training", status: "Next", color: "text-blue-400" },
                    { time: "14:00", name: "Client Review Meeting", type: "Q2 Review", status: "Upcoming", color: "text-gray-400" },
                    { time: "16:00", name: "Week in Review", type: "Team Wrap-up", status: "Upcoming", color: "text-gray-400" },
                  ].map((appt) => (
                    <div key={appt.time} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500 w-10 flex-shrink-0">{appt.time}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-200 truncate">{appt.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{appt.type}</p>
                      </div>
                      <span className={`text-[10px] font-medium flex-shrink-0 ${appt.color}`}>{appt.status}</span>
                    </div>
                  ))}
                </div>
                <button className="text-xs text-blue-400 mt-3 hover:text-blue-300">View full day →</button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {[
                  { label: "Add Appointment", icon: Plus },
                  { label: "Add Block", icon: ChevronLeft },
                  { label: "Add Break", icon: ChevronRight },
                  { label: "Appointment Types", icon: Settings },
                  { label: "Calendar Settings", icon: Settings },
                ].map((a) => (
                  <button key={a.label} onClick={() => toast.info(a.label)}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-[#1e2d40] hover:bg-[#2a3547] transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-[#0d1a2d] flex items-center justify-center">
                      <a.icon className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-[10px] text-gray-400 text-center leading-tight">{a.label}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Calendar Sync */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">Calendar Sync</CardTitle>
                  <button className="text-gray-400"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <span className="text-xs text-emerald-400">Connected</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#1e2d40] flex items-center justify-center">
                    <span className="text-sm">📅</span>
                  </div>
                  <span className="text-xs text-gray-300">Google Calendar</span>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs h-8"><RefreshCw className="w-3 h-3" />Sync Settings</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
