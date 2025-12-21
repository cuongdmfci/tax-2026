import { CalculationResult, TaxConfig, Region } from '../types';
import { RATES, INSURANCE_CAP_BASE } from '../constants';

export const calculateInsurance = (gross: number, regionMinWage: number): number => {
  const bhxh = Math.min(gross, INSURANCE_CAP_BASE) * RATES.BHXH;
  const bhyt = Math.min(gross, INSURANCE_CAP_BASE) * RATES.BHYT;
  const bhtnCap = 20 * regionMinWage;
  const bhtn = Math.min(gross, bhtnCap) * RATES.BHTN;
  
  return bhxh + bhyt + bhtn;
};

export const calculateTax = (
  gross: number, 
  dependents: number, 
  config: TaxConfig,
  insurance: number
): CalculationResult => {
  const totalDeduction = config.selfDeduction + (dependents * config.dependentDeduction);
  const taxableIncome = Math.max(0, gross - insurance - totalDeduction);
  
  let remainingIncome = taxableIncome;
  let totalTax = 0;
  const bracketDetails = [];

  for (const bracket of config.brackets) {
    if (remainingIncome <= 0) break;

    const range = bracket.max === null 
      ? remainingIncome 
      : bracket.max - bracket.min;
    
    // How much falls into this bracket
    // If we are calculating iteratively, we need to see how much of the taxable income falls here.
    // Easier way: 
    // Check intersection of [bracket.min, bracket.max] and [0, taxableIncome]
    // Since brackets are sequential, we can just take the chunk.
    
    // Correct logic for sequential calculation:
    // Amount in this bracket = Math.min(taxableIncome, bracket.max) - bracket.min (but floored at 0)
    // Wait, simpler:
    
    const lower = bracket.min;
    const upper = bracket.max ?? Infinity;
    
    if (taxableIncome > lower) {
      const amountInBracket = Math.min(taxableIncome, upper) - lower;
      const taxForBracket = amountInBracket * bracket.rate;
      totalTax += taxForBracket;
      
      bracketDetails.push({
        label: bracket.label,
        amount: taxForBracket,
        rate: bracket.rate
      });
    }
  }

  return {
    gross,
    insurance,
    taxableIncome,
    tax: totalTax,
    net: gross - insurance - totalTax,
    details: {
      selfDeduction: config.selfDeduction,
      dependentDeduction: dependents * config.dependentDeduction,
      bracketDetails
    }
  };
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};