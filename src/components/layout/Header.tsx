"use client";

import { Menu, LogOut } from "lucide-react";
import { AuthService } from "../../lib/auth";

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export default function Header({ onMenuClick, title = "Notas Claras" }: HeaderProps) {
  const handleSignOut = async () => {
    try {
      await AuthService.signOutUser();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-2 lg:ml-0 text-xl font-semibold text-gray-900">
              {title}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleSignOut}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              title="Cerrar Sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}