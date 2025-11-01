"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Drawer from "./Drawer";
import Header from "./Header";
import FAB from "../ui/FAB";
import { useModal } from "../../contexts/ModalContext";
import HomeworkForm from "../forms/HomeworkForm";
import ExamForm from "../forms/ExamForm";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  onCreateHomework?: () => void;
  onCreateExam?: () => void;
}

export default function Layout({ children, title, onCreateHomework, onCreateExam }: LayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const { openModal, closeModal } = useModal();

  const defaultHandleCreateHomework = () => {
    console.log("🎯 Abriendo modal para crear nueva tarea");
    openModal(
      <HomeworkForm
        onSuccess={() => {
          console.log("✅ Tarea creada exitosamente");
          closeModal();
          // TODO: Refresh data if needed
        }}
        onCancel={closeModal}
      />,
      "Nueva Tarea",
      "md"
    );
  };

  const defaultHandleCreateExam = () => {
    console.log("🎯 Abriendo modal para crear nuevo examen");
    openModal(
      <ExamForm
        onSuccess={() => {
          console.log("✅ Examen creado exitosamente");
          closeModal();
          // TODO: Refresh data if needed
        }}
        onCancel={closeModal}
      />,
      "Nuevo Examen",
      "md"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Header */}
      <Header onMenuClick={() => setIsDrawerOpen(true)} title={title} />

      {/* Main Content */}
      <main className="lg:ml-0">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Floating Action Button */}
      <FAB
        onCreateHomework={onCreateHomework || defaultHandleCreateHomework}
        onCreateExam={onCreateExam || defaultHandleCreateExam}
      />
    </div>
  );
}