import { useState, useEffect } from 'react';
import { CartItem } from '../types';
import { supabase } from '../src/integrations/supabase/client';

export function useCart(userId: string | null) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadCart();
    } else {
      loadLocalCart();
    }
  }, [userId]);

  const loadCart = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart')
        .select('*, product:products(*)')
        .eq('user_id', userId);

      if (error) throw error;
      setCart(data.map(item => ({ product: item.product, quantity: item.quantity })));
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLocalCart = () => {
    const localCart = localStorage.getItem('koop_cart');
    setCart(localCart ? JSON.parse(localCart) : []);
    setLoading(false);
  };

  const saveCart = async (newCart: CartItem[]) => {
    setCart(newCart);
    if (userId) {
      try {
        // Delete existing cart items
        const { error: deleteError } = await supabase
          .from('cart')
          .delete()
          .eq('user_id', userId);

        if (deleteError) throw deleteError;

        // Add new cart items
        const cartItems = newCart.map(item => ({
          user_id: userId,
          product_id: item.product.id,
          quantity: item.quantity
        }));

        const { error: insertError } = await supabase
          .from('cart')
          .insert(cartItems);

        if (insertError) throw insertError;
      } catch (err) {
        console.error('Failed to save cart:', err);
      }
    } else {
      localStorage.setItem('koop_cart', JSON.stringify(newCart));
    }
  };

  const addToCart = async (product: any, quantity: number = 1) => {
    const existingItemIndex = cart.findIndex(item => item.product.id === product.id);
    let newCart;
    if (existingItemIndex >= 0) {
      newCart = cart.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, quantity: item.quantity + quantity } 
          : item
      );
    } else {
      newCart = [...cart, { product, quantity }];
    }
    await saveCart(newCart);
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    const newCart = cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: newQuantity } 
        : item
    );
    await saveCart(newCart);
  };

  const removeFromCart = async (productId: string) => {
    const newCart = cart.filter(item => item.product.id !== productId);
    await saveCart(newCart);
  };

  const clearCart = async () => {
    await saveCart([]);
  };

  return {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  };
}