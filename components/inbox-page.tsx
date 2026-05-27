/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { InboxWorkspace } from "@/components/inbox-workspace";

export default function InboxPage() {
  return (
    <InboxWorkspace
      dashboardKey="sale_partner"
      subtitle="Stay connected with admins and business owners in real time."
      recipientSearchPlaceholder="Search admin or business owner..."
      emptyConversationText="No conversations yet. Click + to start one with an admin or business owner."
      taskHref="/actions"
    />
  );
}
