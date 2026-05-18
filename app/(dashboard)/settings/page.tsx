"use client";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { Save, Camera, Bell, Shield, Globe, DollarSign, Settings } from "lucide-react";

const categories = [
  { id: "profile", label: "Profile & Account", icon: Settings, desc: "Manage personal info" },
  { id: "business", label: "Business Information", icon: Globe, desc: "" },
  { id: "notifications", label: "Notifications", icon: Bell, desc: "" },
  { id: "leads", label: "Lead & Sales Settings", icon: DollarSign, desc: "" },
  { id: "integrations", label: "Integrations", icon: Globe, desc: "" },
  { id: "security", label: "Security", icon: Shield, desc: "" },
  { id: "earnings", label: "Earnings & Billing", icon: DollarSign, desc: "" },
];

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState("profile");
  const [name, setName] = useState("Alex Barber");
  const [email, setEmail] = useState("alex@bigpartners.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [language, setLanguage] = useState("English (US)");

  return (
    <div>
      <Header title="Settings" subtitle="Manage your account preferences and partner settings." />
      <div className="p-6">
        {/* Quick Settings Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Notifications", value: "Enabled", sub: "Configure", color: "bg-amber-600/20", icon: "🔔" },
            { label: "Two-Factor Authentication", value: "Enabled", sub: "Manage", color: "bg-emerald-600/20", icon: "🛡️" },
            { label: "Lead Alerts", value: "Active", sub: "Configure", color: "bg-blue-600/20", icon: "🎯" },
            { label: "Default Commission", value: "25%", sub: "View Details", color: "bg-purple-600/20", icon: "💰" },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-3 cursor-pointer hover:opacity-90 transition-opacity`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{s.icon}</span>
                <Badge variant="success" className="text-[9px]">{s.value}</Badge>
              </div>
              <p className="text-xs font-medium text-gray-200">{s.label}</p>
              <p className="text-[10px] text-blue-400">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Categories */}
          <Card>
            <CardContent className="p-2">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors mb-0.5 ${activeCategory === cat.id ? "bg-blue-600/20 text-blue-400 border border-blue-600/20" : "text-gray-400 hover:bg-[#1e2d40]"}`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs">{cat.label}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Main Settings Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Profile & Account</CardTitle>
                <p className="text-xs text-gray-500">Manage your personal information and account settings.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="w-14 h-14"><AvatarFallback className="text-lg">{getInitials(name)}</AvatarFallback></Avatar>
                    <button className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">Change Photo</p>
                    <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                    <p className="text-[10px] text-gray-500">you must be a partner user test</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Full Name</Label>
                    <Input value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email Address</Label>
                    <Input value={email} onChange={e => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone Number</Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Language</Label>
                    <Input value={language} onChange={e => setLanguage(e.target.value)} />
                  </div>
                </div>

                <Button className="w-full" onClick={() => toast.success("Profile saved!")}><Save className="w-4 h-4" />Save Changes</Button>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Change Password</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Change Password</Label>
                  <div className="flex gap-2">
                    <Input type="password" placeholder="New password" className="flex-1" />
                    <Button variant="outline" onClick={() => toast.success("Password updated!")}>Update Password</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Two-Factor Auth */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Two-Factor Authentication</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-200">Two-Factor Authentication: <Badge variant="success" className="text-[10px]">Enabled</Badge></p>
                    <p className="text-xs text-gray-500 mt-0.5">Add an extra layer of security to your account.</p>
                    <p className="text-xs text-gray-500">🔐 Authenticator App • Connected on May 13, 2025</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => toast.info("Manage 2FA")}>Manage 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Account Summary + Kora */}
          <div className="space-y-4">
            <Card className="border-blue-600/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span>🤖</span>
                  <p className="text-sm font-medium text-white">Kora Assistant</p>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 ml-auto"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />Online</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">Hi Alex! 👋 How can I help you with your settings or anything else?</p>
                {[
                  { text: "Enable lead notifications", sub: "Never miss an important lead" },
                  { text: "Secure your account", sub: "Enable 2FA for better security" },
                  { text: "Update payout method", sub: "Manage your earnings payout" },
                ].map((s, i) => (
                  <button key={i} onClick={() => toast.info(s.text)}
                    className="w-full flex items-start gap-2 py-1.5 px-2 hover:bg-[#1e2d40] rounded-lg text-left transition-colors">
                    <span className="text-[10px] text-blue-400 mt-0.5">→</span>
                    <div><p className="text-[10px] text-gray-200">{s.text}</p><p className="text-[9px] text-gray-500">{s.sub}</p></div>
                  </button>
                ))}
                <div className="mt-2">
                  <div className="flex gap-2 mb-2">
                    <div className="bg-blue-600 rounded-xl px-2 py-1.5 ml-auto max-w-[85%]">
                      <p className="text-[10px] text-white">Where can I update my payout method?</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-sm">🤖</span>
                    <div className="bg-[#1e2d40] rounded-xl px-2 py-1.5">
                      <p className="text-[10px] text-gray-200">You can update your payout method in the 'Earnings & Billing' section. I can take you there!</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveCategory("earnings")} className="mt-2 w-full text-[10px] px-2 py-1.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-600/20">Send Earnings & Billing</button>
                </div>
                <input className="w-full mt-2 text-xs bg-[#1e2d40] border border-[#2a3547] rounded-lg px-3 py-2 text-gray-300 placeholder:text-gray-500 focus:outline-none"
                  placeholder="Type your message..." />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Account Summary</CardTitle></CardHeader>
              <CardContent>
                {[
                  { label: "Account Status", value: "● Active", color: "text-emerald-400" },
                  { label: "Member Since", value: "Jan 15, 2024", color: "text-gray-200" },
                  { label: "Last Login", value: "Today, 10:42 AM", color: "text-gray-200" },
                  { label: "Partner for", value: "1 year, 4 months", color: "text-gray-200" },
                ].map(s => (
                  <div key={s.label} className="flex justify-between py-1.5 border-b border-[#1e2d40] last:border-0 text-xs">
                    <span className="text-gray-400">{s.label}</span>
                    <span className={s.color}>{s.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="p-3 bg-[#1e2d40] rounded-xl">
              <p className="text-xs text-gray-400 mb-2">Need Help?</p>
              <p className="text-[10px] text-gray-500 mb-2">Can't find what you're looking for? Contact our support team.</p>
              <Button size="sm" variant="outline" className="w-full text-xs"><ExternalLink className="w-3.5 h-3.5 mr-1" />Contact Support</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExternalLink({ className }: any) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>; }
