"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart, CheckCircle, Clock } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface MenuItem {
  _id: string;
  name: string;
  nameEn?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  image?: string;
  categoryId: string;
  preparationTime?: number;
  status: 'active' | 'inactive' | 'out_of_stock';
}

interface CartItem {
  menuItemId: string;
  menuItemName: string;
  menuItemNameEn?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function OrderPage() {
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Customer information form
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      if (data.success) {
        setMenuItems(data.data.filter((item: MenuItem) => item.status === 'active'));
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    if (!customerInfo.name || !customerInfo.phone) {
      alert('Please fill in your name and phone number');
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        items: cartItems,
        totalAmount: calculateTotal(),
        customerInfo,
        notes,
        source: 'website'
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      
      if (data.success) {
        setOrderNumber(data.data.orderNumber);
        setOrderSubmitted(true);
        clearCart();
      } else {
        alert('Failed to submit order: ' + data.error);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4F3500] via-[#3E2901] to-[#2A1B00] flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Order Submitted Successfully!</h2>
            <p className="text-lg font-semibold mb-4">Order Number: {orderNumber}</p>
            <p className="text-gray-600 mb-6">
              Thank you for your order! We'll prepare your food and contact you when it's ready.
            </p>
            <Button 
              onClick={() => {
                setOrderSubmitted(false);
                setOrderNumber('');
                setCustomerInfo({ name: '', phone: '', address: '' });
                setNotes('');
              }}
              className="w-full"
            >
              Place Another Order
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4F3500] via-[#3E2901] to-[#2A1B00] flex items-center justify-center">
        <div className="text-white text-xl">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4F3500] via-[#3E2901] to-[#2A1B00] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-white mb-6">Our Menu</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems.map((item) => {
                const cartItem = cartItems.find(cartItem => cartItem.menuItemId === item._id);
                const quantity = cartItem?.quantity || 0;

                return (
                  <Card key={item._id} className="bg-white/90 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          {item.nameEn && (
                            <p className="text-sm text-gray-600">{item.nameEn}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {item.discountPrice ? item.discountPrice : item.price} ريال
                          </p>
                          {item.discountPrice && (
                            <p className="text-sm text-gray-500 line-through">
                              {item.price} ريال
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      )}
                      
                      {item.preparationTime && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                          <Clock className="w-4 h-4" />
                          {item.preparationTime} minutes
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        {quantity > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item._id, quantity - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="font-semibold">{quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleQuantityChange(item._id, quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => addToCart({
                              menuItemId: item._id,
                              menuItemName: item.name,
                              menuItemNameEn: item.nameEn,
                              quantity: 1,
                              unitPrice: item.discountPrice || item.price,
                              totalPrice: item.discountPrice || item.price
                            })}
                          >
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      {cartItems.map((item) => (
                        <div key={item.menuItemId} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.menuItemName}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-semibold">{item.totalPrice} ريال</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>{calculateTotal()} ريال</span>
                      </div>
                    </div>

                    {/* Customer Information Form */}
                    <form onSubmit={handleSubmitOrder} className="mt-6 space-y-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={customerInfo.address}
                          onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Special Instructions</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                          placeholder="Any special requests or notes..."
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting Order...' : 'Place Order'}
                      </Button>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}








