"use client";

import { useState, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  showFilterButton?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar tareas, exámenes...",
  onFilterClick,
  showFilterButton = true
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {localValue && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
              title="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {showFilterButton && (
            <button
              onClick={onFilterClick}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
              title="Filtros avanzados"
            >
              <Filter className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}