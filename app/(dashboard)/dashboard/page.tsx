/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { earningsApi, leadsApi, partnerApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, getInitials, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import { DollarSign, Send, Target, TrendingUp, Users } from "lucide-react";

export default function PartnerDashboardPage() {
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([
    {
      role: "assistant",
      content:
        "Ask about your live partner metrics, active leads, or commission and I’ll point you to the right data.",
    },
  ]);

  const { data: dashboardResponse, isLoading: dashboardLoading } = useQuery({
    queryKey: ["sale-partner-dashboard"],
    queryFn: () => partnerApi.getDashboard().then((response) => response.data),
  });

  const { data: earningsResponse } = useQuery({
    queryKey: ["sale-partner-earnings-dashboard"],
    queryFn: () => earningsApi.getDashboard().then((response) => response.data),
  });

  const { data: leadsResponse } = useQuery({
    queryKey: ["sale-partner-lead-summary"],
    queryFn: () => leadsApi.getAll({ page: 1, limit: 8 }).then((response) => response.data),
  });

  const dashboard = dashboardResponse?.data || {};
  const metrics = dashboard.metrics || {};
  const earnings = earningsResponse?.data || {};
  const leadOverview = leadsResponse?.meta?.overview || {};
  const activeLeads = dashboard.activeLeads || [];

  const leadsByStatus = useMemo(() => {
    return (leadOverview.byStatus || []).reduce((acc: Record<string, number>, item: any) => {
      acc[item._id] = item.count || 0;
      return acc;
    }, {});
  }, [leadOverview.byStatus]);

  const stats = [
    {
      label: "Total Customers",
      value: metrics.totalCustomers || 0,
      helper: `${metrics.dealsClosed || 0} deals closed`,
      icon: Users,
      color: "bg-blue-600",
    },
    {
      label: "Total Leads",
      value: metrics.totalLeads || 0,
      helper: `${leadsByStatus.new || 0} still new`,
      icon: Target,
      color: "bg-emerald-600",
    },
    {
      label: "Monthly Commission",
      value: formatCurrency(metrics.monthlyCommission || earnings.thisMonth || 0),
      helper: `${formatCurrency(metrics.totalCommission || earnings.totalEarnings || 0)} lifetime`,
      icon: DollarSign,
      color: "bg-purple-600",
    },
    {
      label: "Conversion Rate",
      value: `${metrics.conversionRate || 0}%`,
      helper: `${leadOverview.averageScore || 0} average lead score`,
      icon: TrendingUp,
      color: "bg-amber-600",
    },
  ];

  const quickActions = [
    "Create Lead",
    "Generate Leads",
    "Add Customer",
    "View Earnings",
    "Request Payout",
    "Share Link",
  ];

  const sendAssistantMessage = () => {
    if (!assistantInput.trim()) return;

    setAssistantMessages((current) => [
      ...current,
      { role: "user", content: assistantInput.trim() },
      {
        role: "assistant",
        content:
          "This dashboard is now connected to live partner, lead, and earnings data. Open Leads or Earnings for the underlying records.",
      },
    ]);
    setAssistantInput("");
  };

  return (
    <div>
      <Header
        title={dashboard.partner?.businessName || "Partner Dashboard"}
        subtitle="Live partner performance, lead pipeline, and commission data."
      />
      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {dashboardLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="pt-3 pb-3">
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              ))
            : stats.map((item) => (
                <Card key={item.label}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <item.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-white">{item.value}</p>
                        <p className="text-[9px] text-gray-400">{item.label}</p>
                        <p className="text-[9px] text-emerald-400">{item.helper}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Active Leads</CardTitle>
                <button className="text-xs text-blue-400">View all</button>
              </div>
            </CardHeader>
            <CardContent>
              {activeLeads.length === 0 ? (
                <p className="text-sm text-gray-500">No new active leads right now.</p>
              ) : (
                <div className="space-y-0">
                  {activeLeads.map((lead: any) => (
                    <div
                      key={lead._id}
                      className="flex items-center gap-3 py-2.5 border-b border-[#1e2d40] last:border-0"
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="text-[10px]">
                          {getInitials(lead.name || "LD")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-200">
                          {lead.name || "Lead"}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {lead.company || lead.email || "No company"}
                        </p>
                      </div>
                      <Badge variant="warning" className="text-[9px]">
                        {lead.status}
                      </Badge>
                      <div className="text-right">
                        <p className="text-xs font-medium text-gray-200">
                          {formatCurrency(lead.estimatedValue || 0)}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {timeAgo(lead.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-blue-600/20 bg-gradient-to-br from-[#0d1a2d] to-[#0a1628]">
            <CardHeader>
              <CardTitle className="text-sm">Kora Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {assistantMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${message.role === "user" ? "justify-end" : "items-start gap-2"}`}
                  >
                    {message.role === "assistant" ? (
                      <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center flex-shrink-0 text-sm">
                        AI
                      </div>
                    ) : null}
                    <div
                      className={`rounded-xl px-3 py-2 max-w-[85%] ${message.role === "user" ? "bg-blue-600 text-white" : "bg-[#1e2d40] text-gray-200"}`}
                    >
                      <p className="text-xs">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={assistantInput}
                  onChange={(event) => setAssistantInput(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && sendAssistantMessage()}
                  placeholder="Ask about your live data..."
                  className="flex-1 text-xs bg-[#1e2d40] border border-[#2a3547] rounded-lg px-3 py-2 text-gray-200 placeholder:text-gray-500 focus:outline-none"
                />
                <Button size="icon" className="h-9 w-9 rounded-full" onClick={sendAssistantMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {quickActions.map((action) => (
                <button
                  key={action}
                  onClick={() => toast.info(action)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[#1e2d40] hover:bg-[#2a3547] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0d1a2d] flex items-center justify-center text-xs text-gray-300">
                    {action.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                  </div>
                  <span className="text-[10px] text-gray-300 text-center leading-tight">
                    {action}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Lead Pipeline Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {["new", "contacted", "qualified", "proposal", "won", "lost"].map((status) => (
                <div key={status} className="rounded-xl bg-[#1e2d40] p-3">
                  <p className="text-sm font-bold text-white">{leadsByStatus[status] || 0}</p>
                  <p className="text-[10px] text-gray-400 capitalize">{status}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
