"use client";

import { useState, useEffect } from "react";
import { AuthService } from "../../lib/auth";
import { ExamsCollection } from "../../lib/collections/exams";
import { SubjectsCollection, Subject } from "../../lib/collections/subjects";

interface ExamFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingExam?: any; // TODO: Define proper type
}

export default function ExamForm({ onSuccess, onCancel, editingExam }: ExamFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    examDate: "",
    location: "",
    completed: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubjects();
    if (editingExam) {
      setFormData({
        title: editingExam.title || "",
        description: editingExam.description || "",
        subject: editingExam.subject || "",
        examDate: editingExam.examDate ? editingExam.examDate.toISOString().split('T')[0] : "",
        location: editingExam.location || "",
        completed: editingExam.completed || false
      });
    }
  }, [editingExam]);

  const loadSubjects = async () => {
    try {
      const user = AuthService.getCurrentUser();
      if (user) {
        const subjectsData = await SubjectsCollection.getSubjects(user.uid);
        setSubjects(subjectsData);
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = AuthService.getCurrentUser();
    if (!user) return;

    setLoading(true);
    try {
      const examData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        examDate: new Date(formData.examDate),
        location: formData.location,
        completed: formData.completed,
        userId: user.uid
      };

      if (editingExam) {
        await ExamsCollection.updateExam(user.uid, editingExam.id, examData);
        console.log("✅ Examen actualizado:", examData);
      } else {
        const examId = await ExamsCollection.createExam(user.uid, examData);
        console.log("✅ Nuevo examen creado con ID:", examId, examData);
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving exam:", error);
      alert("Error al guardar el examen. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título *
        </label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Título del examen"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Descripción del examen"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Materia
          </label>
          <select
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Seleccionar materia</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha del Examen *
          </label>
          <input
            type="date"
            name="examDate"
            required
            value={formData.examDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ubicación
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ej: Aula 101, Edificio B"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="completed"
          checked={formData.completed}
          onChange={handleInputChange}
          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Marcar como completado
        </label>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50"
        >
          {loading ? "Guardando..." : (editingExam ? "Actualizar" : "Crear")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}