import { getAdminDb, COLLECTIONS } from "../admin";
import type {
  Application,
  ApplicationStatus,
  CreateApplicationData,
} from "@/domain/entities";
import type { ApplicationRepository } from "@/domain/repositories";

/**
 * Firestore Application 리포지토리 구현
 */
export function createApplicationRepository(): ApplicationRepository {
  const db = getAdminDb();
  const collection = db.collection(COLLECTIONS.APPLICATIONS);

  return {
    async findById(id: string): Promise<Application | null> {
      const doc = await collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return docToApplication(doc);
    },

    async findByUserId(userId: string): Promise<Application | null> {
      try {
        const snapshot = await collection
          .where("userId", "==", userId)
          .limit(1)
          .get();

        if (snapshot.empty) {
          return null;
        }
        return docToApplication(snapshot.docs[0]);
      } catch {
        // 컬렉션이 없는 경우
        return null;
      }
    },

    async findByStatus(status: ApplicationStatus): Promise<Application[]> {
      const snapshot = await collection
        .where("status", "==", status)
        .orderBy("createdAt", "desc")
        .get();

      return snapshot.docs.map(docToApplication);
    },

    async findAll(): Promise<Application[]> {
      const snapshot = await collection.orderBy("createdAt", "desc").get();
      return snapshot.docs.map(docToApplication);
    },

    async create(data: CreateApplicationData): Promise<Application> {
      const now = new Date();
      const docRef = collection.doc();

      const applicationData = {
        id: docRef.id,
        userId: data.userId,
        participantName: data.participantName,
        schoolEmail: data.schoolEmail,
        blogPlatform: data.blogPlatform,
        blogAccountUrl: data.blogAccountUrl,
        status: "PENDING" as const,
        createdAt: now,
        updatedAt: now,
      };

      await docRef.set(applicationData);

      return applicationData;
    },

    async updateStatus(
      id: string,
      status: ApplicationStatus,
      adminNote?: string
    ): Promise<Application> {
      const updateData: Record<string, unknown> = {
        status,
        updatedAt: new Date(),
      };

      if (adminNote !== undefined) {
        updateData.adminNote = adminNote;
      }

      await collection.doc(id).update(updateData);

      const updated = await this.findById(id);
      if (!updated) {
        throw new Error("Application not found after update");
      }
      return updated;
    },

    async delete(id: string): Promise<void> {
      await collection.doc(id).delete();
    },
  };
}

function docToApplication(
  doc: FirebaseFirestore.DocumentSnapshot
): Application {
  const data = doc.data()!;
  return {
    id: doc.id,
    userId: data.userId,
    participantName: data.participantName,
    schoolEmail: data.schoolEmail,
    blogPlatform: data.blogPlatform,
    blogAccountUrl: data.blogAccountUrl,
    status: data.status,
    adminNote: data.adminNote,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}
