import * as admin from "firebase-admin";

const firebaseAdminKey = process.env.FIREBASE_ADMIN_KEY;

if (!firebaseAdminKey) {
  throw new Error(
    "FIREBASE_ADMIN_KEY não foi definida nas variáveis de ambiente."
  );
}

const serviceAccount = JSON.parse(firebaseAdminKey);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
console.log("Firebase inicializado e conectado ao Firestore");

export { db };
