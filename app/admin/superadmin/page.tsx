"use client";

import { redirect } from "next/navigation";

export default function SuperAdminPage() {
  // Redirect to admin management by default
  redirect("/admin/superadmin/admins");
}
