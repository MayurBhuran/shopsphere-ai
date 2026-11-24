
const WEIGHTS = {
  categoryMatch: 0.20,
  priceSimilarity: 0.15,
  tagOverlap: 0.15,
  normalizedRating: 0.10,
  recentlyViewedRelation: 0.15,
  wishlistRelation: 0.10,
  cartRelation: 0.15,
};

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function getShoppingSignals(signals) {
  return [
    ...(signals.recentlyViewed || []),
    ...(signals.wishlist || []),
    ...(signals.cart || []),
  ];
}

function getTagOverlap(product, signals) {
  const productText = [
    product.title,
    product.description,
    product.category,
    product.brand,
    ...(product.tags || []),
  ]
    .join(" ")
    .toLowerCase();

  const signalWords = new Set(
    getShoppingSignals(signals)
      .flatMap((item) =>
        [
          item.title || "",
          item.description || "",
          item.category || "",
          item.brand || "",
          ...(item.tags || []),
        ]
          .join(" ")
          .toLowerCase()
          .split(/[\s,.-]+/)
      )
      .filter((word) => word.length > 2)
  );

  if (signalWords.size === 0) return 0;

  let matches = 0;

  signalWords.forEach((word) => {
    if (productText.includes(word)) matches++;
  });

  return clamp(matches / Math.min(signalWords.size, 10));
}

function getCategoryMatch(product, signals) {
  const signalProducts = getShoppingSignals(signals);

  if (!signalProducts.length) return 0;

  const matchingProducts = signalProducts.filter(
    (item) =>
      normalizeText(item.category) === normalizeText(product.category)
  );

  return clamp(matchingProducts.length / signalProducts.length);
}

function getPriceSimilarity(product, signals) {
  const signalProducts = getShoppingSignals(signals).filter(
    (item) => Number(item.price) > 0
  );

  if (!signalProducts.length || Number(product.price) <= 0) {
    return 0;
  }

  const averagePrice =
    signalProducts.reduce(
      (total, item) => total + Number(item.price),
      0
    ) / signalProducts.length;

  const difference =
    Math.abs(Number(product.price) - averagePrice) / averagePrice;

  return clamp(1 - difference);
}

function getRatingScore(product) {
  return clamp(Number(product.rating || 0) / 5);
}

function getRelationScore(product, signalProducts) {
  if (!signalProducts?.length) return 0;

  return signalProducts.some(
    (item) => Number(item.id) === Number(product.id)
  )
    ? 1
    : 0;
}

// Score products using the customer's saved preferences.
function getPreferenceScore(product, preferences = {}) {
  let score = 0;
  let factors = 0;

  const preferredCategories = (
    preferences.preferredCategories || []
  ).map(normalizeText);

  const preferredBrands = (
    preferences.preferredBrands || []
  ).map(normalizeText);

  if (preferredCategories.length > 0) {
    score += preferredCategories.includes(
      normalizeText(product.category)
    )
      ? 1
      : 0;
    factors++;
  }

  if (preferredBrands.length > 0) {
    score += preferredBrands.includes(
      normalizeText(product.brand)
    )
      ? 1
      : 0;
    factors++;
  }

  const hasPricePreference =
    preferences.minPrice !== undefined ||
    preferences.maxPrice !== undefined;

  if (hasPricePreference) {
    const price = Number(product.price || 0);
    const minPrice = Number(preferences.minPrice ?? 0);
    const maxPrice = Number(preferences.maxPrice ?? Infinity);

    score += price >= minPrice && price <= maxPrice ? 1 : 0;
    factors++;
  }

  return factors > 0 ? score / factors : 0;
}

export function calculateProductScore(product, signals) {
  const components = {
    categoryMatch: getCategoryMatch(product, signals),
    priceSimilarity: getPriceSimilarity(product, signals),
    tagOverlap: getTagOverlap(product, signals),
    normalizedRating: getRatingScore(product),
    recentlyViewedRelation: getRelationScore(
      product,
      signals.recentlyViewed
    ),
    wishlistRelation: getRelationScore(
      product,
      signals.wishlist
    ),
    cartRelation: getRelationScore(
      product,
      signals.cart
    ),
  };

  const baseScore = Object.entries(WEIGHTS).reduce(
    (total, [key, weight]) =>
      total + components[key] * weight,
    0
  );

  const preferenceScore = getPreferenceScore(
    product,
    signals.preferences || {}
  );

  const score =
    signals.preferences?.personalizationEnabled === false
      ? getRatingScore(product)
      : baseScore * 0.8 + preferenceScore * 0.2;

  return {
    score: Number(clamp(score).toFixed(4)),
    components,
    preferenceScore: Number(preferenceScore.toFixed(4)),
  };
}

export function rankProducts(products, signals, excludeIds = []) {
  const preferences = signals.preferences || {};

  const availableProducts = products.filter(
    (product) =>
      Number(product.stock) > 0 &&
      !excludeIds.includes(product.id)
  );

  // Personalization disabled: rank by rating only.
  if (preferences.personalizationEnabled === false) {
    return availableProducts
      .map((product) => ({
        ...product,
        recommendationScore: getRatingScore(product),
        scoreBreakdown: {
          normalizedRating: getRatingScore(product),
        },
        preferenceScore: 0,
      }))
      .sort(
        (a, b) =>
          b.recommendationScore - a.recommendationScore
      );
  }

  // Apply the selected price range as a recommendation filter.
  const hasPricePreference =
    preferences.minPrice !== undefined ||
    preferences.maxPrice !== undefined;

  const minPrice = Number(preferences.minPrice ?? 0);
  const maxPrice = Number(preferences.maxPrice ?? Infinity);

  const filteredProducts = hasPricePreference
    ? availableProducts.filter((product) => {
        const price = Number(product.price || 0);
        return price >= minPrice && price <= maxPrice;
      })
    : availableProducts;

  return filteredProducts
    .map((product) => {
      const result = calculateProductScore(product, signals);

      return {
        ...product,
        recommendationScore: result.score,
        scoreBreakdown: result.components,
        preferenceScore: result.preferenceScore,
      };
    })
    .sort(
      (a, b) =>
        b.recommendationScore - a.recommendationScore
    );
}
