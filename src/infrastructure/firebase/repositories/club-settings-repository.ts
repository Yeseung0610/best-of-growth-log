import { getAdminDb, COLLECTIONS } from "../admin";
import type { ClubSettings, UpdateClubSettingsData } from "@/domain/entities";
import type { ClubSettingsRepository } from "@/domain/repositories";

const SETTINGS_DOC_ID = "default";

/**
 * Firestore ClubSettings 리포지토리 구현
 */
export function createClubSettingsRepository(): ClubSettingsRepository {
  const db = getAdminDb();
  const collection = db.collection(COLLECTIONS.CLUB_SETTINGS);

  return {
    async get(): Promise<ClubSettings | null> {
      const doc = await collection.doc(SETTINGS_DOC_ID).get();
      if (!doc.exists) {
        return null;
      }
      return docToClubSettings(doc);
    },

    async initialize(
      data: Omit<ClubSettings, "id" | "updatedAt">
    ): Promise<ClubSettings> {
      const now = new Date();
      const settingsData = {
        id: SETTINGS_DOC_ID,
        ...data,
        updatedAt: now,
      };

      await collection.doc(SETTINGS_DOC_ID).set(settingsData);

      return settingsData;
    },

    async update(data: UpdateClubSettingsData): Promise<ClubSettings> {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await collection.doc(SETTINGS_DOC_ID).update(updateData);

      const updated = await this.get();
      if (!updated) {
        throw new Error("ClubSettings not found after update");
      }
      return updated;
    },
  };
}

function docToClubSettings(
  doc: FirebaseFirestore.DocumentSnapshot
): ClubSettings {
  const data = doc.data()!;
  return {
    id: doc.id,
    clubName: data.clubName,
    description: data.description,
    applicationStartDate: data.applicationStartDate?.toDate() || new Date(),
    applicationEndDate: data.applicationEndDate?.toDate() || new Date(),
    activityStartDate: data.activityStartDate?.toDate() || new Date(),
    activityEndDate: data.activityEndDate?.toDate() || new Date(),
    participationFee: data.participationFee || 0,
    likeScore: data.likeScore || 1,
    uniqueCommenterScore: data.uniqueCommenterScore || 5,
    isApplicationOpen: data.isApplicationOpen || false,
    isActivityActive: data.isActivityActive || false,
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}
