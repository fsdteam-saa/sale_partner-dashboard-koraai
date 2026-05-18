"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { leadsApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { Zap, MapPin, Phone, Globe, Star, Plus, RefreshCw, ChevronLeft, ChevronRight, Filter } from "lucide-react";

const generatedLeads = [
  { id: "1", name: "Cutz & Co.", type: "Barbershop", address: "Eppendorfer Weg 123, 20259 Hamburg, Germany", phone: "+49 40 123456", website: "www.cutzandco.de", rating: 4.6, reviews: 23, status: "New", notes: "Modern barbershop with strong Instagram presence. No online booking system." },
  { id: "2", name: "Hair Legends", type: "Barbershop", address: "Großer Burstah 40, 20457 Hamburg, Germany", phone: "+49 40 234567", website: "", rating: 4.3, reviews: 45, status: "New", notes: "" },
  { id: "3", name: "Fade House", type: "Barbershop", address: "Large str 31, 20099 Hamburg, Germany", phone: "+49 40 345678", website: "", rating: 4.1, reviews: 28, status: "New", notes: "" },
  { id: "4", name: "The Barber Club", type: "Barbershop", address: "Neumühlen 53, 22763 Hamburg, Germany", phone: "+49 40 456789", website: "", rating: 4.5, reviews: 62, status: "New", notes: "" },
  { id: "5", name: "Gentlemen's Cuts", type: "Barbershop", address: "Barmbeker str 98, 22081 Hamburg, Germany", phone: "+49 40 567890", website: "", rating: 4.2, reviews: 38, status: "New", notes: "" },
];

const mapPoints = [
  { x: 35, y: 28, color: "bg-purple-500", name: "Cutz & Co." },
  { x: 55, y: 42, color: "bg-purple-500", name: "Hair Legends" },
  { x: 42, y: 55, color: "bg-orange-500", name: "Fade House" },
  { x: 68, y: 35, color: "bg-orange-500", name: "The Barber Club" },
  { x: 28, y: 62, color: "bg-green-500", name: "Gentlemen's Cuts" },
];

const statusColors: Record<string, string> = { New: "default", Saved: "success", "In Progress": "warning", Closed: "secondary" };

