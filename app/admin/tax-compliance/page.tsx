"use client";

import { RoleBasedAuth } from "@/components/RoleBasedAuth";
import TaxComplianceSettings from "@/components/TaxComplianceSettings";

export default function TaxCompliancePage() {
  return (
    <RoleBasedAuth embedded>
      <TaxComplianceSettings />
    </RoleBasedAuth>
  );
}





