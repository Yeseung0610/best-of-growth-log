import { getAdminDb, COLLECTIONS } from "../admin";
import type { Participant, LeaderboardEntry } from "@/domain/entities";
import type {
  ParticipantRepository,
  CreateParticipantData,
} from "@/domain/repositories";

/**
 * Firestore Participant 리포지토리 구현
 */
export function createParticipantRepository(): ParticipantRepository {
  const db = getAdminDb();
  const collection = db.collection(COLLECTIONS.PARTICIPANTS);

  return {
    async findById(id: string): Promise<Participant | null> {
      const doc = await collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return docToParticipant(doc);
    },

    async findByUserId(userId: string): Promise<Participant | null> {
      try {
        return await this.findById(userId);
      } catch {
        return null;
      }
    },

    async findAll(): Promise<Participant[]> {
      try {
        const snapshot = await collection.orderBy("totalScore", "desc").get();
        return snapshot.docs.map(docToParticipant);
      } catch (error) {
        console.error("Failed to find all participants:", error);
        return [];
      }
    },

    async findTopByScore(limit: number): Promise<LeaderboardEntry[]> {
      try {
        const snapshot = await collection
          .orderBy("totalScore", "desc")
          .limit(limit)
          .get();

        return snapshot.docs.map((doc, index) => {
          const participant = docToParticipant(doc);
          return {
            rank: index + 1,
            participantId: participant.id,
            name: participant.name,
            blogPlatform: participant.blogPlatform,
            totalScore: participant.totalScore,
            totalLikes: participant.totalLikes,
            totalComments: participant.totalComments,
            submissionCount: participant.submissionCount,
          };
        });
      } catch (error) {
        console.error("Failed to get leaderboard:", error);
        return [];
      }
    },

    async create(data: CreateParticipantData): Promise<Participant> {
      const now = new Date();
      const docRef = collection.doc(data.userId);

      const participantData = {
        id: data.userId,
        userId: data.userId,
        name: data.name,
        schoolEmail: data.schoolEmail,
        blogPlatform: data.blogPlatform,
        blogAccountUrl: data.blogAccountUrl,
        totalScore: 0,
        totalLikes: 0,
        totalComments: 0,
        submissionCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      await docRef.set(participantData);

      return participantData;
    },

    async updateScore(
      id: string,
      data: {
        totalScore: number;
        totalLikes: number;
        totalComments: number;
        submissionCount: number;
      }
    ): Promise<void> {
      await collection.doc(id).update({
        ...data,
        updatedAt: new Date(),
      });
    },

    async delete(id: string): Promise<void> {
      await collection.doc(id).delete();
    },
  };
}

function docToParticipant(
  doc: FirebaseFirestore.DocumentSnapshot
): Participant {
  const data = doc.data()!;
  return {
    id: doc.id,
    userId: data.userId,
    name: data.name,
    schoolEmail: data.schoolEmail,
    blogPlatform: data.blogPlatform,
    blogAccountUrl: data.blogAccountUrl,
    totalScore: data.totalScore || 0,
    totalLikes: data.totalLikes || 0,
    totalComments: data.totalComments || 0,
    submissionCount: data.submissionCount || 0,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}
