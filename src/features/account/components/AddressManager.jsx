
"use client";

import { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  CheckCircle,
} from "lucide-react";

const STORAGE_KEY = "shopsphere-delivery-addresses";

const emptyAddress = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  addressType: "Home",
};

export default function AddressManager() {
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState(emptyAddress);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      if (Array.isArray(stored)) {
        setAddresses(stored);
      }
    } catch (error) {
      console.error("Unable to load addresses:", error);
    }
  }, []);

  function persistAddresses(updatedAddresses) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedAddresses)
      );
      setAddresses(updatedAddresses);
      setSaved(true);
    } catch (error) {
      console.error("Unable to save addresses:", error);
      setSaved(false);
      alert("Could not save your address. Please try again.");
    }
  }

  function updateField(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setSaved(false);
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid 10-digit phone number.";
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address is required.";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required.";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required.";
    }

    if (!/^[0-9]{6}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = "Enter a valid 6-digit PIN code.";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function openAddForm() {
    setFormData(emptyAddress);
    setEditingId(null);
    setErrors({});
    setSaved(false);
    setShowForm(true);
  }

  function openEditForm(address) {
    setFormData({
      ...emptyAddress,
      ...address,
    });

    setEditingId(address.id);
    setErrors({});
    setSaved(false);
    setShowForm(true);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    let updatedAddresses;

    if (editingId) {
      updatedAddresses = addresses.map((address) =>
        address.id === editingId
          ? { ...address, ...formData }
          : address
      );
    } else {
      const newAddress = {
        ...formData,
        id: `${Date.now()}`,
        isDefault: addresses.length === 0,
      };

      updatedAddresses = [...addresses, newAddress];
    }

    persistAddresses(updatedAddresses);
    setShowForm(false);
    setFormData(emptyAddress);
    setEditingId(null);
    setErrors({});
  }

  function deleteAddress(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    let updatedAddresses = addresses.filter(
      (address) => address.id !== id
    );

    if (
      addresses.find((address) => address.id === id)?.isDefault &&
      updatedAddresses.length > 0
    ) {
      updatedAddresses = updatedAddresses.map((address, index) => ({
        ...address,
        isDefault: index === 0,
      }));
    }

    persistAddresses(updatedAddresses);
  }

  function setDefaultAddress(id) {
    const updatedAddresses = addresses.map((address) => ({
      ...address,
      isDefault: address.id === id,
    }));

    persistAddresses(updatedAddresses);
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  function renderField(label, name, placeholder, type = "text") {
    return (
      <div>
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>

        <input
          id={name}
          name={name}
          type={type}
          value={formData[name]}
          onChange={updateField}
          placeholder={placeholder}
          className={`${inputClass} ${
            errors[name] ? "border-red-500" : ""
          }`}
        />

        {errors[name] && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {errors[name]}
          </p>
        )}
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-5xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            My Addresses
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your delivery addresses.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add New Address
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50/40 p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingId ? "Edit Address" : "Add New Address"}
            </h3>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="Close address form"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {renderField("Full Name", "fullName", "Enter full name")}
              {renderField("Phone Number", "phone", "10-digit mobile number", "tel")}
              {renderField("Address Line 1", "addressLine1", "House number, building, street")}
              {renderField("Address Line 2", "addressLine2", "Area, landmark (optional)")}
              {renderField("City", "city", "Enter city")}
              {renderField("State", "state", "Enter state")}
              {renderField("PIN Code", "postalCode", "6-digit PIN code")}
              {renderField("Country", "country", "Enter country")}
            </div>

            <div>
              <label
                htmlFor="addressType"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Address Type
              </label>

              <select
                id="addressType"
                name="addressType"
                value={formData.addressType}
                onChange={updateField}
                className={inputClass}
              >
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-3 pt-3 sm:flex-row">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {editingId ? "Update Address" : "Save Address"}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {saved && (
        <p className="mb-4 flex items-center gap-2 text-sm text-green-600" role="status">
          <CheckCircle size={17} />
          Address information saved successfully.
        </p>
      )}

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 py-12 text-center">
          <MapPin size={42} className="mx-auto text-gray-300" />

          <h3 className="mt-4 font-semibold text-gray-800">
            No addresses saved yet
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Add an address for faster checkout.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`rounded-xl border p-5 ${
                address.isDefault
                  ? "border-blue-400 bg-blue-50/30"
                  : "border-gray-200"
              }`}
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin size={19} className="text-blue-600" />
                  <span className="font-semibold text-gray-900">
                    {address.addressType}
                  </span>
                </div>

                {address.isDefault && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Default
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-gray-900">
                {address.fullName}
              </h3>

              <p className="mt-1 text-sm text-gray-600">
                {address.phone}
              </p>

              <p className="mt-3 text-sm leading-6 text-gray-600">
                {address.addressLine1}
                {address.addressLine2 && (
                  <>
                    <br />
                    {address.addressLine2}
                  </>
                )}
                <br />
                {address.city}, {address.state} - {address.postalCode}
                <br />
                {address.country}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4">
                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefaultAddress(address.id)}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    <Star size={14} />
                    Set Default
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => openEditForm(address)}
                  className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600"
                >
                  <Pencil size={14} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => deleteAddress(address.id)}
                  className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
