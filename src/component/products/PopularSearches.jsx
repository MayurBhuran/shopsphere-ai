
"use client";

import { TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

const popularSearches = [
  "Smartphones",
  "Laptops",
  "Beauty",
  "Furniture",
  "Watches",
];

export default function PopularSearches() {
  const router = useRouter();

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border bg-white p-4 shadow-lg">
      <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-700">
        <TrendingUp size={16} className="text-blue-600" />
        Popular Searches
      </h3>

      <div className="flex flex-wrap gap-2">
        {popularSearches.map((search) => (
          <button
            key={search}
            onClick={() =>
              router.push(`/search?q=${encodeURIComponent(search)}`)
            }
            className="rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-600"
          >
            {search}
          </button>
        ))}
      </div>
    </div>
  );
}
