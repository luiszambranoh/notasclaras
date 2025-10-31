import Fuse from 'fuse.js';
import { Homework } from './collections/homework';
import { Exam } from './collections/exams';
import { Professor } from './collections/professors';
import { Subject } from './collections/subjects';

export type SearchableItem = (Homework & { type: 'homework' }) | (Exam & { type: 'exam' });

export interface SearchFilters {
  query: string;
  subject?: string;
  professor?: string;
  status?: 'pending' | 'completed' | 'all';
  dateRange?: {
    start: Date;
    end: Date;
  };
  type?: 'homework' | 'exam' | 'all';
}

export class SearchService {
  private static fuseOptions = {
    keys: [
      { name: 'title', weight: 0.4 },
      { name: 'description', weight: 0.3 },
      { name: 'subject', weight: 0.3 }
    ],
    threshold: 0.3, // More lenient matching
    includeScore: true,
    includeMatches: true
  };

  static searchItems(items: SearchableItem[], filters: SearchFilters): SearchableItem[] {
    let filteredItems = [...items];

    // Apply text search
    if (filters.query.trim()) {
      const fuse = new Fuse(filteredItems, this.fuseOptions);
      const searchResults = fuse.search(filters.query);
      filteredItems = searchResults.map(result => result.item);
    }

    // Apply subject filter
    if (filters.subject) {
      filteredItems = filteredItems.filter(item => item.subject === filters.subject);
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      const isCompleted = filters.status === 'completed';
      filteredItems = filteredItems.filter(item => item.completed === isCompleted);
    }

    // Apply type filter
    if (filters.type && filters.type !== 'all') {
      filteredItems = filteredItems.filter(item => item.type === filters.type);
    }

    // Apply date range filter
    if (filters.dateRange) {
      filteredItems = filteredItems.filter(item => {
        const itemDate = item.type === 'homework' ? item.dueDate : item.examDate;
        return itemDate >= filters.dateRange!.start && itemDate <= filters.dateRange!.end;
      });
    }

    return filteredItems;
  }

  static getFilterOptions(items: SearchableItem[], subjects: Subject[], professors: Professor[]) {
    const subjectNames = [...new Set(items.map(item => item.subject))].filter(Boolean);
    const subjectOptions = subjectNames.map(name => ({
      value: name,
      label: name,
      count: items.filter(item => item.subject === name).length
    }));

    const statusOptions = [
      { value: 'all', label: 'Todos', count: items.length },
      { value: 'pending', label: 'Pendientes', count: items.filter(item => !item.completed).length },
      { value: 'completed', label: 'Completados', count: items.filter(item => item.completed).length }
    ];

    const typeOptions = [
      { value: 'all', label: 'Todos', count: items.length },
      { value: 'homework', label: 'Tareas', count: items.filter(item => item.type === 'homework').length },
      { value: 'exam', label: 'Exámenes', count: items.filter(item => item.type === 'exam').length }
    ];

    return {
      subjects: subjectOptions,
      status: statusOptions,
      types: typeOptions
    };
  }

  static sortItems(items: SearchableItem[], sortBy: 'date' | 'title' | 'subject' | 'type', order: 'asc' | 'desc' = 'asc'): SearchableItem[] {
    return [...items].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = a.type === 'homework' ? a.dueDate : a.examDate;
          bValue = b.type === 'homework' ? b.dueDate : b.examDate;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'subject':
          aValue = a.subject.toLowerCase();
          bValue = b.subject.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}