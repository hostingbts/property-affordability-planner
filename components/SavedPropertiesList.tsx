"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PropertyInput } from "@/types";
import { calculateLoanMode, calculateSavingMode } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import PropertyDetailsDrawer from "./PropertyDetailsDrawer";

export default function SavedPropertiesList() {
  const { properties, settings, deleteProperty } = useApp();
  const [selectedProperty, setSelectedProperty] = useState<PropertyInput | null>(null);

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

  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <p className="text-gray-500">No properties saved yet. Add your first property using the calculator!</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Saved Properties ({properties.length})
          </h2>
          <p className="text-sm text-gray-600">
            Based on: {formatCurrency(settings.availableCash, settings.currency)} | {settings.interestRate}% interest
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => {
            const loanResult = calculateLoanMode(property, settings.availableCash, settings.interestRate);
            const savingResult = calculateSavingMode(
              property,
              settings.availableCash,
              24 // Default to 24 months for saving mode
            );

            return (
              <div
                key={property.id}
                className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                onClick={() => setSelectedProperty(property)}
              >
                {/* Single Image Thumbnail */}
                {(() => {
                  const firstImage =
                    property.images && property.images.length > 0
                      ? property.images[0]
                      : property.imageUrl;
                  
                  return firstImage ? (
                    <div className="mb-3 rounded-lg overflow-hidden relative">
                      <img
                        src={firstImage}
                        alt={property.title}
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      {property.images && property.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                          {property.images.length} photos
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mb-3 rounded-lg bg-gray-200 h-32 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No image</span>
                    </div>
                  );
                })()}

                {/* Title */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                  {property.title}
                </h3>

                {/* Price */}
                <p className="text-sm text-gray-600 mb-3">
                  Price:{" "}
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(property.price, settings.currency)}
                  </span>
                </p>

                {/* Results based on mode */}
                {settings.mode === "loan" ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Loan Needed</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(loanResult.loanNeeded, settings.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Net Monthly Payment</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(loanResult.monthlyPayment, settings.currency)}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(loanResult.status)}`}
                    >
                      {loanResult.status}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Saving Per Month</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(
                          savingResult.savingPerMonth,
                          settings.currency
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Needed Savings</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(
                          savingResult.neededSavings,
                          settings.currency
                        )}
                      </p>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(savingResult.status)}`}
                    >
                      {savingResult.status}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProperty(property);
                    }}
                    className="flex-1 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this property?")) {
                        deleteProperty(property.id);
                      }
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedProperty && (
        <PropertyDetailsDrawer
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </>
  );
}

