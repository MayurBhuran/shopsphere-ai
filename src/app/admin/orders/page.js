
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import "./orders.css";
import {
  Search,
  Package,
  Eye,
  X,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

const ORDER_STATUSES = [
  "Order Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const normalizeStatus = (status) => {
  if (!status) return "Order Placed";
  if (status === "Processing") return "Packed";
  return status;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Load orders
  useEffect(() => {
    try {
      const savedOrders = JSON.parse(
        localStorage.getItem("shopsphere-orders") || "[]"
      );

      setOrders(
        Array.isArray(savedOrders)
          ? savedOrders.map((order) => ({
              ...order,
              status: normalizeStatus(order.status),
            }))
          : []
      );
    } catch (error) {
      console.error("Unable to load orders:", error);
      setMessage("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Save orders and synchronize the latest order
  const saveOrders = (updatedOrders, orderId) => {
    try {
      localStorage.setItem(
        "shopsphere-orders",
        JSON.stringify(updatedOrders)
      );

      setOrders(updatedOrders);

      const updatedOrder = updatedOrders.find(
        (order) => String(order.id) === String(orderId)
      );

      if (updatedOrder) {
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

        setSelectedOrder(updatedOrder);
        setMessage(
          `Order status updated to ${updatedOrder.status}!`
        );
      }
    } catch (error) {
      console.error("Unable to save orders:", error);
      setMessage("Unable to save order changes.");
    }
  };

  // Search and filter
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const customerName = order.address?.fullName || "";
      const orderId = String(order.id || "");

      const matchesSearch =
        orderId.toLowerCase().includes(search.toLowerCase()) ||
        customerName.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        normalizeStatus(order.status) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // Get next status
  const getNextStatus = (currentStatus) => {
    const normalizedStatus = normalizeStatus(currentStatus);
    const currentIndex = ORDER_STATUSES.indexOf(normalizedStatus);

    if (
      currentIndex === -1 ||
      currentIndex >= ORDER_STATUSES.length - 1
    ) {
      return null;
    }

    return ORDER_STATUSES[currentIndex + 1];
  };

  // Update order status
  const updateStatus = (orderId) => {
    const currentOrder = orders.find(
      (order) => String(order.id) === String(orderId)
    );

    if (!currentOrder) {
      setMessage("Order not found.");
      return;
    }

    const currentStatus = normalizeStatus(currentOrder.status);
    const nextStatus = getNextStatus(currentStatus);

    if (!nextStatus) {
      setMessage("This order cannot be moved to another status.");
      return;
    }

    const now = new Date().toISOString();

    let history = Array.isArray(currentOrder.statusHistory)
      ? [...currentOrder.statusHistory]
      : [];

    // Preserve the initial status in the history
    if (history.length === 0) {
      history.push({
        status: currentStatus,
        timestamp: currentOrder.createdAt || now,
      });
    }

    history.push({
      status: nextStatus,
      timestamp: now,
    });

    const updatedOrders = orders.map((order) => {
      if (String(order.id) !== String(orderId)) {
        return order;
      }

      return {
        ...order,
        status: nextStatus,
        statusHistory: history,
      };
    });

    saveOrders(updatedOrders, orderId);
  };

  // Cancel order
  const cancelOrder = (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    const currentOrder = orders.find(
      (order) => String(order.id) === String(orderId)
    );

    if (!currentOrder) return;

    const now = new Date().toISOString();

    let history = Array.isArray(currentOrder.statusHistory)
      ? [...currentOrder.statusHistory]
      : [];

    if (history.length === 0) {
      history.push({
        status: normalizeStatus(currentOrder.status),
        timestamp: currentOrder.createdAt || now,
      });
    }

    history.push({
      status: "Cancelled",
      timestamp: now,
    });

    const updatedOrders = orders.map((order) =>
      String(order.id) === String(orderId)
        ? {
            ...order,
            status: "Cancelled",
            statusHistory: history,
          }
        : order
    );

    saveOrders(updatedOrders, orderId);
  };

  // Status colors
  const getStatusStyle = (status) => {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === "Delivered")
      return "bg-green-100 text-green-700";

    if (normalizedStatus === "Cancelled")
      return "bg-red-100 text-red-700";

    if (
      normalizedStatus === "Shipped" ||
      normalizedStatus === "Out for Delivery"
    ) {
      return "bg-purple-100 text-purple-700";
    }

    if (normalizedStatus === "Packed")
      return "bg-indigo-100 text-indigo-700";

    return "bg-blue-100 text-blue-700";
  };

  const totalRevenue = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce(
      (total, order) => total + Number(order.total || 0),
      0
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Orders Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                View and manage customer orders.
              </p>
            </div>

            <span className="w-fit rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
              Local / Simulated Admin Actions
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Orders</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {orders.length}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Active Orders</p>
            <h2 className="mt-2 text-2xl font-bold text-blue-600">
              {orders.filter(
                (order) =>
                  order.status !== "Delivered" &&
                  order.status !== "Cancelled"
              ).length}
            </h2>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Simulated Order Value
            </p>
            <h2 className="mt-2 text-2xl font-bold text-green-600">
              ${totalRevenue.toFixed(2)}
            </h2>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search order ID or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
            <option value="Cancelled">Cancelled</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
            }}
            className="rounded-lg border px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>

        {/* Success / Error Message */}
        {message && (
          <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {message}
            <button onClick={() => setMessage("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Orders Table */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h2 className="font-semibold text-gray-900">
              All Orders ({filteredOrders.length})
            </h2>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package
                size={40}
                className="mx-auto mb-3 text-gray-300"
              />
              <h3 className="font-semibold text-gray-700">
                No orders found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Orders will appear here after customers place them.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Order ID</th>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Date</th>
                    <th className="px-5 py-4">Total</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {order.id}
                      </td>

                      <td className="px-5 py-4 text-gray-700">
                        {order.address?.fullName || "Customer"}
                        <p className="text-xs text-gray-400">
                          {order.address?.email || ""}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td className="px-5 py-4 font-semibold text-gray-900">
                        ${Number(order.total || 0).toFixed(2)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {normalizeStatus(order.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => {
                            setMessage("");
                            setSelectedOrder(order);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Order Details
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Order #{selectedOrder.id}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full p-2 hover:bg-gray-100"
                  aria-label="Close order details"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Customer */}
              <div className="mb-5 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-semibold">
                  Customer Information
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedOrder.address?.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.address?.email}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.address?.phone}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  {selectedOrder.address?.street},{" "}
                  {selectedOrder.address?.city},{" "}
                  {selectedOrder.address?.state}{" "}
                  {selectedOrder.address?.postalCode}
                </p>
              </div>

              {/* Items */}
              <h3 className="mb-3 font-semibold">
                Ordered Products
              </h3>

              <div className="mb-5 space-y-3">
                {(selectedOrder.items || []).map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="flex items-center justify-between gap-3 border-b pb-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm font-semibold">
                      $
                      {(
                        Number(item.price || 0) *
                        Number(item.quantity || 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Payment */}
              <div className="mb-5 space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="font-medium">
                    {selectedOrder.paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    ${Number(selectedOrder.subtotal || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    ${Number(selectedOrder.shipping || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>
                    ${Number(selectedOrder.tax || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-2 font-bold">
                  <span>Total</span>
                  <span>
                    ${Number(selectedOrder.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Update */}
              <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                <h3 className="mb-3 font-semibold text-gray-900">
                  Update Order Status
                </h3>

                <p className="mb-3 text-sm text-gray-600">
                  Current status:{" "}
                  <strong className="text-blue-700">
                    {normalizeStatus(selectedOrder.status)}
                  </strong>
                </p>

                {selectedOrder.status !== "Cancelled" &&
                  normalizeStatus(selectedOrder.status) !== "Delivered" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(selectedOrder.id)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                      <RefreshCw size={16} />
                      Move to Next Status
                    </button>
                  )}

                {selectedOrder.status !== "Cancelled" &&
                  normalizeStatus(selectedOrder.status) !== "Delivered" && (
                    <button
                      type="button"
                      onClick={() => cancelOrder(selectedOrder.id)}
                      className="mt-3 w-full rounded-lg border border-red-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      Cancel Order
                    </button>
                  )}

                {selectedOrder.status === "Delivered" && (
                  <p className="rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
                    This order has been delivered.
                  </p>
                )}

                {selectedOrder.status === "Cancelled" && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
                    This order has been cancelled.
                  </p>
                )}
              </div>

              {/* Status History */}
              <div>
                <h3 className="mb-3 font-semibold">
                  Status History
                </h3>

                <div className="space-y-3">
                  {(selectedOrder.statusHistory || [
                    {
                      status: normalizeStatus(selectedOrder.status),
                      timestamp: selectedOrder.createdAt,
                    },
                  ]).map((entry, index) => (
                    <div
                      key={`${entry.status}-${index}`}
                      className="flex gap-3 text-sm"
                    >
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {normalizeStatus(entry.status)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.timestamp
                            ? new Date(entry.timestamp).toLocaleString()
                            : "Time unavailable"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="mt-6 w-full rounded-lg border py-3 text-sm font-medium hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
