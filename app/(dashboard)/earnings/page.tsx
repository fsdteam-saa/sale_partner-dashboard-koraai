"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { earningsApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { DollarSign, TrendingUp, Clock, Download, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { date: "May 1", earnings: 350 }, { date: "May 4", earnings: 420 }, { date: "May 8", earnings: 380 },
  { date: "May 11", earnings: 460 }, { date: "May 14", earnings: 500 }, { date: "May 18", earnings: 540 },
  { date: "May 21", earnings: 6540 }, { date: "May 25", earnings: 580 }, { date: "May 28", earnings: 620 }, { date: "May 31", earnings: 660 },
];

const mockDeals = [
  { _id: "1", customer: "Cutz & Co.", type: "Barbershop", amount: 3599, commission: 619.97, commissionPct: "17%", closedAt: "2025-05-31", status: "paid" },
  { _id: "2", customer: "Hair Legends", type: "Barbershop", amount: 1800, commission: 360, commissionPct: "20%", closedAt: "2025-05-30", status: "paid" },
  { _id: "3", customer: "Fade House", type: "Barbershop", amount: 1400, commission: 378, commissionPct: "27%", closedAt: "2025-05-28", status: "pending" },
  { _id: "4", customer: "The Barber Club", type: "Barbershop", amount: 3200, commission: 640, commissionPct: "20%", closedAt: "2025-05-25", status: "paid" },
  { _id: "5", customer: "Gentlemen's Cuts", type: "Barbershop", amount: 3200, commission: 640, commissionPct: "20%", closedAt: "2025-05-23", status: "paid" },
];

export default function EarningsPage() {
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState("Month");

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["earnings-dashboard"],
    queryFn: () => earningsApi.getDashboard().then(r => r.data.data),
  });

  const { data: deals } = useQuery({
    queryKey: ["earnings-deals", page],
    queryFn: () => earningsApi.getAll({ page, limit: 10 }).then(r => r.data),
  });

  const withdrawMutation = useMutation({
    mutationFn: (data: object) => earningsApi.requestWithdrawal(data),
    onSuccess: () => toast.success("Withdrawal requested!"),
    onError: () => toast.error("Failed to request withdrawal"),
  });

  const allDeals = deals?.data?.length ? deals.data : mockDeals;

  const stats = [
    { label: "Total Earnings", value: "€24,560", change: "+8.7% vs last month", icon: DollarSign, color: "bg-blue-600" },
    { label: "This Month", value: "€6,540", change: "+26.8% vs last month", icon: TrendingUp, color: "bg-emerald-600" },
    { label: "Pending Payout", value: "€2,340", change: "+8.2% vs last month", icon: Clock, color: "bg-amber-600" },
    { label: "Avg Commission", value: "€480", change: "+14.5% vs last month", icon: DollarSign, color: "bg-purple-600" },
    { label: "Conversion Rate", value: "24.8%", change: "+1.6% vs last month", icon: TrendingUp, color: "bg-cyan-600" },
  ];

  return (
    <div>
      <Header title="Earnings" subtitle="Track your performance and earnings. The more you close, the more you earn." />
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {stats.map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center flex-shrink-0`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{s.value}</p>
                    <p className="text-[9px] text-gray-400">{s.label}</p>
                    <p className="text-[9px] text-emerald-400">{s.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart + Deals Table */}
          <div className="lg:col-span-2 space-y-4">
            {/* Earnings Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Earnings Overview</CardTitle>
                  <div className="flex gap-1">
                    {["Day", "Week", "Month", "Year"].map(p => (
                      <button key={p} onClick={() => setPeriod(p)}
                        className={`px-2 py-1 text-xs rounded-lg ${period === p ? "bg-blue-600 text-white" : "text-gray-400"}`}>{p}</button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold text-white">May 31</span>
                  <span className="text-xs text-blue-400">€6,540</span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: "#0d1a2d", border: "1px solid #1e2d40", borderRadius: "8px", fontSize: "11px" }} />
                    <Area type="monotone" dataKey="earnings" stroke="#22c55e" fill="url(#earnGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
                {/* View toggles */}
                <div className="flex gap-2 mt-2">
                  {["Earnings", "Deals Closed", "Leads Converted"].map(v => (
                    <button key={v} className={`text-[10px] px-2 py-1 rounded ${v === "Earnings" ? "text-emerald-400 border-b border-emerald-400" : "text-gray-500"}`}>{v}</button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Deals Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <Tabs defaultValue="deals">
                      <TabsList className="h-8">
                        {["Deals", "Sources", "Payouts"].map(t => (
                          <TabsTrigger key={t} value={t.toLowerCase()} className="text-xs h-7">{t}</TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e2d40]">
                      {["Customer", "Deal Amount", "Commission", "Date Closed", "Status", ""].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allDeals.map((deal: any) => (
                      <tr key={deal._id} className="border-b border-[#1e2d40] hover:bg-[#0d1a2d]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-[#1e2d40] flex items-center justify-center text-xs font-bold text-gray-300">
                              {(deal.customer || "??").slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-200">{deal.customer}</p>
                              <p className="text-[10px] text-gray-500">{deal.type}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-gray-200">{formatCurrency(deal.amount)}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-emerald-400">{formatCurrency(deal.commission)}</p>
                          <p className="text-[10px] text-gray-500">{deal.commissionPct}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">{formatDate(deal.closedAt)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={deal.status === "paid" ? "success" : "warning"} className="text-[10px]">
                            {deal.status === "paid" ? "✓ Paid" : "⏳ Pending"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-gray-500 text-xs">···</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e2d40]">
                  <p className="text-xs text-gray-500">Showing 1 to 5 of 28 deals</p>
                  <div className="flex gap-1">
                    {[1,2,3].map(p => <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded text-xs ${page === p ? "bg-blue-600 text-white" : "text-gray-400"}`}>{p}</button>)}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(p => p+1)}><ChevronRight className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Kora Insights */}
            <Card className="border-emerald-600/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <p className="text-sm font-medium text-white">Kora is Active</p>
                </div>
                {[
                  { text: "You earned €1,200 more this week compared to last week.", icon: "📈", color: "bg-emerald-600/10 text-emerald-300" },
                  { text: "Your best performing source is Instagram (82% of deals).", icon: "🏆", color: "bg-blue-600/10 text-blue-300" },
                  { text: "You could increase earnings by following up 2 leads.", icon: "💡", color: "bg-amber-600/10 text-amber-300" },
                ].map((ins, i) => (
                  <div key={i} className={`${ins.color} rounded-lg p-2.5 mb-2 text-xs`}>
                    {ins.icon} {ins.text}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: "Withdraw Earnings", icon: "💸", desc: "" },
                  { label: "View Deals", icon: "📋", desc: "" },
                  { label: "Export Report", icon: "📊", desc: "" },
                  { label: "Show Referral Link", icon: "🔗", desc: "" },
                ].map(a => (
                  <button key={a.label} onClick={() => a.label === "Withdraw Earnings" ? withdrawMutation.mutate({ amount: 2340 }) : toast.info(a.label)}
                    className="w-full flex items-center gap-3 p-2.5 bg-[#1e2d40] rounded-xl hover:bg-[#2a3547] transition-colors text-left">
                    <span className="text-base">{a.icon}</span>
                    <span className="text-xs text-gray-200 flex-1">{a.label}</span>
                    <span className="text-gray-500 text-xs">›</span>
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
