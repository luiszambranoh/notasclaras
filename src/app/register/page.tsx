"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { AuthService } from "../../lib/auth";
import { UsersCollection } from "../../lib/collections/users";

const universities = [
  "Universidad Central de Venezuela",
  "Universidad Simón Bolívar",
  "Universidad Católica Andrés Bello",
  "Universidad Metropolitana",
  "Universidad de Carabobo",
  "Universidad de Los Andes",
  "Universidad del Zulia",
  "Universidad Nacional Experimental Francisco de Miranda",
  "Otra"
];

export default function RegisterPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    birthDate: "",
    university: "",
    section: "",
    carrera: ""
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange((authUser) => {
      if (authUser) {
        setUser(authUser);
        // Check if user already has profile data
        UsersCollection.getUser(authUser.uid).then((userData) => {
          if (userData && userData.birthDate) {
            // User already completed registration, redirect to dashboard
            router.push("/");
          }
        });
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      await UsersCollection.updateUser(user.uid, {
        birthDate: formData.birthDate,
        university: formData.university,
        section: formData.section,
        carrera: formData.carrera
      });
      router.push("/");
    } catch (error) {
      console.error("Error updating user profile:", error);
      alert("Error al guardar la información. Por favor, intenta de nuevo.");
    } finally {
      setSubmitting(false);
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Completa tu Perfil
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Necesitamos un poco más de información para personalizar tu experiencia
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  id="birthDate"
                  name="birthDate"
                  required
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                  Universidad
                </label>
                <select
                  id="university"
                  name="university"
                  required
                  value={formData.university}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona tu universidad</option>
                  {universities.map((uni) => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700">
                  Sección
                </label>
                <input
                  type="text"
                  id="section"
                  name="section"
                  required
                  value={formData.section}
                  onChange={handleInputChange}
                  placeholder="Ej: A, B, C..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="carrera" className="block text-sm font-medium text-gray-700">
                  Carrera
                </label>
                <input
                  type="text"
                  id="carrera"
                  name="carrera"
                  required
                  value={formData.carrera}
                  onChange={handleInputChange}
                  placeholder="Ej: Ingeniería Informática, Medicina..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {submitting ? "Guardando..." : "Completar Registro"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}