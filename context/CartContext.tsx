"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useCurrency } from "@/context/CurrencyContext";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  collection?: string;
  style?: string;
  shape?: string;
  length?: string;
  size?: string;
  color?: string;
  shade?: string;
  quantity: number;
}

export interface CartShippingOption {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  isFree: boolean;
  estimatedDelivery: {
    min: number;
    max: number;
    unit: string;
    label: string;
  };
  carrier: string;
  isDefault: boolean;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "id"> & { id?: string }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  // Dynamic shipping options fetched from MongoDB
  shippingMethods: CartShippingOption[];
  selectedShippingMethod: CartShippingOption | null;
  setSelectedShippingMethod: (method: CartShippingOption) => void;
  shippingCountry: string;
  setShippingCountry: (country: string) => void;
  shippingFee: number;
  isLoadingShipping: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "cherrybrush_cart_v1";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { selectedCurrency } = useCurrency();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [shippingCountry, setShippingCountry] = useState<string>(
    () => selectedCurrency?.countryCode || "ALL"
  );
  const [shippingMethods, setShippingMethods] = useState<CartShippingOption[]>([]);
  const [selectedShippingMethod, setSelectedShippingMethod] =
    useState<CartShippingOption | null>(null);
  const [isLoadingShipping, setIsLoadingShipping] = useState<boolean>(false);

  // Sync shippingCountry if currency changes
  useEffect(() => {
    if (selectedCurrency?.countryCode) {
      setShippingCountry(selectedCurrency.countryCode);
    }
  }, [selectedCurrency?.countryCode]);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    } finally {
      setInitialized(true);
    }
  }, []);

  // Sync cart to localStorage whenever items change
  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save cart to localStorage", e);
      }
    }
  }, [items, initialized]);

  const addToCart = (newItem: Omit<CartItem, "id"> & { id?: string }) => {
    const itemShade = newItem.shade || newItem.color || "";
    const generatedId =
      newItem.id ||
      `${newItem.productId}-${newItem.shape || ""}-${newItem.length || ""}-${
        newItem.size || ""
      }-${itemShade}`;

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.id === generatedId,
      );
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + (newItem.quantity || 1),
        };
        return updated;
      }
      return [
        ...prevItems,
        {
          ...newItem,
          shade: itemShade,
          color: newItem.color || itemShade,
          id: generatedId,
          quantity: newItem.quantity || 1,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Load eligible shipping methods from MongoDB whenever cart total or currency changes
  useEffect(() => {
    let isMounted = true;
    async function loadShippingMethods() {
      try {
        setIsLoadingShipping(true);
        const country = shippingCountry || selectedCurrency?.countryCode || "ALL";
        const res = await fetch(
          `/api/shipping?country=${country}&subtotal=${totalPrice}`
        );
        if (!res.ok) return;
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && isMounted) {
          const methods: CartShippingOption[] = json.data;
          setShippingMethods(methods);

          setSelectedShippingMethod((prev) => {
            if (prev) {
              const matched = methods.find(
                (m) => m.id === prev.id || m.slug === prev.slug
              );
              if (matched) return matched;
            }
            const defaultMethod = methods.find((m) => m.isDefault);
            return defaultMethod || methods[0] || null;
          });
        }
      } catch (err) {
        console.error("Failed to fetch shipping methods from db", err);
      } finally {
        if (isMounted) setIsLoadingShipping(false);
      }
    }

    loadShippingMethods();

    return () => {
      isMounted = false;
    };
  }, [totalPrice, shippingCountry, selectedCurrency?.countryCode]);

  // Shipping fee derived from the database-selected shipping method
  const shippingFee =
    items.length === 0
      ? 0
      : selectedShippingMethod
      ? selectedShippingMethod.isFree
        ? 0
        : selectedShippingMethod.price
      : 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        toggleCart,
        shippingMethods,
        selectedShippingMethod,
        setSelectedShippingMethod,
        shippingCountry,
        setShippingCountry,
        shippingFee,
        isLoadingShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
