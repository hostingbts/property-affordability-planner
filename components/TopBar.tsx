"use client";

import { useApp } from "@/context/AppContext";
import { Currency } from "@/types";

export default function TopBar() {
  const { settings, updateSettings } = useApp();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Money I have now */}
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

        {/* Interest Rate */}
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

        {/* Loan Term */}
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
                updateSettings({ loanTermYears: Math.max(1, value) });
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="30"
              min="1"
            />
            <span className="px-3 py-2 text-sm text-gray-600">years</span>
          </div>
        </div>

        {/* What to calculate */}
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
    </div>
  );
}

