
"use client";

import { useEffect, useState } from "react";
import { Clock, X, Trash2 } from "lucide-react";

export default function RecentSearches({ onSelect }) {
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const savedSearches = JSON.parse(
      localStorage.getItem("shopsphere-recent-searches") || "[]"
    );

    setRecentSearches(savedSearches);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("shopsphere-recent-searches");
    setRecentSearches([]);
  };

  const removeSearch = (search) => {
    const updatedSearches = recentSearches.filter(
      (item) => item !== search
    );

    localStorage.setItem(
      "shopsphere-recent-searches",
      JSON.stringify(updatedSearches)
    );

    setRecentSearches(updatedSearches);
  };

  if (recentSearches.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-gray-700">
          <Clock size={16} />
          Recent Searches
        </h3>

        <button
          onClick={clearHistory}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
        >
          <Trash2 size={14} />
          Clear all
        </button>
      </div>

      {recentSearches.map((search) => (
        <div
          key={search}
          className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-gray-100"
        >
          <button
            onClick={() => onSelect(search)}
            className="flex-1 text-left text-sm text-gray-700"
          >
            {search}
          </button>

          <button
            onClick={() => removeSearch(search)}
            aria-label={`Remove ${search}`}
            className="text-gray-400 hover:text-red-500"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
