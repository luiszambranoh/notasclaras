import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  birthDate?: string;
  university?: string;
  section?: string;
  carrera?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UsersCollection {
  private static collectionName = "users";

  static async getUser(uid: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, this.collectionName, uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as User;
    }
    return null;
  }

  static async createUser(userData: Omit<User, "createdAt" | "updatedAt">): Promise<void> {
    const now = new Date();
    await setDoc(doc(db, this.collectionName, userData.uid), {
      ...userData,
      createdAt: now,
      updatedAt: now,
    });
  }

  static async updateUser(uid: string, updates: Partial<Omit<User, "uid" | "createdAt">>): Promise<void> {
    await setDoc(doc(db, this.collectionName, uid), {
      ...updates,
      updatedAt: new Date(),
    }, { merge: true });
  }
}