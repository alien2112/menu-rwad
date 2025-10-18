"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { RoleBasedAuth } from "../../../components/RoleBasedAuth";
import ComprehensiveAnalyticsDashboard from "../../../components/ComprehensiveAnalyticsDashboard";
import WasteLoggingPanel from "../../../components/WasteLoggingPanel";

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'waste'>('analytics');
  const [currentUser, setCurrentUser] = useState<string>('admin');

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