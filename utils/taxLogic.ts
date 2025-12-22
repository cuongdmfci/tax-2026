import { CalculationResult, TaxConfig, Region } from '../types';
import { RATES, EMPLOYER_RATES, INSURANCE_CAP_BASE } from '../constants';

export const calculateInsurance = (inputSalary: number, regionMinWage: number) => {
  // BHXH & BHYT are capped at 20 * Base Salary (Lương cơ sở)
  const salaryForSocialHealth = Math.min(inputSalary, INSURANCE_CAP_BASE);
  
  // BHTN is capped at 20 * Regional Minimum Wage (Lương tối thiểu vùng)
  const salaryForUnemployment = Math.min(inputSalary, 20 * regionMinWage);

  // Employee Calculations (10.5%)
  const empBhxh = salaryForSocialHealth * RATES.BHXH;
  const empBhyt = salaryForSocialHealth * RATES.BHYT;
  const empBhtn = salaryForUnemployment * RATES.BHTN;
  const employeeTotal = empBhxh + empBhyt + empBhtn;

  // Employer Calculations (21.5%)
  // Standard breakdown:
  // BHXH: 17.5% = 17% (Social) + 0.5% (Accident/Disease - BHTNLĐ-BNN)
  // BHYT: 3%
  // BHTN: 1%
  const emrBhxhMain = salaryForSocialHealth * 0.17; // 17%
  const emrBhtnld = salaryForSocialHealth * 0.005; // 0.5%
  const emrBhyt = salaryForSocialHealth * 0.03; // 3%
  const emrBhtn = salaryForUnemployment * 0.01; // 1%

  const employerTotal = emrBhxhMain + emrBhtnld + emrBhyt + emrBhtn;
  
  return {
    employee: employeeTotal,
    employer: employerTotal,
    details: {
        salaryForSocialHealth,
        salaryForUnemployment,
        employerBreakdown: {
            bhxh: emrBhxhMain,
            bhtnld: emrBhtnld,
            bhyt: emrBhyt,
            bhtn: emrBhtn
        }
    }
  };
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

    const lower = bracket.min;
    const upper = bracket.max ?? Infinity;
    
    if (taxableIncome > lower) {
      const amountInBracket = Math.min(taxableIncome, upper) - lower;
      const taxForBracket = amountInBracket * bracket.rate;
      totalTax += taxForBracket;
      
      bracketDetails.push({
        label: bracket.label,
        amount: taxForBracket,
        rate: bracket.rate,
        taxableAmount: amountInBracket
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