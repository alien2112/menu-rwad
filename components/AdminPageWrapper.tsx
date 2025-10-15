"use client";

import { RoleBasedAuth } from "./RoleBasedAuth";

interface AdminPageWrapperProps {
  children: React.ReactNode;
}

export function AdminPageWrapper({ children }: AdminPageWrapperProps) {
  return (
    <RoleBasedAuth>
      {children}
    </RoleBasedAuth>
  );
}

