import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export interface Homework {
  id?: string;
  userId: string;
  title: string;
  description: string;
  dueDate: Date;
  subject: string;
  completed: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class HomeworkCollection {
  private static collectionName = "homework";

  static async getHomework(userId: string): Promise<Homework[]> {
    const q = query(
      collection(db, `users/${userId}/homework`),
      orderBy("dueDate", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    } as Homework));
  }

  static async getHomeworkById(userId: string, id: string): Promise<Homework | null> {
    const docSnap = await getDoc(doc(db, `users/${userId}/homework`, id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        dueDate: data.dueDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Homework;
    }
    return null;
  }

  static async createHomework(userId: string, homeworkData: Omit<Homework, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(collection(db, `users/${userId}/homework`), {
      ...homeworkData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  static async updateHomework(userId: string, id: string, updates: Partial<Omit<Homework, "id" | "userId" | "createdAt">>): Promise<void> {
    await updateDoc(doc(db, `users/${userId}/homework`, id), {
      ...updates,
      updatedAt: new Date(),
    });
  }

  static async deleteHomework(userId: string, id: string): Promise<void> {
    await deleteDoc(doc(db, `users/${userId}/homework`, id));
  }
}