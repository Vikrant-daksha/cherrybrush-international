"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export interface MongoUserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  ordersCount: number;
}

interface AuthContextType {
  user: FirebaseUser | null;
  mongoUser: MongoUserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "signin" | "signup";
  openAuthModal: (mode?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [mongoUser, setMongoUser] = useState<MongoUserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">(
    "signin",
  );

  // Sync user profile with MongoDB backend
  const syncWithMongoDB = async (fbUser: FirebaseUser) => {
    try {
      const res = await fetch("/api/auth/firebase-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName || "",
          phone: fbUser.phoneNumber || undefined,
          photoURL: fbUser.photoURL || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setMongoUser(data.user);
        }
      }
    } catch (err) {
      console.warn("MongoDB user sync notice:", err);
    }
  };

  useEffect(() => {
    if (!auth || !auth.app) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncWithMongoDB(currentUser);
      } else {
        setMongoUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (mode: "signin" | "signup" = "signin") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!auth || !auth.app) {
      throw new Error(
        "Authentication is not initialized. Please verify NEXT_PUBLIC_FIREBASE_API_KEY."
      );
    }
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user) {
      await syncWithMongoDB(cred.user);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    if (!auth || !auth.app) {
      throw new Error(
        "Authentication is not initialized. Please verify NEXT_PUBLIC_FIREBASE_API_KEY."
      );
    }
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user) {
      // Sync into MongoDB User schema with phone number & name
      await syncWithMongoDB(cred.user);
    }
  };

  const signInWithGoogle = async () => {
    if (!auth || !auth.app) {
      throw new Error(
        "Google Sign-In is not initialized. Please verify NEXT_PUBLIC_FIREBASE_API_KEY."
      );
    }
    const cred = await signInWithPopup(auth, googleProvider);
    if (cred.user) {
      await syncWithMongoDB(cred.user);
    }
  };

  const logout = async () => {
    try {
      if (auth && auth.app) {
        await signOut(auth);
      }
      setMongoUser(null);
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.warn("Logout notice:", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        mongoUser,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
