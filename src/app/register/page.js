
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  
const handleRegister = (e) => {
  e.preventDefault();

  if (formData.password.length < 6) {
    alert("Password must contain at least 6 characters.");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Get existing registered users
  const existingUsers = JSON.parse(
    localStorage.getItem("shopsphere-users") || "[]"
  );

  // Check duplicate email
  const userExists = existingUsers.some(
    (user) =>
      user.email.toLowerCase() === formData.email.trim().toLowerCase()
  );

  if (userExists) {
    alert("This email is already registered. Please login.");
    return;
  }

  // Create new user
  const newUser = {
    id: Date.now(),
    name: formData.name.trim(),
    email: formData.email.trim().toLowerCase(),
    password: formData.password,
    role: "customer",
    createdAt: new Date().toISOString(),
  };

  // Save user
  const updatedUsers = [...existingUsers, newUser];

  localStorage.setItem(
    "shopsphere-users",
    JSON.stringify(updatedUsers)
  );

  alert("Registration successful! Please login.");

  // Redirect to login
  window.location.href = "/login";
};


  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Background Decorations */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />

      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl" />

      {/* Register Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-950/40 p-8 sm:p-10 border border-white/20 relative z-10">

        {/* Logo */}
        <div className="text-center mb-8">

          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30">
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
            Create Account
          </h2>

          <p className="text-gray-500 text-sm mt-2">
            Join us and discover smarter shopping.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-5">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>

            <div className="relative">
              <User
                className="absolute left-3 top-3.5 text-gray-400"
                size={20}
              />

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>

            <div className="relative">
              <Mail
                className="absolute left-3 top-3.5 text-gray-400"
                size={20}
              />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-4 text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>

            <div className="relative">
              <Lock
                className="absolute left-3 top-3.5 text-gray-400"
                size={20}
              />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-12 text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-600 transition"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm Password
            </label>

            <div className="relative">
              <Lock
                className="absolute left-3 top-3.5 text-gray-400"
                size={20}
              />

              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-11 pr-12 text-gray-800 placeholder:text-gray-400 outline-none transition-all duration-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 hover:border-blue-300"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-3 top-3.5 text-gray-400 hover:text-blue-600 transition"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          >
            Create Account
          </button>

        </form>

        {/* Login Link */}
        <p className="text-center text-gray-600 mt-7 text-sm">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-bold hover:text-indigo-600 hover:underline transition"
          >
            Login
          </Link>
        </p>

        {/* Home Link */}
        <Link
          href="/"
          className="flex justify-center items-center gap-2 text-gray-500 text-sm mt-6 hover:text-blue-600 transition"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

      </div>
    </main>
  );
}
