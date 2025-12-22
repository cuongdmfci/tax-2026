import React from 'react';
import { formatCurrency } from '../utils/taxLogic';

interface Props {
  gross: number;
  employerDetails: {
    bhxh: number;
    bhtnld: number;
    bhyt: number;
    bhtn: number;
  };
}

export const EmployerCostTable: React.FC<Props> = ({ gross, employerDetails }) => {
  const totalInsurance = employerDetails.bhxh + employerDetails.bhtnld + employerDetails.bhyt + employerDetails.bhtn;
  const totalCost = gross + totalInsurance;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-orange-50/50">
        <h3 className="font-bold text-orange-800">Người sử dụng lao động trả (Doanh nghiệp)</h3>
        <p className="text-xs text-gray-500 mt-1">Chi phí thực tế doanh nghiệp phải chi trả cho nhân sự</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
             {/* Gross */}
             <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-700 font-medium">Lương GROSS</td>
                <td className="px-6 py-3 text-right font-bold text-gray-800">{formatCurrency(gross)}</td>
             </tr>
             {/* BHXH 17% */}
             <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-600">BHXH (17%)</td>
                <td className="px-6 py-3 text-right text-gray-700">{formatCurrency(employerDetails.bhxh)}</td>
             </tr>
             {/* BHYT 3% */}
             <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-600">BHYT (3%)</td>
                <td className="px-6 py-3 text-right text-gray-700">{formatCurrency(employerDetails.bhyt)}</td>
             </tr>
             {/* BHTN 1% */}
             <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-600">BHTN (1%)</td>
                <td className="px-6 py-3 text-right text-gray-700">{formatCurrency(employerDetails.bhtn)}</td>
             </tr>
             {/* BHTNLD 0.5% */}
             <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 text-gray-600">BHTNLĐ-BNN (0.5%)</td>
                <td className="px-6 py-3 text-right text-gray-700">{formatCurrency(employerDetails.bhtnld)}</td>
             </tr>
             {/* Total */}
             <tr className="bg-orange-50/30 border-t border-orange-100">
                <td className="px-6 py-3 font-bold text-orange-900">Tổng cộng (Chi phí nhân sự)</td>
                <td className="px-6 py-3 text-right font-bold text-orange-900">{formatCurrency(totalCost)}</td>
             </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};