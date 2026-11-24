
"use client";

import { useEffect, useState } from "react";
import {
  RotateCcw,
  SlidersHorizontal,
  Eye,
  Search,
  Heart,
  ShoppingCart,
  Info,
} from "lucide-react";

const PREFERENCES_KEY = "shopsphere-recommendation-preferences";
const RECENT_VIEWS_KEY = "shopsphere-recently-viewed";
const SEARCH_HISTORY_KEY = "shopsphere-recent-searches";
const WISHLIST_KEY = "shopsphere-wishlist";
const CART_KEY = "shopsphere-cart";

const categories = [
  "beauty",
  "fragrances",
  "furniture",
  "groceries",
  "home-decoration",
  "kitchen-accessories",
  "laptops",
  "mens-shirts",
  "mens-shoes",
  "mens-watches",
  "mobile-accessories",
  "motorcycle",
  "skin-care",
  "smartphones",
  "sports-accessories",
  "sunglasses",
  "tablets",
  "tops",
  "vehicle",
  "womens-bags",
  "womens-dresses",
  "womens-jewellery",
  "womens-shoes",
  "womens-watches",
];

const defaultPreferences = {
  preferredCategories: [],
  preferredBrands: [],
  minPrice: 0,
  maxPrice: 1000,
  personalizationEnabled: true,
};

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function getProductName(item) {
  if (typeof item === "string") return item;

  return (
    item?.title ||
    item?.name ||
    item?.product?.title ||
    item?.product?.name ||
    "Viewed product"
  );
}

function getSearchName(item) {
  if (typeof item === "string") return item;

  return (
    item?.query ||
    item?.searchTerm ||
    item?.term ||
    item?.keyword ||
    ""
  );
}

function getActivityData() {
  const recentViews = readStorage(RECENT_VIEWS_KEY, []);
  const recentSearches = readStorage(SEARCH_HISTORY_KEY, []);
  const wishlistData = readStorage(WISHLIST_KEY, {});
  const cartData = readStorage(CART_KEY, {});

  const wishlist =
    wishlistData?.state?.wishlist ??
    wishlistData?.wishlist ??
    (Array.isArray(wishlistData) ? wishlistData : []);

  const cart =
    cartData?.state?.cart ??
    cartData?.cart ??
    [];

  return {
    recentlyViewed: Array.isArray(recentViews)
      ? recentViews.map(getProductName).filter(Boolean)
      : [],
    searchHistory: Array.isArray(recentSearches)
      ? recentSearches.map(getSearchName).filter(Boolean)
      : [],
    wishlistCount: Array.isArray(wishlist) ? wishlist.length : 0,
    cartCount: Array.isArray(cart) ? cart.length : 0,
  };
}

export default function RecommendationPreferences() {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [brandInput, setBrandInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [activity, setActivity] = useState({
    recentlyViewed: [],
    searchHistory: [],
    wishlistCount: 0,
    cartCount: 0,
  });

  useEffect(() => {
    try {
      const stored = readStorage(PREFERENCES_KEY, null);

      if (stored) {
        setPreferences({
          ...defaultPreferences,
          ...stored,
        });
      }

      setActivity(getActivityData());
    } catch (error) {
      console.error("Could not load recommendation data:", error);
    }
  }, []);

  function refreshActivity() {
    setActivity(getActivityData());
  }

  function updatePreference(key, value) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
    setSaved(false);
  }

  function toggleCategory(category) {
    const selected = preferences.preferredCategories;

    updatePreference(
      "preferredCategories",
      selected.includes(category)
        ? selected.filter((item) => item !== category)
        : [...selected, category]
    );
  }

  function addBrand() {
    const brand = brandInput.trim();

    if (
      !brand ||
      preferences.preferredBrands.some(
        (item) => item.toLowerCase() === brand.toLowerCase()
      )
    ) {
      return;
    }

    updatePreference("preferredBrands", [
      ...preferences.preferredBrands,
      brand,
    ]);

    setBrandInput("");
  }

  function removeBrand(brand) {
    updatePreference(
      "preferredBrands",
      preferences.preferredBrands.filter((item) => item !== brand)
    );
  }

 
function savePreferences() {
  if (preferences.maxPrice < preferences.minPrice) return;

  try {
    localStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify(preferences)
    );

    // Notify recommendation hooks that preferences changed
    window.dispatchEvent(
      new Event("shopsphere-signals-updated")
    );

    setSaved(true);
  } catch (error) {
    console.error("Could not save preferences:", error);
    setSaved(false);
  }
}



