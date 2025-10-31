"use client";

import { useState } from "react";
import { Plus, BookOpen, FileText } from "lucide-react";

interface FABProps {
  onCreateHomework: () => void;
  onCreateExam: () => void;
}

export default function FAB({ onCreateHomework, onCreateExam }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative">
        {/* Action Buttons */}
        <div
          className={`absolute bottom-full right-1/2 transform translate-x-1/2 mb-4 space-y-3 transition-all duration-300 ${
            isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <button
            onClick={() => {
              onCreateExam();
              setIsOpen(false);
            }}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 flex items-center space-x-2 min-h-[48px] pl-4 pr-4"
            title="Nuevo Examen"
          >
            <span className="text-sm font-medium">Nuevo Examen</span>
            <FileText className="h-5 w-5" />
          </button>

          <button
            onClick={() => {
              onCreateHomework();
              setIsOpen(false);
            }}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 flex items-center space-x-2 min-h-[48px] pl-4 pr-4"
            title="Nueva Tarea"
          >
            <span className="text-sm font-medium">Nueva Tarea</span>
            <BookOpen className="h-5 w-5" />
          </button>
        </div>

        {/* Main FAB Button */}
        <button
          onClick={toggleMenu}
          className={`bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 transform ${
            isOpen ? "rotate-45" : "rotate-0"
          }`}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}