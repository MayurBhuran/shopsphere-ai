
"use client";

import { useEffect, useState } from "react";
import { getProducts } from "@/services/productService";
import ProductDiscovery from "@/component/products/ProductDiscovery";
import RecommendationRail from "@/features/recommendations/components/RecommendationRail";

export default function ProductSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const allProducts = await getProducts();
        setProducts(allProducts);
      } catch (err) {
        console.error("Product loading error:", err);
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return (
      <section className="w-full max-w-7xl mx-auto px-6 py-16">
        <p className="text-center text-gray-500">
          Loading products...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full max-w-7xl mx-auto px-6 py-16">
        <p className="text-center text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10">
        <p className="text-blue-600 font-semibold">
          Our Collection
        </p>

        <h2 className="text-3xl font-bold text-gray-900 mt-2">
          Explore Products
        </h2>

        <p className="text-gray-500 mt-2">
          Discover products selected for you.
        </p>
      </div>

      {products.length === 0 ? (
        <p>Unable to load products. Please try again.</p>
      ) : (
        <>
          <ProductDiscovery products={products} />

          <RecommendationRail
            title="Recommended For You"
            description="Products selected based on your shopping activity."
            strategy="Personalized For You"
            products={products}
            limit={8}
          />

          <RecommendationRail
            title="Trending Products"
            description="Explore popular products from our collection."
            strategy="Trending Products"
            products={products}
            limit={8}
          />
        </>
      )}
    </section>
  );
}
