
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set) => ({
      cart: [],
      savedForLater: [],


      addToCart: (product) =>
        set((state) => {
          const availableStock = Number(product.stock ?? 0);

          // Prevent adding out-of-stock products
          if (availableStock <= 0) {
            return state;
          }

          const existingProduct = state.cart.find(
            (item) => item.id === product.id
          );

          // Check stock before increasing quantity
          if (existingProduct) {
            if (existingProduct.quantity >= availableStock) {
              return state;
            }

            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          // Add new product
          return {
            cart: [
              ...state.cart,
              { ...product, quantity: 1 },
            ],
          };
        }),


      removeFromCart: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

        clearCart: () => set({ cart: [] }),


      increaseQuantity: (id) =>
        set((state) => ({
          cart: state.cart.map((item) => {
            if (item.id !== id) return item;

            const availableStock = Number(item.stock ?? 0);

            if (item.quantity >= availableStock) {
              return item;
            }

            return {
              ...item,
              quantity: item.quantity + 1,
            };
          }),
        })),


      decreaseQuantity: (id) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        })),

      updateProductPrice: (id, newPrice) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id
              ? { ...item, price: newPrice }
              : item
          ),
        })),

      saveForLater: (id) =>
        set((state) => {
          const item = state.cart.find((product) => product.id === id);

          if (!item) return state;

          return {
            cart: state.cart.filter((product) => product.id !== id),
            savedForLater: [
              ...state.savedForLater.filter((product) => product.id !== id),
              item,
            ],
          };
        }),

      moveToCart: (id) =>
        set((state) => {
          const item = state.savedForLater.find(
            (product) => product.id === id
          );

          if (!item || item.stock <= 0) return state;

          const existing = state.cart.find(
            (product) => product.id === id
          );

          const currentQuantity = existing?.quantity || 0;
          const availableStock = Number(item.stock);
          const quantityToAdd = Math.min(
            item.quantity,
            Math.max(0, availableStock - currentQuantity)
          );

          if (quantityToAdd <= 0) return state;

          return {
            savedForLater: state.savedForLater.filter(
              (product) => product.id !== id
            ),
            cart: existing
              ? state.cart.map((product) =>
                product.id === id
                  ? { ...product, quantity: product.quantity + quantityToAdd }
                  : product
              )
              : [
                ...state.cart,
                { ...item, quantity: quantityToAdd },
              ],
          };
        }),

      removeSavedItem: (id) =>
        set((state) => ({
          savedForLater: state.savedForLater.filter(
            (product) => product.id !== id
          ),
        })),

    }),

    {
      name: "shopsphere-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCartStore;
