import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
  orderBy,
  getDoc,
  setDoc,
  onSnapshot
} from 'firebase/firestore'
import { auth, db, firebaseConfig, setUserOnline, setUserOffline } from '../config/firebase'

import { initializeApp } from 'firebase/app'
import { getAuth as getSecondaryAuth, signOut as secondarySignOut } from 'firebase/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Real-time Auth and Profile syncing
  useEffect(() => {
    let unsubscribeProfile = null

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeProfile) {
        unsubscribeProfile()
        unsubscribeProfile = null
      }

      if (user) {
        // Set user online
        setUserOnline(user.uid)

        // Fetch extra profile data from Firestore with a real-time listener
        const profileRef = doc(db, 'users', user.uid)
        
        unsubscribeProfile = onSnapshot(profileRef, async (profileSnap) => {
          let profileData = profileSnap.data()

          // Fallback: If no profile exists yet
          if (!profileSnap.exists()) {
            const isAdminEmail = user.email === 'amitp@solutionhub.com'
            profileData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'User',
              role: isAdminEmail ? 'admin' : 'customer',
              status: 'active',
              createdAt: new Date().toISOString()
            }
            await setDoc(profileRef, profileData)
          }

          // Force logout if banned
          if (profileData?.status === 'banned') {
            await signOut(auth)
            setCurrentUser(null)
            setUserProfile(null)
            setLoading(false)
            return
          }

          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || profileData?.displayName,
            ...profileData
          }

          setCurrentUser(userData)
          setUserProfile(userData)
          setLoading(false)
        }, (error) => {
          console.error("Profile sync error:", error)
          setLoading(false)
        })
      } else {
        setCurrentUser(null)
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => {
      if (unsubscribeAuth) unsubscribeAuth()
      if (unsubscribeProfile) unsubscribeProfile()
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error) {
      throw error
    }
  }, [])

  const signup = useCallback(async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      await updateProfile(user, { displayName: name })
      return user
    } catch (error) {
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    if (auth.currentUser) {
      await setUserOffline(auth.currentUser.uid)
    }
    await signOut(auth)
  }, [])

  const resetPassword = useCallback(async (email, returnUrl) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          returnUrl: returnUrl || (window.location.origin + '/login')
        })
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message);
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const verifyResetCode = useCallback(async (code) => {
    return await verifyPasswordResetCode(auth, code);
  }, []);

  const confirmReset = useCallback(async (code, newPassword) => {
    return await confirmPasswordReset(auth, code, newPassword);
  }, []);

  // User details update
  const updateUserProfile = useCallback(async (uid, data) => {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString()
    })
  }, [])

  const createAccountRequest = useCallback(async (requestData) => {
    try {
      const usersRef = collection(db, 'users')
      const userQuery = query(usersRef, where('email', '==', requestData.email))
      const userSnapshot = await getDocs(userQuery)
      if (!userSnapshot.empty) {
        throw new Error('This email is already registered as a member.')
      }

      const requestsRef = collection(db, 'accountRequests')
      const q = query(requestsRef, where('email', '==', requestData.email))
      const querySnapshot = await getDocs(q)
      const pendingRequest = querySnapshot.docs.find(doc => doc.data().status === 'pending')
      
      if (pendingRequest) {
        await updateDoc(doc(db, 'accountRequests', pendingRequest.id), {
          ...requestData,
          updatedAt: new Date().toISOString(),
          mergeCount: (pendingRequest.data().mergeCount || 0) + 1
        })
        return { id: pendingRequest.id, ...requestData, merged: true }
      }

      const docRef = await addDoc(requestsRef, {
        ...requestData,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
      return { id: docRef.id, ...requestData }
    } catch (error) {
      throw error
    }
  }, [])

  const approveAccountRequest = useCallback(async (requestId) => {
    const requestRef = doc(db, 'accountRequests', requestId)
    const requestSnap = await getDoc(requestRef)
    if (!requestSnap.exists()) throw new Error('Request not found')
    const request = requestSnap.data()

    const secondaryAppName = `ApprovalApp_${Date.now()}`
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName)
    const secondaryAuth = getSecondaryAuth(secondaryApp)

    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, request.email, request.password)
      const newUser = userCredential.user
      await updateProfile(newUser, { displayName: request.name })

      const userData = {
        uid: newUser.uid,
        email: request.email,
        displayName: request.name,
        role: request.role || 'employee',
        department: request.department || '',
        status: 'active',
        createdAt: new Date().toISOString()
      }

      await setDoc(doc(db, 'users', newUser.uid), userData)
      await updateDoc(requestRef, { status: 'approved', approvedAt: new Date().toISOString() })
      await secondarySignOut(secondaryAuth)

      // Notify employee of approval via email
      try {
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/notify-account-approval`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: request.email,
            name: request.name,
            role: request.role || 'Employee'
          })
        });
      } catch (e) {
        console.error("Failed to trigger approval email:", e);
      }

      return { success: true }
    } catch (error) {
      throw error
    }
  }, [])

  const getAllUsers = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, 'users'))
    return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
  }, [])

  const hasPermission = useCallback((permissionKey) => {
    if (!currentUser) return false
    if (currentUser.role === 'admin') return true
    return currentUser.permissions?.[permissionKey] === true
  }, [currentUser])

  const isAdmin = currentUser?.role === 'admin'
  const isEmployee = currentUser?.role === 'employee' || currentUser?.role === 'mentor'

  const value = {
    currentUser, userProfile, loading,
    login, signup, logout, resetPassword, verifyResetCode, confirmReset,
    updateUserProfile, createAccountRequest, approveAccountRequest, getAllUsers,
    hasPermission, isAdmin, isEmployee
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
