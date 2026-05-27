/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDate, getInitials, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  MoreHorizontal,
  Plus,
  Search,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { CustomerFormDialog } from "@/components/customer-form-dialog";

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "at_risk", label: "At risk" },
];

const STATUS_BADGE: Record<string, "success" | "destructive" | "secondary"> = {
  active: "success",
  inactive: "secondary",
  at_risk: "destructive",
};

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const limit = 10;

  const { data: customersResponse, isLoading } = useQuery({
    queryKey: ["sp-customers", page, search, statusFilter],
    queryFn: () =>
      customersApi
        .getAll({
          page,
          limit,
          search: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
        })
        .then((response) => response.data),
  });

  const { data: statsResponse } = useQuery({
    queryKey: ["sp-customer-stats"],
    queryFn: () => customersApi.getStats().then((response) => response.data?.data),
  });

  const customers: any[] = customersResponse?.data || [];
  const meta = customersResponse?.meta || { total: 0, totalPages: 1 };

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer._id === selectedId) || customers[0] || null,
    [customers, selectedId]
  );

  const stats = [
    {
      label: "Total Customers",
      value: statsResponse?.totalCustomers ?? "—",
      icon: Users,
      color: "bg-blue-600",
    },
    {
      label: "New (30 days)",
      value: statsResponse?.newCustomers ?? "—",
      icon: UserCheck,
      color: "bg-emerald-600",
    },
    {
      label: "Active",
      value: statsResponse?.activeCustomers ?? "—",
      icon: TrendingUp,
      color: "bg-purple-600",
    },
    {
      label: "Avg. Revenue",
      value:
        statsResponse?.avgRevenuePerCustomer != null
          ? formatCurrency(statsResponse.avgRevenuePerCustomer)
          : "—",
      icon: DollarSign,
      color: "bg-amber-600",
    },
  ];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sp-customers"] });
      queryClient.invalidateQueries({ queryKey: ["sp-customer-stats"] });
      toast.success("Customer deleted");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to delete customer"),
  });

  const handleEdit = (customer: any) => {
    setEditing(customer);
    setFormOpen(true);
  };

  const handleBook = (customer: any) => {
    router.push(`/calendar?customer=${encodeURIComponent(customer._id)}`);
  };

  return (
    <div>
      <Header
        title="Customers"
        subtitle="Manage your customers and build stronger relationships."
        action={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Customer
          </Button>
        }
      />
      <div className="space-y-5 p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${stat.color}`}
                  >
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                    <p className="text-[10px] text-gray-400">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search customers..."
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#1e2d40]">
                      {["Customer", "Status", "Last Visit", "Spend", "Tags", ""].map((heading) => (
                        <th
                          key={heading}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 6 }).map((_, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-[#1e2d40]">
                          {Array.from({ length: 6 }).map((_, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-3">
                              <Skeleton className="h-4 w-16" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : customers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                          No customers yet.
                        </td>
                      </tr>
                    ) : (
                      customers.map((customer) => (
                        <tr
                          key={customer._id}
                          onClick={() => setSelectedId(customer._id)}
                          className={`cursor-pointer border-b border-[#1e2d40] transition-colors ${
                            selectedCustomer?._id === customer._id
                              ? "bg-blue-600/10"
                              : "hover:bg-[#0d1a2d]"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {getInitials(customer.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-medium text-gray-200">
                                  {customer.name}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  {customer.email || customer.phone}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={STATUS_BADGE[customer.status] || "secondary"} className="text-[10px]">
                              {customer.status?.replace("_", " ") || "—"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {customer.lastAppointment ? timeAgo(customer.lastAppointment) : "—"}
                          </td>
                          <td className="px-4 py-3 text-xs font-medium text-gray-200">
                            {formatCurrency(customer.totalSpend || 0)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {(customer.tags || []).slice(0, 3).map((tag: string) => (
                                <span
                                  key={tag}
                                  className="rounded bg-blue-600/20 px-1.5 py-0.5 text-[10px] text-blue-400"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={(event) => event.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(customer)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBook(customer)}>
                                  Book Appointment
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-400"
                                  onClick={() => {
                                    if (confirm(`Delete ${customer.name}?`)) {
                                      deleteMutation.mutate(customer._id);
                                    }
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
                    ? `${(page - 1) * limit + 1}–${Math.min(page * limit, meta.total)} of ${meta.total}`
                    : "0 customers"}
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
                    Page {page} of {meta.totalPages || 1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page >= (meta.totalPages || 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {selectedCustomer ? (
              <Card>
                <CardContent className="pt-4">
                  <div className="mb-4 flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>{getInitials(selectedCustomer.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-100">
                        {selectedCustomer.name}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {selectedCustomer.email || "—"}
                      </p>
                      <p className="truncate text-[11px] text-gray-500">
                        {selectedCustomer.phone || ""}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-[#1e2d40] py-1.5">
                      <span className="text-gray-500">Total spend</span>
                      <span className="font-medium text-gray-200">
                        {formatCurrency(selectedCustomer.totalSpend || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#1e2d40] py-1.5">
                      <span className="text-gray-500">Appointments</span>
                      <span className="text-gray-200">
                        {selectedCustomer.totalAppointments || 0}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-[#1e2d40] py-1.5">
                      <span className="text-gray-500">Last visit</span>
                      <span className="text-gray-200">
                        {selectedCustomer.lastAppointment
                          ? timeAgo(selectedCustomer.lastAppointment)
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-gray-500">Customer since</span>
                      <span className="text-gray-200">
                        {selectedCustomer.createdAt
                          ? formatDate(selectedCustomer.createdAt)
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(selectedCustomer)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleBook(selectedCustomer)}>
                      Book
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      </div>

      <CustomerFormDialog open={formOpen} onOpenChange={setFormOpen} customer={editing} />
    </div>
  );
}
