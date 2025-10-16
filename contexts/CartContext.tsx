"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface SelectedModifier {
  modifierId: string;
  modifierName: string;
  selectedOptions: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export interface CartItemCustomization {
  sizeId?: string;
  addons: Array<{
    addonId: string;
    quantity: number;
  }>;
  specialInstructions: string;
  dietaryModifications: string[];
  modifiers?: SelectedModifier[];
}

export interface CartItem {
  menuItemId: string;
  menuItemName: string;
  menuItemNameEn?: string;
  quantity: number;
  unitPrice: number; // Base price + modifiers price
  basePrice: number; // Original item price without modifiers
  totalPrice: number;
  customization?: CartItemCustomization;
  image?: string;
}

export interface AppliedPromotion {
  promotionId: string;
  code?: string;
  name: string;
  type: 'discount-code' | 'buy-x-get-y';
  discountAmount: number;
  discountType?: 'percent' | 'fixed';
  discountValue?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  appliedPromotion: AppliedPromotion | null;
  finalTotal: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { menuItemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'APPLY_PROMOTION'; payload: AppliedPromotion }
  | { type: 'REMOVE_PROMOTION' };

const initialState: CartState = {
  items: [],
  isOpen: false,
  totalItems: 0,
  totalPrice: 0,
  subtotal: 0,
  appliedPromotion: null,
  finalTotal: 0,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Helper function to compare modifiers
      const modifiersMatch = (mods1?: SelectedModifier[], mods2?: SelectedModifier[]): boolean => {
        if (!mods1 && !mods2) return true;
        if (!mods1 || !mods2) return false;
        if (mods1.length !== mods2.length) return false;

        const sorted1 = JSON.stringify(mods1.sort((a, b) => a.modifierId.localeCompare(b.modifierId)));
        const sorted2 = JSON.stringify(mods2.sort((a, b) => a.modifierId.localeCompare(b.modifierId)));
        return sorted1 === sorted2;
      };

      // Find existing item with same ID and modifiers
      const existingItemIndex = state.items.findIndex(item =>
        item.menuItemId === action.payload.menuItemId &&
        modifiersMatch(item.customization?.modifiers, action.payload.customization?.modifiers)
      );

      let newItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: item.quantity + action.payload.quantity,
                totalPrice: (item.quantity + action.payload.quantity) * item.unitPrice
              }
            : item
        );
      } else {
        // Add as new item (different modifiers or first time)
        newItems = [...state.items, action.payload];
      }

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const discountAmount = state.appliedPromotion?.discountAmount || 0;
      const finalTotal = Math.max(0, subtotal - discountAmount);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice: subtotal,
        subtotal,
        finalTotal,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.menuItemId !== action.payload);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const discountAmount = state.appliedPromotion?.discountAmount || 0;
      const finalTotal = Math.max(0, subtotal - discountAmount);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice: subtotal,
        subtotal,
        finalTotal,
      };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.menuItemId === action.payload.menuItemId
          ? {
              ...item,
              quantity: Math.max(0, action.payload.quantity),
              totalPrice: Math.max(0, action.payload.quantity) * item.unitPrice
            }
          : item
      ).filter(item => item.quantity > 0);

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const discountAmount = state.appliedPromotion?.discountAmount || 0;
      const finalTotal = Math.max(0, subtotal - discountAmount);

      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice: subtotal,
        subtotal,
        finalTotal,
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        subtotal: 0,
        appliedPromotion: null,
        finalTotal: 0,
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'SET_CART_OPEN':
      return {
        ...state,
        isOpen: action.payload,
      };

    case 'LOAD_CART': {
      const totalItems = action.payload.reduce((sum, item) => sum + item.quantity, 0);
      const subtotal = action.payload.reduce((sum, item) => sum + item.totalPrice, 0);
      const discountAmount = state.appliedPromotion?.discountAmount || 0;
      const finalTotal = Math.max(0, subtotal - discountAmount);

      return {
        ...state,
        items: action.payload,
        totalItems,
        totalPrice: subtotal,
        subtotal,
        finalTotal,
      };
    }

    case 'APPLY_PROMOTION': {
      const discountAmount = action.payload.discountAmount;
      const finalTotal = Math.max(0, state.subtotal - discountAmount);

      return {
        ...state,
        appliedPromotion: action.payload,
        finalTotal,
      };
    }

    case 'REMOVE_PROMOTION': {
      return {
        ...state,
        appliedPromotion: null,
        finalTotal: state.subtotal,
      };
    }

    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  cartItems: CartItem[];
  applyPromotion: (promotion: AppliedPromotion) => void;
  removePromotion: () => void;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Convenience functions
  const addToCart = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeFromCart = (menuItemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: menuItemId });
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { menuItemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const applyPromotion = (promotion: AppliedPromotion) => {
    dispatch({ type: 'APPLY_PROMOTION', payload: promotion });
  };

  const removePromotion = () => {
    dispatch({ type: 'REMOVE_PROMOTION' });
  };

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(state.items));
    }
  }, [state.items]);

  return (
    <CartContext.Provider value={{
      state,
      dispatch,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleCart,
      cartItems: state.items,
      applyPromotion,
      removePromotion,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    // Return a safe fallback instead of throwing an error
    console.warn('useCart must be used within a CartProvider');
    return {
      state: initialState,
      dispatch: () => {},
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      toggleCart: () => {},
      cartItems: [],
      applyPromotion: () => {},
      removePromotion: () => {},
    };
  }
  return context;
}

