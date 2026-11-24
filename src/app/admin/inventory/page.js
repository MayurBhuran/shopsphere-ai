
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Search,
  AlertTriangle,
  Boxes,
  Plus,
  Pencil,
  X,
  Save,
} from "lucide-react";

const PRODUCTS_API = "https://dummyjson.com/products?limit=100";
const CATEGORIES_API = "https://dummyjson.com/products/category-list";
const LOW_STOCK_LIMIT = 10;

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [overrides, setOverrides] = useState({});
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [editingStock, setEditingStock] = useState(null);
  const [stockValue, setStockValue] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [productResponse, categoryResponse] = await Promise.all([
          fetch(PRODUCTS_API),
          fetch(CATEGORIES_API),
        ]);

        if (!productResponse.ok || !categoryResponse.ok) {
          throw new Error("Unable to load catalogue data");
        }

        const productData = await productResponse.json();
        const categoryData = await categoryResponse.json();

        const customProducts = JSON.parse(
          localStorage.getItem("shopsphere-admin-products") || "[]"
        );

        const savedCategories = JSON.parse(
          localStorage.getItem("shopsphere-admin-categories") || "null"
        );

        const savedOverrides = JSON.parse(
          localStorage.getItem("shopsphere-inventory-overrides") || "{}"
        );

        const mergedProducts = [
          ...(Array.isArray(customProducts) ? customProducts : []),
          ...(productData.products || []).filter(
            (product) =>
              !(customProducts || []).some(
                (custom) => custom.id === product.id
              )
          ),
        ];

        setProducts(mergedProducts);
        setCategories(
          Array.isArray(savedCategories)
            ? savedCategories
            : categoryData
        );
        setOverrides(savedOverrides);
      } catch (error) {
        console.error("Inventory loading error:", error);
        setMessage("Unable to load inventory. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getStock = (product) =>
    Number(
      overrides[product.id]?.stock ?? product.stock ?? 0
    );

  const getCategory = (product) =>
    overrides[product.id]?.category ?? product.category ?? "Other";

  const lowStockProducts = products.filter(
    (product) => getStock(product) > 0 && getStock(product) <= LOW_STOCK_LIMIT
  );

  const outOfStockProducts = products.filter(
    (product) => getStock(product) <= 0
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.title
        ?.toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" ||
        getCategory(product) === categoryFilter;

      const stock = getStock(product);

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "Low Stock" &&
          stock > 0 &&
          stock <= LOW_STOCK_LIMIT) ||
        (stockFilter === "Out of Stock" && stock <= 0) ||
        (stockFilter === "In Stock" && stock > LOW_STOCK_LIMIT);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter, overrides]);

  const saveOverrides = (updatedOverrides) => {
    try {
      localStorage.setItem(
        "shopsphere-inventory-overrides",
        JSON.stringify(updatedOverrides)
      );
      setOverrides(updatedOverrides);
    } catch (error) {
      console.error("Inventory save error:", error);
      setMessage("Unable to save inventory changes.");
    }
  };

  const updateStock = (productId) => {
    const value = Number(stockValue);

    if (!Number.isInteger(value) || value < 0) {
      setMessage("Enter a valid non-negative stock quantity.");
      return;
    }

    saveOverrides({
      ...overrides,
      [productId]: {
        ...overrides[productId],
        stock: value,
      },
    });

    setEditingStock(null);
    setStockValue("");
    setMessage("Stock updated locally.");
  };

  const updateProductCategory = (productId, category) => {
    saveOverrides({
      ...overrides,
      [productId]: {
        ...overrides[productId],
        category,
      },
    });

    setMessage("Product category updated locally.");
  };

  const saveCategories = (updatedCategories) => {
    try {
      localStorage.setItem(
        "shopsphere-admin-categories",
        JSON.stringify(updatedCategories)
      );
      setCategories(updatedCategories);
    } catch (error) {
      console.error("Category save error:", error);
      setMessage("Unable to save categories.");
    }
  };

  const addCategory = () => {
    const name = newCategory.trim();

    if (!name) {
      setMessage("Enter a category name.");
      return;
    }

    if (
      categories.some(
        (category) =>
          category.toLowerCase() === name.toLowerCase()
      )
    ) {
      setMessage("This category already exists.");
      return;
    }

    saveCategories([...categories, name]);
    setNewCategory("");
    setMessage("Category created locally.");
  };

  const renameCategory = () => {
    const name = categoryName.trim();

    if (!name || !editingCategory) return;

    if (
      categories.some(
        (category) =>
          category.toLowerCase() === name.toLowerCase() &&
          category !== editingCategory
      )
    ) {
      setMessage("This category name already exists.");
      return;
    }

    const updatedCategories = categories.map((category) =>
      category === editingCategory ? name : category
    );

    const updatedOverrides = { ...overrides };

    products.forEach((product) => {
      if (getCategory(product) === editingCategory) {
        updatedOverrides[product.id] = {
          ...updatedOverrides[product.id],
          category: name,
        };
      }
    });

    saveCategories(updatedCategories);
    saveOverrides(updatedOverrides);

    if (categoryFilter === editingCategory) {
      setCategoryFilter(name);
    }

    setEditingCategory(null);
    setCategoryName("");
    setMessage("Category renamed locally.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        Loading inventory...
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
                Inventory & Categories
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor stock and manage product categories.
              </p>
            </div>

            <span className="w-fit rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700">
              Local / Simulated Admin Actions
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Total Products",
              value: products.length,
              icon: Package,
              color: "text-blue-600",
            },
            {
              title: "Low Stock",
              value: lowStockProducts.length,
              icon: AlertTriangle,
              color: "text-amber-600",
            },
            {
              title: "Out of Stock",
              value: outOfStockProducts.length,
              icon: Boxes,
              color: "text-red-600",
            },
            {
              title: "Categories",
              value: categories.length,
              icon: Package,
              color: "text-green-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{item.title}</p>
                  <Icon size={21} className={item.color} />
                </div>
                <h2 className={`mt-3 text-2xl font-bold ${item.color}`}>
                  {item.value}
                </h2>
              </div>
            );
          })}
        </div>

        {/* Alerts */}
        {(lowStockProducts.length > 0 ||
          outOfStockProducts.length > 0) && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2 font-semibold text-amber-800">
              <AlertTriangle size={19} />
              Inventory Alerts
            </div>

            <p className="mt-2 text-sm text-amber-700">
              {lowStockProducts.length} products have low stock and{" "}
              {outOfStockProducts.length} products are out of stock.
            </p>
          </div>
        )}

        {message && (
          <div className="mb-5 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {message}
            <button onClick={() => setMessage("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Inventory */}
        <div className="mb-8 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900">
              Inventory Overview
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Update stock quantities and assign categories.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-lg border px-4 py-2.5 pl-10 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border px-4 py-2.5 text-sm"
            >
              <option value="All">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="rounded-lg border px-4 py-2.5 text-sm"
            >
              <option value="All">All Stock</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              No products found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => {
                    const stock = getStock(product);

                    return (
                      <tr key={product.id} className="hover:bg-blue-50/30">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="h-12 w-12 rounded-lg border object-cover"
                            />
                            <span className="font-medium text-gray-800">
                              {product.title}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={getCategory(product)}
                            onChange={(e) =>
                              updateProductCategory(
                                product.id,
                                e.target.value
                              )
                            }
                            className="max-w-48 rounded-lg border px-2 py-2 text-xs"
                          >
                            {!categories.includes(getCategory(product)) && (
                              <option value={getCategory(product)}>
                                {getCategory(product)}
                              </option>
                            )}
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-5 py-4">
                          {editingStock === product.id ? (
                            <input
                              type="number"
                              min="0"
                              value={stockValue}
                              onChange={(e) =>
                                setStockValue(e.target.value)
                              }
                              className="w-24 rounded-lg border px-2 py-2"
                            />
                          ) : (
                            <span className="font-semibold text-gray-800">
                              {stock}
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {stock <= 0 ? (
                            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                              Out of Stock
                            </span>
                          ) : stock <= LOW_STOCK_LIMIT ? (
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                              Low Stock
                            </span>
                          ) : (
                            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                              In Stock
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          {editingStock === product.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => updateStock(product.id)}
                                className="rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700"
                                aria-label="Save stock"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={() => setEditingStock(null)}
                                className="rounded-lg border p-2 hover:bg-gray-50"
                                aria-label="Cancel stock edit"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingStock(product.id);
                                setStockValue(String(stock));
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-100"
                            >
                              <Pencil size={14} />
                              Edit Stock
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Management */}
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">
            Category Management
          </h2>
          <p className="mb-5 mt-1 text-sm text-gray-500">
            Create and rename product categories locally.
          </p>

          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter new category name..."
              className="flex-1 rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            />
            <button
              onClick={addCategory}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={17} />
              Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category}
                className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 p-4"
              >
                {editingCategory === category ? (
                  <>
                    <input
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="min-w-0 flex-1 rounded border px-2 py-1.5 text-sm"
                    />
                    <button
                      onClick={renameCategory}
                      className="rounded bg-blue-600 p-2 text-white"
                      aria-label="Save category name"
                    >
                      <Save size={15} />
                    </button>
                    <button
                      onClick={() => setEditingCategory(null)}
                      className="rounded border p-2"
                      aria-label="Cancel category rename"
                    >
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="break-all text-sm font-medium text-gray-700">
                      {category}
                    </span>
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setCategoryName(category);
                      }}
                      className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                      aria-label={`Rename ${category}`}
                    >
                      <Pencil size={16} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
