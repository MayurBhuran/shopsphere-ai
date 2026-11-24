
"use client";

import ProductCard from "@/component/products/ProductCard";

export default function RelatedProducts({ product, products = [] }) {
  const relatedProducts = products
    .filter(
      (item) =>
        item.category === product.category &&
        String(item.id) !== String(product.id)
    )
    .slice(0, 4);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="mb-2 text-2xl font-bold text-gray-900">
        You May Also Look for
      </h2>

      <p className="mb-6 text-gray-500">
        More products from the same category
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}
