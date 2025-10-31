"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";
import { AuthService } from "../lib/auth";
import { UsersCollection } from "../lib/collections/users";
import { HomeworkCollection, Homework } from "../lib/collections/homework";
import { ExamsCollection, Exam } from "../lib/collections/exams";
import { SubjectsCollection } from "../lib/collections/subjects";
import { ProfessorsCollection } from "../lib/collections/professors";
import { SearchService, SearchableItem, SearchFilters } from "../lib/search";
import Layout from "../components/layout/Layout";
import SearchBar from "../components/ui/SearchBar";
import FilterPanel from "../components/ui/FilterPanel";
import { Subject } from "../lib/collections/subjects";
import { Professor } from "../lib/collections/professors";

type Event = (Homework & { type: 'homework' }) | (Exam & { type: 'exam' });

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    status: "all",
    type: "all"
  });
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  // Calculate stats from filtered events
  const pendingHomework = filteredEvents.filter(e => e.type === 'homework' && !e.completed).length;
  const upcomingExams = filteredEvents.filter(e => {
    if (e.type !== 'exam') return false;
    const examDate = e.examDate;
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return examDate >= today && examDate <= weekFromNow && !e.completed;
  }).length;

  const completedToday = filteredEvents.filter(e => {
    const eventDate = e.type === 'homework' ? e.dueDate : e.examDate;
    const today = new Date();
    return eventDate.toDateString() === today.toDateString() && e.completed;
  }).length;

  // Get upcoming events (next 7 days) from filtered events
  const upcomingEvents = filteredEvents
    .filter(e => {
      const eventDate = e.type === 'homework' ? e.dueDate : e.examDate;
      const today = new Date();
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDate >= today && eventDate <= weekFromNow && !e.completed;
    })
    .sort((a, b) => {
      const dateA = a.type === 'homework' ? a.dueDate : a.examDate;
      const dateB = b.type === 'homework' ? b.dueDate : b.examDate;
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5); // Show only next 5 events

  // Filter options for the filter panel
  const filterOptions = SearchService.getFilterOptions(filteredEvents, subjects, professors);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (authUser) => {
      if (authUser) {
        // Check if user has completed registration
        const userData = await UsersCollection.getUser(authUser.uid);
        if (!userData || !userData.birthDate) {
          router.push("/register");
          return;
        }
        setUser(authUser);
        // Load data for dashboard
        await loadData(authUser.uid);
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadData = async (userId: string) => {
    try {
      const [homework, exams, subjectsData, professorsData] = await Promise.all([
        HomeworkCollection.getHomework(userId),
        ExamsCollection.getExams(userId),
        SubjectsCollection.getSubjects(userId),
        ProfessorsCollection.getProfessors(userId)
      ]);

      const allEvents: Event[] = [
        ...homework.map(h => ({ ...h, type: 'homework' as const })),
        ...exams.map(e => ({ ...e, type: 'exam' as const }))
      ];

      setEvents(allEvents);
      setFilteredEvents(allEvents);
      setSubjects(subjectsData);
      setProfessors(professorsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Handle search and filters
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const newFilters = { ...filters, query };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (currentFilters: SearchFilters) => {
    // Simple filtering for now - can be enhanced later
    let filtered = [...events];

    // Apply search query
    if (currentFilters.query) {
      const query = currentFilters.query.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.subject.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (currentFilters.status && currentFilters.status !== 'all') {
      const isCompleted = currentFilters.status === 'completed';
      filtered = filtered.filter(event => event.completed === isCompleted);
    }

    // Apply type filter
    if (currentFilters.type && currentFilters.type !== 'all') {
      filtered = filtered.filter(event => event.type === currentFilters.type);
    }

    // Apply subject filter
    if (currentFilters.subject) {
      filtered = filtered.filter(event => event.subject === currentFilters.subject);
    }

    setFilteredEvents(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to /login
  }

  return (
    <Layout title="Inicio">
      <div className="space-y-6">
        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="p-4">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              onFilterClick={() => setShowFilters(true)}
            />
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              ¡Bienvenido de vuelta!
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {user.displayName || user.email}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📚</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Tareas Pendientes
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{pendingHomework}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">📝</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Exámenes Próximos
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{upcomingExams}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">✅</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Completadas Hoy
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">{completedToday}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Próximos Eventos */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Próximos Eventos
            </h3>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <span className="text-4xl">📅</span>
                </div>
                <p className="text-sm text-gray-500">
                  No hay eventos próximos
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Usa el botón + para crear tareas o exámenes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const eventDate = event.type === 'homework' ? event.dueDate : event.examDate;
                  const daysUntil = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-md ${
                          event.type === 'homework' ? 'bg-blue-100' : 'bg-red-100'
                        }`}>
                          {event.type === 'homework' ? (
                            <span className="text-blue-600">📚</span>
                          ) : (
                            <span className="text-red-600">📝</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                          <p className="text-xs text-gray-600">{event.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {eventDate.toLocaleDateString('es-ES', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className={`text-xs font-medium ${
                          daysUntil === 0 ? 'text-red-600' :
                          daysUntil === 1 ? 'text-orange-600' : 'text-gray-600'
                        }`}>
                          {daysUntil === 0 ? 'Hoy' :
                           daysUntil === 1 ? 'Mañana' :
                           `En ${daysUntil} días`}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          filterOptions={filterOptions}
        />
      </div>
    </Layout>
  );
}
