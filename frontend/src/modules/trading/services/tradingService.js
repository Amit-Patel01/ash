import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  where,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '../../../config/firebase'

const TRADING_SESSIONS = 'tradingSessions'
const TRADING_ENROLLMENTS = 'tradingEnrollments'
const TRADING_PAYMENTS = 'tradingPayments'
const TRADING_COURSES = 'tradingCourses'

export const tradingService = {
  // --- Sessions ---
  subscribeSessions: (callback) => {
    const q = query(collection(db, TRADING_SESSIONS), orderBy('date', 'asc'))
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
  },
  
  addSession: async (session) => {
    const docRef = await addDoc(collection(db, TRADING_SESSIONS), {
      ...session,
      createdAt: serverTimestamp()
    })
    return { id: docRef.id, ...session }
  },

  updateSession: async (id, updates) => {
    await updateDoc(doc(db, TRADING_SESSIONS, id), updates)
  },

  deleteSession: async (id) => {
    await deleteDoc(doc(db, TRADING_SESSIONS, id))
  },

  // --- Enrollments ---
  subscribeEnrollments: (callback) => {
    const q = query(collection(db, TRADING_ENROLLMENTS), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
  },

  addEnrollment: async (enrollment) => {
    const docRef = await addDoc(collection(db, TRADING_ENROLLMENTS), {
      ...enrollment,
      status: 'pending',
      createdAt: serverTimestamp()
    })
    return { id: docRef.id, ...enrollment }
  },

  updateEnrollmentStatus: async (id, status) => {
    await updateDoc(doc(db, TRADING_ENROLLMENTS, id), { status })
  },

  // --- Payments ---
  addPaymentRecord: async (payment) => {
    const docRef = await addDoc(collection(db, TRADING_PAYMENTS), {
      ...payment,
      createdAt: serverTimestamp()
    })
    return { id: docRef.id, ...payment }
  },

  subscribePayments: (callback) => {
    const q = query(collection(db, TRADING_PAYMENTS), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
  },

  // --- Courses / Mentorship Data ---
  subscribeCourses: (callback) => {
    return onSnapshot(collection(db, TRADING_COURSES), (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })
  }
}
