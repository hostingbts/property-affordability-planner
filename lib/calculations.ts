import { PropertyInput, GlobalSettings, LoanCalculationResult, SavingCalculationResult, LoanStatus, SavingStatus } from "@/types";

/**
 * Calculate loan mode results
 */
export function calculateLoanMode(
  property: PropertyInput | { price: number; extraCosts: number; interestRate: number; termYears: number },
  availableCash: number
): LoanCalculationResult {
  const totalCost = property.price + property.extraCosts;
  const loanNeeded = Math.max(0, totalCost - availableCash);
  
  // Calculate monthly payment using standard annuity formula
  let monthlyPayment = 0;
  if (loanNeeded > 0) {
    const monthlyRate = property.interestRate / 100 / 12;
    const totalMonths = property.termYears * 12;
    
    if (monthlyRate === 0) {
      monthlyPayment = loanNeeded / totalMonths;
    } else {
      // Formula: loanNeeded * (monthlyRate * (1 + monthlyRate) ** totalMonths) / ((1 + monthlyRate) ** totalMonths - 1)
      monthlyPayment = loanNeeded * (monthlyRate * (1 + monthlyRate) ** totalMonths) / ((1 + monthlyRate) ** totalMonths - 1);
    }
  }
  
  // Determine status
  let status: LoanStatus;
  if (monthlyPayment === 0) {
    status = "Fully Funded";
  } else if (monthlyPayment <= availableCash * 0.05) {
    status = "Within Budget";
  } else if (monthlyPayment <= availableCash * 0.15) {
    status = "Almost There";
  } else {
    status = "Out of Budget";
  }
  
  return {
    totalCost,
    loanNeeded,
    monthlyPayment,
    status,
  };
}

/**
 * Calculate saving per month mode results
 */
export function calculateSavingMode(
  property: PropertyInput | { price: number; extraCosts: number },
  availableCash: number,
  targetPeriodMonths: number
): SavingCalculationResult {
  const totalCost = property.price + property.extraCosts;
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
