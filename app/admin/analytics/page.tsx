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
    <RoleBasedAuth>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'analytics'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            التحليلات الشاملة
          </button>
          <button
            onClick={() => setActiveTab('waste')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'waste'
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
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