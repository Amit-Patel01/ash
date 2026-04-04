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
import { db } from '../config/firebase'
import LoadingScreen from '../components/LoadingScreen'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [tasks, setTasks] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
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
  const [loading, setLoading] = useState(true)

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

    const unsubscribeTeam = onSnapshot(collection(db, 'team'), (snapshot) => {
      setTeamMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
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

  // --- Team Members ---
  const addTeamMember = async (member) => {
    try {
      const docRef = await addDoc(collection(db, 'team'), { ...member, createdAt: serverTimestamp() })
      return { id: docRef.id, ...member }
    } catch (err) { console.error("Error adding team member:", err); throw err }
  }
  const updateTeamMember = async (id, updates) => {
    try { await updateDoc(doc(db, 'team', id), updates) } catch (err) { console.error("Error updating team member:", err); throw err }
  }
  const deleteTeamMember = async (id) => {
    try { await deleteDoc(doc(db, 'team', id)) } catch (err) { console.error("Error deleting team member:", err); throw err }
  }

  // --- Unified Users (Employees) Management ---
  const addUser = async (userData) => {
    try {
      // If no UID is provided, generate a random doc ID (usually handled by Auth, but allowed for seeding/admin)
      const usersRef = collection(db, 'users')
      if (userData.uid) {
        await setDoc(doc(db, 'users', userData.uid), { ...userData, createdAt: serverTimestamp() })
        return userData
      } else {
        const docRef = await addDoc(usersRef, { ...userData, createdAt: serverTimestamp() })
        return { id: docRef.id, ...userData }
      }
    } catch (err) { console.error("Error adding user:", err); throw err }
  }
  const updateUser = async (id, updates) => {
    try { await updateDoc(doc(db, 'users', id), updates) } catch (err) { console.error("Error updating user:", err); throw err }
  }
  const deleteUser = async (id) => {
    try { await deleteDoc(doc(db, 'users', id)) } catch (err) { console.error("Error deleting user:", err); throw err }
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
    try { await updateDoc(doc(db, 'tradingSessions', id), updates) } catch (err) { console.error("Error updating trading session:", err); throw err }
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
  const issueCertificate = async (enrollment) => {
    try {
      // Generate a unique ID AP-XXXXXXXX
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let result = ''
      for (let i = 0; i < 8; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      const certId = `AP-${result}`

      const newCert = {
        userId: enrollment.userId,
        userName: enrollment.userName,
        userEmail: enrollment.userEmail,
        courseName: enrollment.courseName || enrollment.title || 'Mentorship',
        status: 'approved',
        certificate_id: certId,
        approval_date: serverTimestamp(),
        createdAt: serverTimestamp()
      }
      const docRef = await addDoc(collection(db, 'certificates'), newCert)
      return { id: docRef.id, ...newCert }
    } catch (err) { console.error("Error issuing certificate:", err); throw err }
  }

  const revokeCertificate = async (certId) => {
    try {
      await deleteDoc(doc(db, 'certificates', certId))
    } catch (err) { console.error("Error revoking certificate:", err); throw err }
  }

  const value = {
    projects, categories, orders, tasks, teamMembers, users,
    addProject, updateProject, deleteProject,
    addOrder, updateOrderStatus, deleteOrder,
    addTask, updateTask, deleteTask,
    addTeamMember, updateTeamMember, deleteTeamMember,
    addUser, updateUser, deleteUser,
    services, addService, updateService, deleteService,
    accountRequests, sellRequests, serviceRequests, messages,
    tradingCourses, addTradingCourse, updateTradingCourse, deleteTradingCourse,
    tradingSessions, addTradingSession, updateTradingSession, deleteTradingSession,
    tradingEnrollments, addTradingEnrollment, updateTradingEnrollment, deleteTradingEnrollment,
    tradingPayments, addTradingPayment, updateTradingPayment, deleteTradingPayment,
    employeePermissions, updateEmployeePermissions, getEmployeePermissions,
    mentorProfile, updateMentorProfile,
    tradingCurriculum, addCurriculumModule, updateCurriculumModule, deleteCurriculumModule, seedDefaultCurriculum,
    certificates, issueCertificate, revokeCertificate,
    getActiveProjects, getTotalRevenue, getPendingOrders,
    loading
  }

  return (
    <StoreContext.Provider value={value}>
      {loading ? <LoadingScreen /> : children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within StoreProvider')
  return context
}
