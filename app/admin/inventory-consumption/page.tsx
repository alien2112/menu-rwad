"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, Plus, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { RoleBasedAuth } from "@/components/RoleBasedAuth";

interface InventoryItem {
  _id: string;
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  unit: string;
  minStockLevel: number;
  maxStockLevel: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface ConsumptionRecord {
  _id: string;
  ingredientId: string;
  ingredientName: string;
  quantityConsumed: number;
  unit: string;
  reason: 'order' | 'waste' | 'spoilage' | 'manual_adjustment' | 'other';
  orderId?: string;
  menuItemId?: string;
  notes?: string;
  recordedBy: string;
  recordedAt: string;
}

export default function InventoryConsumptionPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [consumptionRecords, setConsumptionRecords] = useState<ConsumptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [filterReason, setFilterReason] = useState<string>('all');
  const [currentUser, setCurrentUser] = useState<string>('admin');

  useEffect(() => {
    fetchInventoryItems();
    fetchConsumptionRecords();
    
    // Get current user from localStorage
    const authData = localStorage.getItem("user_auth");
    if (authData) {
      try {
        const userData = JSON.parse(authData);
        setCurrentUser(userData.name || userData.username);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch('/api/inventory');
      const data = await response.json();
      if (data.success) {
        setInventoryItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching inventory items:', error);
    }
  };

  const fetchConsumptionRecords = async () => {
    try {
      const response = await fetch('/api/inventory/consumption');
      const data = await response.json();
      if (data.success) {
        setConsumptionRecords(data.data);
      }
    } catch (error) {
      console.error('Error fetching consumption records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddConsumption = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItem || !quantity || !reason) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const selectedInventoryItem = inventoryItems.find(item => item._id === selectedItem);
    if (!selectedInventoryItem) {
      alert('لم يتم العثور على المكون المحدد');
      return;
    }

    const consumptionData = {
      ingredientId: selectedInventoryItem.ingredientId,
      ingredientName: selectedInventoryItem.ingredientName,
      quantityConsumed: parseFloat(quantity),
      unit: selectedInventoryItem.unit,
      reason: reason as any,
      notes: notes,
      recordedBy: currentUser,
    };

    try {
      const response = await fetch('/api/inventory/consumption', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(consumptionData),
      });

      const data = await response.json();
      if (data.success) {
        // Reset form
        setSelectedItem('');
        setQuantity('');
        setReason('');
        setNotes('');
        setShowAddForm(false);
        
        // Refresh data
        fetchInventoryItems();
        fetchConsumptionRecords();
        
        alert('تم تسجيل الاستهلاك بنجاح');
      } else {
        alert(data.error || 'حدث خطأ أثناء تسجيل الاستهلاك');
      }
    } catch (error) {
      console.error('Error adding consumption:', error);
      alert('حدث خطأ أثناء تسجيل الاستهلاك');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-500">متوفر</Badge>;
      case 'low_stock':
        return <Badge className="bg-yellow-500">مخزون منخفض</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-500">نفد المخزون</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'order':
        return <Badge className="bg-blue-500">طلب</Badge>;
      case 'waste':
        return <Badge className="bg-orange-500">هدر</Badge>;
      case 'spoilage':
        return <Badge className="bg-red-500">تلف</Badge>;
      case 'manual_adjustment':
        return <Badge className="bg-purple-500">تعديل يدوي</Badge>;
      case 'other':
        return <Badge className="bg-gray-500">أخرى</Badge>;
      default:
        return <Badge variant="secondary">{reason}</Badge>;
    }
  };

  const filteredRecords = consumptionRecords.filter(record => 
    filterReason === 'all' || record.reason === filterReason
  );

  const lowStockItems = inventoryItems.filter(item => item.status === 'low_stock' || item.status === 'out_of_stock');

  if (loading) {
    return (
      <RoleBasedAuth>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </RoleBasedAuth>
    );
  }

  return (
    <RoleBasedAuth>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/20 rounded-xl">
              <TrendingDown className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">استهلاك المخزون</h1>
              <p className="text-white/70">تسجيل استهلاك المكونات والمخزون</p>
            </div>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            تسجيل استهلاك جديد
          </Button>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="border-yellow-500/50 bg-yellow-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <AlertTriangle className="w-5 h-5" />
                تنبيه: مخزون منخفض
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {lowStockItems.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-2 bg-yellow-500/20 rounded">
                    <span className="text-white text-sm">{item.ingredientName}</span>
                    <span className="text-yellow-300 text-sm">
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Consumption Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>تسجيل استهلاك جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddConsumption} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ingredient">المكون</Label>
                    <Select value={selectedItem} onValueChange={setSelectedItem}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المكون" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventoryItems.map((item) => (
                          <SelectItem key={item._id} value={item._id}>
                            {item.ingredientName} ({item.currentStock} {item.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="quantity">الكمية المستهلكة</Label>
                    <Input
                      id="quantity"
                      type="number"
                      step="0.01"
                      min="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="أدخل الكمية"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reason">سبب الاستهلاك</Label>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر السبب" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order">طلب</SelectItem>
                        <SelectItem value="waste">هدر</SelectItem>
                        <SelectItem value="spoilage">تلف</SelectItem>
                        <SelectItem value="manual_adjustment">تعديل يدوي</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="أضف ملاحظات إضافية"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="bg-green-500 hover:bg-green-600">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    تسجيل الاستهلاك
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <div className="flex gap-4 items-center">
          <Select value={filterReason} onValueChange={setFilterReason}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="تصفية حسب السبب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأسباب</SelectItem>
              <SelectItem value="order">طلبات</SelectItem>
              <SelectItem value="waste">هدر</SelectItem>
              <SelectItem value="spoilage">تلف</SelectItem>
              <SelectItem value="manual_adjustment">تعديل يدوي</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Consumption Records */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">سجل الاستهلاك</h2>
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-500">لا توجد سجلات استهلاك</h3>
                <p className="text-gray-400">سيتم عرض سجلات الاستهلاك هنا عند تسجيلها</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredRecords.map((record) => (
                <Card key={record._id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-medium text-white">{record.ingredientName}</h3>
                          <p className="text-sm text-gray-400">
                            {record.quantityConsumed} {record.unit}
                          </p>
                        </div>
                        {getReasonBadge(record.reason)}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          بواسطة: {record.recordedBy}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(record.recordedAt).toLocaleString('ar-SA')}
                        </p>
                        {record.notes && (
                          <p className="text-sm text-gray-400 mt-1">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleBasedAuth>
  );
}



