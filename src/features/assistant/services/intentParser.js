
const CATEGORY_KEYWORDS = {
  smartphones: ["phone", "phones", "smartphone", "smartphones", "mobile"],
  laptops: ["laptop", "laptops", "notebook"],
  beauty: ["beauty", "makeup", "cosmetics"],
  fragrances: ["fragrance", "fragrances", "perfume", "perfumes"],
  furniture: ["furniture", "sofa", "chair", "table"],
  groceries: ["grocery", "groceries", "food"],
  "home-decoration": ["home decoration", "decoration", "decor"],
  "mens-shirts": ["men shirts", "mens shirts", "men's shirts"],
  "mens-shoes": ["men shoes", "mens shoes", "men's shoes"],
  "womens-dresses": ["women dresses", "womens dresses", "women's dresses"],
  "womens-shoes": ["women shoes", "womens shoes", "women's shoes"],
  tablets: ["tablet", "tablets", "ipad"],
  "skin-care": ["skin care", "skincare"],
  "sports-accessories": ["sports", "sports accessories"],
  sunglasses: ["sunglasses", "sun glasses"],
  "mobile-accessories": ["mobile accessories", "phone accessories"],
};

function normalizeText(text) {
  return String(text || "").toLowerCase().trim();
}

function extractCategory(message) {
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => message.includes(keyword))) {
      return category;
    }
  }

  return null;
}

function extractMaxPrice(message) {
  const patterns = [
    /(?:under|below|less than|maximum|max|within)\s*(?:rs\.?|₹|\$)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
    /(?:budget|price range)\s*(?:of|is|:)?\s*(?:rs\.?|₹|\$)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);

    if (match) {
      return Number(match[1].replace(/,/g, ""));
    }
  }

  return null;
}

function extractMinRating(message) {
  const match = message.match(
    /(?:above|over|at least|minimum|min)\s*(\d(?:\.\d)?)\s*(?:star|stars|rating)?/i
  );

  if (!match) return null;

  const rating = Number(match[1]);

  return rating >= 1 && rating <= 5 ? rating : null;
}

function extractColor(message) {
  const colors = [
    "black",
    "white",
    "blue",
    "red",
    "green",
    "pink",
    "purple",
    "yellow",
    "brown",
    "grey",
    "gray",
    "silver",
    "gold",
  ];

  return colors.find((color) => message.includes(color)) || null;
}

function extractBrand(message) {
  const brands = [
    "apple",
    "samsung",
    "samsung",
    "dell",
    "hp",
    "lenovo",
    "acer",
    "asus",
    "nike",
    "adidas",
    "puma",
    "gucci",
    "oppo",
    "vivo",
    "oneplus",
    "sony",
  ];

  return brands.find((brand) => message.includes(brand)) || null;
}

export function parseShoppingIntent(userMessage) {
  const message = normalizeText(userMessage);

  if (!message) {
    return {
      type: "fallback",
      message: "Please tell me what product you are looking for.",
    };
  }

  // Help and greeting messages
  if (/^(hi|hello|hey|good morning|good evening)\b/.test(message)) {
    return {
      type: "greeting",
      message: "Hello! I can help you discover products. What are you looking for?",
    };
  }

  if (
    message.includes("help") ||
    message.includes("what can you do")
  ) {
    return {
      type: "help",
      message: "I can find products by category, budget, rating, brand and color.",
    };
  }

  // More like a previously shown product
  const moreLikeMatch = message.match(
    /(?:more|similar)\s+(?:products?\s+)?like\s+(?:the\s+)?(?:second|2nd|first|1st|third|3rd)\s+(?:product|one)?/i
  );

  if (moreLikeMatch) {
    const referenceIndex = /second|2nd/i.test(message)
      ? 1
      : /third|3rd/i.test(message)
        ? 2
        : 0;

    return {
      type: "similar_products",
      referenceIndex,
    };
  }

  // Comparison and price adjustment requests
  if (
    message.includes("cheaper") ||
    message.includes("less expensive")
  ) {
    return {
      type: "price_comparison",
      direction: "cheaper",
    };
  }

  if (
    message.includes("more expensive") ||
    message.includes("costlier")
  ) {
    return {
      type: "price_comparison",
      direction: "expensive",
    };
  }

  if (
    message.includes("better rated") ||
    message.includes("higher rating") ||
    message.includes("best rated")
  ) {
    return {
      type: "rating_comparison",
      direction: "higher",
    };
  }

  // Product search intent
  const category = extractCategory(message);
  const maxPrice = extractMaxPrice(message);
  const minRating = extractMinRating(message);
  const color = extractColor(message);
  const brand = extractBrand(message);

  if (category || maxPrice !== null || minRating !== null || color || brand) {
    return {
      type: "product_search",
      category,
      maxPrice,
      minRating,
      color,
      brand,
    };
  }

  // Topic change or general product request
  if (
    message.includes("show me") ||
    message.includes("find") ||
    message.includes("recommend") ||
    message.includes("looking for") ||
    message.includes("suggest")
  ) {
    return {
      type: "product_search",
      category: null,
      maxPrice: null,
      minRating: null,
      color: null,
      brand: null,
    };
  }

  return {
    type: "fallback",
    message:
      "I didn't fully understand that. Could you specify a product category, budget, brand or rating?",
  };
}
