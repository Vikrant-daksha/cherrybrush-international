import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

const clean = (val?: string) => val?.replace(/['"]/g, "").trim() || "";

const rawApiKey =
  clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY) ||
  clean(process.env.FIREBASE_APIKEY);

const firebaseConfig = {
  apiKey: rawApiKey || "",
  authDomain:
    clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) ||
    clean(process.env.FIREBASE_AUTHDOMAIN),
  projectId:
    clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) ||
    clean(process.env.FIREBASE_PROJECTID),
  storageBucket:
    clean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) ||
    clean(process.env.FIREBASE_STORAGEBUCKET),
  messagingSenderId:
    clean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) ||
    clean(process.env.FIREBASE_MESSAGEID),
  appId:
    clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID) ||
    clean(process.env.FIREBASE_APPID),
  measurementId:
    clean(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) ||
    clean(process.env.FIREBASE_MEASUREMENTID),
};

// Initialize Firebase as a singleton to prevent re-initialization during hot reload
const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Initialize Firebase Authentication safely
let authInstance: Auth;
try {
  authInstance = getAuth(app);
} catch (error) {
  console.warn(
    "⚠️ Firebase Auth initialization warning during SSR/Prerender:",
    error,
  );
  authInstance = {} as Auth;
}

export const auth: Auth = authInstance;

// Google Auth Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Analytics (only initialized in browser environments that support it)
if (typeof window !== "undefined") {
  import("firebase/analytics")
    .then(({ getAnalytics, isSupported }) => {
      isSupported().then((supported) => {
        if (supported) {
          getAnalytics(app);
        }
      });
    })
    .catch((err) => {
      console.warn("Firebase Analytics could not be loaded:", err);
    });
}

export default app;
