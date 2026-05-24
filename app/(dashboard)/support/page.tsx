/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supportApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials, formatDate, timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Search, Send } from "lucide-react";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const STATUS_BADGE: Record<string, any> = {
  open: "default",
  in_progress: "warning",
  pending_approval: "secondary",
  resolved: "success",
  closed: "secondary",
};

const TYPE_OPTIONS = [
  { value: "technical_issue", label: "Technical issue" },
  { value: "account_access", label: "Account access" },
  { value: "billing", label: "Billing" },
  { value: "data_reports", label: "Data / Reports" },
  { value: "integration", label: "Integration" },
  { value: "other", label: "Other" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function SupportPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const limit = 10;

  const { data: listResponse, isLoading: listLoading } = useQuery({
    queryKey: ["sp-tickets", page, tab],
    queryFn: () =>
      supportApi
        .getAll({ page, limit, status: tab === "all" ? undefined : tab })
        .then((response) => response.data),
  });

  const tickets: any[] = listResponse?.data || [];
  const meta = listResponse?.meta || { total: 0 };
  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / limit));

  const filteredTickets = useMemo(() => {
    if (!search.trim()) return tickets;
    const term = search.toLowerCase();
    return tickets.filter(
      (ticket) =>
        ticket.subject?.toLowerCase().includes(term) ||
        ticket.ticket_id?.toLowerCase().includes(term)
    );
  }, [tickets, search]);

  useEffect(() => {
    if (!selectedId && tickets.length > 0) {
      setSelectedId(tickets[0]._id);
    }
  }, [selectedId, tickets]);

  const { data: detailResponse, isLoading: detailLoading } = useQuery({
    queryKey: ["sp-ticket", selectedId],
    queryFn: () =>
      supportApi.getById(String(selectedId)).then((response) => response.data?.data),
    enabled: Boolean(selectedId),
  });

  const selected: any = detailResponse;

  const replyMutation = useMutation({
    mutationFn: () => supportApi.reply(String(selectedId), { message: replyText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sp-ticket", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["sp-tickets"] });
      setReplyText("");
      toast.success("Reply sent");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to send reply"),
  });

  const closeMutation = useMutation({
    mutationFn: () => supportApi.close(String(selectedId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sp-ticket", selectedId] });
      queryClient.invalidateQueries({ queryKey: ["sp-tickets"] });
      toast.success("Ticket closed");
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to close"),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selected?.replies?.length]);

  const handleReply = () => {
    if (!replyText.trim() || !selectedId) return;
    replyMutation.mutate();
  };

  return (
    <div>
      <Header
        title="Support"
        subtitle="Contact admin support and track your open requests."
        action={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            New Ticket
          </Button>
        }
      />

      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-5 flex w-fit flex-wrap gap-1 rounded-lg bg-[#0d1a2d] p-1">
          {STATUS_TABS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setTab(option.value);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === option.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <Card className={`${mobileView === "list" ? "flex" : "hidden"} flex-col lg:flex lg:col-span-2`}>
            <CardHeader>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {listLoading ? (
                <div className="space-y-2 p-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredTickets.length === 0 ? (
                <p className="p-6 text-center text-xs text-gray-500">
                  You have no support tickets yet.
                </p>
              ) : (
                filteredTickets.map((ticket) => {
                  const lastReply = ticket.replies?.[ticket.replies.length - 1];
                  return (
                    <button
                      key={ticket._id}
                      onClick={() => {
                        setSelectedId(ticket._id);
                        setMobileView("thread");
                      }}
                      className={`flex w-full items-start gap-3 border-b border-[#1e2d40] p-4 text-left transition-colors ${
                        selected?._id === ticket._id
                          ? "border-l-2 border-l-blue-500 bg-blue-600/10"
                          : "hover:bg-[#0d1a2d]"
                      }`}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1e2d40] text-[10px] font-bold text-gray-300">
                        {ticket.ticket_id?.slice(-3) || "T"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between">
                          <p className="truncate text-xs font-medium text-gray-200">
                            {ticket.subject}
                          </p>
                          <Badge
                            variant={STATUS_BADGE[ticket.status] || "default"}
                            className="ml-1 shrink-0 text-[9px]"
                          >
                            {ticket.status?.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-gray-500">
                          {ticket.ticket_id} · {ticket.priority}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {timeAgo(
                            lastReply?.createdAt ||
                              ticket.updatedAt ||
                              ticket.createdAt
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
              <div className="flex items-center justify-between border-t border-[#1e2d40] px-4 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs text-gray-500">
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
            </CardContent>
          </Card>

          <Card className={`${mobileView === "thread" ? "flex" : "hidden"} flex-col lg:flex lg:col-span-3`}>
            {!selectedId ? (
              <CardContent className="flex h-[calc(100vh-260px)] items-center justify-center">
                <p className="text-sm text-gray-500">Select a ticket to view conversation</p>
              </CardContent>
            ) : detailLoading || !selected ? (
              <CardContent className="space-y-3 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-40 w-full" />
              </CardContent>
            ) : (
              <CardContent className="flex h-[calc(100vh-240px)] flex-col p-0">
                <div className="flex items-center justify-between border-b border-[#1e2d40] px-3 py-3 sm:px-4">
                  <div className="flex min-w-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMobileView("list")}
                      className="-ml-1 rounded-lg p-1.5 text-gray-300 hover:bg-[#1e2d40] lg:hidden"
                      aria-label="Back"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-200">
                        {selected.subject}
                      </p>
                      <p className="truncate text-[10px] text-gray-500">
                        {selected.ticket_id} · {selected.priority}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={STATUS_BADGE[selected.status] || "default"}
                      className="text-[10px]"
                    >
                      {selected.status?.replace("_", " ")}
                    </Badge>
                    {selected.status !== "closed" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={() => closeMutation.mutate()}
                        disabled={closeMutation.isPending}
                      >
                        Close
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  <div className="py-2 text-center text-[10px] text-gray-500">
                    Created {formatDate(selected.createdAt)}
                  </div>
                  {(selected.replies || []).length === 0 ? (
                    <p className="text-center text-xs text-gray-500">
                      No messages yet. Send your first message below.
                    </p>
                  ) : (
                    (selected.replies || []).map((reply: any, index: number) => {
                      const sender = reply.sender_id || {};
                      const isAdmin = sender.role === "admin";
                      return (
                        <div
                          key={reply._id || index}
                          className={`flex ${isAdmin ? "items-start gap-2" : "justify-end"}`}
                        >
                          {isAdmin ? (
                            <Avatar className="h-7 w-7 shrink-0">
                              {sender.profileImage?.url ? (
                                <AvatarImage
                                  src={sender.profileImage.url}
                                  alt={sender.name}
                                />
                              ) : (
                                <AvatarFallback className="text-[9px]">
                                  {getInitials(sender.name || "A")}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          ) : null}
                          <div
                            className={`max-w-[80%] rounded-xl px-3 py-2 ${
                              isAdmin
                                ? "bg-[#1e2d40] text-gray-200"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            {isAdmin ? (
                              <p className="mb-0.5 text-[10px] font-medium text-gray-400">
                                {sender.name || "Admin"}
                              </p>
                            ) : null}
                            <p className="whitespace-pre-wrap text-xs">{reply.message}</p>
                            <p
                              className={`mt-1 text-[10px] ${
                                isAdmin ? "text-gray-500" : "text-blue-200"
                              }`}
                            >
                              {timeAgo(reply.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {selected.status !== "closed" ? (
                  <div className="border-t border-[#1e2d40] p-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your reply..."
                        value={replyText}
                        onChange={(event) => setReplyText(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleReply();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={handleReply}
                        disabled={!replyText.trim() || replyMutation.isPending}
                      >
                        <Send className="mr-1 h-3 w-3" />
                        Send
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="border-t border-[#1e2d40] p-3 text-center text-xs text-gray-500">
                    This ticket is closed.
                  </p>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      <CreateTicketDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}

function CreateTicketDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("other");
  const [priority, setPriority] = useState("medium");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) {
      setSubject("");
      setType("other");
      setPriority("medium");
      setDescription("");
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: () =>
      supportApi.create({ subject, type, priority, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sp-tickets"] });
      toast.success("Ticket created");
      onOpenChange(false);
    },
    onError: (error: any) =>
      toast.error(error?.response?.data?.message || "Failed to create ticket"),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!subject.trim()) {
      toast.error("Subject is required");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Support Ticket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ticket-subject">Subject</Label>
            <Input
              id="ticket-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              required
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ticket-desc">Description</Label>
            <textarea
              id="ticket-desc"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="Describe the issue in detail..."
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
              {mutation.isPending ? "Creating..." : "Create ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
