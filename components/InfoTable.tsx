import React from 'react';
import { ArrowRight } from 'lucide-react';

export const InfoTable: React.FC = () => {
  return (
    <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="font-semibold text-gray-800">Chi tiết thay đổi Bậc Thuế (Từ 7 bậc xuống 5 bậc)</h3>
        <p className="text-sm text-gray-500">So sánh mức thuế suất theo thu nhập tính thuế/tháng</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Mức cũ (Triệu đồng)</th>
              <th className="px-6 py-3">Thuế suất</th>
              <th className="px-6 py-3 text-center">Thay đổi</th>
              <th className="px-6 py-3">Mức mới (Triệu đồng)</th>
              <th className="px-6 py-3">Thuế suất</th>
              <th className="px-6 py-3">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Level 1 */}
            <tr className="bg-white hover:bg-gray-50">
              <td className="px-6 py-3 font-medium">Đến 5</td>
              <td className="px-6 py-3 text-red-500">5%</td>
              <td className="px-6 py-3 text-center text-gray-400"><ArrowRight size={16} className="inline"/></td>
              <td className="px-6 py-3 font-medium text-emerald-700">Đến 10</td>
              <td className="px-6 py-3 text-emerald-600">5%</td>
              <td className="px-6 py-3 text-gray-500">Rộng hơn</td>
            </tr>
            {/* Level 2 */}
            <tr className="bg-white hover:bg-gray-50">
              <td className="px-6 py-3 font-medium">Trên 5 đến 10</td>
              <td className="px-6 py-3 text-red-500">10%</td>
              <td className="px-6 py-3 text-center text-gray-400"><ArrowRight size={16} className="inline"/></td>
              <td className="px-6 py-3 font-medium text-emerald-700">Trên 10 đến 18</td>
              <td className="px-6 py-3 text-emerald-600">10%</td>
              <td className="px-6 py-3 text-gray-500">Rộng hơn</td>
            </tr>
             {/* Level 3 */}
             <tr className="bg-white hover:bg-gray-50">
              <td className="px-6 py-3 font-medium">Trên 10 đến 18</td>
              <td className="px-6 py-3 text-red-500">15%</td>
              <td className="px-6 py-3 text-center text-gray-400"><ArrowRight size={16} className="inline"/></td>
              <td className="px-6 py-3 font-medium text-emerald-700">Trên 18 đến 32</td>
              <td className="px-6 py-3 text-emerald-600">15%</td>
              <td className="px-6 py-3 text-gray-500">Rộng khoảng cách</td>
            </tr>
             {/* Level 4 */}
             <tr className="bg-white hover:bg-gray-50">
              <td className="px-6 py-3 font-medium">Trên 18 đến 32</td>
              <td className="px-6 py-3 text-red-500">20%</td>
              <td className="px-6 py-3 text-center text-gray-400"><ArrowRight size={16} className="inline"/></td>
              <td className="px-6 py-3 font-medium text-emerald-700">Trên 32 đến 52</td>
              <td className="px-6 py-3 text-emerald-600">20%</td>
              <td className="px-6 py-3 text-gray-500">Rộng hơn</td>
            </tr>
             {/* Level 5 */}
             <tr className="bg-white hover:bg-gray-50">
              <td className="px-6 py-3 font-medium">Trên 32 đến 52</td>
              <td className="px-6 py-3 text-red-500">25%</td>
              <td className="px-6 py-3 text-center text-gray-400"><ArrowRight size={16} className="inline"/></td>
              <td className="px-6 py-3 font-medium text-emerald-700">Trên 52 (đến 80+)</td>
              <td className="px-6 py-3 text-emerald-600">25%</td>
              <td className="px-6 py-3 text-gray-500">Giảm từ 30%/35%</td>
            </tr>
             {/* Old 6 & 7 */}
             <tr className="bg-gray-50 text-gray-400 italic">
              <td className="px-6 py-3">Trên 52 đến 80</td>
              <td className="px-6 py-3">30%</td>
              <td className="px-6 py-3 text-center">-</td>
              <td className="px-6 py-3" colSpan={3}>Bãi bỏ / Gộp vào mức 25%</td>
            </tr>
            <tr className="bg-gray-50 text-gray-400 italic">
              <td className="px-6 py-3">Trên 80</td>
              <td className="px-6 py-3">35%</td>
              <td className="px-6 py-3 text-center">-</td>
              <td className="px-6 py-3" colSpan={3}>Bãi bỏ / Gộp vào mức 25%</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="p-4 bg-blue-50 border-t border-blue-100 mt-0">
        <h4 className="font-semibold text-blue-800 mb-2">Điều chỉnh Giảm trừ gia cảnh</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex justify-between items-center p-3 bg-white rounded border border-blue-200">
            <span className="text-gray-600">Bản thân người nộp thuế</span>
            <div className="flex items-center gap-2">
               <span className="line-through text-gray-400">11 triệu</span>
               <ArrowRight size={14} className="text-blue-500"/>
               <span className="font-bold text-blue-700">15.5 triệu</span>
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded border border-blue-200">
            <span className="text-gray-600">Mỗi người phụ thuộc</span>
            <div className="flex items-center gap-2">
               <span className="line-through text-gray-400">4.4 triệu</span>
               <ArrowRight size={14} className="text-blue-500"/>
               <span className="font-bold text-blue-700">6.2 triệu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};