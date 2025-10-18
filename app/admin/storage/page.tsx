"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/admin/Card";
import { Button } from "@/components/admin/Button";
import { Input } from "@/components/admin/Input";
import { Label } from "@/components/admin/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/admin/Select";
import { Badge } from "@/components/admin/Badge";
import { Alert, AlertDescription } from "@/components/admin/Alert";
import { Plus, AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";
import { IIngredient } from '@/lib/models/Ingredient';
import { UnitType, UNIT_LABELS } from '@/lib/unitConversion';

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
  const [ingredients, setIngredients] = useState<IIngredient[]>([]);
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

  useEffect(() => {
    fetchMaterials();
    fetchIngredients();
    fetchNotifications();
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/materials');
      const data = await response.json();
      if (data.success) {
        setMaterials(data.data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients');
      const data = await response.json();
      if (data.success) {
        setIngredients(data.data);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications?category=inventory');
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

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

      const data = await response.json();
      if (data.success) {
        setMaterials([...materials, data.data]);
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
        fetchNotifications(); // Refresh notifications
      }
    } catch (error) {
      console.error('Error adding material:', error);
    }
  };

  const handleUpdateQuantity = async (materialId: string, newQuantity: number) => {
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentQuantity: newQuantity }),
      });

      const data = await response.json();
      if (data.success) {
        setMaterials(materials.map(m => 
          m._id === materialId ? { ...m, currentQuantity: newQuantity } : m
        ));
        fetchNotifications(); // Refresh notifications
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications?id=${notificationId}&action=read`, {
        method: 'PUT',
      });
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const filteredMaterials = materials.filter(material => {
    const matchesCategory = filterCategory === 'all' || material.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || material.status === filterStatus;
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.nameEn?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const lowStockMaterials = materials.filter(m => m.currentQuantity <= m.alertLimit);
  const outOfStockMaterials = materials.filter(m => m.currentQuantity <= 0);

  const getStatusBadge = (material: Material) => {
    if (material.currentQuantity <= 0) {
      return <Badge>Out of Stock</Badge>;
    } else if (material.currentQuantity <= material.alertLimit) {
      return <Badge>Low Stock</Badge>;
    } else {
      return <Badge>In Stock</Badge>;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return { color: '#dc2626' };
      case 'high': return { color: '#ea580c' };
      case 'medium': return { color: '#d97706' };
      case 'low': return { color: '#16a34a' };
      default: return { color: 'var(--text-secondary)' };
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Storage Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Material
        </Button>
      </div>

      {/* Alerts */}
      {notifications.filter(n => !n.isRead).length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {notifications.filter(n => !n.isRead).length} unread inventory alerts
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
            <Package className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materials.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockMaterials.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4" style={{ color: '#dc2626' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockMaterials.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Materials</CardTitle>
            <TrendingUp className="h-4 w-4" style={{ color: '#16a34a' }} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {materials.filter(m => m.status === 'active').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search materials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
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
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Materials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Materials Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full admin-table" dir="rtl">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2">Name</th>
                  <th className="text-right p-2">Category</th>
                  <th className="text-right p-2">Current Quantity</th>
                  <th className="text-right p-2">Alert Limit</th>
                  <th className="text-right p-2">Status</th>
                  <th className="text-right p-2">Cost/Unit</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map((material) => (
                  <tr key={material._id} className="border-b">
                    <td className="p-2 text-right">
                      <div>
                        <div className="font-medium">{material.name}</div>
                        {material.nameEn && (
                          <div className="text-sm">{material.nameEn}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 capitalize text-right">{material.category}</td>
                    <td className="p-2 text-right">
                      <div className="flex flex-row-reverse items-center gap-2">
                        <span>{material.currentQuantity}</span>
                        <span>{material.unit}</span>
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex flex-row-reverse items-center gap-2">
                        <span>{material.alertLimit}</span>
                        <span>{material.unit}</span>
                      </div>
                    </td>
                    <td className="p-2 text-right">{getStatusBadge(material)}</td>
                    <td className="p-2 text-right">{material.costPerUnit} ريال</td>
                    <td className="p-2 text-right">
                      <Button
                        size="sm"
                        onClick={() => {
                          const newQuantity = prompt(`Enter new quantity for ${material.name}:`, material.currentQuantity.toString());
                          if (newQuantity && !isNaN(Number(newQuantity))) {
                            handleUpdateQuantity(material._id, Number(newQuantity));
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

      {/* Add Material Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Material</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddMaterial} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="nameEn">English Name</Label>
                  <Input
                    id="nameEn"
                    value={newMaterial.nameEn}
                    onChange={(e) => setNewMaterial({...newMaterial, nameEn: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={newMaterial.unit} onValueChange={(value) => setNewMaterial({...newMaterial, unit: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UnitType.KILOGRAM}>{UNIT_LABELS[UnitType.KILOGRAM].ar} (kg)</SelectItem>
                        <SelectItem value={UnitType.GRAM}>{UNIT_LABELS[UnitType.GRAM].ar} (g)</SelectItem>
                        <SelectItem value={UnitType.LITER}>{UNIT_LABELS[UnitType.LITER].ar} (l)</SelectItem>
                        <SelectItem value={UnitType.MILLILITER}>{UNIT_LABELS[UnitType.MILLILITER].ar} (ml)</SelectItem>
                        <SelectItem value={UnitType.PIECE}>{UNIT_LABELS[UnitType.PIECE].ar} (piece)</SelectItem>
                        <SelectItem value={UnitType.UNIT}>{UNIT_LABELS[UnitType.UNIT].ar} (unit)</SelectItem>
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
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentQuantity">Current Quantity *</Label>
                    <Input
                      id="currentQuantity"
                      type="number"
                      value={newMaterial.currentQuantity}
                      onChange={(e) => setNewMaterial({...newMaterial, currentQuantity: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="minLimit">Min Limit *</Label>
                    <Input
                      id="minLimit"
                      type="number"
                      value={newMaterial.minLimit}
                      onChange={(e) => setNewMaterial({...newMaterial, minLimit: Number(e.target.value)})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="alertLimit">Alert Limit *</Label>
                    <Input
                      id="alertLimit"
                      type="number"
                      value={newMaterial.alertLimit}
                      onChange={(e) => setNewMaterial({...newMaterial, alertLimit: Number(e.target.value)})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="costPerUnit">Cost per Unit</Label>
                  <Input
                    id="costPerUnit"
                    type="number"
                    step="0.01"
                    value={newMaterial.costPerUnit}
                    onChange={(e) => setNewMaterial({...newMaterial, costPerUnit: Number(e.target.value)})}
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
                <div>
                  <Label htmlFor="ingredientId">Link to Ingredient (Optional)</Label>
                  <Select
                    value={newMaterial.ingredientId || "none"}
                    onValueChange={(value) => setNewMaterial({...newMaterial, ingredientId: value === "none" ? "" : value})}
                  >
                    <SelectTrigger id="ingredientId">
                      <SelectValue placeholder="Select ingredient to sync stock" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Storage only)</SelectItem>
                      {ingredients.map((ing) => (
                        <SelectItem key={ing._id} value={ing._id!}>
                          {ing.name} ({ing.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs mt-1">
                    Link this material to an ingredient to automatically sync stock levels
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Material</Button>
                  <Button type="button" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 rounded-lg border ${
                    notification.isRead ? '' : 'bg-yellow-500/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{notification.title}</h4>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm mt-1">{notification.message}</p>
                      <p className="text-xs mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Button
                        size="sm"
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

