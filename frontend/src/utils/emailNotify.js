/**
 * emailNotify(type, data)
 * 
 * Universal frontend utility to trigger email notifications
 * via the backend /api/notify endpoint.
 * 
 * Usage:
 *   import { emailNotify } from '../utils/emailNotify'
 *   await emailNotify('welcome', { name: 'Amit', email: 'a@b.com' })
 * 
 * Types:
 *   welcome                   — new customer signup
 *   enrollment_student        — student enrolled in course
 *   enrollment_employee       — employee gets new student alert
 *   account_request           — admin notified of new account request
 *   account_approved          — user notified their account was approved
 *   service_request_admin     — admin gets new service/custom request
 *   service_request_user      — user gets ack for service request
 *   sell_request_admin        — admin gets sell project request
 *   sell_request_user         — user gets ack for sell request
 *   certificate_issued        — student gets certificate email
 *   task_assigned             — employee gets task assignment email
 *   trading_enrollment_student — student enrolled in trading course
 */

import { api } from '../config/api'

export const emailNotify = async (type, data) => {
  try {
    await fetch(api.notify, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    })
    // Fire and forget — don't block UI on email success/failure
  } catch (err) {
    // Never throw — email is best-effort
    console.warn('[emailNotify] Failed silently:', type, err.message)
  }
}

export default emailNotify
