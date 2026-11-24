
"use client";

import { useEffect } from "react";

const STORAGE_KEY = "shopsphere-recently-viewed";
const MAX_RECENT_PRODUCTS = 10;

export default function TrackRecentlyViewed({ product }) {
  useEffect(() => {
    if (!product?.id) return;

    try {
      const storedProducts = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const recentProducts = Array.isArray(storedProducts)
        ? storedProducts
        : [];

      // Remove the product if it already exists
      const filteredProducts = recentProducts.filter(
        (item) => item.id !== product.id
      );

      // Add the current product at the beginning
      const updatedProducts = [
        {
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          category: product.category,
          rating: product.rating,
          stock: product.stock,
          brand: product.brand,
        },
        ...filteredProducts,
      ].slice(0, MAX_RECENT_PRODUCTS);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedProducts)
      );

      // Notify recommendation hooks about the updated activity
      window.dispatchEvent(
        new Event("shopsphere-signals-updated")
      );
    } catch (error) {
      console.error("Recently viewed tracking error:", error);
    }
  }, [product]);

  return null;
}
