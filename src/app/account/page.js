
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./account.css";

import {
  UserRound,
  Mail,
  Package,
  Heart,
  ShoppingBag,
  LogOut,
  Edit,
  Save,
  X,
  ArrowRight,
  MapPin,
} from "lucide-react";

import RecommendationPreferences from "@/features/recommendations/components/RecommendationPreferences";

export default function AccountPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Load logged-in user
  useEffect(() => {
    const savedUser = localStorage.getItem(
      "shopsphere-current-user"
    );

    if (!savedUser) {
      router.replace("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);

      setUser(parsedUser);

      setFormData({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
      });

      setLoading(false);
    } catch {
      localStorage.removeItem("shopsphere-current-user");
      router.replace("/login");
    }
  }, [router]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Update profile
  const handleSaveProfile = (e) => {
    e.preventDefault();

    const updatedUser = {
      ...user,
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
    };

    if (!updatedUser.name || !updatedUser.email) {
      alert("Please fill in all fields.");
      return;
    }

    const existingUsers = JSON.parse(
      localStorage.getItem("shopsphere-users") || "[]"
    );

    const emailExists = existingUsers.some(
      (item) =>
        item.email.toLowerCase() === updatedUser.email &&
        item.id !== updatedUser.id
    );

    if (emailExists) {
      alert("This email is already registered to another account.");
      return;
    }

    const updatedUsers = existingUsers.map((item) =>
      item.id === updatedUser.id
        ? {
            ...item,
            name: updatedUser.name,
            email: updatedUser.email,
          }
        : item
    );

    localStorage.setItem(
      "shopsphere-users",
      JSON.stringify(updatedUsers)
    );

    localStorage.setItem(
      "shopsphere-current-user",
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
    setIsEditing(false);

    alert("Profile updated successfully!");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("shopsphere-current-user");
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading your account...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Account
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your profile and shopping activities.
          </p>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-center gap-5">
            <div className="bg-white/20 rounded-full p-4">
              <UserRound size={38} />
            </div>

            <div>
              <p className="text-blue-100 text-sm">
                Welcome back!
              </p>

              <h2 className="text-2xl font-bold">
                {user.name}
              </h2>

              <p className="text-blue-100 text-sm mt-1">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Profile Section */}
          <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Personal Information
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  View and update your account details.
                </p>
              </div>

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800"
                >
                  <Edit size={17} />
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form
                onSubmit={handleSaveProfile}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700"
                  >
                    <Save size={17} />
                    Save Changes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: user.name,
                        email: user.email,
                      });
                      setIsEditing(false);
                    }}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-5 py-3 rounded-xl font-semibold hover:bg-gray-200"
                  >
                    <X size={17} />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <UserRound className="text-blue-600" size={22} />

                  <div>
                    <p className="text-sm text-gray-500">
                      Full Name
                    </p>

                    <p className="font-semibold text-gray-800">
                      {user.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <Mail className="text-blue-600" size={22} />

                  <div>
                    <p className="text-sm text-gray-500">
                      Email Address
                    </p>

                    <p className="font-semibold text-gray-800">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <UserRound className="text-blue-600" size={22} />

                  <div>
                    <p className="text-sm text-gray-500">
                      Account Type
                    </p>

                    <p className="font-semibold text-gray-800 capitalize">
                      {user.role || "Customer"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Quick Links */}
          <section className="space-y-5">
            <h2 className="text-xl font-bold text-gray-800">
              My Activities
            </h2>

            {/* My Orders */}
            <Link
              href="/orders"
              className="flex items-center justify-between bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                  <Package size={23} />
                </div>

                <div>
                  <h3 className="font-bold text-gray-800">
                    My Orders
                  </h3>

                  <p className="text-sm text-gray-500">
                    View your orders
                  </p>
                </div>
              </div>

              <ArrowRight size={20} className="text-gray-400" />
            </Link>

            {/* My Wishlist */}
            <Link
              href="/wishlist"
              className="flex items-center justify-between bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-red-300 transition"
            >
              <div className="flex items-center gap-4">
                <div className="bg-red-100 text-red-500 p-3 rounded-xl">
                  <Heart size={23} />
                </div>

                <div>
                  <h3 className="font-bold text-gray-800">
                    My Wishlist
                  </h3>

                  <p className="text-sm text-gray-500">
                    View saved products
                  </p>
                </div>
              </div>

              <ArrowRight size={20} className="text-gray-400" />
            </Link>

            {/* My Addresses */}
            <Link
              href="/account/addresses"
              className="flex items-center justify-between bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-green-300 transition"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                  <MapPin size={23} />
                </div>

                <div>
                  <h3 className="font-bold text-gray-800">
                    My Addresses
                  </h3>

                  <p className="text-sm text-gray-500">
                    Manage delivery addresses
                  </p>
                </div>
              </div>

              <ArrowRight size={20} className="text-gray-400" />
            </Link>

            {/* Continue Shopping */}
            <Link
              href="/"
              className="flex items-center justify-between bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition"
            >
              <div className="flex items-center gap-4">
                <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
                  <ShoppingBag size={23} />
                </div>

                <div>
                  <h3 className="font-bold text-gray-800">
                    Continue Shopping
                  </h3>

                  <p className="text-sm text-gray-500">
                    Explore products
                  </p>
                </div>
              </div>

              <ArrowRight size={20} className="text-gray-400" />
            </Link>
          </section>
        </div>

        {/* Recommendation Preferences */}
        <section className="mt-8">
          <RecommendationPreferences />
        </section>

        {/* Logout */}
        <div className="mt-8 bg-white border rounded-2xl p-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800">
              Sign out of your account
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              You can log in again anytime.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-3 rounded-xl font-semibold hover:bg-red-100"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>

      </div>
    </main>
  );
}
