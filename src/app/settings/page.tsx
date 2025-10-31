"use client";

import { useState, useEffect } from "react";
import { AuthService } from "../../lib/auth";
import { UsersCollection } from "../../lib/collections/users";
import Layout from "../../components/layout/Layout";
import { User, Mail, Calendar, GraduationCap, MapPin, Save } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    birthDate: "",
    university: "",
    section: "",
    carrera: ""
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        const userData = await UsersCollection.getUser(currentUser.uid);
        if (userData) {
          setUser(userData);
          setFormData({
            displayName: userData.displayName || "",
            email: userData.email || "",
            birthDate: userData.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : "",
            university: userData.university || "",
            section: userData.section || "",
            carrera: userData.carrera || ""
          });
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return;

    setSaving(true);
    try {
      await UsersCollection.updateUser(currentUser.uid, {
        displayName: formData.displayName,
        birthDate: formData.birthDate || undefined,
        university: formData.university,
        section: formData.section,
        carrera: formData.carrera
      });
      await loadUserData(); // Reload data to reflect changes
      alert("Configuración guardada exitosamente");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error al guardar la configuración. Por favor, intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <Layout title="Configuración">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Configuración">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600">Gestiona tu información personal y preferencias</p>
        </div>

        {/* Profile Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  El correo no se puede cambiar desde aquí
                </p>
              </div>

              {/* Birth Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Nacimiento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* University */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Universidad
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona tu universidad</option>
                    {universities.map((uni) => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sección
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: A, B, C..."
                  />
                </div>
              </div>

              {/* Carrera */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carrera
                </label>
                <input
                  type="text"
                  name="carrera"
                  value={formData.carrera}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Ingeniería Informática, Medicina..."
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Account Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Información de Cuenta</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700">ID de Usuario</span>
              <span className="text-sm text-gray-900 font-mono">{user?.uid}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700">Última actualización</span>
              <span className="text-sm text-gray-900">
                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('es-ES') : 'Nunca'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-700">Cuenta creada</span>
              <span className="text-sm text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : 'Desconocido'}
              </span>
            </div>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Acerca de la App</h2>
          </div>
          <div className="p-6">
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Notas Claras</strong> - Versión 0.1.0</p>
              <p>Aplicación para estudiantes venezolanos</p>
              <p>Desarrollada con Next.js, Firebase y Tailwind CSS</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}