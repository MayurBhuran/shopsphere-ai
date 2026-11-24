"use client";

import { useEffect } from "react";
import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";

export default function StoreSync() {
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "shopsphere-cart") {
        useCartStore.persist.rehydrate();
      }

      if (event.key === "shopsphere-wishlist") {
        useWishlistStore.persist.rehydrate();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return null;
}