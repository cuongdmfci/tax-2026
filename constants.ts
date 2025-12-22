import { TaxConfig } from './types';

export const BASE_SALARY_2024 = 2340000; // From 1/7/2024
export const INSURANCE_CAP_BASE = 20 * BASE_SALARY_2024; // 46,800,000

// Employee Rates (10.5%)
export const RATES = {
  BHXH: 0.08,
  BHYT: 0.015,
  BHTN: 0.01,
};

// Employer Rates (21.5%)
// BHXH: 17.5% (14% Hưu trí + 3% Ốm đau + 0.5% TNLD)
// BHYT: 3%
// BHTN: 1%
export const EMPLOYER_RATES = {
  BHXH: 0.175,
  BHYT: 0.03,
  BHTN: 0.01,
};

export const OLD_TAX_CONFIG: TaxConfig = {
  name: "Quy định hiện hành (Trước 1/7/2025)",
  selfDeduction: 11000000,
  dependentDeduction: 4400000,
  brackets: [
    { min: 0, max: 5000000, rate: 0.05, label: "Đến 5 triệu" },
    { min: 5000000, max: 10000000, rate: 0.10, label: "5 đến 10 triệu" },
    { min: 10000000, max: 18000000, rate: 0.15, label: "10 đến 18 triệu" },
    { min: 18000000, max: 32000000, rate: 0.20, label: "18 đến 32 triệu" },
    { min: 32000000, max: 52000000, rate: 0.25, label: "32 đến 52 triệu" },
    { min: 52000000, max: 80000000, rate: 0.30, label: "52 đến 80 triệu" },
    { min: 80000000, max: null, rate: 0.35, label: "Trên 80 triệu" },
  ]
};

export const NEW_TAX_CONFIG: TaxConfig = {
  name: "Đề xuất mới (Từ 1/7/2025)",
  selfDeduction: 15500000,
  dependentDeduction: 6200000,
  brackets: [
    { min: 0, max: 10000000, rate: 0.05, label: "Đến 10 triệu" },
    { min: 10000000, max: 18000000, rate: 0.10, label: "10 đến 18 triệu" },
    { min: 18000000, max: 32000000, rate: 0.15, label: "18 đến 32 triệu" },
    { min: 32000000, max: 52000000, rate: 0.20, label: "32 đến 52 triệu" },
    { min: 52000000, max: null, rate: 0.25, label: "Trên 52 triệu" }, 
  ]
};