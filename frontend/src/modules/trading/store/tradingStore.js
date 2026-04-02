import React, { createContext, useContext, useState, useEffect } from 'react'
import { tradingService } from '../services/tradingService'

const TradingContext = createContext(null)

export function TradingProvider({ children }) {
  const [sessions, setSessions] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [payments, setPayments] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubSessions = tradingService.subscribeSessions(setSessions)
    const unsubEnrollments = tradingService.subscribeEnrollments(setEnrollments)
    const unsubPayments = tradingService.subscribePayments(setPayments)
    const unsubCourses = tradingService.subscribeCourses(setCourses)

    setLoading(false)

    return () => {
      unsubSessions()
      unsubEnrollments()
      unsubPayments()
      unsubCourses()
    }
  }, [])

  const value = {
    sessions,
    enrollments,
    payments,
    courses,
    loading,
    addSession: tradingService.addSession,
    updateSession: tradingService.updateSession,
    deleteSession: tradingService.deleteSession,
    addEnrollment: tradingService.addEnrollment,
    updateEnrollmentStatus: tradingService.updateEnrollmentStatus,
    addPaymentRecord: tradingService.addPaymentRecord
  }

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  )
}

export function useTrading() {
  const context = useContext(TradingContext)
  if (!context) throw new Error('useTrading must be used within TradingProvider')
  return context
}
