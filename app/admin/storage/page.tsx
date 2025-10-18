"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { Label } from "@/components/admin/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/Select";
import { Badge } from "@/components/admin/Badge";
import { Alert, AlertDescription } from "@/components/admin/Alert";
import { Plus, AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";

interface Material {
  _id: string;
  name: string;
  nameEn?: string;
  unit: string;
  currentQuantity: number;
  minLimit: number;
  alertLimit: number;
  costPerUnit: number;
  category: 'food' | 'beverage' | 'shisha' | 'cleaning' | 'other';
  status: 'active' | 'inactive' | 'out_of_stock';
  supplier?: string;
  lastRestocked?: string;
  expiryDate?: string;
  ingredientId?: string;
}

interface Notification {
  _id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiry_warning';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
}

export default function StorageManagementDashboard() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // New material form state
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    nameEn: '',
    unit: 'kg',
    currentQuantity: 0,
    minLimit: 0,
    alertLimit: 0,
    costPerUnit: 0,
    category: 'food' as const,
    supplier: '',
    notes: '',
    ingredientId: ''
  });

  const fetchMaterials = useCallback(async () => {
    try {
      const response = await fetch('/api/materials');
      const data = await response.json();
      if (data.success) {
        setMaterials(data.data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?category=inventory');
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
    fetchNotifications();
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [fetchMaterials, fetchNotifications]);

  if (isInitialLoading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 rounded animate-pulse" />
          <div className="h-10 w-32 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="admin-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 w-24 rounded animate-pulse" />
                <div className="h-8 w-8 rounded-lg animate-pulse" />
              </div>
              <div className="h-8 w-16 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div className="flex gap-4 items-center">
          <div className="h-10 w-64 rounded-lg animate-pulse" />
          <div className="h-10 w-40 rounded-lg animate-pulse" />
          <div className="h-10 w-40 rounded-lg animate-pulse" />
        </div>

        <div className="admin-card rounded-xl p-6">
          <div className="h-6 w-48 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded animate-pulse" />
                  <div className="space-y-1">
                    <div className="h-4 w-32 rounded animate-pulse" />
                    <div className="h-3 w-24 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-16 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMaterial),
      });
      
      if (response.ok) {
        setNewMaterial({
          name: '',
          nameEn: '',
          unit: 'kg',
          currentQuantity: 0,
          minLimit: 0,
          alertLimit: 0,
          costPerUnit: 0,
          category: 'food',
          supplier: '',
          notes: '',
          ingredientId: ''
        });
        setShowAddForm(false);
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error adding material:', error);
    }
  };

  const handleUpdateQuantity = async (materialId: string, newQuantity: number) => {
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentQuantity: newQuantity }),
      });
      
      if (response.ok) {
        fetchMaterials();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });
      
      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'out_of_stock': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || material.status === filterStatus;
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.nameEn?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const lowStockCount = materials.filter(m => m.currentQuantity <= m.alertLimit).length;
  const outOfStockCount = materials.filter(m => m.currentQuantity === 0).length;
  const totalValue = materials.reduce((sum, m) => sum + (m.currentQuantity * m.costPerUnit), 0);
  const totalItems = materials.length;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Storage Management</h1>
        <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Material
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-lg sm:text-2xl font-bold">{totalItems}</p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-lg sm:text-2xl font-bold text-orange-600">{lowStockCount}</p>
              </div>
              <TrendingDown className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">${totalValue.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
        <Input
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-sm"
        />
        <div className="flex gap-3 sm:gap-4">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="beverage">Beverage</SelectItem>
              <SelectItem value="shisha">Shisha</SelectItem>
              <SelectItem value="cleaning">Cleaning</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Add Material Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-content">
            <CardHeader>
              <CardTitle>Add New Material</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name (Arabic)</Label>
                    <Input
                      id="name"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="nameEn">Name (English)</Label>
                    <Input
                      id="nameEn"
                      value={newMaterial.nameEn}
                      onChange={(e) => setNewMaterial({...newMaterial, nameEn: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentQuantity">Current Quantity</Label>
                    <Input
                      id="currentQuantity"
                      type="number"
                      value={newMaterial.currentQuantity}
                      onChange={(e) => setNewMaterial({...newMaterial, currentQuantity: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minLimit">Min Limit</Label>
                    <Input
                      id="minLimit"
                      type="number"
                      value={newMaterial.minLimit}
                      onChange={(e) => setNewMaterial({...newMaterial, minLimit: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="alertLimit">Alert Limit</Label>
                    <Input
                      id="alertLimit"
                      type="number"
                      value={newMaterial.alertLimit}
                      onChange={(e) => setNewMaterial({...newMaterial, alertLimit: Number(e.target.value)})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={newMaterial.unit} onValueChange={(value) => setNewMaterial({...newMaterial, unit: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">كيلوجرام (kg)</SelectItem>
                        <SelectItem value="g">جرام (g)</SelectItem>
                        <SelectItem value="l">لتر (l)</SelectItem>
                        <SelectItem value="ml">مليلتر (ml)</SelectItem>
                        <SelectItem value="piece">قطعة (piece)</SelectItem>
                        <SelectItem value="unit">وحدة (unit)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newMaterial.category} onValueChange={(value: any) => setNewMaterial({...newMaterial, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="beverage">Beverage</SelectItem>
                        <SelectItem value="shisha">Shisha</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costPerUnit">Cost per Unit</Label>
                    <Input
                      id="costPerUnit"
                      type="number"
                      step="0.01"
                      value={newMaterial.costPerUnit}
                      onChange={(e) => setNewMaterial({...newMaterial, costPerUnit: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={newMaterial.supplier}
                      onChange={(e) => setNewMaterial({...newMaterial, supplier: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="w-full sm:w-auto">Add Material</Button>
                  <Button type="button" onClick={() => setShowAddForm(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Materials Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto admin-table-container">
            <table className="w-full admin-table min-w-[800px]" dir="rtl">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3 text-sm font-medium">Name</th>
                  <th className="text-right p-3 text-sm font-medium">Category</th>
                  <th className="text-right p-3 text-sm font-medium">Current Qty</th>
                  <th className="text-right p-3 text-sm font-medium">Alert Limit</th>
                  <th className="text-right p-3 text-sm font-medium">Status</th>
                  <th className="text-right p-3 text-sm font-medium">Cost/Unit</th>
                  <th className="text-right p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material) => (
                  <tr key={material._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-sm">{material.name}</div>
                        {material.nameEn && (
                          <div className="text-xs text-gray-500">{material.nameEn}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-blue-500 text-xs">{material.category}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{material.currentQuantity}</span>
                        <span className="text-xs text-gray-500">{material.unit}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{material.alertLimit}</td>
                    <td className="p-3">
                      <Badge className={`${getStatusColor(material.status)} text-xs`}>
                        {material.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">${material.costPerUnit.toFixed(2)}</td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        className="text-xs px-2 py-1"
                        onClick={() => {
                          const newQty = prompt('Enter new quantity:', material.currentQuantity.toString());
                          if (newQty !== null) {
                            handleUpdateQuantity(material._id, Number(newQty));
                          }
                        }}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Storage Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 rounded-lg border ${
                    notification.isRead ? '' : 'bg-yellow-500/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <Badge className={`${getPriorityColor(notification.priority)} text-xs w-fit`}>
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">{notification.message}</p>
                      <p className="text-xs mt-1 text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        className="text-xs px-3 py-1 w-full sm:w-auto"
                        onClick={() => markNotificationAsRead(notification._id)}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}