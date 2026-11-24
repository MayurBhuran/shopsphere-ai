
"use client";

import { useState } from "react";
import { X, ShoppingCart, Heart, Eye } from "lucide-react";
import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";

export default function QuickView({ product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);
  const addToWishlist = useWishlistStore(
    (state) => state.addToWishlist
  );

  const handleAddToCart = () => {
    if (product.stock <= 0) return;

    addToCart(product);
    setAdded(true);

    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = () => {
    addToWishlist(product);
  };

  return (
    <>
      {/* Quick View Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-600 hover:text-white"
      >
        <Eye size={17} />
        Quick View
      </button>

      {/* Popup */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close quick view"
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-2 hover:bg-gray-200"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Product Image */}
              <div className="flex min-h-64 items-center justify-center rounded-xl bg-gray-50 p-6">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="max-h-64 w-full object-contain"
                />
              </div>

              {/* Product Details */}
              <div className="pt-5">
                <p className="text-sm capitalize text-gray-500">
                  {product.category}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-gray-900">
                  {product.title}
                </h2>

                <p className="mt-3 text-yellow-500">
                  ★ {product.rating} / 5
                </p>

                <p className="mt-5 text-3xl font-bold text-blue-600">
                  ${product.price}
                </p>

                <p className="mt-3 text-sm text-green-600">
                  {product.stock > 0
                    ? `${product.stock} items available`
                    : "Out of Stock"}
                </p>

                <p className="mt-5 leading-7 text-gray-600">
                  {product.description}
                </p>

                {/* Action Buttons */}
                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    <ShoppingCart size={18} />
                    {added ? "Added!" : "Add to Cart"}
                  </button>

                  <button
                    onClick={handleWishlist}
                    className="flex items-center gap-2 rounded-lg border px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    <Heart size={18} />
                    Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
