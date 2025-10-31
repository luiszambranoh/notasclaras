# Plan de Desarrollo - Notas Claras App

## Visión General
Aplicación móvil-first para estudiantes venezolanos para gestionar tareas, exámenes y horarios académicos. Construida con Next.js, Firebase y enfoque en experiencia móvil.

## Arquitectura Actual
- ✅ Autenticación con Google OAuth
- ✅ Base de datos Firestore con reglas de seguridad
- ✅ Colecciones: Users, Homework, Exams
- ✅ Páginas básicas: Login, Register, Dashboard

## Features Faltantes y Nuevos Requisitos

### 1. Navegación Móvil
- **Drawer/Sidebar**: Menú lateral deslizable para navegación
- **Hamburger Menu**: Icono de tres rayas en header para abrir drawer
- **Bottom Navigation**: Navegación inferior para acceso rápido

### 2. Gestión de Profesores
- **Colección Professors**: uid, name, email, subject, userId
- **CRUD Operations**: Crear, editar, eliminar profesores
- **Asociación**: Vincular profesores con materias y evaluaciones

### 3. Gestión de Materias/Asignaturas
- **Colección Subjects**: uid, name, professorId, schedule, color, userId
- **CRUD Operations**: Crear, editar, eliminar asignaturas
- **Horarios**: Días y horas de clases

### 4. Dashboard Mejorado
- **Resumen de Próximos Eventos**: Próximas tareas y exámenes
- **Vista por Día/Semana**: Calendario compacto
- **Estadísticas**: Tareas completadas, pendientes, etc.
- **Filtros Rápidos**: Por materia, fecha, estado

### 5. Funcionalidades CRUD Completas
- **Editar Tareas/Exámenes**: Modificar detalles existentes
- **Marcar como Completado**: Toggle de estado
- **Eliminar con Confirmación**: Diálogos de confirmación
- **Duplicar**: Crear copias de tareas/exámenes

### 6. Páginas Adicionales
- **Calendario (/calendar)**: Vista mensual/semanal de eventos
- **Configuración (/settings)**: Preferencias de usuario, tema, notificaciones
- **Profesores (/professors)**: Lista y gestión de profesores
- **Materias (/subjects)**: Lista y gestión de asignaturas

### 7. UI/UX Móvil
- **Floating Action Button (FAB)**: Botón flotante para acciones rápidas
  - Crear tarea
  - Crear examen
  - Acceso rápido a funciones principales
- **Responsive Design**: Optimizado para móviles
- **Gestos**: Swipe para completar/eliminar
- **Modales y Diálogos**: Para formularios y confirmaciones

### 8. Filtros y Búsqueda
- **Filtros por Materia**: Ver solo tareas de una asignatura
- **Filtros por Fecha**: Hoy, Esta semana, Este mes
- **Filtros por Estado**: Pendiente, Completado, Vencido
- **Búsqueda**: Buscar por título o descripción

### 9. Notificaciones y Recordatorios
- **Recordatorios**: Notificaciones push para tareas próximas
- **Configuración de Notificaciones**: Activar/desactivar por tipo

## Estructura de Base de Datos Adicional

### Professors Collection
```typescript
interface Professor {
  id?: string;
  userId: string;
  name: string;
  email?: string;
  subject: string;
  officeHours?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Subjects Collection
```typescript
interface Subject {
  id?: string;
  userId: string;
  name: string;
  professorId?: string;
  schedule: {
    day: string; // 'monday', 'tuesday', etc.
    startTime: string; // '08:00'
    endTime: string; // '10:00'
  }[];
  color: string; // hex color for UI
  createdAt: Date;
  updatedAt: Date;
}
```

## Plan de Implementación

### Fase 1: UI Base Móvil
1. Implementar drawer navigation
2. Crear layout móvil responsive
3. Agregar FAB con acciones rápidas

### Fase 2: Nuevas Colecciones
1. Crear ProfessorsCollection class
2. Crear SubjectsCollection class
3. Actualizar Firestore rules
4. Crear páginas CRUD para profesores y materias

### Fase 3: Dashboard Mejorado
1. Rediseñar dashboard con resumen
2. Agregar filtros y búsqueda
3. Implementar vista calendario

### Fase 4: Funcionalidades CRUD
1. Agregar edición de tareas/exámenes
2. Implementar marcar como completado
3. Agregar eliminación con confirmación

### Fase 5: Páginas Adicionales
1. Página de calendario
2. Página de configuración
3. Navegación entre páginas

### Fase 6: Testing y Optimización
1. Testing en dispositivos móviles
2. Optimización de rendimiento
3. Mejoras de UX

## Tecnologías Adicionales
- **UI Components**: Mantener Tailwind CSS
- **Icons**: Heroicons o Lucide React
- **Date Handling**: date-fns para manejo de fechas
- **State Management**: React hooks (useState, useEffect)
- **Routing**: Next.js App Router

## Consideraciones de Diseño
- **Tema**: Mantener consistencia con colores universitarios venezolanos
- **Idioma**: Todo en español
- **Accesibilidad**: Asegurar navegación por teclado y screen readers
- **Performance**: Lazy loading de componentes, optimización de imágenes