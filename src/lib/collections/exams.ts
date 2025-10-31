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
      collection(db, this.collectionName),
      where("userId", "==", userId),
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

  static async getExamById(id: string): Promise<Exam | null> {
    const docSnap = await getDoc(doc(db, this.collectionName, id));
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

  static async createExam(examData: Omit<Exam, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const now = new Date();
    const docRef = await addDoc(collection(db, this.collectionName), {
      ...examData,
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  }

  static async updateExam(id: string, updates: Partial<Omit<Exam, "id" | "userId" | "createdAt">>): Promise<void> {
    await updateDoc(doc(db, this.collectionName, id), {
      ...updates,
      updatedAt: new Date(),
    });
  }

  static async deleteExam(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, id));
  }
}