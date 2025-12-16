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
  const [filters, setFilters] = useState({
    priceMin: "",
    priceMax: "",
    loanNeededMin: "",
    loanNeededMax: "",
    monthlyPaymentMin: "",
    monthlyPaymentMax: "",
  });

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

  // Calculate results for all properties and filter them
  const filteredProperties = useMemo(() => {
    return properties
      .map((property) => {
        const loanResult = calculateLoanMode(property, settings.availableCash, settings.interestRate);
        const savingResult = calculateSavingMode(property, settings.availableCash, 24);
        return { property, loanResult, savingResult };
      })
      .filter(({ property, loanResult, savingResult }) => {
        // Filter by price
        if (filters.priceMin && property.price < parseFloat(filters.priceMin)) return false;
        if (filters.priceMax && property.price > parseFloat(filters.priceMax)) return false;

        // Filter by loan needed
        if (filters.loanNeededMin && loanResult.loanNeeded < parseFloat(filters.loanNeededMin)) return false;
        if (filters.loanNeededMax && loanResult.loanNeeded > parseFloat(filters.loanNeededMax)) return false;

        // Filter by monthly payment
        if (filters.monthlyPaymentMin && loanResult.monthlyPayment < parseFloat(filters.monthlyPaymentMin)) return false;
        if (filters.monthlyPaymentMax && loanResult.monthlyPayment > parseFloat(filters.monthlyPaymentMax)) return false;

        return true;
      });
  }, [properties, settings, filters]);

  const clearFilters = () => {
    setFilters({
      priceMin: "",
      priceMax: "",
      loanNeededMin: "",
      loanNeededMax: "",
      monthlyPaymentMin: "",
      monthlyPaymentMax: "",
    });
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
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Saved Properties ({filteredProperties.length} of {properties.length})
              </h2>
              <p className="text-sm text-gray-600">
                Based on: {formatCurrency(settings.availableCash, settings.currency)} | {settings.interestRate}% interest
              </p>
            </div>
            {(filters.priceMin || filters.priceMax || filters.loanNeededMin || filters.loanNeededMax || filters.monthlyPaymentMin || filters.monthlyPaymentMax) && (
              <button
                onClick={clearFilters}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Price Min</label>
              <input
                type="number"
                value={filters.priceMin}
                onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Price Max</label>
              <input
                type="number"
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Max"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Loan Min</label>
              <input
                type="number"
                value={filters.loanNeededMin}
                onChange={(e) => setFilters({ ...filters, loanNeededMin: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Loan Max</label>
              <input
                type="number"
                value={filters.loanNeededMax}
                onChange={(e) => setFilters({ ...filters, loanNeededMax: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Max"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Min</label>
              <input
                type="number"
                value={filters.monthlyPaymentMin}
                onChange={(e) => setFilters({ ...filters, monthlyPaymentMin: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Payment Max</label>
              <input
                type="number"
                value={filters.monthlyPaymentMax}
                onChange={(e) => setFilters({ ...filters, monthlyPaymentMax: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Max"
              />
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div className="space-y-3">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No properties match the current filters.
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
              {filteredProperties.map(({ property, loanResult, savingResult }) => {
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
