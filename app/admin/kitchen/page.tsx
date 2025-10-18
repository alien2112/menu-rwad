"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import { Badge } from "@/components/admin/Badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/Select";
import { Clock, ChefHat, CheckCircle, AlertCircle } from "lucide-react";
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

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchKitchenOrders();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchKitchenOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchKitchenOrders = async () => {
    try {
      const response = await fetch('/api/orders?department=kitchen');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
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
          department: 'kitchen',
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
                item.menuItemId === itemId && item.department === 'kitchen'
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
        return <Badge className="status-pending">Pending</Badge>;
      case 'in_progress':
        return <Badge className="status-in-progress">In Progress</Badge>;
      case 'ready':
        return <Badge className="status-ready">Ready</Badge>;
      case 'served':
        return <Badge className="status-served">Served</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />;
      case 'in_progress':
        return <ChefHat className="w-4 h-4" style={{ color: 'var(--highlight)' }} />;
      case 'ready':
        return <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />;
      case 'served':
        return <CheckCircle className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />;
      default:
        return <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />;
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

  const kitchenItems = orders.flatMap(order => 
    order.items.filter(item => item.department === 'kitchen')
  );

  const filteredOrders = orders.filter(order => {
    if (statusFilter === 'all') return true;
    const kitchenItems = order.items.filter(item => item.department === 'kitchen');
    return kitchenItems.some(item => item.departmentStatus === statusFilter);
  });

  const pendingCount = kitchenItems.filter(item => item.departmentStatus === 'pending').length;
  const inProgressCount = kitchenItems.filter(item => item.departmentStatus === 'in_progress').length;
  const readyCount = kitchenItems.filter(item => item.departmentStatus === 'ready').length;

  if (loading) {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-8 w-48 rounded animate-pulse" />
          <div className="h-4 w-32 rounded animate-pulse" />
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="admin-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 rounded animate-pulse" />
                <div className="h-8 w-8 rounded-lg animate-pulse" />
              </div>
              <div className="h-8 w-16 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-3 items-center justify-center flex-wrap">
          <div className="h-10 w-40 rounded-lg animate-pulse" />
        </div>

        {/* Orders */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="admin-card rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <div className="h-6 w-32 rounded animate-pulse" />
                  <div className="h-4 w-80 rounded animate-pulse" />
                </div>
                <div className="h-6 w-20 rounded-full animate-pulse" />
              </div>
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded animate-pulse" />
                      <div className="space-y-1">
                        <div className="h-4 w-32 rounded animate-pulse" />
                        <div className="h-3 w-24 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-16 rounded-full animate-pulse" />
                      <div className="h-8 w-24 rounded-lg animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <RoleBasedAuth embedded>
      <div className="p-6 sm:p-8 lg:p-10 space-y-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-2">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ChefHat className="w-8 h-8" />
            Kitchen Dashboard
          </h1>
          <div className="text-sm">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <ChefHat className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Serve</CardTitle>
            <CheckCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readyCount}</div>
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
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="served">Served</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const kitchenItems = order.items.filter(item => item.department === 'kitchen');
          if (kitchenItems.length === 0) return null;

          return (
            <Card key={order._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order {order.orderNumber}</CardTitle>
                    <div className="text-sm mt-1">
                      Customer: {order.customerInfo.name || 'Unknown'} | 
                      Phone: {order.customerInfo.phone || 'N/A'} |
                      Time: {new Date(order.orderDate).toLocaleTimeString()}
                    </div>
                    {order.notes && (
                      <div className="text-sm mt-1">
                        Notes: {order.notes}
                      </div>
                    )}
                  </div>
                  <Badge>
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {kitchenItems.map((item, index) => (
                    <div key={item ? item.menuItemId : index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.departmentStatus)}
                        <div>
                          <div className="font-medium">{item.menuItemName}</div>
                          {item.menuItemNameEn && (
                            <div className="text-sm">{item.menuItemNameEn}</div>
                          )}
                          <div className="text-sm">
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
                            {item.departmentStatus === 'pending' && 'Start Cooking'}
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
            <ChefHat className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium">No kitchen orders found</h3>
            <p>Orders will appear here when customers place food items</p>
          </CardContent>
        </Card>
      )}
      </div>
    </RoleBasedAuth>
  );
}
