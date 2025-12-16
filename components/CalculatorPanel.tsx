"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { PropertyInputDraft } from "@/types";
import { calculateLoanMode, calculateSavingMode } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";
import SavePropertyModal from "./SavePropertyModal";

const DEFAULT_DRAFT: PropertyInputDraft = {
  price: 0,
  interestRate: 0,
  termYears: 30,
  extraCosts: 0,
};

export default function CalculatorPanel() {
  const { settings } = useApp();
  const [draft, setDraft] = useState<PropertyInputDraft>(DEFAULT_DRAFT);
  const [propertyLink, setPropertyLink] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  const loanResult = calculateLoanMode(draft, settings.availableCash);
  const savingResult = calculateSavingMode(
    draft,
    settings.availableCash,
    settings.targetPeriodMonths
  );

  const isFormValid =
    draft.price > 0 &&
    draft.interestRate >= 0 &&
    draft.termYears > 0 &&
    draft.extraCosts >= 0;

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

        {/* Input Form */}
        <div className="space-y-4 mb-6">
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
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={draft.interestRate || ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    interestRate: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="8.5"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loan Term (Years)
              </label>
              <input
                type="number"
                value={draft.termYears || ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    termYears: Math.max(1, parseInt(e.target.value) || 30),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="30"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extra Costs
              </label>
              <input
                type="number"
                value={draft.extraCosts || ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    extraCosts: Math.max(0, parseFloat(e.target.value) || 0),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="5000"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Results Card */}
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
                <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(loanResult.monthlyPayment, settings.currency)}
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
                Based on your current cash and inputs above.
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
        </div>

        {/* Property Link Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Link (Optional)
          </label>
          <input
            type="url"
            value={propertyLink}
            onChange={(e) => setPropertyLink(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Paste the link to the property listing here
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={() => setShowSaveModal(true)}
          disabled={!isFormValid}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors shadow-sm"
        >
          Save This Property
        </button>
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
          }}
        />
      )}
    </>
  );
}

