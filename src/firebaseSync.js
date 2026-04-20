import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from "firebase/auth";
import { doc, getFirestore, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const firebaseEnabled = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
].every(Boolean);
const editorEmails = parseEditorEmails(import.meta.env.VITE_FIREBASE_EDITOR_EMAILS ?? "");
const dashboardCollection = import.meta.env.VITE_FIREBASE_DASHBOARD_COLLECTION ?? "dashboard";
const dashboardDocument = import.meta.env.VITE_FIREBASE_DASHBOARD_DOCUMENT ?? "shared-state";

let app = null;
let auth = null;
let db = null;
let provider = null;
let sharedStateRef = null;

if (firebaseEnabled) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  sharedStateRef = doc(db, dashboardCollection, dashboardDocument);
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function parseEditorEmails(value) {
  return [...new Set(value.split(",").map(normalizeEmail).filter(Boolean))];
}

export function isFirebaseEnabled() {
  return firebaseEnabled;
}

export function getEditorEmails() {
  return editorEmails;
}

export function canEditEmail(email) {
  return editorEmails.includes(normalizeEmail(email));
}

export async function signInEditorWithGoogle() {
  if (!auth || !provider) {
    throw new Error("Firebase is not configured yet.");
  }

  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

export function subscribeToAuthState(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export function subscribeToSharedState(onState, onError) {
  if (!sharedStateRef) {
    onState(null);
    return () => {};
  }

  return onSnapshot(
    sharedStateRef,
    (snapshot) => {
      const data = snapshot.data() ?? null;
      onState(data);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export async function saveSharedState(sharedState, editorEmail) {
  if (!sharedStateRef) {
    throw new Error("Firebase is not configured yet.");
  }

  await setDoc(
    sharedStateRef,
    {
      ...sharedState,
      updatedAt: serverTimestamp(),
      updatedBy: normalizeEmail(editorEmail),
    },
    { merge: true },
  );
}
