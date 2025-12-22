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
    bracketDetails: { label: string; amount: number; rate: number; taxableAmount: number }[];
  };
}

// 2026 Values (Nghị định 293/2025/NĐ-CP)
export enum Region {
  I = 5310000,
  II = 4730000,
  III = 4140000,
  IV = 3700000,
}