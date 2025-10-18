"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { Label } from "@/components/admin/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/Select";
import { Badge } from "@/components/admin/Badge";
import { Alert, AlertDescription } from "@/components/admin/Alert";
import { Plus, AlertTriangle, Package, TrendingDown, TrendingUp, Edit, X } from "lucide-react";
import { useAlert } from '@/components/ui/alerts';

interface Material {
  _id: string;
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  unit: string;
  minStockLevel: number;
  maxStockLevel: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
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
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    currentStock: 0,
    minStockLevel: 0,
    maxStockLevel: 0
  });

  const { showSuccess, showError } = useAlert();

  // New material form state
  const [newMaterial, setNewMaterial] = useState({
    ingredientId: '',
    ingredientName: '',
    unit: 'kg',
    currentStock: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    supplier: '',
    notes: ''
  });

  const fetchMaterials = useCallback(async () => {
    try {
      const response = await fetch('/api/inventory');
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
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMaterial),
      });

      const data = await response.json();

      if (data.success) {
        setNewMaterial({
          ingredientId: '',
          ingredientName: '',
          unit: 'kg',
          currentStock: 0,
          minStockLevel: 0,
          maxStockLevel: 0,
          supplier: '',
          notes: ''
        });
        setShowAddForm(false);
        fetchMaterials();
        showSuccess('تم إضافة المادة بنجاح');
      } else {
        showError(data.error || 'فشل في إضافة المادة');
      }
    } catch (error) {
      console.error('Error adding material:', error);
      showError('حدث خطأ أثناء إضافة المادة');
    }
  };

  const handleOpenEditModal = (material: Material) => {
    setEditingMaterial(material);
    setEditFormData({
      currentStock: material.currentStock,
      minStockLevel: material.minStockLevel,
      maxStockLevel: material.maxStockLevel
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingMaterial(null);
    setEditFormData({
      currentStock: 0,
      minStockLevel: 0,
      maxStockLevel: 0
    });
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;

    try {
      const response = await fetch('/api/inventory', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingMaterial._id,
          currentStock: editFormData.currentStock,
          minStockLevel: editFormData.minStockLevel,
          maxStockLevel: editFormData.maxStockLevel
        }),
      });

      const data = await response.json();

      if (data.success) {
        fetchMaterials();
        handleCloseEditModal();
        showSuccess('تم تحديث المادة بنجاح');
      } else {
        showError(data.error || 'فشل في تحديث المادة');
      }
    } catch (error) {
      console.error('Error updating material:', error);
      showError('حدث خطأ أثناء تحديث المادة');
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
      case 'in_stock': return 'bg-green-500';
      case 'low_stock': return 'bg-yellow-500';
      case 'out_of_stock': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesStatus = filterStatus === 'all' || material.status === filterStatus;
    const matchesSearch = material.ingredientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.ingredientId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const lowStockCount = materials.filter(m => m.status === 'low_stock').length;
  const outOfStockCount = materials.filter(m => m.status === 'out_of_stock').length;
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
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">{totalItems}</p>
              </div>
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
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
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
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
                    <Label htmlFor="ingredientName">Ingredient Name</Label>
                    <Input
                      id="ingredientName"
                      value={newMaterial.ingredientName}
                      onChange={(e) => setNewMaterial({...newMaterial, ingredientName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ingredientId">Ingredient ID</Label>
                    <Input
                      id="ingredientId"
                      value={newMaterial.ingredientId}
                      onChange={(e) => setNewMaterial({...newMaterial, ingredientId: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input
                      id="currentStock"
                      type="number"
                      value={newMaterial.currentStock}
                      onChange={(e) => setNewMaterial({...newMaterial, currentStock: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minStockLevel">Min Stock Level</Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      value={newMaterial.minStockLevel}
                      onChange={(e) => setNewMaterial({...newMaterial, minStockLevel: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxStockLevel">Max Stock Level</Label>
                    <Input
                      id="maxStockLevel"
                      type="number"
                      value={newMaterial.maxStockLevel}
                      onChange={(e) => setNewMaterial({...newMaterial, maxStockLevel: Number(e.target.value)})}
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
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={newMaterial.supplier}
                      onChange={(e) => setNewMaterial({...newMaterial, supplier: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={newMaterial.notes}
                      onChange={(e) => setNewMaterial({...newMaterial, notes: e.target.value})}
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
                  <th className="text-right p-3 text-sm font-medium">Current Stock</th>
                  <th className="text-right p-3 text-sm font-medium">Min Level</th>
                  <th className="text-right p-3 text-sm font-medium">Max Level</th>
                  <th className="text-right p-3 text-sm font-medium">Status</th>
                  <th className="text-right p-3 text-sm font-medium">Unit</th>
                  <th className="text-right p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material) => (
                  <tr key={material._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium text-sm">{material.ingredientName}</div>
                        <div className="text-xs text-gray-500">ID: {material.ingredientId}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{material.currentStock}</span>
                        <span className="text-xs text-gray-500">{material.unit}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{material.minStockLevel}</td>
                    <td className="p-3 text-sm">{material.maxStockLevel}</td>
                    <td className="p-3">
                      <Badge className={`${getStatusColor(material.status)} text-xs`}>
                        {material.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">{material.unit}</td>
                    <td className="p-3">
                      <Button
                        className="text-xs px-2 py-1 flex items-center gap-1"
                        onClick={() => handleOpenEditModal(material)}
                      >
                        <Edit className="w-3 h-3" />
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

      {/* Edit Material Modal */}
      {showEditModal && editingMaterial && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto modal-content">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>تحديث المخزون - {editingMaterial.ingredientName}</CardTitle>
              <Button
                onClick={handleCloseEditModal}
                className="w-8 h-8 p-0 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateMaterial} className="space-y-4">
                <div className="admin-card rounded-xl p-4 bg-muted/30">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="font-semibold">ID:</span> {editingMaterial.ingredientId}
                    </div>
                    <div>
                      <span className="font-semibold">Unit:</span> {editingMaterial.unit}
                    </div>
                    <div className="col-span-2">
                      <span className="font-semibold">Current Status:</span>{' '}
                      <Badge className={`${getStatusColor(editingMaterial.status)} text-xs ml-2`}>
                        {editingMaterial.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-currentStock">
                      Current Stock ({editingMaterial.unit}) *
                    </Label>
                    <Input
                      id="edit-currentStock"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editFormData.currentStock}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        currentStock: Number(e.target.value)
                      })}
                      required
                      className="text-lg font-semibold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-minStockLevel">
                      Min Stock Level *
                    </Label>
                    <Input
                      id="edit-minStockLevel"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editFormData.minStockLevel}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        minStockLevel: Number(e.target.value)
                      })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-maxStockLevel">
                      Max Stock Level *
                    </Label>
                    <Input
                      id="edit-maxStockLevel"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editFormData.maxStockLevel}
                      onChange={(e) => setEditFormData({
                        ...editFormData,
                        maxStockLevel: Number(e.target.value)
                      })}
                      required
                    />
                  </div>
                </div>

                {/* Preview new status */}
                <div className="admin-card rounded-xl p-4 bg-blue-500/10 border border-blue-500/30">
                  <div className="text-sm">
                    <span className="font-semibold">New Status Preview:</span>{' '}
                    {editFormData.currentStock <= 0 ? (
                      <Badge className="bg-red-500 text-xs ml-2">out_of_stock</Badge>
                    ) : editFormData.currentStock <= editFormData.minStockLevel ? (
                      <Badge className="bg-yellow-500 text-xs ml-2">low_stock</Badge>
                    ) : (
                      <Badge className="bg-green-500 text-xs ml-2">in_stock</Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                  <Button type="submit" className="w-full sm:w-auto">
                    <Edit className="w-4 h-4 mr-2" />
                    Update Material
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}