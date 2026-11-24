
"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export default function ReviewForm({ productId, onReviewSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [message, setMessage] = useState("");

  // Automatically load the logged-in customer's name.
  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("shopsphere-current-user") || "null"
      );

      if (savedUser) {
        setReviewerName(
          savedUser.name || savedUser.fullName || savedUser.username || ""
        );
      }
    } catch (error) {
      console.error("Unable to load customer details:", error);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!rating) {
      setMessage("Please select a star rating.");
      return;
    }

    if (!reviewTitle.trim() || !comment.trim()) {
      setMessage("Please fill in the review title and comment.");
      return;
    }

    if (!reviewerName.trim()) {
      setMessage("Please log in or enter your name before submitting.");
      return;
    }

    console.log("Reviewer name:", reviewerName);
console.log(
  "Logged-in user:",
  JSON.parse(localStorage.getItem("shopsphere-current-user") || "null")
);

    const newReview = {
      id: Date.now(),
      productId,
      rating,
      title: reviewTitle.trim(),
      comment: comment.trim(),
      reviewerName: reviewerName.trim(),
      date: new Date().toISOString(),
    };

    try {
      const existingReviews = JSON.parse(
        localStorage.getItem("shopsphere-reviews") || "[]"
      );

      const safeReviews = Array.isArray(existingReviews)
        ? existingReviews
        : [];

      localStorage.setItem(
        "shopsphere-reviews",
        JSON.stringify([...safeReviews, newReview])
      );

      onReviewSubmit?.(newReview);

      setRating(0);
      setReviewTitle("");
      setComment("");
      setMessage("Your review has been submitted successfully!");
    } catch (error) {
      console.error("Unable to save review:", error);
      setMessage("Unable to save your review. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border rounded-2xl p-6 space-y-5 shadow-sm"
    >
      <h3 className="text-xl font-bold text-gray-900">
        Write a Product Review
      </h3>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Your Rating
        </label>

        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${star} out of 5 stars`}
              className="focus:outline-none"
            >
              <Star
                size={28}
                className={
                  star <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Your Name
        </label>
        <input
          type="text"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          placeholder="Your name"
          className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Review Title
        </label>
        <input
          type="text"
          value={reviewTitle}
          onChange={(e) => setReviewTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">
          Your Review
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {message && (
        <p className="text-sm text-blue-600" role="status">
          {message}
        </p>
      )}

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
      >
        Submit Review
      </button>
    </form>
  );
}
