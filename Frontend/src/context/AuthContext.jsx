import React, { createContext, useContext, useEffect, useState } from "react"
import { initializeApp } from "firebase/app"
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDJBzJD2ctjDOQp4QZXDnoJeudOvlyVF1M",
  authDomain: "login-page-abe50.firebaseapp.com",
  projectId: "login-page-abe50",
  storageBucket: "login-page-abe50.appspot.com",
  messagingSenderId: "1095857304885",
  appId: "1:1095857304885:web:d9446f2d9724ea3d26487c",
  measurementId: "G-4NV43QKYLV",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
