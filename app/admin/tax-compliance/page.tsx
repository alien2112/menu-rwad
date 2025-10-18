"use client";

import { RoleBasedAuth } from "@/components/RoleBasedAuth";
import TaxComplianceSettings from "@/components/TaxComplianceSettings";
import { useState, useEffect } from "react";

export default function TaxCompliancePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <RoleBasedAuth embedded>
        <div className="space-y-6">
          <div className="admin-card rounded-2xl p-6">
            <div className="h-6 w-64 rounded animate-pulse mb-4" />
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded animate-pulse" />
                  <div className="h-10 w-full rounded-lg animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded animate-pulse" />
                  <div className="h-10 w-full rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded animate-pulse" />
                  <div className="h-10 w-full rounded-lg animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 rounded animate-pulse" />
                  <div className="h-10 w-full rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <div className="h-10 w-32 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </RoleBasedAuth>
    );
  }

  return (
    <RoleBasedAuth embedded>
      <TaxComplianceSettings />
    </RoleBasedAuth>
  );
}





