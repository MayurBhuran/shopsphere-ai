
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import useCartStore from "@/store/cartStore";
import useWishlistStore from "@/store/wishlistStore";
import useCompareStore from "@/store/compareStore";

import PopularSearches from "@/component/products/PopularSearches";
import SearchSuggestions from "@/component/products/SearchSuggestions";
import RecentSearches from "@/component/products/RecentSearches";

import {
  ShoppingCart,
  Heart,
  UserRound,
  Search,
  Sparkles,
  ArrowLeftRight,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";

const SEARCH_HISTORY_KEY = "shopsphere-recent-searches";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const cart = useCartStore((state) => state.cart);
  const wishlist = useWishlistStore((state) => state.wishlist);
  const compareProducts = useCompareStore(
    (state) => state.compareProducts
  );

  const [hasRecentSearches, setHasRecentSearches] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const wishlistCount = wishlist.length;
  const compareCount = compareProducts.length;

  const isAdmin = currentUser?.role === "admin";

  // Read logged-in user from localStorage
  useEffect(() => {
    const updateUser = () => {
      try {
        const savedUser = localStorage.getItem(
          "shopsphere-current-user"
        );

        setCurrentUser(savedUser ? JSON.parse(savedUser) : null);
      } catch (error) {
        console.error("Could not read current user:", error);
        setCurrentUser(null);
      }
    };

    updateUser();

    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
    };
  }, [pathname]);

  // Save recent searches
  const saveSearch = (query) => {
    const value = query.trim();
    if (!value) return;

    try {
      const saved = JSON.parse(
        localStorage.getItem(SEARCH_HISTORY_KEY) || "[]"
      );

      const existing = Array.isArray(saved) ? saved : [];

      const updated = [
        value,
        ...existing.filter(
          (item) =>
            typeof item === "string" &&
            item.toLowerCase() !== value.toLowerCase()
        ),
      ].slice(0, 5);

      localStorage.setItem(
        SEARCH_HISTORY_KEY,
        JSON.stringify(updated)
      );

      setHasRecentSearches(true);

      window.dispatchEvent(
        new Event("shopsphere-signals-updated")
      );
    } catch (error) {
      console.error("Could not save recent search:", error);
    }
  };

  // Search submit
  const handleSearch = (e) => {
    e.preventDefault();

    const value = searchQuery.trim();
    if (!value) return;

    saveSearch(value);
    setIsSearchFocused(false);

    router.push(`/search?q=${encodeURIComponent(value)}`);
  };

  const handleRecentSearch = (search) => {
    setSearchQuery(search);
    setIsSearchFocused(false);

    router.push(`/search?q=${encodeURIComponent(search)}`);
  };

  // Check recent searches
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(SEARCH_HISTORY_KEY) || "[]"
      );

      setHasRecentSearches(
        Array.isArray(saved) && saved.length > 0
      );
    } catch (error) {
      console.error("Could not read recent searches:", error);
      setHasRecentSearches(false);
    }
  }, [isSearchFocused, searchQuery]);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("shopsphere-current-user");

    setCurrentUser(null);
    setShowProfileMenu(false);

    alert("You have been logged out successfully!");

    router.push("/");
  };

  // Search suggestions shared by desktop and mobile search
  const renderSearchSuggestions = () => {
    if (!isSearchFocused) return null;

    return (
      <>
        {searchQuery.trim() ? (
          <SearchSuggestions
            query={searchQuery}
            onSelect={(value) => {
              saveSearch(value);
              setSearchQuery(value);
              setIsSearchFocused(false);

              router.push(
                `/search?q=${encodeURIComponent(value)}`
              );
            }}
          />
        ) : hasRecentSearches ? (
          <RecentSearches onSelect={handleRecentSearch} />
        ) : (
          <PopularSearches />
        )}
      </>
    );
  };

  return (
    <nav className="bg-white shadow-sm border-b relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4">

        {/* Main Navbar Row */}
        <div className="flex items-center justify-between gap-3">

          {/* Logo */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold text-blue-600 shrink-0"
          >
            ShopSphere<span className="text-purple-600"> AI</span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:block relative flex-1 max-w-xl">
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-gray-100 rounded-full px-4 py-2"
            >
              <Search size={20} className="text-gray-500 shrink-0" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() =>
                  setTimeout(() => setIsSearchFocused(false), 200)
                }
                placeholder="Search products..."
                className="bg-transparent outline-none px-3 w-full text-sm"
                autoComplete="off"
              />

              <button type="submit" className="text-blue-600">
                Search
              </button>
            </form>

            {renderSearchSuggestions()}
          </div>

          {/* Navigation Links and Icons */}
          <div className="flex items-center gap-3 sm:gap-5 text-gray-700">

            {/* Home - Desktop */}
            <Link
              href="/"
              className="hidden md:block hover:text-blue-600"
            >
              Home
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative"
              aria-label="Wishlist"
            >
              <Heart size={21} className="hover:text-red-500" />

              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Compare */}
            <Link
              href="/compare"
              className="relative hover:text-blue-600"
              aria-label="Compare products"
            >
              <ArrowLeftRight size={21} />

              {compareCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative"
              aria-label="Shopping cart"
            >
              <ShoppingCart size={21} className="hover:text-blue-600" />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Authentication */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1 sm:gap-2 hover:text-blue-600"
                  aria-label="Profile menu"
                >
                  <UserRound size={21} />

                  <span className="hidden lg:inline text-sm font-semibold max-w-28 truncate">
                    {currentUser.name}
                  </span>

                  <ChevronDown size={16} />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">

                    <div className="px-4 py-3 border-b">
                      <p className="font-semibold text-gray-800 truncate">
                        {currentUser.name}
                      </p>

                      <p className="text-xs text-gray-500 truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setShowProfileMenu(false)}
                      className="block px-4 py-3 text-sm hover:bg-blue-50 hover:text-blue-600"
                    >
                      My Account
                    </Link>

                    {/* Admin Dashboard - Administrator only */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        <LayoutDashboard size={18} />
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold hover:text-blue-600"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="hidden sm:block bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-3 relative">
          <form
            onSubmit={handleSearch}
            className="flex items-center bg-gray-100 rounded-full px-4 py-3"
          >
            <Search size={19} className="text-gray-500 shrink-0" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() =>
                setTimeout(() => setIsSearchFocused(false), 200)
              }
              placeholder="Search products..."
              className="bg-transparent outline-none px-3 w-full text-sm text-gray-800"
              autoComplete="off"
            />

            <button
              type="submit"
              className="text-blue-600 text-sm font-semibold shrink-0"
            >
              Search
            </button>
          </form>

          {renderSearchSuggestions()}
        </div>
      </div>

      {/* Announcement */}
      <div className="bg-blue-50 text-blue-700 text-center py-2 px-2 text-xs sm:text-sm">
        <Sparkles size={16} className="inline mr-2" />
        Discover smarter shopping with ShopSphere AI
      </div>
    </nav>
  );
}
