"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import ProductCard from "@/component/products/ProductCard";
import { Filter, RotateCcw, SlidersHorizontal } from "lucide-react";

export default function ProductDiscovery({ products }) {
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Get unique product categories
  const categories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ].sort();

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category !== "all") {
      result = result.filter((product) => product.category === category);
    }

    if (minPrice !== "") {
      result = result.filter((product) => product.price >= Number(minPrice));
    }

    if (maxPrice !== "") {
      result = result.filter((product) => product.price <= Number(maxPrice));
    }

    result = result.filter((product) => product.rating >= Number(minRating));

    if (inStockOnly) {
      result = result.filter((product) => product.stock > 0);
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, category, minPrice, maxPrice, minRating, inStockOnly, sortBy]);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const startIndex = (currentPage - 1) * productsPerPage;

  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + productsPerPage,
  );

  // Reset all filters
  const resetFilters = () => {
    setCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("0");
    setInStockOnly(false);
    setSortBy("default");
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [category, minPrice, maxPrice, minRating, inStockOnly, sortBy]);

  return (
    <div className="w-full">
      {/* Filter Panel */}
      <div className="mb-10 rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50 p-6 shadow-lg shadow-blue-100/50">
        {/* Filter Heading */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
              <SlidersHorizontal size={23} />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                Discover Products
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Find exactly what you're looking for.
              </p>
            </div>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 shadow-sm transition-all duration-200 hover:bg-blue-600 hover:text-white"
          >
            <RotateCcw size={16} />
            Clear All Filters
          </button>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item.replaceAll("-", " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Minimum Price */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Minimum Price ($)
            </label>

            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Enter minimum price"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* Maximum Price */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Maximum Price ($)
            </label>

            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Enter maximum price"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Minimum Rating
            </label>

            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="0">All Ratings</option>
              <option value="3">3 Stars & Above</option>
              <option value="4">4 Stars & Above</option>
              <option value="4.5">4.5 Stars & Above</option>
            </select>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              id="inStock"
              className="h-5 w-5 cursor-pointer accent-blue-600"
            />

            <label
              htmlFor="inStock"
              className="cursor-pointer text-sm font-semibold text-gray-700"
            >
              In Stock Only
            </label>
          </div>

          {/* Sorting */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Sort By
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm outline-none transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="default">Default Sorting</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Count */}
      <p className="mb-6 text-sm text-gray-600">
  Showing {filteredProducts.length === 0 ? 0 : startIndex + 1}
  {" - "}
  {Math.min(startIndex + productsPerPage, filteredProducts.length)}
  {" of "}
  {filteredProducts.length} products
</p>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
          <h3 className="text-xl font-bold text-gray-800">No Products Found</h3>

          <p className="mt-2 text-gray-500">
            Try changing your filters to find more products.
          </p>

          <button
            onClick={resetFilters}
            className="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {currentProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-10 w-10 rounded-lg border text-sm font-semibold transition ${
                  currentPage === page
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600"
                }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
            className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
