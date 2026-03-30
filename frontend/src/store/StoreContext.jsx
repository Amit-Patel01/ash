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

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [orders, setOrders] = useState([])
  const [tasks, setTasks] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [users, setUsers] = useState([]) // Unified Users state
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

    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Orders snapshot error:", error))

    const unsubscribeCategories = onSnapshot(query(collection(db, 'categories')), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Categories snapshot error:", error))

    const unsubscribeTasks = onSnapshot(query(collection(db, 'tasks'), orderBy('createdAt', 'desc')), (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Tasks snapshot error:", error))

    const unsubscribeTeam = onSnapshot(query(collection(db, 'team'), orderBy('createdAt', 'desc')), (snapshot) => {
      setTeamMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    }, (error) => console.error("Team snapshot error:", error))

    // Unified Users Listener
    const unsubscribeUsers = onSnapshot(query(collection(db, 'users'), orderBy('createdAt', 'desc')), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })))
    }, (error) => console.error("Users snapshot error:", error))

    return () => {
      unsubscribeProjects()
      unsubscribeOrders()
      unsubscribeCategories()
      unsubscribeTasks()
      unsubscribeTeam()
      unsubscribeUsers()
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

  const getActiveProjects = () => projects.filter(p => p.status === 'active')
  const getTotalRevenue = () => orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.amount || 0), 0)
  const getPendingOrders = () => orders.filter(o => o.status === 'pending')

  return (
    <StoreContext.Provider value={{
      projects, categories, orders, tasks, teamMembers, users,
      addProject, updateProject, deleteProject,
      addOrder, updateOrderStatus, deleteOrder,
      addTask, updateTask, deleteTask,
      addTeamMember, updateTeamMember, deleteTeamMember,
      addUser, updateUser, deleteUser,
      getActiveProjects, getTotalRevenue, getPendingOrders,
      loading
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within StoreProvider')
  return context
}
