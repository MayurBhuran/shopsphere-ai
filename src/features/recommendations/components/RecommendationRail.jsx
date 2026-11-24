
"use client";

import { useEffect, useRef } from "react";
import ProductCard from "@/component/products/ProductCard";
import useRecommendations from "@/features/recommendations/hooks/useRecommendations";
import { trackRecommendationEvent } from "@/services/recommendationAnalytics";

function getRecommendationReason(strategy, signals, referenceProduct) {
  const recentlyViewed = signals?.recentlyViewed || [];
  const wishlist = signals?.wishlist || [];
  const cart = signals?.cart || [];
  const preferences = signals?.preferences || {};

  switch (strategy) {
    case "Similar Products":
      return referenceProduct
        ? `Similar to ${referenceProduct.title}`
        : "Similar products selected for you";

    case "Trending Products":
      return "Popular products with strong customer ratings";

    case "Recently Viewed": {
      const product = recentlyViewed[0];
      return product?.title
        ? `Because you viewed ${product.title}`
        : "Based on your recently viewed products";
    }

    case "Category-Based": {
      const category = preferences.preferredCategories?.[0];

      return category
        ? `Based on your interest in ${category.replaceAll("-", " ")}`
        : "Based on categories in your shopping activity";
    }

    case "Price-Based":
      return preferences.minPrice !== undefined &&
        preferences.maxPrice !== undefined
        ? `Within your preferred price range ($${preferences.minPrice}–$${preferences.maxPrice})`
        : "Products near your shopping price range";

    case "Wishlist-Based": {
      const product = wishlist[0];
      return product?.title
        ? `Inspired by your wishlist: ${product.title}`
        : "Based on your wishlist";
    }

    case "Cart-Based": {
      const product = cart[0];
      return product?.title
        ? `Related to ${product.title} in your cart`
        : "Related to products in your cart";
    }

    case "Frequently Bought Together":
      return "Products that complement your shopping choices";

    case "Personalized For You":
      return "Selected using your shopping activity and preferences";

    default:
      return "Recommended for you";
  }
}

export default function RecommendationRail({
  title,
  strategy,
  products = [],
  limit = 8,
  description,
  referenceProduct = null,
}) {
  const {
    recommendations,
    signals,
    loading,
    error,
  } = useRecommendations({
    products,
    strategy,
    limit,
    referenceProduct,
  });

  const lastTrackedSignature = useRef("");

  useEffect(() => {
    if (!recommendations.length || !strategy) return;

    const signature = `${strategy}:${recommendations
      .map((product) => product.id)
      .join(",")}`;

    if (lastTrackedSignature.current === signature) return;

    lastTrackedSignature.current = signature;

    recommendations.forEach((product) => {
      trackRecommendationEvent({
        type: "impression",
        strategy,
        productId: product.id,
      });
    });
  }, [recommendations, strategy]);

  if (loading) {
    return (
      <section className="my-10">
        <h2 className="mb-5 text-2xl font-bold">{title}</h2>
        <p className="text-gray-500">
          Finding products for you...
        </p>
      </section>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  const reason = getRecommendationReason(
    strategy,
    signals,
    referenceProduct
  );

  return (
    <section className="my-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm text-gray-500">
            {description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {recommendations.map((product) => (
          <div key={product.id}>
            <p className="mb-2 text-xs font-medium text-blue-600">
              {reason}
            </p>

            <ProductCard
              product={product}
              recommendationStrategy={strategy}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
