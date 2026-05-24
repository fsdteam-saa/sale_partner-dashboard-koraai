/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Globe,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Star,
  Zap,
} from "lucide-react";

const BUSINESS_TYPES = [
  "Barbershop",
  "Hair Salon",
  "Beauty Salon",
  "Spa",
  "Nail Salon",
  "Restaurant",
  "Gym",
  "Cafe",
];

const RADIUS_OPTIONS = ["5 km", "10 km", "25 km", "50 km"];

const STATUS_BADGE: Record<string, any> = {
  new: "default",
  contacted: "secondary",
  qualified: "success",
  proposal: "warning",
  won: "success",
  lost: "destructive",
};

const STATUS_DOT: Record<string, string> = {
  new: "bg-blue-400",
  contacted: "bg-purple-400",
  qualified: "bg-emerald-400",
  proposal: "bg-amber-400",
  won: "bg-cyan-400",
  lost: "bg-red-400",
};

export default function LeadGeneratorPage() {
  const queryClient = useQueryClient();
  const [location, setLocation] = useState("Hamburg, Germany");
  const [businessType, setBusinessType] = useState("Barbershop");
  const [radius, setRadius] = useState("10 km");
  const [generateCount, setGenerateCount] = useState(5);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: leadsResponse, isLoading } = useQuery({
    queryKey: ["sp-generator-leads", statusFilter],
    queryFn: () =>
      leadsApi
        .getAll({
          source: "lead_generator",
          status: statusFilter === "all" ? undefined : statusFilter,
          limit: 50,
        })
        .then((response) => response.data),
  });

  const leads: any[] = leadsResponse?.data || [];

  const selected = useMemo(
    () => leads.find((lead) => lead._id === selectedId) || leads[0] || null,
    [leads, selectedId]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((lead) => {
      counts[lead.status] = (counts[lead.status] || 0) + 1;
    });
    return counts;
  }, [leads]);

  const generateMutation = useMutation({
    mutationFn: (payload: object) => leadsApi.generate(payload),
    onSuccess: (response) => {
      const count = response.data?.data?.length || 0;
      queryClient.invalidateQueries({ queryKey: ["sp-generator-leads"] });
      queryClient.invalidateQueries({ queryKey: ["sale-partner-leads"] });
      toast.success(`${count} new leads generated`);
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || error?.message || "Generation failed"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leadsApi.changeStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sp-generator-leads"] });
      queryClient.invalidateQueries({ queryKey: ["sale-partner-leads"] });
      toast.success("Status updated");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to update status"),
  });

  const handleGenerate = () => {
    if (!location.trim() || !businessType.trim()) {
      toast.error("Location and business type are required");
      return;
    }
    generateMutation.mutate({ location, businessType, radius, generateCount });
  };

  const filters = [
    { value: "all", label: "All", count: leads.length, dot: "bg-gray-400" },
    { value: "new", label: "New", count: statusCounts.new || 0, dot: "bg-blue-400" },
    { value: "qualified", label: "Qualified", count: statusCounts.qualified || 0, dot: "bg-emerald-400" },
    { value: "contacted", label: "Contacted", count: statusCounts.contacted || 0, dot: "bg-purple-400" },
    { value: "won", label: "Won", count: statusCounts.won || 0, dot: "bg-cyan-400" },
    { value: "lost", label: "Lost", count: statusCounts.lost || 0, dot: "bg-red-400" },
  ];

  return (
    <div>
      <Header
        title="Lead Generator"
        subtitle="Discover high-potential businesses in your territory and turn them into loyal customers."
      />
      <div className="p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Generate Leads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                    <Input value={location} onChange={(event) => setLocation(event.target.value)} className="pl-8 text-xs" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Business Type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Radius</Label>
                    <Select value={radius} onValueChange={setRadius}>
                      <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {RADIUS_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Count</Label>
                    <Input type="number" min={1} max={20} value={generateCount}
                      onChange={(event) => setGenerateCount(Math.max(1, Math.min(20, Number(event.target.value) || 5)))}
                      className="text-xs" />
                  </div>
                </div>
                <Button className="w-full text-xs" onClick={handleGenerate} disabled={generateMutation.isPending}>
                  <Zap className="mr-1 h-3.5 w-3.5" />
                  {generateMutation.isPending ? "Generating..." : "Generate Leads"}
                </Button>
                <p className="text-center text-[10px] text-gray-500">Up to 20 leads per request. AI-powered.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Generated Leads <span className="font-normal text-gray-500">{leads.length}</span></CardTitle>
                  <button className="text-gray-500 hover:text-gray-300" onClick={() => queryClient.invalidateQueries({ queryKey: ["sp-generator-leads"] })} aria-label="Refresh">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="max-h-[520px] overflow-y-auto p-0">
                {isLoading ? (
                  <div className="space-y-2 p-3">
                    {Array.from({ length: 4 }).map((_, index) => (<Skeleton key={index} className="h-16 w-full" />))}
                  </div>
                ) : leads.length === 0 ? (
                  <p className="p-4 text-center text-xs text-gray-500">No generated leads yet. Generate some above.</p>
                ) : (
                  leads.map((lead) => (
                    <div key={lead._id} onClick={() => setSelectedId(lead._id)}
                      className={`flex cursor-pointer items-start gap-3 border-b border-[#1e2d40] p-3 transition-colors ${selected?._id === lead._id ? "bg-blue-600/10" : "hover:bg-[#0d1a2d]"}`}>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1e2d40] text-xs font-bold text-gray-300">
                        {lead.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-xs font-medium text-gray-200">{lead.name}</p>
                          <Badge variant={STATUS_BADGE[lead.status] || "default"} className="ml-1 shrink-0 text-[9px]">{lead.status}</Badge>
                        </div>
                        <p className="truncate text-[10px] text-gray-500">{lead.address || lead.company || ""}</p>
                        {lead.rating ? (
                          <div className="mt-0.5 flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] text-gray-400">{lead.rating}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="lg:col-span-1">
            {selected ? (
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1e2d40] text-sm font-bold text-gray-200">
                    {selected.name?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <Badge variant="default" className="mb-1 text-[9px]">● {selected.status}</Badge>
                    <p className="truncate font-semibold text-gray-100">{selected.name}</p>
                    <p className="truncate text-xs text-gray-400">{selected.businessType || "—"}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  {selected.address ? (<div className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-500" /><span className="text-gray-300">{selected.address}</span></div>) : null}
                  {selected.phone ? (<div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 shrink-0 text-gray-500" /><span className="text-gray-300">{selected.phone}</span></div>) : null}
                  {selected.website ? (<div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 shrink-0 text-gray-500" /><span className="truncate text-blue-400">{selected.website}</span></div>) : null}
                  {selected.rating ? (<div className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /><span className="text-gray-300">{selected.rating}</span></div>) : null}
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs text-gray-500">Status</p>
                    <Select value={selected.status} onValueChange={(value) => statusMutation.mutate({ id: selected._id, status: value })}>
                      <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.keys(STATUS_DOT).map((status) => (<SelectItem key={status} value={status}>{status}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {selected.notes ? (<div><p className="mb-1 text-xs text-gray-500">Notes</p><p className="rounded-lg bg-[#1e2d40] p-2 text-xs text-gray-300">{selected.notes}</p></div>) : null}
                <div className="flex gap-2">
                  {selected.phone ? (<Button size="sm" variant="ghost" className="h-8 flex-1 text-xs" onClick={() => window.open(`tel:${selected.phone}`)}><Phone className="mr-1 h-3 w-3" />Call</Button>) : null}
                  <Button size="sm" className="h-8 flex-1 text-xs" onClick={() => statusMutation.mutate({ id: selected._id, status: "qualified" })} disabled={selected.status === "qualified" || statusMutation.isPending}>
                    <Plus className="mr-1 h-3 w-3" />Mark Qualified
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="flex h-full items-center justify-center pt-4">
                <p className="text-xs text-gray-500">Select a lead to see details</p>
              </CardContent>
            )}
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                {filters.map((filter) => (
                  <button key={filter.value} onClick={() => setStatusFilter(filter.value)}
                    className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] transition-colors ${statusFilter === filter.value ? "bg-blue-600 text-white" : "bg-[#1e2d40] text-gray-400"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${filter.dot}`} />
                    {filter.label} <span className="font-bold">{filter.count}</span>
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-[500px] overflow-hidden rounded-xl border border-[#1e2d40] bg-[#0d1a2d] p-4">
                <div className="absolute inset-0 opacity-30">
                  {Array.from({ length: 10 }).map((_, index) => (<div key={`h${index}`} className="absolute h-px w-full bg-[#1a2540]" style={{ top: `${(index + 1) * 9}%` }} />))}
                  {Array.from({ length: 10 }).map((_, index) => (<div key={`v${index}`} className="absolute h-full w-px bg-[#1a2540]" style={{ left: `${(index + 1) * 9}%` }} />))}
                </div>
                <div className="relative h-full overflow-y-auto">
                  <p className="mb-3 text-xs uppercase tracking-wide text-gray-500">{statusFilter === "all" ? "All generated leads" : `${statusFilter} leads`}</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {leads.length === 0 ? (
                      <p className="col-span-2 py-10 text-center text-xs text-gray-500">No leads to display. Generate some using the form on the left.</p>
                    ) : (
                      leads.map((lead) => (
                        <div key={lead._id} onClick={() => setSelectedId(lead._id)}
                          className={`cursor-pointer rounded-lg border p-2 transition-colors ${selected?._id === lead._id ? "border-blue-500/40 bg-blue-600/10" : "border-[#1e2d40] bg-[#0a1628] hover:bg-[#0d1a2d]"}`}>
                          <div className="flex items-start gap-2">
                            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[lead.status] || "bg-gray-400"}`} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium text-gray-100">{lead.name}</p>
                              <p className="truncate text-[10px] text-gray-500">{lead.address || lead.email}</p>
                            </div>
                            {lead.rating ? (<div className="flex shrink-0 items-center gap-0.5"><Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /><span className="text-[9px] text-gray-400">{lead.rating}</span></div>) : null}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
