import React, { createContext, useState, useContext } from 'react';

/**
 * [CONTEXT]: CartContext
 * Purpose: Global state management for shopping sessions.
 * Logic: Handles addition, removal, and quantity adjustments for products.
 */
const CartContext = createContext();

/**
 * [HOOK]: useCart
 * Provides quick access to the cart state and dispatchers.
 */
export const useCart = () => useContext(CartContext);

/**
 * [PROVIDER]: CartProvider
 * Wraps the application to provide persistent cart state.
 */
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  /**
   * [ACTION]: Add to Cart
   * Adds a new item or increments volume if product already exists.
   */
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  /**
   * [ACTION]: Remove Item
   * Purges a product and all its quantities from the cart registry.
   */
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  /**
   * [ACTION]: Update Quantity
   * Modifies the unit count for a specific product ID.
   */
  const updateQuantity = (id, amount) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + amount) } : item
      )
    );
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
};