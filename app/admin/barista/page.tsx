export const dynamic = 'force-dynamic';
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Coffee, CheckCircle, AlertCircle } from "lucide-react";
import { RoleBasedAuth } from "@/components/RoleBasedAuth";

interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  menuItemNameEn?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  department: 'kitchen' | 'barista' | 'shisha';
  departmentStatus: 'pending' | 'in_progress' | 'ready' | 'served';
  estimatedPrepTime?: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  customerInfo: {
    name?: string;
    phone?: string;
    address?: string;
  };
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  departmentStatuses: {
    kitchen: 'pending' | 'in_progress' | 'ready' | 'served';
    barista: 'pending' | 'in_progress' | 'ready' | 'served';
    shisha: 'pending' | 'in_progress' | 'ready' | 'served';
  };
  orderDate: string;
  notes?: string;
}

export default function BaristaDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchBaristaOrders();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchBaristaOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchBaristaOrders = async () => {
    try {
      const response = await fetch('/api/orders?department=barista');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching barista orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = async (orderId: string, itemId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/department-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department: 'barista',
          status: newStatus,
          itemId: itemId
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Update local state
        setOrders(orders.map(order => {
          if (order._id === orderId) {
            return {
              ...order,
              items: order.items.map(item => 
                item.menuItemId === itemId && item.department === 'barista'
                  ? { ...item, departmentStatus: newStatus as any }
                  : item
              )
            };
          }
          return order;
        }));
      }
    } catch (error) {
      console.error('Error updating item status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="default">Preparing</Badge>;
      case 'ready':
        return <Badge variant="default" className="bg-green-500">Ready</Badge>;
      case 'served':
        return <Badge variant="outline">Served</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <Coffee className="w-4 h-4" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'served':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'in_progress';
      case 'in_progress':
        return 'ready';
      case 'ready':
        return 'served';
      default:
        return currentStatus;
    }
  };

  const baristaItems = orders.flatMap(order => 
    order.items.filter(item => item.department === 'barista')
  );

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    const baristaItems = order.items.filter(item => item.department === 'barista');
    return baristaItems.some(item => item.departmentStatus === statusFilter);
  });

  const pendingCount = baristaItems.filter(item => item.departmentStatus === 'pending').length;
  const inProgressCount = baristaItems.filter(item => item.departmentStatus === 'in_progress').length;
  const readyCount = baristaItems.filter(item => item.departmentStatus === 'ready').length;

  if (loading) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <RoleBasedAuth>
      <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col items-center text-center gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Coffee className="w-8 h-8" />
          Barista Dashboard
        </h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Drinks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preparing</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Serve</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readyCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-3 items-center justify-center flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="served">Served</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const baristaItems = order.items.filter(item => item.department === 'barista');
          if (baristaItems.length === 0) return null;

          return (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order {order.orderNumber}</CardTitle>
                    <div className="text-sm text-gray-500 mt-1">
                      Customer: {order.customerInfo.name || 'Unknown'} | 
                      Phone: {order.customerInfo.phone || 'N/A'} |
                      Time: {new Date(order.orderDate).toLocaleTimeString()}
                    </div>
                    {order.notes && (
                      <div className="text-sm text-blue-600 mt-1">
                        Notes: {order.notes}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline">
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {baristaItems.map((item) => (
                    <div key={item.menuItemId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.departmentStatus)}
                        <div>
                          <div className="font-medium">{item.menuItemName}</div>
                          {item.menuItemNameEn && (
                            <div className="text-sm text-gray-500">{item.menuItemNameEn}</div>
                          )}
                          <div className="text-sm text-gray-500">
                            Quantity: {item.quantity} | 
                            Price: {item.totalPrice} ريال
                            {item.estimatedPrepTime && (
                              <span> | Est. Time: {item.estimatedPrepTime}min</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.departmentStatus)}
                        {item.departmentStatus !== 'served' && (
                          <Button
                            size="sm"
                            onClick={() => updateItemStatus(order._id, item.menuItemId, getNextStatus(item.departmentStatus))}
                          >
                            {item.departmentStatus === 'pending' && 'Start Preparing'}
                            {item.departmentStatus === 'in_progress' && 'Mark Ready'}
                            {item.departmentStatus === 'ready' && 'Mark Served'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Coffee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">No drink orders found</h3>
            <p className="text-gray-400">Orders will appear here when customers place beverage items</p>
          </CardContent>
        </Card>
      )}
      </div>
    </RoleBasedAuth>
  );
}

