/**
 * ===================================================
 * SolutionHub — Master Notification Email Router
 * POST /api/notify
 * Body: { type, data }
 * ===================================================
 */

const express = require('express')
const router = express.Router()
const { sendEmail, emailTemplate } = require('../services/emailService')
const { logger } = require('../logger')

const ADMIN_EMAIL = 'amitpatel07029@gmail.com'
const SITE_URL = 'https://www.amitsolutionhub.com'

// ── Templates ────────────────────────────────────────────────────────────────

const templates = {

  // 1. Customer Welcome
  welcome: ({ name, email }) => ({
    to: email,
    subject: '🎉 Welcome to Amit Solution Hub!',
    html: emailTemplate('Welcome to Amit Solution Hub!', `
      <p>Hello <strong>${name}</strong>,</p>
      <p>Welcome aboard! Your account has been successfully created on <strong>Amit Solution Hub</strong>.</p>
      <div style="margin:24px 0;padding:20px;background:#f0fdf4;border-radius:12px;border-left:4px solid #22c55e;">
        <p style="margin:0;font-size:14px;color:#166534;"><strong>✅ Account Active</strong></p>
        <p style="margin:8px 0 0;font-size:13px;color:#166534;">You can now browse courses, enroll, and track your progress.</p>
      </div>
      <p>Explore our latest courses and mentorship programs designed to help you grow.</p>
    `, 'Browse Courses', `${SITE_URL}/courses`)
  }),

  // 2. Course Enrollment — Student
  enrollment_student: ({ studentName, studentEmail, courseTitle, planLabel, amount, employeeName }) => ({
    to: studentEmail,
    subject: `✅ Enrolled: ${courseTitle}`,
    html: emailTemplate(`Successfully Enrolled in ${courseTitle}`, `
      <p>Hello <strong>${studentName}</strong>,</p>
      <p>Congratulations! You have been successfully enrolled in <strong>${courseTitle}</strong>.</p>
      <div style="margin:24px 0;padding:24px;background:#eff6ff;border-radius:12px;border:1px solid #bfdbfe;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#64748b;width:40%;">Course</td><td style="font-weight:700;color:#1e40af;">${courseTitle}</td></tr>
          ${planLabel ? `<tr><td style="padding:6px 0;color:#64748b;">Plan</td><td style="font-weight:600;">${planLabel}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#64748b;">Amount</td><td style="font-weight:700;color:#16a34a;">${amount === 0 || amount === '0' ? 'FREE' : `₹${Number(amount).toLocaleString('en-IN')}`}</td></tr>
          ${employeeName ? `<tr><td style="padding:6px 0;color:#64748b;">Instructor</td><td style="font-weight:600;">${employeeName}</td></tr>` : ''}
        </table>
      </div>
      <p>Your instructor will reach out to you shortly. Please ensure your mobile number is updated in your profile so they can contact you.</p>
      <p style="font-size:13px;color:#64748b;">If you have any questions, reply to this email or WhatsApp us.</p>
    `, 'Go to My Courses', `${SITE_URL}/customer/my-courses`)
  }),

  // 3. Course Enrollment — Employee (new student alert)
  enrollment_employee: ({ employeeEmail, employeeName, studentName, studentEmail, studentMobile, courseTitle, planLabel, amount }) => ({
    to: employeeEmail,
    subject: `🎓 New Student Enrolled — ${courseTitle}`,
    html: emailTemplate('New Student Enrolled in Your Course', `
      <p>Hello <strong>${employeeName}</strong>,</p>
      <p>A new student has enrolled in your course <strong>${courseTitle}</strong>.</p>
      <div style="margin:24px 0;padding:24px;background:#fef9c3;border-radius:12px;border:1px solid #fde047;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#854d0e;text-transform:uppercase;letter-spacing:0.5px;">Student Details</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#78350f;width:40%;">Name</td><td style="font-weight:700;">${studentName}</td></tr>
          <tr><td style="padding:6px 0;color:#78350f;">Email</td><td><a href="mailto:${studentEmail}" style="color:#1d4ed8;">${studentEmail}</a></td></tr>
          <tr><td style="padding:6px 0;color:#78350f;">Mobile</td><td><a href="tel:+91${studentMobile}" style="color:#1d4ed8;font-weight:700;">${studentMobile || 'Not provided'}</a></td></tr>
          ${planLabel ? `<tr><td style="padding:6px 0;color:#78350f;">Plan</td><td style="font-weight:600;">${planLabel}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#78350f;">Amount</td><td style="font-weight:700;color:#16a34a;">${amount === 0 || amount === '0' ? 'FREE' : `₹${Number(amount).toLocaleString('en-IN')}`}</td></tr>
        </table>
      </div>
      <p>Please reach out to the student to welcome them and share course details.</p>
    `, 'Manage Course', `${SITE_URL}/employee/course-manage`)
  }),

  // 4. Account Request — Admin
  account_request: ({ requesterName, requesterEmail, requesterPhone, role }) => ({
    to: ADMIN_EMAIL,
    subject: `🆕 New Account Request — ${requesterName}`,
    html: emailTemplate('New Account Request Received', `
      <p>A new account request has been submitted.</p>
      <div style="margin:24px 0;padding:24px;background:#f0f9ff;border-radius:12px;border:1px solid #bae6fd;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#64748b;width:40%;">Name</td><td style="font-weight:700;">${requesterName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Email</td><td>${requesterEmail}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Phone</td><td>${requesterPhone || 'Not provided'}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Requested Role</td><td style="font-weight:600;text-transform:capitalize;">${role || 'Employee'}</td></tr>
        </table>
      </div>
      <p>Please review and approve/reject from the Admin Panel.</p>
    `, 'Review in Admin Panel', `${SITE_URL}/admin/account-requests`)
  }),

  // 5. Account Approved — User
  account_approved: ({ name, email, role }) => ({
    to: email,
    subject: '✅ Your Account Has Been Approved!',
    html: emailTemplate('Account Approved — Welcome to the Team!', `
      <p>Hello <strong>${name}</strong>,</p>
      <p>Great news! Your account request has been <strong style="color:#16a34a;">approved</strong> by the admin.</p>
      <div style="margin:24px 0;padding:20px;background:#f0fdf4;border-radius:12px;border-left:4px solid #22c55e;">
        <p style="margin:0;font-size:14px;color:#166534;"><strong>Role Assigned: ${role || 'Employee'}</strong></p>
        <p style="margin:8px 0 0;font-size:13px;color:#166534;">You can now log in to your dashboard to get started.</p>
      </div>
      <p>If you haven't received your login credentials, please contact us at support@amitsolutionhub.com</p>
    `, 'Login to Dashboard', `${SITE_URL}/employee`)
  }),

  // 6. Service / Custom Request — Admin
  service_request_admin: ({ clientName, clientEmail, clientPhone, serviceType, message }) => ({
    to: ADMIN_EMAIL,
    subject: `📋 New Service Request — ${clientName}`,
    html: emailTemplate('New Service Request Received', `
      <p>A new service request has been submitted.</p>
      <div style="margin:24px 0;padding:24px;background:#faf5ff;border-radius:12px;border:1px solid #e9d5ff;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#64748b;width:40%;">Name</td><td style="font-weight:700;">${clientName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Email</td><td>${clientEmail}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Phone</td><td>${clientPhone || 'Not provided'}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Service Type</td><td style="font-weight:600;">${serviceType || 'General'}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;vertical-align:top;">Message</td><td style="font-style:italic;">${message || '—'}</td></tr>
        </table>
      </div>
    `, 'View in Admin Panel', `${SITE_URL}/admin`)
  }),

  // 7. Service Request — User Acknowledgment
  service_request_user: ({ clientName, clientEmail, serviceType }) => ({
    to: clientEmail,
    subject: '📋 Service Request Received — Amit Solution Hub',
    html: emailTemplate('We Received Your Request!', `
      <p>Hello <strong>${clientName}</strong>,</p>
      <p>Thank you for reaching out! We have received your service request for <strong>${serviceType || 'our services'}</strong>.</p>
      <div style="margin:24px 0;padding:20px;background:#f8fafc;border-radius:12px;border-left:4px solid #3b82f6;">
        <p style="margin:0;font-size:14px;color:#1e40af;"><strong>⏱ Expected Response: 24 Business Hours</strong></p>
        <p style="margin:8px 0 0;font-size:13px;color:#1e40af;">Our team will review your request and contact you shortly.</p>
      </div>
    `, 'View Our Services', `${SITE_URL}/services`)
  }),

  // 8. Sell Project Request — Admin
  sell_request_admin: ({ sellerName, sellerEmail, sellerPhone, projectTitle, projectDesc, price }) => ({
    to: ADMIN_EMAIL,
    subject: `💼 New Sell Project Request — ${sellerName}`,
    html: emailTemplate('New Project Sale Request', `
      <p>Someone wants to sell a project on Amit Solution Hub.</p>
      <div style="margin:24px 0;padding:24px;background:#fff7ed;border-radius:12px;border:1px solid #fed7aa;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#64748b;width:40%;">Seller</td><td style="font-weight:700;">${sellerName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Email</td><td>${sellerEmail}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Phone</td><td>${sellerPhone || 'Not provided'}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Project Title</td><td style="font-weight:600;">${projectTitle || '—'}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">Asking Price</td><td style="font-weight:700;color:#d97706;">${price ? `₹${price}` : 'Not specified'}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;vertical-align:top;">Description</td><td style="font-style:italic;">${projectDesc || '—'}</td></tr>
        </table>
      </div>
    `, 'Review in Admin Panel', `${SITE_URL}/admin`)
  }),

  // 9. Sell Request — User Acknowledgment
  sell_request_user: ({ sellerName, sellerEmail, projectTitle }) => ({
    to: sellerEmail,
    subject: '💼 Your Sell Request Received — Amit Solution Hub',
    html: emailTemplate('Project Submission Received!', `
      <p>Hello <strong>${sellerName}</strong>,</p>
      <p>We've received your request to sell <strong>${projectTitle || 'your project'}</strong> on Amit Solution Hub.</p>
      <div style="margin:24px 0;padding:20px;background:#fff7ed;border-radius:12px;border-left:4px solid #f97316;">
        <p style="margin:0;font-size:14px;color:#c2410c;"><strong>📋 Under Review</strong></p>
        <p style="margin:8px 0 0;font-size:13px;color:#c2410c;">Our team will evaluate your project and respond within 2-3 business days.</p>
      </div>
    `)
  }),

  // 10. Certificate Issued
  certificate_issued: ({ studentName, studentEmail, courseName, certId }) => ({
    to: studentEmail,
    subject: `🏆 Certificate Issued — ${courseName}`,
    html: emailTemplate('Your Certificate is Ready!', `
      <p>Hello <strong>${studentName}</strong>,</p>
      <p>Congratulations! 🎉 You have successfully completed <strong>${courseName}</strong> and your certificate has been issued.</p>
      <div style="margin:24px 0;padding:24px;background:linear-gradient(135deg,#fef9c3,#fef3c7);border-radius:12px;border:2px solid #fbbf24;text-align:center;">
        <p style="margin:0;font-size:20px;">🏆</p>
        <p style="margin:8px 0 0;font-size:18px;font-weight:800;color:#78350f;">${courseName}</p>
        <p style="margin:6px 0 0;font-size:13px;color:#92400e;">Certificate ID: <strong>${certId}</strong></p>
      </div>
      <p>You can download your certificate from your student dashboard. Add it to your LinkedIn profile and show it to the world!</p>
    `, 'View My Certificate', `${SITE_URL}/customer/certificates`)
  }),

  // 11. Task Assigned — Employee
  task_assigned: ({ employeeName, employeeEmail, taskTitle, taskDesc, dueDate, assignedBy }) => ({
    to: employeeEmail,
    subject: `📌 New Task Assigned — ${taskTitle}`,
    html: emailTemplate('New Task Assigned to You', `
      <p>Hello <strong>${employeeName}</strong>,</p>
      <p>You have been assigned a new task by <strong>${assignedBy || 'Admin'}</strong>.</p>
      <div style="margin:24px 0;padding:24px;background:#f0f9ff;border-radius:12px;border:1px solid #bae6fd;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#64748b;width:40%;">Task</td><td style="font-weight:700;">${taskTitle}</td></tr>
          ${taskDesc ? `<tr><td style="padding:6px 0;color:#64748b;vertical-align:top;">Description</td><td style="font-style:italic;">${taskDesc}</td></tr>` : ''}
          ${dueDate ? `<tr><td style="padding:6px 0;color:#64748b;">Due Date</td><td style="font-weight:600;color:#dc2626;">${dueDate}</td></tr>` : ''}
        </table>
      </div>
      <p>Please log in to your dashboard to view full task details and update the status.</p>
    `, 'View My Tasks', `${SITE_URL}/employee/tasks`)
  }),

  // 12. Trading Enrollment — Student
  trading_enrollment_student: ({ studentName, studentEmail, courseName, sessionDate, amount }) => ({
    to: studentEmail,
    subject: `📈 Trading Mentorship Enrollment Confirmed`,
    html: emailTemplate('Trading Mentorship Enrollment Confirmed', `
      <p>Hello <strong>${studentName}</strong>,</p>
      <p>Your enrollment in <strong>${courseName || 'Trading Mentorship'}</strong> has been confirmed!</p>
      <div style="margin:24px 0;padding:24px;background:#f0fdf4;border-radius:12px;border:1px solid #86efac;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#64748b;width:40%;">Course</td><td style="font-weight:700;color:#166534;">${courseName || 'Trading Mentorship'}</td></tr>
          ${sessionDate ? `<tr><td style="padding:6px 0;color:#64748b;">Next Session</td><td style="font-weight:600;">${sessionDate}</td></tr>` : ''}
          <tr><td style="padding:6px 0;color:#64748b;">Amount Paid</td><td style="font-weight:700;color:#16a34a;">${amount === 0 ? 'FREE' : `₹${Number(amount || 0).toLocaleString('en-IN')}`}</td></tr>
        </table>
      </div>
      <p>You will receive session reminders 1 hour before each live class. Stay motivated and trade smart!</p>
    `, 'My Dashboard', `${SITE_URL}/customer`)
  }),

}

// ── POST /api/notify ──────────────────────────────────────────────────────────

router.post('/', async (req, res) => {
  const { type, data } = req.body
  if (!type || !data) {
    return res.status(400).json({ success: false, message: 'type and data are required' })
  }
  const builder = templates[type]
  if (!builder) {
    return res.status(400).json({ success: false, message: `Unknown notification type: ${type}` })
  }
  try {
    const emailOpts = builder(data)
    if (!emailOpts.to) {
      return res.status(400).json({ success: false, message: 'No recipient email' })
    }
    await sendEmail(emailOpts)
    logger.info(`[notify] type=${type} to=${emailOpts.to}`)
    res.json({ success: true })
  } catch (err) {
    logger.error(`[notify] Failed type=${type}: ${err.message}`)
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
