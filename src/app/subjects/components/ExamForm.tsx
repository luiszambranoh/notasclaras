"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "../../../lib/auth";
import { ExamsCollection } from "../../../lib/collections/exams";
import { SubjectsCollection, Subject } from "../../../lib/collections/subjects";
import { examSchema, ExamFormData } from "../../../lib/schemas";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Textarea } from "../../../components/ui/Textarea";
import { Select } from "../../../components/ui/Select";
import { Label } from "../../../components/ui/Label";

interface ExamFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingExam?: any; // TODO: Define proper type
}

export default function ExamForm({ onSuccess, onCancel, editingExam }: ExamFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      examDate: "",
      location: "",
      completed: false,
    },
  });

  useEffect(() => {
    loadSubjects();
    if (editingExam) {
      reset({
        title: editingExam.title || "",
        description: editingExam.description || "",
        subject: editingExam.subject || "",
        examDate: editingExam.examDate ? editingExam.examDate.toISOString().split('T')[0] : "",
        location: editingExam.location || "",
        completed: editingExam.completed || false,
      });
    }
  }, [editingExam, reset]);

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

  const onSubmit = async (data: ExamFormData) => {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    setLoading(true);
    try {
      const examData = {
        title: data.title,
        description: data.description || "",
        subject: data.subject,
        examDate: new Date(data.examDate),
        location: data.location || "",
        completed: data.completed,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Título del examen"
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Descripción del examen"
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subject">Materia</Label>
          <Select id="subject" {...register("subject")}>
            <option value="">Seleccionar materia</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.name}>
                {subject.name}
              </option>
            ))}
          </Select>
          {errors.subject && (
            <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="examDate">Fecha del Examen *</Label>
          <Input
            id="examDate"
            type="date"
            {...register("examDate")}
          />
          {errors.examDate && (
            <p className="text-sm text-red-600 mt-1">{errors.examDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="location">Lugar (opcional)</Label>
        <Input
          id="location"
          {...register("location")}
          placeholder="Ej: Aula 101, Biblioteca..."
        />
        {errors.location && (
          <p className="text-sm text-red-600 mt-1">{errors.location.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="completed"
          {...register("completed")}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <Label htmlFor="completed" className="ml-2 block text-sm">
          Marcar como completado
        </Label>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Guardando..." : (editingExam ? "Actualizar" : "Crear")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}