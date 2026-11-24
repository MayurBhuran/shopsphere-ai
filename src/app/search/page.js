
import { Suspense } from "react";
import { searchProducts } from "@/services/productService";
import ProductCard from "@/component/products/ProductCard";
import Link from "next/link";

async function SearchResults({ searchParams }) {
  const params = await searchParams;
  const query = params?.q || "";

  let products = [];
  let error = false;

  if (query.trim()) {
    try {
      products = await searchProducts(query);
    } catch (err) {
      console.error("Search failed:", err);
      error = true;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">
        Search Results
      </h1>

      <p className="text-gray-500 mb-8">
        Results for: "{query}"
      </p>

      {error ? (
        <p className="text-red-500">
          Unable to load products. Please try again.
        </p>
      ) : products.length > 0 ? (
        <>
          <p className="mb-5 text-gray-500">
            {products.length} products found
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold">
            No products found
          </h2>

          <Link
            href="/"
            className="text-blue-600 mt-4 inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}

export default function SearchPage({ searchParams }) {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16">
          Loading search results...
        </div>
      }
    >
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}
