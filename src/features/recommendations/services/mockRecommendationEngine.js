
import { rankProducts } from "./scoringService";

const STRATEGIES = {
  RECENTLY_VIEWED: "Recently Viewed",
  SIMILAR_PRODUCTS: "Similar Products",
  CATEGORY_BASED: "Category-Based",
  PRICE_BASED: "Price-Based",
  WISHLIST_BASED: "Wishlist-Based",
  CART_BASED: "Cart-Based",
  FREQUENTLY_BOUGHT: "Frequently Bought Together",
  TRENDING: "Trending Products",
  PERSONALIZED: "Personalized For You",
};

function getSignalArray(signals, key) {
  return Array.isArray(signals?.[key]) ? signals[key] : [];
}

function uniqueProducts(products) {
  return [
    ...new Map(
      products.map((item) => [String(item.id), item])
    ).values(),
  ];
}

function getProductIds(items) {
  return new Set(
    items
      .map((item) => item?.id)
      .filter((id) => id !== undefined && id !== null)
      .map(String)
  );
}

function getProductsByIds(products, items) {
  const productMap = new Map(
    products.map((product) => [String(product.id), product])
  );

  // Preserve the order of the activity history.
  return items
    .map((item) => productMap.get(String(item?.id)))
    .filter(Boolean);
}

function getCategoryProducts(products, signalProducts) {
  const categories = new Set(
    signalProducts
      .map((item) => String(item?.category || "").toLowerCase())
      .filter(Boolean)
  );

  return products.filter((product) =>
    categories.has(String(product.category || "").toLowerCase())
  );
}

function getSimilarProducts(products, referenceProduct) {
  if (!referenceProduct) return [];

  return products.filter(
    (product) =>
      String(product.id) !== String(referenceProduct.id) &&
      Number(product.stock) > 0 &&
      product.category === referenceProduct.category
  );
}

function getPriceBasedProducts(products, signals) {
  const signalProducts = [
    ...getSignalArray(signals, "recentlyViewed"),
    ...getSignalArray(signals, "wishlist"),
    ...getSignalArray(signals, "cart"),
  ];

  const prices = signalProducts
    .map((item) => Number(item?.price))
    .filter((price) => price > 0);

  if (!prices.length) return [];

  const averagePrice =
    prices.reduce((total, price) => total + price, 0) /
    prices.length;

  return products.filter((product) => {
    const price = Number(product.price);

    return (
      price > 0 &&
      price >= averagePrice * 0.7 &&
      price <= averagePrice * 1.3
    );
  });
}

function getTrendingProducts(products) {
  return [...products]
    .filter(
      (product) =>
        Number(product.stock) > 0 &&
        Number(product.rating) > 0
    )
    .sort(
      (a, b) =>
        Number(b.rating || 0) - Number(a.rating || 0)
    );
}

// Find products with overlapping descriptive terms.
// This is a local heuristic, not actual purchase-history data.
function getProductWords(product) {
  const text = [
    product.title,
    product.description,
    product.category,
    product.brand,
    ...(Array.isArray(product.tags) ? product.tags : []),
  ]
    .join(" ")
    .toLowerCase();

  const ignoredWords = new Set([
    "the", "and", "for", "with", "from",
    "this", "that", "your", "you", "are",
    "new", "best", "good", "high",
  ]);

  return new Set(
    text
      .split(/[\s,.-]+/)
      .filter(
        (word) =>
          word.length > 2 && !ignoredWords.has(word)
      )
  );
}

function getComplementaryScore(product, cartProducts) {
  const productWords = getProductWords(product);

  if (!productWords.size || !cartProducts.length) return 0;

  let bestOverlap = 0;

  cartProducts.forEach((cartItem) => {
    const cartWords = getProductWords(cartItem);

    let matches = 0;

    productWords.forEach((word) => {
      if (cartWords.has(word)) matches++;
    });

    const overlap =
      matches / Math.max(1, Math.min(productWords.size, cartWords.size));

    bestOverlap = Math.max(bestOverlap, overlap);
  });

  return bestOverlap;
}

function getFrequentlyBoughtTogether(products, signals) {
  const cart = getSignalArray(signals, "cart");

  if (!cart.length) return [];

  const cartIds = getProductIds(cart);

  const cartCategories = new Set(
    cart
      .map((item) => String(item?.category || "").toLowerCase())
      .filter(Boolean)
  );

  return products
    .filter(
      (product) =>
        Number(product.stock) > 0 &&
        !cartIds.has(String(product.id)) &&
        !cartCategories.has(
          String(product.category || "").toLowerCase()
        )
    )
    .map((product) => ({
      ...product,
      complementaryScore: getComplementaryScore(product, cart),
    }))
    .filter((product) => product.complementaryScore > 0)
    .sort((a, b) => {
      const scoreDifference =
        b.complementaryScore - a.complementaryScore;

      if (scoreDifference !== 0) return scoreDifference;

      return Number(b.rating || 0) - Number(a.rating || 0);
    });
}

export function getRecommendationsByStrategy({
  strategy,
  products,
  signals,
  limit = 8,
  referenceProduct = null,
}) {
  if (!Array.isArray(products) || !signals || limit <= 0) {
    return [];
  }

  const recentlyViewed = getSignalArray(signals, "recentlyViewed");
  const wishlist = getSignalArray(signals, "wishlist");
  const cart = getSignalArray(signals, "cart");

  let candidates = [];
  let rankingSignals = signals;

  switch (strategy) {
    case STRATEGIES.RECENTLY_VIEWED: {
      return uniqueProducts(
        getProductsByIds(products, recentlyViewed)
      )
        .filter((product) => Number(product.stock) > 0)
        .slice(0, limit);
    }

    case STRATEGIES.SIMILAR_PRODUCTS:
      candidates = getSimilarProducts(products, referenceProduct);

      if (referenceProduct) {
        rankingSignals = {
          ...signals,
          recentlyViewed: [
            referenceProduct,
            ...recentlyViewed,
          ],
        };
      }
      break;

    case STRATEGIES.CATEGORY_BASED:
      candidates = getCategoryProducts(products, [
        ...recentlyViewed,
        ...wishlist,
        ...cart,
      ]);
      break;

    case STRATEGIES.PRICE_BASED:
      candidates = getPriceBasedProducts(products, signals);
      break;

    case STRATEGIES.WISHLIST_BASED:
      candidates = getCategoryProducts(products, wishlist);
      break;

    case STRATEGIES.CART_BASED:
      candidates = getCategoryProducts(products, cart);
      break;

    case STRATEGIES.FREQUENTLY_BOUGHT:
      candidates = getFrequentlyBoughtTogether(products, signals);
      break;

    case STRATEGIES.TRENDING:
      candidates = getTrendingProducts(products);
      break;

    case STRATEGIES.PERSONALIZED:
      candidates = products;
      break;

    default:
      return [];
  }

  const excludedIds = [
    ...cart.map((item) => item.id),
    ...wishlist.map((item) => item.id),
    ...(referenceProduct ? [referenceProduct.id] : []),
  ];

  const rankedProducts = rankProducts(
    uniqueProducts(candidates),
    rankingSignals,
    excludedIds
  );

  return rankedProducts.slice(0, limit);
}

export { STRATEGIES };
