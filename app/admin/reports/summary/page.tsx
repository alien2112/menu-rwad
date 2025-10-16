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
    return <div className="p-8">Loading report...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  if (!report) {
    return <div className="p-8">No report data available.</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Sales Summary Report</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-600">Total Revenue</h2>
          <p className="text-3xl font-bold text-green-600">{report.totalRevenue.toFixed(2)} SAR</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-600">Total Orders</h2>
          <p className="text-3xl font-bold text-blue-600">{report.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-600">Average Order Value</h2>
          <p className="text-3xl font-bold text-purple-600">{report.averageOrderValue.toFixed(2)} SAR</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Top Selling Items</h2>
          <ul className="space-y-2">
            {report.topSellingItems.map((item, index) => (
              <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="font-bold text-gray-900">{item.quantity} sold</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Sales by Hour</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report.salesByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
