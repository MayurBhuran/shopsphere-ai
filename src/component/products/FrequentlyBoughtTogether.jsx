
"use client";

import { useEffect, useMemo, useState } from "react";
import useCartStore from "@/store/cartStore";
import { ShoppingCart } from "lucide-react";

export default function FrequentlyBoughtTogether({
  product,
  products = [],
}) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");

  const suggestions = useMemo(() => {
    const availableProducts = products.filter(
      (item) => String(item.id) !== String(product.id)
    );

    const differentCategory = availableProducts.filter(
      (item) => item.category !== product.category
    );

    const sameCategory = availableProducts.filter(
      (item) => item.category === product.category
    );

    return [...differentCategory, ...sameCategory].slice(0, 2);
  }, [products, product.id, product.category]);

  const allProducts = useMemo(
    () => [product, ...suggestions],
    [product, suggestions]
  );

  useEffect(() => {
    setSelected(allProducts.map((item) => String(item.id)));
  }, [allProducts]);

  const totalPrice = allProducts
    .filter((item) => selected.includes(String(item.id)))
    .reduce((total, item) => total + Number(item.price || 0), 0);

  const toggleProduct = (id) => {
    const productId = String(id);

    setSelected((previous) =>
      previous.includes(productId)
        ? previous.filter((item) => item !== productId)
        : [...previous, productId]
    );

    setMessage("");
  };

  const handleAddSelected = () => {
    const selectedProducts = allProducts.filter((item) =>
      selected.includes(String(item.id))
    );

    if (selectedProducts.length === 0) {
      setMessage("Please select at least one product.");
      return;
    }

    const unavailable = selectedProducts.filter(
      (item) => Number(item.stock ?? 0) <= 0
    );

    if (unavailable.length > 0) {
      setMessage(
        `Out of stock: ${unavailable.map((item) => item.title).join(", ")}`
      );
      return;
    }

    selectedProducts.forEach((item) => addToCart(item));

    setMessage(`${selectedProducts.length} selected product(s) added to cart.`);
  };

  return (
    <section className="mt-12 rounded-xl border bg-white p-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Frequently Bought Together
      </h2>

      <p className="mt-2 text-gray-500">
        Select products to add to your shopping cart.
      </p>

      {suggestions.length === 0 ? (
        <p className="mt-6 text-gray-500">
          No other catalogue products were received. Please check that
          ProductDetailsClient passes the complete products list.
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {allProducts.map((item) => {
              const inStock = Number(item.stock ?? 0) > 0;

              return (
                <label
                  key={item.id}
                  className="cursor-pointer rounded-lg border p-4 transition hover:border-blue-500"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(String(item.id))}
                    onChange={() => toggleProduct(item.id)}
                    className="mb-3"
                  />

                  <img
                    src={
                      item.thumbnail ||
                      item.images?.[0] ||
                      "/placeholder.png"
                    }
                    alt={item.title}
                    className="h-32 w-full object-contain"
                  />

                  <h3 className="mt-3 font-semibold text-gray-800">
                    {item.title}
                  </h3>

                  <p className="mt-2 font-bold text-blue-600">
                    ${Number(item.price || 0).toFixed(2)}
                  </p>

                  <p className={`mt-1 text-xs ${
                    inStock ? "text-green-600" : "text-red-600"
                  }`}>
                    {inStock ? "In Stock" : "Out of Stock"}
                  </p>
                </label>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Combined total</p>
              <p className="text-2xl font-bold text-blue-600">
                ${totalPrice.toFixed(2)}
              </p>
            </div>

            <button
              onClick={handleAddSelected}
              disabled={selected.length === 0}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
            >
              <ShoppingCart size={18} />
              Add Selected to Cart
            </button>
          </div>

          {message && (
            <p className="mt-4 text-sm text-blue-600" role="status">
              {message}
            </p>
          )}
        </>
      )}
    </section>
  );
}
