
"use client";

import { useState } from "react";

export default function ProductInfoTabs({ product }) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="mt-10 border rounded-xl p-6">
      {/* Tab Buttons */}
      <div className="flex gap-6 border-b">
        <button
          onClick={() => setActiveTab("description")}
          className={`pb-3 font-semibold ${
            activeTab === "description"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Description
        </button>

        <button
          onClick={() => setActiveTab("specifications")}
          className={`pb-3 font-semibold ${
            activeTab === "specifications"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Specifications
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-5">
        {activeTab === "description" ? (
          <p className="text-gray-600 leading-7">
            {product.description}
          </p>
        ) : (
          <div className="space-y-3 text-gray-700">
            <p><strong>Brand:</strong> {product.brand || "Not specified"}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>SKU:</strong> {product.sku || "Not specified"}</p>
            <p><strong>Weight:</strong> {product.weight ?? "Not specified"}</p>
            <p>
              <strong>Dimensions:</strong>{" "}
              {product.dimensions
                ? `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth}`
                : "Not specified"}
            </p>
            <p>
              <strong>Warranty:</strong>{" "}
              {product.warrantyInformation || "Not specified"}
            </p>
            <p>
              <strong>Shipping:</strong>{" "}
              {product.shippingInformation || "Not specified"}
            </p>
            <p>
              <strong>Return Policy:</strong>{" "}
              {product.returnPolicy || "Not specified"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
