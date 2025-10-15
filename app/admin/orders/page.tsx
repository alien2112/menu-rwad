"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChefHat, Coffee, Wind, Clock, CheckCircle, AlertCircle, Package, Printer } from "lucide-react";

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
  source: 'website_whatsapp' | 'manual' | 'website';
  notes?: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintOrder = async (orderId: string, department: string) => {
    try {
      const response = await fetch('/api/print-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          department: department === 'all' ? undefined : department,
          createdBy: 'admin'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('تم إرسال الطلب للطباعة بنجاح');
      } else {
        alert('فشل في إرسال الطلب للطباعة: ' + data.error);
      }
    } catch (error) {
      console.error('Error printing order:', error);
      alert('خطأ في إرسال الطلب للطباعة');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="default">Confirmed</Badge>;
      case 'preparing':
        return <Badge variant="default" className="bg-blue-500">Preparing</Badge>;
      case 'ready':
        return <Badge variant="default" className="bg-green-500">Ready</Badge>;
      case 'delivered':
        return <Badge variant="outline">Delivered</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDepartmentBadge = (department: string) => {
    switch (department) {
      case 'kitchen':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800"><ChefHat className="w-3 h-3 mr-1" />Kitchen</Badge>;
      case 'barista':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><Coffee className="w-3 h-3 mr-1" />Barista</Badge>;
      case 'shisha':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800"><Wind className="w-3 h-3 mr-1" />Shisha</Badge>;
      default:
        return <Badge variant="outline">{department}</Badge>;
    }
  };

  const getDepartmentStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'in_progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'served':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || 
      order.items.some(item => item.department === departmentFilter);
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo.phone?.includes(searchTerm);
    
    return matchesStatus && matchesDepartment && matchesSearch;
  });

  // Calculate statistics
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const preparingOrders = orders.filter(o => o.status === 'preparing').length;
  const readyOrders = orders.filter(o => o.status === 'ready').length;

  const kitchenPending = orders.filter(o => o.departmentStatuses.kitchen === 'pending').length;
  const baristaPending = orders.filter(o => o.departmentStatuses.barista === 'pending').length;
  const shishaPending = orders.filter(o => o.departmentStatuses.shisha === 'pending').length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preparing</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{preparingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{readyOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Department Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kitchen</CardTitle>
            <ChefHat className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{kitchenPending}</div>
            <p className="text-xs text-muted-foreground">Pending orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Barista</CardTitle>
            <Coffee className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{baristaPending}</div>
            <p className="text-xs text-muted-foreground">Pending orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shisha</CardTitle>
            <Wind className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{shishaPending}</div>
            <p className="text-xs text-muted-foreground">Pending orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search orders..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Order Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="kitchen">Kitchen</SelectItem>
            <SelectItem value="barista">Barista</SelectItem>
            <SelectItem value="shisha">Shisha</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Card key={order._id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Order {order.orderNumber}</CardTitle>
                  <div className="text-sm text-gray-500 mt-1">
                    Customer: {order.customerInfo.name || 'Unknown'} | 
                    Phone: {order.customerInfo.phone || 'N/A'} |
                    Time: {new Date(order.orderDate).toLocaleString()} |
                    Source: {order.source}
                  </div>
                  {order.notes && (
                    <div className="text-sm text-blue-600 mt-1">
                      Notes: {order.notes}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(order.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Department Status Overview */}
              <div className="flex gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {getDepartmentStatusIcon(order.departmentStatuses.kitchen)}
                  <span className="text-sm">Kitchen: {order.departmentStatuses.kitchen}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getDepartmentStatusIcon(order.departmentStatuses.barista)}
                  <span className="text-sm">Barista: {order.departmentStatuses.barista}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getDepartmentStatusIcon(order.departmentStatuses.shisha)}
                  <span className="text-sm">Shisha: {order.departmentStatuses.shisha}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.menuItemId} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      {getDepartmentBadge(item.department)}
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
                      <Badge variant={item.departmentStatus === 'ready' ? 'default' : 'secondary'}>
                        {item.departmentStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Amount:</span>
                  <span className="text-lg font-bold">{order.totalAmount} ريال</span>
                </div>
              </div>

              {/* Print Actions */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handlePrintOrder(order._id, 'all')}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Printer className="w-4 h-4" />
                    طباعة جميع الأقسام
                  </Button>
                  
                  {order.items.some((item: any) => item.department === 'kitchen') && (
                    <Button
                      onClick={() => handlePrintOrder(order._id, 'kitchen')}
                      variant="outline"
                      size="sm"
                    >
                      طباعة المطبخ
                    </Button>
                  )}
                  
                  {order.items.some((item: any) => item.department === 'barista') && (
                    <Button
                      onClick={() => handlePrintOrder(order._id, 'barista')}
                      variant="outline"
                      size="sm"
                    >
                      طباعة البارستا
                    </Button>
                  )}
                  
                  {order.items.some((item: any) => item.department === 'shisha') && (
                    <Button
                      onClick={() => handlePrintOrder(order._id, 'shisha')}
                      variant="outline"
                      size="sm"
                    >
                      طباعة الشيشة
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">No orders found</h3>
            <p className="text-gray-400">Orders will appear here when customers place orders</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

