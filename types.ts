export interface TaxBracket {
  min: number;
  max: number | null; // null means infinity
  rate: number;
  label: string;
}

export interface TaxConfig {
  selfDeduction: number;
  dependentDeduction: number;
  brackets: TaxBracket[];
  name: string;
}

export interface CalculationResult {
  gross: number;
  insurance: number;
  taxableIncome: number;
  tax: number;
  net: number;
  details: {
    selfDeduction: number;
    dependentDeduction: number;
    bracketDetails: { label: string; amount: number; rate: number }[];
  };
}

export enum Region {
  I = 4960000,
  II = 4410000,
  III = 3860000,
  IV = 3250000,
}