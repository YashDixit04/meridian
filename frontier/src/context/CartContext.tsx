import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Cart Context Type Definition
interface CartContextType {
  cartItems: Record<number, number>;
  totalItems: number;
  addToCart: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<Record<number, number>>({});

  const totalItems = Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);

  const addToCart = useCallback((productId: number) => {
    setCartItems(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCartItems(prev => {
      const newItems = { ...prev };
      delete newItems[productId];
      return newItems;
    });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setCartItems(prev => {
      if (quantity <= 0) {
        const newItems = { ...prev };
        delete newItems[productId];
        return newItems;
      }
      return {
        ...prev,
        [productId]: quantity
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems({});
  }, []);

  return (
    <CartContext.Provider value={{ cartItems, totalItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
