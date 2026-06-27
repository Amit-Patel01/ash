import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, readApiJson } from '../config/api'
import { normalizeUserRole, isEmployeeRole } from '../utils/roles'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  const getAuthHeaders = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('Please sign in again to continue.')
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    }
  }, [])

  const refreshCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return null

    const response = await fetch(api.userProfile, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
    const data = await response.json()

    if (response.ok && data.success && data.profile) {
      const profileData = data.profile
      const normalizedRole = normalizeUserRole(profileData?.role || 'student')
      const userData = {
        uid: profileData.uid || profileData.id,
        ...profileData,
        role: normalizedRole
      }
      setCurrentUser(userData)
      setUserProfile(userData)
      return userData
    }

    localStorage.removeItem('token')
    setCurrentUser(null)
    setUserProfile(null)
    return null
  }, [])

  // Initialize auth state from local storage token
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        if (isMounted) {
          setCurrentUser(null)
          setUserProfile(null)
          setLoading(false)
        }
        return
      }

      try {
        if (isMounted) {
          await refreshCurrentUser()
        }
      } catch (error) {
        console.error('Failed to initialize auth from token:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [refreshCurrentUser])

  useEffect(() => {
    const handleCurrentUserUpdate = async (event) => {
      const updatedUser = event?.detail
      if (!updatedUser?.uid || !currentUser?.uid) return
      if (updatedUser.uid !== currentUser.uid) return

      try {
        await refreshCurrentUser()
      } catch (error) {
        console.warn('Failed to refresh current user after profile update:', error)
      }
    }

    window.addEventListener('solutionhub:user-updated', handleCurrentUserUpdate)
    return () => {
      window.removeEventListener('solutionhub:user-updated', handleCurrentUserUpdate)
    }
  }, [currentUser?.uid, refreshCurrentUser])

  const login = useCallback(async (email, password) => {
    setAuthError('')
    try {
      const response = await fetch(api.base + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed')
      }

      localStorage.setItem('token', data.token)
      
      const profileData = data.user
      const normalizedRole = normalizeUserRole(profileData?.role || 'student')
      const userData = {
        uid: profileData.uid || profileData.id,
        ...profileData,
        role: normalizedRole
      }

      setCurrentUser(userData)
      setUserProfile(userData)
      return userData
    } catch (error) {
      setAuthError(error.message)
      throw error
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    window.location.href = `${api.base}/api/auth/google`
  }, [])


  const clearAuthError = useCallback(() => {
    setAuthError('')
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
    localStorage.removeItem('token')
    setCurrentUser(null)
    setUserProfile(null)
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

    if (currentUser?.uid === uid) {
      setCurrentUser(prev => ({ ...(prev || {}), ...payload.profile }))
      setUserProfile(prev => ({ ...(prev || {}), ...payload.profile }))
    }

    return payload.profile
  }, [currentUser?.uid, getAuthHeaders])

  const updateUserEmail = useCallback(async (email) => {
    const headers = await getAuthHeaders()
    const response = await fetch(api.userEmailChange, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email })
    })
    const payload = await response.json()
    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'Failed to update email.')
    }

    if (payload.profile) {
      setCurrentUser(prev => ({ ...(prev || {}), ...payload.profile }))
      setUserProfile(prev => ({ ...(prev || {}), ...payload.profile }))
    }

    return payload.profile
  }, [getAuthHeaders])

  const updateUserPassword = useCallback(async () => {
    const headers = await getAuthHeaders()
    const response = await fetch(api.userPasswordReset, {
      method: 'POST',
      headers,
      body: JSON.stringify({ from: currentUser?.role || 'student' })
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
    const isRequesterCustomer = normalizeUserRole(userProfile?.role || currentUser?.role) === 'student'
    try {
      const headers = await getAuthHeaders()
      const response = await fetch(api.chatContacts, { headers })
      const data = await readApiJson(response)

      if (response.ok && data.success && Array.isArray(data.users)) {
        let list = data.users
        if (isRequesterCustomer) {
          list = list.filter(u => normalizeUserRole(u.role) === 'admin' || isEmployeeRole(u.role))
        }
        return list
      }
    } catch (error) {
      console.warn('Failed to load chat contacts API:', error)
    }

    // Fallback: If API fails, return empty list
    return []
  }, [getAuthHeaders, userProfile?.role, currentUser?.role])

  const hasPermission = useCallback((permissionKey) => {
    if (!currentUser) return false
    if (normalizeUserRole(currentUser.role) === 'admin') return true
    return currentUser.permissions?.[permissionKey] === true
  }, [currentUser])

  const isAdmin = normalizeUserRole(currentUser?.role) === 'admin'
  const isEmployee = isEmployeeRole(currentUser?.role)

  const value = {
    currentUser, userProfile, loading, authError,
    login, loginWithGoogle, signup, logout, resetPassword, verifyResetCode, confirmReset,
    updateUserProfile, updateUserEmail, updateUserPassword, createAccountRequest, approveAccountRequest, getAllUsers,
    refreshCurrentUser,
    hasPermission, isAdmin, isEmployee, clearAuthError
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
