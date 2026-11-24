
import { create } from "zustand";

const useCompareStore = create((set) => ({
  compareProducts: [],

  addToCompare: (product) =>
    set((state) => {
      const alreadyExists = state.compareProducts.some(
        (item) => item.id === product.id
      );

      if (alreadyExists) {
        return state;
      }

      if (state.compareProducts.length >= 4) {
        return state;
      }

      return {
        compareProducts: [...state.compareProducts, product],
      };
    }),

  removeFromCompare: (id) =>
    set((state) => ({
      compareProducts: state.compareProducts.filter(
        (item) => item.id !== id
      ),
    })),

  clearCompare: () => set({ compareProducts: [] }),
}));

export default useCompareStore;
