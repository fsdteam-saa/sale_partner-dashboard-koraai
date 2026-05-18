"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { customersApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials, formatCurrency, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Search, Users, UserCheck, TrendingUp, DollarSign, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mockCustomers = [
  { _id: "1", name: "James Anderson", email: "james.anderson@email.com", status: "active", lastVisit: new Date(), totalRevenue: 356.00, tags: ["VIP", "High Value"] },
  { _id: "2", name: "Sarah Mitchell", email: "sarah.mitchell@email.com", status: "active", lastVisit: new Date(Date.now() - 86400000), totalRevenue: 189.00, tags: ["Regular"] },
  { _id: "3", name: "Michael Brown", email: "michael.brown@email.com", status: "active", lastVisit: new Date(Date.now() - 172800000), totalRevenue: 163.50, tags: ["High Value"] },
  { _id: "4", name: "Emily Johnson", email: "emily.johnson@email.com", status: "inactive", lastVisit: new Date(Date.now() - 864000000), totalRevenue: 78.00, tags: ["At Risk"] },
  { _id: "5", name: "David Williams", email: "david.williams@email.com", status: "active", lastVisit: new Date(), totalRevenue: 313.00, tags: ["VIP"] },
  { _id: "6", name: "Lisa Martinez", email: "lisa.martinez@email.com", status: "active", lastVisit: new Date(Date.now() - 43200000), totalRevenue: 145.00, tags: ["Regular"] },
  { _id: "7", name: "Robert Taylor", email: "robert.taylor@email.com", status: "inactive", lastVisit: new Date(Date.now() - 691200000), totalRevenue: 56.00, tags: ["At Risk"] },
  { _id: "8", name: "Amanda White", email: "amanda.white@email.com", status: "active", lastVisit: new Date(), totalRevenue: 198.50, tags: ["Loyal", "High Value"] },
];

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(mockCustomers[0]);

  const { data, isLoading } = useQuery({
    queryKey: ["sp-customers", page, search],
    queryFn: () => customersApi.getAll({ page, limit: 10, search: search || undefined }).then(r => r.data),
  });

  const customers = data?.data?.length ? data.data : mockCustomers;
  const meta = data?.meta || { total: 1248 };

  return (
    <div>
      <Header title="Customers" subtitle="Manage your customers and build stronger relationships." />
      <div className="p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Customers", value: "1,248", change: "+12.5%", icon: Users, color: "bg-blue-600" },
            { label: "New Customers", value: "48", change: "+8.7%", icon: UserCheck, color: "bg-emerald-600" },
            { label: "Active Customers", value: "1,034", change: "80%", icon: TrendingUp, color: "bg-purple-600" },
            { label: "Revenue per Customer", value: "€86.50", change: "+15%", icon: DollarSign, color: "bg-amber-600" },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center`}><s.icon className="w-4 h-4 text-white" /></div>
                  <div>
                    <p className="text-lg font-bold text-white">{s.value}</p>
                    <p className="text-[10px] text-gray-400">{s.label}</p>
                    <p className="text-[10px] text-emerald-400">{s.change}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Table */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input placeholder="Search customers..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
                </div>
                <Button onClick={() => toast.info("Add customer")}><Plus className="w-4 h-4" />Add Customer</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e2d40]">
                    {["Customer", "Status", "Last Visit", "Total Revenue", "Tags", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c: any) => (
                    <tr key={c._id} onClick={() => setSelected(c)}
                      className={`border-b border-[#1e2d40] cursor-pointer transition-colors ${selected?._id === c._id ? "bg-blue-600/10" : "hover:bg-[#0d1a2d]"}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8"><AvatarFallback className="text-xs">{getInitials(c.name)}</AvatarFallback></Avatar>
                          <div>
                            <p className="text-xs font-medium text-gray-200">{c.name}</p>
                            <p className="text-[10px] text-gray-500">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant={c.status === "active" ? "success" : "destructive"} className="text-[10px]">{c.status}</Badge></td>
                      <td className="px-4 py-3 text-xs text-gray-400">{timeAgo(c.lastVisit || new Date())}</td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-200">{formatCurrency(c.totalRevenue || 0)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">{(c.tags || []).map((t: string) => <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-600/20 text-blue-400">{t}</span>)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={e => e.stopPropagation()}><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Book Appointment</DropdownMenuItem>
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-4 py-3 border-t border-[#1e2d40]">
                <p className="text-xs text-gray-500">1–{customers.length} of {meta.total} customers</p>
                <div className="flex gap-1">
                  {[1,2,3].map(p => <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded text-xs ${page===p?"bg-blue-600 text-white":"text-gray-400"}`}>{p}</button>)}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPage(p=>p+1)}><ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detail Panel */}
          {selected && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12"><AvatarFallback>{getInitials(selected.name)}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-semibold text-gray-100">{selected.name}</p>
                      <p className="text-xs text-gray-400">{selected.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {["Book Appointment", "Send Message", "Add Note", "Edit Customer"].map(a => (
                      <Button key={a} variant="secondary" size="sm" className="text-[10px] h-8" onClick={() => toast.info(a)}>{a}</Button>
                    ))}
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {[
                      { label: "Total Spend", value: formatCurrency(selected.totalRevenue || 0) },
                      { label: "Last Visit", value: timeAgo(selected.lastVisit || new Date()) },
                      { label: "Status", value: selected.status },
                      { label: "Tags", value: (selected.tags || []).join(", ") },
                    ].map(d => (
                      <div key={d.label} className="flex justify-between py-1.5 border-b border-[#1e2d40] last:border-0">
                        <span className="text-gray-500">{d.label}</span>
                        <span className="text-gray-200">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Smart Suggestions */}
              <Card className="border-blue-600/20">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span>🤖</span><p className="text-sm font-medium text-white">Kora is active</p>
                  </div>
                  {[
                    { text: "This customer hasn't visited in 30 days. Send them a reminder?", color: "bg-amber-600/10 text-amber-300" },
                    { text: "Your top 10 customers generated 60% of your revenue.", color: "bg-emerald-600/10 text-emerald-300" },
                  ].map((s, i) => (
                    <div key={i} className={`${s.color} rounded-lg p-2.5 mb-2 text-xs`}>{s.text}</div>
                  ))}
                  <button className="text-xs text-blue-400 hover:text-blue-300">Explore all capabilities →</button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {["Add Customer", "Import Customers", "Create Appointment", "Send Message", "Export List"].map(a => (
            <Button key={a} variant="secondary" size="sm"><Plus className="w-3 h-3" />{a}</Button>
          ))}
        </div>
      </div>
    </div>
  );
}
