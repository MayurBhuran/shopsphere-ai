"use client";

import { useState } from "react";
import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";
import { Heart, ShoppingCart } from "lucide-react";

export default function ProductActions({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);

  const cartItem = cart.find((item) => item.id === product.id);

  const alreadyInCart = cartItem?.quantity || 0;

  const availableStock = Math.max(0, product.stock - alreadyInCart); 

  const addToWishlist = useWishlistStore((state) => state.addToWishlist);

  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist,
  );

  const wishlist = useWishlistStore((state) => state.wishlist);
  const isWishlisted = wishlist.some((item) => item.id === product.id);

  // Add product to cart
  const handleAddToCart = () => {
  if (quantity > availableStock || availableStock <= 0) return;

  for (let i = 0; i < quantity; i++) {
    addToCart(product);
  }

  setAdded(true);
  setTimeout(() => setAdded(false), 1500);
};

  // Add or remove product from wishlist
  const handleWishlist = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }

    console.log("Wishlist updated:", useWishlistStore.getState().wishlist);
  };

  return (
    <div className="mt-6 space-y-5">
      {/* Quantity Selector */}
      {/* Quantity Selector */}
      <p className="text-sm text-gray-600">
  Available stock: {availableStock}
      </p>
      <div className="flex items-center gap-4">
        <span className="font-semibold">Quantity:</span>

        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="px-4 py-2 disabled:opacity-40"
          >
            −
          </button>

          <span className="px-4">{quantity}</span>

          <button
            onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
            disabled={quantity >= availableStock}
            className="px-4 py-2 disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      {/* Shopping Buttons */}
      <div className="flex flex-wrap gap-3">
        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={availableStock <= 0 || quantity > availableStock}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          <ShoppingCart size={18} />

          {product.stock <= 0
            ? "Out of Stock"
            : added
              ? "Added to Cart!"
              : "Add to Cart"}
        </button>

        {/* Add to Wishlist */}
        <button
          onClick={handleWishlist}
          className="flex items-center gap-2 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100"
        >
          <Heart
            size={18}
            className={isWishlisted ? "fill-red-500 text-red-500" : ""}
          />

          {isWishlisted ? "Remove Wishlist" : "Add to Wishlist"}
        </button>
      </div>
    </div>
  );
}
