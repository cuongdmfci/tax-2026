import React, { useState, useEffect } from 'react';
import { Calculator, Users, DollarSign, AlertCircle, ArrowUpCircle, Wallet } from 'lucide-react';
import { Region } from './types';
import { OLD_TAX_CONFIG, NEW_TAX_CONFIG } from './constants';
import { calculateInsurance, calculateTax, formatCurrency } from './utils/taxLogic';
import { ComparisonChart } from './components/ComparisonChart';
import { InfoTable } from './components/InfoTable';

const App: React.FC = () => {
  const [gross, setGross] = useState<number>(30000000);
  const [dependents, setDependents] = useState<number>(0);
  const [region, setRegion] = useState<Region>(Region.I);
  
  // Gross Input Handler
  const handleGrossChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-digits
    const val = parseInt(e.target.value.replace(/\D/g, '')) || 0;
    setGross(val);
  };

  const oldResult = calculateTax(
    gross, 
    dependents, 
    OLD_TAX_CONFIG, 
    calculateInsurance(gross, region)
  );

  const newResult = calculateTax(
    gross, 
    dependents, 
    NEW_TAX_CONFIG, 
    calculateInsurance(gross, region)
  );

  const diffNet = newResult.net - oldResult.net;
  const diffTax = oldResult.tax - newResult.tax; // Positive means saving

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

              <div className="space-y-5">
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
                  <p className="mt-1 text-xs text-gray-500">Nhập thu nhập hàng tháng trước thuế</p>
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

                {/* Region Selection (for Insurance Cap) */}
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vùng (để tính trần BHTN)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setRegion(Region.I)}
                      className={`px-3 py-2 text-sm rounded border ${region === Region.I ? 'bg-teal-50 border-teal-500 text-teal-700 font-medium' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                      Vùng I (HN/HCM)
                    </button>
                    <button 
                      onClick={() => setRegion(Region.II)}
                      className={`px-3 py-2 text-sm rounded border ${region === Region.II ? 'bg-teal-50 border-teal-500 text-teal-700 font-medium' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                      Vùng II (ĐN/HP/...)
                    </button>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Bảo hiểm (BHXH, BHYT, BHTN):</span>
                        <span className="font-medium">{formatCurrency(newResult.insurance)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Thu nhập trước thuế:</span>
                        <span className="font-medium">{formatCurrency(newResult.gross - newResult.insurance)}</span>
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
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <AlertCircle size={64} className="text-gray-500"/>
                </div>
                <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">Lương Net (Luật Cũ)</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-700">
                    {formatCurrency(oldResult.net)}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Giảm trừ bản thân:</span>
                    <span className="font-medium">11.000.000 ₫</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Thuế phải đóng:</span>
                    <span className="font-medium text-red-500">{formatCurrency(oldResult.tax)}</span>
                  </div>
                </div>
              </div>

              {/* New Card */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-teal-200 ring-2 ring-teal-50 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Wallet size={64} className="text-teal-600"/>
                </div>
                <h3 className="text-teal-700 font-medium text-sm uppercase tracking-wider">Lương Net (Đề Xuất Mới)</h3>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-emerald-600">
                    {formatCurrency(newResult.net)}
                  </span>
                </div>
                 <div className="mt-4 pt-4 border-t border-teal-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Giảm trừ bản thân:</span>
                    <span className="font-medium text-teal-700">15.500.000 ₫</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">Thuế phải đóng:</span>
                    <span className="font-medium text-red-500">{formatCurrency(newResult.tax)}</span>
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
        <p>© 2024 Vietnam Tax Calculator. Các tính toán dựa trên mức lương cơ sở 2.34 triệu đồng và quy định BHXH hiện hành.</p>
        <p>Thông tin về luật thuế mới dựa trên dự thảo đề xuất áp dụng từ 01/07/2025.</p>
      </footer>
    </div>
  );
};

export default App;