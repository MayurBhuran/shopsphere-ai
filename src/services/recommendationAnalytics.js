
const STORAGE_KEY = "shopsphere-recommendation-analytics";

export function trackRecommendationEvent({
  type,
  strategy,
  productId,
}) {
  if (typeof window === "undefined") return;

  const allowedTypes = ["impression", "click", "conversion"];

  if (!allowedTypes.includes(type) || !strategy) return;

  try {
    const events = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    events.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      strategy,
      productId: productId ?? null,
      timestamp: new Date().toISOString(),
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error("Recommendation analytics error:", error);
  }
}

export function getRecommendationAnalytics() {
  if (typeof window === "undefined") return [];

  try {
    const events = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(events) ? events : [];
  } catch (error) {
    console.error("Unable to read recommendation analytics:", error);
    return [];
  }
}
