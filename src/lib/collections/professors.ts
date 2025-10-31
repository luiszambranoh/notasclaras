import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export interface Professor {
  id?: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProfessorsCollection {
  private static collectionName = "professors";

  static async getProfessors(userId: string): Promise<Professor[]> {
    const q = query(
      collection(db, `users/${userId}/professors`),
      orderBy("name", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    } as Professor));
  }

  static async getProfessorById(userId: string, id: string): Promise<Professor | null> {
    const docSnap = await getDoc(doc(db, `users/${userId}/professors`, id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Professor;
    }
    return null;
  }

  static async createProfessor(userId: string, professorData: Omit<Professor, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(collection(db, `users/${userId}/professors`), {
      ...professorData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  static async updateProfessor(userId: string, id: string, updates: Partial<Omit<Professor, "id" | "userId" | "createdAt">>): Promise<void> {
    await updateDoc(doc(db, `users/${userId}/professors`, id), {
      ...updates,
      updatedAt: new Date(),
    });
  }

  static async deleteProfessor(userId: string, id: string): Promise<void> {
    await deleteDoc(doc(db, `users/${userId}/professors`, id));
  }
}