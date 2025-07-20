import * as admin from "firebase-admin";
import fs from "fs";
import path from "path";

const serviceAccountPath = path.resolve(__dirname, "./firebase-admin-key.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
console.log("Firebase inicializado e conectado ao Firestore");
export { db };
