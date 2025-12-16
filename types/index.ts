export type CalculationMode = "loan" | "savingPerMonth";

export type Currency = "USD" | "EUR" | "CAD" | "KGS";

export type LoanStatus = "Fully Funded" | "Within Budget" | "Almost There" | "Out of Budget";
export type SavingStatus = "Already Covered" | "Realistic" | "Aggressive";

export interface GlobalSettings {
  availableCash: number;      // "Money I have now"
  interestRate: number;        // Annual interest rate %
  loanTermYears: number;       // Loan term in years
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
  termYears?: number;     // loan term in years (deprecated, use global setting)
  monthlyRent: number;    // expected monthly rent price
  notes?: string;         // optional notes
  createdAt: string;      // ISO date
}

// Temporary property input for calculator (not saved yet)
export interface PropertyInputDraft {
  price: number;
  monthlyRent: number;
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

