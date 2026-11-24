
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Package,
  Search,
  ArrowLeft,
  RefreshCw,
  Star,
  Plus,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import { getProducts, getCategories } from "@/services/productService";

const initialForm = {
  title: "",
  price: "",
  category: "",
  stock: "",
  thumbnail: "",
  description: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingProductId, setEditingProductId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");


  const handleDeleteProduct = (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      const savedProducts = JSON.parse(
        localStorage.getItem("shopsphere-admin-products") || "[]"
      );

      const updatedProducts = savedProducts.filter(
        (product) => product.id !== productId
      );

      localStorage.setItem(
        "shopsphere-admin-products",
        JSON.stringify(updatedProducts)
      );

      setProducts((previous) =>
        previous.filter((product) => product.id !== productId)
      );

      setMessage("Product deleted successfully!");
    } catch (error) {
      console.error("Delete product error:", error);
      setMessage("Unable to delete product.");
    }
  };


  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const [productData, categoryData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      const customProducts = JSON.parse(
        localStorage.getItem("shopsphere-admin-products") || "[]"
      );

      setProducts([...customProducts, ...productData]);

      setCategories([
        ...new Set([
          ...categoryData,
          ...customProducts.map((item) => item.category),
        ]),
      ]);
    } catch (err) {
      console.error("Product loading error:", err);
      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Search and category filter
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "all" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Open form for editing
  const handleEditProduct = (product) => {
    setEditingProductId(product.id);

    setForm({
      title: product.title || "",
      price: String(product.price ?? ""),
      category: product.category || "",
      stock: String(product.stock ?? ""),
      thumbnail: product.thumbnail || "",
      description: product.description || "",
    });

    setMessage("");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Add or update product
  const handleAddProduct = (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !form.title.trim() ||
      !form.price ||
      !form.category.trim() ||
      form.stock === ""
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!Number.isFinite(price) || price <= 0) {
      setMessage("Enter a valid price greater than zero.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setMessage("Stock must be a whole number of zero or more.");
      return;
    }

    const newProduct = {
      id: editingProductId ?? Date.now(),
      title: form.title.trim(),
      price,
      category: form.category.trim().toLowerCase(),
      stock,
      thumbnail: form.thumbnail.trim() || "",
      images: form.thumbnail.trim() ? [form.thumbnail.trim()] : [],
      description: form.description.trim(),
      rating: 0,
      brand: "ShopSphere",
      discountPercentage: 0,
    };

    try {
      const savedProducts = JSON.parse(
        localStorage.getItem("shopsphere-admin-products") || "[]"
      );

      let updatedCustomProducts;

      if (editingProductId !== null) {
        updatedCustomProducts = savedProducts.map((item) =>
          item.id === editingProductId ? newProduct : item
        );
      } else {
        updatedCustomProducts = [
          newProduct,
          ...savedProducts,
        ];
      }

      localStorage.setItem(
        "shopsphere-admin-products",
        JSON.stringify(updatedCustomProducts)
      );

      // Update product list immediately
      setProducts((previous) =>
        editingProductId !== null
          ? previous.map((item) =>
            item.id === editingProductId ? newProduct : item
          )
          : [newProduct, ...previous]
      );

      // Add new category if needed
      setCategories((previous) =>
        previous.includes(newProduct.category)
          ? previous
          : [...previous, newProduct.category]
      );

      setMessage(
        editingProductId !== null
          ? "Product updated successfully!"
          : "Product added successfully!"
      );

      setForm(initialForm);
      setEditingProductId(null);
      setShowForm(false);
    } catch (err) {
      console.error("Unable to save product:", err);
      setMessage("Unable to save product. Please try again.");
    }
  };

  // Close form and reset editing state
  const closeForm = () => {
    setShowForm(false);
    setForm(initialForm);
    setEditingProductId(null);
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-gray-50 p-5 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <Link
          href="/admin"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </Link>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600">
              <Package size={22} />
              <span className="font-semibold">Product Management</span>
            </div>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Products
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              View and manage your ShopSphere AI products.
            </p>
          </div>

          <button
            onClick={() => {
              setForm(initialForm);
              setEditingProductId(null);
              setMessage("");
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-95"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {/* Success Message */}
        {message && !showForm && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* Product Summary */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Products</p>
          <h2 className="mt-1 text-3xl font-bold text-gray-900">
            {products.length}
          </h2>
        </div>

        {/* Add / Edit Product Form */}
        {showForm && (
          <div className="mb-7 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingProductId !== null
                    ? "Edit Product"
                    : "Add New Product"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the product information below.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-red-500"
                aria-label="Close form"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleAddProduct}>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product Name *
                  </label>

                  <input
                    name="title"
                    value={form.title}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Price ($) *
                  </label>

                  <input
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Category *
                  </label>

                  <input
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    placeholder="e.g. smartphones"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Available Stock *
                  </label>

                  <input
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleInputChange}
                    placeholder="Enter stock quantity"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product Image URL
                  </label>

                  <input
                    name="thumbnail"
                    type="url"
                    value={form.thumbnail}
                    onChange={handleInputChange}
                    placeholder="https://example.com/product.jpg"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product Description
                  </label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Describe your product..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {message && (
                <p className="mt-4 text-sm text-red-600" role="alert">
                  {message}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {editingProductId !== null
                    ? "Update Product"
                    : "Save Product"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:flex-row">

          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-lg border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            onClick={loadProducts}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
          >
            <RefreshCw size={17} />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border bg-white py-16 text-center">
            <RefreshCw
              className="mx-auto animate-spin text-blue-600"
              size={30}
            />
            <p className="mt-3 text-gray-500">Loading products...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-red-600">{error}</p>

            <button
              onClick={loadProducts}
              className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Product Grid */}
        {!loading && !error && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                Product List
              </h2>

              <p className="text-sm text-gray-500">
                {filteredProducts.length} products found
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="rounded-xl border bg-white py-16 text-center">
                <Package size={40} className="mx-auto text-gray-300" />

                <p className="mt-3 font-semibold text-gray-700">
                  No products found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex h-48 items-center justify-center bg-gray-50 p-5">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <Package size={45} className="text-gray-300" />
                      )}
                    </div>

                    <div className="p-4">
                      <p className="text-xs capitalize text-blue-600">
                        {product.category}
                      </p>

                      <h3 className="mt-2 min-h-12 font-semibold text-gray-800">
                        {product.title}
                      </h3>

                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          ${Number(product.price).toFixed(2)}
                        </span>

                        <span className="flex items-center gap-1 text-sm text-yellow-600">
                          <Star size={15} fill="currentColor" />
                          {product.rating || "New"}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
                        <span className="text-gray-500">
                          Stock: {product.stock}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${product.stock > 0
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                            }`}
                        >
                          {product.stock > 0
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>
                      </div>
                      
                      {product.brand === "ShopSphere" && (
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                      )}


                      {/* Edit Custom Products Only */}
                      {product.brand === "ShopSphere" && (
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          <Pencil size={16} />
                          Edit Product
                        </button>
                      )}


                      

                      {product.brand === "ShopSphere" && (
                        <p className="mt-2 text-center text-xs text-blue-500">
                          Admin Added Product
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
