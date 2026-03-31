import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser as firebaseDeleteUser,
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
  serverTimestamp
} from 'firebase/firestore'
import { auth, db, firebaseConfig, setUserOnline, setUserOffline } from '../config/firebase'
import { initializeApp } from 'firebase/app'
import { getAuth as getSecondaryAuth, signOut as secondarySignOut } from 'firebase/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Set user online
        setUserOnline(user.uid)

        // Set offline on page unload
        const handleUnload = () => setUserOffline(user.uid)
        window.addEventListener('beforeunload', handleUnload)

        // Fetch extra profile data from Firestore
        const profileRef = doc(db, 'users', user.uid)
        const profileSnap = await getDoc(profileRef)

        let profileData = profileSnap.data()

        // Fallback: If no profile exists yet (e.g. first login of an admin), create a basic one
        if (!profileSnap.exists()) {
          // STRICT RULE: Only specific email gets Admin role
          const isAdmin = user.email === 'amitp@solutionhub.com'
          profileData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Admin',
            role: isAdmin ? 'admin' : 'employee',
            status: 'active',
            createdAt: new Date().toISOString()
          }
          await setDoc(profileRef, profileData)
        }

        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || profileData?.displayName,
          ...profileData
        }

        setCurrentUser(userData)
        setUserProfile(userData)
      } else {
        setCurrentUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => {
      unsubscribe()
      window.removeEventListener('beforeunload', () => {})
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Fetch profile immediately to avoid race condition
      const profileRef = doc(db, 'users', user.uid)
      const profileSnap = await getDoc(profileRef)
      const profileData = profileSnap.data()

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || profileData?.displayName,
        ...profileData
      }

      setCurrentUser(userData)
      setUserProfile(userData)

      return user
    } catch (error) {
      throw error
    }
  }, [])

  const signup = useCallback(async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update profile name
      await updateProfile(user, { displayName: name })

      // Profile role auto-determined by onAuthStateChanged, but we can set it here too if needed.
      // The Firestore document creation is already handled in useEffect onAuthStateChanged (lines 38-75)

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

  const resetPassword = useCallback(async (email) => {
    await sendPasswordResetEmail(auth, email)
  }, [])

  // Account Requests (Stored in Firestore)
  const createAccountRequest = useCallback(async (requestData) => {
    try {
      // 1. Check if user already exists as a member
      const usersRef = collection(db, 'users')
      const userQuery = query(usersRef, where('email', '==', requestData.email))
      const userSnapshot = await getDocs(userQuery)
      if (!userSnapshot.empty) {
        throw new Error('This email is already registered as a member.')
      }

      const requestsRef = collection(db, 'accountRequests')

      // 2. Check if a request already exists for this email
      const q = query(requestsRef, where('email', '==', requestData.email))
      const querySnapshot = await getDocs(q)

      // Find if there's a PENDING request to merge into
      const pendingRequest = querySnapshot.docs.find(doc => doc.data().status === 'pending')
      
      if (pendingRequest) {
        // MERGE: Update the existing pending request with new information
        await updateDoc(doc(db, 'accountRequests', pendingRequest.id), {
          ...requestData,
          updatedAt: new Date().toISOString(),
          mergeCount: (pendingRequest.data().mergeCount || 0) + 1
        })
        return { id: pendingRequest.id, ...requestData, merged: true }
      }

      // Check if there's an APPROVED request (user exists but maybe collection sync is slow)
      const approvedRequest = querySnapshot.docs.find(doc => doc.data().status === 'approved')
      if (approvedRequest) {
        throw new Error('Your account request has already been approved. Please check your email or try logging in.')
      }

      // 3. Create a new request if no existing pending/approved found
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

  const getAccountRequests = useCallback(async () => {
    const q = query(collection(db, 'accountRequests'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, [])

  const approveAccountRequest = useCallback(async (requestId) => {
    // 1. Get request data
    const requestRef = doc(db, 'accountRequests', requestId)
    const requestSnap = await getDoc(requestRef)
    if (!requestSnap.exists()) throw new Error('Request not found')

    const request = requestSnap.data()

    // 2. Check if user already exists in 'users' collection (for duplicate requests)
    const usersRef = collection(db, 'users')
    const userQuery = query(usersRef, where('email', '==', request.email))
    const userSnapshot = await getDocs(userQuery)

    if (!userSnapshot.empty) {
      // Already exists - just mark this request as approved
      await updateDoc(requestRef, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        note: 'User already exists, request marked as approved.'
      })
      return { success: true, email: request.email, name: request.name, alreadyExists: true }
    }

    // 3. Create the user using a secondary Firebase app (avoids signing out the admin)
    const secondaryAppName = `ApprovalApp_${Date.now()}`
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName)
    const secondaryAuth = getSecondaryAuth(secondaryApp)

    try {
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        request.email,
        request.password // Use the password provided in the request
      )

      const newUser = userCredential.user

      // 3. Set display name and save to 'users' collection
      await updateProfile(newUser, { displayName: request.name })

      const userData = {
        uid: newUser.uid,
        email: request.email,
        displayName: request.name,
        role: request.role || 'employee',
        department: request.department || '',
        phone: request.phone || '',
        avatar: request.name.charAt(0).toUpperCase(),
        status: 'active',
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString()
      }

      await setDoc(doc(db, 'users', newUser.uid), userData)

      // 4. Update request status
      await updateDoc(requestRef, {
        status: 'approved',
        approvedAt: new Date().toISOString()
      })

      // Cleanup secondary app
      await secondarySignOut(secondaryAuth)

      return { success: true, email: request.email, name: request.name }
    } catch (error) {
      throw error
    }
  }, [])

  const rejectAccountRequest = useCallback(async (requestId) => {
    const requestRef = doc(db, 'accountRequests', requestId)
    await updateDoc(requestRef, {
      status: 'rejected',
      rejectedAt: new Date().toISOString()
    })
  }, [])

  // Sell Requests
  const createSellRequest = useCallback(async (requestData) => {
    const docRef = await addDoc(collection(db, 'sellRequests'), {
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString()
    })
    return { id: docRef.id, ...requestData }
  }, [])

  const getSellRequests = useCallback(async () => {
    const q = query(collection(db, 'sellRequests'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, [])

  const approveSellRequest = useCallback(async (requestId) => {
    const requestRef = doc(db, 'sellRequests', requestId)
    await updateDoc(requestRef, {
      status: 'approved',
      approvedAt: new Date().toISOString()
    })
  }, [])

  const rejectSellRequest = useCallback(async (requestId) => {
    const requestRef = doc(db, 'sellRequests', requestId)
    await updateDoc(requestRef, {
      status: 'rejected',
      rejectedAt: new Date().toISOString()
    })
  }, [])

  // Users management
  const getAllUsers = useCallback(async () => {
    const querySnapshot = await getDocs(collection(db, 'users'))
    return querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
  }, [])

  const updateUserProfile = useCallback(async (uid, data) => {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, data)

    if (currentUser?.uid === uid) {
      setCurrentUser(prev => ({ ...prev, ...data }))
      setUserProfile(prev => ({ ...prev, ...data }))
    }
  }, [currentUser])

  const deleteUser = useCallback(async (uid) => {
    try {
      // Note: Deleting from Firestore. To delete from Auth, you need custom backend or Admin SDK
      await deleteDoc(doc(db, 'users', uid))
    } catch (err) {
      console.error("Error deleting user:", err)
      throw err
    }
  }, [])

  const updateUserPassword = useCallback(async (currentPassword, newPassword) => {
    const user = auth.currentUser
    if (!user) throw new Error('No user logged in')

    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)
      return { success: true }
    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        throw new Error('Current password is incorrect.')
      }
      throw error
    }
  }, [])

  // Admin Messages Management
  const getAdminMessages = useCallback(async () => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, [])

  const updateMessageStatus = useCallback(async (messageId, statusData) => {
    const messageRef = doc(db, 'messages', messageId)
    await updateDoc(messageRef, statusData)
  }, [])

  const deleteAdminMessage = useCallback(async (messageId) => {
    await deleteDoc(doc(db, 'messages', messageId))
  }, [])

  // Service (Custom Project) Requests
  const getServiceRequests = useCallback(async () => {
    const q = query(collection(db, 'custom_requests'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }, [])

  const updateServiceRequestStatus = useCallback(async (requestId, status) => {
    const requestRef = doc(db, 'custom_requests', requestId)
    await updateDoc(requestRef, {
      status,
      processedAt: new Date().toISOString()
    })
  }, [])

  const createTeamMemberAccount = useCallback(async (email, password, name, department, role) => {
    // 1. Check if user already exists
    const usersRef = collection(db, 'users')
    const userQuery = query(usersRef, where('email', '==', email))
    const userSnapshot = await getDocs(userQuery)
    if (!userSnapshot.empty) {
      throw new Error('An account with this email already exists.')
    }

    // 2. Initializing secondary app to create user
    const secondaryAppName = `TeamCreationApp_${Date.now()}`
    const secondaryApp = initializeApp(firebaseConfig, secondaryAppName)
    const secondaryAuth = getSecondaryAuth(secondaryApp)

    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password)
      const newUser = userCredential.user

      await updateProfile(newUser, { displayName: name })

      const userData = {
        uid: newUser.uid,
        email: email,
        displayName: name,
        role: role || 'team', // Important: assign team role
        department: department || '',
        avatar: name.charAt(0).toUpperCase(),
        status: 'active',
        createdAt: new Date().toISOString()
      }

      await setDoc(doc(db, 'users', newUser.uid), userData)
      await secondarySignOut(secondaryAuth)

      return { uid: newUser.uid, ...userData }
    } catch (error) {
      throw error
    }
  }, [])

  const value = {
    currentUser, userProfile, loading,
    login, signup, logout, resetPassword,
    createAccountRequest, getAccountRequests, approveAccountRequest, rejectAccountRequest,
    createSellRequest, getSellRequests, approveSellRequest, rejectSellRequest,
    getAllUsers, updateUserProfile, deleteUser, updateUserPassword,
    getAdminMessages, updateMessageStatus, deleteAdminMessage,
    getServiceRequests, updateServiceRequestStatus,
    createTeamMemberAccount
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

// Ensure the hook is exported clearly
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
