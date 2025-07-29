"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function FirebaseError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl font-bold text-red-900">Firebase Configuration Required</CardTitle>
          <CardDescription className="text-red-600">Please configure Firebase to use this application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg text-sm">
            <p className="font-semibold text-red-900 mb-2">Setup Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-red-700">
              <li>Create a Firebase project at console.firebase.google.com</li>
              <li>Enable Authentication and Firestore Database</li>
              <li>Copy your Firebase config to .env.local</li>
              <li>Restart the development server</li>
            </ol>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-sm">
            <p className="font-semibold text-blue-900 mb-2">Required environment variables:</p>
            <div className="space-y-1 text-blue-700 font-mono text-xs">
              <p>NEXT_PUBLIC_FIREBASE_API_KEY</p>
              <p>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</p>
              <p>NEXT_PUBLIC_FIREBASE_PROJECT_ID</p>
              <p>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</p>
              <p>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</p>
              <p>NEXT_PUBLIC_FIREBASE_APP_ID</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
