
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const existingUsers = JSON.parse(
      localStorage.getItem("shopsphere-users") || "[]"
    );

    const user = existingUsers.find(
      (item) =>
        item.email === formData.email.trim().toLowerCase() &&
        item.password === formData.password
    );

    if (!user) {
      alert("Invalid email or password!");
      return;
    }

    // Save logged-in user
    localStorage.setItem(
      "shopsphere-current-user",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
    );

    alert("Login successful!");

    router.push("/");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center px-4 py-12">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10">

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl">
              <ShoppingBag className="text-white" size={30} />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ShopSphere AI
          </h1>

          <p className="text-xs font-semibold tracking-[3px] text-gray-400 uppercase mt-2">
            Smart Shopping Starts Here
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-7">
            Welcome Back
          </h2>

          <p className="text-gray-500 text-sm mt-2">
            Login to continue shopping.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-12 text-gray-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:opacity-90 transition"
          >
            Login
          </button>

        </form>

        <p className="text-center text-gray-600 mt-7 text-sm">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            Create Account
          </Link>
        </p>

        <Link
          href="/"
          className="flex justify-center items-center gap-2 text-gray-500 text-sm mt-6 hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

      </div>
    </main>
  );
}
