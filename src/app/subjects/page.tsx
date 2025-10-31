"use client";

import { useState, useEffect } from "react";
import { AuthService } from "../../lib/auth";
import { SubjectsCollection, Subject } from "../../lib/collections/subjects";
import { ProfessorsCollection, Professor } from "../../lib/collections/professors";
import Layout from "../../components/layout/Layout";
import { Plus, Edit, Trash2, Clock, User } from "lucide-react";
import { useModal } from "../../contexts/ModalContext";
import { Card, CardContent, CardHeader } from "../../components/ui/Card";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const { openModal, closeModal } = useModal();

  const SubjectForm = () => (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Materia *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Matemáticas I"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profesor
          </label>
          <select
            name="professorId"
            value={formData.professorId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sin asignar</option>
            {professors.map((professor) => (
              <option key={professor.id} value={professor.id}>
                {professor.name} - {professor.subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Schedule */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Horario de Clases
          </label>
          <button
            type="button"
            onClick={addScheduleSlot}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            + Agregar horario
          </button>
        </div>
        <div className="space-y-3">
          {formData.schedule.map((slot, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
              <select
                value={slot.day}
                onChange={(e) => handleScheduleChange(index, "day", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {daysOfWeek.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={slot.startTime}
                onChange={(e) => handleScheduleChange(index, "startTime", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">a</span>
              <input
                type="time"
                value={slot.endTime}
                onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeScheduleSlot(index)}
                className="text-red-600 hover:text-red-800 p-2"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium"
        >
          {editingSubject ? "Actualizar" : "Agregar"}
        </button>
        <button
          type="button"
          onClick={closeModal}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
  const [formData, setFormData] = useState({
    name: "",
    professorId: "",
    schedule: [] as { day: string; startTime: string; endTime: string }[],
    color: ""
  });

  const daysOfWeek = [
    { value: "monday", label: "Lunes" },
    { value: "tuesday", label: "Martes" },
    { value: "wednesday", label: "Miércoles" },
    { value: "thursday", label: "Jueves" },
    { value: "friday", label: "Viernes" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" }
  ];

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      schedule: newSchedule
    }));
  };

  const addScheduleSlot = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { day: "monday", startTime: "08:00", endTime: "10:00" }]
    }));
  };

  const removeScheduleSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = AuthService.getCurrentUser();
    if (!user) return;

    try {
      const subjectData = {
        ...formData,
        userId: user.uid,
        color: formData.color || SubjectsCollection.getRandomColor()
      };

      if (editingSubject) {
        await SubjectsCollection.updateSubject(user.uid, editingSubject.id!, subjectData);
      } else {
        await SubjectsCollection.createSubject(user.uid, subjectData);
      }
      await loadData();
      resetForm();
    } catch (error) {
      console.error("Error saving subject:", error);
      alert("Error al guardar la materia. Por favor, intenta de nuevo.");
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      professorId: subject.professorId || "",
      schedule: subject.schedule,
      color: subject.color
    });
    openModal(<SubjectForm />, editingSubject ? "Editar Materia" : "Agregar Materia", "xl");
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

  const resetForm = () => {
    closeModal();
    setEditingSubject(null);
    setFormData({ name: "", professorId: "", schedule: [], color: "" });
  };

  const getProfessorName = (professorId?: string) => {
    if (!professorId) return "Sin asignar";
    const professor = professors.find(p => p.id === professorId);
    return professor ? professor.name : "Profesor no encontrado";
  };

  if (loading) {
    return (
      <Layout title="Materias">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Materias">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Materias</h1>
            <p className="text-gray-600">Gestiona tus asignaturas y horarios</p>
          </div>
          <button
            onClick={() => openModal(<SubjectForm />, "Agregar Materia", "xl")}
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
              onClick={() => openModal(<SubjectForm />, "Agregar Materia", "xl")}
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
                      onClick={() => handleEdit(subject)}
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