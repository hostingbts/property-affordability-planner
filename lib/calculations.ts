import { PropertyInput, GlobalSettings, LoanCalculationResult, SavingCalculationResult, LoanStatus, SavingStatus } from "@/types";

/**
 * Calculate loan mode results
 */
export function calculateLoanMode(
  property: PropertyInput | { price: number; monthlyRent: number },
  availableCash: number,
  interestRate: number,
  loanTermYears: number
): LoanCalculationResult {
  const totalCost = property.price; // No extra costs, just the property price
  const loanNeeded = Math.max(0, totalCost - availableCash);
  
  // Calculate monthly payment using standard annuity formula
  let monthlyPayment = 0;
  if (loanNeeded > 0 && loanTermYears > 0) {
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanTermYears * 12;
    
    if (monthlyRate === 0) {
      monthlyPayment = loanNeeded / totalMonths;
    } else {
      // Formula: loanNeeded * (monthlyRate * (1 + monthlyRate) ** totalMonths) / ((1 + monthlyRate) ** totalMonths - 1)
      monthlyPayment = loanNeeded * (monthlyRate * (1 + monthlyRate) ** totalMonths) / ((1 + monthlyRate) ** totalMonths - 1);
    }
  }
  // If loanTermYears is 0, monthlyPayment remains 0 (full payment upfront)
  
  // Subtract monthly rent from the monthly payment (net monthly cost)
  const netMonthlyPayment = Math.max(0, monthlyPayment - (property.monthlyRent || 0));
  
  // Determine status based on net monthly payment
  let status: LoanStatus;
  if (netMonthlyPayment === 0) {
    status = "Fully Funded";
  } else if (netMonthlyPayment <= availableCash * 0.05) {
    status = "Within Budget";
  } else if (netMonthlyPayment <= availableCash * 0.15) {
    status = "Almost There";
  } else {
    status = "Out of Budget";
  }
  
  return {
    totalCost,
    loanNeeded,
    monthlyPayment: netMonthlyPayment, // Return net payment after rent
    status,
  };
}

/**
 * Calculate saving per month mode results
 * Note: This mode is less relevant now without target period, but kept for backward compatibility
 */
export function calculateSavingMode(
  property: PropertyInput | { price: number },
  availableCash: number,
  targetPeriodMonths: number = 24 // Default to 24 months if not provided
): SavingCalculationResult {
  const totalCost = property.price; // No extra costs, just the property price
  const neededSavings = Math.max(0, totalCost - availableCash);
  const months = Math.max(1, targetPeriodMonths);
  const savingPerMonth = neededSavings / months;
  
  // Determine status
  let status: SavingStatus;
  if (savingPerMonth === 0) {
    status = "Already Covered";
  } else if (savingPerMonth <= availableCash / 12) {
    status = "Realistic";
  } else {
    status = "Aggressive";
  }
  
  return {
    totalCost,
    neededSavings,
    savingPerMonth,
    status,
  };
}