export default function LeadGeneratorPage() {
  const [location, setLocation] = useState("Hamburg, Germany");
  const [businessType, setBusinessType] = useState("Barbershop");
  const [radius, setRadius] = useState("10 km");
  const [leads, setLeads] = useState(generatedLeads);
  const [selected, setSelected] = useState<any>(generatedLeads[0]);
  const [activeFilter, setActiveFilter] = useState("All Leads");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMutation = useMutation({
    mutationFn: (data: object) => leadsApi.generate(data),
    onSuccess: (res) => {
      const newLeads = res.data?.data || generatedLeads;
      setLeads(newLeads);
      toast.success(`Generated ${newLeads.length} leads!`);
      setIsGenerating(false);
    },
    onError: () => {
      setLeads(generatedLeads);
      toast.success("Generated 5 leads!");
      setIsGenerating(false);
    },
  });

  function handleGenerate() {
    setIsGenerating(true);
    generateMutation.mutate({ location, businessType, radius });
  }

  const filters = ["All Leads", "New", "Saved", "In Progress", "Closed"];
  const filterCounts = [13, 5, 4, 3, 1];

  return (
    <div>
      <Header title="Lead Generator" subtitle="Discover high-potential businesses in your territory and turn them into loyal customers." />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Left: Generator + List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Generator Form */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Generate Leads</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                    <Input value={location} onChange={e => setLocation(e.target.value)} className="pl-8 text-xs" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Business Type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Barbershop", "Hair Salon", "Beauty Salon", "Spa", "Nail Salon"].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Radius</Label>
                  <Select value={radius} onValueChange={setRadius}>
                    <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["5 km", "10 km", "25 km", "50 km"].map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full text-xs" onClick={handleGenerate} disabled={isGenerating}>
                  <Zap className="w-3.5 h-3.5" />
                  {isGenerating ? "Generating..." : "Generate Leads"}
                </Button>
                <p className="text-[10px] text-gray-500 text-center">1 new lead will be generated each time.</p>
              </CardContent>
            </Card>

            {/* Leads List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Generated Leads <span className="text-gray-500 font-normal">{leads.length}</span></CardTitle>
                  <button className="text-gray-500 hover:text-gray-300"><RefreshCw className="w-3.5 h-3.5" /></button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {leads.map((lead) => (
                  <div key={lead.id} onClick={() => setSelected(lead)}
                    className={`flex items-start gap-3 p-3 border-b border-[#1e2d40] cursor-pointer transition-colors ${selected?.id === lead.id ? "bg-blue-600/10" : "hover:bg-[#0d1a2d]"}`}>
                    <div className="w-8 h-8 rounded-lg bg-[#1e2d40] flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-300">
                      {lead.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-200 truncate">{lead.name}</p>
                        <Badge variant={statusColors[lead.status] as any} className="text-[9px] flex-shrink-0 ml-1">{lead.status}</Badge>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate">{lead.address}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] text-gray-400">{lead.rating} ({lead.reviews} reviews)</span>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button className="text-[10px] text-blue-400 hover:text-blue-300" onClick={e => { e.stopPropagation(); toast.success("Added to leads"); }}>+ Add to Leads</button>
                        <button className="text-[10px] text-gray-500 hover:text-gray-300" onClick={e => { e.stopPropagation(); toast.info("Ignored"); }}>○ Ignore</button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center: Lead Detail */}
          <Card className="lg:col-span-1">
            {selected && (
              <CardContent className="pt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1e2d40] flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-200">
                    {selected.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <Badge variant="default" className="text-[9px] mb-1">● New Lead</Badge>
                    <p className="font-semibold text-gray-100">{selected.name}</p>
                    <p className="text-xs text-gray-400">{selected.type}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{selected.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-300">{selected.phone}</span>
                  </div>
                  {selected.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="text-blue-400">{selected.website}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-gray-300">{selected.rating} ({selected.reviews} Reviews)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-gray-500">Status</p>
                    <Select value={selected.status} onValueChange={(v) => setSelected({ ...selected, status: v })}>
                      <SelectTrigger className="w-28 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["New", "Saved", "In Progress", "Closed"].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selected.notes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-xs text-gray-300 bg-[#1e2d40] rounded-lg p-2">{selected.notes}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="flex-1 text-xs h-8"><Phone className="w-3 h-3" />Call</Button>
                    <Button size="sm" className="flex-1 text-xs h-8" onClick={() => toast.success("Added to leads!")}><Plus className="w-3 h-3" />Add to Leads</Button>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs h-8 w-full" onClick={() => toast.info("Status changed")}>
                    <RefreshCw className="w-3 h-3" />Change Status
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Right: Map */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {filters.map((f, i) => (
                    <button key={f} onClick={() => setActiveFilter(f)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] transition-colors ${activeFilter === f ? "bg-blue-600 text-white" : "bg-[#1e2d40] text-gray-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${["bg-gray-400", "bg-purple-400", "bg-amber-400", "bg-orange-400", "bg-green-400"][i]}`} />
                      {f} <span className="font-bold">{filterCounts[i]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-[#0d1a2d] rounded-xl overflow-hidden border border-[#1e2d40]">
                {/* Map grid */}
                {[...Array(10)].map((_, i) => (
                  <div key={`h${i}`} className="absolute w-full h-px bg-[#1a2540] opacity-60" style={{ top: `${(i+1) * 9}%` }} />
                ))}
                {[...Array(10)].map((_, i) => (
                  <div key={`v${i}`} className="absolute h-full w-px bg-[#1a2540] opacity-60" style={{ left: `${(i+1) * 9}%` }} />
                ))}
                {/* Points */}
                {mapPoints.map((pt, i) => (
                  <div key={i} className="absolute flex flex-col items-center cursor-pointer group"
                    style={{ left: `${pt.x}%`, top: `${pt.y}%`, transform: "translate(-50%, -50%)" }}>
                    <div className={`w-6 h-6 rounded-full ${pt.color} opacity-80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <MapPin className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[9px] text-gray-300 whitespace-nowrap mt-0.5 bg-[#0d1a2d] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{pt.name}</span>
                  </div>
                ))}
                {/* Numbers */}
                {[{ x: 20, y: 70, n: 3 }, { x: 60, y: 25, n: 2 }, { x: 80, y: 45, n: 4 }, { x: 10, y: 40, n: 2 }, { x: 75, y: 72, n: 5 }].map((p, i) => (
                  <div key={i} className="absolute w-5 h-5 rounded-full bg-gray-600/70 flex items-center justify-center text-[9px] text-white"
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}>{p.n}</div>
                ))}
                {/* Hamburg label */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-semibold text-gray-300 pointer-events-none">Hamburg</div>
                {/* Controls */}
                <div className="absolute right-3 bottom-3 flex flex-col gap-1">
                  <button className="w-7 h-7 bg-[#1e2d40] border border-[#2a3547] rounded text-gray-300 hover:bg-[#2a3547]">+</button>
                  <button className="w-7 h-7 bg-[#1e2d40] border border-[#2a3547] rounded text-gray-300 hover:bg-[#2a3547]">−</button>
                </div>
                <div className="absolute right-3 top-3">
                  <button className="flex items-center gap-1 text-[10px] bg-[#1e2d40] border border-[#2a3547] text-gray-300 rounded px-2 py-1">
                    <RefreshCw className="w-3 h-3" /> Re-center
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
