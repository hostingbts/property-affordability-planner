"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PropertyInput } from "@/types";
import { calculateLoanMode, calculateSavingMode } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import ImageCarousel from "./ImageCarousel";

interface PropertyDetailsDrawerProps {
  property: PropertyInput;
  onClose: () => void;
}

export default function PropertyDetailsDrawer({
  property,
  onClose,
}: PropertyDetailsDrawerProps) {
  const { settings, updateProperty, deleteProperty } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    price: property.price,
    interestRate: property.interestRate,
    termYears: property.termYears,
    monthlyRent: (property as any).monthlyRent || (property as any).extraCosts || 0, // Support migration from extraCosts
    title: property.title,
    link: property.link,
    imageUrl: property.imageUrl || "",
    images: property.images || (property.imageUrl ? [property.imageUrl] : []),
    notes: property.notes || "",
  });

  const loanResult = calculateLoanMode(
    isEditing ? formData : property,
    settings.availableCash
  );
  const savingResult = calculateSavingMode(
    isEditing ? formData : property,
    settings.availableCash,
    settings.targetPeriodMonths
  );

  const getStatusColor = (status: string) => {
    if (status === "Fully Funded" || status === "Already Covered") {
      return "bg-green-100 text-green-800";
    }
    if (status === "Within Budget" || status === "Realistic") {
      return "bg-green-100 text-green-800";
    }
    if (status === "Almost There") {
      return "bg-yellow-100 text-yellow-800";
    }
    return "bg-red-100 text-red-800";
  };

  const handleSave = () => {
    updateProperty(property.id, {
      price: formData.price,
      interestRate: formData.interestRate,
      termYears: formData.termYears,
      monthlyRent: formData.monthlyRent,
      title: formData.title,
      link: formData.link,
      imageUrl: formData.images[0] || formData.imageUrl || undefined,
      images: formData.images.length > 0 ? formData.images : (formData.imageUrl ? [formData.imageUrl] : undefined),
      notes: formData.notes || undefined,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this property?")) {
      deleteProperty(property.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="text-xl font-semibold text-gray-900 w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <h2 className="text-xl font-semibold text-gray-900">
                {property.title}
              </h2>
            )}
            {property.link && property.link !== "#" && (
              <a
                href={property.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:text-green-700 underline mt-1 block"
              >
                View Property →
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Carousel */}
          {(() => {
            const images = isEditing
              ? (formData.images && formData.images.length > 0
                  ? formData.images
                  : formData.imageUrl
                  ? [formData.imageUrl]
                  : [])
              : (property.images && property.images.length > 0
                  ? property.images
                  : property.imageUrl
                  ? [property.imageUrl]
                  : []);
            return images.length > 0 ? (
              <ImageCarousel images={images} height="h-64" />
            ) : null;
          })()}

          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Price
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Math.max(0, parseFloat(e.target.value) || 0),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency(property.price, settings.currency)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Rate (%)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.1"
                  value={formData.interestRate || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interestRate: Math.max(0, parseFloat(e.target.value) || 0),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {property.interestRate}%
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Term (Years)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.termYears || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      termYears: Math.max(1, parseInt(e.target.value) || 30),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="1"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {property.termYears} years
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Monthly Rent
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={formData.monthlyRent || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthlyRent: Math.max(0, parseFloat(e.target.value) || 0),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                />
              ) : (
                <p className="text-lg font-semibold text-gray-900">
                  {formatCurrency((property as any).monthlyRent || (property as any).extraCosts || 0, settings.currency)}
                </p>
              )}
            </div>
          </div>

          {/* Images and Notes */}
          {isEditing && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images {formData.images.length > 0 && `(${formData.images.length})`}
                </label>
                {formData.images.length > 0 ? (
                  <div className="space-y-2">
                    <ImageCarousel images={formData.images} height="h-48" />
                    <p className="text-xs text-gray-500">
                      Images are automatically fetched from the property link. You can scroll through them above.
                    </p>
                  </div>
                ) : (
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        imageUrl: e.target.value,
                        images: e.target.value ? [e.target.value] : [],
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Paste image URL manually"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          )}

          {!isEditing && property.notes && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <p className="text-gray-600">{property.notes}</p>
            </div>
          )}

          {/* Computed Values */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Calculated Values
            </h3>

            {settings.mode === "loan" ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(loanResult.totalCost, settings.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Loan Needed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(loanResult.loanNeeded, settings.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Net Monthly Payment</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(loanResult.monthlyPayment, settings.currency)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (After subtracting monthly rent)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loanResult.status)}`}
                  >
                    {loanResult.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(savingResult.totalCost, settings.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Needed Savings</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      savingResult.neededSavings,
                      settings.currency
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Saving Per Month</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      savingResult.savingPerMonth,
                      settings.currency
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(savingResult.status)}`}
                  >
                    {savingResult.status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      price: property.price,
                      interestRate: property.interestRate,
                      termYears: property.termYears,
                      monthlyRent: (property as any).monthlyRent || (property as any).extraCosts || 0,
                      title: property.title,
                      link: property.link,
                      imageUrl: property.imageUrl || "",
                      images: property.images || (property.imageUrl ? [property.imageUrl] : []),
                      notes: property.notes || "",
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Edit Inputs
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-2 border border-red-300 text-red-600 font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

