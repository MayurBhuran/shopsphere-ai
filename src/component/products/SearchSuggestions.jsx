
"use client";

import { useEffect, useState } from "react";
import { searchProducts } from "@/services/productService";
import { useRouter } from "next/navigation";

export default function SearchSuggestions({ query, onSelect }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const products = await searchProducts(query);
        setSuggestions(products.slice(0, 5));
      } catch (error) {
        console.error("Suggestion error:", error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  if (!query.trim()) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border bg-white p-3 shadow-lg">
      {loading && <p className="text-sm text-gray-500">Searching...</p>}

      {!loading && suggestions.length === 0 && (
        <p className="text-sm text-gray-500">No suggestions found</p>
      )}

      {!loading &&
        suggestions.map((product) => (
          <button
            key={product.id}
            onClick={() => {
              onSelect(product.title);
              router.push(`/search?q=${encodeURIComponent(product.title)}`);
            }}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-100"
          >
            {product.title}
          </button>
        ))}
    </div>
  );
}
