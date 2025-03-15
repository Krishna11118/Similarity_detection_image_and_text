import React from 'react';
import { Trash2, Edit } from 'lucide-react';
import { KPI } from '../types';

interface KPITableProps {
  kpis: KPI[];
  onDelete: (id: string) => void;
  onEdit: (kpi: KPI) => void;
}

export const KPITable: React.FC<KPITableProps> = ({ kpis, onDelete, onEdit }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-2">S. No.</th>
            <th className="px-4 py-2">KPI Code</th>
            <th className="px-4 py-2">KPI Name</th>
            <th className="px-4 py-2">Before Improvement</th>
            <th className="px-4 py-2">After Improvement</th>
            <th className="px-4 py-2">Impact</th>
            <th className="px-4 py-2">Recurring / Annum (Rs.)</th>
            <th className="px-4 py-2">One Time Saving (Rs.)</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {kpis.map((kpi, index) => (
            <tr key={kpi.id} className="border-t">
              <td className="px-4 py-2">{index + 1}</td>
              <td className="px-4 py-2">{kpi.kpiCode}</td>
              <td className="px-4 py-2">{kpi.kpiName}</td>
              <td className="px-4 py-2">{kpi.beforeImprovement}</td>
              <td className="px-4 py-2">{kpi.afterImprovement}</td>
              <td className="px-4 py-2">{kpi.impact}</td>
              <td className="px-4 py-2">{kpi.recurringAnnual}</td>
              <td className="px-4 py-2">{kpi.oneTime}</td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  onClick={() => onEdit(kpi)}
                  className="p-1 text-blue-600 hover:text-blue-800"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => onDelete(kpi.id)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};