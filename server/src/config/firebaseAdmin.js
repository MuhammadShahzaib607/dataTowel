import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let _auth = null;

export function getFirebaseAdminAuth() {
  if (_auth) return _auth;

  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = privateKeyRaw?.replace(/\\n/g, "\n");
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  // Validate required env vars (without exposing secrets)
  if (!projectId) throw new Error("Missing FIREBASE_PROJECT_ID env var");
  if (!clientEmail) throw new Error("Missing FIREBASE_CLIENT_EMAIL env var");
  if (!privateKey) throw new Error("Missing FIREBASE_PRIVATE_KEY env var");

  console.log("[Firebase Admin] Initializing with project:", projectId);

  const app =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });

  _auth = getAuth(app);
  console.log("[Firebase Admin] Successfully initialized");
  return _auth;
}