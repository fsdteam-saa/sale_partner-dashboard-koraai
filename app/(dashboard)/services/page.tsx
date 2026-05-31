/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { servicesApi } from "@/lib/api";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";

export default function ServicesPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["services", search],
    queryFn: () =>
      servicesApi
        .getAll({ limit: 100, search: search || undefined })
        .then((response) => response.data),
  });

  const services = (data?.data || []) as any[];

  return (
    <div>
      <Header
        title="Services"
        subtitle="Browse services offered by partnered shops."
      />

      <div className="space-y-4 p-3 sm:p-4 lg:p-6">
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search services..."
                className="pl-9"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-[#1e2d40] text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Owner</th>
                    <th className="py-2 pr-4">Duration</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index} className="border-b border-[#1e2d40]">
                        <td className="py-2 pr-4">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="py-2 pr-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="py-2 pr-4">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="py-2 pr-4">
                          <Skeleton className="h-4 w-16" />
                        </td>
                        <td className="py-2 pr-4">
                          <Skeleton className="h-4 w-16" />
                        </td>
                      </tr>
                    ))
                  ) : services.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-xs text-gray-500">
                        No services found.
                      </td>
                    </tr>
                  ) : (
                    services.map((service) => (
                      <tr key={service._id} className="border-b border-[#1e2d40] last:border-0">
                        <td className="py-3 pr-4">
                          <div>
                            <p className="text-sm font-medium text-gray-100">{service.name}</p>
                            {service.description ? (
                              <p className="text-[11px] text-gray-500">{service.description}</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-300">
                          {service.owner_id?.name || "—"}
                        </td>
                        <td className="py-3 pr-4 text-gray-300">{service.duration} min</td>
                        <td className="py-3 pr-4 text-gray-300">
                          ${Number(service.price || 0).toFixed(2)}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={service.isActive ? "success" : "secondary"} className="text-[10px]">
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
