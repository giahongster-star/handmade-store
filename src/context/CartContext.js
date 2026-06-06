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
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Cart ID from localStorage
  useEffect(() => {
    const savedCartId = localStorage.getItem('cart_id');
    fetchCart(savedCartId);
  }, []);

  const fetchCart = async (id = null) => {
    try {
      setLoading(true);
      const headers = {};
      if (id) {
        headers['x-cart-id'] = id;
      }

      const res = await fetch('/api/cart', { headers });
      const data = await res.json();

      if (data.success) {
        setCart(data.data);
        const newCartId = res.headers.get('x-cart-id') || data.data.cart_id;
        if (newCartId) {
          localStorage.setItem('cart_id', newCartId);
          setCartId(newCartId);
        }
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId, quantity = 1) => {
    try {
      setLoading(true);
      const headers = { 'Content-Type': 'application/json' };
      if (cartId) {
        headers['x-cart-id'] = cartId;
      }

      const res = await fetch('/api/cart', {
        method: 'POST',
        headers,
        body: JSON.stringify({ product_id: productId, quantity })
      });
      const data = await res.json();

      if (data.success) {
        setCart(data.data);
        const newCartId = res.headers.get('x-cart-id') || data.data.cart_id;
        if (newCartId) {
          localStorage.setItem('cart_id', newCartId);
          setCartId(newCartId);
        }
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
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
      const headers = {
        'Content-Type': 'application/json',
        'x-cart-id': cartId
      };

      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ quantity })
      });
      const data = await res.json();

      if (data.success) {
        setCart(data.data);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
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
      const headers = { 'x-cart-id': cartId };

      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();

      if (data.success) {
        setCart(data.data);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error('Error removing cart item:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const clearCartState = () => {
    setCart({ items: [], subtotal: 0 });
  };

  return (
    <CartContext.Provider value={{ cart, cartId, loading, addItem, updateQuantity, removeItem, fetchCart, clearCartState }}>
      {children}
    </CartContext.Provider>
  );
};
