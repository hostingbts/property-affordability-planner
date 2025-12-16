export type CalculationMode = "loan" | "savingPerMonth";

export type Currency = "USD" | "EUR" | "CAD" | "KGS";

export type LoanStatus = "Fully Funded" | "Within Budget" | "Almost There" | "Out of Budget";
export type SavingStatus = "Already Covered" | "Realistic" | "Aggressive";

export interface GlobalSettings {
  availableCash: number;      // "Money I have now"
  targetPeriodMonths: number; // "Target period"
  mode: CalculationMode;
  currency: Currency;
}

export interface PropertyInput {
  id: string;
  title: string;          // user-friendly name of the property
  link: string;           // URL to the property ad
  imageUrl?: string;      // optional thumbnail (deprecated, use images array)
  images?: string[];      // array of image URLs from the ad
  price: number;          // total property price
  interestRate: number;   // annual %, e.g. 8.5
  termYears: number;      // loan term in years
  extraCosts: number;     // closing costs, taxes, repairs...
  notes?: string;         // optional notes
  createdAt: string;      // ISO date
}

// Temporary property input for calculator (not saved yet)
export interface PropertyInputDraft {
  price: number;
  interestRate: number;
  termYears: number;
  extraCosts: number;
}

// Calculation results (never stored, always computed)
export interface LoanCalculationResult {
  totalCost: number;
  loanNeeded: number;
  monthlyPayment: number;
  status: LoanStatus;
}

export interface SavingCalculationResult {
  totalCost: number;
  neededSavings: number;
  savingPerMonth: number;
  status: SavingStatus;
}

