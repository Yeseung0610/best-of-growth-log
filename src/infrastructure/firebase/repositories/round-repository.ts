import { getAdminDb, COLLECTIONS } from "../admin";
import type { Round, CreateRoundData } from "@/domain/entities";
import type { RoundRepository } from "@/domain/repositories";

/**
 * Firestore Round 리포지토리 구현
 */
export function createRoundRepository(): RoundRepository {
  const db = getAdminDb();
  const collection = db.collection(COLLECTIONS.ROUNDS);

  return {
    async findById(id: string): Promise<Round | null> {
      const doc = await collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return docToRound(doc);
    },

    async findByNumber(roundNumber: number): Promise<Round | null> {
      const snapshot = await collection
        .where("roundNumber", "==", roundNumber)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }
      return docToRound(snapshot.docs[0]);
    },

    async findActive(): Promise<Round | null> {
      const snapshot = await collection
        .where("isActive", "==", true)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }
      return docToRound(snapshot.docs[0]);
    },

    async findAll(): Promise<Round[]> {
      const snapshot = await collection
        .orderBy("roundNumber", "desc")
        .get();
      return snapshot.docs.map(docToRound);
    },

    async create(data: CreateRoundData): Promise<Round> {
      const now = new Date();
      const docRef = collection.doc();

      const roundData = {
        id: docRef.id,
        roundNumber: data.roundNumber,
        submissionStartDate: data.submissionStartDate,
        submissionEndDate: data.submissionEndDate,
        isActive: false,
        createdAt: now,
        updatedAt: now,
      };

      await docRef.set(roundData);

      return {
        ...roundData,
        submissionStartDate: data.submissionStartDate,
        submissionEndDate: data.submissionEndDate,
      };
    },

    async update(id: string, data: Partial<Round>): Promise<Round> {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      // Date 객체를 Firestore Timestamp로 변환하지 않고 그대로 저장
      await collection.doc(id).update(updateData);

      const updated = await this.findById(id);
      if (!updated) {
        throw new Error("Round not found after update");
      }
      return updated;
    },

    async setActive(id: string, isActive: boolean): Promise<void> {
      const db = getAdminDb();
      const batch = db.batch();

      // 다른 모든 차수 비활성화
      if (isActive) {
        const activeRounds = await collection
          .where("isActive", "==", true)
          .get();

        for (const doc of activeRounds.docs) {
          batch.update(doc.ref, { isActive: false, updatedAt: new Date() });
        }
      }

      // 해당 차수 활성화/비활성화
      batch.update(collection.doc(id), {
        isActive,
        updatedAt: new Date(),
      });

      await batch.commit();
    },

    async delete(id: string): Promise<void> {
      await collection.doc(id).delete();
    },
  };
}

function docToRound(doc: FirebaseFirestore.DocumentSnapshot): Round {
  const data = doc.data()!;
  return {
    id: doc.id,
    roundNumber: data.roundNumber,
    submissionStartDate: data.submissionStartDate?.toDate() || new Date(),
    submissionEndDate: data.submissionEndDate?.toDate() || new Date(),
    isActive: data.isActive || false,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}
