import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    // const storagedCart = Buscar dados do localStorage

    // if (storagedCart) {
    //   return JSON.parse(storagedCart);
    // }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      api
        .get(`/products?id=${productId}`)
        .then(function (response) {
          const obj = response.data[0];

          const currentProductIndex = cart.findIndex(
            (product) => product.id === productId
          );

          switch (currentProductIndex) {
            case -1:
              obj.amount = 1;
              setCart([...cart, obj]);
              break;

            default:
              const updatedCart = [...cart];

              const currentProduct = updatedCart.find(
                (product) => product.id === productId
              );

              if (currentProduct) {
                currentProduct.amount += 1;
              }

              setCart(updatedCart);

              break;
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    } catch {
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updateCart = cart.filter((item) => item.id !== productId);
      setCart(updateCart);
    } catch {
      // TODO
    }
  };

  const updateProductAmount = ({ productId, amount }: UpdateProductAmount) => {
    try {
      const updatedCart = [...cart];

      const currentProduct = updatedCart.find(
        (product) => product.id === productId
      );

      if (currentProduct) {
        if (amount >= currentProduct.amount) {
          currentProduct.amount += 1;
        } else {
          currentProduct.amount += -1;
        }
      }

      setCart(updatedCart);
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
