/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { leadsApi, territoriesApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SOURCE_OPTIONS = [
  { value: "manual", label: "Manual" },
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "ad_campaign", label: "Ad campaign" },
  { value: "partner", label: "Partner" },
  { value: "lead_generator", label: "Lead generator" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: any | null;
};

export function LeadFormDialog({ open, onOpenChange, lead }: Props) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(lead?._id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [source, setSource] = useState("manual");
  const [status, setStatus] = useState("new");
  const [territoryId, setTerritoryId] = useState("");
  const [estimatedValue, setEstimatedValue] = useState<number | "">("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [notes, setNotes] = useState("");

  const { data: territoriesResponse } = useQuery({
    queryKey: ["sp-lead-form-territories"],
    queryFn: () => territoriesApi.getAll({ limit: 100 }).then((response) => response.data),
    enabled: open,
  });
  const territories: any[] = territoriesResponse?.data || [];

  useEffect(() => {
    if (!open) return;
    setName(lead?.name || "");
    setEmail(lead?.email || "");
    setPhone(lead?.phone || "");
    setCompany(lead?.company || "");
    setSource(lead?.source || "manual");
    setStatus(lead?.status || "new");
    setTerritoryId(lead?.territory_id?._id || lead?.territory_id || "");
    setEstimatedValue(lead?.estimatedValue ?? "");
    setWebsite(lead?.website || "");
    setAddress(lead?.address || "");
    setBusinessType(lead?.businessType || "");
    setNotes(lead?.notes || "");
  }, [open, lead]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name,
        email,
        phone,
        company,
        source,
        territory_id: territoryId || null,
        estimatedValue: estimatedValue === "" ? 0 : Number(estimatedValue),
        website,
        address,
        businessType,
        notes,
      };
      if (isEdit) {
        payload.status = status;
        const response = await leadsApi.update(lead._id, payload);
        return response.data?.data;
      }
      const response = await leadsApi.create(payload);
      return response.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale-partner-leads"] });
      queryClient.invalidateQueries({ queryKey: ["sp-lead-analytics"] });
      toast.success(isEdit ? "Lead updated" : "Lead created");
      onOpenChange(false);
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          (isEdit ? "Failed to update lead" : "Failed to create lead")
      ),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Lead" : "Add Lead"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lead-name">Name</Label>
              <Input id="lead-name" value={name} onChange={(event) => setName(event.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-email">Email</Label>
              <Input id="lead-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lead-phone">Phone</Label>
              <Input id="lead-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-company">Company</Label>
              <Input id="lead-company" value={company} onChange={(event) => setCompany(event.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isEdit ? (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label>Territory</Label>
              <Select value={territoryId || "none"} onValueChange={(value) => setTerritoryId(value === "none" ? "" : value)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {territories.map((territory: any) => (
                    <SelectItem key={territory._id} value={territory._id}>{territory.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lead-value">Estimated value</Label>
              <Input id="lead-value" type="number" min={0} value={estimatedValue} onChange={(event) => setEstimatedValue(event.target.value === "" ? "" : Number(event.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-bt">Business type</Label>
              <Input id="lead-bt" value={businessType} onChange={(event) => setBusinessType(event.target.value)} />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="lead-website">Website</Label>
              <Input id="lead-website" value={website} onChange={(event) => setWebsite(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-address">Address</Label>
              <Input id="lead-address" value={address} onChange={(event) => setAddress(event.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-notes">Notes</Label>
            <textarea id="lead-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="w-full rounded-lg border border-[#2a3547] bg-[#0d1526] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-2 border-t border-[#1e2d40] pt-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : isEdit ? "Save changes" : "Create lead"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
