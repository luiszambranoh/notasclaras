"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Drawer from "./Drawer";
import Header from "./Header";
import FAB from "../ui/FAB";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();

  const handleCreateHomework = () => {
    // TODO: Open homework creation modal/form
    console.log("Create homework");
  };

  const handleCreateExam = () => {
    // TODO: Open exam creation modal/form
    console.log("Create exam");
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
        onCreateHomework={handleCreateHomework}
        onCreateExam={handleCreateExam}
      />
    </div>
  );
}