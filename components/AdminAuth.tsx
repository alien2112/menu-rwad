"use client";

import React from 'react';
import { RoleBasedAuth } from '@/components/RoleBasedAuth';

interface AdminAuthProps {
  children: React.ReactNode;
}

// Legacy AdminAuth now delegates to RoleBasedAuth without any password
export function AdminAuth({ children }: AdminAuthProps) {
  return (
    <RoleBasedAuth embedded>
      {children}
    </RoleBasedAuth>
  );
}
















