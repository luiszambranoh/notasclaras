import { z } from "zod";

// Homework Schema
export const homeworkSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  subject: z.string().min(1, "La materia es requerida"),
  dueDate: z.string().min(1, "La fecha de entrega es requerida"),
  completed: z.boolean(),
  link: z.string().optional(),
}).refine((data) => {
  // If link is provided, it should be a string (no validation)
  if (data.link !== undefined && data.link !== "") {
    return typeof data.link === "string";
  }
  return true;
});

export type HomeworkFormData = z.infer<typeof homeworkSchema>;

// Exam Schema
export const examSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  subject: z.string().min(1, "La materia es requerida"),
  examDate: z.string().min(1, "La fecha del examen es requerida"),
  location: z.string().optional(),
  completed: z.boolean(),
});

export type ExamFormData = z.infer<typeof examSchema>;

// Professor Schema
export const professorSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Debe ser un email válido").optional().or(z.literal("")),
  subject: z.string().min(1, "La materia es requerida"),
  officeHours: z.string().optional(),
});

export type ProfessorFormData = z.infer<typeof professorSchema>;

// Subject Schema
export const subjectSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  professorId: z.string().optional().nullable(),
  schedule: z.array(z.object({
    day: z.string().min(1, "El día es requerido"),
    startTime: z.string().min(1, "La hora de inicio es requerida"),
    endTime: z.string().min(1, "La hora de fin es requerida"),
  })).min(1, "Debe tener al menos un horario"),
  color: z.string().optional(),
});

export type SubjectFormData = z.infer<typeof subjectSchema>;

// User Registration Schema
export const userRegistrationSchema = z.object({
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  university: z.string().min(1, "La universidad es requerida"),
  section: z.string().min(1, "La sección es requerida"),
  carrera: z.string().min(1, "La carrera es requerida"),
});

export type UserRegistrationFormData = z.infer<typeof userRegistrationSchema>;