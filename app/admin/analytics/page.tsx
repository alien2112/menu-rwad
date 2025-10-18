"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { RoleBasedAuth } from "../../../components/RoleBasedAuth";
import ComprehensiveAnalyticsDashboard from "../../../components/ComprehensiveAnalyticsDashboard";
import WasteLoggingPanel from "../../../components/WasteLoggingPanel";
import { Skeleton } from "@/components/SkeletonLoader";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'waste'>('analytics');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for analytics data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <RoleBasedAuth embedded>
        <div className="space-y-6">
          {/* Tab Navigation Skeleton */}
          <div className="flex gap-2 justify-center">
            <Skeleton className="h-10 w-48 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>

          {/* Content Skeleton */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="admin-card rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
            
            <div className="admin-card rounded-xl p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="admin-card rounded-xl p-6">
                  <Skeleton className="h-6 w-40 mb-4" />
                  <Skeleton className="h-48 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </RoleBasedAuth>
    );
  }

  return (
    <RoleBasedAuth embedded>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`admin-button ${activeTab === 'analytics' ? 'active' : ''}`}>
            التحليلات الشاملة
          </button>
          <button
            onClick={() => setActiveTab('waste')}
            className={`admin-button ${activeTab === 'waste' ? 'active' : ''}`}>
            تسجيل الهدر
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'analytics' && <ComprehensiveAnalyticsDashboard />}
        {activeTab === 'waste' && <WasteLoggingPanel currentUser={currentUser} />}
      </div>
    </RoleBasedAuth>
  );
}