
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useWishlistStore = create(
  persist(
    (set) => ({
      wishlist: [],

      addToWishlist: (product) =>
        set((state) => {
          const exists = state.wishlist.some(
            (item) => item.id === product.id
          );

          if (exists) return state;

          return {
            wishlist: [...state.wishlist, product],
          };
        }),

      removeFromWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.filter(
            (item) => item.id !== id
          ),
        })),

      clearWishlist: () => set({ wishlist: [] }),
    }),
    {
      name: "shopsphere-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useWishlistStore;
