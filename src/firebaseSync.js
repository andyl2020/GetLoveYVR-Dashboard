import { initializeApp } from "firebase/app";
import {
  getAuth,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
} from "firebase/auth";
import { doc, getFirestore, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

const PENDING_EMAIL_KEY = "getloveyvr-editor-email-v1";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const firebaseEnabled = Object.values(firebaseConfig).every(Boolean);
const editorEmails = parseEditorEmails(import.meta.env.VITE_FIREBASE_EDITOR_EMAILS ?? "");
const dashboardCollection = import.meta.env.VITE_FIREBASE_DASHBOARD_COLLECTION ?? "dashboard";
const dashboardDocument = import.meta.env.VITE_FIREBASE_DASHBOARD_DOCUMENT ?? "shared-state";

let app = null;
let auth = null;
let db = null;
let sharedStateRef = null;

if (firebaseEnabled) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  sharedStateRef = doc(db, dashboardCollection, dashboardDocument);
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function parseEditorEmails(value) {
  return [...new Set(value.split(",").map(normalizeEmail).filter(Boolean))];
}

function getEmailLinkUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  return new URL(import.meta.env.BASE_URL, window.location.origin).toString();
}

function setPendingEmail(email) {
  if (typeof window === "undefined") {
    return;
  }

  if (!email) {
    window.localStorage.removeItem(PENDING_EMAIL_KEY);
    return;
  }

  window.localStorage.setItem(PENDING_EMAIL_KEY, normalizeEmail(email));
}

export function getPendingEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return normalizeEmail(window.localStorage.getItem(PENDING_EMAIL_KEY));
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

export function isEmailLinkFlow() {
  if (!auth || typeof window === "undefined") {
    return false;
  }

  return isSignInWithEmailLink(auth, window.location.href);
}

export async function sendEditorSignInLink(email) {
  if (!auth) {
    throw new Error("Firebase is not configured yet.");
  }

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error("Enter your email first.");
  }

  await sendSignInLinkToEmail(auth, normalizedEmail, {
    url: getEmailLinkUrl(),
    handleCodeInApp: true,
  });

  setPendingEmail(normalizedEmail);
}

export async function completeEditorSignIn(email) {
  if (!auth || typeof window === "undefined") {
    throw new Error("Firebase is not configured yet.");
  }

  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email) || getPendingEmail();
  if (!normalizedEmail) {
    throw new Error("Enter the email address that received the sign-in link.");
  }

  const credential = await signInWithEmailLink(auth, normalizedEmail, window.location.href);
  setPendingEmail("");
  window.history.replaceState({}, document.title, getEmailLinkUrl());
  return credential.user;
}

export function subscribeToAuthState(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

export async function signOutEditor() {
  if (!auth) {
    return;
  }

  setPendingEmail("");
  await signOut(auth);
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

export async function saveSharedState(outputState, editorEmail) {
  if (!sharedStateRef) {
    throw new Error("Firebase is not configured yet.");
  }

  await setDoc(
    sharedStateRef,
    {
      outputState,
      updatedAt: serverTimestamp(),
      updatedBy: normalizeEmail(editorEmail),
    },
    { merge: true },
  );
}
