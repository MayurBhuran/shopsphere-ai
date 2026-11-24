
import {
  getRecommendationsByStrategy,
  STRATEGIES,
} from "./mockRecommendationEngine";

const mockRecommendationProvider = {
  name: "mock",

  getRecommendations({
    strategy,
    products,
    signals,
    limit = 8,
    referenceProduct = null,
  }) {
    return getRecommendationsByStrategy({
      strategy,
      products,
      signals,
      limit,
      referenceProduct,
    });
  },
};

const recommendationProvider = mockRecommendationProvider;

export function getRecommendations(params) {
  return recommendationProvider.getRecommendations(params);
}

export { STRATEGIES };
