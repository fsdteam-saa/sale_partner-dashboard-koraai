"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supportApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Plus, HeadphonesIcon, BookOpen, Calendar, Shield, Code, CheckCircle, ExternalLink } from "lucide-react";

export default function SupportPage() {
  const [activeView, setActiveView] = useState("Help Center");

  const categories = [
    { icon: BookOpen, label: "Help Center", desc: "Browse articles and guides", count: 45 },
    { icon: HeadphonesIcon, label: "My Requests", desc: "View and track your requests", count: 10 },
    { icon: Plus, label: "Contact Support", desc: "Get help from our team", count: 0 },
    { icon: CheckCircle, label: "System Status", desc: "View status page", count: 0, status: "operational" },
  ];

  const helpTopics = [
    { icon: BookOpen, title: "Account & Login", desc: "Login issues, password reset, 2FA, account access and security.", articles: 18, color: "bg-blue-600" },
    { icon: Calendar, title: "Calendar & Appointments", desc: "Sync issues, calendar settings, booking problems and fixes.", articles: 12, color: "bg-emerald-600" },
    { icon: HeadphonesIcon, title: "Leads & Customers", desc: "Managing leads, customer profiles, status and activity.", articles: 10, color: "bg-purple-600" },
    { icon: BookOpen, title: "Billing & Earnings", desc: "Payments, invoices, subscriptions and earning questions.", articles: 7, color: "bg-amber-600" },
    { icon: Code, title: "Technical Issues", desc: "Bug reports, application errors, performance and system issues.", articles: 6, color: "bg-red-600" },
    { icon: Shield, title: "Security & Privacy", desc: "Data protection, privacy settings, permissions and compliance.", articles: 6, color: "bg-cyan-600" },
  ];

  const popularArticles = [
    { title: "How to reset a customer password", category: "Account & Login" },
    { title: "Fix calendar sync issues", category: "Calendar & Appointments" },
    { title: "How to add a new customer", category: "Leads & Customers" },
    { title: "Understanding your earnings", category: "Billing & Earnings" },
    { title: "Enable two-factor authentication (2FA)", category: "Account & Login" },
  ];

  const categoryColors: Record<string, string> = {
    "Account & Login": "bg-blue-600/20 text-blue-400",
    "Calendar & Appointments": "bg-emerald-600/20 text-emerald-400",
    "Leads & Customers": "bg-purple-600/20 text-purple-400",
    "Billing & Earnings": "bg-amber-600/20 text-amber-400",
    "Technical Issues": "bg-red-600/20 text-red-400",
    "Security & Privacy": "bg-cyan-600/20 text-cyan-400",
  };

  return (
    <div>
      <Header title="Support" subtitle="Get help, solve issues or contact support." />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left Sidebar */}
          <div className="space-y-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button key={cat.label} onClick={() => setActiveView(cat.label)}
                  className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-colors ${activeView === cat.label ? "bg-blue-600/20 text-blue-400 border border-blue-600/20" : "text-gray-400 hover:bg-[#1e2d40] hover:text-gray-200"}`}>
                  <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">{cat.label}</p>
                    <p className="text-[10px] text-gray-500">{cat.desc}</p>
                  </div>
                  {cat.status && <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />{cat.status}</span>}
                </button>
              );
            })}

            <div className="mt-2 p-3 bg-emerald-600/10 border border-emerald-600/20 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <p className="text-xs font-medium text-emerald-400">System Status</p>
              </div>
              <p className="text-[10px] text-emerald-400">All systems operational</p>
              <button className="text-[10px] text-blue-400 mt-1">View status page →</button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Help Center</CardTitle>
                <p className="text-xs text-gray-500">Find answers, guides and solutions for common topics.</p>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input className="w-full pl-9 h-9 text-sm bg-[#0d1526] border border-[#2a3547] rounded-lg text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Search for help topics..." />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">Popular topics ▾</span>
                </div>
              </CardHeader>
              <CardContent>
                {/* Topic Cards */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {helpTopics.map(topic => {
                    const Icon = topic.icon;
                    return (
                      <button key={topic.title} className="flex flex-col gap-2 p-3 bg-[#1e2d40] rounded-xl hover:bg-[#2a3547] transition-colors text-left">
                        <div className={`w-8 h-8 rounded-lg ${topic.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-200">{topic.title}</p>
                          <p className="text-[10px] text-gray-500 leading-relaxed mt-0.5">{topic.desc}</p>
                          <p className="text-[10px] text-blue-400 mt-1">{topic.articles} articles</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Popular Articles */}
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-xs font-medium text-gray-300">Popular Articles</p>
                    <button className="text-xs text-blue-400">View all articles →</button>
                  </div>
                  {popularArticles.map(a => (
                    <button key={a.title} className="w-full flex items-center gap-3 py-2 hover:bg-[#1e2d40] rounded-lg px-2 transition-colors text-left">
                      <BookOpen className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-300 flex-1">{a.title}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full ${categoryColors[a.category]}`}>{a.category}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Kora Assistant */}
          <div className="space-y-4">
            <Card className="border-blue-600/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🤖</span>
                  <p className="text-sm font-medium text-white">Kora Assistant</p>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 ml-auto"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />Online</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">Hi Alex! I'm here to help you. I can try to solve your issue or connect you with our admins.</p>
                <div className="space-y-1.5 mb-3">
                  {[
                    { text: "Fix calendar sync issues", sub: "Let's try to quickly fix." },
                    { text: "Reset customer access", sub: "I can help you through this" },
                    { text: "How do I add a new customer?", sub: "I'll guide you step by step" },
                    { text: "See more suggestions", sub: "" },
                  ].map((s, i) => (
                    <button key={i} onClick={() => toast.info(s.text)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 bg-[#1e2d40] rounded-lg hover:bg-[#2a3547] text-left">
                      <span className="text-[10px] text-blue-400 flex-shrink-0">→</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-gray-200">{s.text}</p>
                        {s.sub && <p className="text-[9px] text-gray-500">{s.sub}</p>}
                      </div>
                    </button>
                  ))}
                </div>
                {/* Mock conversation */}
                <div className="space-y-2 mb-3">
                  <div className="flex justify-end">
                    <div className="bg-blue-600 rounded-xl px-3 py-1.5 max-w-[85%]">
                      <p className="text-[10px] text-white">A customer says their calendar is not syncing between web and mobile.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-sm">🤖</span>
                    <div className="bg-[#1e2d40] rounded-xl px-3 py-1.5 max-w-[85%]">
                      <p className="text-[10px] text-gray-200">I can help with that. This is a common sync issue that's usually caused by... Would you like me to start the "Calendar Sync Fix" workflow and try to fix it automatically?</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 text-[10px] h-7" onClick={() => toast.success("Workflow started!")}>Yes, start workflow</Button>
                    <Button variant="outline" size="sm" className="flex-1 text-[10px] h-7">No, contact support</Button>
                  </div>
                </div>
                <input className="w-full text-xs bg-[#1e2d40] border border-[#2a3547] rounded-lg px-3 py-2 text-gray-300 placeholder:text-gray-500 focus:outline-none"
                  placeholder="Type your message..." />
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="border-emerald-600/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <p className="text-sm font-medium text-white">System Status</p>
                </div>
                <p className="text-xs text-emerald-400 mb-1">All systems operational</p>
                <p className="text-xs text-gray-400">Everything is running smoothly.</p>
                <button className="text-xs text-blue-400 mt-2">View status page →</button>
              </CardContent>
            </Card>

            <div className="p-3 bg-[#1e2d40] rounded-xl text-center">
              <p className="text-xs text-gray-400 mb-1">Need more help?</p>
              <p className="text-[10px] text-gray-500 mb-2">If you can't solve your issue, you can submit a request to our system administrators.</p>
              <Button size="sm" className="w-full text-xs" onClick={() => toast.info("Submit request")}>Submit Request</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
