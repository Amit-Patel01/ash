import { createContext, useContext, useState, useEffect } from 'react'
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
  const [users, setUsers] = useState([]) 
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
  const [maintenance, setMaintenance] = useState(null)
  const [homepageStats, setHomepageStats] = useState(null)
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [courseCategories, setCourseCategories] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [internshipCategories, setInternshipCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const qrCertificates = certificates.filter(certificate => certificate.source === 'qr')

  const getRequestHeaders = () => {
    const token = localStorage.getItem('token')
    const headers = { 'Content-Type': 'application/json' }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return headers
  }

  const getAuthorizedHeaders = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Please sign in again to continue.')
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }

  const PROTECTED_COLLECTIONS = new Set([
    'orders', 'tasks', 'users', 'employees', 'accountRequests', 'sellRequests',
    'custom_requests', 'messages', 'enrollments', 'payments', 'employeePermissions', 'coupons'
  ]);

  const fetchCollection = async (collectionName, params = {}) => {
    const token = localStorage.getItem('token');
    if (PROTECTED_COLLECTIONS.has(collectionName) && !token) {
      return [];
    }
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${api.base}/api/db/${collectionName}${queryParams ? '?' + queryParams : ''}`;
      const headers = getRequestHeaders();
      const res = await fetch(url, { headers });
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return data.documents || [];
    } catch (err) {
      return [];
    }
  };

  const fetchDocument = async (collectionName, docId) => {
    try {
      const url = `${api.base}/api/db/${collectionName}/${docId}`;
      const headers = getRequestHeaders();
      const res = await fetch(url, { headers });
      if (!res.ok) {
        return null;
      }
      const data = await res.json();
      return data.document || null;
    } catch (err) {
      return null;
    }
  };


  const loadProjects = async () => {
    const data = await fetchCollection('projects');
    setProjects(data);
  };
  const loadCategories = async () => {
    const data = await fetchCollection('categories');
    setCategories(data);
  };
  const loadOrders = async () => {
    const data = await fetchCollection('orders');
    setOrders(data);
  };
  const loadTasks = async () => {
    const data = await fetchCollection('tasks');
    setTasks(data);
  };
  const loadManualEmployees = async () => {
    const data = await fetchCollection('employees');
    setManualEmployees(data);
  };
  const loadUsers = async () => {
    const data = await fetchCollection('users');
    setUsers(data);
  };
  const loadServices = async () => {
    const data = await fetchCollection('services');
    setServices(data);
  };
  const loadAccountRequests = async () => {
    const data = await fetchCollection('accountRequests');
    setAccountRequests(data);
  };
  const loadSellRequests = async () => {
    const data = await fetchCollection('sellRequests');
    setSellRequests(data);
  };
  const loadServiceRequests = async () => {
    const data = await fetchCollection('custom_requests');
    setServiceRequests(data);
  };
  const loadMessages = async () => {
    const data = await fetchCollection('messages');
    setMessages(data);
  };
  const loadTradingCourses = async () => {
    const data = await fetchCollection('tradingCourses');
    setTradingCourses(data);
  };
  const loadTradingSessions = async () => {
    const data = await fetchCollection('sessions');
    setTradingSessions(data);
  };
  const loadTradingEnrollments = async () => {
    const data = await fetchCollection('enrollments');
    setTradingEnrollments(data);
  };
  const loadTradingPayments = async () => {
    const data = await fetchCollection('payments');
    setTradingPayments(data);
  };
  const loadMentorProfile = async () => {
    const doc = await fetchDocument('tradingSettings', 'mentorProfile');
    if (doc) setMentorProfile(doc);
  };
  const loadEmployeePermissions = async () => {
    const data = await fetchCollection('employeePermissions');
    const perms = {};
    data.forEach(d => {
      perms[d.id] = d;
    });
    setEmployeePermissions(perms);
  };
  const loadTradingCurriculum = async () => {
    const data = await fetchCollection('tradingCurriculum');
    data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setTradingCurriculum(data);
  };
  const loadCertificates = async () => {
    const data = await fetchCollection('certificates');
    setCertificates(data);
  };
  const loadCertificateTemplate = async () => {
    const doc = await fetchDocument('settings', 'certificateTemplate');
    if (doc) {
      setCertificateTemplate(normalizeCertificateTemplate(doc));
    } else {
      setCertificateTemplate(DEFAULT_CERTIFICATE_TEMPLATE);
    }
  };
  const loadAnnouncement = async () => {
    const doc = await fetchDocument('settings', 'announcement');
    if (doc) setAnnouncement(doc);
  };
  const loadMaintenance = async () => {
    const doc = await fetchDocument('settings', 'maintenance');
    if (doc) {
      const isDev = import.meta.env.DEV;
      setMaintenance({
        id: doc.id,
        isActive: isDev ? !!doc.isActiveDev : !!doc.isActive,
        message: doc.message || '',
        ...doc
      });
    }
  };
  const loadHomepageStats = async () => {
    const doc = await fetchDocument('settings', 'homepageStats');
    if (doc) setHomepageStats(doc);
  };
  const loadGenericCourses = async () => {
    const data = await fetchCollection('courses');
    setCourses(data.map(d => ({
      ...d,
      enrollmentDeadline: normalizeEnrollmentDeadline(d.enrollmentDeadline),
    })));
  };
  const loadGenericEnrollments = async () => {
    const data = await fetchCollection('enrollments');
    setEnrollments(data);
  };
  const loadCourseCategories = async () => {
    const data = await fetchCollection('courseCategories');
    data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setCourseCategories(dedupeCourseCategories(data));
  };
  const loadTestimonials = async () => {
    const data = await fetchCollection('testimonials');
    setTestimonials(data);
  };
  const loadInternshipCategories = async () => {
    const data = await fetchCollection('internshipCategories');
    data.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setInternshipCategories(data);
  };

  useEffect(() => {
    let isMounted = true;

    const loadAllData = async () => {
      const token = localStorage.getItem('token');
      const publicLoads = [
        loadProjects(),
        loadCategories(),
        loadServices(),
        loadTradingCourses(),
        loadTradingSessions(),
        loadMentorProfile(),
        loadTradingCurriculum(),
        loadCertificates(),
        loadCertificateTemplate(),
        loadAnnouncement(),
        loadMaintenance(),
        loadHomepageStats(),
        loadGenericCourses(),
        loadCourseCategories(),
        loadTestimonials(),
        loadInternshipCategories()
      ];

      const protectedLoads = token ? [
        loadOrders(),
        loadTasks(),
        loadManualEmployees(),
        loadUsers(),
        loadAccountRequests(),
        loadSellRequests(),
        loadServiceRequests(),
        loadMessages(),
        loadTradingEnrollments(),
        loadTradingPayments(),
        loadEmployeePermissions(),
        loadGenericEnrollments()
      ] : [];

      await Promise.all([...publicLoads, ...protectedLoads]);
      if (isMounted) {
        setLoading(false);
      }
    };


    loadAllData();

    const fastPoll = setInterval(() => {
      const token = localStorage.getItem('token');
      if (token) {
        loadOrders();
        loadTasks();
        loadAccountRequests();
        loadSellRequests();
        loadServiceRequests();
      }
      loadMaintenance();
    }, 15000);

    const slowPoll = setInterval(() => {
      const token = localStorage.getItem('token');
      loadProjects();
      loadCategories();
      loadServices();
      loadTradingCourses();
      loadTradingSessions();
      loadMentorProfile();
      loadTradingCurriculum();
      loadCertificates();
      loadCertificateTemplate();
      loadAnnouncement();
      loadGenericCourses();
      loadCourseCategories();
      loadTestimonials();
      loadInternshipCategories();

      if (token) {
        loadManualEmployees();
        loadUsers();
        loadMessages();
        loadTradingEnrollments();
        loadTradingPayments();
        loadEmployeePermissions();
        loadGenericEnrollments();
      }
    }, 60000);


    return () => {
      isMounted = false;
      clearInterval(fastPoll);
      clearInterval(slowPoll);
    };
  }, []);

  const addProject = async (project) => {
    try {
      const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newProject = {
        ...project,
        slug,
        sales: 0,
        status: 'active',
      }
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/projects`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newProject)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add project');
      }
      const added = data.document;
      setProjects(prev => [added, ...prev]);
      return added;
    } catch (err) { console.error("Error adding project:", err); throw err }
  }

  const updateProject = async (id, updates) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/projects/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update project');
      }
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (err) { console.error("Error updating project:", err); throw err }
  }

  const deleteProject = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/projects/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete project');
      }
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) { console.error('Error deleting project:', err); throw err }
  }

  const addOrder = async (order) => {
    try {
      const newOrder = {
        ...order,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      }
      const headers = getRequestHeaders();
      const response = await fetch(`${api.base}/api/db/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newOrder)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add order');
      }
      const added = data.document;
      setOrders(prev => [added, ...prev]);

      if (order.project_id) {
        const project = projects.find(p => p.id === order.project_id);
        if (project) {
          await updateProject(order.project_id, { sales: (project.sales || 0) + 1 });
        }
      }
      return added;
    } catch (err) { console.error("Error adding order:", err); throw err }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/orders/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update order status');
      }
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    } catch (err) { console.error("Error updating order status:", err); throw err }
  }

  const deleteOrder = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/orders/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete order');
      }
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) { console.error("Error deleting order:", err); throw err }
  }

  const addTask = async (task) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tasks`, {
        method: 'POST',
        headers,
        body: JSON.stringify(task)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add task');
      }
      const added = data.document;
      setTasks(prev => [added, ...prev]);
      return added;
    } catch (err) { console.error("Error adding task:", err); throw err }
  }

  const updateTask = async (id, updates) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tasks/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update task');
      }
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (err) { console.error("Error updating task:", err); throw err }
  }

  const deleteTask = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tasks/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete task');
      }
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) { console.error("Error deleting task:", err); throw err }
  }

  const addManualEmployee = async (member) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/employees`, {
        method: 'POST',
        headers,
        body: JSON.stringify(member)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add employee record');
      }
      const added = data.document;
      setManualEmployees(prev => [added, ...prev]);
      return added;
    } catch (err) { console.error("Error adding employee record:", err); throw err }
  }

  const updateManualEmployee = async (id, updates) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/employees/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update employee record');
      }
      setManualEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    } catch (err) { console.error("Error updating employee record:", err); throw err }
  }

  const deleteManualEmployee = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/employees/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete employee record');
      }
      setManualEmployees(prev => prev.filter(e => e.id !== id));
    } catch (err) { console.error("Error deleting employee record:", err); throw err }
  }

  const addUser = async (userData) => {
    try {
      const headers = getAuthorizedHeaders()
      const response = await fetch(api.adminUsers, {
        method: 'POST',
        headers,
        body: JSON.stringify(userData)
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create the user.')
      }
      setUsers(prev => [data.user, ...prev]);
      return data.user
    } catch (err) { console.error("Error adding user:", err); throw err }
  }

  const updateUser = async (id, updates) => {
    try {
      const headers = getAuthorizedHeaders()
      const response = await fetch(`${api.adminUsers}/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update the user.')
      }
      setUsers(prev => prev.map(u => u.uid === id || u.id === id ? data.user : u))
      if (typeof window !== 'undefined' && data.user?.uid) {
        window.dispatchEvent(new CustomEvent('solutionhub:user-updated', { detail: data.user }))
      }
      return data.user
    } catch (err) { console.error('Error updating user:', err); throw err }
  }

  const deleteUser = async (id) => {
    try { 
      const headers = getAuthorizedHeaders()
      const response = await fetch(`${api.adminUsers}/${id}`, {
        method: 'DELETE',
        headers
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete the user.')
      }
      setUsers(prev => prev.filter(u => u.uid !== id && u.id !== id));
      return data.user
    } catch (err) { console.error("Error deleting user:", err); throw err }
  }

  const mergeUsers = async (primaryUserId, duplicateUserId, reason = '') => {
    try {
      const headers = getAuthorizedHeaders()
      const response = await fetch(api.adminMergeUsers, {
        method: 'POST',
        headers,
        body: JSON.stringify({ primaryUserId, duplicateUserId, reason }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to merge the accounts.')
      }
      await loadUsers();
      return data
    } catch (err) {
      console.error('Error merging users:', err)
      throw err
    }
  }

  const fireEmployee = async (id, { fireReason, relievingDate, sendEmailNotice = true }) => {
    try {
      const headers = getAuthorizedHeaders()
      const response = await fetch(`${api.adminUsers}/${id}/fire`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ fireReason, relievingDate, sendEmailNotice })
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fire/terminate employee.')
      }
      setUsers(prev => prev.map(u => (
        u.uid === id || 
        u.id === id || 
        u._id === id || 
        (data.user?.email && u.email?.toLowerCase() === data.user.email?.toLowerCase())
      ) ? { ...u, ...data.user } : u))
      if (typeof window !== 'undefined' && data.user?.uid) {
        window.dispatchEvent(new CustomEvent('solutionhub:user-updated', { detail: data.user }))
      }
      return data
    } catch (err) { console.error('Error firing employee:', err); throw err }
  }

  const reinstateEmployee = async (id, { sendEmailNotice = true } = {}) => {
    try {
      const headers = getAuthorizedHeaders()
      const response = await fetch(`${api.adminUsers}/${id}/reinstate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ sendEmailNotice })
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reinstate employee.')
      }
      setUsers(prev => prev.map(u => (
        u.uid === id || 
        u.id === id || 
        u._id === id || 
        (data.user?.email && u.email?.toLowerCase() === data.user.email?.toLowerCase())
      ) ? { ...u, ...data.user } : u))
      if (typeof window !== 'undefined' && data.user?.uid) {
        window.dispatchEvent(new CustomEvent('solutionhub:user-updated', { detail: data.user }))
      }
      return data
    } catch (err) { console.error('Error reinstating employee:', err); throw err }
  }

  const submitReinstatementRequest = async (message) => {
    try {
      const headers = getAuthorizedHeaders()
      const response = await fetch(`${api.base}/api/admin/reinstatement-requests`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message })
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit reinstatement request.')
      }
      if (data.user) {
        setUsers(prev => prev.map(u => (u.uid === data.user.uid || u.id === data.user.id) ? data.user : u))
      }
      return data
    } catch (err) { console.error('Error submitting reinstatement request:', err); throw err }
  }

  const addService = async (service) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/services`, {
        method: 'POST',
        headers,
        body: JSON.stringify(service)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add service');
      }
      const added = data.document;
      setServices(prev => [added, ...prev]);
      return added;
    } catch (err) { console.error("Error adding service:", err); throw err }
  }

  const updateService = async (id, updates) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/services/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update service');
      }
      setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (err) { console.error("Error updating service:", err); throw err }
  }

  const deleteService = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/services/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete service');
      }
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err) { console.error("Error deleting service:", err); throw err }
  }

  const getActiveProjects = () => projects.filter(p => p.status === 'active')
  const getTotalRevenue = () => orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + Number(o.amount || 0), 0)
  const getPendingOrders = () => orders.filter(o => o.status === 'pending')

  const addTradingCourse = async (course) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tradingCourses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(course)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add trading course');
      }
      const added = data.document;
      setTradingCourses(prev => [added, ...prev]);
      return added;
    } catch (err) { console.error("Error adding trading course:", err); throw err }
  }

  const updateTradingCourse = async (id, updates) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tradingCourses/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update trading course');
      }
      setTradingCourses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (err) { console.error("Error updating trading course:", err); throw err }
  }

  const deleteTradingCourse = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tradingCourses/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete trading course');
      }
      setTradingCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error("Error deleting trading course:", err); throw err }
  }

  const addTradingSession = async (session) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tradingSessions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(session)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add trading session');
      }
      const added = data.document;
      setTradingSessions(prev => [added, ...prev]);
      return added;
    } catch (err) { console.error("Error adding trading session:", err); throw err }
  }

  const updateTradingSession = async (id, updates) => {
    try {
      if (Object.prototype.hasOwnProperty.call(updates, 'isLive')) {
        const response = await fetch(buildApiUrl('/api/trading/toggle-live'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: id, isLive: updates.isLive })
        });
        if (!response.ok) throw new Error("Failed to update status through API");
      } else {
        const headers = getAuthorizedHeaders();
        const response = await fetch(`${api.base}/api/db/tradingSessions/${id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updates)
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Failed to update trading session');
        }
      }
      setTradingSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (err) { console.error("Error updating trading session:", err); throw err }
  }

  const deleteTradingSession = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tradingSessions/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete trading session');
      }
      setTradingSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) { console.error("Error deleting trading session:", err); throw err }
  }

  const addTradingEnrollment = async (enrollment) => {
    try {
      const newEnrollment = {
        ...enrollment,
        status: enrollment.status || 'pending',
      }
      const headers = getRequestHeaders();
      const response = await fetch(`${api.base}/api/db/tradingEnrollments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newEnrollment)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add trading enrollment');
      }
      const added = data.document;
      setTradingEnrollments(prev => [added, ...prev]);
      return added;
    } catch (err) { console.error("Error adding enrollment:", err); throw err }
  }

  const updateTradingEnrollment = async (id, updates) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tradingEnrollments/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update enrollment');
      }
      setTradingEnrollments(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    } catch (err) { console.error("Error updating enrollment:", err); throw err }
  }

  const deleteTradingEnrollment = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tradingEnrollments/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete enrollment');
      }
      setTradingEnrollments(prev => prev.filter(e => e.id !== id));
    } catch (err) { console.error("Error deleting enrollment:", err); throw err }
  }

  const addTradingPayment = async (payment) => {
    try {
      const headers = getRequestHeaders();
      const response = await fetch(`${api.base}/api/db/tradingPayments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payment)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add trading payment');
      }
      const added = data.document;
      setTradingPayments(prev => [added, ...prev]);
      return added;
    } catch (err) { console.error("Error adding payment:", err); throw err }
  }

  const updateTradingPayment = async (id, updates) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tradingPayments/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update payment');
      }
      setTradingPayments(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (err) { console.error("Error updating payment:", err); throw err }
  }

  const deleteTradingPayment = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tradingPayments/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete payment');
      }
      setTradingPayments(prev => prev.filter(p => p.id !== id));
    } catch (err) { console.error("Error deleting payment:", err); throw err }
  }

  const updateEmployeePermissions = async (employeeId, permissions) => {
    try {
      const headers = getAuthorizedHeaders();
      let response = await fetch(`${api.base}/api/db/employeePermissions/${employeeId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(permissions)
      });
      if (response.status === 404) {
        response = await fetch(`${api.base}/api/db/employeePermissions`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ id: employeeId, ...permissions })
        });
      }
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update employee permissions');
      }
      setEmployeePermissions(prev => ({ ...prev, [employeeId]: permissions }));
    } catch (err) { console.error("Error updating permissions:", err); throw err }
  }

  const getEmployeePermissions = (employeeId) => {
    return employeePermissions[employeeId] || {}
  }

  const updateMentorProfile = async (profileData) => {
    try {
      const headers = getAuthorizedHeaders();
      let response = await fetch(`${api.base}/api/db/tradingSettings/mentorProfile`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(profileData)
      });
      if (response.status === 404) {
        response = await fetch(`${api.base}/api/db/tradingSettings`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ id: 'mentorProfile', ...profileData })
        });
      }
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update mentor profile');
      }
      setMentorProfile({ id: 'mentorProfile', ...profileData });
    } catch (err) { console.error("Error updating mentor profile:", err); throw err }
  }

  const addCurriculumModule = async (module) => {
    try {
      const payload = {
        ...module,
        order: tradingCurriculum.length,
      }
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tradingCurriculum`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add curriculum module');
      }
      const added = data.document;
      setTradingCurriculum(prev => [...prev, added]);
      return added;
    } catch (err) { console.error("Error adding curriculum module:", err); throw err }
  }

  const updateCurriculumModule = async (id, updates) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tradingCurriculum/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update curriculum module');
      }
      setTradingCurriculum(prev => {
        const updated = prev.map(m => m.id === id ? { ...m, ...updates } : m);
        updated.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return updated;
      });
    } catch (err) { console.error("Error updating curriculum module:", err); throw err }
  }

  const deleteCurriculumModule = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/tradingCurriculum/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete curriculum module');
      }
      setTradingCurriculum(prev => prev.filter(m => m.id !== id));
    } catch (err) { console.error('Error deleting curriculum module:', err); throw err }
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
      await addCurriculumModule({ ...defaults[i], order: i });
    }
  }

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
        approval_date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/certificates`, {
        method: 'POST',
        headers,
        body: JSON.stringify(newCert)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to issue certificate');
      }
      const added = data.document;
      setCertificates(prev => [added, ...prev]);

      emailNotify('certificate_issued', {
        studentName: enrollment.userName,
        studentEmail: enrollment.userEmail,
        courseName,
        certId,
        documentType,
        documentLabel: activeTemplate.documentLabel,
      })
      return added;
    } catch (err) { console.error("Error issuing certificate:", err); throw err }
  }

  const revokeCertificate = async (certId) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/certificates/${certId}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to revoke certificate');
      }
      setCertificates(prev => prev.filter(cert => cert.id !== certId));
    } catch (err) { console.error("Error revoking certificate:", err); throw err }
  }

  const createQrCertificate = async (payload) => {
    try {
      const headers = getAuthorizedHeaders()
      const response = await fetch(api.adminQrCertificates, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create QR certificate.')
      }
      setCertificates(prev => [data.certificate, ...prev]);
      return data.certificate
    } catch (err) { console.error("Error creating QR certificate:", err); throw err }
  }

  const updateQrCertificate = async (id, payload) => {
    try {
      const headers = getAuthorizedHeaders()
      const response = await fetch(api.adminQrCertificate(id), {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update QR certificate.')
      }
      setCertificates(prev => prev.map(cert => cert.id === id ? data.certificate : cert));
      return data.certificate
    } catch (err) { console.error("Error updating QR certificate:", err); throw err }
  }

  const toggleQrCertificateStatus = async (id, status) => {
    try {
      const headers = getAuthorizedHeaders()
      const response = await fetch(api.adminQrCertificateStatus(id), {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update QR certificate status.')
      }
      setCertificates(prev => prev.map(cert => cert.id === id ? data.certificate : cert));
      return data.certificate
    } catch (err) { console.error("Error toggling QR certificate status:", err); throw err }
  }

  const deleteQrCertificate = async (id) => {
    try {
      const headers = getAuthorizedHeaders()
      const response = await fetch(api.adminQrCertificate(id), {
        method: 'DELETE',
        headers
      })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete QR certificate.')
      }
      setCertificates(prev => prev.filter(cert => cert.id !== id));
      return data.certificate
    } catch (err) { console.error("Error deleting QR certificate:", err); throw err }
  }

  const updateCertificateTemplate = async (data) => {
    try {
      const headers = getAuthorizedHeaders();
      const normalized = normalizeCertificateTemplate(data);
      let response = await fetch(`${api.base}/api/db/settings/certificateTemplate`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(normalized)
      });
      if (response.status === 404) {
        response = await fetch(`${api.base}/api/db/settings`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ id: 'certificateTemplate', ...normalized })
        });
      }
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to update certificate template');
      }
      setCertificateTemplate(normalized);
    } catch (err) { console.error("Error updating certificate template:", err); throw err }
  }

  const updateAnnouncement = async (data) => {
    try {
      const headers = getAuthorizedHeaders();
      let response = await fetch(`${api.base}/api/db/settings/announcement`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data)
      });
      if (response.status === 404) {
        response = await fetch(`${api.base}/api/db/settings`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ id: 'announcement', ...data })
        });
      }
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to update announcement');
      }
      setAnnouncement({ id: 'announcement', ...data });
    } catch (err) { console.error("Error updating announcement:", err); throw err }
  }

  const updateMaintenance = async (data) => {
    try {
      const headers = getAuthorizedHeaders();
      const isDev = import.meta.env.DEV;
      const fieldToUpdate = isDev ? 'isActiveDev' : 'isActive';
      const updates = {
        ...data,
        [fieldToUpdate]: data.isActive
      };
      let response = await fetch(`${api.base}/api/db/settings/maintenance`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      if (response.status === 404) {
        response = await fetch(`${api.base}/api/db/settings`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ id: 'maintenance', ...updates })
        });
      }
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to update maintenance settings');
      }
      setMaintenance({
        id: 'maintenance',
        isActive: data.isActive,
        message: data.message || '',
        ...updates
      });
    } catch (err) { console.error("Error updating maintenance:", err); throw err }
  }

  const updateHomepageStats = async (data) => {
    try {
      const headers = getAuthorizedHeaders();
      let response = await fetch(`${api.base}/api/db/settings/homepageStats`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data)
      });
      if (response.status === 404) {
        response = await fetch(`${api.base}/api/db/settings`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ id: 'homepageStats', ...data })
        });
      }
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to update homepage stats');
      }
      setHomepageStats({ id: 'homepageStats', ...data });
    } catch (err) { console.error("Error updating homepageStats:", err); throw err }
  }

  const generateSlug = (title) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36)

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
      }
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/courses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add course');
      }
      const added = data.document;
      setCourses(prev => [added, ...prev]);
      return added;
    } catch (err) { console.error('Error adding course:', err); throw err }
  }

  const updateCourse = async (id, updates) => {
    try {
      const headers = getAuthorizedHeaders();
      const payload = {
        ...updates,
        enrollmentDeadline: normalizeEnrollmentDeadline(updates.enrollmentDeadline),
      };
      const response = await fetch(`${api.base}/api/db/courses/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update course');
      }
      setCourses(prev => prev.map(c => c.id === id ? { ...c, ...payload } : c));
    } catch (err) { console.error('Error updating course:', err); throw err }
  }

  const deleteCourse = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/courses/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete course');
      }
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error('Error deleting course:', err); throw err }
  }

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

      const existing = enrollments.find(
        e => e.userId === enrollmentData.userId &&
             e.courseId === enrollmentData.courseId &&
             e.status === 'active' &&
             matchesEnrollmentPlan(e, enrollmentData)
      )
      if (existing) return existing

      const payload = {
        ...enrollmentData,
        assignedEmployeeId: recipientId,
        assignedEmployeeRef: enrollmentData.assignedEmployeeId || recipientId,
        status: 'active',
      }
      const headers = getRequestHeaders();
      const response = await fetch(`${api.base}/api/db/enrollments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add enrollment');
      }
      const added = data.document;
      setEnrollments(prev => [added, ...prev]);

      if (enrollmentData.courseId) {
        const course = courses.find(c => c.id === enrollmentData.courseId);
        if (course) {
          await updateCourse(enrollmentData.courseId, { enrolledCount: (course.enrolledCount || 0) + 1 });
        }
      }

      if (recipientId) {
        const notification = {
          enrollmentId: added.id,
          notificationKey: `enrollment:${added.id}`,
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
        };
        await fetch(`${api.base}/api/db/notifications`, {
          method: 'POST',
          headers,
          body: JSON.stringify(notification)
        });

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

      return added;
    } catch (err) { console.error('Error adding enrollment:', err); throw err }
  }

  const updateEnrollment = async (id, updates) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/enrollments/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update enrollment');
      }
      setEnrollments(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    } catch (err) { console.error('Error updating enrollment:', err); throw err }
  }

  const deleteEnrollment = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/enrollments/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete enrollment');
      }
      setEnrollments(prev => prev.filter(e => e.id !== id));
    } catch (err) { console.error('Error deleting enrollment:', err); throw err }
  }

  const getUserEnrollments = (uid) =>
    enrollments.filter(e => e.userId === uid && e.status === 'active')

  const isUserEnrolled = (uid, courseId, planRef = null) =>
    enrollments.some(e =>
      e.userId === uid &&
      e.courseId === courseId &&
      e.status === 'active' &&
      matchesEnrollmentPlan(e, planRef)
    )

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
      const payload = { ...data, order: courseCategories.length }
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/courseCategories`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || 'Failed to add course category');
      }
      const added = resData.document;
      setCourseCategories(prev => dedupeCourseCategories([...prev, added]));
      return added;
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
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/courseCategories/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update course category');
      }
      setCourseCategories(prev => {
        const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
        return dedupeCourseCategories(updated);
      });
    } catch (err) { console.error('Error updating category:', err); throw err }
  }

  const deleteCourseCategory = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/courseCategories/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete course category');
      }
      setCourseCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error('Error deleting category:', err); throw err }
  }

  const seedCourseCategories = async () => {
    if (courseCategories.length > 0) return
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
      await addCourseCategory(cat);
    }
  }

  const deleteAdminMessage = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/messages/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete message');
      }
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) { console.error("Error deleting message:", err); throw err }
  }

  const updateMessageStatus = async (id, updates) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/messages/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update message status');
      }
      setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    } catch (err) { console.error("Error updating message:", err); throw err }
  }

  const deleteServiceRequest = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/custom_requests/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete service request');
      }
      setServiceRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) { console.error("Error deleting service request:", err); throw err }
  }

  const updateServiceRequestStatus = async (id, status) => {
    try {
      const updates = { status, processedAt: new Date().toISOString() };
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/custom_requests/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update service request status');
      }
      setServiceRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    } catch (err) { console.error("Error updating service request status:", err); throw err }
  }

  const deleteAccountRequest = async (id) => {
    try {
      const headers = getAuthorizedHeaders()
      const response = await fetch(api.adminDeleteAccountRequest(id), {
        method: 'DELETE',
        headers
      })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to delete account request.')
      setAccountRequests(prev => prev.filter(r => r.id !== id));
      return data.request
    } catch (err) { console.error("Error deleting account request:", err); throw err }
  }

  const rejectAccountRequest = async (id) => {
    try {
      const headers = getAuthorizedHeaders()
      const response = await fetch(api.adminRejectAccountRequest(id), {
        method: 'POST',
        headers
      })
      const data = await readApiJson(response)
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to reject account request.')
      setAccountRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
      return data.request
    } catch (err) { console.error("Error rejecting account request:", err); throw err }
  }

  const deleteSellRequest = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/sellRequests/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete sell request');
      }
      setSellRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) { console.error("Error deleting sell request:", err); throw err }
  }

  const approveSellRequest = async (id) => {
    try {
      const updates = { status: 'approved', approvedAt: new Date().toISOString() };
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/sellRequests/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to approve sell request');
      }
      setSellRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    } catch (err) { console.error("Error approving sell request:", err); throw err }
  }

  const rejectSellRequest = async (id) => {
    try {
      const updates = { status: 'rejected', rejectedAt: new Date().toISOString() };
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/sellRequests/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to reject sell request');
      }
      setSellRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    } catch (err) { console.error("Error rejecting sell request:", err); throw err }
  }

  const addTestimonial = async (testimonial) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/testimonials`, {
        method: 'POST',
        headers,
        body: JSON.stringify(testimonial)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to add testimonial');
      }
      const added = data.document;
      setTestimonials(prev => [added, ...prev]);
      return added;
    } catch (err) { console.error("Error adding testimonial:", err); throw err }
  };

  const updateTestimonial = async (id, updates) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/testimonials/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to update testimonial');
      }
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (err) { console.error("Error updating testimonial:", err); throw err }
  };

  const deleteTestimonial = async (id) => {
    try {
      const headers = getAuthorizedHeaders();
      const response = await fetch(`${api.base}/api/db/testimonials/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete testimonial');
      }
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (err) { console.error("Error deleting testimonial:", err); throw err }
  }

  const addInternshipCategory = async (category) => {
    try {
      const response = await fetch(`${api.base}/api/db/internshipCategories`, {
        method: 'POST', headers: getAuthorizedHeaders(), body: JSON.stringify(category)
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message || 'Failed to add internship category');
      const added = data.document
      setInternshipCategories(prev => [...prev, added].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch (err) { console.error("Error adding internship category:", err); throw err }
  }

  const updateInternshipCategory = async (id, updates) => {
    try {
      const response = await fetch(`${api.base}/api/db/internshipCategories/${id}`, {
        method: 'PATCH', headers: getAuthorizedHeaders(), body: JSON.stringify(updates)
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message || 'Failed to update internship category');
      setInternshipCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch (err) { console.error("Error updating internship category:", err); throw err }
  }

  const deleteInternshipCategory = async (id) => {
    try {
      const response = await fetch(`${api.base}/api/db/internshipCategories/${id}`, {
        method: 'DELETE', headers: getAuthorizedHeaders()
      })
      const data = await response.json()
      if (!data.success) throw new Error(data.message || 'Failed to delete internship category');
      setInternshipCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error("Error deleting internship category:", err); throw err }
  };

  const value = {
    projects, categories, orders, tasks, manualEmployees, teamMembers: manualEmployees, users,
    addProject, updateProject, deleteProject,
    addOrder, updateOrderStatus, deleteOrder,
    addTask, updateTask, deleteTask,
    addManualEmployee, addTeamMember: addManualEmployee,
    updateManualEmployee, updateTeamMember: updateManualEmployee,
    deleteManualEmployee, deleteTeamMember: deleteManualEmployee,
    addUser, updateUser, deleteUser, mergeUsers, fireEmployee, reinstateEmployee, submitReinstatementRequest,
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
    maintenance, updateMaintenance,
    homepageStats, updateHomepageStats,
    courses, addCourse, updateCourse, deleteCourse,
    enrollments, addEnrollment, updateEnrollment, deleteEnrollment,
    getUserEnrollments, isUserEnrolled,
    courseCategories, addCourseCategory, updateCourseCategory, deleteCourseCategory,
    seedCourseCategories,
    testimonials, addTestimonial, updateTestimonial, deleteTestimonial,
    internshipCategories, addInternshipCategory, updateInternshipCategory, deleteInternshipCategory,
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
