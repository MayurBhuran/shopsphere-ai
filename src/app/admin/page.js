
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  IndianRupee,
  MessageSquare,
  Home,
  Settings,
  TrendingUp,
  ArrowUpRight,
  BarChart3,
  Warehouse,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    totalReviews: 0,
  });

  useEffect(() => {
    try {
      const orders = JSON.parse(
        localStorage.getItem("shopsphere-orders") || "[]"
      );

      const users = JSON.parse(
        localStorage.getItem("shopsphere-users") || "[]"
      );

      const reviews = JSON.parse(
        localStorage.getItem("shopsphere-reviews") || "[]"
      );

      const customProducts = JSON.parse(
        localStorage.getItem("shopsphere-admin-products") || "[]"
      );

      setStats({
        totalProducts: customProducts.length,
        totalOrders: orders.length,
        totalCustomers: users.filter(
          (user) => user.role !== "admin"
        ).length,
        totalRevenue: orders
          .filter((order) => order.status !== "Cancelled")
          .reduce(
            (sum, order) => sum + Number(order.total || 0),
            0
          ),
        totalReviews: reviews.length,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    }
  }, []);

  const cards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toFixed(2)}`,
      icon: IndianRupee,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Total Reviews",
      value: stats.totalReviews,
      icon: MessageSquare,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
  ];

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Inventory", href: "/admin/inventory", icon: Warehouse },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    {
      name: "Recommendation Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
  ];

  const quickAccess = [
    {
      title: "Manage Products",
      desc: "Add, edit and manage products.",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "Manage Inventory",
      desc: "Monitor stock levels and low-stock products.",
      href: "/admin/inventory",
      icon: Warehouse,
    },
    {
      title: "Manage Orders",
      desc: "View and update customer orders.",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: "Customer Reviews",
      desc: "Monitor customer feedback.",
      href: "/admin/reviews",
      icon: MessageSquare,
    },
    {
      title: "Recommendation Analytics",
      desc: "Monitor impressions, clicks and conversions.",
      href: "/admin/analytics",
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">

        {/* Sidebar */}
        <aside className="hidden min-h-screen w-64 shrink-0 border-r border-gray-200 bg-white px-5 py-7 md:block">
          <Link href="/" className="mb-10 block">
            <h1 className="text-2xl font-bold text-gray-900">
              ShopSphere<span className="text-blue-600"> AI</span>
            </h1>
            <p className="mt-1 text-xs text-gray-400">
              ADMIN DASHBOARD
            </p>
          </Link>

          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                    item.name === "Dashboard"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm font-medium">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 border-t border-gray-100 pt-6">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-gray-600 transition hover:bg-gray-100 hover:text-blue-600"
            >
              <Home size={20} />
              <span className="text-sm font-medium">Back to Store</span>
            </Link>

            <Link
              href="/account"
              className="mt-2 flex items-center gap-3 rounded-lg px-4 py-3 text-gray-600 transition hover:bg-gray-100 hover:text-blue-600"
            >
              <Settings size={20} />
              <span className="text-sm font-medium">My Account</span>
            </Link>
          </div>

          <div className="mt-12 rounded-xl bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-800">
              ShopSphere AI
            </p>
            <p className="mt-1 text-xs text-blue-600">
              Store management panel
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 p-5 sm:p-7 lg:p-10">

          {/* Header */}
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600">
                Admin / Dashboard
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                Dashboard Overview
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Welcome back! Here's what's happening in your store.
              </p>
            </div>

            <Link
              href="/"
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            >
              Visit Store
            </Link>
          </header>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className={`rounded-lg p-3 ${card.bg} ${card.color}`}>
                      <Icon size={23} />
                    </div>

                    <ArrowUpRight
                      size={19}
                      className="text-gray-300 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-blue-600"
                    />
                  </div>

                  <p className="mt-5 text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-gray-900">
                    {card.value}
                  </h3>
                </div>
              );
            })}
          </section>

          {/* Welcome Banner */}
          <section className="mt-8 rounded-xl border border-blue-100 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <div className="mb-3 flex items-center gap-2 text-blue-600">
                  <TrendingUp size={20} />
                  <span className="text-sm font-semibold">
                    Store Management
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900">
                  Welcome to ShopSphere AI!
                </h3>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                  Manage your products, track customer orders, monitor
                  store performance and review customer feedback.
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-5 text-blue-600">
                <LayoutDashboard size={42} />
              </div>
            </div>
          </section>

          {/* Quick Access */}
          <section className="mt-9">
            <h3 className="mb-5 text-xl font-bold text-gray-900">
              Quick Access
            </h3>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {quickAccess.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-3 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                      <Icon size={23} />
                    </div>

                    <h4 className="font-semibold text-gray-900">
                      {item.title}
                    </h4>

                    <p className="mt-2 text-sm text-gray-500">
                      {item.desc}
                    </p>

                    <p className="mt-4 text-sm font-semibold text-blue-600">
                      View Details →
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          <footer className="mt-10 border-t border-gray-200 pt-5 text-center text-xs text-gray-400">
            © 2026 ShopSphere AI. All rights reserved.
          </footer>

        </main>
      </div>
    </div>
  );
}
