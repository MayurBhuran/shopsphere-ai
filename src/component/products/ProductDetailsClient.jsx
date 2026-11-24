
"use client";

import { useEffect, useState } from "react";

import ProductGallery from "@/component/products/ProductGallery";
import ProductActions from "@/component/products/ProductActions";
import ProductInfoTabs from "@/component/products/ProductInfoTabs";
import ProductReviews from "@/component/products/ProductReviews";
import RelatedProducts from "@/component/products/RelatedProducts";
import FrequentlyBoughtTogether from "@/component/products/FrequentlyBoughtTogether";
import TrackRecentlyViewed from "@/component/products/TrackRecentlyViewed";

import RecommendationRail from "@/features/recommendations/components/RecommendationRail";

export default function ProductDetailsClient({
  productId,
  apiProducts = [],
}) {
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedProducts = JSON.parse(
        localStorage.getItem("shopsphere-admin-products") || "[]"
      );

      const adminProducts = Array.isArray(storedProducts)
        ? storedProducts
        : [];

      const adminIds = new Set(
        adminProducts.map((item) => String(item.id))
      );

      const combinedProducts = [
        ...adminProducts,
        ...apiProducts.filter(
          (item) => !adminIds.has(String(item.id))
        ),
      ];

      const selectedProduct = combinedProducts.find(
        (item) => String(item.id) === String(productId)
      );

      setAllProducts(combinedProducts);
      setProduct(selectedProduct || null);
    } catch (error) {
      console.error("Product loading error:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [productId, apiProducts]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold">Product Not Found</h1>
        <p className="mt-2 text-gray-500">
          The product you are looking for is unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <TrackRecentlyViewed product={product} />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <ProductGallery product={product} />

        <div>
          <p className="capitalize text-gray-500">
            {product.category}
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {product.title}
          </h1>

          <p className="mt-3 text-yellow-600">
            ⭐ {product.rating || 0} / 5
          </p>

          <p className="mt-5 text-3xl font-bold text-blue-600">
            ${Number(product.price || 0).toFixed(2)}
          </p>

          <p
            className={`mt-3 ${
              Number(product.stock || 0) > 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {Number(product.stock || 0) > 0
              ? `In Stock (${product.stock} available)`
              : "Out of Stock"}
          </p>

          <h2 className="mt-6 text-xl font-semibold">
            Product Description
          </h2>

          <p className="mt-2 leading-7 text-gray-600">
            {product.description}
          </p>

          <p className="mt-5 text-sm text-gray-500">
            Brand: {product.brand || "Not specified"}
          </p>

          <ProductActions product={product} />
          <ProductInfoTabs product={product} />
          <ProductReviews product={product} />
        </div>
      </div>

      <RelatedProducts
        product={product}
        products={allProducts}
      />

     <FrequentlyBoughtTogether
  key={product.id}
  product={product}
  products={allProducts}
/>

      {allProducts.length > 0 && (
        <>
          <RecommendationRail
            title="Similar Products"
            description={`Products similar to ${product.title}.`}
            strategy="Similar Products"
            products={allProducts}
            referenceProduct={product}
            limit={4}
          />

          <RecommendationRail
            title="Recommended For You"
            description="Products selected based on your shopping activity."
            strategy="Personalized For You"
            products={allProducts}
            limit={4}
          />
        </>
      )}
    </div>
  );
}
