
const SIGNAL_KEYS = {
  recentlyViewed: "shopsphere-recently-viewed",
  searchHistory: "shopsphere-recent-searches",
  wishlist: "shopsphere-wishlist",
  cart: "shopsphere-cart",
  preferences: "shopsphere-recommendation-preferences",
};

function readStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;

  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

export function getCustomerSignals() {
  const recentViews = readStorage(SIGNAL_KEYS.recentlyViewed, []);
  const recentSearches = readStorage(SIGNAL_KEYS.searchHistory, []);
  const wishlistData = readStorage(SIGNAL_KEYS.wishlist, {});
  const cartData = readStorage(SIGNAL_KEYS.cart, {});
  const preferences = readStorage(SIGNAL_KEYS.preferences, {});

  // Zustand persist stores data inside the "state" property.
  const wishlist =
    wishlistData?.state?.wishlist ??
    wishlistData?.wishlist ??
    (Array.isArray(wishlistData) ? wishlistData : []);

  const cart =
    cartData?.state?.cart ??
    cartData?.cart ??
    [];

  return {
    recentlyViewed: Array.isArray(recentViews) ? recentViews : [],
    searchHistory: Array.isArray(recentSearches) ? recentSearches : [],
    wishlist: Array.isArray(wishlist) ? wishlist : [],
    cart: Array.isArray(cart) ? cart : [],
    preferences:
      preferences && typeof preferences === "object"
        ? preferences
        : {},
  };
}
