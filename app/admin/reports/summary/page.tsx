"use client";

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SummaryReport {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topSellingItems: { name: string; quantity: number }[];
  salesByHour: { hour: string; orders: number }[];
}

export default function SummaryReportPage() {
  const [report, setReport] = useState<SummaryReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch('/api/admin/reports/sales?type=summary');
        const data = await res.json();
        if (res.ok) {
          setReport(data.data);
        } else {
          setError(data.error || 'Failed to fetch report');
        }
      } catch (err) {
        setError('An error occurred while fetching the report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 rounded animate-pulse" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="admin-card p-6 rounded-lg">
              <div className="h-6 w-32 rounded animate-pulse mb-2" />
              <div className="h-8 w-24 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="admin-card p-6 rounded-lg">
            <div className="h-6 w-48 rounded animate-pulse mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center admin-card p-3 rounded-md">
                  <div className="h-4 w-32 rounded animate-pulse" />
                  <div className="h-4 w-16 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card p-6 rounded-lg">
            <div className="h-6 w-40 rounded animate-pulse mb-4" />
            <div className="h-72 w-full rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8" style={{ color: '#dc2626' }}>Error: {error}</div>;
  }

  if (!report) {
    return <div className="p-8">No report data available.</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Sales Summary Report</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="admin-card p-6 rounded-lg">
          <h2 className="text-lg font-semibold">Total Revenue</h2>
          <p className="text-3xl font-bold">{report.totalRevenue.toFixed(2)} SAR</p>
        </div>
        <div className="admin-card p-6 rounded-lg">
          <h2 className="text-lg font-semibold">Total Orders</h2>
          <p className="text-3xl font-bold">{report.totalOrders}</p>
        </div>
        <div className="admin-card p-6 rounded-lg">
          <h2 className="text-lg font-semibold">Average Order Value</h2>
          <p className="text-3xl font-bold">{report.averageOrderValue.toFixed(2)} SAR</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="admin-card p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Top Selling Items</h2>
          <ul className="space-y-2">
            {report.topSellingItems.map((item, index) => (
              <li key={index} className="flex justify-between items-center admin-card p-3 rounded-md">
                <span className="font-medium">{item.name}</span>
                <span className="font-bold">{item.quantity} sold</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="admin-card p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Sales by Hour</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report.salesByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="var(--highlight)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
