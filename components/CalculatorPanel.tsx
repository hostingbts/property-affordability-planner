"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PropertyInputDraft, Currency } from "@/types";
import { calculateLoanMode, calculateSavingMode } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import SavePropertyModal from "./SavePropertyModal";

const DEFAULT_DRAFT: PropertyInputDraft = {
  price: 0,
  monthlyRent: 0,
};

export default function CalculatorPanel() {
  const { settings, updateSettings } = useApp();
  const [draft, setDraft] = useState<PropertyInputDraft>(DEFAULT_DRAFT);
  const [propertyLink, setPropertyLink] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const loanResult = calculateLoanMode(draft, settings.availableCash, settings.interestRate, settings.loanTermYears);
  const savingResult = calculateSavingMode(
    draft,
    settings.availableCash,
    24 // Default to 24 months for saving mode
  );

  const isFormValid =
    draft.price > 0 &&
    draft.monthlyRent >= 0;

  const handleCalculate = () => {
    if (isFormValid) {
      setShowResults(true);
    }
  };

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

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Property Calculator
        </h2>

        {/* 2x3 Grid Input Form */}
        <div className="space-y-4 mb-6">
          {/* Row 1: Money I have now | Want to calculate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="15000"
                  min="0"
                />
                <select
                  value={settings.currency}
                  onChange={(e) =>
                    updateSettings({ currency: e.target.value as Currency })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="CAD">CAD</option>
                  <option value="KGS">KGS</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Want to calculate
              </label>
              <select
                value={settings.mode}
                onChange={(e) =>
                  updateSettings({
                    mode: e.target.value as "loan" | "savingPerMonth",
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option value="loan">Loan calculation</option>
                <option value="savingPerMonth">How much to save per month</option>
              </select>
            </div>
          </div>

          {/* Row 2: Interest Rate | Loan Term */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="8.5"
                  min="0"
                />
                <span className="px-4 py-2 text-gray-600">%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="30"
                  min="0"
                />
                <span className="px-4 py-2 text-gray-600">years</span>
              </div>
            </div>
          </div>

          {/* Row 3: Property Price | Expected Monthly Rent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Price
              </label>
              <input
                type="number"
                value={draft.price || ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    price: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="250000"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Monthly Rent
              </label>
              <input
                type="number"
                value={draft.monthlyRent || ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    monthlyRent: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1500"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Property Link */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Link
          </label>
          <input
            type="url"
            value={propertyLink}
            onChange={(e) => setPropertyLink(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://..."
          />
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          disabled={!isFormValid}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-sm mb-6"
        >
          Calculate
        </button>

        {/* Results Card - Show after Calculate is clicked */}
        {showResults && (
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>

            {settings.mode === "loan" ? (
              <div className="space-y-4">
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
                <p className="text-xs text-gray-500 mt-2">
                  Based on your current cash and inputs above. Monthly rent is subtracted from the payment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-900">
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
                <p className="text-xs text-gray-500 mt-2">
                  Assuming you want to save the full cost with no loan.
                </p>
              </div>
            )}

            {/* Save Property Button */}
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={!isFormValid}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
            >
              Save This Property
            </button>
          </div>
        )}
      </div>

      {showSaveModal && (
        <SavePropertyModal
          draft={draft}
          initialLink={propertyLink}
          onClose={() => setShowSaveModal(false)}
          onSave={() => {
            setShowSaveModal(false);
            setDraft(DEFAULT_DRAFT);
            setPropertyLink("");
            setShowResults(false);
          }}
        />
      )}
    </>
  );
}
