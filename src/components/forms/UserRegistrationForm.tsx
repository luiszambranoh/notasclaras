"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthService } from "../../lib/auth";
import { UsersCollection } from "../../lib/collections/users";
import { userRegistrationSchema, UserRegistrationFormData } from "../../lib/schemas";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Label } from "../ui/Label";

interface UserRegistrationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UserRegistrationForm({ onSuccess, onCancel }: UserRegistrationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserRegistrationFormData>({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      birthDate: "",
      university: "",
      section: "",
      carrera: "",
    },
  });

  const universities = [
    "Universidad Central de Venezuela",
    "Universidad Simón Bolívar",
    "Universidad Católica Andrés Bello",
    "Universidad Metropolitana",
    "Universidad de Carabobo",
    "Universidad de Los Andes",
    "Universidad del Zulia",
    "Universidad Nacional Experimental Francisco de Miranda",
    "Otra"
  ];

  const onSubmit = async (data: UserRegistrationFormData) => {
    const user = AuthService.getCurrentUser();
    if (!user) return;

    try {
      await UsersCollection.updateUser(user.uid, {
        birthDate: data.birthDate,
        university: data.university,
        section: data.section,
        carrera: data.carrera
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving user registration:", error);
      alert("Error al guardar la información. Por favor, intenta de nuevo.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
        <Input
          id="birthDate"
          type="date"
          {...register("birthDate")}
        />
        {errors.birthDate && (
          <p className="text-sm text-red-600 mt-1">{errors.birthDate.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="university">Universidad *</Label>
        <Select id="university" {...register("university")}>
          <option value="">Selecciona tu universidad</option>
          {universities.map((uni) => (
            <option key={uni} value={uni}>{uni}</option>
          ))}
        </Select>
        {errors.university && (
          <p className="text-sm text-red-600 mt-1">{errors.university.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="section">Sección *</Label>
        <Input
          id="section"
          {...register("section")}
          placeholder="Ej: A, B, C..."
        />
        {errors.section && (
          <p className="text-sm text-red-600 mt-1">{errors.section.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="carrera">Carrera *</Label>
        <Input
          id="carrera"
          {...register("carrera")}
          placeholder="Ej: Ingeniería Informática, Medicina..."
        />
        {errors.carrera && (
          <p className="text-sm text-red-600 mt-1">{errors.carrera.message}</p>
        )}
      </div>

      <div className="flex space-x-3 pt-4">
        <Button type="submit" className="flex-1">
          Completar Registro
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}