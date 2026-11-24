
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Users,
  ShoppingBag,
  DollarSign,
  Eye,
  X,
  ArrowLeft,
} from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUsers = JSON.parse(
        localStorage.getItem("shopsphere-users") || "[]"
      );

      const savedOrders = JSON.parse(
        localStorage.getItem("shopsphere-orders") || "[]"
      );

      setCustomers(
        Array.isArray(savedUsers)
          ? savedUsers.filter((user) => user.role !== "admin")
          : []
      );

      setOrders(Array.isArray(savedOrders) ? savedOrders : []);
    } catch (error) {
      console.error("Unable to load customer data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCustomerOrders = (customer) => {
    return orders.filter(
      (order) =>
        (order.userId && order.userId === customer.id) ||
        (order.address?.email &&
          order.address.email.toLowerCase() ===
            (customer.email || "").toLowerCase())
    );
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const name = customer.name || "";
      const email = customer.email || "";

      const matchesSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        email.toLowerCase().includes(search.toLowerCase());

      const hasOrders = orders.some(
        (order) =>
          (order.userId && order.userId === customer.id) ||
          (order.address?.email &&
            order.address.email.toLowerCase() === email.toLowerCase())
      );

      const matchesFilter =
        accountFilter === "All" ||
        (accountFilter === "With Orders" && hasOrders) ||
        (accountFilter === "No Orders" && !hasOrders);

      return matchesSearch && matchesFilter;
    });
  }, [customers, orders, search, accountFilter]);

  const totalRevenue = orders.reduce(
    (sum, order) =>
      sum +
      (order.status !== "Cancelled" ? Number(order.total || 0) : 0),
    0
  );

  const customersWithOrders = customers.filter(
    (customer) => getCustomerOrders(customer).length > 0
  ).length;

  const customerTotal = (customer) => {
    return getCustomerOrders(customer)
      .filter((order) => order.status !== "Cancelled")
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        Loading customers...
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

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Customers Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                View registered customers and their shopping activity.
              </p>
            </div>

            <span className="w-fit rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
              Local / Simulated Customer Data
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total Customers</p>
              <Users className="text-blue-600" size={21} />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">
              {customers.length}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Customers With Orders</p>
              <ShoppingBag className="text-indigo-600" size={21} />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-indigo-600">
              {customersWithOrders}
            </h2>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Simulated Revenue</p>
              <DollarSign className="text-green-600" size={21} />
            </div>
            <h2 className="mt-3 text-2xl font-bold text-green-600">
              ${totalRevenue.toFixed(2)}
            </h2>
          </div>

        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search customer name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="All">All Customers</option>
            <option value="With Orders">With Orders</option>
            <option value="No Orders">Without Orders</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setAccountFilter("All");
            }}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            Reset
          </button>
        </div>

        {/* Customer Table */}
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">

          <div className="border-b border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900">
              All Customers ({filteredCustomers.length})
            </h2>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={40} className="mx-auto mb-3 text-gray-300" />
              <h3 className="font-semibold text-gray-700">
                No customers found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Registered customers will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Customer</th>
                    <th className="px-5 py-4">Email</th>
                    <th className="px-5 py-4">Joined Date</th>
                    <th className="px-5 py-4">Orders</th>
                    <th className="px-5 py-4">Total Spent</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((customer) => {
                    const customerOrders = getCustomerOrders(customer);

                    return (
                      <tr
                        key={customer.id}
                        className="transition hover:bg-blue-50/40"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                              {(customer.name || "C")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800">
                              {customer.name || "Customer"}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-500">
                          {customer.email}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {customer.createdAt
                            ? new Date(
                                customer.createdAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </td>

                        <td className="px-5 py-4 font-medium text-gray-800">
                          {customerOrders.length}
                        </td>

                        <td className="px-5 py-4 font-semibold text-green-600">
                          ${customerTotal(customer).toFixed(2)}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-blue-600 transition hover:bg-blue-100"
                          >
                            <Eye size={15} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Customer Details Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Customer Details
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Customer profile and order activity
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="rounded-full p-2 transition hover:bg-gray-100"
                  aria-label="Close customer details"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-5 flex items-center gap-4 rounded-xl bg-blue-50 p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  {(selectedCustomer.name || "C")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedCustomer.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedCustomer.email}
                  </p>
                  <span className="mt-1 inline-block text-xs font-medium text-blue-700">
                    Customer Account
                  </span>
                </div>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-gray-500">Total Orders</p>
                  <h3 className="mt-2 text-xl font-bold text-gray-900">
                    {getCustomerOrders(selectedCustomer).length}
                  </h3>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <h3 className="mt-2 text-xl font-bold text-green-600">
                    ${customerTotal(selectedCustomer).toFixed(2)}
                  </h3>
                </div>
              </div>

              <div className="mb-5 rounded-xl border p-4">
                <h3 className="mb-3 font-semibold text-gray-900">
                  Account Information
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Customer ID</span>
                    <span className="break-all font-medium text-gray-800">
                      {selectedCustomer.id}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Email</span>
                    <span className="break-all font-medium text-gray-800">
                      {selectedCustomer.email}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Joined</span>
                    <span className="font-medium text-gray-800">
                      {selectedCustomer.createdAt
                        ? new Date(
                            selectedCustomer.createdAt
                          ).toLocaleDateString()
                        : "Not available"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Recent Orders
                </h3>

                <div className="space-y-3">
                  {getCustomerOrders(selectedCustomer).length === 0 ? (
                    <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                      This customer has not placed any orders yet.
                    </p>
                  ) : (
                    getCustomerOrders(selectedCustomer)
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt || 0) -
                          new Date(a.createdAt || 0)
                      )
                      .slice(0, 5)
                      .map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between gap-3 rounded-lg border p-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {order.id}
                            </p>
                            <p className="text-xs text-gray-500">
                              {order.createdAt
                                ? new Date(
                                    order.createdAt
                                  ).toLocaleDateString()
                                : "Date unavailable"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              ${Number(order.total || 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-blue-600">
                              {order.status}
                            </p>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="mt-6 w-full rounded-lg border py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
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
