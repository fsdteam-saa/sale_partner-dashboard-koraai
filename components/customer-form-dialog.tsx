/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { customersApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, X } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "at_risk", label: "At Risk" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: any | null;
  onSaved?: (customer: any) => void;
};

export function CustomerFormDialog({ open, onOpenChange, customer, onSaved }: Props) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(customer?._id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(customer?.name || "");
    setEmail(customer?.email || "");
    setPhone(customer?.phone || "");
    setPassword("");
    setShowPassword(false);
    setStatus(customer?.status || "active");
    setNotes(customer?.notes || "");
    setTags(customer?.tags || []);
    setTagInput("");
  }, [open, customer]);

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) {
      setTagInput("");
      return;
    }
    setTags([...tags, value]);
    setTagInput("");
  };

  const removeTag = (value: string) => setTags(tags.filter((tag) => tag !== value));

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEdit) {
        const response = await customersApi.update(customer._id, { name, email, phone, status, notes, tags });
        return response.data?.data;
      }
      const response = await customersApi.create({ name, email, phone, password, status, notes, tags });
      return response.data?.data;
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["sp-customers"] });
      queryClient.invalidateQueries({ queryKey: ["sp-customer-stats"] });
      toast.success(isEdit ? "Customer updated" : "Business owner registered & account created");
      onOpenChange(false);
      onSaved?.(saved);
    },
    onError: (error: any) =>
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          (isEdit ? "Failed to update customer" : "Failed to create customer")
      ),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Name, email, and phone are required");
      return;
    }
    if (!isEdit && password.trim().length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="customer-name">Name</Label>
            <Input
              id="customer-name"
              autoComplete="off"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              required
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customer-email">Email</Label>
              <Input
                id="customer-email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customer-phone">Phone</Label>
              <Input
                id="customer-phone"
                type="tel"
                autoComplete="off"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1 234 567 8900"
                required
              />
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="customer-password">Password</Label>
              <div className="relative">
                <Input
                  id="customer-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Min. 6 characters"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Type a tag and press Enter"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-blue-600/20 px-2 py-0.5 text-[11px] text-blue-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-300 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customer-notes">Notes</Label>
            <textarea
              id="customer-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={1000}
              rows={3}
              className="w-full rounded-lg border border-[#2a3547] bg-[#0d1526] px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-[#1e2d40] pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : isEdit ? "Save changes" : "Create customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
