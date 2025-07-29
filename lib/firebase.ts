import { initializeApp, type FirebaseApp } from "firebase/app"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check if we have all required config
export const isConfigValid = Object.values(firebaseConfig).every((value) => value && value !== "undefined")

let app: FirebaseApp | null = null

// Initialize Firebase app only
if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig)
  } catch (error) {
    console.error("Firebase app initialization error:", error)
  }
}

export { app, firebaseConfig }
