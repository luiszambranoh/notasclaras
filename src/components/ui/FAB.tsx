"use client";

import { Plus } from "lucide-react";

interface FABProps {
  onCreateHomework: () => void;
  onCreateExam: () => void;
}

export default function FAB({ onCreateHomework, onCreateExam }: FABProps) {
  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="relative">
        {/* Main FAB Button */}
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-colors duration-200">
          <Plus className="h-6 w-6" />
        </button>

        {/* Action Buttons */}
        <div className="absolute bottom-full right-0 mb-2 space-y-2">
          <button
            onClick={onCreateExam}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 flex items-center justify-center min-w-[48px] min-h-[48px] opacity-90 hover:opacity-100"
            title="Crear Examen"
          >
            <span className="text-xs font-medium">📝</span>
          </button>

          <button
            onClick={onCreateHomework}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 flex items-center justify-center min-w-[48px] min-h-[48px] opacity-90 hover:opacity-100"
            title="Crear Tarea"
          >
            <span className="text-xs font-medium">📚</span>
          </button>
        </div>
      </div>
    </div>
  );
}