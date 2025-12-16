"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Currency } from "@/types";
import SavePropertyModal from "./SavePropertyModal";

export default function TopBar() {
  const { settings, updateSettings, draft, propertyLink, updateDraft, setPropertyLink, resetDraft } = useApp();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);

  const isFormValid =
    draft.price > 0 &&
    draft.monthlyRent >= 0;

  // Fetch property data (images and price) when link is pasted
  const fetchPropertyData = async (url: string) => {
    if (!url || !url.startsWith("http")) return;

    setIsFetchingData(true);
    try {
      const response = await fetch(
        `/api/fetch-property-images?url=${encodeURIComponent(url)}`
      );
      const data = await response.json();

      if (data.images && data.images.length > 0) {
        // Images will be handled by SavePropertyModal
      }

      if (data.price && data.price > 0) {
        updateDraft({ price: data.price });
      }
    } catch (error) {
      console.error("Error fetching property data:", error);
      // Silently fail - user can still enter price manually
    } finally {
      setIsFetchingData(false);
    }
  };

  // Debounce fetching when link changes
  useEffect(() => {
    if (!propertyLink || !propertyLink.startsWith("http")) return;

    const timeoutId = setTimeout(() => {
      fetchPropertyData(propertyLink);
    }, 1500); // Wait 1.5 seconds after user stops typing

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyLink]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
        {/* Row 1: Money I have now | Interest Rate | Loan Term */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Money I have now
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={settings.availableCash || ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  updateSettings({ availableCash: Math.max(0, value) });
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="15000"
                min="0"
              />
              <select
                value={settings.currency}
                onChange={(e) =>
                  updateSettings({ currency: e.target.value as Currency })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="CAD">CAD</option>
                <option value="KGS">KGS</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Interest Rate
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={settings.interestRate || ""}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  updateSettings({ interestRate: Math.max(0, value) });
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="8.5"
                min="0"
              />
              <span className="px-3 py-2 text-sm text-gray-600">%</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Loan Term
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={settings.loanTermYears || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  updateSettings({ loanTermYears: Math.max(0, value) });
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                placeholder="30"
                min="0"
              />
              <span className="px-3 py-2 text-sm text-gray-600">years</span>
            </div>
          </div>
        </div>

        {/* Row 2: Property Price | Expected Monthly Rent | Want to calculate */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Property Price
            </label>
            <input
              type="number"
              value={draft.price || ""}
              onChange={(e) =>
                updateDraft({
                  price: Math.max(0, parseFloat(e.target.value) || 0),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="250000"
              min="0"
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Expected Monthly Rent
            </label>
            <input
              type="number"
              value={draft.monthlyRent || ""}
              onChange={(e) =>
                updateDraft({
                  monthlyRent: Math.max(0, parseFloat(e.target.value) || 0),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="1500"
              min="0"
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              What to calculate
            </label>
            <select
              value={settings.mode}
              onChange={(e) =>
                updateSettings({
                  mode: e.target.value as "loan" | "savingPerMonth",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
            >
              <option value="loan">Loan calculation</option>
              <option value="savingPerMonth">How much to save per month</option>
            </select>
          </div>
        </div>

        {/* Row 3: Property Link (full width) */}
        <div className="mb-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Property Link
            </label>
            <input
              type="url"
              value={propertyLink}
              onChange={(e) => setPropertyLink(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="https://..."
            />
            {isFetchingData && (
              <p className="text-xs text-gray-500 mt-1">
                🔍 Fetching property data...
              </p>
            )}
          </div>
        </div>

        {/* Row 4: Calculate button | Save This Property button */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
          >
            Calculate
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={!isFormValid}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
          >
            Save This Property
          </button>
        </div>
      </div>

      {showSaveModal && (
        <SavePropertyModal
          draft={draft}
          initialLink={propertyLink}
          onClose={() => setShowSaveModal(false)}
          onSave={() => {
            setShowSaveModal(false);
            resetDraft();
          }}
        />
      )}
    </>
  );
}
