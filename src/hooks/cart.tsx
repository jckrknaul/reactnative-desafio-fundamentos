import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (cart) {
        setProducts(JSON.parse(cart));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const existProduct = products.find(item => item.id === product.id);
      if (!existProduct) {
        setProducts([...products, { ...product, quantity: 1 }]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const updatedProds = products;
      const findIndexProduct = products.findIndex(prod => prod.id === id);

      if (findIndexProduct >= 0) {
        updatedProds[findIndexProduct].quantity += 1;

        setProducts([...updatedProds]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const updatedProds = products;
      const findIndexProduct = products.findIndex(prod => prod.id === id);

      if (findIndexProduct >= 0) {
        if (updatedProds[findIndexProduct].quantity > 1) {
          updatedProds[findIndexProduct].quantity -= 1;
        }

        setProducts([...updatedProds]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
