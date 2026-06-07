import { createContext, useContext, useState, useEffect } from 'react'
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
  getDocs,
  setDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import { api, buildApiUrl, readApiJson } from '../config/api'
import { emailNotify } from '../utils/emailNotify'
import { isEnrollmentClosed, normalizeEnrollmentDeadline } from '../utils/enrollmentDeadline'
import { normalizeLearningType } from '../utils/learningType'
import {
  DEFAULT_CERTIFICATE_TEMPLATE,
  mergeCertificateTemplate,
  normalizeCertificateTemplate,
} from '../utils/certificateTemplate'

const StoreContext = createContext(null)

const normalizeMatchKey = (value) => String(value || '').trim().toLowerCase()
const compactMatchKey = (value) => normalizeMatchKey(value).replace(/[^a-z0-9]/g, '')
const normalizeCourseCategoryName = (value) => String(value || '').trim().toLowerCase()

const dedupeCourseCategories = (items = []) => {
  const sortedItems = [...items].sort((a, b) => {
    const orderDiff = (a?.order ?? Number.MAX_SAFE_INTEGER) - (b?.order ?? Number.MAX_SAFE_INTEGER)
    if (orderDiff !== 0) return orderDiff
    return String(a?.id || '').localeCompare(String(b?.id || ''))
  })

  const unique = new Map()
  for (const item of sortedItems) {
    const key = normalizeCourseCategoryName(item?.name)
    if (!key || unique.has(key)) continue
    unique.set(key, item)
  }

  return [...unique.values()]
}

const getPlanIdentity = (source = {}) => {
  const normalized = [
    source.planId,
    source.planLabel,
    source.planName,
    source.id,
    source.label,
  ]
    .map(normalizeMatchKey)
    .filter(Boolean)

  const compact = [
    source.planId,
    source.planLabel,
    source.planName,
    source.id,
    source.label,
  ]
    .map(compactMatchKey)
    .filter(Boolean)

  const rawAmount =
    source.amount ??
    source.price ??
    (source.isFree ? 0 : undefined)
  const amount = Number(rawAmount)

  return {
    normalized,
    compact,
    amount: Number.isNaN(amount) ? null : amount,
  }
}

const matchesEnrollmentPlan = (enrollment, planRef = null) => {
  if (!planRef) return true

  const enrollmentPlan = getPlanIdentity(enrollment)
  const targetPlan = getPlanIdentity(planRef)

  const hasPlanKeys = targetPlan.normalized.length > 0 || targetPlan.compact.length > 0

  if (hasPlanKeys) {
    const directMatch =
      targetPlan.normalized.some(key => enrollmentPlan.normalized.includes(key)) ||
      targetPlan.compact.some(key => enrollmentPlan.compact.includes(key))

    if (directMatch) return true
  }

  if (targetPlan.amount !== null) {
    return enrollmentPlan.amount === targetPlan.amount
  }

  return !hasPlanKeys
}

const formatScheduledMeetingTime = (meetingStartsAt, meetingTimezone = 'Asia/Kolkata') => {
  if (!meetingStartsAt) return ''
  const parsed = new Date(meetingStartsAt)
  if (Number.isNaN(parsed.getTime())) return ''

  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: meetingTimezone || 'Asia/Kolkata',
    }).format(parsed)
  } catch {
    return parsed.toLocaleString('en-IN')
  }
}

const isUpcomingScheduledMeeting = (meetingStartsAt) => {
  if (!meetingStartsAt) return false
  const parsed = new Date(meetingStartsAt)
  if (Number.isNaN(parsed.getTime())) return false
  return parsed.getTime() >= Date.now() - (10 * 60 * 1000)
}

const resolveEnrollmentMeetingPlan = (course, enrollmentData) => {
  const plans = Array.isArray(course?.plans) ? course.plans : []
  const planKeys = [enrollmentData.planId, enrollmentData.planLabel, enrollmentData.planName]
    .map(normalizeMatchKey)
    .filter(Boolean)
  const compactPlanKeys = [enrollmentData.planId, enrollmentData.planLabel, enrollmentData.planName]
    .map(compactMatchKey)
    .filter(Boolean)

  if (planKeys.length === 0) {
    const enrollmentAmount = Number(enrollmentData.amount)
    if (!Number.isNaN(enrollmentAmount)) {
      const amountMatches = plans.filter(plan => {
        const planAmount = Number(plan?.price || 0)
        const freePlan = plan?.isFree || planAmount === 0
        return freePlan ? enrollmentAmount === 0 : planAmount === enrollmentAmount
      })
      if (amountMatches.length === 1) return amountMatches[0]
    }
    return plans.length === 1 ? plans[0] : null
  }

  const directMatch = plans.find((plan, index) =>
    planKeys.includes(normalizeMatchKey(plan?.id)) ||
    planKeys.includes(normalizeMatchKey(plan?.label)) ||
    planKeys.includes(String(index)) ||
    compactPlanKeys.includes(compactMatchKey(plan?.id)) ||
    compactPlanKeys.includes(compactMatchKey(plan?.label))
  )

  if (directMatch) return directMatch

  const enrollmentAmount = Number(enrollmentData.amount)
  if (!Number.isNaN(enrollmentAmount)) {
    const amountMatches = plans.filter(plan => {
      const planAmount = Number(plan?.price || 0)
      const freePlan = plan?.isFree || planAmount === 0
      return freePlan ? enrollmentAmount === 0 : planAmount === enrollmentAmount
    })
    if (amountMatches.length === 1) return amountMatches[0]
  }

  return plans.length === 1 ? plans[0] : null
}

