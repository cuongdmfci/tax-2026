import React from 'react';
import { CalculationResult } from '../types';
import { formatCurrency } from '../utils/taxLogic';

interface Props {
  result: CalculationResult;
  variant?: 'old' | 'new';
}

export const TaxBracketDetailTable: React.FC<Props> = ({ result, variant = 'new' }) => {
  const { bracketDetails, selfDeduction, dependentDeduction } = result.details;
  const totalTaxable = result.taxableIncome;
  const totalTax = result.tax;

  if (totalTaxable <= 0) {
    return null;
  }

  const isOld = variant === 'old';
  const title = isOld ? 'Chi tiết thuế (Luật Cũ)' : 'Chi tiết thuế (Luật Mới)';
  
  // Styles based on variant
  const headerBg = isOld ? 'bg-gray-100' : 'bg-teal-50/50';
  const titleColor = isOld ? 'text-gray-700' : 'text-teal-800';
  const totalLabelColor = isOld ? 'text-gray-800' : 'text-teal-800';
  const totalValueColor = isOld ? 'text-gray-800' : 'text-teal-800';
  const borderColor = isOld ? 'border-gray-200' : 'border-teal-100';
  const footerBg = isOld ? 'bg-gray-50' : 'bg-teal-50/30';

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${isOld ? 'border-gray-200' : 'border-teal-100'} overflow-hidden flex flex-col`}>
      <div className={`px-5 py-4 border-b border-gray-100 ${headerBg}`}>
        <h3 className={`font-bold ${titleColor}`}>{title}</h3>
        <p className="text-xs text-gray-500 mt-1">
          Giảm trừ: {formatCurrency(selfDeduction + dependentDeduction)}
        </p>
      </div>
      <div className="overflow-x-auto flex-grow">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase border-b border-gray-100">
              <th className="px-4 py-3 text-left font-medium whitespace-nowrap">Tên bậc</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">TN tính thuế</th>
              <th className="px-4 py-3 text-center font-medium whitespace-nowrap">Thuế suất</th>
              <th className="px-4 py-3 text-right font-medium whitespace-nowrap">Tiền thuế</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bracketDetails.map((bracket, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-700 font-medium text-xs">{bracket.label}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatCurrency(bracket.taxableAmount)}</td>
                <td className="px-4 py-3 text-center text-gray-600">{(bracket.rate * 100)}%</td>
                <td className="px-4 py-3 text-right font-medium text-gray-800">{formatCurrency(bracket.amount)}</td>
              </tr>
            ))}
            <tr className={`${footerBg} border-t-2 ${borderColor}`}>
              <td className={`px-4 py-3 font-bold ${totalLabelColor}`}>Tổng</td>
              <td className={`px-4 py-3 text-right font-bold ${totalValueColor}`}>{formatCurrency(totalTaxable)}</td>
              <td className="px-4 py-3"></td>
              <td className={`px-4 py-3 text-right font-bold text-red-600`}>{formatCurrency(totalTax)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};