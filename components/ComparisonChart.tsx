import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { CalculationResult } from '../types';

interface ComparisonChartProps {
  oldResult: CalculationResult;
  newResult: CalculationResult;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ oldResult, newResult }) => {
  const data = [
    {
      name: 'Thuế TNCN (Tax)',
      Old: oldResult.tax,
      New: newResult.tax,
    },
    {
      name: 'Thu nhập Net',
      Old: oldResult.net,
      New: newResult.net,
    },
  ];

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-semibold text-gray-700 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-gray-600">{entry.name === 'Old' ? 'Quy định cũ' : 'Quy định mới'}:</span>
              <span className="font-medium font-mono">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
          <YAxis tickFormatter={formatYAxis} axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
          <Legend iconType="circle" />
          <Bar dataKey="Old" name="Quy định cũ" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="New" name="Đề xuất mới (1/7/2025)" fill="#14b8a6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};