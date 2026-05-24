/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { leadsApi, supportApi, inboxApi, activityApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, timeAgo } from "@/lib/utils";
import {
  Calendar,
  HeadphonesIcon,
  Mail,
  MessageCircle,
  Plus,
  Target,
  TrendingUp,
  UserPlus,
  Zap,
} from "lucide-react";

const QUICK_ACTIONS = [
  {
    group: "Customers",
    items: [
      {
        icon: UserPlus,
        color: "bg-blue-600",
        title: "Add New Customer",
        desc: "Create a customer profile and start onboarding",
        href: "/customers",
      },
      {
        icon: Calendar,
        color: "bg-purple-600",
        title: "Create Appointment",
        desc: "Book a slot on your calendar",
        href: "/calendar",
      },
      {
        icon: MessageCircle,
        color: "bg-green-600",
        title: "Send Message",
        desc: "Reach out to a customer in your inbox",
        href: "/inbox",
      },
    ],
  },
  {
    group: "Sales",
    items: [
      {
        icon: Target,
        color: "bg-amber-600",
        title: "Add a Lead",
        desc: "Capture a new prospect",
        href: "/leads",
      },
      {
        icon: Zap,
        color: "bg-pink-600",
        title: "Generate Leads",
        desc: "Discover prospects using AI",
        href: "/lead-generator",
      },
      {
        icon: TrendingUp,
        color: "bg-emerald-600",
        title: "View Earnings",
        desc: "Track your commission and payouts",
        href: "/earnings",
      },
    ],
  },
  {
    group: "Support",
    items: [
      {
        icon: HeadphonesIcon,
        color: "bg-red-600",
        title: "Open Support Ticket",
        desc: "Contact admin if you need help",
        href: "/support",
      },
      {
        icon: Mail,
        color: "bg-blue-600",
        title: "Inbox",
        desc: "Check unread conversations",
        href: "/inbox",
      },
    ],
  },
];

export default function ActionsPage() {
  const router = useRouter();

  const { data: leadsResponse } = useQuery({
    queryKey: ["actions-leads"],
    queryFn: () =>
      leadsApi.getAll({ limit: 5, status: "new" }).then((response) => response.data),
  });

  const { data: ticketsResponse } = useQuery({
    queryKey: ["actions-tickets"],
    queryFn: () =>
      supportApi.getAll({ limit: 5 }).then((response) => response.data),
  });

  const { data: inboxResponse } = useQuery({
    queryKey: ["actions-inbox"],
    queryFn: () => inboxApi.getChats({ limit: 5 }).then((response) => response.data),
  });

  const { data: activityResponse, isLoading: activityLoading } = useQuery({
    queryKey: ["actions-activity"],
    queryFn: () => activityApi.getAll({ limit: 6 }).then((response) => response.data),
  });

  const newLeads: any[] = leadsResponse?.data || [];
  const openTickets: any[] = (ticketsResponse?.data || []).filter(
    (ticket: any) => ticket.status !== "closed" && ticket.status !== "resolved"
  );
  const chats: any[] = inboxResponse?.data || [];
  const activities: any[] = activityResponse?.data || [];

  const stats = useMemo(
    () => [
      { label: "New leads", value: newLeads.length, color: "text-blue-400" },
      {
        label: "Open tickets",
        value: openTickets.length,
        color: "text-amber-400",
      },
      { label: "Inbox chats", value: chats.length, color: "text-purple-400" },
    ],
    [newLeads, openTickets, chats]
  );

  return (
    <div>
      <Header
        title="Actions"
        subtitle="Quick-launch the things you do most and stay on top of open items."
      />
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
          <div className="space-y-5 lg:col-span-3">
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="pt-4">
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[11px] text-gray-400">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {QUICK_ACTIONS.map((group) => (
              <div key={group.group}>
                <h3 className="mb-3 text-sm font-semibold text-gray-200">{group.group}</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Card
                        key={item.title}
                        onClick={() => router.push(item.href)}
                        className="group cursor-pointer transition-colors hover:border-blue-600/40"
                      >
                        <CardContent className="p-3">
                          <div className="mb-2 flex items-start justify-between">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.color}`}
                            >
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <p className="mb-1 text-xs font-medium text-gray-200">
                            {item.title}
                          </p>
                          <p className="text-[10px] leading-relaxed text-gray-500">
                            {item.desc}
                          </p>
                          <p className="mt-2 text-[10px] text-blue-400 opacity-0 transition-opacity group-hover:opacity-100">
                            Open →
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">New Leads</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {newLeads.length === 0 ? (
                  <p className="text-xs text-gray-500">No new leads.</p>
                ) : (
                  newLeads.map((lead) => (
                    <button
                      key={lead._id}
                      onClick={() => router.push("/leads")}
                      className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left hover:bg-[#1e2d40]"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-[9px]">
                          {getInitials(lead.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-gray-200">{lead.name}</p>
                        <p className="truncate text-[10px] text-gray-500">
                          {lead.company || lead.email}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Open Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {openTickets.length === 0 ? (
                  <p className="text-xs text-gray-500">No open tickets.</p>
                ) : (
                  openTickets.map((ticket: any) => (
                    <button
                      key={ticket._id}
                      onClick={() => router.push("/support")}
                      className="flex w-full items-start gap-2 rounded-lg p-1.5 text-left hover:bg-[#1e2d40]"
                    >
                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#1e2d40]">
                        <HeadphonesIcon className="h-3 w-3 text-amber-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-gray-200">{ticket.subject}</p>
                        <p className="text-[10px] text-gray-500">
                          {ticket.ticket_id} · {ticket.status}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {activityLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : activities.length === 0 ? (
                  <p className="text-xs text-gray-500">No recent activity.</p>
                ) : (
                  activities.map((activity: any) => (
                    <div key={activity._id} className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        {activity.user_id?.profileImage?.url ? (
                          <AvatarImage
                            src={activity.user_id.profileImage.url}
                            alt={activity.user_id?.name}
                          />
                        ) : (
                          <AvatarFallback className="text-[9px]">
                            {getInitials(activity.user_id?.name || "S")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-gray-200">{activity.action}</p>
                        <p className="text-[10px] text-gray-500">
                          {timeAgo(activity.timestamp || activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
