import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getAdminDb, COLLECTIONS } from "@/infrastructure/firebase";

/**
 * NextAuth.js 설정
 * Google OAuth를 사용한 인증 구현
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    /**
     * 로그인 시 호출
     * @knou.ac.kr 도메인 검증 및 사용자 생성/조회
     */
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return false;
      }

      const email = user.email;
      if (!email) {
        return false;
      }

      // 학교 이메일 검증은 참가 신청 시에만 적용
      // 로그인은 모든 Google 계정으로 가능

      try {
        const db = getAdminDb();
        const userRef = db.collection(COLLECTIONS.USERS).doc(user.id);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          // 새 사용자 생성
          await userRef.set({
            uid: user.id,
            email: email,
            displayName: user.name || null,
            photoURL: user.image || null,
            role: "USER",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } else {
          // 기존 사용자 정보 업데이트
          await userRef.update({
            displayName: user.name || null,
            photoURL: user.image || null,
            updatedAt: new Date(),
          });
        }

        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    /**
     * JWT 토큰 생성/갱신 시 호출
     * 사용자 역할 정보를 토큰에 포함
     */
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;

        // Firestore에서 사용자 역할 조회
        try {
          const db = getAdminDb();
          const userDoc = await db
            .collection(COLLECTIONS.USERS)
            .doc(user.id)
            .get();

          if (userDoc.exists) {
            const userData = userDoc.data();
            token.role = userData?.role || "USER";
          } else {
            token.role = "USER";
          }
        } catch {
          token.role = "USER";
        }
      }

      return token;
    },

    /**
     * 세션 생성 시 호출
     * 토큰 정보를 세션에 포함
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.role = token.role as "USER" | "ADMIN";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
