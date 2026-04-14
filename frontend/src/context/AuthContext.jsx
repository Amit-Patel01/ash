import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  onSnapshot
} from 'firebase/firestore'
import { auth, db, setUserOnline, setUserOffline } from '../config/firebase'
import { api, readApiJson } from '../config/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const getAuthHeaders = useCallback(async () => {
    const token = await auth.currentUser?.getIdToken()
    if (!token) {
      throw new Error('Please sign in again to continue.')
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }, [])

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

          // Force logout for deactivated accounts
          if (profileData?.status && profileData.status !== 'active') {
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

  const signup = useCallback(async (payload) => {
    const response = await fetch(api.registerCustomer, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to create account.')
    }

    return data
  }, [])

  const logout = useCallback(async () => {
    if (auth.currentUser) {
      await setUserOffline(auth.currentUser.uid)
    }
    await signOut(auth)
  }, [])

  const resetPassword = useCallback(async (email, from) => {
    const response = await fetch(api.forgotPassword, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, from })
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to send reset email.')
    }
    return data
  }, [])

  const verifyResetCode = useCallback(async (token) => {
    const response = await fetch(api.verifyResetToken, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Invalid reset token.')
    }
    return data.email
  }, [])

  const confirmReset = useCallback(async (token, newPassword) => {
    const response = await fetch(api.resetPassword, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: newPassword })
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to reset password.')
    }
    return data
  }, [])

  // User details update
  const updateUserProfile = useCallback(async (uid, data) => {
    const headers = await getAuthHeaders()
    const response = await fetch(api.userProfile, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data)
    })
    const payload = await response.json()
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'Failed to update profile.')
    }

    if (auth.currentUser?.uid === uid) {
      const nextDisplayName = data.displayName ?? auth.currentUser.displayName ?? ''
      const nextPhotoURL =
        data.photoURL !== undefined
          ? (data.photoURL || null)
          : data.avatar !== undefined
            ? (data.avatar || null)
            : (auth.currentUser.photoURL || null)

      if (data.displayName !== undefined || data.photoURL !== undefined || data.avatar !== undefined) {
        await updateProfile(auth.currentUser, {
          displayName: nextDisplayName,
          photoURL: nextPhotoURL
        })
      }
    }

    return payload.profile
  }, [getAuthHeaders])

  const updateUserPassword = useCallback(async () => {
    const headers = await getAuthHeaders()
    const response = await fetch(api.userPasswordReset, {
      method: 'POST',
      headers,
      body: JSON.stringify({ from: currentUser?.role || 'customer' })
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to send password reset email.')
    }
    return data
  }, [currentUser?.role, getAuthHeaders])

  const createAccountRequest = useCallback(async (requestData) => {
    const response = await fetch(api.submitAccountRequest, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    })
    const data = await response.json()
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to submit request.')
    }
    return data
  }, [])

  const approveAccountRequest = useCallback(async (requestId) => {
    const headers = await getAuthHeaders()
    const response = await fetch(api.adminApproveAccountRequest(requestId), {
      method: 'POST',
      headers
    })
    const data = await readApiJson(response)
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Failed to approve request.')
    }
    return data
  }, [getAuthHeaders])

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
    updateUserProfile, updateUserPassword, createAccountRequest, approveAccountRequest, getAllUsers,
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
