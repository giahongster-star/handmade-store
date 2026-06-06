'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(true);

  // Initialize cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('auracraft_cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed && Array.isArray(parsed.items)) {
          setCart(parsed);
        }
      }
    } catch (err) {
      console.error('Error loading cart from localStorage:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save cart helper
  const saveCart = (newItems) => {
    const subtotal = newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const updatedCart = {
      items: newItems,
      subtotal: parseFloat(subtotal.toFixed(2))
    };
    setCart(updatedCart);
    try {
      localStorage.setItem('auracraft_cart', JSON.stringify(updatedCart));
    } catch (err) {
      console.error('Error saving cart to localStorage:', err);
    }
    return updatedCart;
  };

  const addItem = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const existingItem = cart.items.find(item => item.product_id === productId);

      if (existingItem) {
        const updatedItems = cart.items.map(item =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        saveCart(updatedItems);
        return { success: true };
      }

      // Fetch product details for new items
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();

      if (!data.success) {
        return { success: false, error: data.error || 'Sản phẩm không tồn tại' };
      }

      const product = data.data;
      const newItem = {
        id: product.id, // Use product ID as cart item ID for simplicity
        product_id: product.id,
        quantity,
        name: product.name,
        price: product.price,
        slug: product.slug,
        primary_image_url: product.images?.find(img => img.is_primary === 1)?.url || product.images?.[0]?.url || ''
      };

      saveCart([...cart.items, newItem]);
      return { success: true };
    } catch (err) {
      console.error('Error adding to cart:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      const updatedItems = cart.items.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      );
      saveCart(updatedItems);
      return { success: true };
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setLoading(true);
      const updatedItems = cart.items.filter(item => item.id !== itemId);
      saveCart(updatedItems);
      return { success: true };
    } catch (err) {
      console.error('Error removing cart item:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const clearCartState = () => {
    setCart({ items: [], subtotal: 0 });
    try {
      localStorage.removeItem('auracraft_cart');
    } catch (err) {
      console.error('Error clearing cart from localStorage:', err);
    }
  };

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateQuantity, removeItem, clearCartState }}>
      {children}
    </CartContext.Provider>
  );
};