const resolveCoursePlanMeetingLink = (course, plan) => {
  if (plan?.meetingLink) return plan.meetingLink
  const plans = Array.isArray(course?.plans) ? course.plans : []
  return plans.length <= 1 ? (course?.meetingLink || '') : ''
}

export function StoreProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [tasks, setTasks] = useState([])
  const [manualEmployees, setManualEmployees] = useState([])
  const [users, setUsers] = useState([]) // Unified Users state
  const [services, setServices] = useState([])
  const [accountRequests, setAccountRequests] = useState([])
  const [sellRequests, setSellRequests] = useState([])
  const [serviceRequests, setServiceRequests] = useState([])
  const [messages, setMessages] = useState([])
  const [tradingCourses, setTradingCourses] = useState([])
  const [tradingSessions, setTradingSessions] = useState([])
  const [tradingEnrollments, setTradingEnrollments] = useState([])
  const [tradingPayments, setTradingPayments] = useState([])
  const [mentorProfile, setMentorProfile] = useState(null)
  const [employeePermissions, setEmployeePermissions] = useState({})
  const [tradingCurriculum, setTradingCurriculum] = useState([])
  const [certificates, setCertificates] = useState([])
  const [certificateTemplate, setCertificateTemplate] = useState(DEFAULT_CERTIFICATE_TEMPLATE)
  const [announcement, setAnnouncement] = useState(null)
  // ── Generic Course System (Phase 1) ──────────────────────────
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [courseCategories, setCourseCategories] = useState([])
  // ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const qrCertificates = certificates.filter(certificate => certificate.source === 'qr')

  const getAuthorizedHeaders = async () => {
    const token = await auth.currentUser?.getIdToken()
    if (!token) {
      throw new Error('Please sign in again to continue.')
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }

  // Real-time Listeners
  useEffect(() => {
    const qProjects = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setProjects(projectsData)
      setLoading(false)
    }, (error) => {
      console.error("Projects snapshot error:", error)
      setLoading(false)
    })

    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Orders snapshot error:", error))

    const unsubscribeCategories = onSnapshot(query(collection(db, 'categories')), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Categories snapshot error:", error))

    const unsubscribeTasks = onSnapshot(collection(db, 'tasks'), (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Tasks snapshot error:", error))

    const unsubscribeTeam = onSnapshot(collection(db, 'employees'), (snapshot) => {
      setManualEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Team snapshot error:", error))

    // Unified Users Listener - Removed orderBy to ensure all users are fetched even if createdAt is missing
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
      setUsers(usersData)
    }, (error) => console.error("Users snapshot error:", error))

    const unsubscribeServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      const servicesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setServices(servicesData)
    }, (error) => console.error("Services snapshot error:", error))

    // Real-time listeners for Requests & Messages
    const unsubscribeAccountRequests = onSnapshot(query(collection(db, 'accountRequests'), orderBy('createdAt', 'desc')), (snapshot) => {
      setAccountRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Account Requests snapshot error:", error))

    const unsubscribeSellRequests = onSnapshot(query(collection(db, 'sellRequests'), orderBy('createdAt', 'desc')), (snapshot) => {
      setSellRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Sell Requests snapshot error:", error))

    const unsubscribeServiceRequests = onSnapshot(query(collection(db, 'custom_requests'), orderBy('createdAt', 'desc')), (snapshot) => {
      setServiceRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Service Requests snapshot error:", error))

    const unsubscribeMessages = onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Messages snapshot error:", error))

    // Trading Courses Listener
    const unsubscribeCourses = onSnapshot(collection(db, 'tradingCourses'), (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTradingCourses(coursesData)
    }, (error) => console.error("Trading Courses snapshot error:", error))

    // Trading Sessions Listener
    const unsubscribeSessions = onSnapshot(collection(db, 'tradingSessions'), (snapshot) => {
      const sessionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setTradingSessions(sessionsData)
    }, (error) => console.error("Trading Sessions snapshot error:", error))

    // Trading Enrollments Listener (removed orderBy to avoid index requirement)
    const unsubscribeEnrollments = onSnapshot(collection(db, 'tradingEnrollments'), (snapshot) => {
      setTradingEnrollments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Trading Enrollments snapshot error:", error))

    // Trading Payments Listener (removed orderBy to avoid index requirement)
    const unsubscribePayments = onSnapshot(collection(db, 'tradingPayments'), (snapshot) => {
      setTradingPayments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Trading Payments snapshot error:", error))

    // Mentor Profile Listener
    const unsubscribeMentorProfile = onSnapshot(doc(db, 'tradingSettings', 'mentorProfile'), (snapshot) => {
      if (snapshot.exists()) {
        setMentorProfile({ id: snapshot.id, ...snapshot.data() })
      }
    }, (error) => console.error("Mentor Profile snapshot error:", error))

    // Employee Permissions Listener
    const unsubscribePermissions = onSnapshot(collection(db, 'employeePermissions'), (snapshot) => {
      const perms = {}
      snapshot.docs.forEach(doc => {
        perms[doc.id] = doc.data()
      })
      setEmployeePermissions(perms)
    }, (error) => console.error("Permissions snapshot error:", error))

    // Trading Curriculum Listener
    const unsubscribeCurriculum = onSnapshot(collection(db, 'tradingCurriculum'), (snapshot) => {
      const curriculumData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      curriculumData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      setTradingCurriculum(curriculumData)
    }, (error) => console.error("Curriculum snapshot error:", error))

    const unsubscribeCertificates = onSnapshot(query(collection(db, 'certificates'), orderBy('createdAt', 'desc')), (snapshot) => {
      setCertificates(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Certificates snapshot error:", error))

    const unsubscribeCertificateTemplate = onSnapshot(doc(db, 'settings', 'certificateTemplate'), (snapshot) => {
      if (snapshot.exists()) {
        setCertificateTemplate(normalizeCertificateTemplate(snapshot.data()))
      } else {
        setCertificateTemplate(DEFAULT_CERTIFICATE_TEMPLATE)
      }
    }, (error) => console.error("CertificateTemplate snapshot error:", error))

    const unsubscribeAnnouncement = onSnapshot(doc(db, 'settings', 'announcement'), (snapshot) => {
      if (snapshot.exists()) {
        setAnnouncement({ id: snapshot.id, ...snapshot.data() })
      }
    }, (error) => console.error("Announcement snapshot error:", error))

    // ── Generic Course System Listeners ──────────────────────────
    const unsubscribeGenericCourses = onSnapshot(
      query(collection(db, 'courses'), orderBy('createdAt', 'desc')),
      (snapshot) => setCourses(snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        enrollmentDeadline: normalizeEnrollmentDeadline(d.data()?.enrollmentDeadline),
      }))),
      (error) => console.error("Courses snapshot error:", error)
    )

    const unsubscribeGenericEnrollments = onSnapshot(
      query(collection(db, 'enrollments'), orderBy('enrolledAt', 'desc')),
      (snapshot) => setEnrollments(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))),
      (error) => console.error("Enrollments snapshot error:", error)
    )

    const unsubscribeCourseCategories = onSnapshot(
      collection(db, 'courseCategories'),
      (snapshot) => {
        const cats = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
        cats.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        setCourseCategories(dedupeCourseCategories(cats))
      },
      (error) => console.error("CourseCategories snapshot error:", error)
    )
    // ─────────────────────────────────────────────────────────────

    return () => {
      unsubscribeProjects()
      unsubscribeOrders()
      unsubscribeCategories()
      unsubscribeTasks()
      unsubscribeTeam()
      unsubscribeUsers()
      unsubscribeServices()
      unsubscribeAccountRequests()
      unsubscribeSellRequests()
      unsubscribeServiceRequests()
      unsubscribeMessages()
      unsubscribeCourses()
      unsubscribeSessions()
      unsubscribeEnrollments()
      unsubscribePayments()
      unsubscribeMentorProfile()
      unsubscribePermissions()
      unsubscribeCurriculum()
      unsubscribeCertificates()
      unsubscribeCertificateTemplate()
      unsubscribeAnnouncement()
      unsubscribeGenericCourses()
      unsubscribeGenericEnrollments()
      unsubscribeCourseCategories()
    }
  }, [])


  const addProject = async (project) => {
    try {
      const newProject = {
        ...project,
        slug: project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        sales: 0,
        status: 'active',
        createdAt: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'projects'), newProject)
      return { id: docRef.id, ...newProject }
    } catch (err) { console.error("Error adding project:", err); throw err }
  }

  const updateProject = async (id, updates) => {
    try { await updateDoc(doc(db, 'projects', id), updates) } catch (err) { console.error("Error updating project:", err); throw err }
  }

  const deleteProject = async (id) => {
    try { await deleteDoc(doc(db, 'projects', id)) } catch (err) { console.error('Error deleting project:', err); throw err }
  }

  const addOrder = async (order) => {
    try {
      const newOrder = {
        ...order,
        status: 'pending',
        createdAt: serverTimestamp(),
        date: new Date().toISOString().split('T')[0],
      }
      const docRef = await addDoc(collection(db, 'orders'), newOrder)
      if (order.project_id) {
        const projectRef = doc(db, 'projects', order.project_id)
        const projectSnap = await getDoc(projectRef)
        if (projectSnap.exists()) {
          await updateDoc(projectRef, { sales: (projectSnap.data().sales || 0) + 1 })
        }
      }
      return { id: docRef.id, ...newOrder }
    } catch (err) { console.error("Error adding order:", err); throw err }
  }

  const updateOrderStatus = async (id, status) => {
    try { await updateDoc(doc(db, 'orders', id), { status }) } catch (err) { console.error("Error updating order status:", err); throw err }
  }

  const deleteOrder = async (id) => {
    try { await deleteDoc(doc(db, 'orders', id)) } catch (err) { console.error("Error deleting order:", err); throw err }
  }

  // --- Tasks ---
  const addTask = async (task) => {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), { ...task, createdAt: serverTimestamp() })
      return { id: docRef.id, ...task }
    } catch (err) { console.error("Error adding task:", err); throw err }
  }
  const updateTask = async (id, updates) => {
    try { await updateDoc(doc(db, 'tasks', id), updates) } catch (err) { console.error("Error updating task:", err); throw err }
  }
  const deleteTask = async (id) => {
    try { await deleteDoc(doc(db, 'tasks', id)) } catch (err) { console.error("Error deleting task:", err); throw err }
  }

  // --- Manual Employee Profiles (Team Cards) ---
  const addManualEmployee = async (member) => {
    try {
      const docRef = await addDoc(collection(db, 'employees'), { ...member, createdAt: serverTimestamp() })
      return { id: docRef.id, ...member }
    } catch (err) { console.error("Error adding employee record:", err); throw err }
  }
  const updateManualEmployee = async (id, updates) => {
    try { await updateDoc(doc(db, 'employees', id), updates) } catch (err) { console.error("Error updating employee record:", err); throw err }
  }
  const deleteManualEmployee = async (id) => {
    try { await deleteDoc(doc(db, 'employees', id)) } catch (err) { console.error("Error deleting employee record:", err); throw err }
  }

  // --- Unified Users (Employees) Management ---
  const addUser = async (userData) => {
    try {
      const headers = await getAuthorizedHeaders()
      const response = await fetch(api.adminUsers, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData)
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create the user.')
      }
      return data.user
    } catch (err) { console.error("Error adding user:", err); throw err }
  }
  const updateUser = async (id, updates) => {
    try { 
      const headers = await getAuthorizedHeaders()
      const response = await fetch(`${api.adminUsers}/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update the user.')
      }
      return data.user
    } catch (err) { console.error("Error updating user:", err); throw err }
  }
  const deleteUser = async (id) => {
    try { 
      const headers = await getAuthorizedHeaders()
      const response = await fetch(`${api.adminUsers}/${id}`, {
        method: 'DELETE',
        headers
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete the user.')
      }
      return data.user
    } catch (err) { console.error("Error deleting user:", err); throw err }
  }

  const mergeUsers = async (primaryUserId, duplicateUserId, reason = '') => {
    try {
      const headers = await getAuthorizedHeaders()
      const response = await fetch(api.adminMergeUsers, {
        method: 'POST',
        headers,
        body: JSON.stringify({ primaryUserId, duplicateUserId, reason }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to merge the accounts.')
      }
      return data
    } catch (err) {
      console.error('Error merging users:', err)
      throw err
    }
  }

  // --- Services ---
  const addService = async (service) => {
    try {
      const docRef = await addDoc(collection(db, 'services'), { 
        ...service, 
        createdAt: serverTimestamp() 
      })
      return { id: docRef.id, ...service }
    } catch (err) { console.error("Error adding service:", err); throw err }
  }
  const updateService = async (id, updates) => {
    try { await updateDoc(doc(db, 'services', id), updates) } catch (err) { console.error("Error updating service:", err); throw err }
  }
  const deleteService = async (id) => {
    try { await deleteDoc(doc(db, 'services', id)) } catch (err) { console.error("Error deleting service:", err); throw err }
  }

  const getActiveProjects = () => projects.filter(p => p.status === 'active')
  const getTotalRevenue = () => orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.amount || 0), 0)
  const getPendingOrders = () => orders.filter(o => o.status === 'pending')

  // --- Trading Courses ---
  const addTradingCourse = async (course) => {
    try {
      const docRef = await addDoc(collection(db, 'tradingCourses'), {
        ...course,
        createdAt: serverTimestamp()
      })
      return { id: docRef.id, ...course }
    } catch (err) { console.error("Error adding trading course:", err); throw err }
  }
  const updateTradingCourse = async (id, updates) => {
    try { await updateDoc(doc(db, 'tradingCourses', id), updates) } catch (err) { console.error("Error updating trading course:", err); throw err }
  }
  const deleteTradingCourse = async (id) => {
    try { await deleteDoc(doc(db, 'tradingCourses', id)) } catch (err) { console.error("Error deleting trading course:", err); throw err }
  }

  // --- Trading Sessions ---
  const addTradingSession = async (session) => {
    try {
      const docRef = await addDoc(collection(db, 'tradingSessions'), {
        ...session,
        createdAt: serverTimestamp()
      })
      return { id: docRef.id, ...session }
    } catch (err) { console.error("Error adding trading session:", err); throw err }
  }
  const updateTradingSession = async (id, updates) => {
    try { 
      // If updating isLive to true, use our backend API to trigger notifications
      if (Object.prototype.hasOwnProperty.call(updates, 'isLive')) {
        const response = await fetch(buildApiUrl('/api/trading/toggle-live'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: id, isLive: updates.isLive })
        });
        if (!response.ok) throw new Error("Failed to update status through API");
      } else {
        await updateDoc(doc(db, 'tradingSessions', id), updates);
      }
    } catch (err) { console.error("Error updating trading session:", err); throw err }
  }
  const deleteTradingSession = async (id) => {
    try { await deleteDoc(doc(db, 'tradingSessions', id)) } catch (err) { console.error("Error deleting trading session:", err); throw err }
  }

  // --- Trading Enrollments ---
  const addTradingEnrollment = async (enrollment) => {
    try {
      const newEnrollment = {
        ...enrollment,
        status: enrollment.status || 'pending',
        createdAt: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'tradingEnrollments'), newEnrollment)
      return { id: docRef.id, ...newEnrollment }
    } catch (err) { console.error("Error adding enrollment:", err); throw err }
  }
  const updateTradingEnrollment = async (id, updates) => {
    try { await updateDoc(doc(db, 'tradingEnrollments', id), updates) } catch (err) { console.error("Error updating enrollment:", err); throw err }
  }
  const deleteTradingEnrollment = async (id) => {
    try { await deleteDoc(doc(db, 'tradingEnrollments', id)) } catch (err) { console.error("Error deleting enrollment:", err); throw err }
  }

  // --- Trading Payments ---
  const addTradingPayment = async (payment) => {
    try {
      const docRef = await addDoc(collection(db, 'tradingPayments'), {
        ...payment,
        createdAt: serverTimestamp()
      })
      return { id: docRef.id, ...payment }
    } catch (err) { console.error("Error adding payment:", err); throw err }
  }
  const updateTradingPayment = async (id, updates) => {
    try { await updateDoc(doc(db, 'tradingPayments', id), updates) } catch (err) { console.error("Error updating payment:", err); throw err }
  }
  const deleteTradingPayment = async (id) => {
    try { await deleteDoc(doc(db, 'tradingPayments', id)) } catch (err) { console.error("Error deleting payment:", err); throw err }
  }

  // --- Employee Permissions ---
  const updateEmployeePermissions = async (employeeId, permissions) => {
    try {
      await setDoc(doc(db, 'employeePermissions', employeeId), {
        ...permissions,
        updatedAt: serverTimestamp()
      })
    } catch (err) { console.error("Error updating permissions:", err); throw err }
  }
  const getEmployeePermissions = (employeeId) => {
    return employeePermissions[employeeId] || {}
  }

  // --- Mentor Profile ---
  const updateMentorProfile = async (profileData) => {
    try {
      await setDoc(doc(db, 'tradingSettings', 'mentorProfile'), {
        ...profileData,
        updatedAt: serverTimestamp()
      })
    } catch (err) { console.error("Error updating mentor profile:", err); throw err }
  }

  // --- Trading Curriculum ---
  const addCurriculumModule = async (module) => {
    try {
      const docRef = await addDoc(collection(db, 'tradingCurriculum'), {
        ...module,
        order: tradingCurriculum.length,
        createdAt: serverTimestamp()
      })
      return { id: docRef.id, ...module }
    } catch (err) { console.error("Error adding curriculum module:", err); throw err }
  }
  const updateCurriculumModule = async (id, updates) => {
    try { await updateDoc(doc(db, 'tradingCurriculum', id), updates) } catch (err) { console.error("Error updating curriculum module:", err); throw err }
  }
  const deleteCurriculumModule = async (id) => {
    try { await deleteDoc(doc(db, 'tradingCurriculum', id)) } catch (err) { console.error('Error deleting curriculum module:', err); throw err }
  }
  const seedDefaultCurriculum = async () => {
    if (tradingCurriculum.length > 0) return
    const defaults = [
      { label: 'Market Basics', iconName: 'book', topics: ['What is Stock Market?', 'How Exchanges Work (NSE/BSE)', 'Demat & Trading Accounts', 'Types of Orders', 'Market Participants', 'Bull vs Bear Markets'] },
      { label: 'Technical Analysis', iconName: 'chart', topics: ['Candlestick Patterns', 'Support & Resistance', 'Trendlines & Channels', 'Moving Averages (SMA/EMA)', 'RSI, MACD, Bollinger Bands', 'Volume Analysis'] },
      { label: 'Intraday Trading', iconName: 'bolt', topics: ['Scalping Strategies', 'Opening Range Breakout', 'VWAP Trading', 'Momentum Trading', 'Gap Up/Down Strategies', 'Intraday Stock Selection'] },
      { label: 'Swing & Positional', iconName: 'trending', topics: ['Swing Trading Setups', 'Positional Trade Management', 'Sector Rotation Strategy', 'Earnings Play Strategies', 'Multi-Timeframe Analysis', 'Portfolio Allocation'] },
      { label: 'Risk Management', iconName: 'shield', topics: ['Position Sizing', 'Stop Loss Strategies', 'Risk-Reward Ratio', 'Capital Preservation', 'Drawdown Management', 'Diversification Techniques'] },
      { label: 'Trading Psychology', iconName: 'sparkle', topics: ['Emotional Discipline', 'FOMO & Greed Management', 'Developing a Trading Plan', 'Journaling & Review', 'Patience & Consistency', 'Building Winning Habits'] },
    ]
    for (let i = 0; i < defaults.length; i++) {
      await addDoc(collection(db, 'tradingCurriculum'), { ...defaults[i], order: i, createdAt: serverTimestamp() })
    }
  }

  // --- Certificates ---
  const issueCertificate = async (enrollment, meta = {}) => {
    try {
      const documentType = meta.documentType || 'certificate'
      const courseName = enrollment.courseName || enrollment.courseTitle || enrollment.title || 'Mentorship'
      const existingCertificate = certificates.find(cert =>
        cert.status === 'approved' &&
        (cert.documentType || 'certificate') === documentType &&
        cert.userId === enrollment.userId &&
        (
          cert.enrollmentId === enrollment.id ||
          cert.courseId === enrollment.courseId ||
          cert.courseName === courseName
        )
      )

      if (existingCertificate) return existingCertificate

      const activeTemplate = mergeCertificateTemplate(certificateTemplate, documentType)
      const prefix = String(activeTemplate?.certificatePrefix || 'AP')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6) || 'AP'

      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let result = ''
      for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      const certId = `${prefix}-${result}`
      const templateSnapshot = activeTemplate

      const newCert = {
        userId: enrollment.userId,
        userName: enrollment.userName,
        userEmail: enrollment.userEmail,
        courseId: enrollment.courseId || '',
        enrollmentId: enrollment.id || '',
        courseName,
        documentType,
        documentLabel: activeTemplate.documentLabel,
        internshipRole: meta.internshipRole || enrollment.planLabel || courseName,
        internshipDuration: meta.internshipDuration || enrollment.planLabel || '',
        joiningDate: meta.joiningDate || '',
        status: 'approved',
        certificate_id: certId,
        issuedByUid: meta.issuedByUid || '',
        issuedByName: meta.issuedByName || '',
        issuedByRole: meta.issuedByRole || '',
        templateSnapshot,
        approval_date: serverTimestamp(),
        createdAt: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'certificates'), newCert)
      // ✉️ Email issued document to student
      emailNotify('certificate_issued', {
        studentName: enrollment.userName,
        studentEmail: enrollment.userEmail,
        courseName,
        certId,
        documentType,
        documentLabel: activeTemplate.documentLabel,
      })
      return { id: docRef.id, ...newCert }
    } catch (err) { console.error("Error issuing certificate:", err); throw err }
  }

  const revokeCertificate = async (certId) => {
    try {
      await deleteDoc(doc(db, 'certificates', certId))
    } catch (err) { console.error("Error revoking certificate:", err); throw err }
  }

  const createQrCertificate = async (payload) => {
    try {
      const headers = await getAuthorizedHeaders()
      const response = await fetch(api.adminQrCertificates, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create QR certificate.')
      }
      return data.certificate
    } catch (err) { console.error("Error creating QR certificate:", err); throw err }
  }

  const updateQrCertificate = async (id, payload) => {
    try {
      const headers = await getAuthorizedHeaders()
      const response = await fetch(api.adminQrCertificate(id), {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update QR certificate.')
      }
      return data.certificate
    } catch (err) { console.error("Error updating QR certificate:", err); throw err }
  }

  const toggleQrCertificateStatus = async (id, status) => {
    try {
      const headers = await getAuthorizedHeaders()
      const response = await fetch(api.adminQrCertificateStatus(id), {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update QR certificate status.')
      }
      return data.certificate
    } catch (err) { console.error("Error toggling QR certificate status:", err); throw err }
  }

  const deleteQrCertificate = async (id) => {
    try {
      const headers = await getAuthorizedHeaders()
      const response = await fetch(api.adminQrCertificate(id), {
        method: 'DELETE',
        headers
      })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete QR certificate.')
      }
      return data.certificate
    } catch (err) { console.error("Error deleting QR certificate:", err); throw err }
  }

  const updateCertificateTemplate = async (data) => {
    try {
      await setDoc(doc(db, 'settings', 'certificateTemplate'), {
        ...normalizeCertificateTemplate(data),
        updatedAt: serverTimestamp()
      })
    } catch (err) { console.error("Error updating certificate template:", err); throw err }
  }

  // --- Announcement ---
  const updateAnnouncement = async (data) => {
    try {
      await setDoc(doc(db, 'settings', 'announcement'), {
        ...data,
        updatedAt: serverTimestamp()
      })
    } catch (err) { console.error("Error updating announcement:", err); throw err }
  }

  // ══════════════════════════════════════════════════════════════
  // GENERIC COURSE SYSTEM — Phase 1
  // ══════════════════════════════════════════════════════════════

  // Slug generator
  const generateSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

  // --- Courses CRUD ---
  const addCourse = async (courseData) => {
    try {
      const slug = courseData.slug || generateSlug(courseData.title)
      const payload = {
        ...courseData,
        deliveryType: normalizeLearningType(courseData),
        enrollmentDeadline: normalizeEnrollmentDeadline(courseData.enrollmentDeadline),
        slug,
        published: courseData.published ?? false,
        availableSoon: courseData.availableSoon ?? false,
        highlighted: courseData.highlighted ?? false,
        enrolledCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'courses'), payload)
      return { id: docRef.id, ...payload }
    } catch (err) { console.error('Error adding course:', err); throw err }
  }

  const updateCourse = async (id, updates) => {
    try {
      await updateDoc(doc(db, 'courses', id), {
        ...updates,
        enrollmentDeadline: normalizeEnrollmentDeadline(updates.enrollmentDeadline),
        updatedAt: serverTimestamp()
      })
    } catch (err) { console.error('Error updating course:', err); throw err }
  }

  const deleteCourse = async (id) => {
    try { await deleteDoc(doc(db, 'courses', id)) }
    catch (err) { console.error('Error deleting course:', err); throw err }
  }

  // --- Enrollments CRUD ---
  const addEnrollment = async (enrollmentData) => {
    try {
      const assignedEmployee = users.find(u =>
        [u.uid, u.id, u.employeeId, u.email].filter(Boolean).includes(enrollmentData.assignedEmployeeId)
      )
      const recipientId = assignedEmployee?.uid || enrollmentData.assignedEmployeeId || ''
      const enrolledCourse = courses.find(course =>
        course.id === enrollmentData.courseId ||
        normalizeMatchKey(course.title) === normalizeMatchKey(enrollmentData.courseTitle)
      ) || null
      const enrollmentSource = enrolledCourse || enrollmentData
      if (isEnrollmentClosed(enrollmentSource)) {
        throw new Error('Enrollment for this program has closed.')
      }
      const enrolledPlan = resolveEnrollmentMeetingPlan(enrolledCourse, enrollmentData)
      const hasScheduledMeeting =
        enrolledPlan?.meetingStartsAt &&
        isUpcomingScheduledMeeting(enrolledPlan.meetingStartsAt)
      const scheduledMeetingTime = hasScheduledMeeting
        ? formatScheduledMeetingTime(enrolledPlan.meetingStartsAt, enrolledPlan.meetingTimezone)
        : ''
      const scheduledJoinUrl = resolveCoursePlanMeetingLink(enrolledCourse, enrolledPlan)

      // ✅ Duplicate guard at Firestore level
      const existing = enrollments.find(
        e => e.userId === enrollmentData.userId &&
             e.courseId === enrollmentData.courseId &&
             e.status === 'active' &&
             matchesEnrollmentPlan(e, enrollmentData)
      )
      if (existing) return existing // Already enrolled — return silently

      const payload = {
        ...enrollmentData,
        assignedEmployeeId: recipientId,
        assignedEmployeeRef: enrollmentData.assignedEmployeeId || recipientId,
        status: 'active',
        enrolledAt: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'enrollments'), payload)

      // Increment enrolledCount on the course
      const courseRef = doc(db, 'courses', enrollmentData.courseId)
      const courseSnap = await getDoc(courseRef)
      if (courseSnap.exists()) {
        await updateDoc(courseRef, { enrolledCount: (courseSnap.data().enrolledCount || 0) + 1 })
      }

      // ── Notify assigned employee ────────────────────────────────
      if (recipientId) {
        await addDoc(collection(db, 'notifications'), {
          enrollmentId: docRef.id,
          notificationKey: `enrollment:${docRef.id}`,
          recipientId,
          recipientEmployeeId: assignedEmployee?.employeeId || '',
          assignedEmployeeRef: enrollmentData.assignedEmployeeId || recipientId,
          type: 'new_enrollment',
          title: 'New Student Enrolled!',
          message: `${enrollmentData.userName || enrollmentData.userEmail} enrolled in "${enrollmentData.courseTitle}"`,
          courseId: enrollmentData.courseId,
          courseTitle: enrollmentData.courseTitle,
          studentName: enrollmentData.userName || enrollmentData.userEmail,
          studentEmail: enrollmentData.userEmail,
          studentMobile: enrollmentData.userMobile || '',
          planLabel: enrollmentData.planLabel || '',
          amount: enrollmentData.amount || 0,
          read: false,
          createdAt: serverTimestamp()
        })

        // ✉️ Email to employee
        if (assignedEmployee?.email) {
          emailNotify('enrollment_employee', {
            employeeEmail: assignedEmployee.email,
            employeeName: assignedEmployee.displayName || assignedEmployee.name || assignedEmployee.email,
            studentName: enrollmentData.userName || enrollmentData.userEmail,
            studentEmail: enrollmentData.userEmail,
            studentMobile: enrollmentData.userMobile || '',
            courseTitle: enrollmentData.courseTitle,
            planLabel: enrollmentData.planLabel || '',
            amount: enrollmentData.amount || 0
          })
        }
      }

      // ✉️ Email to student
      emailNotify('enrollment_student', {
        studentName: enrollmentData.userName || enrollmentData.userEmail,
        studentEmail: enrollmentData.userEmail,
        courseTitle: enrollmentData.courseTitle,
        planLabel: enrollmentData.planLabel || '',
        amount: enrollmentData.amount || 0
      })

      if (hasScheduledMeeting) {
        emailNotify('course_meeting_scheduled', {
          studentName: enrollmentData.userName || enrollmentData.userEmail,
          studentEmail: enrollmentData.userEmail,
          courseTitle: enrollmentData.courseTitle,
          planLabel: enrolledPlan?.label || enrollmentData.planLabel || enrollmentData.planName || '',
          meetingTime: scheduledMeetingTime,
          meetingLink: scheduledJoinUrl,
          employeeName:
            enrolledCourse?.instructor ||
            assignedEmployee?.displayName ||
            assignedEmployee?.name ||
            '',
          reason: 'new_enrollment',
        })
      }
      // ────────────────────────────────────────────────────────────

      return { id: docRef.id, ...payload }
    } catch (err) { console.error('Error adding enrollment:', err); throw err }
  }


  const updateEnrollment = async (id, updates) => {
    try { await updateDoc(doc(db, 'enrollments', id), updates) }
    catch (err) { console.error('Error updating enrollment:', err); throw err }
  }

  const deleteEnrollment = async (id) => {
    try { await deleteDoc(doc(db, 'enrollments', id)) }
    catch (err) { console.error('Error deleting enrollment:', err); throw err }
  }

  // Get all enrollments for a specific user
  const getUserEnrollments = (uid) =>
    enrollments.filter(e => e.userId === uid && e.status === 'active')

  // Check if a user is enrolled in a specific course
  const isUserEnrolled = (uid, courseId, planRef = null) =>
    enrollments.some(e =>
      e.userId === uid &&
      e.courseId === courseId &&
      e.status === 'active' &&
      matchesEnrollmentPlan(e, planRef)
    )

  // --- Course Categories CRUD ---
  const addCourseCategory = async (data) => {
    try {
      const normalizedName = normalizeCourseCategoryName(data?.name)
      if (!normalizedName) {
        throw new Error('Category name is required.')
      }
      const alreadyExists = courseCategories.some(category =>
        normalizeCourseCategoryName(category.name) === normalizedName
      )
      if (alreadyExists) {
        throw new Error('A category with this name already exists.')
      }
      const payload = { ...data, order: courseCategories.length, createdAt: serverTimestamp() }
      const docRef = await addDoc(collection(db, 'courseCategories'), payload)
      return { id: docRef.id, ...payload }
    } catch (err) { console.error('Error adding category:', err); throw err }
  }

  const updateCourseCategory = async (id, updates) => {
    try {
      const normalizedName = normalizeCourseCategoryName(updates?.name)
      if (!normalizedName) {
        throw new Error('Category name is required.')
      }
      const alreadyExists = courseCategories.some(category =>
        category.id !== id &&
        normalizeCourseCategoryName(category.name) === normalizedName
      )
      if (alreadyExists) {
        throw new Error('A category with this name already exists.')
      }
      await updateDoc(doc(db, 'courseCategories', id), updates)
    }
    catch (err) { console.error('Error updating category:', err); throw err }
  }

  const deleteCourseCategory = async (id) => {
    try { await deleteDoc(doc(db, 'courseCategories', id)) }
    catch (err) { console.error('Error deleting category:', err); throw err }
  }

  // Seed default categories if none exist
  const seedCourseCategories = async () => {
    const existingSnapshot = await getDocs(collection(db, 'courseCategories'))
    const existingNames = new Set(
      existingSnapshot.docs.map(docSnap => normalizeCourseCategoryName(docSnap.data()?.name))
    )
    const defaults = [
      { name: 'Trading',           icon: 'TrendingUp', color: '#10b981', order: 0 },
      { name: 'Web Development',   icon: 'Laptop', color: '#3b82f6', order: 1 },
      { name: 'Python',            icon: 'Code', color: '#f59e0b', order: 2 },
      { name: 'Digital Marketing', icon: 'Megaphone', color: '#ec4899', order: 3 },
      { name: 'Graphic Design',    icon: 'Palette', color: '#8b5cf6', order: 4 },
      { name: 'Excel / Data',      icon: 'BarChart', color: '#06b6d4', order: 5 },
      { name: 'Other',             icon: 'BookOpen', color: '#6b7280', order: 6 },
    ]
    for (const cat of defaults) {
      const normalizedName = normalizeCourseCategoryName(cat.name)
      if (existingNames.has(normalizedName)) continue
      await addDoc(collection(db, 'courseCategories'), { ...cat, createdAt: serverTimestamp() })
      existingNames.add(normalizedName)
    }
  }
  // ══════════════════════════════════════════════════════════════

  // --- Administrative Collections CRUD ---
  const deleteAdminMessage = async (id) => {
    try { await deleteDoc(doc(db, 'messages', id)) } catch (err) { console.error("Error deleting message:", err); throw err }
  }
  const updateMessageStatus = async (id, updates) => {
    try { await updateDoc(doc(db, 'messages', id), updates) } catch (err) { console.error("Error updating message:", err); throw err }
  }
  const deleteServiceRequest = async (id) => {
    try { await deleteDoc(doc(db, 'custom_requests', id)) } catch (err) { console.error("Error deleting service request:", err); throw err }
  }
  const updateServiceRequestStatus = async (id, status) => {
    try { await updateDoc(doc(db, 'custom_requests', id), { status, processedAt: serverTimestamp() }) } catch (err) { console.error("Error updating service request status:", err); throw err }
  }
  const deleteAccountRequest = async (id) => {
    try {
      const headers = await getAuthorizedHeaders()
      const response = await fetch(api.adminDeleteAccountRequest(id), {
        method: 'DELETE',
        headers
      })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete account request.')
      return data.request
    } catch (err) { console.error("Error deleting account request:", err); throw err }
  }
  const rejectAccountRequest = async (id) => {
    try {
      const headers = await getAuthorizedHeaders()
      const response = await fetch(api.adminRejectAccountRequest(id), {
        method: 'POST',
        headers
      })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to reject account request.')
      return data.request
    } catch (err) { console.error("Error rejecting account request:", err); throw err }
  }
  const deleteSellRequest = async (id) => {
    try { await deleteDoc(doc(db, 'sellRequests', id)) } catch (err) { console.error("Error deleting sell request:", err); throw err }
  }
  const approveSellRequest = async (id) => {
    try { await updateDoc(doc(db, 'sellRequests', id), { status: 'approved', approvedAt: serverTimestamp() }) } catch (err) { console.error("Error approving sell request:", err); throw err }
  }
  const rejectSellRequest = async (id) => {
    try { await updateDoc(doc(db, 'sellRequests', id), { status: 'rejected', rejectedAt: serverTimestamp() }) } catch (err) { console.error("Error rejecting sell request:", err); throw err }
  }

  const value = {
    projects, categories, orders, tasks, manualEmployees, teamMembers: manualEmployees, users,
    addProject, updateProject, deleteProject,
    addOrder, updateOrderStatus, deleteOrder,
    addTask, updateTask, deleteTask,
    addManualEmployee, addTeamMember: addManualEmployee,
    updateManualEmployee, updateTeamMember: updateManualEmployee,
    deleteManualEmployee, deleteTeamMember: deleteManualEmployee,
    addUser, updateUser, deleteUser, mergeUsers,
    services, addService, updateService, deleteService,
    accountRequests, sellRequests, serviceRequests, messages,
    deleteAdminMessage, updateMessageStatus,
    deleteServiceRequest, updateServiceRequestStatus,
    deleteAccountRequest, rejectAccountRequest,
    deleteSellRequest, approveSellRequest, rejectSellRequest,
    tradingCourses, addTradingCourse, updateTradingCourse, deleteTradingCourse,
    tradingSessions, addTradingSession, updateTradingSession, deleteTradingSession,
    tradingEnrollments, addTradingEnrollment, updateTradingEnrollment, deleteTradingEnrollment,
    tradingPayments, addTradingPayment, updateTradingPayment, deleteTradingPayment,
    employeePermissions, updateEmployeePermissions, getEmployeePermissions,
    mentorProfile, updateMentorProfile,
    tradingCurriculum, addCurriculumModule, updateCurriculumModule, deleteCurriculumModule, seedDefaultCurriculum,
    certificates, qrCertificates, certificateTemplate, issueCertificate, revokeCertificate,
    createQrCertificate, updateQrCertificate, toggleQrCertificateStatus, deleteQrCertificate, updateCertificateTemplate,
    getActiveProjects, getTotalRevenue, getPendingOrders,
    announcement, updateAnnouncement,
    // ── Generic Course System ──
    courses, addCourse, updateCourse, deleteCourse,
    enrollments, addEnrollment, updateEnrollment, deleteEnrollment,
    getUserEnrollments, isUserEnrolled,
    courseCategories, addCourseCategory, updateCourseCategory, deleteCourseCategory,
    seedCourseCategories,
    // ──────────────────────────
    loading
  }

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within StoreProvider')
  return context
}
