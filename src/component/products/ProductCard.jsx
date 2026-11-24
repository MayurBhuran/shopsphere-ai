"use client";

import Link from "next/link";
import { ShoppingCart, Check, Heart } from "lucide-react";
import useWishlistStore from "@/store/wishlistStore";
import { useState } from "react";
import useCartStore from "@/store/cartStore";
import QuickView from "./QuickView";
import useCompareStore from "@/store/compareStore";
import { ArrowLeftRight } from "lucide-react";
import { trackRecommendationEvent } from "@/services/recommendationAnalytics";

export default function ProductCard({
  product,
  recommendationStrategy = null,
}) {
  const addToCart = useCartStore((state) => state.addToCart);

  const [added, setAdded] = useState(false);

  const addToWishlist = useWishlistStore((state) => state.addToWishlist);

  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist,
  );

  const isWishlisted = useWishlistStore((state) =>
    state.wishlist.some((item) => item.id === product.id),
  );

  const addToCompare = useCompareStore((state) => state.addToCompare);

  const compareProducts = useCompareStore((state) => state.compareProducts);

  const isCompared = compareProducts.some((item) => item.id === product.id);

  function handleWishlist() {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }

  function handleRecommendationClick() {
    if (!recommendationStrategy) return;

    trackRecommendationEvent({
      type: "click",
      strategy: recommendationStrategy,
      productId: product.id,
    });
  }

  function handleAddToCart() {
    const previousQuantity =
      useCartStore.getState().cart.find((item) => item.id === product.id)
        ?.quantity || 0;

    addToCart(product);

    const updatedQuantity =
      useCartStore.getState().cart.find((item) => item.id === product.id)
        ?.quantity || 0;

    if (recommendationStrategy && updatedQuantity > previousQuantity) {
      trackRecommendationEvent({
        type: "conversion",
        strategy: recommendationStrategy,
        productId: product.id,
      });
    }

    if (updatedQuantity > previousQuantity) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  }

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-lg transition">
      {/* Product Image */}
      <div className="relative h-48 w-full rounded-lg bg-gray-100 p-4">
        <Link
          href={`/product/${product.id}`}
          onClick={handleRecommendationClick}
        >
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-contain cursor-pointer"
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:scale-110 transition"
        >
          <Heart
            size={20}
            className={
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600"
            }
          />
        </button>
      </div>

      {/* Product Title */}
      <Link href={`/product/${product.id}`} onClick={handleRecommendationClick}>
        <h3 className="mt-4 truncate font-semibold text-gray-800 hover:text-blue-600 cursor-pointer">
          {product.title}
        </h3>
      </Link>

      <p className="mt-1 text-sm capitalize text-gray-500">
        {product.category}
      </p>

      {/* Price and Rating */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xl font-bold text-blue-600">
          ${product.price}
        </span>

        <span className="text-sm text-yellow-600">★ {product.rating}</span>
      </div>

      {/* Add to Cart */}
      <button
        onClick={handleAddToCart}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700 transition"
      >
        {added ? (
          <>
            <Check size={18} />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart size={18} />
            Add to Cart
          </>
        )}
      </button>
      <div className="mt-3">
        <QuickView product={product} />
      </div>

      <button
        onClick={() => addToCompare(product)}
        disabled={isCompared || (!isCompared && compareProducts.length >= 4)}
        className={`w-full mt-2 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${
          isCompared
            ? "bg-green-100 text-green-700 cursor-not-allowed"
            : compareProducts.length >= 4
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-100 text-gray-800 hover:bg-blue-100 hover:text-blue-700"
        }`}
      >
        <ArrowLeftRight size={16} />
        {isCompared
          ? "Added to Compare"
          : compareProducts.length >= 4
            ? "Compare Limit Reached"
            : "Add to Compare"}
      </button>
    </div>
  );
}
