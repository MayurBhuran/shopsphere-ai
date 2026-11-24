
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart } from "lucide-react";

import useWishlistStore from "@/store/wishlistStore";
import useCartStore from "@/store/cartStore";

import { getProducts } from "@/services/productService";
import RecommendationRail from "@/features/recommendations/components/RecommendationRail";

export default function WishlistPage() {
  const wishlist = useWishlistStore((state) => state.wishlist);

  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist
  );

  const addToCart = useCartStore((state) => state.addToCart);

  const [allProducts, setAllProducts] = useState([]);

  // Load products for recommendations
  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const products = await getProducts();

        if (isMounted) {
          setAllProducts(products);
        }
      } catch (error) {
        console.error("Wishlist recommendation error:", error);
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Move wishlist product to cart
  function handleMoveToCart(product) {
    if (product.stock <= 0) return;

    addToCart(product);
    removeFromWishlist(product.id);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-7xl mx-auto">

        {/* Wishlist Heading */}
        <div className="flex items-center gap-3 mb-8">
          <Heart className="text-red-500" size={30} />

          <h1 className="text-3xl font-bold text-gray-900">
            My Wishlist
          </h1>

          <span className="text-gray-500">
            ({wishlist.length})
          </span>
        </div>

        {/* Wishlist Products */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Heart size={55} className="mx-auto text-gray-400" />

            <h2 className="text-xl font-semibold mt-4">
              Your wishlist is empty
            </h2>

            <p className="text-gray-500 mt-2">
              Save your favourite products here!
            </p>

            <Link
              href="/"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {wishlist.map((product) => {
              const outOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-xl border p-4 shadow-sm"
                >
                  <div className="h-48 bg-gray-100 rounded-lg p-4">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <h2 className="font-semibold mt-4">
                    {product.title}
                  </h2>

                  <p className="text-blue-600 font-bold mt-2">
                    ${product.price}
                  </p>

                  <p
                    className={`text-sm mt-2 ${
                      outOfStock
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {outOfStock ? "Out of stock" : "In stock"}
                  </p>

                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={outOfStock}
                    className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} />
                    Move to Cart
                  </button>

                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="w-full mt-2 border border-red-300 text-red-500 py-2 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={17} />
                    Remove
                  </button>
                </div>
              );
            })}

          </div>
        )}

        {/* Wishlist-Based Recommendations */}
        {allProducts.length > 0 && wishlist.length > 0 && (
          <div className="mt-10">
            <RecommendationRail
              title="You May Also Like"
              description="Discover products related to your wishlist."
              strategy="Wishlist-Based"
              products={allProducts}
              limit={4}
            />
          </div>
        )}

      </div>
    </main>
  );
}
