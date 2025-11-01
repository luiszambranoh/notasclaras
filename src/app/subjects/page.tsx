"use client";

import { useState, useEffect } from "react";
import { AuthService } from "@/lib/auth";
import { SubjectsCollection, Subject } from "@/lib/collections/subjects";
import { ProfessorsCollection, Professor } from "@/lib/collections/professors";
import Layout from "@/components/layout/Layout";
import { Plus, Edit, Trash2, Clock, User } from "lucide-react";
import { useModal } from "../../contexts/ModalContext";
import SubjectForm from "./components/SubjectForm";
import HomeworkForm from "./components/HomeworkForm";
import ExamForm from "./components/ExamForm";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const { openModal, closeModal } = useModal();

  const handleCreateSubject = () => {
    setEditingSubject(null);
    openModal(<SubjectForm onSuccess={() => { closeModal(); loadData(); }} onCancel={closeModal} />, "Agregar Materia", "xl");
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    openModal(<SubjectForm onSuccess={() => { closeModal(); loadData(); }} onCancel={closeModal} editingSubject={subject} />, "Editar Materia", "xl");
  };

  const handleCreateHomework = () => {
    openModal(<HomeworkForm onSuccess={() => { closeModal(); }} onCancel={closeModal} />, "Nueva Tarea", "lg");
  };

  const handleCreateExam = () => {
    openModal(<ExamForm onSuccess={() => { closeModal(); }} onCancel={closeModal} />, "Nuevo Examen", "lg");
  };
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = AuthService.getCurrentUser();
      if (user) {
        const [subjectsData, professorsData] = await Promise.all([
          SubjectsCollection.getSubjects(user.uid),
          ProfessorsCollection.getProfessors(user.uid)
        ]);
        setSubjects(subjectsData);
        setProfessors(professorsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta materia?")) {
      try {
        const user = AuthService.getCurrentUser();
        if (user) {
          await SubjectsCollection.deleteSubject(user.uid, id);
          await loadData();
        }
      } catch (error) {
        console.error("Error deleting subject:", error);
        alert("Error al eliminar la materia. Por favor, intenta de nuevo.");
      }
    }
  };

  const getProfessorName = (professorId?: string | null) => {
    if (!professorId) return "Sin asignar";
    const professor = professors.find(p => p.id === professorId);
    return professor ? professor.name : "Profesor no encontrado";
  };

  if (loading) {
    return (
      <Layout title="Materias" onCreateHomework={handleCreateHomework} onCreateExam={handleCreateExam}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Materias" onCreateHomework={handleCreateHomework} onCreateExam={handleCreateExam}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Materias</h1>
            <p className="text-gray-600">Gestiona tus asignaturas y horarios</p>
          </div>
          <button
            onClick={handleCreateSubject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Agregar Materia</span>
          </button>
        </div>


        {/* Subjects List */}
        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="text-6xl">📚</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay materias registradas
            </h3>
            <p className="text-gray-600 mb-4">
              Agrega tus materias para organizar mejor tus tareas y exámenes
            </p>
            <button
              onClick={handleCreateSubject}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Agregar Primera Materia
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <div key={subject.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    ></div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <User className="h-4 w-4 mr-1" />
                        {getProfessorName(subject.professorId)}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditSubject(subject)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id!)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="font-medium">Horario:</span>
                  </div>
                  {subject.schedule.length > 0 ? (
                    <div className="space-y-1 ml-6">
                      {subject.schedule.map((slot, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {SubjectsCollection.getDayName(slot.day)}: {slot.startTime} - {slot.endTime}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 ml-6">Sin horario definido</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}