import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export interface Subject {
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

export class SubjectsCollection {
  private static collectionName = "subjects";

  static async getSubjects(userId: string): Promise<Subject[]> {
    const q = query(
      collection(db, `users/${userId}/subjects`),
      orderBy("name", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    } as Subject));
  }

  static async getSubjectById(userId: string, id: string): Promise<Subject | null> {
    const docSnap = await getDoc(doc(db, `users/${userId}/subjects`, id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Subject;
    }
    return null;
  }

  static async createSubject(userId: string, subjectData: Omit<Subject, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(collection(db, `users/${userId}/subjects`), {
      ...subjectData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  static async updateSubject(userId: string, id: string, updates: Partial<Omit<Subject, "id" | "userId" | "createdAt">>): Promise<void> {
    await updateDoc(doc(db, `users/${userId}/subjects`, id), {
      ...updates,
      updatedAt: new Date(),
    });
  }

  static async deleteSubject(userId: string, id: string): Promise<void> {
    await deleteDoc(doc(db, `users/${userId}/subjects`, id));
  }

  static getDayName(day: string): string {
    const days = {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo"
    };
    return days[day as keyof typeof days] || day;
  }

  static getPresetColors(): string[] {
    return [
      "#3B82F6", // blue
      "#EF4444", // red
      "#10B981", // green
      "#F59E0B", // yellow
      "#8B5CF6", // purple
      "#EC4899", // pink
      "#06B6D4", // cyan
      "#84CC16", // lime
      "#F97316", // orange
      "#6366F1"  // indigo
    ];
  }

  static getRandomColor(): string {
    const colors = this.getPresetColors();
    return colors[Math.floor(Math.random() * colors.length)];
  }
}