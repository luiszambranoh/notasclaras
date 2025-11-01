"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "@/lib/auth";
import { ProfessorsCollection } from "@/lib/collections/professors";
import { professorSchema, ProfessorFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface ProfessorFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editingProfessor?: any; // TODO: Define proper type
}

export default function ProfessorForm({ onSuccess, onCancel, editingProfessor }: ProfessorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfessorFormData>({
    resolver: zodResolver(professorSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      officeHours: "",
    },
  });

  const onSubmit = async (data: ProfessorFormData) => {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    try {
      const professorData = {
        name: data.name,
        email: data.email || undefined,
        subject: data.subject,
        officeHours: data.officeHours || undefined,
        userId: user.uid
      };

      if (editingProfessor) {
        await ProfessorsCollection.updateProfessor(user.uid, editingProfessor.id, professorData);
        console.log("✅ Profesor actualizado:", professorData);
      } else {
        const professorId = await ProfessorsCollection.createProfessor(user.uid, professorData);
        console.log("✅ Nuevo profesor creado con ID:", professorId, professorData);
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving professor:", error);
      alert("Error al guardar el profesor. Por favor, intenta de nuevo.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nombre del Profesor *
        </label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Nombre completo del profesor"
        />
        {errors.name && (
          <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Correo Electrónico
        </label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="profesor@email.com"
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          Materia *
        </label>
        <Input
          id="subject"
          {...register("subject")}
          placeholder="Ej: Matemáticas, Física, Literatura..."
        />
        {errors.subject && (
          <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="officeHours" className="block text-sm font-medium text-gray-700 mb-1">
          Horario de Oficina
        </label>
        <Textarea
          id="officeHours"
          {...register("officeHours")}
          placeholder="Ej: Lunes y Miércoles 2:00 PM - 4:00 PM, Oficina 101"
          rows={3}
        />
        {errors.officeHours && (
          <p className="text-sm text-red-600 mt-1">{errors.officeHours.message}</p>
        )}
      </div>

      <div className="flex space-x-3 pt-4">
        <Button type="submit" className="flex-1">
          {editingProfessor ? "Actualizar" : "Crear"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}