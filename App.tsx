import React, { useState, useEffect } from 'react';
import { Calculator, Users, DollarSign, AlertCircle, ArrowUpCircle, Wallet, ShieldCheck, Info, Briefcase, ChevronDown, ChevronRight } from 'lucide-react';
import { Region } from './types';
import { OLD_TAX_CONFIG, NEW_TAX_CONFIG } from './constants';
import { calculateInsurance, calculateTax, formatCurrency } from './utils/taxLogic';
import { ComparisonChart } from './components/ComparisonChart';
import { InfoTable } from './components/InfoTable';

const App: React.FC = () => {
  const [gross, setGross] = useState<number>(50000000);
  const [dependents, setDependents] = useState<number>(2);
  const [region, setRegion] = useState<Region>(Region.I);
  
  // Insurance State
  const [insuranceMode, setInsuranceMode] = useState<'full' | 'manual'>('full');
  const [manualInsuranceSalary, setManualInsuranceSalary] = useState<number>(5310000);

  // Sync manual default when region changes if user hasn't typed (optional UX, keeping simple for now)
  // Ensure manual salary isn't below min wage for validation
  const insuranceSalary = insuranceMode === 'full' ? gross : manualInsuranceSalary;
  const isInsuranceBelowMin = insuranceSalary < region;

  // Gross Input Handler
  const handleGrossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
    setGross(val);
  };

  // Manual Insurance Input Handler
  const handleManualInsuranceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
    setManualInsuranceSalary(val);
  };

  const calculatedInsurance = calculateInsurance(insuranceSalary, region);

  const oldResult = calculateTax(
    gross, 
    dependents, 
    OLD_TAX_CONFIG, 
    calculatedInsurance.employee
  );

  const newResult = calculateTax(
    gross, 
    dependents, 
    NEW_TAX_CONFIG, 
    calculatedInsurance.employee
  );

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
                Tính Thuế TNCN 2025
              </h1>
              <p className="mt-2 text-teal-100 text-lg">
                Công cụ so sánh mức lương Net trước và sau thay đổi luật Thuế (01/07/2025)
              </p>
            </div>
            <div className="mt-4 md:mt-0 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
              <span className="text-sm font-medium">Ngày hiệu lực dự kiến: </span>
              <span className="font-bold text-yellow-300">01/07/2025</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-6">
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

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Cấu hình Bảo hiểm (Từ 1/1/2026)
                  </h3>

                  {/* Region Selection */}
                  <div className="mb-4">
                    <label className="block text-xs text-gray-500 mb-2">
                      Vùng (Quyết định mức lương tối thiểu)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Vùng I', val: Region.I, desc: 'HN, HCM' },
                        { label: 'Vùng II', val: Region.II, desc: 'ĐN, HP' },
                        { label: 'Vùng III', val: Region.III, desc: 'Bắc Ninh...' },
                        { label: 'Vùng IV', val: Region.IV, desc: 'Khác' },
                      ].map((r) => (
                        <button 
                          key={r.val}
                          onClick={() => setRegion(r.val)}
                          className={`px-2 py-2 text-xs rounded border transition-colors text-left
                            ${region === r.val 
                              ? 'bg-teal-50 border-teal-500 text-teal-700 font-medium' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                          <span className="block font-bold">{r.label}</span>
                          <span className="block text-[10px] opacity-75">{formatCurrency(r.val)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Insurance Salary Mode */}
                  <div className="space-y-3">
                     <label className="block text-xs text-gray-500">Mức lương đóng bảo hiểm</label>
                     <div className="flex items-center gap-4">
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

                     {insuranceMode === 'manual' && (
                        <div className="animate-fade-in">
                           <input
                            type="text"
                            inputMode="numeric"
                            value={new Intl.NumberFormat('vi-VN').format(manualInsuranceSalary)}
                            onChange={handleManualInsuranceChange}
                            className={`block w-full rounded-md pl-3 pr-3 py-2 text-sm shadow-sm border
                              ${isInsuranceBelowMin ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-teal-500 focus:ring-teal-500'}
                            `}
                          />
                          {isInsuranceBelowMin && (
                            <p className="text-xs text-red-500 mt-1 flex items-start gap-1">
                              <AlertCircle size={12} className="mt-0.5" />
                              Thấp hơn lương tối thiểu vùng ({formatCurrency(region)})
                            </p>
                          )}
                        </div>
                     )}
                     
                     {/* Info Alert */}
                     <div className="bg-blue-50 p-2 rounded border border-blue-100 flex gap-2">
                        <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-blue-700 leading-tight">
                          Từ 01/01/2026 (NĐ 293/2025), lương đóng BHXH không được thấp hơn lương tối thiểu vùng.
                        </p>
                     </div>
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
                        <span>Thu nhập tính thuế:</span>
                        <span className="font-medium text-gray-900">{formatCurrency(newResult.taxableIncome > 0 ? newResult.taxableIncome : 0)}</span>
                    </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Top Cards: Net Income Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Old Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 relative overflow-hidden flex flex-col">
                <div className="p-6 pb-4 relative">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <AlertCircle size={64} className="text-gray-500"/>
                   </div>
                   <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider mb-1">Luật Cũ</h3>
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
                </div>
              </div>

              {/* New Card */}
              <div className="bg-white rounded-xl shadow-md border border-teal-200 ring-2 ring-teal-50 relative overflow-hidden flex flex-col">
                 <div className="p-6 pb-4 relative">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Wallet size={64} className="text-teal-600"/>
                   </div>
                   <h3 className="text-teal-700 font-medium text-sm uppercase tracking-wider mb-1">Đề Xuất Mới</h3>
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
                </div>
              </div>
            </div>

            {/* Savings Highlight */}
            {diffNet > 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                            <ArrowUpCircle size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-emerald-800 text-lg">Bạn tiết kiệm được {formatCurrency(diffNet)} / tháng</p>
                            <p className="text-sm text-emerald-600">Thuế TNCN giảm {( (oldResult.tax - newResult.tax) / (oldResult.tax || 1) * 100 ).toFixed(1)}% so với quy định cũ.</p>
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

            {/* Detailed Table */}
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