function resetActivity() {
  const confirmed = window.confirm(
    "Reset your recently viewed products and search history? Your cart and wishlist will remain unchanged."
  );

  if (!confirmed) return;

  localStorage.removeItem(RECENT_VIEWS_KEY);
  localStorage.removeItem(SEARCH_HISTORY_KEY);

  setPreferences(defaultPreferences);

  localStorage.setItem(
    PREFERENCES_KEY,
    JSON.stringify(defaultPreferences)
  );

  setBrandInput("");
  setSaved(true);
  refreshActivity();

  // Notify recommendation hooks that activity and preferences changed
  window.dispatchEvent(
    new Event("shopsphere-signals-updated")
  );
}


  return (
    <section className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-8 flex items-start gap-3">
        <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
          <SlidersHorizontal size={23} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Recommendation Preferences
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Customize how ShopSphere AI discovers products for you.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Recommendation Transparency */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="mb-5 flex items-center gap-2">
            <Info className="text-blue-600" size={21} />
            <h3 className="text-lg font-bold text-gray-900">
              How Your Recommendations Work
            </h3>
          </div>

          <p className="mb-5 text-sm leading-6 text-gray-600">
            ShopSphere AI uses your shopping activity and preferences
            to rank relevant products. Here are the signals currently
            available in this browser.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-gray-700">
                <Eye size={18} className="text-blue-600" />
                <h4 className="font-semibold">Recently Viewed</h4>
              </div>

              {activity.recentlyViewed.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-600">
                  {activity.recentlyViewed.slice(0, 5).map((item, index) => (
                    <li key={`${item}-${index}`} className="truncate">
                      • {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No recently viewed products yet.
                </p>
              )}
            </div>

            <div className="rounded-lg bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-gray-700">
                <Search size={18} className="text-blue-600" />
                <h4 className="font-semibold">Recent Searches</h4>
              </div>

              {activity.searchHistory.length > 0 ? (
                <ul className="space-y-1 text-sm text-gray-600">
                  {activity.searchHistory.slice(0, 5).map((item, index) => (
                    <li key={`${item}-${index}`} className="truncate">
                      • {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No recent searches yet.
                </p>
              )}
            </div>

            <div className="rounded-lg bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-gray-700">
                <Heart size={18} className="text-blue-600" />
                <h4 className="font-semibold">Wishlist Activity</h4>
              </div>
              <p className="text-sm text-gray-600">
                {activity.wishlistCount} product(s) in your wishlist.
              </p>
            </div>

            <div className="rounded-lg bg-white p-4">
              <div className="mb-2 flex items-center gap-2 text-gray-700">
                <ShoppingCart size={18} className="text-blue-600" />
                <h4 className="font-semibold">Cart Activity</h4>
              </div>
              <p className="text-sm text-gray-600">
                {activity.cartCount} product(s) in your cart.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-white p-4">
            <h4 className="mb-2 font-semibold text-gray-800">
              Your Preference Signals
            </h4>

            <p className="text-sm text-gray-600">
              Categories:{" "}
              {preferences.preferredCategories.length
                ? preferences.preferredCategories
                    .map((item) => item.replaceAll("-", " "))
                    .join(", ")
                : "No preferred categories selected"}
            </p>

            <p className="mt-2 text-sm text-gray-600">
              Brands:{" "}
              {preferences.preferredBrands.length
                ? preferences.preferredBrands.join(", ")
                : "No preferred brands selected"}
            </p>

            <p className="mt-2 text-sm text-gray-600">
              Preferred price range: ${preferences.minPrice} – $
              {preferences.maxPrice}
            </p>

            <p className="mt-2 text-sm text-gray-600">
              Personalization:{" "}
              {preferences.personalizationEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>

          <p className="mt-4 text-xs leading-5 text-gray-500">
            This panel displays locally stored activity and preferences.
            Recommendations may also use product ratings and product
            relationships when ranking items.
          </p>

          <button
            type="button"
            onClick={refreshActivity}
            className="mt-3 text-sm font-semibold text-blue-700 hover:underline"
          >
            Refresh activity
          </button>
        </div>

        {/* Personalization Toggle */}
        <div className="flex items-center justify-between gap-4 rounded-xl bg-blue-50 p-4">
          <div>
            <h3 className="font-semibold text-gray-900">
              Personalized recommendations
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Use your shopping activity and preferences to suggest products.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              updatePreference(
                "personalizationEnabled",
                !preferences.personalizationEnabled
              )
            }
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${
              preferences.personalizationEnabled
                ? "bg-blue-600"
                : "bg-gray-300"
            }`}
            aria-label="Toggle personalized recommendations"
            aria-pressed={preferences.personalizationEnabled}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                preferences.personalizationEnabled
                  ? "left-6"
                  : "left-1"
              }`}
            />
          </button>
        </div>

        {/* Categories */}
        <div>
          <h3 className="mb-3 font-semibold text-gray-900">
            Preferred Categories
          </h3>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const selected =
                preferences.preferredCategories.includes(category);

              return (
                <button
                  type="button"
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`rounded-full border px-3 py-2 text-sm capitalize transition ${
                    selected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-400"
                  }`}
                >
                  {category.replaceAll("-", " ")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Brands */}
        <div>
          <h3 className="mb-3 font-semibold text-gray-900">
            Preferred Brands
          </h3>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={brandInput}
              onChange={(event) => setBrandInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addBrand();
                }
              }}
              placeholder="Enter a brand name"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={addBrand}
              className="rounded-lg bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-700"
            >
              Add Brand
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {preferences.preferredBrands.map((brand) => (
              <span
                key={brand}
                className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-2 text-sm text-gray-700"
              >
                {brand}
                <button
                  type="button"
                  onClick={() => removeBrand(brand)}
                  className="font-bold text-red-500"
                  aria-label={`Remove ${brand}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="mb-3 font-semibold text-gray-900">
            Preferred Price Range
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Minimum price ($)
              </label>
              <input
                type="number"
                min="0"
                value={preferences.minPrice}
                onChange={(event) =>
                  updatePreference(
                    "minPrice",
                    Math.max(0, Number(event.target.value))
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-600">
                Maximum price ($)
              </label>
              <input
                type="number"
                min={preferences.minPrice}
                value={preferences.maxPrice}
                onChange={(event) =>
                  updatePreference(
                    "maxPrice",
                    Math.max(0, Number(event.target.value))
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {preferences.maxPrice < preferences.minPrice && (
            <p className="mt-2 text-sm text-red-600">
              Maximum price must be greater than or equal to minimum price.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-6 sm:flex-row">
          <button
            type="button"
            onClick={savePreferences}
            disabled={preferences.maxPrice < preferences.minPrice}
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Preferences
          </button>

          <button
            type="button"
            onClick={resetActivity}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw size={17} />
            Reset Recommendation Activity
          </button>
        </div>

        {saved && (
          <p className="text-sm font-medium text-green-600" role="status">
            Preferences saved successfully.
          </p>
        )}

        <p className="text-xs leading-5 text-gray-500">
          Your preferences and recommendation activity are stored locally in
          this browser. Resetting activity does not remove your cart or wishlist.
        </p>
      </div>
    </section>
  );
}
