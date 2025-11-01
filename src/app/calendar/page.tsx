"use client";

import { useState, useEffect } from "react";
import { AuthService } from "@/lib/auth";
import { HomeworkCollection, Homework } from "@/lib/collections/homework";
import { ExamsCollection, Exam } from "@/lib/collections/exams";
import Layout from "@/components/layout/Layout";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, BookOpen, FileText, CheckCircle, Circle } from "lucide-react";
import { useModal } from "../../contexts/ModalContext";
import HomeworkForm from "../../components/forms/HomeworkForm";
import ExamForm from "../../components/forms/ExamForm";

type Event = (Homework & { type: 'homework' }) | (Exam & { type: 'exam' });

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  useEffect(() => {
    // Set selected events for today when component loads
    const todayEvents = getEventsForDate(selectedDate);
    setSelectedEvents(todayEvents);
  }, [events, selectedDate]);

  const loadEvents = async () => {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) return;

      const [homework, exams] = await Promise.all([
        HomeworkCollection.getHomework(user.uid),
        ExamsCollection.getExams(user.uid)
      ]);

      const allEvents: Event[] = [
        ...homework.map(h => ({ ...h, type: 'homework' as const })),
        ...exams.map(e => ({ ...e, type: 'exam' as const }))
      ];

      setEvents(allEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = event.type === 'homework' ? event.dueDate : event.examDate;
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getSubjectColor = (subjectName: string) => {
    // Find the subject to get its color
    // For now, return a default color based on subject name hash
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'];
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) {
      hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayEvents = getEventsForDate(date);
    setSelectedEvents(dayEvents);
  };

  const handleEditEvent = (event: Event) => {
    if (event.type === 'homework') {
      openModal(
        <HomeworkForm
          editingHomework={event}
          onSuccess={() => {
            closeModal();
            loadEvents();
          }}
          onCancel={closeModal}
        />,
        "Editar Tarea",
        "md"
      );
    } else {
      openModal(
        <ExamForm
          editingExam={event}
          onSuccess={() => {
            closeModal();
            loadEvents();
          }}
          onCancel={closeModal}
        />,
        "Editar Examen",
        "md"
      );
    }
  };

  const handleDeleteEvent = async (event: Event) => {
    if (confirm(`¿Estás seguro de que quieres eliminar este ${event.type === 'homework' ? 'tarea' : 'examen'}?`)) {
      try {
        const user = AuthService.getCurrentUser();
        if (user) {
          if (event.type === 'homework') {
            await HomeworkCollection.deleteHomework(user.uid, event.id!);
          } else {
            await ExamsCollection.deleteExam(user.uid, event.id!);
          }
          loadEvents();
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Error al eliminar el evento. Por favor, intenta de nuevo.");
      }
    }
  };

  const handleToggleComplete = async (event: Event) => {
    try {
      const user = AuthService.getCurrentUser();
      if (user) {
        if (event.type === 'homework') {
          await HomeworkCollection.updateHomework(user.uid, event.id!, {
            completed: !event.completed
          });
        } else {
          await ExamsCollection.updateExam(user.uid, event.id!, {
            completed: !event.completed
          });
        }
        loadEvents();
      }
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Error al actualizar el evento. Por favor, intenta de nuevo.");
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  if (loading) {
    return (
      <Layout title="Calendario">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Calendario">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
            <p className="text-gray-600">Vista general de tus tareas y exámenes</p>
          </div>
          <button
            onClick={goToToday}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Hoy
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-lg shadow">
          {/* Calendar Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((date, index) => {
                if (!date) {
                  return <div key={index} className="p-2"></div>;
                }

                const dayEvents = getEventsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = selectedDate?.toDateString() === date.toDateString();

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    className={`p-2 text-sm relative hover:bg-gray-100 rounded-md transition-colors ${
                      isToday ? 'bg-blue-100 text-blue-600 font-semibold' : 'text-gray-900'
                    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <span className="relative z-10">{date.getDate()}</span>
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {dayEvents.slice(0, 3).map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className="w-2 h-2 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: getSubjectColor(event.subject) }}
                            title={`${event.type === 'homework' ? 'Tarea' : 'Examen'}: ${event.title}`}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="w-2 h-2 rounded-full bg-gray-400 border border-white shadow-sm" title="+ más eventos" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Date Events */}
        {selectedDate && selectedEvents.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
            </div>
            <div className="p-6">
              {selectedEvents.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No hay eventos para este día
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedEvents.map((event) => (
                    <div key={event.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-md ${
                        event.type === 'homework' ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        {event.type === 'homework' ? (
                          <BookOpen className="h-5 w-5 text-blue-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-medium ${event.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {event.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleComplete(event)}
                              className={`p-1 rounded-full ${
                                event.completed ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title={event.completed ? "Marcar como pendiente" : "Marcar como completado"}
                            >
                              {event.completed ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : (
                                <Circle className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                              title="Editar"
                            >
                              <span className="text-sm">✏️</span>
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                              title="Eliminar"
                            >
                              <span className="text-sm">🗑️</span>
                            </button>
                          </div>
                        </div>
                        <p className={`text-sm mt-1 ${event.completed ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                          {event.description}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.type === 'homework' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {event.type === 'homework' ? 'Tarea' : 'Examen'}
                          </span>
                          <span className="ml-2">{event.subject}</span>
                          {event.type === 'exam' && 'location' in event && event.location && (
                            <span className="ml-2">📍 {event.location}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leyenda</h3>
          <div className="flex space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Tareas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Exámenes</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}