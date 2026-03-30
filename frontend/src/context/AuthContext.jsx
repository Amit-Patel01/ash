import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser as firebaseDeleteUser
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
import { auth, db, firebaseConfig } from '../config/firebase'
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

    return unsubscribe
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
    await signOut(auth)
  }, [])

  const resetPassword = useCallback(async (email) => {
    await sendPasswordResetEmail(auth, email)
  }, [])

  // Account Requests (Stored in Firestore)
  const createAccountRequest = useCallback(async (requestData) => {
    const docRef = await addDoc(collection(db, 'accountRequests'), {
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString()
    })
    return { id: docRef.id, ...requestData }
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
    
    // 2. Create the user using a secondary Firebase app (avoids signing out the admin)
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
      // Note: firebase/app doesn't have deleteApp in modern SDK easily in this context, 
      // but creating and leaving it or using a single instance is fine for now.

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

  const value = {
    currentUser, userProfile, loading,
    login, signup, logout, resetPassword,
    createAccountRequest, getAccountRequests, approveAccountRequest, rejectAccountRequest,
    createSellRequest, getSellRequests, approveSellRequest, rejectSellRequest,
    getAllUsers, updateUserProfile, deleteUser,
    getAdminMessages, updateMessageStatus, deleteAdminMessage,
    getServiceRequests, updateServiceRequestStatus,
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
