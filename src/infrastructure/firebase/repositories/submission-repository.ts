import { getAdminDb, COLLECTIONS } from "../admin";
import type { Submission, CreateSubmissionData } from "@/domain/entities";
import type { SubmissionRepository } from "@/domain/repositories";

/**
 * Firestore Submission 리포지토리 구현
 */
export function createSubmissionRepository(): SubmissionRepository {
  const db = getAdminDb();
  const collection = db.collection(COLLECTIONS.SUBMISSIONS);

  return {
    async findById(id: string): Promise<Submission | null> {
      const doc = await collection.doc(id).get();
      if (!doc.exists) {
        return null;
      }
      return docToSubmission(doc);
    },

    async findByParticipantId(participantId: string): Promise<Submission[]> {
      const snapshot = await collection
        .where("participantId", "==", participantId)
        .orderBy("roundNumber", "desc")
        .get();
      return snapshot.docs.map(docToSubmission);
    },

    async findByRoundId(roundId: string): Promise<Submission[]> {
      const snapshot = await collection
        .where("roundId", "==", roundId)
        .orderBy("score", "desc")
        .get();
      return snapshot.docs.map(docToSubmission);
    },

    async findByParticipantAndRound(
      participantId: string,
      roundId: string
    ): Promise<Submission | null> {
      const snapshot = await collection
        .where("participantId", "==", participantId)
        .where("roundId", "==", roundId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }
      return docToSubmission(snapshot.docs[0]);
    },

    async findByPostUrl(postUrl: string): Promise<Submission | null> {
      const snapshot = await collection
        .where("postUrl", "==", postUrl)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }
      return docToSubmission(snapshot.docs[0]);
    },

    async findAll(): Promise<Submission[]> {
      const snapshot = await collection
        .orderBy("createdAt", "desc")
        .get();
      return snapshot.docs.map(docToSubmission);
    },

    async create(data: CreateSubmissionData): Promise<Submission> {
      const now = new Date();
      const docRef = collection.doc();

      const submissionData = {
        id: docRef.id,
        participantId: data.participantId,
        roundId: data.roundId,
        roundNumber: data.roundNumber,
        postUrl: data.postUrl,
        postTitle: data.postTitle,
        likesCount: 0,
        commentsCount: 0,
        uniqueCommenters: [],
        score: 0,
        status: "PENDING" as const,
        postPublishedAt: data.postPublishedAt,
        createdAt: now,
        updatedAt: now,
      };

      await docRef.set(submissionData);

      return submissionData;
    },

    async updateBlogData(
      id: string,
      data: {
        likesCount: number;
        commentsCount: number;
        uniqueCommenters: string[];
        score: number;
      }
    ): Promise<void> {
      await collection.doc(id).update({
        ...data,
        status: "VERIFIED",
        updatedAt: new Date(),
      });
    },

    async updateStatus(
      id: string,
      status: Submission["status"]
    ): Promise<void> {
      await collection.doc(id).update({
        status,
        updatedAt: new Date(),
      });
    },

    async delete(id: string): Promise<void> {
      await collection.doc(id).delete();
    },
  };
}

function docToSubmission(
  doc: FirebaseFirestore.DocumentSnapshot
): Submission {
  const data = doc.data()!;
  return {
    id: doc.id,
    participantId: data.participantId,
    roundId: data.roundId,
    roundNumber: data.roundNumber,
    postUrl: data.postUrl,
    postTitle: data.postTitle,
    likesCount: data.likesCount || 0,
    commentsCount: data.commentsCount || 0,
    uniqueCommenters: data.uniqueCommenters || [],
    score: data.score || 0,
    status: data.status,
    postPublishedAt: data.postPublishedAt?.toDate() || new Date(),
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}
