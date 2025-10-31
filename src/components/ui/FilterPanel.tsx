"use client";

import { useState } from "react";
import { X, Calendar, CheckCircle, Circle, BookOpen, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    subject?: string;
    status?: 'pending' | 'completed' | 'all';
    type?: 'homework' | 'exam' | 'all';
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  onFiltersChange: (filters: any) => void;
  filterOptions: {
    subjects: FilterOption[];
    status: FilterOption[];
    types: FilterOption[];
  };
}

export default function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  filterOptions
}: FilterPanelProps) {
  const [tempFilters, setTempFilters] = useState(filters);

  const handleFilterChange = (key: string, value: any) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      subject: undefined,
      status: 'all' as const,
      type: 'all' as const,
      dateRange: undefined
    };
    setTempFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Materia
            </label>
            <select
              value={tempFilters.subject || ""}
              onChange={(e) => handleFilterChange("subject", e.target.value || undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las materias</option>
              {filterOptions.subjects.map((subject) => (
                <option key={subject.value} value={subject.value}>
                  {subject.label} ({subject.count})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <div className="space-y-2">
              {filterOptions.status.map((status) => (
                <label key={status.value} className="flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={tempFilters.status === status.value}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {status.label} ({status.count})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo
            </label>
            <div className="space-y-2">
              {filterOptions.types.map((type) => (
                <label key={type.value} className="flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={tempFilters.type === type.value}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {type.label} ({type.count})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rango de Fechas
            </label>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Desde</label>
                <input
                  type="date"
                  value={tempFilters.dateRange?.start ? format(tempFilters.dateRange.start, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const start = e.target.value ? new Date(e.target.value) : undefined;
                    handleFilterChange("dateRange", {
                      ...tempFilters.dateRange,
                      start
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Hasta</label>
                <input
                  type="date"
                  value={tempFilters.dateRange?.end ? format(tempFilters.dateRange.end, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const end = e.target.value ? new Date(e.target.value) : undefined;
                    handleFilterChange("dateRange", {
                      ...tempFilters.dateRange,
                      end
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3 p-4 border-t bg-gray-50">
          <button
            onClick={handleClearFilters}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium"
          >
            Limpiar
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}