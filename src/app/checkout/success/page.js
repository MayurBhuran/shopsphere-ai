
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Package,
  ShoppingBag,
  Truck,
  ArrowRight,
} from "lucide-react";

export default function OrderSuccessPage() {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedOrder = localStorage.getItem(
      "shopsphere-last-order"
    );

    if (!savedOrder) {
      router.replace("/");
      return;
    }

    try {
      setOrder(JSON.parse(savedOrder));
      setLoading(false);
    } catch {
      router.replace("/");
    }
  }, [router]);

  if (loading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading order details...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Success Header */}
        <div className="bg-white rounded-3xl shadow-sm border p-8 text-center">

          <div className="flex justify-center mb-5">
            <div className="bg-green-100 p-5 rounded-full">
              <CheckCircle size={55} className="text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900">
            Order Placed Successfully!
          </h1>

          <p className="text-gray-500 mt-3">
            Thank you for shopping with ShopSphere AI.
            Your order has been confirmed.
          </p>

          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-700">
              Your Order ID
            </p>

            <p className="text-xl font-bold text-green-800 mt-1">
              {order.id}
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mt-6">

          <h2 className="text-xl font-bold text-gray-800 mb-5">
            Order Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div className="flex gap-3">
              <Package className="text-blue-600" size={23} />

              <div>
                <p className="text-sm text-gray-500">Order Status</p>
                <p className="font-semibold text-green-600">
                  {order.status}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Truck className="text-blue-600" size={23} />

              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-semibold capitalize">
                  {order.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : order.paymentMethod === "upi"
                    ? "UPI (Simulated)"
                    : "Card (Simulated)"}
                </p>
              </div>
            </div>

          </div>

          <hr className="my-6" />

          <h3 className="font-bold text-gray-800 mb-4">
            Ordered Products
          </h3>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 border-b pb-4"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-16 h-16 object-contain bg-gray-50 rounded-lg"
                />

                <div className="flex-1">
                  <p className="font-semibold text-gray-800">
                    {item.title}
                  </p>

                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <p className="font-bold text-gray-800">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">

            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>${order.shipping.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>

            <hr />

            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total</span>
              <span className="text-blue-600">
                ${order.total.toFixed(2)}
              </span>
            </div>

          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mt-6">

          <h2 className="font-bold text-gray-800 mb-4">
            Delivery Address
          </h2>

          <p className="font-semibold">
            {order.address.fullName}
          </p>

          <p className="text-gray-600 text-sm mt-2">
            {order.address.street}
            <br />
            {order.address.city}, {order.address.state}
            <br />
            {order.address.postalCode}, {order.address.country}
            <br />
            Phone: {order.address.phone}
          </p>

        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">

          <Link
            href="/orders"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            View My Orders
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
          >
            <ShoppingBag size={18} />
            Continue Shopping
          </Link>

        </div>

      </div>
    </main>
  );
}
