"use client";

import { AdminAuth } from "@/components/AdminAuth";
import { AdminReviewsPanel } from "@/components/AdminReviewsPanel";

export default function AdminPage() {
  return (
    <AdminAuth>
      <AdminReviewsPanel />
    </AdminAuth>
  );
}