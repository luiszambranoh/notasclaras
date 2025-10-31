"use client";

import { useState, useEffect } from "react";
import { AuthService } from "../../lib/auth";
import { HomeworkCollection } from "../../lib/collections/homework";
import { SubjectsCollection, Subject } from "../../lib/collections/subjects";

interface HomeworkFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingHomework?: any; // TODO: Define proper type
}

export default function HomeworkForm({ onSuccess, onCancel, editingHomework }: HomeworkFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    dueDate: "",
    completed: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubjects();
    if (editingHomework) {
      setFormData({
        title: editingHomework.title || "",
        description: editingHomework.description || "",
        subject: editingHomework.subject || "",
        dueDate: editingHomework.dueDate ? editingHomework.dueDate.toISOString().split('T')[0] : "",
        completed: editingHomework.completed || false
      });
    }
  }, [editingHomework]);

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
      const homeworkData = {
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        dueDate: new Date(formData.dueDate),
        completed: formData.completed,
        userId: user.uid
      };

      if (editingHomework) {
        await HomeworkCollection.updateHomework(user.uid, editingHomework.id, homeworkData);
        console.log("✅ Tarea actualizada:", homeworkData);
      } else {
        const homeworkId = await HomeworkCollection.createHomework(user.uid, homeworkData);
        console.log("✅ Nueva tarea creada con ID:", homeworkId, homeworkData);
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving homework:", error);
      alert("Error al guardar la tarea. Por favor, intenta de nuevo.");
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Título de la tarea"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Descripción de la tarea"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            Fecha de Entrega *
          </label>
          <input
            type="date"
            name="dueDate"
            required
            value={formData.dueDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="completed"
          checked={formData.completed}
          onChange={handleInputChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="ml-2 block text-sm text-gray-700">
          Marcar como completada
        </label>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50"
        >
          {loading ? "Guardando..." : (editingHomework ? "Actualizar" : "Crear")}
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