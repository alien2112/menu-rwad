"use client";

import { RoleBasedAuth } from "@/components/RoleBasedAuth";
import StaffManagementPanel from "@/components/StaffManagementPanel";

export default function StaffManagementPage() {
  return (
    <RoleBasedAuth embedded>
      <div className="max-w-7xl mx-auto">
        <StaffManagementPanel onRefresh={() => {}} loading={false} />
      </div>
    </RoleBasedAuth>
  );
}






