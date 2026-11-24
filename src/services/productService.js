
const API_URL = "https://dummyjson.com/products";

const ADMIN_PRODUCTS_KEY = "shopsphere-admin-products";
const INVENTORY_OVERRIDES_KEY = "shopsphere-inventory-overrides";

// Fetch original products from DummyJSON.
export async function getApiProducts() {
  const response = await fetch(`${API_URL}?limit=100`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await response.json();
  return data.products || [];
}

// Read products created or managed in Admin.
export function getAdminProducts() {
  if (typeof window === "undefined") return [];

  try {
    const products = JSON.parse(
      localStorage.getItem(ADMIN_PRODUCTS_KEY) || "[]"
    );

    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.error("Admin products loading error:", error);
    return [];
  }
}

// Read inventory and category overrides saved by Admin.
export function getInventoryOverrides() {
  if (typeof window === "undefined") return {};

  try {
    const overrides = JSON.parse(
      localStorage.getItem(INVENTORY_OVERRIDES_KEY) || "{}"
    );

    return overrides && typeof overrides === "object" &&
      !Array.isArray(overrides)
      ? overrides
      : {};
  } catch (error) {
    console.error("Inventory overrides loading error:", error);
    return {};
  }
}

// Apply Admin inventory changes to every product.
export function applyInventoryOverrides(products) {
  if (typeof window === "undefined") return products;

  const overrides = getInventoryOverrides();

  return products.map((product) => {
    const productOverride = overrides[String(product.id)];

    if (!productOverride) return product;

    return {
      ...product,
      ...(productOverride.stock !== undefined && {
        stock: Number(productOverride.stock),
      }),
      ...(productOverride.category !== undefined && {
        category: productOverride.category,
      }),
    };
  });
}

// Fetch complete storefront catalogue.
export async function getProducts() {
  const apiProducts = await getApiProducts();

  if (typeof window === "undefined") {
    return apiProducts;
  }

  const adminProducts = getAdminProducts();

  const adminIds = new Set(
    adminProducts.map((product) => String(product.id))
  );

  const remainingApiProducts = apiProducts.filter(
    (product) => !adminIds.has(String(product.id))
  );

  const combinedProducts = [
    ...adminProducts,
    ...remainingApiProducts,
  ];

  return applyInventoryOverrides(combinedProducts);
}

// Fetch product categories.
export async function getCategories() {
  const response = await fetch(`${API_URL}/category-list`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const apiCategories = await response.json();

  if (typeof window === "undefined") {
    return apiCategories;
  }

  const allProducts = await getProducts();

  const productCategories = allProducts
    .map((product) => product.category)
    .filter(Boolean);

  return [
    ...new Set([
      ...apiCategories,
      ...productCategories,
    ]),
  ];
}

// Search across the complete catalogue.
export async function searchProducts(query) {
  const products = await getProducts();
  const searchTerm = query.trim().toLowerCase();

  if (!searchTerm) return products;

  return products.filter((product) => {
    const searchableText = [
      product.title,
      product.description,
      product.category,
      product.brand,
      ...(product.tags || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(searchTerm);
  });
}

// Fetch one product, including Admin-created products.
export async function getProductById(id) {
  const products = await getProducts();

  const product = products.find(
    (item) => String(item.id) === String(id)
  );

  if (!product) {
    throw new Error("Product is no longer available");
  }

  return product;
}
