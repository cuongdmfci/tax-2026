import React, { useState, useEffect, useRef } from 'react';
import { Calculator, Users, DollarSign, AlertCircle, ArrowUpCircle, Wallet, ShieldCheck, Info, Briefcase, ChevronDown, ChevronRight, Calendar, Clock, PiggyBank } from 'lucide-react';
import { Region, RegionPre2026 } from './types';
import { OLD_TAX_CONFIG, NEW_TAX_CONFIG } from './constants';
import { calculateInsurance, calculateTax, formatCurrency } from './utils/taxLogic';
import { ComparisonChart } from './components/ComparisonChart';
import { InfoTable } from './components/InfoTable';
import { DetailedBreakdown } from './components/DetailedBreakdown';
import { TaxBracketDetailTable } from './components/TaxBracketDetailTable';
import { EmployerCostTable } from './components/EmployerCostTable';

type RegionTier = 'I' | 'II' | 'III' | 'IV';
type InsurancePeriod = 'after_2026' | 'before_2026';

const App: React.FC = () => {
  // Helper to load state from localStorage
  const loadState = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(`Error loading ${key} from localStorage`, e);
    }
    return defaultValue;
  };

  const [gross, setGross] = useState<number>(() => loadState('gross', 50000000));
  const [dependents, setDependents] = useState<number>(() => loadState('dependents', 2));
  const [otherCosts, setOtherCosts] = useState<number>(() => loadState('otherCosts', 0));
  
  // Global State
  const [selectedPeriod, setSelectedPeriod] = useState<InsurancePeriod>(() => loadState('selectedPeriod', 'after_2026'));
  
  // Insurance State
  const [insuranceMode, setInsuranceMode] = useState<'full' | 'manual'>(() => loadState('insuranceMode', 'full'));
  const [regionTier, setRegionTier] = useState<RegionTier>(() => loadState('regionTier', 'I'));
  const [manualInsuranceSalary, setManualInsuranceSalary] = useState<number>(() => loadState('manualInsuranceSalary', 5310000));

  // Ref to track first render for auto-update logic
  const isFirstRender = useRef(true);

  // Derive current region value based on tier and period
  const getRegionValue = (tier: RegionTier, period: InsurancePeriod) => {
    if (period === 'after_2026') {
       return Region[tier];
    } else {
       return RegionPre2026[tier];
    }
  };

  const currentRegionMinWage = getRegionValue(regionTier, selectedPeriod);

  // Effect: Auto-update manual salary when Region or Period changes (Only in manual mode)
  // Skip first render to preserve loaded localStorage value
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (insuranceMode === 'manual') {
      setManualInsuranceSalary(currentRegionMinWage);
    }
  }, [regionTier, selectedPeriod, insuranceMode]);

  // Effect: Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('gross', JSON.stringify(gross));
      localStorage.setItem('dependents', JSON.stringify(dependents));
      localStorage.setItem('otherCosts', JSON.stringify(otherCosts));
      localStorage.setItem('insuranceMode', JSON.stringify(insuranceMode));
      localStorage.setItem('selectedPeriod', JSON.stringify(selectedPeriod));
      localStorage.setItem('regionTier', JSON.stringify(regionTier));
      localStorage.setItem('manualInsuranceSalary', JSON.stringify(manualInsuranceSalary));
    } catch (e) {
      console.error("Error saving state to localStorage", e);
    }
  }, [gross, dependents, otherCosts, insuranceMode, selectedPeriod, regionTier, manualInsuranceSalary]);

  const insuranceSalary = insuranceMode === 'full' ? gross : manualInsuranceSalary;
  const isInsuranceBelowMin = insuranceSalary < currentRegionMinWage;

  // Gross Input Handler
  const handleGrossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
    setGross(val);
  };

  // Other Costs Input Handler
  const handleOtherCostsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
    setOtherCosts(val);
  };

  // Manual Insurance Input Handler
  const handleManualInsuranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
    setManualInsuranceSalary(val);
  };

  const calculatedInsurance = calculateInsurance(insuranceSalary, currentRegionMinWage);

  // -------------------------------------------------------------------------
  // Dynamic Configuration based on Selected Period (Global Logic)
  // -------------------------------------------------------------------------
  
  // Old Law Config:
  // - Before 2026: Uses Old Deductions (11M / 4.4M) + Old Brackets
  // - After 2026: Uses New Deductions (15.5M / 6.2M) + Old Brackets (Comparison scenario)
  const effectiveOldConfig = {
    ...OLD_TAX_CONFIG,
    selfDeduction: selectedPeriod === 'after_2026' ? 15500000 : 11000000,
    dependentDeduction: selectedPeriod === 'after_2026' ? 6200000 : 4400000,
    // Keep OLD brackets
  };

  // New Law Config:
  // - ALWAYS uses New Deductions (15.5M / 6.2M) + New Brackets
  const effectiveNewConfig = NEW_TAX_CONFIG;

  // Result for "Old Law" (Brackets)
  const oldResult = calculateTax(
    gross, 
    dependents, 
    effectiveOldConfig, 
    calculatedInsurance.employee
  );

  // Result for "New Law" (Brackets)
  const newResult = calculateTax(
    gross, 
    dependents, 
    effectiveNewConfig, 
    calculatedInsurance.employee
  );

  // Apply "Other Costs" (After Tax) deduction
  oldResult.net = Math.max(0, oldResult.net - otherCosts);
  newResult.net = Math.max(0, newResult.net - otherCosts);
  // -------------------------------------------------------------------------

  // Determine the "Active" result based on the top selector for display purposes
  const activeResult = selectedPeriod === 'after_2026' ? newResult : oldResult;
  const diffNet = newResult.net - oldResult.net;

  // Helper for Income Before Tax (Gross - Insurance)
  const incomeBeforeTaxOld = oldResult.gross - oldResult.insurance;
  const incomeBeforeTaxNew = newResult.gross - newResult.insurance;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Calculator className="w-8 h-8" />
                Tính Thuế TNCN 2026
              </h1>
              <p className="mt-2 text-teal-100 text-lg">
                Công cụ so sánh mức lương Net trước và sau thay đổi luật Thuế (01/07/2026)
              </p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <span className="text-sm font-medium">Ngày hiệu lực dự kiến: </span>
              <span className="font-bold text-yellow-300">01/07/2026</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-6">
              
              {/* GLOBAL PERIOD SELECTOR - Moved to Top */}
              <div className="mb-6 p-4 bg-teal-50/50 rounded-lg border border-teal-100">
                <label className="block text-sm font-bold text-teal-800 mb-3 flex items-center gap-2">
                    <Clock size={18}/> Thời điểm so sánh
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setSelectedPeriod('before_2026')}
                        className={`px-3 py-3 text-sm rounded-lg border transition-all shadow-sm
                            ${selectedPeriod === 'before_2026'
                            ? 'bg-blue-600 border-blue-600 text-white font-bold ring-2 ring-blue-200'
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                            }
                        `}
                    >
                        Trước 1/1/2026
                    </button>
                    <button
                        onClick={() => setSelectedPeriod('after_2026')}
                        className={`px-3 py-3 text-sm rounded-lg border transition-all shadow-sm
                            ${selectedPeriod === 'after_2026'
                            ? 'bg-emerald-600 border-emerald-600 text-white font-bold ring-2 ring-emerald-200'
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                            }
                        `}
                    >
                        Từ 1/1/2026
                    </button>
                </div>
                <p className="text-xs text-teal-700 mt-2 flex items-start gap-1">
                   <Info size={14} className="mt-0.5 shrink-0"/>
                   {selectedPeriod === 'before_2026' 
                     ? 'Luật cũ: giảm trừ 11tr/4.4tr. Luật mới: giảm trừ 15.5tr/6.2tr.'
                     : 'Cả 2 phương án đều áp dụng mức giảm trừ mới: 15.5tr/6.2tr.'
                   }
                </p>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" />
                Thông tin thu nhập
              </h2>

              <div className="space-y-6">
                {/* Gross Salary Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lương Gross (VND)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={new Intl.NumberFormat('vi-VN').format(gross)}
                      onChange={handleGrossChange}
                      className="block w-full rounded-md border-gray-300 pl-4 pr-12 py-3 focus:border-teal-500 focus:ring-teal-500 sm:text-lg font-mono font-medium shadow-sm border"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">VND</span>
                    </div>
                  </div>
                </div>

                {/* Dependents Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số người phụ thuộc
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={dependents}
                      onChange={(e) => setDependents(Math.max(0, parseInt(e.target.value) || 0))}
                      className="block w-full rounded-md border-gray-300 pl-10 py-3 focus:border-teal-500 focus:ring-teal-500 shadow-sm border"
                    />
                  </div>
                </div>

                {/* Other Costs Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chi phí khác (sau thuế)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PiggyBank className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={new Intl.NumberFormat('vi-VN').format(otherCosts)}
                      onChange={handleOtherCostsChange}
                      className="block w-full rounded-md border-gray-300 pl-10 pr-12 py-3 focus:border-teal-500 focus:ring-teal-500 shadow-sm border"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">VND</span>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500 italic">
                      Khoản này sẽ được trừ trực tiếp vào thu nhập Net.
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Cấu hình Bảo hiểm
                  </h3>

                  {/* 1. Insurance Mode Selection */}
                  <div className="mb-4">
                     <label className="block text-xs text-gray-500 mb-2">Mức lương đóng bảo hiểm</label>
                     <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input 
                            type="radio" 
                            name="insuranceMode" 
                            checked={insuranceMode === 'full'}
                            onChange={() => setInsuranceMode('full')}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                          Full lương Gross
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                          <input 
                            type="radio" 
                            name="insuranceMode" 
                            checked={insuranceMode === 'manual'}
                            onChange={() => setInsuranceMode('manual')}
                            className="text-teal-600 focus:ring-teal-500"
                          />
                          Nhập mức đóng
                        </label>
                     </div>
                  </div>

                  {/* Manual Settings Container */}
                  {insuranceMode === 'manual' && (
                    <div className="space-y-4 mb-4 border-l-2 border-teal-100 pl-3">
                      {/* Region Selection (Only visible in Manual Mode) */}
                      <div className="animate-fade-in">
                        <label className="block text-xs text-gray-500 mb-2">
                          Vùng (Lương tối thiểu {selectedPeriod === 'before_2026' ? 'cũ' : 'mới'})
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {(['I', 'II', 'III', 'IV'] as RegionTier[]).map((tier) => {
                            // Determine value to show based on period
                            const val = getRegionValue(tier, selectedPeriod);
                            
                            return (
                              <button 
                                key={tier}
                                onClick={() => setRegionTier(tier)}
                                className={`px-2 py-2 text-xs rounded border transition-colors text-left
                                  ${regionTier === tier 
                                    ? 'bg-teal-50 border-teal-500 text-teal-700 font-medium ring-1 ring-teal-500' 
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                  }`}
                              >
                                <span className="block font-bold">Vùng {tier}</span>
                                <span className="block text-[10px] opacity-75">{formatCurrency(val)}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. Input Field (Always visible) */}
                  <div className="space-y-2 animate-fade-in">
                      <label className="block text-xs text-gray-500">
                        Mức đóng cụ thể {insuranceMode === 'full' && '(Theo lương Gross)'}
                      </label>
                      <input
                      type="text"
                      inputMode="numeric"
                      disabled={insuranceMode === 'full'}
                      value={new Intl.NumberFormat('vi-VN').format(insuranceMode === 'full' ? gross : manualInsuranceSalary)}
                      onChange={insuranceMode === 'manual' ? handleManualInsuranceChange : undefined}
                      className={`block w-full rounded-md pl-3 pr-3 py-2 text-sm shadow-sm border
                        ${insuranceMode === 'full'
                          ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'
                          : isInsuranceBelowMin 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500'
                        }
                      `}
                    />
                    {insuranceMode === 'manual' && isInsuranceBelowMin && (
                      <p className="text-xs text-red-500 mt-1 flex items-start gap-1">
                        <AlertCircle size={12} className="mt-0.5" />
                        Thấp hơn lương tối thiểu vùng ({formatCurrency(currentRegionMinWage)})
                      </p>
                    )}
                  </div>

                  {/* Info Alert */}
                  <div className="bg-blue-50 p-2 rounded border border-blue-100 flex gap-2 mt-3">
                      <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] text-blue-700 leading-tight">
                        {selectedPeriod === 'before_2026' 
                          ? 'Mức lương đóng BHXH không được thấp hơn lương tối thiểu vùng tại thời điểm đóng.'
                          : 'Từ 01/01/2026 (NĐ 293/2025), lương đóng BHXH không được thấp hơn lương tối thiểu vùng mới.'
                        }
                      </p>
                  </div>

                </div>
                
                {/* Insurance Breakdown Table */}
                <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                       <Briefcase className="w-4 h-4 text-teal-600" />
                       Chi tiết đóng bảo hiểm
                    </h3>
                    <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-3">
                        {/* Employee */}
                        <div className="flex justify-between items-center text-sm">
                            <div>
                                <span className="text-gray-600 block">Người lao động (10.5%)</span>
                                <span className="text-[10px] text-gray-400">(Trừ vào lương)</span>
                            </div>
                            <span className="font-semibold text-gray-800">
                                {formatCurrency(calculatedInsurance.employee)}
                            </span>
                        </div>
                        
                        {/* Employer */}
                        <div className="flex justify-between items-center text-sm border-t border-gray-200 pt-2">
                            <div>
                                <span className="text-gray-600 block">Doanh nghiệp (21.5%)</span>
                                <span className="text-[10px] text-gray-400">(Chi phí của công ty)</span>
                            </div>
                            <span className="font-semibold text-gray-800">
                                {formatCurrency(calculatedInsurance.employer)}
                            </span>
                        </div>

                        {/* Total Insurance */}
                        <div className="flex justify-between items-center text-sm border-t border-dashed border-gray-300 pt-2 bg-gray-100/50 -mx-3 px-3 pb-1 -mb-1 rounded-b-lg">
                            <span className="text-teal-800 font-bold">Tổng bảo hiểm</span>
                            <span className="font-bold text-teal-700 text-base">
                                {formatCurrency(calculatedInsurance.employee + calculatedInsurance.employer)}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                        <span>Thu nhập tính thuế ({selectedPeriod === 'before_2026' ? 'Cũ' : 'Mới'}):</span>
                        <span className="font-medium text-gray-900">{formatCurrency(activeResult.taxableIncome > 0 ? activeResult.taxableIncome : 0)}</span>
                    </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Cards: Net Income Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Old Card - Dimmed if new period selected */}
              <div className={`rounded-xl shadow-sm border relative overflow-hidden flex flex-col transition-all duration-300
                  ${selectedPeriod === 'before_2026' 
                    ? 'bg-white border-blue-400 ring-2 ring-blue-200 z-10 scale-[1.02]' 
                    : 'bg-white/80 border-gray-200 opacity-75 grayscale-[0.5] hover:grayscale-0 hover:opacity-100'}
              `}>
                <div className="p-6 pb-4 relative">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <AlertCircle size={64} className="text-gray-500"/>
                   </div>
                   <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-1">Luật Cũ ({selectedPeriod === 'after_2026' ? 'Giảm trừ mới' : 'Trước 2026'})</h3>
                   <div className="text-gray-400 text-xs mb-3 font-medium uppercase">Tổng thu nhập sau thuế (Net)</div>
                   <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-700">
                         {formatCurrency(oldResult.net)}
                      </span>
                   </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex-grow border-t border-gray-100 text-sm space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tổng trước thuế <span className="text-xs text-gray-400 block">(Gross - Bảo hiểm)</span></span>
                        <span className="font-semibold text-gray-800">{formatCurrency(incomeBeforeTaxOld)}</span>
                    </div>

                    <div className="flex justify-between items-start group relative">
                         <div className="flex flex-col">
                             <span className="text-gray-600 border-b border-dashed border-gray-300 cursor-help">Giảm trừ gia cảnh</span>
                             {dependents > 0 && <span className="text-[10px] text-gray-400">{dependents} phụ thuộc</span>}
                         </div>
                         <div className="text-right">
                             <span className="font-medium text-gray-700 block">
                                 -{formatCurrency(oldResult.details.selfDeduction + oldResult.details.dependentDeduction)}
                             </span>
                             <div className="text-[10px] text-gray-400 hidden group-hover:block absolute right-0 bg-white p-2 shadow-lg rounded border border-gray-100 z-10 w-48">
                                 <div className="flex justify-between"><span>Bản thân:</span> <span>{formatCurrency(oldResult.details.selfDeduction)}</span></div>
                                 {dependents > 0 && <div className="flex justify-between"><span>Phụ thuộc:</span> <span>{formatCurrency(oldResult.details.dependentDeduction)}</span></div>}
                             </div>
                         </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-gray-600 font-medium">Thu nhập chịu thuế</span>
                        <span className="font-bold text-gray-800">{formatCurrency(oldResult.taxableIncome)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-600">Thuế TNCN</span>
                        <span className="font-bold text-red-500">-{formatCurrency(oldResult.tax)}</span>
                    </div>
                    {otherCosts > 0 && (
                       <div className="flex justify-between items-center pt-2 border-t border-gray-200 border-dashed">
                          <span className="text-gray-500 italic">Chi phí khác</span>
                          <span className="font-medium text-gray-600">-{formatCurrency(otherCosts)}</span>
                       </div>
                    )}
                </div>
              </div>

              {/* New Card - Dimmed if old period selected */}
              <div className={`rounded-xl shadow-md border relative overflow-hidden flex flex-col transition-all duration-300
                  ${selectedPeriod === 'after_2026' 
                    ? 'bg-white border-teal-500 ring-2 ring-teal-200 z-10 scale-[1.02]' 
                    : 'bg-white/80 border-gray-200 opacity-75 grayscale-[0.5] hover:grayscale-0 hover:opacity-100'}
              `}>
                 <div className="p-6 pb-4 relative">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Wallet size={64} className="text-teal-600"/>
                   </div>
                   <h3 className="text-teal-700 font-medium text-sm uppercase tracking-wider mb-1">Đề Xuất Mới (Sau 2026)</h3>
                   <div className="text-teal-600/70 text-xs mb-3 font-medium uppercase">Tổng thu nhập sau thuế (Net)</div>
                   <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-emerald-600">
                         {formatCurrency(newResult.net)}
                      </span>
                   </div>
                </div>

                <div className="bg-teal-50/30 px-6 py-4 flex-grow border-t border-teal-100 text-sm space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tổng trước thuế <span className="text-xs text-gray-400 block">(Gross - Bảo hiểm)</span></span>
                        <span className="font-semibold text-gray-800">{formatCurrency(incomeBeforeTaxNew)}</span>
                    </div>

                    <div className="flex justify-between items-start group relative">
                         <div className="flex flex-col">
                             <span className="text-gray-600 border-b border-dashed border-gray-300 cursor-help">Giảm trừ gia cảnh</span>
                             {dependents > 0 && <span className="text-[10px] text-gray-400">{dependents} phụ thuộc</span>}
                         </div>
                         <div className="text-right">
                             <span className="font-medium text-teal-700 block">
                                 -{formatCurrency(newResult.details.selfDeduction + newResult.details.dependentDeduction)}
                             </span>
                             <div className="text-[10px] text-gray-500 hidden group-hover:block absolute right-0 bg-white p-2 shadow-lg rounded border border-gray-100 z-10 w-48">
                                 <div className="flex justify-between"><span>Bản thân:</span> <span>{formatCurrency(newResult.details.selfDeduction)}</span></div>
                                 {dependents > 0 && <div className="flex justify-between"><span>Phụ thuộc:</span> <span>{formatCurrency(newResult.details.dependentDeduction)}</span></div>}
                             </div>
                         </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-teal-200/50">
                        <span className="text-gray-600 font-medium">Thu nhập chịu thuế</span>
                        <span className="font-bold text-teal-800">{formatCurrency(newResult.taxableIncome)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-600">Thuế TNCN</span>
                        <span className="font-bold text-red-500">-{formatCurrency(newResult.tax)}</span>
                    </div>
                    {otherCosts > 0 && (
                       <div className="flex justify-between items-center pt-2 border-t border-teal-200/50 border-dashed">
                          <span className="text-gray-500 italic">Chi phí khác</span>
                          <span className="font-medium text-gray-600">-{formatCurrency(otherCosts)}</span>
                       </div>
                    )}
                </div>
              </div>
            </div>

            {/* Savings Highlight - Only relevant if comparing Old vs New, or viewing New */}
            {diffNet > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                            <ArrowUpCircle size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-emerald-800 text-lg">Bạn tiết kiệm được {formatCurrency(diffNet)} / tháng</p>
                            <p className="text-sm text-emerald-600">Khi áp dụng luật mới so với quy định cũ.</p>
                        </div>
                    </div>
                </div>
            )}
             {diffNet === 0 && oldResult.tax === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center text-blue-800">
                    Bạn chưa phải đóng thuế TNCN ở cả hai phương án.
                </div>
            )}

            {/* Visual Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2">So sánh trực quan</h3>
              <ComparisonChart oldResult={oldResult} newResult={newResult} />
            </div>

            {/* Detailed Breakdown */}
            <DetailedBreakdown oldResult={oldResult} newResult={newResult} otherCosts={otherCosts} />

            {/* Employer Cost Table */}
            <EmployerCostTable gross={gross} employerDetails={calculatedInsurance.details.employerBreakdown} />

            {/* Tax Bracket Detail Tables - Show Active Only? Or Both? Let's show active first */}
            <div className="space-y-6 mt-6">
                <TaxBracketDetailTable result={oldResult} variant="old" />
                <TaxBracketDetailTable result={newResult} variant="new" />
            </div>

            {/* Info Table */}
            <InfoTable />

          </div>
        </div>
      </main>
      
      <footer className="max-w-7xl mx-auto px-4 py-6 mt-8 text-center text-gray-400 text-sm">
        <p>© 2024 Vietnam Tax Calculator. Các tính toán dựa trên mức lương cơ sở 2.34 triệu đồng.</p>
        <p>Quy định BHXH cập nhật theo Nghị định 293/2025/NĐ-CP (Hiệu lực 01/01/2026).</p>
      </footer>
    </div>
  );
};

export default App;