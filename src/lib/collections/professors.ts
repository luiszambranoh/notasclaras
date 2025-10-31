import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export interface Professor {
  id?: string;
  userId: string;
  name: string;
  email?: string;
  subject: string;
  officeHours?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ProfessorsCollection {
  private static collectionName = "professors";

  static async getProfessors(userId: string): Promise<Professor[]> {
    const q = query(
      collection(db, this.collectionName),
      where("userId", "==", userId),
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

  static async getProfessorById(id: string): Promise<Professor | null> {
    const docSnap = await getDoc(doc(db, this.collectionName, id));
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

  static async createProfessor(professorData: Omit<Professor, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...professorData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  static async updateProfessor(id: string, updates: Partial<Omit<Professor, "id" | "userId" | "createdAt">>): Promise<void> {
    await updateDoc(doc(db, this.collectionName, id), {
      ...updates,
      updatedAt: new Date(),
    });
  }

  static async deleteProfessor(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, id));
  }
}