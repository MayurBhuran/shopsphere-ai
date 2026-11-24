
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  ShoppingBag,
  Truck,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Plus,
  Home,
  Briefcase,
  MapPinned,
} from "lucide-react";

import useCartStore from "@/store/cartStore";

const EMPTY_ADDRESS = {
  fullName: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  landmark: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCartStore((state) => state.cart);

  const [loading, setLoading] = useState(true);
  const [addressSaved, setAddressSaved] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [address, setAddress] = useState(EMPTY_ADDRESS);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = subtotal * 0.05;
  const total = subtotal + shipping + tax;

  // Convert Address Manager format into checkout format.
  const convertSavedAddress = (savedAddress, currentAddress = {}) => ({
    fullName: savedAddress.fullName || currentAddress.fullName || "",
    email: currentAddress.email || "",
    phone: savedAddress.phone || "",
    street: [
      savedAddress.addressLine1,
      savedAddress.addressLine2,
    ]
      .filter(Boolean)
      .join(", "),
    city: savedAddress.city || "",
    state: savedAddress.state || "",
    postalCode: savedAddress.postalCode || "",
    country: savedAddress.country || "India",
    landmark: savedAddress.landmark || "",
  });

  // Load saved addresses, existing checkout address and user details.
  useEffect(() => {
    if (cart.length === 0) {
      router.replace("/cart");
      return;
    }

    let currentUser = null;
    let existingCheckoutAddress = null;
    let addresses = [];

    try {
      currentUser = JSON.parse(
        localStorage.getItem("shopsphere-current-user") || "null"
      );

      existingCheckoutAddress = JSON.parse(
        localStorage.getItem("shopsphere-delivery-address") || "null"
      );

      const parsedAddresses = JSON.parse(
        localStorage.getItem("shopsphere-delivery-addresses") || "[]"
      );

      addresses = Array.isArray(parsedAddresses) ? parsedAddresses : [];
    } catch (error) {
      console.error("Unable to load saved checkout details:", error);
    }

    setSavedAddresses(addresses);

    const userDetails = {
      fullName: currentUser?.name || "",
      email: currentUser?.email || "",
    };

    if (addresses.length > 0) {
      const defaultAddress =
        addresses.find((item) => item.isDefault) || addresses[0];

      const selected = addresses.find(
        (item) =>
          String(item.id) === String(existingCheckoutAddress?.savedAddressId)
      ) || defaultAddress;

      const convertedAddress = convertSavedAddress(selected, {
        ...existingCheckoutAddress,
        ...userDetails,
      });

      setSelectedAddressId(String(selected.id));
      setAddress(convertedAddress);
    } else if (existingCheckoutAddress) {
      setAddress({
        ...EMPTY_ADDRESS,
        ...existingCheckoutAddress,
        ...userDetails,
      });
    } else {
      setAddress({
        ...EMPTY_ADDRESS,
        ...userDetails,
      });
    }

    setLoading(false);
  }, [cart.length, router]);

  // Select an address from Address Manager.
  const handleSelectSavedAddress = (savedAddress) => {
    setSelectedAddressId(String(savedAddress.id));

    setAddress(
      convertSavedAddress(savedAddress, {
        ...address,
        savedAddressId: savedAddress.id,
      })
    );

    setAddressSaved(false);
  };

  // Handle manual form changes.
  const handleChange = (e) => {
    setAddress((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

    setSelectedAddressId("");
    setAddressSaved(false);
  };

  // Save the checkout address for the payment page.
  const handleSaveAddress = (e) => {
    e.preventDefault();

    const phoneIsValid = /^[6-9][0-9]{9}$/.test(address.phone);
    const pinIsValid = /^[0-9]{6}$/.test(address.postalCode);

    if (!phoneIsValid) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!pinIsValid) {
      alert("Please enter a valid 6-digit PIN code.");
      return;
    }

    try {
      const checkoutAddress = {
        ...address,
        savedAddressId: selectedAddressId || null,
      };

      localStorage.setItem(
        "shopsphere-delivery-address",
        JSON.stringify(checkoutAddress)
      );

      setAddressSaved(true);
      alert("Delivery address saved successfully!");
    } catch (error) {
      console.error("Address save failed:", error);
      alert("Unable to save the delivery address. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading checkout...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-5"
          >
            <ArrowLeft size={18} />
            Back to Cart
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="text-gray-500 mt-2">
            Complete your delivery details to continue.
          </p>
        </div>

        {/* Checkout Progress */}
        <div className="bg-white rounded-2xl p-5 mb-8 shadow-sm border">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <span className="text-sm font-semibold text-blue-600">
                Address
              </span>
            </div>

            <div className="h-1 flex-1 bg-gray-200 mx-3 rounded-full" />

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                <Truck size={20} />
              </div>
              <span className="text-sm text-gray-400">
                Payment
              </span>
            </div>

            <div className="h-1 flex-1 bg-gray-200 mx-3 rounded-full" />

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                <CheckCircle size={20} />
              </div>
              <span className="text-sm text-gray-400">
                Confirmation
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Delivery Address */}
          <section className="lg:col-span-2 bg-white rounded-2xl shadow-sm border p-6 sm:p-8">

            <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-xl">
                  <MapPin size={24} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Delivery Address
                  </h2>
                  <p className="text-sm text-gray-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <Link
                href="/account/addresses"
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                <Plus size={17} />
                Manage Addresses
              </Link>
            </div>

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="mb-8">
                <h3 className="font-bold text-gray-800 mb-4">
                  Choose a Saved Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedAddresses.map((savedAddress, index) => {
                    const addressId = String(
                      savedAddress.id ?? index
                    );

                    const isSelected =
                      selectedAddressId === addressId;

                    const AddressIcon =
                      savedAddress.addressType === "Work"
                        ? Briefcase
                        : savedAddress.addressType === "Home"
                        ? Home
                        : MapPinned;

                    return (
                      <button
                        key={addressId}
                        type="button"
                        onClick={() =>
                          handleSelectSavedAddress({
                            ...savedAddress,
                            id: savedAddress.id ?? index,
                          })
                        }
                        className={`text-left rounded-xl border-2 p-4 transition ${
                          isSelected
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="flex items-center gap-2 font-semibold text-gray-800">
                            <AddressIcon size={17} className="text-blue-600" />
                            {savedAddress.addressType || "Address"}
                          </span>

                          {isSelected && (
                            <CheckCircle
                              size={19}
                              className="text-blue-600"
                            />
                          )}
                        </div>

                        <p className="font-semibold text-gray-800">
                          {savedAddress.fullName}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          {savedAddress.phone}
                        </p>

                        <p className="text-sm text-gray-600 mt-2 leading-5">
                          {savedAddress.addressLine1}
                          {savedAddress.addressLine2
                            ? `, ${savedAddress.addressLine2}`
                            : ""}
                        </p>

                        <p className="text-sm text-gray-600">
                          {savedAddress.city}, {savedAddress.state} -{" "}
                          {savedAddress.postalCode}
                        </p>

                        <p className="text-sm text-gray-600">
                          {savedAddress.country}
                        </p>

                        {savedAddress.isDefault && (
                          <span className="inline-block mt-3 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            Default Address
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {savedAddresses.length === 0 && (
              <div className="mb-7 rounded-xl border border-dashed border-blue-300 bg-blue-50 p-5">
                <p className="font-semibold text-gray-800">
                  No saved addresses yet
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  You can add an address to your account and select it here.
                </p>
                <Link
                  href="/account/addresses"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  <Plus size={16} />
                  Add a New Address
                </Link>
              </div>
            )}

            {/* Address Form */}
            <div className="border-t pt-6">
              <h3 className="font-bold text-gray-800 mb-5">
                {selectedAddressId
                  ? "Selected Delivery Details"
                  : "Enter Delivery Details"}
              </h3>

              <form onSubmit={handleSaveAddress} className="space-y-5">

                {/* Name and Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Full Name *
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={address.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Email Address *
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={address.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={address.phone}
                    onChange={handleChange}
                    placeholder="Enter 10-digit mobile number"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Street */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Street Address *
                  </label>

                  <textarea
                    name="street"
                    value={address.street}
                    onChange={handleChange}
                    placeholder="House number, building, street name"
                    rows={3}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      City *
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      State *
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={address.state}
                      onChange={handleChange}
                      placeholder="Enter state"
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* PIN and Country */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      PIN Code *
                    </label>

                    <input
                      type="text"
                      name="postalCode"
                      value={address.postalCode}
                      onChange={handleChange}
                      placeholder="6-digit PIN code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                      Country *
                    </label>

                    <input
                      type="text"
                      name="country"
                      value={address.country}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Landmark */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Landmark (Optional)
                  </label>

                  <input
                    type="text"
                    name="landmark"
                    value={address.landmark}
                    onChange={handleChange}
                    placeholder="Nearby landmark"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Save Address */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  {addressSaved
                    ? "Address Saved ✓"
                    : "Save Delivery Address"}
                </button>

                {addressSaved && (
                  <p className="text-green-600 text-sm text-center">
                    Your delivery address has been saved successfully.
                  </p>
                )}
              </form>
            </div>
          </section>

          {/* Order Summary */}
          <aside className="bg-white rounded-2xl shadow-sm border p-6 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
                <ShoppingBag size={23} />
              </div>

              <h2 className="text-xl font-bold text-gray-800">
                Order Summary
              </h2>
            </div>

            <div className="space-y-4 max-h-72 overflow-y-auto mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-16 h-16 object-contain bg-gray-50 rounded-lg"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      Quantity: {item.quantity}
                    </p>

                    <p className="text-sm font-bold text-blue-600 mt-1">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <hr className="my-5" />

            <div className="space-y-4 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-600 font-semibold" : ""}>
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Estimated Tax (5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <hr className="my-5" />

            <div className="flex justify-between text-lg font-bold">
              <span>Grand Total</span>
              <span className="text-blue-600">
                ${total.toFixed(2)}
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Payment will be simulated. No real payment will be collected.
            </p>

            <button
              type="button"
              onClick={() => {
                if (!addressSaved) {
                  alert("Please save your delivery address first.");
                  return;
                }

                router.push("/checkout/payment");
              }}
              disabled={!addressSaved}
              className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Continue to Payment
              <ArrowRight size={18} />
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
