import { getAdminDb, COLLECTIONS } from "../admin";
import type { User, CreateUserData } from "@/domain/entities";
import type { UserRepository } from "@/domain/repositories";

/**
 * Firestore User 리포지토리 구현
 */
export function createUserRepository(): UserRepository {
  const db = getAdminDb();
  const collection = db.collection(COLLECTIONS.USERS);

  return {
    async findById(uid: string): Promise<User | null> {
      const doc = await collection.doc(uid).get();
      if (!doc.exists) {
        return null;
      }
      return docToUser(doc);
    },

    async findByEmail(email: string): Promise<User | null> {
      const snapshot = await collection
        .where("email", "==", email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }
      return docToUser(snapshot.docs[0]);
    },

    async create(data: CreateUserData): Promise<User> {
      const now = new Date();
      const userData = {
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        role: "USER" as const,
        createdAt: now,
        updatedAt: now,
      };

      await collection.doc(data.uid).set(userData);

      return userData;
    },

    async update(uid: string, data: Partial<User>): Promise<User> {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await collection.doc(uid).update(updateData);

      const updated = await this.findById(uid);
      if (!updated) {
        throw new Error("User not found after update");
      }
      return updated;
    },

    async updateRole(uid: string, role: User["role"]): Promise<void> {
      await collection.doc(uid).update({
        role,
        updatedAt: new Date(),
      });
    },
  };
}

function docToUser(
  doc: FirebaseFirestore.DocumentSnapshot
): User {
  const data = doc.data()!;
  return {
    uid: data.uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    role: data.role,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}
