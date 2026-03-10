import {
  initializeApp,
  getApps,
  cert,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App;
let auth: Auth;
let db: Firestore;

/**
 * Firebase Admin 서비스 계정 설정
 */
function getServiceAccount(): ServiceAccount {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // 환경 변수 체크
  if (!projectId || !clientEmail || !privateKey) {
    console.error("Firebase Admin 환경 변수 누락:", {
      FIREBASE_PROJECT_ID: projectId ? "OK" : "MISSING",
      FIREBASE_CLIENT_EMAIL: clientEmail ? "OK" : "MISSING",
      FIREBASE_PRIVATE_KEY: privateKey ? "OK" : "MISSING",
    });
    throw new Error(
      "Firebase Admin 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요."
    );
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
}

/**
 * Firebase Admin 앱 가져오기
 * 서버사이드에서 사용하는 Firebase Admin 인스턴스
 */
export function getAdminApp(): App {
  if (!app) {
    const apps = getApps();
    if (apps.length > 0) {
      app = apps[0];
    } else {
      app = initializeApp({
        credential: cert(getServiceAccount()),
      });
    }
  }
  return app;
}

/**
 * Firebase Admin Auth 인스턴스 가져오기
 */
export function getAdminAuth(): Auth {
  if (!auth) {
    auth = getAuth(getAdminApp());
  }
  return auth;
}

/**
 * Firebase Admin Firestore 인스턴스 가져오기
 */
export function getAdminDb(): Firestore {
  if (!db) {
    db = getFirestore(getAdminApp());
  }
  return db;
}

/**
 * Firestore 컬렉션 이름 상수
 */
export const COLLECTIONS = {
  USERS: "users",
  APPLICATIONS: "applications",
  PARTICIPANTS: "participants",
  ROUNDS: "rounds",
  SUBMISSIONS: "submissions",
  CLUB_SETTINGS: "clubSettings",
} as const;
