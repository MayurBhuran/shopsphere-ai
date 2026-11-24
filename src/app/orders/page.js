
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Package,
  ShoppingBag,
  CalendarDays,
  CreditCard,
  MapPin,
  CheckCircle,
  ArrowRight,
  Truck,
} from "lucide-react";

const TRACKING_STEPS = [
  "Order Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const normalizeStatus = (status) => {
  if (status === "Processing") return "Packed";
  return status || "Order Placed";
};

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Get tracking step
  const getTrackingStep = (status) => {
    return TRACKING_STEPS.indexOf(normalizeStatus(status));
  };

  // Load orders belonging to logged-in user
  useEffect(() => {
    try {
      const currentUser = JSON.parse(
        localStorage.getItem("shopsphere-current-user") || "null"
      );

      if (!currentUser) {
        router.replace("/login");
        return;
      }

      const savedOrders = JSON.parse(
        localStorage.getItem("shopsphere-orders") || "[]"
      );

      if (!Array.isArray(savedOrders)) {
        throw new Error("Invalid order history");
      }

      const userOrders = savedOrders
        .filter((order) => {
          if (order.userId != null) {
            return order.userId === currentUser.id;
          }

          return (
            order.address?.email?.toLowerCase() ===
            currentUser.email?.toLowerCase()
          );
        })
        .map((order) => ({
          ...order,
          status: normalizeStatus(order.status),
        }));

      userOrders.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );

      setOrders(userOrders);
    } catch (error) {
      console.error("Unable to load orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Format order date
  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format date and time
  const formatDateTime = (date) => {
    if (!date) return "Time unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Time unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Payment method
  const getPaymentMethod = (method) => {
    if (method === "cod") return "Cash on Delivery";
    if (method === "upi") return "UPI (Demo)";
    if (method === "card") return "Card (Demo)";

    return method || "Not specified";
  };

  // Get order status history
  const getOrderHistory = (order) => {
    if (
      Array.isArray(order.statusHistory) &&
      order.statusHistory.length > 0
    ) {
      return [...order.statusHistory].sort(
        (a, b) =>
          new Date(a.timestamp || 0) -
          new Date(b.timestamp || 0)
      );
    }

    return [
      {
        status: normalizeStatus(order.status),
        timestamp: order.createdAt || null,
      },
    ];
  };

  // Find timestamp for a tracking stage
  const getStepTimestamp = (history, step) => {
    const entry = [...history]
      .reverse()
      .find(
        (item) => normalizeStatus(item.status) === step
      );

    return entry?.timestamp || null;
  };

  // Cancel eligible order
  const cancelOrder = (orderId) => {
    const orderToCancel = orders.find(
      (order) => String(order.id) === String(orderId)
    );

    if (!orderToCancel) return;

    const currentStatus = normalizeStatus(orderToCancel.status);

    // Customers can cancel only before packing
    if (
      currentStatus !== "Order Placed" &&
      currentStatus !== "Confirmed"
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      const now = new Date().toISOString();

      const allOrders = JSON.parse(
        localStorage.getItem("shopsphere-orders") || "[]"
      );

      const updatedOrders = allOrders.map((order) => {
        if (String(order.id) !== String(orderId)) {
          return order;
        }

        let history = Array.isArray(order.statusHistory)
          ? [...order.statusHistory]
          : [];

        if (history.length === 0) {
          history.push({
            status: normalizeStatus(order.status),
            timestamp: order.createdAt || now,
          });
        }

        history.push({
          status: "Cancelled",
          timestamp: now,
        });

        return {
          ...order,
          status: "Cancelled",
          statusHistory: history,
        };
      });

      localStorage.setItem(
        "shopsphere-orders",
        JSON.stringify(updatedOrders)
      );

      // Synchronize last order
      const updatedOrder = updatedOrders.find(
        (order) => String(order.id) === String(orderId)
      );

      const lastOrder = JSON.parse(
        localStorage.getItem("shopsphere-last-order") || "null"
      );

      if (
        lastOrder &&
        String(lastOrder.id) === String(orderId)
      ) {
        localStorage.setItem(
          "shopsphere-last-order",
          JSON.stringify(updatedOrder)
        );
      }

      // Update customer page
      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          String(order.id) === String(orderId)
            ? {
                ...order,
                status: "Cancelled",
                statusHistory: updatedOrder.statusHistory,
              }
            : order
        )
      );
    } catch (error) {
      console.error("Unable to cancel order:", error);
      window.alert("Unable to cancel this order. Please try again.");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading your orders...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-5"
          >
            <ArrowRight size={18} className="rotate-180" />
            Back to My Account
          </Link>

          <h1 className="text-3xl font-extrabold text-gray-900">
            My Orders
          </h1>

          <p className="text-gray-500 mt-2">
            View your purchases and track your order progress.
          </p>
        </div>

        {/* Orders Count */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-8 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-xl">
              <Package size={32} />
            </div>

            <div>
              <p className="text-blue-100 text-sm">
                Total Orders
              </p>

              <h2 className="text-3xl font-bold">
                {orders.length}
              </h2>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {orders.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center shadow-sm">
            <ShoppingBag
              size={60}
              className="mx-auto text-gray-300 mb-5"
            />

            <h2 className="text-2xl font-bold text-gray-800">
              No Orders Yet
            </h2>

            <p className="text-gray-500 mt-3">
              You haven't placed any orders yet.
            </p>

            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold mt-6 hover:bg-blue-700"
            >
              Start Shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const expanded = expandedOrder === order.id;
              const currentStatus = normalizeStatus(order.status);
              const currentStep = getTrackingStep(currentStatus);
              const history = getOrderHistory(order);

              const canCancel =
                currentStatus === "Order Placed" ||
                currentStatus === "Confirmed";

              return (
                <article
                  key={order.id}
                  className="bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-5 border-b">
                    <div className="flex flex-wrap justify-between gap-4">

                      <div>
                        <p className="text-xs text-gray-500">
                          ORDER ID
                        </p>

                        <h3 className="font-bold text-gray-800 mt-1">
                          {order.id}
                        </h3>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          ORDER DATE
                        </p>

                        <p className="flex items-center gap-2 font-semibold text-gray-700 mt-1">
                          <CalendarDays size={16} />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">
                          STATUS
                        </p>

                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                            currentStatus === "Cancelled"
                              ? "bg-red-100 text-red-700"
                              : currentStatus === "Delivered"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          <CheckCircle size={15} />
                          {currentStatus}
                        </span>
                      </div>

                    </div>

                    {/* Customer Cancellation */}
                    {canCancel && (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => cancelOrder(order.id)}
                          className="rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Ordered Products */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items?.map((item, index) => (
                        <div
                          key={`${item.id}-${index}`}
                          className="flex items-center gap-4"
                        >
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-20 h-20 bg-gray-50 rounded-xl object-contain"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800">
                              {item.title}
                            </h4>

                            <p className="text-sm text-gray-500 mt-1">
                              Quantity: {item.quantity}
                            </p>
                          </div>

                          <p className="font-bold text-blue-600">
                            $
                            {(
                              Number(item.price || 0) *
                              Number(item.quantity || 0)
                            ).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <hr className="my-5" />

                    {/* Order Total and Details Button */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Order Total
                        </p>

                        <p className="text-2xl font-bold text-blue-600">
                          ${Number(order.total || 0).toFixed(2)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedOrder(
                            expanded ? null : order.id
                          )
                        }
                        aria-expanded={expanded}
                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-700"
                      >
                        {expanded
                          ? "Hide Details"
                          : "View Order Details"}
                      </button>
                    </div>

                    {/* Expanded Order Details */}
                    {expanded && (
                      <div className="mt-6 bg-blue-50/60 rounded-xl p-5 space-y-6">

                        {/* Estimated Delivery */}
                        <div className="bg-white border border-blue-100 rounded-xl p-4">
                          <h4 className="font-bold text-gray-800">
                            Estimated Delivery
                          </h4>

                          <p className="text-sm text-blue-700 mt-1">
                            {order.estimatedDeliveryAt
                              ? formatDate(order.estimatedDeliveryAt)
                              : "Not available for this order"}
                          </p>
                        </div>

                        {/* Delivery Address */}
                        <div>
                          <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                            <MapPin size={19} className="text-blue-600" />
                            Delivery Address
                          </h4>

                          <p className="text-sm text-gray-600 leading-6">
                            {order.address?.fullName}
                            <br />
                            {order.address?.street ||
                              order.address?.addressLine1}
                            <br />
                            {order.address?.city},{" "}
                            {order.address?.state} -{" "}
                            {order.address?.postalCode}
                            <br />
                            {order.address?.country}
                          </p>
                        </div>

                        {/* Payment Method */}
                        <div>
                          <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                            <CreditCard size={19} className="text-blue-600" />
                            Payment Method
                          </h4>

                          <p className="text-sm text-gray-600">
                            {getPaymentMethod(order.paymentMethod)}
                          </p>
                        </div>

                        {/* Order Tracking Timeline */}
                        <div>
                          <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <Truck size={19} className="text-blue-600" />
                            Order Tracking
                          </h4>

                          <div className="bg-white border rounded-xl p-5">
                            {currentStatus === "Cancelled" ? (
                              <div className="rounded-lg bg-red-50 p-4 text-red-700">
                                <p className="font-semibold">
                                  This order has been cancelled.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-5">
                                {TRACKING_STEPS.map((step, index) => {
                                  const completed =
                                    currentStep >= 0 &&
                                    currentStep >= index;

                                  const active = currentStep === index;

                                  const timestamp = getStepTimestamp(
                                    history,
                                    step
                                  );

                                  return (
                                    <div
                                      key={step}
                                      className="flex items-start gap-4"
                                    >
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold ${
                                          completed
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-200 text-gray-500"
                                        }`}
                                      >
                                        {completed ? "✓" : index + 1}
                                      </div>

                                      <div>
                                        <p
                                          className={`font-semibold ${
                                            completed
                                              ? "text-green-700"
                                              : "text-gray-400"
                                          }`}
                                        >
                                          {step}
                                        </p>

                                        {active && (
                                          <p className="text-sm text-blue-600 mt-1">
                                            Your current order status
                                          </p>
                                        )}

                                        {timestamp && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            {formatDateTime(timestamp)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            <p className="text-xs text-gray-500 mt-5">
                              This is simulated order tracking.
                              Live shipment tracking is not available.
                            </p>
                          </div>
                        </div>

                        {/* Order Status History */}
                        <div>
                          <h4 className="font-bold text-gray-800 mb-3">
                            Order Status History
                          </h4>

                          <div className="bg-white border rounded-xl p-4 space-y-4">
                            {history.map((entry, index) => (
                              <div
                                key={`${entry.status}-${index}`}
                                className="flex items-start gap-3"
                              >
                                <div className="mt-1 w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />

                                <div>
                                  <p className="text-sm font-semibold text-gray-800">
                                    {normalizeStatus(entry.status)}
                                  </p>

                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDateTime(entry.timestamp)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Price Details */}
                        <div className="border-t pt-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>
                              ${Number(order.subtotal || 0).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>
                              ${Number(order.shipping || 0).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span>Tax</span>
                            <span>
                              ${Number(order.tax || 0).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between font-bold text-base border-t pt-3">
                            <span>Grand Total</span>

                            <span className="text-blue-600">
                              ${Number(order.total || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500">
                          Order status updates are managed through the admin dashboard.
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
