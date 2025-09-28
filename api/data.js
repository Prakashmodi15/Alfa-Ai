import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log("✅ Firebase initialized!");
  } catch (error) {
    console.error("❌ Firebase init error:", error);
  }
}

const db = admin.firestore();

// Message Save Function
export async function saveMessage(user, message, reply) {
  return db.collection("messages").add({
    user,
    message,
    reply,
    timestamp: new Date(),
  });
}
