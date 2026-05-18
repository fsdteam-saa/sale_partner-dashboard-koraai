"use client";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Settings, GitBranch, Zap, Shield, Plus, ChevronRight } from "lucide-react";

const actionGroups = [
  {
    title: "Important",
    actions: [
      { icon: "👤", color: "bg-blue-600", title: "Add New Customer", desc: "Create a new customer and setup onboarding", tag: "" },
      { icon: "🔑", color: "bg-green-600", title: "Generate Access Code", desc: "Generate an activation code for a customer/tool activation.", tag: "Popular" },
      { icon: "🏢", color: "bg-red-600", title: "Edit Organisation Data", desc: "Update customer information (contact, billing address).", tag: "" },
    ],
  },
  {
    title: "Support",
    actions: [
      { icon: "🔐", color: "bg-amber-600", title: "Login / Access Help", desc: "Fix or reset access, login or reset account issues.", tag: "" },
      { icon: "📅", color: "bg-purple-600", title: "Calendar / Booking Fix", desc: "Fix calendar issues, issues or availability.", tag: "" },
      { icon: "📋", color: "bg-blue-600", title: "Create Appointment >", desc: "Create a new appointment for the customer.", tag: "" },
      { icon: "💬", color: "bg-green-600", title: "Send Message >", desc: "Send a message to one or multiple of the customer.", tag: "" },
    ],
  },
  {
    title: "Sales",
    actions: [
      { icon: "🔄", color: "bg-amber-600", title: "Change Lead Status >", desc: "Update the status of a lead (e.g. New, In Progress).", tag: "" },
      { icon: "📝", color: "bg-blue-600", title: "Add Note / Call Log >", desc: "Add a note to a customer's log with a due date.", tag: "" },
      { icon: "👥", color: "bg-green-600", title: "Assign Task >", desc: "Create a task for the customer with a due date.", tag: "" },
      { icon: "📧", color: "bg-purple-600", title: "Follow Up >", desc: "Create a follow-up action on a contact.", tag: "" },
    ],
  },
  {
    title: "Security",
    actions: [
      { icon: "🔒", color: "bg-red-600", title: "Emergency Lock >", desc: "Immediately lock a customer account. Admin approval required.", tag: "" },
      { icon: "👁️", color: "bg-blue-600", title: "Impersonate Customer", desc: "Request access to the customer dashboard with customer approval.", tag: "NEW" },
    ],
  },
];

const activeActions = [
  { title: "Call with Michael Brown", sub: "Customer: Fade Masters", priority: "Urgent", status: "Open", time: "10:30 AM" },
  { title: "Support Request #1041", sub: "Customer: Fresh Legends", priority: "High", status: "In Progress", time: "" },
  { title: "Follow up with Fade House", sub: "Lead: Fade House", priority: "Medium", status: "Open", time: "Yesterday" },
  { title: "Add New Customer", sub: "Customer: The Barber Club", priority: "Low", status: "Open", time: "May 19" },
  { title: "Call with Gentleman's Cuts", sub: "Customer: Gentleman's Cuts", priority: "Low", status: "In Progress", time: "May 19" },
];

const priorityColors: Record<string, string> = { Urgent: "destructive", High: "destructive", Medium: "warning", Low: "secondary" };
const statusColors: Record<string, string> = { Open: "default", "In Progress": "warning", Completed: "success" };

export default function ActionsPage() {
  return (
    <div>
      <Header title="Actions" subtitle="Manage all your tasks, processes and support cases in one place." />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Actions Grid */}
          <div className="lg:col-span-3 space-y-5">
            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {["All", "Important", "Customers", "Sales", "Security", "Support"].map(t => (
                <button key={t} className={`px-3 py-1.5 rounded-lg text-xs ${t === "All" ? "bg-blue-600 text-white" : "bg-[#1e2d40] text-gray-400 hover:text-gray-200"}`}>{t}</button>
              ))}
            </div>

            {actionGroups.map(group => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-gray-200 mb-3">{group.title}:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {group.actions.map(action => (
                    <Card key={action.title} className="hover:border-blue-600/40 transition-colors cursor-pointer group">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center text-lg`}>{action.icon}</div>
                          {action.tag && <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${action.tag === "NEW" ? "bg-blue-600 text-white" : "bg-blue-600/20 text-blue-400"}`}>{action.tag}</span>}
                        </div>
                        <p className="text-xs font-medium text-gray-200 mb-1">{action.title}</p>
                        <p className="text-[10px] text-gray-500 leading-relaxed">{action.desc}</p>
                        <button
                          onClick={() => toast.info(`Starting: ${action.title}`)}
                          className="mt-2 text-[10px] text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity">
                          Start Workflow →
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Active Actions */}
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-sm">Active Actions <Badge variant="default" className="text-[9px] ml-1">4</Badge></CardTitle>
                  <button className="text-xs text-blue-400">View all</button>
                </div>
              </CardHeader>
              <CardContent>
                {activeActions.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 py-2.5 border-b border-[#1e2d40] last:border-0">
                    <div className="w-7 h-7 rounded-lg bg-[#1e2d40] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-200 truncate">{a.title}</p>
                      <p className="text-[10px] text-gray-500 truncate">{a.sub}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant={priorityColors[a.priority] as any} className="text-[9px]">↑ {a.priority}</Badge>
                        {a.time && <span className="text-[10px] text-gray-500">{a.time}</span>}
                      </div>
                    </div>
                    <Badge variant={statusColors[a.status] as any} className="text-[9px] flex-shrink-0">{a.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Kora Assistant */}
            <Card className="border-blue-600/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">🤖</span>
                  <p className="text-sm font-medium text-white">Kora Assistant</p>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 ml-auto"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />Online</span>
                </div>
                <div className="space-y-2 mb-3">
                  {[
                    { msg: "Can you help me create a new customer?", sender: "user" },
                    { msg: "Sure! I can guide you through the 'Add New Customer' process and try to resolve this quickly.", sender: "kora" },
                    { msg: "Please like me to start the 'Add New Customer' process?", sender: "kora" },
                    { msg: "Yes, start workflow!", sender: "user" },
                  ].map((m, i) => (
                    <div key={i} className={`flex ${m.sender === "user" ? "justify-end" : "items-start gap-1.5"}`}>
                      {m.sender === "kora" && <span className="text-sm flex-shrink-0">🤖</span>}
                      <div className={`max-w-[85%] rounded-xl px-2.5 py-1.5 ${m.sender === "user" ? "bg-blue-600 text-white" : "bg-[#1e2d40] text-gray-200"}`}>
                        <p className="text-[10px]">{m.msg}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <input className="w-full text-xs bg-[#1e2d40] border border-[#2a3547] rounded-lg px-3 py-2 text-gray-300 placeholder:text-gray-500 focus:outline-none"
                  placeholder="Type your message..." />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
