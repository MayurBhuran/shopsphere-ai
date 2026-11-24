
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Banknote,
  ShieldCheck,
  ShoppingBag,
  CheckCircle,
} from "lucide-react";

import useCartStore from "@/store/cartStore";

export default function PaymentPage() {
  const router = useRouter();

  const cart = useCartStore((state) => state.cart);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const placingOrder = useRef(false);

  // Calculate order amount
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  // Load checkout details
  useEffect(() => {
    if (placingOrder.current) return;

    const savedAddress = localStorage.getItem(
      "shopsphere-delivery-address"
    );

    const savedUser = localStorage.getItem(
      "shopsphere-current-user"
    );

    if (!savedUser) {
      router.replace("/login");
      return;
    }

    if (!savedAddress || cart.length === 0) {
      router.replace("/checkout");
      return;
    }

    try {
      setAddress(JSON.parse(savedAddress));
      setLoading(false);
    } catch (error) {
      console.error("Address loading failed:", error);
      router.replace("/checkout");
    }
  }, [cart.length, router]);

  // Place order
  const handlePlaceOrder = () => {
    if (placingOrder.current || submitting) return;

    if (!address || cart.length === 0) {
      alert("Please complete your checkout details.");
      return;
    }

    try {
      const currentUser = JSON.parse(
        localStorage.getItem("shopsphere-current-user") || "null"
      );

      if (!currentUser) {
        router.push("/login");
        return;
      }

      placingOrder.current = true;
      setSubmitting(true);

      // Create order and delivery dates
      const createdAt = new Date();

      const estimatedDelivery = new Date(createdAt);
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

      const order = {
        id: `SS${Date.now()}`,
        userId: currentUser.id,
        items: cart.map((item) => ({ ...item })),
        address: { ...address },
        paymentMethod,
        subtotal,
        shipping,
        tax,
        total,

        // Order tracking information
        status: "Order Placed",
        createdAt: createdAt.toISOString(),
        estimatedDeliveryAt: estimatedDelivery.toISOString(),

        // Initial tracking history
        statusHistory: [
          {
            status: "Order Placed",
            timestamp: createdAt.toISOString(),
          },
        ],
      };

      const existingOrders = JSON.parse(
        localStorage.getItem("shopsphere-orders") || "[]"
      );

      if (!Array.isArray(existingOrders)) {
        throw new Error("Invalid order history.");
      }

      // Save order history
      localStorage.setItem(
        "shopsphere-orders",
        JSON.stringify([order, ...existingOrders])
      );

      // Save latest order
      localStorage.setItem(
        "shopsphere-last-order",
        JSON.stringify(order)
      );

      // Clear cart directly through Zustand
      useCartStore.setState({ cart: [] });

      // Navigate to success page
      router.push("/checkout/success");

    } catch (error) {
      console.error("Order placement failed:", error);

      placingOrder.current = false;
      setSubmitting(false);

      alert("Unable to place your order. Please try again.");
    }
  };

  if (loading || !address) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading payment details...
      </div>
    );
  }

  const methods = [
    {
      id: "cod",
      title: "Cash on Delivery",
      description: "Pay when your order arrives",
      icon: Banknote,
    },
    {
      id: "upi",
      title: "UPI Payment",
      description: "Demo UPI payment selection",
      icon: Smartphone,
    },
    {
      id: "card",
      title: "Credit / Debit Card",
      description: "Demo card payment selection",
      icon: CreditCard,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="max-w-6xl mx-auto">

        <Link
          href="/checkout"
          className="inline-flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-800"
        >
          <ArrowLeft size={18} />
          Back to Delivery Address
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">
          Payment Selection
        </h1>

        <p className="text-gray-500 mt-2 mb-8">
          Choose your preferred simulated payment method.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Payment Methods */}
          <section className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6 sm:p-8">

            <div className="flex items-center gap-3 mb-7">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                <CreditCard size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Select Payment Method
                </h2>

                <p className="text-sm text-gray-500">
                  Select one option to continue.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {methods.map((method) => {
                const Icon = method.icon;
                const selected = paymentMethod === method.id;

                return (
                  <button
                    type="button"
                    key={method.id}
                    disabled={submitting}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 text-left transition ${
                      selected
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="bg-white p-3 rounded-xl text-blue-600">
                      <Icon size={25} />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">
                        {method.title}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {method.description}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selected
                          ? "border-blue-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selected && (
                        <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-7 bg-green-50 border border-green-200 rounded-xl p-4 flex gap-3">
              <ShieldCheck
                className="text-green-600 shrink-0"
                size={23}
              />

              <div>
                <p className="font-semibold text-green-800">
                  Demo Payment Environment
                </p>

                <p className="text-sm text-green-700 mt-1">
                  No real transactions will occur. UPI and card
                  options are simulated selections only. Do not
                  enter real payment credentials.
                </p>
              </div>
            </div>

          </section>

          {/* Order Summary */}
          <aside className="bg-white rounded-2xl border shadow-sm p-6 h-fit">

            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="text-blue-600" size={24} />

              <h2 className="text-xl font-bold text-gray-800">
                Order Summary
              </h2>
            </div>

            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-3 text-sm"
                >
                  <span className="text-gray-600">
                    {item.title} × {item.quantity}
                  </span>

                  <span className="font-semibold whitespace-nowrap">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <hr className="my-5" />

            <div className="space-y-4 text-gray-600">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shipping === 0
                    ? "Free"
                    : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>

            </div>

            <hr className="my-5" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>

              <span className="text-blue-600">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Delivery Address */}
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700">
                Delivery Address
              </p>

              <p className="text-sm text-gray-600 mt-2">
                {address.fullName}
                <br />
                {address.street}
                <br />
                {address.city}, {address.state} - {address.postalCode}
                <br />
                {address.phone}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting || cart.length === 0}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold mt-6 hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <CheckCircle size={19} />

              {submitting ? "Placing Order..." : "Place Order"}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Your order will be saved as a simulated order.
            </p>

          </aside>
        </div>
      </div>
    </main>
  );
}
