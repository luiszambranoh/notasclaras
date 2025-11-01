"use client";

import { useState, useEffect } from "react";
import { AuthService } from "@/lib/auth";
import { ProfessorsCollection, Professor } from "@/lib/collections/professors";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";
import { Plus, Edit, Trash2, Mail, Phone } from "lucide-react";
import { useModal } from "../../contexts/ModalContext";
import ProfessorForm from "./components/ProfessorForm";

export default function ProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const { openModal, closeModal } = useModal();

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

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    openModal(<ProfessorForm onSuccess={() => { closeModal(); loadProfessors(); }} onCancel={closeModal} editingProfessor={professor} />, "Editar Profesor", "md");
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
            onClick={() => openModal(<ProfessorForm onSuccess={() => { closeModal(); loadProfessors(); }} onCancel={closeModal} />, "Agregar Profesor", "md")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Agregar Profesor</span>
          </button>
        </div>


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
              onClick={() => openModal(<ProfessorForm onSuccess={() => { closeModal(); loadProfessors(); }} onCancel={closeModal} />, "Agregar Primer Profesor", "md")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Agregar Primer Profesor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professors.map((professor) => (
              <Card key={professor.id}>
                <CardContent className="p-6">
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}