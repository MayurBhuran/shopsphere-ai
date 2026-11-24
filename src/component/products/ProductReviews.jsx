
"use client";

import { useEffect, useMemo, useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import ReviewForm from "./ReviewForm";

const VOTES_STORAGE_KEY = "shopsphere-review-votes";

export default function ProductReviews({ product }) {
  const [customerReviews, setCustomerReviews] = useState([]);
  const [sortBy, setSortBy] = useState("recent");
  const [votes, setVotes] = useState({});

  // Load customer reviews and saved votes.
  useEffect(() => {
    try {
      const savedReviews = JSON.parse(
        localStorage.getItem("shopsphere-reviews") || "[]"
      );

      setCustomerReviews(
        (Array.isArray(savedReviews) ? savedReviews : []).filter(
          (review) => String(review.productId) === String(product.id)
        )
      );

      const savedVotes = JSON.parse(
        localStorage.getItem(VOTES_STORAGE_KEY) || "{}"
      );

      setVotes(
        savedVotes && typeof savedVotes === "object" && !Array.isArray(savedVotes)
          ? savedVotes
          : {}
      );
    } catch (error) {
      console.error("Unable to load reviews or votes:", error);
      setCustomerReviews([]);
      setVotes({});
    }
  }, [product.id]);

  // Add a newly submitted customer review.
  const handleReviewSubmit = (newReview) => {
    setCustomerReviews((previousReviews) => [
      newReview,
      ...previousReviews,
    ]);
  };

  // DummyJSON reviews.
  const existingReviews = (product.reviews || []).map((review) => ({
    ...review,
    title: review.title || "",
  }));

  const reviews = [...customerReviews, ...existingReviews];

  // Create a stable key for each review.
  const getReviewKey = (review) => {
    if (review.id != null) {
      return `${review.productId ?? product.id}-${review.id}`;
    }

    return [
      product.id,
      review.reviewerName || review.reviewer || "",
      review.date || "",
      review.rating || "",
      review.title || "",
      review.comment || review.body || "",
    ].join("|");
  };

  // Sort reviews.
  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];

    if (sortBy === "highest") {
      return sorted.sort(
        (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
      );
    }

    if (sortBy === "lowest") {
      return sorted.sort(
        (a, b) => Number(a.rating || 0) - Number(b.rating || 0)
      );
    }

    // Newest customer reviews first.
    return sorted.sort((a, b) => {
      const aIsCustomerReview = customerReviews.some(
        (review) => String(review.id) === String(a.id)
      );

      const bIsCustomerReview = customerReviews.some(
        (review) => String(review.id) === String(b.id)
      );

      if (aIsCustomerReview && !bIsCustomerReview) return -1;
      if (!aIsCustomerReview && bIsCustomerReview) return 1;

      return new Date(b.date || 0).getTime() -
        new Date(a.date || 0).getTime();
    });
  }, [reviews, sortBy, customerReviews]);

  // Helpful / Not Helpful voting.
  const handleVote = (review, voteType) => {
    const reviewKey = getReviewKey(review);
    const previousVote = votes[reviewKey] || {
      helpful: 0,
      notHelpful: 0,
      userVote: null,
    };

    // Prevent clicking the same vote repeatedly.
    if (previousVote.userVote === voteType) {
      return;
    }

    const updatedVote = {
      ...previousVote,
      helpful: Number(previousVote.helpful || 0),
      notHelpful: Number(previousVote.notHelpful || 0),
    };

    // Remove the previous vote if the user changes their choice.
    if (previousVote.userVote === "helpful") {
      updatedVote.helpful = Math.max(0, updatedVote.helpful - 1);
    }

    if (previousVote.userVote === "notHelpful") {
      updatedVote.notHelpful = Math.max(0, updatedVote.notHelpful - 1);
    }

    // Add the new vote.
    if (voteType === "helpful") {
      updatedVote.helpful += 1;
    } else {
      updatedVote.notHelpful += 1;
    }

    updatedVote.userVote = voteType;

    const updatedVotes = {
      ...votes,
      [reviewKey]: updatedVote,
    };

    try {
      localStorage.setItem(
        VOTES_STORAGE_KEY,
        JSON.stringify(updatedVotes)
      );

      setVotes(updatedVotes);
    } catch (error) {
      console.error("Unable to save review vote:", error);
    }
  };

  // Average rating.
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) => total + Number(review.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  // Rating distribution.
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter(
      (review) => Number(review.rating) === rating
    ).length,
  }));

  return (
    <section className="mt-10 rounded-xl border bg-white p-6">
      <h2 className="text-2xl font-bold text-gray-800">
        Customer Reviews
      </h2>

      {/* Rating Summary */}
      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <p className="text-4xl font-bold text-gray-800">
            {averageRating} / 5
          </p>

          <p className="mt-2 text-yellow-500">
            {"★".repeat(Math.round(Number(averageRating)))}
            {"☆".repeat(5 - Math.round(Number(averageRating)))}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Based on {reviews.length} customer reviews
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-3">
          {ratingCounts.map((item) => (
            <div key={item.rating} className="flex items-center gap-3">
              <span className="w-10 text-sm">
                {item.rating} ★
              </span>

              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-yellow-400"
                  style={{
                    width: `${
                      reviews.length
                        ? (item.count / reviews.length) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <span className="w-6 text-sm text-gray-500">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Heading and Sorting */}
      <div className="mt-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h3 className="text-lg font-semibold">
          What Customers Say ({reviews.length})
        </h3>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort customer reviews"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="recent">Newest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      {/* Individual Reviews */}
      <div className="mt-5 space-y-5">
        {sortedReviews.length === 0 ? (
          <p className="text-gray-500">
            No reviews available for this product yet. Be the first to review!
          </p>
        ) : (
          sortedReviews.map((review, index) => {
            const reviewKey = getReviewKey(review);

            const reviewVote = votes[reviewKey] || {
              helpful: 0,
              notHelpful: 0,
              userVote: null,
            };

            return (
              <div
                key={reviewKey || `${review.reviewerName}-${index}`}
                className="border-t pt-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold text-gray-800">
                    {review.reviewerName || review.reviewer || "Anonymous"}
                  </h4>

                  <span className="text-sm text-gray-500">
                    {review.date
                      ? new Date(review.date).toLocaleDateString("en-IN")
                      : ""}
                  </span>
                </div>

                <p className="mt-2 text-yellow-500">
                  {"★".repeat(Number(review.rating || 0))}
                  {"☆".repeat(5 - Number(review.rating || 0))}
                </p>

                {review.title && (
                  <h5 className="mt-2 font-semibold text-gray-800">
                    {review.title}
                  </h5>
                )}

                <p className="mt-2 leading-6 text-gray-600">
                  {review.comment || review.body || ""}
                </p>

                {/* Helpful Voting */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-sm text-gray-500">
                    Was this review helpful?
                  </span>

                  <button
                    type="button"
                    onClick={() => handleVote(review, "helpful")}
                    aria-pressed={reviewVote.userVote === "helpful"}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      reviewVote.userVote === "helpful"
                        ? "border-green-300 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <ThumbsUp size={15} />
                    Helpful ({reviewVote.helpful})
                  </button>

                  <button
                    type="button"
                    onClick={() => handleVote(review, "notHelpful")}
                    aria-pressed={reviewVote.userVote === "notHelpful"}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      reviewVote.userVote === "notHelpful"
                        ? "border-red-300 bg-red-50 text-red-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <ThumbsDown size={15} />
                    Not Helpful ({reviewVote.notHelpful})
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review Submission Form */}
      <div className="mt-10 border-t pt-8">
        <ReviewForm
          productId={product.id}
          onReviewSubmit={handleReviewSubmit}
        />
      </div>
    </section>
  );
}
