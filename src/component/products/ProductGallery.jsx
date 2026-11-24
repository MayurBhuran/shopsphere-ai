
"use client";

import { useState } from "react";

export default function ProductGallery({ product }) {
  const images = product.images?.length
    ? product.images
    : [product.thumbnail];

  const [selectedImage, setSelectedImage] = useState(
    images[0]
  );

  return (
    <div>
      {/* Main Product Image */}
      <div className="bg-gray-100 rounded-xl p-6">
        <img
          src={selectedImage}
          alt={product.title}
          className="w-full h-96 object-contain"
        />
      </div>

      {/* Product Thumbnails */}
      <div className="flex gap-3 mt-4 flex-wrap">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(image)}
            className={`border-2 rounded-lg p-2 w-20 h-20 ${
              selectedImage === image
                ? "border-blue-600"
                : "border-gray-200"
            }`}
          >
            <img
              src={image}
              alt={`${product.title} image ${index + 1}`}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
