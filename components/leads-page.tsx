/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusVariant: Record<string, any> = {
  new: "default",
  contacted: "purple",
  qualified: "success",
  proposal: "warning",
  won: "success",
  lost: "destructive",
};

const STATUSES = ["all", "new", "contacted", "qualified", "proposal", "won", "lost"];

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: leadsResponse, isLoading } = useQuery({
    queryKey: ["sale-partner-leads", page, search, statusFilter],
    queryFn: () =>
      leadsApi
        .getAll({
          page,
          limit: 10,
          search: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
        })
        .then((response) => response.data),
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leadsApi.changeStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale-partner-leads"] });
      toast.success("Lead status updated");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to update lead"),
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => leadsApi.convertToCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale-partner-leads"] });
      toast.success("Lead converted to customer");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to convert lead"),
  });

  const leads = leadsResponse?.data || [];
  const meta = leadsResponse?.meta || {};
  const overview = meta.overview || {};

  const statusCounts = useMemo(() => {
    const base: Record<string, number> = { all: meta.total || 0 };
    (overview.byStatus || []).forEach((item: any) => {
      base[item._id] = item.count || 0;
    });
    return base;
  }, [meta.total, overview.byStatus]);

  return (
    <div>
      <Header
        title="Leads"
        subtitle="Live lead pipeline data for this sales partner account."
      />
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap gap-1 bg-[#0d1a2d] p-1 rounded-lg w-fit">
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => {
                setPage(1);
                setStatusFilter(status);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 ${statusFilter === status ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
            >
              {status}
              <span className={`text-[10px] ${statusFilter === status ? "text-white/70" : "text-gray-500"}`}>
                {statusCounts[status] || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              className="pl-9"
            />
          </div>
          <Button onClick={() => toast.info("Use the lead creation form from the create screen.")}>
            Add Lead
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : leads.length === 0 ? (
                <div className="p-4">
                  <p className="text-sm text-gray-500">No leads found for this filter.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e2d40]">
                      {["Lead", "Company", "Source", "Status", "Value", "Created", ""].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead: any) => (
                      <tr key={lead._id} className="border-b border-[#1e2d40] hover:bg-[#0d1a2d] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7">
                              <AvatarFallback className="text-[10px]">
                                {getInitials(lead.name || "LD")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-medium text-gray-200">{lead.name}</p>
                              <p className="text-[10px] text-gray-500">{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {lead.company || "No company"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-400">
                          {lead.source || "manual"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant[lead.status] || "secondary"} className="text-[10px]">
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-200">
                          {formatCurrency(lead.estimatedValue || 0)}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {["contacted", "qualified", "proposal", "won", "lost"].map((status) => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() =>
                                    changeStatusMutation.mutate({
                                      id: String(lead._id),
                                      status,
                                    })
                                  }
                                >
                                  Mark {status}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem onClick={() => convertMutation.mutate(String(lead._id))}>
                                Convert to customer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e2d40]">
                <p className="text-xs text-gray-500">
                  Page {meta.page || page} of {meta.totalPages || 1}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page >= (meta.totalPages || 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Lead Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {STATUSES.filter((status) => status !== "all").map((status) => (
                  <div key={status} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400 capitalize">{status}</span>
                    <span className="text-gray-200">{statusCounts[status] || 0}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Pipeline Value</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#1e2d40]">
                  <span className="text-gray-500">Estimated Total</span>
                  <span className="text-gray-200">
                    {formatCurrency(overview.totalEstimatedValue || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Average Score</span>
                  <span className="text-gray-200">{overview.averageScore || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
