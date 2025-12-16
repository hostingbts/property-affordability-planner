"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { PropertyInput } from "@/types";
import { calculateLoanMode, calculateSavingMode } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import PropertyDetailsDrawer from "./PropertyDetailsDrawer";

export default function SavedPropertiesList() {
  const { properties, settings, deleteProperty } = useApp();
  const [selectedProperty, setSelectedProperty] = useState<PropertyInput | null>(null);
  // Calculate results for all properties
  const propertiesWithResults = useMemo(() => {
    return properties.map((property) => {
      const loanResult = calculateLoanMode(property, settings.availableCash, settings.interestRate);
      const savingResult = calculateSavingMode(property, settings.availableCash, 24);
      return { property, loanResult, savingResult };
    });
  }, [properties, settings]);

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
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Saved Properties ({properties.length})
          </h2>
          <p className="text-sm text-gray-600">
            Based on: {formatCurrency(settings.availableCash, settings.currency)} | {settings.interestRate}% interest
          </p>
        </div>

        {/* Properties List */}
        <div className="space-y-3">
          {propertiesWithResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No properties saved yet.
            </div>
          ) : (
            <>
              {/* Header Row */}
              <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl border border-gray-200 font-semibold text-sm text-gray-700">
                <div className="flex-shrink-0 w-20">
                  {/* Photo column - no label */}
                </div>
                <div className="flex-1 flex items-center gap-6">
                  <div className="flex-shrink-0 min-w-[150px]">Title</div>
                  <div className="flex-shrink-0 min-w-[120px]">Price</div>
                  {settings.mode === "loan" && (
                    <>
                      <div className="flex-shrink-0 min-w-[120px]">Loan Needed</div>
                      <div className="flex-shrink-0 min-w-[140px]">Net Monthly Payment</div>
                    </>
                  )}
                  {settings.mode === "savingPerMonth" && (
                    <div className="flex-shrink-0 min-w-[140px]">Saving Per Month</div>
                  )}
                  <div className="flex-shrink-0 ml-auto min-w-[120px]">Actions</div>
                </div>
              </div>

              {/* Property Rows */}
              {propertiesWithResults.map(({ property, loanResult, savingResult }) => {
                const firstImage =
                  property.images && property.images.length > 0
                    ? property.images[0]
                    : property.imageUrl;

                return (
                  <div
                    key={property.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    {/* Photo on the left */}
                    <div className="flex-shrink-0">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={property.title}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Content on the right */}
                    <div className="flex-1 flex items-center gap-6 overflow-x-auto">
                      {/* Title */}
                      <div className="flex-shrink-0 min-w-[150px]">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {property.title}
                        </h3>
                      </div>

                      {/* Price */}
                      <div className="flex-shrink-0 min-w-[120px]">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(property.price, settings.currency)}
                        </p>
                      </div>

                      {/* Loan Needed */}
                      {settings.mode === "loan" && (
                        <div className="flex-shrink-0 min-w-[120px]">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(loanResult.loanNeeded, settings.currency)}
                          </p>
                        </div>
                      )}

                      {/* Net Monthly Payment */}
                      {settings.mode === "loan" && (
                        <div className="flex-shrink-0 min-w-[140px]">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(loanResult.monthlyPayment, settings.currency)}
                          </p>
                        </div>
                      )}

                      {/* Saving Per Month (for saving mode) */}
                      {settings.mode === "savingPerMonth" && (
                        <div className="flex-shrink-0 min-w-[140px]">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(savingResult.savingPerMonth, settings.currency)}
                          </p>
                        </div>
                      )}

                      {/* View Details Button */}
                      <div className="flex-shrink-0 ml-auto min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProperty(property);
                          }}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
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
