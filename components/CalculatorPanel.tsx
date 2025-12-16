"use client";

import { useApp } from "@/context/AppContext";
import { calculateLoanMode, calculateSavingMode } from "@/lib/calculations";
import { formatCurrency } from "@/lib/utils";

export default function CalculatorPanel() {
  const { settings, draft } = useApp();

  const loanResult = calculateLoanMode(draft, settings.availableCash, settings.interestRate, settings.loanTermYears);
  const savingResult = calculateSavingMode(
    draft,
    settings.availableCash,
    24 // Default to 24 months for saving mode
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Calculation Results
      </h2>

      {/* Results Card */}
      <div className="bg-gray-50 rounded-xl p-6">
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
      </div>
    </div>
  );
}
