"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "../../lib/auth";
import { HomeworkCollection } from "../../lib/collections/homework";
import { SubjectsCollection, Subject } from "../../lib/collections/subjects";
import { homeworkSchema, HomeworkFormData } from "../../lib/schemas";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";
import { Label } from "../ui/Label";

interface HomeworkFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingHomework?: any; // TODO: Define proper type
}

export default function HomeworkForm({ onSuccess, onCancel, editingHomework }: HomeworkFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<HomeworkFormData>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "",
      dueDate: "",
      completed: false,
      link: "",
    },
  });

  useEffect(() => {
    loadSubjects();
    if (editingHomework) {
      reset({
        title: editingHomework.title || "",
        description: editingHomework.description || "",
        subject: editingHomework.subject || "",
        dueDate: editingHomework.dueDate ? editingHomework.dueDate.toISOString().split('T')[0] : "",
        completed: editingHomework.completed || false,
        link: editingHomework.link || "",
      });
    }
  }, [editingHomework, reset]);

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

  const onSubmit = async (data: HomeworkFormData) => {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    setLoading(true);
    try {
      const homeworkData = {
        title: data.title,
        description: data.description || "",
        subject: data.subject,
        dueDate: new Date(data.dueDate),
        completed: data.completed,
        link: data.link || undefined,
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Título de la tarea"
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
          placeholder="Descripción de la tarea"
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
          <Label htmlFor="dueDate">Fecha de Entrega *</Label>
          <Input
            id="dueDate"
            type="date"
            {...register("dueDate")}
          />
          {errors.dueDate && (
            <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="link">Enlace (opcional)</Label>
        <Input
          id="link"
          type="url"
          {...register("link")}
          placeholder="https://ejemplo.com/tarea.pdf"
        />
        {errors.link && (
          <p className="text-sm text-red-600 mt-1">{errors.link.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Enlace al PDF o documento de la tarea
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="completed"
          {...register("completed")}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <Label htmlFor="completed" className="ml-2 block text-sm">
          Marcar como completada
        </Label>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Guardando..." : (editingHomework ? "Actualizar" : "Crear")}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}