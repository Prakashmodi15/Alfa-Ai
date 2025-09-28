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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET method allowed" });
  }

  try {
    const snapshot = await db.collection("messages")
                             .orderBy("timestamp", "asc")
                             .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("❌ Fetch Messages Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
