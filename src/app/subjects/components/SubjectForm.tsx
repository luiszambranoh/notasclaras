"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "@/lib/auth";
import { SubjectsCollection } from "@/lib/collections/subjects";
import { ProfessorsCollection, Professor } from "@/lib/collections/professors";
import { subjectSchema, SubjectFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Trash2 } from "lucide-react";

interface SubjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingSubject?: any; // TODO: Define proper type
}

export default function SubjectForm({ onSuccess, onCancel, editingSubject }: SubjectFormProps) {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [schedule, setSchedule] = useState<{ day: string; startTime: string; endTime: string }[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      professorId: "",
      schedule: [],
      color: "",
    },
  });

  const watchedSchedule = watch("schedule");

  useEffect(() => {
    loadProfessors();
    if (editingSubject) {
      reset({
        name: editingSubject.name || "",
        professorId: editingSubject.professorId || "",
        schedule: editingSubject.schedule || [],
        color: editingSubject.color || "",
      });
      setSchedule(editingSubject.schedule || []);
    }
  }, [editingSubject, reset]);

  const loadProfessors = async () => {
    try {
      const user = AuthService.getCurrentUser();
      if (user) {
        const professorsData = await ProfessorsCollection.getProfessors(user.uid);
        setProfessors(professorsData);
      }
    } catch (error) {
      console.error("Error loading professors:", error);
    }
  };

  const daysOfWeek = [
    { value: "monday", label: "Lunes" },
    { value: "tuesday", label: "Martes" },
    { value: "wednesday", label: "Miércoles" },
    { value: "thursday", label: "Jueves" },
    { value: "friday", label: "Viernes" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" }
  ];

  const addScheduleSlot = () => {
    const newSchedule = [...schedule, { day: "monday", startTime: "08:00", endTime: "10:00" }];
    setSchedule(newSchedule);
    setValue("schedule", newSchedule);
  };

  const removeScheduleSlot = (index: number) => {
    const newSchedule = schedule.filter((_, i) => i !== index);
    setSchedule(newSchedule);
    setValue("schedule", newSchedule);
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
    setValue("schedule", newSchedule);
  };

  const onSubmit = async (data: SubjectFormData) => {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    try {
      const subjectData = {
        name: data.name,
        professorId: data.professorId || null,
        schedule: data.schedule,
        color: data.color || SubjectsCollection.getRandomColor(),
        userId: user.uid
      };

      if (editingSubject) {
        await SubjectsCollection.updateSubject(user.uid, editingSubject.id, subjectData);
        console.log("✅ Materia actualizada:", subjectData);
      } else {
        const subjectId = await SubjectsCollection.createSubject(user.uid, subjectData);
        console.log("✅ Nueva materia creada con ID:", subjectId, subjectData);
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving subject:", error);
      alert("Error al guardar la materia. Por favor, intenta de nuevo.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nombre de la Materia *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Ej: Matemáticas I"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="professorId">Profesor</Label>
          <Select id="professorId" {...register("professorId")}>
            <option value="">Sin asignar</option>
            {professors.map((professor) => (
              <option key={professor.id} value={professor.id}>
                {professor.name} - {professor.subject}
              </option>
            ))}
          </Select>
          {errors.professorId && (
            <p className="text-sm text-red-600 mt-1">{errors.professorId.message}</p>
          )}
        </div>
      </div>

      {/* Schedule */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Label>Horario de Clases *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addScheduleSlot}>
            + Agregar horario
          </Button>
        </div>
        <div className="space-y-3">
          {schedule.map((slot, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
              <Select
                value={slot.day}
                onChange={(e) => handleScheduleChange(index, "day", e.target.value)}
              >
                {daysOfWeek.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </Select>
              <Input
                type="time"
                value={slot.startTime}
                onChange={(e) => handleScheduleChange(index, "startTime", e.target.value)}
              />
              <span className="text-gray-500">a</span>
              <Input
                type="time"
                value={slot.endTime}
                onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeScheduleSlot(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        {errors.schedule && (
          <p className="text-sm text-red-600 mt-1">{errors.schedule.message}</p>
        )}
      </div>

      <div className="flex space-x-3 pt-4">
        <Button type="submit" className="flex-1">
          {editingSubject ? "Actualizar" : "Crear"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}