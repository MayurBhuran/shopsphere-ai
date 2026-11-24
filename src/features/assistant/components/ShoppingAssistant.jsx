
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bot,
  X,
  Send,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Loader2,
  RotateCcw,
} from "lucide-react";

import { getAssistantResponse } from "../services/assistantService";

const STORAGE_KEY = "shopsphere-assistant-chat";

const starterPrompts = [
  "Show me laptops under $800",
  "Find phones above 4 stars",
  "Show me beauty products",
  "Recommend popular products",
];

const initialMessage = {
  id: "welcome",
  role: "assistant",
  text: "Hi! I'm your ShopSphere AI shopping assistant. I can help you discover products, compare prices and find products that match your budget. What are you looking for?",
  products: [],
};

function ProductResultCard({ product }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="flex min-w-0 gap-3 rounded-xl border border-gray-200 bg-white p-2 transition hover:border-blue-400 hover:shadow-sm"
    >
      <img
        src={product.thumbnail || product.images?.[0]}
        alt={product.title}
        className="h-20 w-20 shrink-0 rounded-lg bg-gray-50 object-contain"
      />

      <div className="min-w-0 flex-1">
        <h4 className="line-clamp-2 text-sm font-semibold text-gray-800">
          {product.title}
        </h4>

        <p className="mt-1 text-sm font-bold text-blue-600">
          ${Number(product.price).toFixed(2)}
        </p>

        <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          <span className="text-yellow-500">★</span>
          {product.rating || "Not rated"}
          <span>•</span>
          {product.stock > 0 ? "In stock" : "Out of stock"}
        </div>
      </div>
    </Link>
  );
}

export default function ShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([initialMessage]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      const storedMessages = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "null"
      );

      if (Array.isArray(storedMessages) && storedMessages.length > 0) {
        setMessages(storedMessages);
      }
    } catch (error) {
      console.error("Could not load assistant chat:", error);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Could not save assistant chat:", error);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  async function handleSendMessage(messageText = input) {
    const text = messageText.trim();

    if (!text || loading) return;

    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text,
      products: [],
    };

    // Use the latest assistant product results as conversation context.
    const previousAssistantMessage = [...messages]
      .reverse()
      .find(
        (message) =>
          message.role === "assistant" &&
          Array.isArray(message.products) &&
          message.products.length > 0
      );

    const previousProducts = previousAssistantMessage?.products || [];

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await getAssistantResponse(
        text,
        previousProducts
      );

      const assistantMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        text: response.message,
        products: response.products || [],
        appliedFilters: response.appliedFilters || [],
        success: response.success,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      console.error("Assistant message failed:", error);

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          text: "Sorry, I couldn't process your request. Please try again.",
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    const confirmed = window.confirm(
      "Are you sure you want to clear this conversation?"
    );

    if (!confirmed) return;

    setMessages([initialMessage]);
    setInput("");
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <>
      {/* Floating assistant button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open ShopSphere AI assistant"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition hover:scale-105 hover:bg-blue-700"
        >
          <MessageCircle size={25} />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-green-500" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[min(650px,85vh)] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:bottom-6 sm:right-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 px-4 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/20 p-2">
                <Bot size={23} />
              </div>

              <div>
                <h3 className="font-bold">ShopSphere AI</h3>
                <p className="text-xs text-blue-100">
                  Your personal shopping assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearChat}
                aria-label="Clear chat"
                title="Clear chat"
                className="rounded-lg p-2 hover:bg-white/20"
              >
                <RotateCcw size={17} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
                className="rounded-lg p-2 hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4"
            aria-live="polite"
            aria-label="Assistant conversation"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl p-3 ${
                    message.role === "user"
                      ? "rounded-br-sm bg-blue-600 text-white"
                      : "rounded-bl-sm border border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-blue-600">
                      <Sparkles size={14} />
                      ShopSphere AI
                    </div>
                  )}

                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {message.text}
                  </p>

                  {message.appliedFilters?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {message.appliedFilters.map((filter, index) => (
                        <span
                          key={`${filter}-${index}`}
                          className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
                        >
                          {filter}
                        </span>
                      ))}
                    </div>
                  )}

                  {message.products?.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.products.map((product) => (
                        <ProductResultCard
                          key={product.id}
                          product={product}
                        />
                      ))}

                      <p className="pt-1 text-center text-xs text-gray-400">
                        Select a product to view its details.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500">
                  <Loader2
                    size={17}
                    className="animate-spin text-blue-600"
                  />
                  Finding products for you...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Starter prompts */}
          {messages.length <= 1 && !loading && (
            <div className="border-t border-gray-100 bg-white px-3 py-3">
              <p className="mb-2 text-xs font-semibold text-gray-500">
                TRY ASKING
              </p>

              <div className="flex flex-wrap gap-2">
                {starterPrompts.map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-left text-xs text-blue-700 transition hover:bg-blue-100"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask me anything..."
              disabled={loading}
              aria-label="Type your shopping question"
              className="min-w-0 flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 disabled:bg-gray-100"
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>

          <div className="bg-white pb-2 text-center text-[10px] text-gray-400">
            ShopSphere AI · Smart shopping made simple
          </div>
        </div>
      )}
    </>
  );
}
