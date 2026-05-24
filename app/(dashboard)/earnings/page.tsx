/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { earningsApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  TrendingUp,
} from "lucide-react";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_BADGE: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  paid: "success",
  pending: "warning",
  cancelled: "destructive",
};

export default function EarningsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const limit = 10;

  const { data: dashboardResponse, isLoading: dashboardLoading } = useQuery({
    queryKey: ["sp-earnings-dashboard"],
    queryFn: () => earningsApi.getDashboard().then((response) => response.data?.data),
  });

  const { data: earningsResponse, isLoading: listLoading } = useQuery({
    queryKey: ["sp-earnings-list", page, statusFilter],
    queryFn: () =>
      earningsApi
        .getAll({
          page,
          limit,
          status: statusFilter === "all" ? undefined : statusFilter,
        })
        .then((response) => response.data),
  });

  const dashboard: any = dashboardResponse || {};
  const earnings: any[] = earningsResponse?.data || [];
  const meta = earningsResponse?.meta || { total: 0 };
  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / limit));

  const chartData = useMemo(() => {
    return (dashboard.earningsOverTime || []).map((entry: any) => {
      const date = new Date(entry._id.year, entry._id.month - 1, entry._id.day);
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        commission: entry.commission || 0,
        deals: entry.deals || 0,
      };
    });
  }, [dashboard]);

  const withdrawMutation = useMutation({
    mutationFn: () => earningsApi.requestWithdrawal({}),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["sp-earnings-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["sp-earnings-list"] });
      const amount = response.data?.data?.withdrawnAmount || 0;
      toast.success(`Withdrawal requested: ${formatCurrency(amount)}`);
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "No pending earnings to withdraw"),
  });

  const handleExport = async () => {
    try {
      const response = await earningsApi.exportReport();
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `earnings-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Report exported");
    } catch (error: any) {
      toast.error(error?.message || "Export failed");
    }
  };

  const stats = [
    {
      label: "Total Earnings",
      value: formatCurrency(dashboard.totalEarnings || 0),
      icon: DollarSign,
      color: "bg-blue-600",
    },
    {
      label: "This Month",
      value: formatCurrency(dashboard.thisMonth || 0),
      icon: TrendingUp,
      color: "bg-emerald-600",
    },
    {
      label: "Pending Payout",
      value: formatCurrency(dashboard.pendingPayout || 0),
      icon: Clock,
      color: "bg-amber-600",
    },
    {
      label: "Avg Commission",
      value: formatCurrency(dashboard.avgCommission || 0),
      icon: DollarSign,
      color: "bg-purple-600",
    },
  ];

  return (
    <div>
      <Header
        title="Earnings"
        subtitle="Track your performance and earnings. The more you close, the more you earn."
        action={
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download className="mr-1 h-3.5 w-3.5" />
            Export
          </Button>
        }
      />
      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {dashboardLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index}>
                  <CardContent className="pt-3 pb-3">
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              ))
            : stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="pt-3 pb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${stat.color}`}
                      >
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-base font-bold text-white">{stat.value}</p>
                        <p className="text-[10px] text-gray-400">{stat.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Earnings Overview (last 30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <p className="py-10 text-center text-xs text-gray-500">
                    No earnings recorded in the last 30 days.
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          background: "#0d1a2d",
                          border: "1px solid #1e2d40",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                        formatter={(value: any) => formatCurrency(value)}
                      />
                      <Area
                        type="monotone"
                        dataKey="commission"
                        stroke="#22c55e"
                        fill="url(#earnGrad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                  <TabsList className="h-8">
                    {STATUS_TABS.map((tab) => (
                      <TabsTrigger key={tab.value} value={tab.value} className="h-7 text-xs">
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#1e2d40]">
                        {["Customer", "Deal Amount", "Commission", "Date", "Status"].map(
                          (heading) => (
                            <th
                              key={heading}
                              className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-gray-500"
                            >
                              {heading}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {listLoading ? (
                        Array.from({ length: 5 }).map((_, rowIndex) => (
                          <tr key={rowIndex} className="border-b border-[#1e2d40]">
                            {Array.from({ length: 5 }).map((_, cellIndex) => (
                              <td key={cellIndex} className="px-4 py-3">
                                <Skeleton className="h-4 w-16" />
                              </td>
                            ))}
                          </tr>
                        ))
                      ) : earnings.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-10 text-center text-sm text-gray-500"
                          >
                            No earnings recorded yet.
                          </td>
                        </tr>
                      ) : (
                        earnings.map((earning) => (
                          <tr
                            key={earning._id}
                            className="border-b border-[#1e2d40] hover:bg-[#0d1a2d]"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1e2d40] text-xs font-bold text-gray-300">
                                  {(earning.customer_id?.name || "??").slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-200">
                                    {earning.customer_id?.name || "—"}
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    {earning.customer_id?.email || ""}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs font-medium text-gray-200">
                              {formatCurrency(earning.amount || 0)}
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-xs font-medium text-emerald-400">
                                {formatCurrency(earning.commission || 0)}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {earning.commissionRate || 0}%
                              </p>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400">
                              {earning.paidAt
                                ? formatDate(earning.paidAt)
                                : formatDate(earning.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={STATUS_BADGE[earning.status] || "secondary"}
                                className="text-[10px]"
                              >
                                {earning.status}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between border-t border-[#1e2d40] px-4 py-3">
                  <p className="text-xs text-gray-500">
                    {meta.total > 0
                      ? `${(page - 1) * limit + 1}–${Math.min(
                          page * limit,
                          meta.total
                        )} of ${meta.total}`
                      : "0 entries"}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-2 text-xs text-gray-300">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setPage((current) => current + 1)}
                      disabled={page >= totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-emerald-600/20">
              <CardContent className="pt-4">
                <div className="mb-3">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Ready to withdraw
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-400">
                    {formatCurrency(dashboard.pendingPayout || 0)}
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => withdrawMutation.mutate()}
                  disabled={withdrawMutation.isPending || (dashboard.pendingPayout || 0) <= 0}
                >
                  {withdrawMutation.isPending ? "Processing..." : "Request Withdrawal"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button
                  onClick={() => setStatusFilter("paid")}
                  className="flex w-full items-center gap-3 rounded-xl bg-[#1e2d40] p-2.5 text-left transition-colors hover:bg-[#2a3547]"
                >
                  <span className="text-base">💰</span>
                  <span className="flex-1 text-xs text-gray-200">View Paid Earnings</span>
                  <span className="text-xs text-gray-500">›</span>
                </button>
                <button
                  onClick={handleExport}
                  className="flex w-full items-center gap-3 rounded-xl bg-[#1e2d40] p-2.5 text-left transition-colors hover:bg-[#2a3547]"
                >
                  <span className="text-base">📊</span>
                  <span className="flex-1 text-xs text-gray-200">Export Report</span>
                  <span className="text-xs text-gray-500">›</span>
                </button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
