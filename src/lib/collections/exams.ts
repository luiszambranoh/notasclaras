import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export interface Exam {
  id?: string;
  userId: string;
  title: string;
  description: string;
  examDate: Date;
  subject: string;
  location?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ExamsCollection {
  private static collectionName = "exams";

  static async getExams(userId: string): Promise<Exam[]> {
    const q = query(
      collection(db, `users/${userId}/exams`),
      orderBy("examDate", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      examDate: doc.data().examDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    } as Exam));
  }

  static async getExamById(userId: string, id: string): Promise<Exam | null> {
    const docSnap = await getDoc(doc(db, `users/${userId}/exams`, id));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        examDate: data.examDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Exam;
    }
    return null;
  }

  static async createExam(userId: string, examData: Omit<Exam, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(collection(db, `users/${userId}/exams`), {
      ...examData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  static async updateExam(userId: string, id: string, updates: Partial<Omit<Exam, "id" | "userId" | "createdAt">>): Promise<void> {
    await updateDoc(doc(db, `users/${userId}/exams`, id), {
      ...updates,
      updatedAt: new Date(),
    });
  }

  static async deleteExam(userId: string, id: string): Promise<void> {
    await deleteDoc(doc(db, `users/${userId}/exams`, id));
  }
}