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

const defaultProjects = [
  {
    title: 'Portfolio Website', slug: 'portfolio-website',
    description: 'A modern, responsive portfolio website with dark mode and smooth animations.',
    long_description: 'A fully responsive portfolio website built with React and Tailwind CSS. Features include dark mode toggle, smooth scroll animations, project showcase section, contact form integration, and SEO optimization.',
    image_url: null, demo_url: '#', category_id: 1, category_name: 'Basic', category_slug: 'basic',
    price_project_only: 499, price_with_source: 999,
    features: JSON.stringify(["Responsive Design", "Dark Mode", "Contact Form", "SEO Optimized", "Smooth Animations"]),
    tech_stack: JSON.stringify(["React", "Tailwind CSS", "Vite"]), is_featured: true, status: 'active', sales: 12
  },
  {
    title: 'E-Commerce Dashboard', slug: 'ecommerce-dashboard',
    description: 'Admin dashboard for managing products, orders, and customers.',
    long_description: 'A comprehensive e-commerce admin dashboard with real-time analytics, product management, order tracking, customer management, and inventory control.',
    image_url: null, demo_url: '#', category_id: 2, category_name: 'Medium', category_slug: 'medium',
    price_project_only: 1499, price_with_source: 2999,
    features: JSON.stringify(["Real-time Analytics", "Product Management", "Order Tracking", "Customer Management", "Role-based Auth"]),
    tech_stack: JSON.stringify(["React", "Node.js", "MySQL", "Chart.js", "Tailwind CSS"]), is_featured: true, status: 'active', sales: 8
  },
  {
    title: 'Full Stack Blog Platform', slug: 'fullstack-blog-platform',
    description: 'Complete blog platform with CMS, comments, and user authentication.',
    long_description: 'A full-featured blog platform with a custom CMS, markdown editor, user authentication, comment system, categories, tags, search functionality, and social sharing.',
    image_url: null, demo_url: '#', category_id: 3, category_name: 'Premium', category_slug: 'premium',
    price_project_only: 2499, price_with_source: 4999,
    features: JSON.stringify(["Custom CMS", "Markdown Editor", "User Auth", "Comment System", "Search", "Social Sharing"]),
    tech_stack: JSON.stringify(["React", "Node.js", "Express", "MongoDB", "Tailwind CSS"]), is_featured: true, status: 'active', sales: 5
  }
]

const defaultCategories = [
  { id: 1, name: 'Web Development', icon: '🌐' },
  { id: 2, name: 'Mobile App', icon: '📱' },
  { id: 3, name: 'UI/UX Design', icon: '🎨' },
  { id: 4, name: 'Desktop App', icon: '💻' },
  { id: 5, name: 'Cloud Services', icon: '☁️' }
]

const defaultTasks = [
  { id: 1, title: 'Design database schema', project: 'E-Commerce Platform', assignee: 'R', priority: 'High', dueDate: 'Apr 2', status: 'done' },
  { id: 2, title: 'Implement user authentication', project: 'E-Commerce Platform', assignee: 'A', priority: 'High', dueDate: 'Apr 5', status: 'done' },
  { id: 3, title: 'Build product catalog API', project: 'E-Commerce Platform', assignee: 'P', priority: 'High', dueDate: 'Apr 8', status: 'review' },
  { id: 4, title: 'Create shopping cart component', project: 'E-Commerce Platform', assignee: 'R', priority: 'Medium', dueDate: 'Apr 10', status: 'in-progress' },
  { id: 5, title: 'Integrate payment gateway', project: 'E-Commerce Platform', assignee: 'A', priority: 'High', dueDate: 'Apr 12', status: 'todo' },
]

const defaultTeam = [
  { id: 1, name: 'Rahul Sharma', role: 'Senior Full Stack Developer', email: 'rahul@solutionhub.com', department: 'Engineering', status: 'Active', tasksCompleted: 128, projectsActive: 3, avatar: 'R', joinDate: 'Jan 2024', skills: ['React', 'Node.js', 'MongoDB', 'AWS'], performance: 92 },
  { id: 2, name: 'Priya Patel', role: 'UI/UX Designer', email: 'priya@solutionhub.com', department: 'Design', status: 'Active', tasksCompleted: 95, projectsActive: 2, avatar: 'P', joinDate: 'Mar 2024', skills: ['Figma', 'Adobe XD', 'CSS', 'Prototyping'], performance: 88 },
]

// Note: These will be used to seed 'users' collection if empty
const defaultUsers = [
  { uid: 'rahul-uid', displayName: 'Rahul Sharma', email: 'rahul@solutionhub.com', phone: '+91 98765 43210', role: 'employee', jobTitle: 'Senior Developer', department: 'Engineering', status: 'active', avatar: 'R', createdAt: new Date().toISOString() },
  { uid: 'priya-uid', displayName: 'Priya Patel', email: 'priya@solutionhub.com', phone: '+91 98765 43211', role: 'employee', jobTitle: 'UI/UX Designer', department: 'Design', status: 'active', avatar: 'P', createdAt: new Date().toISOString() },
  { uid: 'admin-uid', displayName: 'Admin', email: 'admin@solutionhub.com', role: 'admin', status: 'active', avatar: 'A', createdAt: new Date().toISOString() },
]

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
    let isInitialLoad = true

    const qProjects = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setProjects(projectsData)
      
      if (isInitialLoad && projectsData.length === 0) {
        seedInitialData()
      }
      isInitialLoad = false
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

  const seedInitialData = async () => {
    if (window._seedingInProgress) return
    window._seedingInProgress = true

    try {
      // Seed categories
      const catSnap = await getDocs(collection(db, 'categories'))
      if (catSnap.empty) {
        for (const cat of defaultCategories) {
          await addDoc(collection(db, 'categories'), { ...cat, createdAt: serverTimestamp() })
        }
      }

      // Seed tasks
      const tasksSnap = await getDocs(collection(db, 'tasks'))
      if (tasksSnap.empty) {
        for (const task of defaultTasks) {
          await addDoc(collection(db, 'tasks'), { ...task, createdAt: serverTimestamp() })
        }
      }

      // Seed team members
      const teamSnap = await getDocs(collection(db, 'team'))
      if (teamSnap.empty) {
        for (const member of defaultTeam) {
          await addDoc(collection(db, 'team'), { ...member, createdAt: serverTimestamp() })
        }
      }

      // Seed core users (if empty)
      const usersSnap = await getDocs(collection(db, 'users'))
      if (usersSnap.empty) {
        for (const user of defaultUsers) {
          await setDoc(doc(db, 'users', user.uid), { ...user, serverCreatedAt: serverTimestamp() })
        }
      }

      // Seed projects
      const projSnap = await getDocs(collection(db, 'projects'))
      if (projSnap.empty) {
        for (const project of defaultProjects) {
          await addDoc(collection(db, 'projects'), { 
            ...project, 
            createdAt: serverTimestamp(),
            slug: project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          })
        }
      }
    } catch (err) {
      console.error('Error during seeding:', err)
    } finally {
      window._seedingInProgress = false
    }
  }

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
