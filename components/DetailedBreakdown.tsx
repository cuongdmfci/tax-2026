import React from 'react';
import { CalculationResult } from '../types';
import { formatCurrency } from '../utils/taxLogic';

interface DetailedBreakdownProps {
  oldResult: CalculationResult;
  newResult: CalculationResult;
}

export const DetailedBreakdown: React.FC<DetailedBreakdownProps> = ({ oldResult, newResult }) => {
  const rows = [
    { 
      label: 'Lương Gross', 
      oldVal: oldResult.gross, 
      newVal: newResult.gross,
      bold: true 
    },
    { 
      label: 'Bảo hiểm bắt buộc (10.5%)', 
      oldVal: oldResult.insurance, 
      newVal: newResult.insurance,
      isDeduction: true 
    },
    { 
      label: 'Thu nhập trước thuế', 
      oldVal: oldResult.gross - oldResult.insurance, 
      newVal: newResult.gross - newResult.insurance,
      subHeader: true
    },
    { 
      label: 'Giảm trừ bản thân', 
      oldVal: oldResult.details.selfDeduction, 
      newVal: newResult.details.selfDeduction,
      isDeduction: true 
    },
    { 
      label: 'Giảm trừ phụ thuộc', 
      oldVal: oldResult.details.dependentDeduction, 
      newVal: newResult.details.dependentDeduction,
      isDeduction: true 
    },
    { 
      label: 'Thu nhập chịu thuế', 
      oldVal: oldResult.taxableIncome, 
      newVal: newResult.taxableIncome,
      bold: true
    },
    { 
      label: 'Thuế TNCN', 
      oldVal: oldResult.tax, 
      newVal: newResult.tax,
      isDeduction: true,
      textClass: 'text-red-600 font-medium'
    },
    { 
      label: 'Lương Net (Thực nhận)', 
      oldVal: oldResult.net, 
      newVal: newResult.net,
      isNet: true
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
        <h3 className="font-bold text-gray-800">Bảng tính chi tiết (Detailed Breakdown)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
              <th className="px-6 py-3 text-left font-medium">Khoản mục</th>
              <th className="px-6 py-3 text-right font-medium">Luật Cũ</th>
              <th className="px-6 py-3 text-right font-medium">Luật Mới (1/7/2025)</th>
              <th className="px-6 py-3 text-right font-medium">Chênh lệch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row, index) => {
              const diff = row.newVal - row.oldVal;
              const isNet = row.isNet;
              
              // Logic for coloring the difference column
              let diffColor = 'text-gray-400';
              if (diff !== 0) {
                 if (isNet) {
                     // Net income: Higher is Green
                     diffColor = diff > 0 ? 'text-emerald-600' : 'text-red-500';
                 } else if (row.label.includes('Thuế TNCN')) {
                     // Tax: Lower is Green (saving)
                     diffColor = diff < 0 ? 'text-emerald-600' : 'text-red-500';
                 } else if (row.isDeduction) {
                      // Deductions: No strict good/bad color, just neutral or specific logic
                      diffColor = 'text-gray-600';
                 } else {
                     // Income components: Higher is generally "Green" but let's keep neutral for components
                     diffColor = 'text-gray-600';
                 }
              }

              return (
                <tr key={index} className={isNet ? 'bg-emerald-50' : 'hover:bg-gray-50'}>
                  <td className={`px-6 py-3 ${row.bold || row.subHeader || isNet ? 'font-bold text-gray-800' : 'text-gray-600'} ${row.subHeader ? 'italic bg-gray-50/50' : ''}`}>
                    {row.label}
                  </td>
                  <td className={`px-6 py-3 text-right ${row.textClass || 'text-gray-700'} ${row.bold || isNet ? 'font-bold' : ''}`}>
                     {row.isDeduction && row.oldVal > 0 ? '-' : ''}{formatCurrency(row.oldVal)}
                  </td>
                  <td className={`px-6 py-3 text-right ${row.textClass || 'text-gray-700'} ${row.bold || isNet ? 'font-bold' : ''}`}>
                     {row.isDeduction && row.newVal > 0 ? '-' : ''}{formatCurrency(row.newVal)}
                  </td>
                  <td className={`px-6 py-3 text-right font-medium ${diffColor}`}>
                    {diff > 0 ? '+' : ''}{diff !== 0 ? formatCurrency(diff) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};