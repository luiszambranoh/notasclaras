"use client";

import { useState, useEffect } from "react";
import { AuthService } from "../../lib/auth";
import { ProfessorsCollection, Professor } from "../../lib/collections/professors";
import Layout from "../../components/layout/Layout";
import Modal from "../../components/ui/Modal";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Plus, Edit, Trash2, Mail, Phone } from "lucide-react";

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: ""
  });

  useEffect(() => {
    loadProfessors();
  }, []);

  const loadProfessors = async () => {
    try {
      const user = AuthService.getCurrentUser();
      if (user) {
        const professorsData = await ProfessorsCollection.getProfessors(user.uid);
        setProfessors(professorsData);
      }
    } catch (error) {
      console.error("Error loading professors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = AuthService.getCurrentUser();
    if (!user) return;

    try {
      if (editingProfessor) {
        await ProfessorsCollection.updateProfessor(user.uid, editingProfessor.id!, formData);
      } else {
        await ProfessorsCollection.createProfessor(user.uid, {
          ...formData,
          userId: user.uid
        });
      }
      await loadProfessors();
      setShowForm(false);
      setEditingProfessor(null);
      setFormData({ name: "", email: "", phone: "", subject: "" });
    } catch (error) {
      console.error("Error saving professor:", error);
      alert("Error al guardar el profesor. Por favor, intenta de nuevo.");
    }
  };

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    setFormData({
      name: professor.name,
      email: professor.email || "",
      phone: professor.phone || "",
      subject: professor.subject
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este profesor?")) {
      try {
        const user = AuthService.getCurrentUser();
        if (user) {
          await ProfessorsCollection.deleteProfessor(user.uid, id);
          await loadProfessors();
        }
      } catch (error) {
        console.error("Error deleting professor:", error);
        alert("Error al eliminar el profesor. Por favor, intenta de nuevo.");
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingProfessor(null);
    setFormData({ name: "", email: "", phone: "", subject: "" });
  };

  if (loading) {
    return (
      <Layout title="Profesores">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profesores">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profesores</h1>
            <p className="text-gray-600">Gestiona la información de tus profesores</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Agregar Profesor</span>
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">
                  {editingProfessor ? "Editar Profesor" : "Agregar Profesor"}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del profesor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="profesor@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Materia *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Matemáticas, Física..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: +58 412 123 4567"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
                  >
                    {editingProfessor ? "Actualizar" : "Agregar"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Professors List */}
        {professors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="text-6xl">👨‍🏫</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay profesores registrados
            </h3>
            <p className="text-gray-600 mb-4">
              Agrega tus profesores para organizar mejor tus tareas y exámenes
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Agregar Primer Profesor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professors.map((professor) => (
              <div key={professor.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{professor.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">{professor.subject}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(professor)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(professor.id!)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {professor.email && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Mail className="h-4 w-4 mr-2" />
                    {professor.email}
                  </div>
                )}

                {professor.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {professor.phone}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}