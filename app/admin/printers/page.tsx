"use client";

import { RoleBasedAuth } from "@/components/RoleBasedAuth";
import PrinterManagementPanel from "@/components/PrinterManagementPanel";

export default function PrintersPage() {
  return (
    <RoleBasedAuth>
      <PrinterManagementPanel />
    </RoleBasedAuth>
  );
}





