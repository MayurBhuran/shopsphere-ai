
"use client";

import Link from "next/link";
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import useCartStore from "@/store/cartStore";
import { useState, useEffect } from "react";
import { getProductById, getProducts } from "@/services/productService";
import RecommendationRail from "@/features/recommendations/components/RecommendationRail";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const cart = useCartStore((state) => state.cart);
  const [allProducts, setAllProducts] = useState([]);

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const [productUpdates, setProductUpdates] = useState({});
  const [checkingProducts, setCheckingProducts] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");
  const [confirmedPrices, setConfirmedPrices] = useState({});

  const router = useRouter();

  const savedForLater = useCartStore(
    (state) => state.savedForLater
  );

  const saveForLater = useCartStore(
    (state) => state.saveForLater
  );

  const moveToCart = useCartStore(
    (state) => state.moveToCart
  );

  const removeSavedItem = useCartStore(
    (state) => state.removeSavedItem
  );

  // Load products for recommendation rail
  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        const products = await getProducts();

        if (isMounted) {
          setAllProducts(products);
        }
      } catch (error) {
        console.error("Recommendation products error:", error);
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleProceedToCheckout = async () => {
    const canProceed = await checkLatestProducts();

    if (canProceed) {
      router.push("/checkout");
    }
  };

  // Calculate subtotal
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Shipping: Free above $100, otherwise $10
  const shipping = subtotal >= 100 ? 0 : 10;

  // Simulated tax: 5%
  const tax = subtotal * 0.05;

  // Final total
  const totalPrice = subtotal + shipping + tax - discount;

  // Apply coupon
  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    const coupons = {
      SAVE10: 10,
      SAVE20: 20,
      WELCOME: 5,
    };

    if (!coupons[code]) {
      setDiscount(0);
      setAppliedCoupon("");
      setCouponMessage("Invalid coupon code!");
      return;
    }

    setDiscount((subtotal * coupons[code]) / 100);
    setAppliedCoupon(code);
    setCouponMessage(`${code} applied successfully!`);
  };

  // Remove coupon
  const removeCoupon = () => {
    setCoupon("");
    setDiscount(0);
    setAppliedCoupon("");
    setCouponMessage("");
  };

  // Check latest prices and stock
  const checkLatestProducts = async () => {
    setCheckingProducts(true);
    setCheckMessage("");

    try {
      const results = await Promise.all(
        cart.map(async (item) => {
          try {
            const latestProduct = await getProductById(item.id);

            return {
              id: item.id,
              latestPrice: latestProduct.price,
              latestStock: latestProduct.stock,
              unavailable: latestProduct.stock <= 0,
            };
          } catch (error) {
            console.error(`Product ${item.id} check failed:`, error);

            return {
              id: item.id,
              unavailable: true,
            };
          }
        })
      );

      const updates = {};

      results.forEach((result) => {
        updates[result.id] = result;
      });

      setProductUpdates(updates);

      const hasUnavailable = results.some(
        (item) => item.unavailable
      );

      const hasPriceChange = results.some((item) => {
        if (item.unavailable) return false;

        const cartItem = cart.find(
          (product) => product.id === item.id
        );

        return item.latestPrice !== cartItem?.price;
      });

      if (hasUnavailable) {
        setCheckMessage(
          "Some products are no longer available."
        );
      } else if (hasPriceChange) {
        setCheckMessage(
          "Some product prices have changed. Please review them."
        );
      } else {
        setCheckMessage(
          "All product prices and availability are up to date!"
        );
      }

      return !hasUnavailable && !hasPriceChange;
    } catch (error) {
      console.error("Product checking failed:", error);
      setCheckMessage(
        "Unable to check products. Please try again."
      );
      return false;
    } finally {
      setCheckingProducts(false);
    }
  };

  // Confirm updated product price
  const confirmPriceChange = (itemId, newPrice) => {
    useCartStore.getState().updateProductPrice(itemId, newPrice);

    setConfirmedPrices((prev) => ({
      ...prev,
      [itemId]: true,
    }));
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <ShoppingBag
              size={55}
              className="mx-auto text-gray-400"
            />

            <h2 className="text-xl font-semibold mt-4">
              Your cart is empty
            </h2>

            <p className="text-gray-500 mt-2">
              Add some products to start shopping!
            </p>

            <Link
              href="/"
              className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Cart Products */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-5"
                >
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-28 h-28 object-contain bg-gray-100 rounded-lg"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {item.title}
                    </h3>

                    <p className="text-blue-600 font-bold mt-2">
                      ${item.price}
                    </p>

                    {productUpdates[item.id]?.unavailable && (
                      <p className="text-red-600 text-sm mt-2">
                        This product is no longer available.
                      </p>
                    )}

                    {productUpdates[item.id] &&
                      !productUpdates[item.id].unavailable &&
                      (
                        productUpdates[item.id].latestPrice !== item.price ||
                        confirmedPrices[item.id]
                      ) && (
                        <div className="mt-3 rounded-lg bg-orange-50 border border-orange-200 p-3">
                          {confirmedPrices[item.id] ? (
                            <p className="text-green-600 text-sm font-semibold">
                              New price accepted successfully!
                            </p>
                          ) : (
                            <>
                              <p className="text-sm text-orange-700 font-semibold">
                                Product price changed!
                              </p>

                              <p className="text-sm mt-1">
                                Previous price: ${item.price}
                              </p>

                              <p className="text-sm">
                                New price: ${productUpdates[item.id].latestPrice}
                              </p>

                              <button
                                type="button"
                                onClick={() =>
                                  confirmPriceChange(
                                    item.id,
                                    productUpdates[item.id].latestPrice
                                  )
                                }
                                className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
                              >
                                Accept New Price
                              </button>
                            </>
                          )}
                        </div>
                      )}

                    {/* Quantity and Cart Actions */}
                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => decreaseQuantity(item.id)}
                        className="border rounded p-1"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>

                      <div className="text-center">
                        <span>{item.quantity}</span>
                      </div>

                      {item.quantity >= item.stock && (
                        <p className="text-xs text-orange-600 mt-2">
                          Maximum available stock reached.
                        </p>
                      )}

                      <button
                        onClick={() => increaseQuantity(item.id)}
                        disabled={
                          productUpdates[item.id]?.unavailable ||
                          item.quantity >= (
                            productUpdates[item.id]?.latestStock ?? item.stock
                          )
                        }
                        className="border rounded p-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>

                      <button
                        onClick={() => saveForLater(item.id)}
                        className="text-blue-600 text-sm ml-2 hover:underline"
                      >
                        Save for Later
                      </button>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 ml-3"
                        aria-label="Remove product"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <p className="font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm h-fit">
              <h2 className="text-xl font-bold mb-6">
                Order Summary
              </h2>

              <button
                type="button"
                onClick={checkLatestProducts}
                disabled={checkingProducts}
                className="w-full border border-blue-600 text-blue-600 py-2 rounded-lg mb-5"
              >
                {checkingProducts
                  ? "Checking..."
                  : "Check Latest Prices & Stock"}
              </button>

              {checkMessage && (
                <p className="text-sm text-green-600 mb-4">
                  {checkMessage}
                </p>
              )}

              <div className="flex justify-between mb-4 text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between mb-4 text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-600 font-semibold" : ""}>
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between mb-4 text-gray-600">
                <span>Estimated Tax (5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              {/* Coupon */}
              <div className="mt-5">
                <label className="block text-sm font-semibold mb-2">
                  Coupon Code
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter coupon"
                    disabled={!!appliedCoupon}
                    className="min-w-0 flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    onClick={applyCoupon}
                    disabled={!!appliedCoupon}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                  >
                    Apply
                  </button>
                </div>

                {couponMessage && (
                  <p
                    className={`text-sm mt-2 ${
                      appliedCoupon ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {couponMessage}
                  </p>
                )}

                {appliedCoupon && (
                  <button
                    onClick={removeCoupon}
                    className="text-red-500 text-sm mt-2 underline"
                  >
                    Remove Coupon
                  </button>
                )}
              </div>

              <div className="flex justify-between mt-4 text-green-600">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between font-bold text-lg">
                <span>Grand Total</span>
                <span className="text-blue-600">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                disabled={checkingProducts || cart.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {checkingProducts
                  ? "Verifying Products..."
                  : "Proceed to Checkout"}
              </button>

              <Link
                href="/"
                className="block text-center text-blue-600 mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Saved for Later */}
      {savedForLater.length > 0 && (
        <div className="max-w-6xl mx-auto mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-5">
            Saved for Later ({savedForLater.length})
          </h2>

          <div className="space-y-4">
            {savedForLater.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center gap-4 border-b pb-4"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-20 h-20 object-contain bg-gray-100 rounded-lg"
                />

                <div className="flex-1">
                  <h3 className="font-semibold">{item.title}</h3>

                  <p className="text-blue-600 font-bold">
                    ${item.price}
                  </p>

                  <p className="text-sm text-gray-500">
                    {item.stock > 0
                      ? `In Stock (${item.stock})`
                      : "Out of Stock"}
                  </p>
                </div>

                <button
                  onClick={() => moveToCart(item.id)}
                  disabled={item.stock <= 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-300"
                >
                  Move to Cart
                </button>

                <button
                  onClick={() => removeSavedItem(item.id)}
                  className="text-red-500"
                  aria-label="Remove saved product"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cart-Based Recommendations */}
      {allProducts.length > 0 && (
        <div className="max-w-6xl mx-auto">
          <RecommendationRail
            title="You May Also Like"
            description="Products selected based on items in your shopping cart."
            strategy="Cart-Based"
            products={allProducts}
            limit={4}
          />
        </div>
      )}
    </main>
  );
}
