"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { AuthService } from "../lib/auth";
import { UsersCollection } from "../lib/collections/users";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (authUser) => {
      if (authUser) {
        // Check if user has completed registration
        const userData = await UsersCollection.getUser(authUser.uid);
        if (!userData || !userData.birthDate) {
          router.push("/register");
          return;
        }
        setUser(authUser);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await AuthService.signOutUser();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to /login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Notas Claras</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Bienvenido, {user.displayName || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Información del Usuario (Prueba)
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700">UID:</span>{" "}
                  <span className="text-gray-900 font-mono text-sm">{user.uid}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>{" "}
                  <span className="text-gray-900">{user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Nombre:</span>{" "}
                  <span className="text-gray-900">{user.displayName || "No especificado"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
