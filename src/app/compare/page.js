
"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Trash2, ArrowLeftRight } from "lucide-react";
import useCompareStore from "@/store/compareStore";

export default function ComparePage() {
  const compareProducts = useCompareStore(
    (state) => state.compareProducts
  );

  const removeFromCompare = useCompareStore(
    (state) => state.removeFromCompare
  );

  const clearCompare = useCompareStore(
    (state) => state.clearCompare
  );

  if (compareProducts.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <ArrowLeftRight size={55} className="text-gray-400 mb-4" />

        <h1 className="text-2xl font-bold text-gray-900">
          No Products to Compare
        </h1>

        <p className="text-gray-500 mt-2">
          Add products from the collection to compare them.
        </p>

        <Link
          href="/"
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  const lowestPrice = Math.min(
    ...compareProducts.map((product) => product.price)
  );

  const highestRating = Math.max(
    ...compareProducts.map((product) => product.rating || 0)
  );

  const comparisonRows = [
    {
      label: "Price",
      value: (p) => `$${p.price}`,
      isBest: (p) => p.price === lowestPrice,
    },
    {
      label: "Rating",
      value: (p) => `⭐ ${p.rating ?? "N/A"}`,
      isBest: (p) =>
        p.rating != null && p.rating === highestRating,
    },
    {
      label: "Brand",
      value: (p) => p.brand || "Not specified",
    },
    {
      label: "Category",
      value: (p) => p.category || "Not specified",
    },
    {
      label: "Availability",
      value: (p) =>
        p.stock > 0 ? `In Stock (${p.stock})` : "Out of Stock",

      isAvailable: (p) => p.stock > 0,
    },
    {
      label: "Discount",
      value: (p) => `${p.discountPercentage ?? 0}%`,
    },
    {
      label: "Description",
      value: (p) => p.description || "Not available",
    },
    {
      label: "Warranty",
      value: (p) => p.warrantyInformation || "Not specified",
    },
    {
      label: "Shipping",
      value: (p) => p.shippingInformation || "Not specified",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-blue-600 font-semibold">
            Product Comparison
          </p>

          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Compare Products
          </h1>

          <p className="text-gray-500 mt-2">
            Comparing {compareProducts.length} of 4 products
          </p>
        </div>

        <button
          onClick={clearCompare}
          className="flex items-center gap-2 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50"
        >
          <Trash2 size={17} />
          Clear All
        </button>
      </div>

      {compareProducts.length < 2 ? (
        <div className="border rounded-xl p-10 text-center">
          <ArrowLeftRight
            size={40}
            className="mx-auto text-blue-500 mb-4"
          />

          <h2 className="text-xl font-bold text-gray-900">
            Select at least 2 products
          </h2>

          <p className="text-gray-500 mt-2">
            You have selected {compareProducts.length} product.
            Add one more product to compare.
          </p>

          <Link
            href="/"
            className="inline-block mt-5 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Add More Products
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[650px] border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left text-gray-700 w-40">
                  Features
                </th>

                {compareProducts.map((product) => (
                  <th
                    key={product.id}
                    className="p-4 text-center border-l border-gray-200"
                  >
                    <div className="relative">
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                        aria-label={`Remove ${product.title}`}
                      >
                        <X size={16} />
                      </button>

                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        width={140}
                        height={140}
                        unoptimized
                        className="h-28 w-28 object-contain mx-auto"
                      />

                      <p className="font-semibold text-gray-900 mt-3">
                        {product.title}
                      </p>

                      <Link
                        href={`/product/${product.id}`}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {comparisonRows.map((row) => (
                <tr
                  key={row.label}
                  className="border-t border-gray-200"
                >
                  <td className="p-4 font-semibold text-gray-700 bg-gray-50">
                    {row.label}
                  </td>

                  {compareProducts.map((product) => (
                    <td
                      key={product.id}
                      className="p-4 text-center text-sm text-gray-600 border-l border-gray-200"
                    >
                      {row.label === "Availability" ? (
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${row.isAvailable(product)
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          {row.value(product)}
                        </span>
                      ) : (
                        <span
                          className={
                            row.isBest?.(product)
                              ? "font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full"
                              : ""
                          }
                        >
                          {row.value(product)}
                        </span>
                      )}

                      {row.isBest?.(product) && (
                        <span className="block text-xs text-green-600 mt-2">
                          Best Price
                        </span>
                      )}
                      {row.isBest?.(product) && (
                        <span className="block text-xs text-green-600 mt-2">
                          {row.label === "Price" ? "Best Price" : "Highest Rating"}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          + Add More Products
        </Link>

        <button
          onClick={clearCompare}
          className="border border-red-300 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition"
        >
          Clear Comparison
        </button>
      </div>

    </main>
  );
}
