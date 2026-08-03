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
const { getDb } = require('../utils/mongo')

const ADMIN_EMAIL = 'amitpatel07029@gmail.com'
const SITE_URL = 'https://www.amitsolutionhub.com'

// ── Templates ────────────────────────────────────────────────────────────────

const templates = {

  // 1. Customer Welcome
  welcome: ({ name, email }) => ({
    to: email,
    subject: '🎉 Welcome to Amit Solution Hub!',
    html: emailTemplate(
      'Welcome to Amit Solution Hub!',
      `
      <p style="font-size:16px;margin-bottom:16px;">Hello <strong>${name}</strong> 👋,</p>
      <p>We are thrilled to welcome you to <strong>Amit Solution Hub</strong>! Your account is now fully active and ready.</p>
      
      <div style="margin:24px 0;padding:24px;background:#f0fdf4;border-radius:18px;border:1px solid #bbf7d0;">
        <div style="font-size:15px;font-weight:800;color:#166534;margin-bottom:8px;">✅ Account Successfully Activated</div>
        <p style="margin:0;font-size:13px;color:#15803d;line-height:1.5;">You have full access to browse industry-ready courses, manage your enrollments, and track certificates.</p>
      </div>

      <p style="font-weight:700;color:#0f172a;margin-top:20px;">Here is how you can get started:</p>
      <ul style="padding-left:20px;color:#475569;font-size:14px;line-height:1.8;">
        <li>📚 <strong>Explore Courses:</strong> Find hands-on courses in Web Dev, Trading, & Software Engineering.</li>
        <li>🎓 <strong>Learn with Mentors:</strong> Get weekly live sessions, doubt support, and guidance.</li>
        <li>🏆 <strong>Earn Certificates:</strong> Complete courses to unlock verified certificates & offer letters.</li>
      </ul>
      `,
      'Explore All Courses',
      `${SITE_URL}/courses`,
      '#16a34a',
      'WELCOME'
    )
  }),

  // 2. Course Enrollment — Student
  enrollment_student: ({ studentName, studentEmail, courseTitle, planLabel, amount, employeeName }) => ({
    to: studentEmail,
    subject: `✅ Enrollment Confirmed: ${courseTitle}`,
    html: emailTemplate(
      `Course Enrollment Confirmed!`,
      `
      <p style="font-size:16px;margin-bottom:16px;">Hello <strong>${studentName}</strong> 🎉,</p>
      <p>Congratulations! You have been successfully enrolled in <strong>${courseTitle}</strong>.</p>

      <div style="margin:24px 0;padding:24px;background:#eff6ff;border-radius:18px;border:1px solid #bfdbfe;">
        <div style="font-size:11px;font-weight:900;letter-spacing:1px;color:#1d4ed8;text-transform:uppercase;margin-bottom:12px;">Enrollment Summary</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#64748b;width:35%;">Course</td><td style="font-weight:800;color:#1e40af;">${courseTitle}</td></tr>
          ${planLabel ? `<tr><td style="padding:8px 0;color:#64748b;">Plan Tier</td><td style="font-weight:700;color:#0f172a;">${planLabel}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#64748b;">Investment</td><td style="font-weight:900;color:#16a34a;">${amount === 0 || amount === '0' ? 'FREE' : `₹${Number(amount).toLocaleString('en-IN')}`}</td></tr>
          ${employeeName ? `<tr><td style="padding:8px 0;color:#64748b;">Assigned Lead Mentor</td><td style="font-weight:700;color:#2563eb;">${employeeName}</td></tr>` : ''}
        </table>
      </div>

      <div style="margin:20px 0;padding:16px 20px;background:#f8fafc;border-radius:14px;border-left:4px solid #2563eb;">
        <p style="margin:0;font-size:13px;color:#334155;font-weight:600;">💡 Your mentor will reach out shortly with live session instructions and learning resources.</p>
      </div>
      `,
      'Access My Course Panel',
      `${SITE_URL}/customer/my-courses`,
      '#2563eb',
      'COURSE ENROLLMENT'
    )
  }),

  // 3. Course Meeting Scheduled - Student
  course_meeting_scheduled: ({
    studentName,
    studentEmail,
    courseTitle,
    planLabel,
    weeklySchedule,
    meetingTime,
    meetingLink,
    employeeName,
    reason,
  }) => {
    const dashboardUrl = `${SITE_URL}/customer/my-courses`
    const ctaUrl = meetingLink || dashboardUrl
    const subjectPrefix = reason === 'new_enrollment' ? 'Live Class Schedule' : 'Live Meeting Scheduled'
    return {
      to: studentEmail,
      subject: `📅 ${subjectPrefix} — ${courseTitle}`,
      html: emailTemplate(
        `Live Meeting & Weekly Schedule`,
        `
        <p style="font-size:16px;margin-bottom:16px;">Hello <strong>${studentName}</strong> 🎥,</p>
        <p>${reason === 'new_enrollment'
          ? `Your enrolled program <strong>${courseTitle}</strong> has scheduled live interactive sessions.`
          : `A new live meeting & weekly schedule has been set for <strong>${courseTitle}</strong>.`
        }</p>

        <div style="margin:24px 0;padding:24px;background:#f0f9ff;border-radius:18px;border:1px solid #bae6fd;">
          <div style="font-size:11px;font-weight:900;letter-spacing:1px;color:#0369a1;text-transform:uppercase;margin-bottom:12px;">Live Session Details</div>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:8px 0;color:#64748b;width:35%;">Course</td><td style="font-weight:800;color:#0f172a;">${courseTitle}</td></tr>
            ${planLabel ? `<tr><td style="padding:8px 0;color:#64748b;">Plan Access</td><td style="font-weight:700;color:#0369a1;">${planLabel}</td></tr>` : ''}
            ${weeklySchedule ? `<tr><td style="padding:8px 0;color:#64748b;">Weekly Schedule</td><td style="font-weight:800;color:#166534;">📅 ${weeklySchedule}</td></tr>` : ''}
            ${meetingTime ? `<tr><td style="padding:8px 0;color:#64748b;">Next Session</td><td style="font-weight:700;color:#0f172a;">${meetingTime}</td></tr>` : ''}
            ${employeeName ? `<tr><td style="padding:8px 0;color:#64748b;">Host Mentor</td><td style="font-weight:700;color:#2563eb;">${employeeName}</td></tr>` : ''}
          </table>
        </div>

        ${meetingLink ? `
          <div style="text-align:center;margin:24px 0;padding:20px;background:#eff6ff;border-radius:16px;border:1px stroke #bfdbfe;">
            <p style="margin:0 0 10px;font-size:12px;font-weight:800;color:#1e40af;text-transform:uppercase;">Direct Live Room Link</p>
            <a href="${meetingLink}" style="font-size:14px;font-weight:800;color:#2563eb;word-break:break-all;text-decoration:underline;">${meetingLink}</a>
          </div>
        ` : ''}

        <p style="font-size:13px;color:#64748b;margin-top:16px;">Please log in 5 minutes early with a stable internet connection.</p>
        `,
        meetingLink ? 'Join Live Session Now' : 'Open My Student Panel',
        ctaUrl,
        '#0284c7',
        'LIVE MEETING'
      ),
    }
  },

  // 4. Course Enrollment — Employee (new student alert)
  enrollment_employee: ({ employeeEmail, employeeName, studentName, studentEmail, studentMobile, courseTitle, planLabel, amount }) => ({
    to: employeeEmail,
    subject: `🎓 New Student Assigned — ${studentName}`,
    html: emailTemplate(
      `New Student Enrolled in Your Batch!`,
      `
      <p style="font-size:16px;margin-bottom:16px;">Hello <strong>${employeeName}</strong> 👨‍🏫,</p>
      <p>A new student has enrolled and been assigned to your course <strong>${courseTitle}</strong>.</p>

      <div style="margin:24px 0;padding:24px;background:#fefce8;border-radius:18px;border:1px solid #fef08a;">
        <div style="font-size:11px;font-weight:900;letter-spacing:1px;color:#854d0e;text-transform:uppercase;margin-bottom:12px;">Student Profile & Contact</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#854d0e;width:35%;">Student Name</td><td style="font-weight:800;color:#0f172a;">${studentName}</td></tr>
          <tr><td style="padding:8px 0;color:#854d0e;">Email Address</td><td><a href="mailto:${studentEmail}" style="color:#2563eb;font-weight:700;">${studentEmail}</a></td></tr>
          <tr><td style="padding:8px 0;color:#854d0e;">Mobile Phone</td><td><a href="tel:+91${studentMobile}" style="color:#2563eb;font-weight:800;">${studentMobile || 'Not provided'}</a></td></tr>
          ${planLabel ? `<tr><td style="padding:8px 0;color:#854d0e;">Selected Plan</td><td style="font-weight:700;">${planLabel}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#854d0e;">Amount Paid</td><td style="font-weight:900;color:#16a34a;">${amount === 0 || amount === '0' ? 'FREE' : `₹${Number(amount).toLocaleString('en-IN')}`}</td></tr>
        </table>
      </div>

      <p style="font-size:14px;color:#475569;">Please contact the student via phone/email to onboard them to the course portal and WhatsApp group.</p>
      `,
      'Open Course Management',
      `${SITE_URL}/employee/course-manage`,
      '#ca8a04',
      'STUDENT ALERT'
    )
  }),

  // 5. Account Request — Admin
  account_request: ({ requesterName, requesterEmail, requesterPhone, role }) => ({
    to: ADMIN_EMAIL,
    subject: `🆕 New Access Request — ${requesterName}`,
    html: emailTemplate(
      `New Account Approval Request`,
      `
      <p style="font-size:16px;margin-bottom:16px;">Hello Admin 🔐,</p>
      <p>A new employee/mentor registration request requires your admin review.</p>

      <div style="margin:24px 0;padding:24px;background:#f0f9ff;border-radius:18px;border:1px solid #bae6fd;">
        <div style="font-size:11px;font-weight:900;letter-spacing:1px;color:#0369a1;text-transform:uppercase;margin-bottom:12px;">Requester Information</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#64748b;width:35%;">Applicant</td><td style="font-weight:800;color:#0f172a;">${requesterName}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="font-weight:700;color:#2563eb;">${requesterEmail}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Phone</td><td style="font-weight:700;">${requesterPhone || 'Not provided'}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Target Role</td><td style="font-weight:800;color:#7c3aed;text-transform:capitalize;">${role || 'Employee'}</td></tr>
        </table>
      </div>

      <p style="font-size:14px;color:#475569;">Click below to review their request and assign permissions.</p>
      `,
      'Review Request in Admin Panel',
      `${SITE_URL}/admin/account-requests`,
      '#0284c7',
      'ACCOUNT REQUEST'
    )
  }),

  // 6. Account Approved — User
  account_approved: ({ name, email, role }) => ({
    to: email,
    subject: '🎉 Your Account Has Been Approved!',
    html: emailTemplate(
      `Account Approved — Welcome to Team!`,
      `
      <p style="font-size:16px;margin-bottom:16px;">Hello <strong>${name}</strong> 🚀,</p>
      <p>Great news! Your account application has been <strong style="color:#16a34a;">Approved</strong> by the administrator.</p>

      <div style="margin:24px 0;padding:24px;background:#f0fdf4;border-radius:18px;border:1px solid #bbf7d0;">
        <div style="font-size:15px;font-weight:800;color:#166534;margin-bottom:6px;">Role Granted: ${role || 'Employee'}</div>
        <p style="margin:0;font-size:13px;color:#15803d;">You can now log in to access your employee panel, manage courses, and review student tasks.</p>
      </div>

      <p style="font-size:14px;color:#475569;">If you need onboarding assistance, reach out to support@amitsolutionhub.com</p>
      `,
      'Login to Employee Dashboard',
      `${SITE_URL}/employee`,
      '#16a34a',
      'ACCOUNT APPROVED'
    )
  }),

  // 7. Service / Custom Request — Admin
  service_request_admin: ({ clientName, clientEmail, clientPhone, serviceType, message }) => ({
    to: ADMIN_EMAIL,
    subject: `📋 New Client Service Inquiry — ${clientName}`,
    html: emailTemplate(
      `New Client Service Request Received`,
      `
      <p style="font-size:16px;margin-bottom:16px;">Hello Admin 💼,</p>
      <p>A new client has submitted a custom software/service inquiry.</p>

      <div style="margin:24px 0;padding:24px;background:#faf5ff;border-radius:18px;border:1px solid #e9d5ff;">
        <div style="font-size:11px;font-weight:900;letter-spacing:1px;color:#7e22ce;text-transform:uppercase;margin-bottom:12px;">Inquiry Details</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#64748b;width:35%;">Client Name</td><td style="font-weight:800;color:#0f172a;">${clientName}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="font-weight:700;color:#2563eb;">${clientEmail}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Phone</td><td style="font-weight:700;">${clientPhone || 'Not provided'}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Service Category</td><td style="font-weight:800;color:#7e22ce;">${serviceType || 'Custom Project'}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;vertical-align:top;">Message</td><td style="font-style:italic;color:#334155;">${message || 'No description provided.'}</td></tr>
        </table>
      </div>
      `,
      'Open Service Requests in Admin',
      `${SITE_URL}/admin`,
      '#7c3aed',
      'SERVICE REQUEST'
    )
  }),

  // 8. Service Request — User Acknowledgment
  service_request_user: ({ clientName, clientEmail, serviceType }) => ({
    to: clientEmail,
    subject: '📋 Inquiry Received — Amit Solution Hub',
    html: emailTemplate(
      `We Have Received Your Inquiry!`,
      `
      <p style="font-size:16px;margin-bottom:16px;">Hello <strong>${clientName}</strong> 👋,</p>
      <p>Thank you for reaching out to <strong>Amit Solution Hub</strong>! We have received your request for <strong>${serviceType || 'Custom Solution Services'}</strong>.</p>

      <div style="margin:24px 0;padding:24px;background:#f0f9ff;border-radius:18px;border:1px solid #bae6fd;">
        <div style="font-size:14px;font-weight:800;color:#0369a1;margin-bottom:6px;">⏱ Expected SLA: Within 24 Hours</div>
        <p style="margin:0;font-size:13px;color:#0284c7;">Our technical team is reviewing your requirements and will contact you via phone or email.</p>
      </div>

      <p style="font-size:14px;color:#475569;">In the meantime, feel free to check out our pre-built software projects and services.</p>
      `,
      'Explore Our Portfolio',
      `${SITE_URL}/services`,
      '#0284c7',
      'INQUIRY ACKNOWLEDGED'
    )
  }),

  // 9. Sell Project Request — Admin
  sell_request_admin: ({ sellerName, sellerEmail, sellerPhone, projectTitle, projectDesc, price }) => ({
    to: ADMIN_EMAIL,
    subject: `💼 Sell Project Request — ${sellerName}`,
    html: emailTemplate(
      `New Project Submission for Sale`,
      `
      <p style="font-size:16px;margin-bottom:16px;">Hello Admin 💰,</p>
      <p>A developer wants to list and sell a project on Amit Solution Hub.</p>

      <div style="margin:24px 0;padding:24px;background:#fff7ed;border-radius:18px;border:1px solid #fed7aa;">
        <div style="font-size:11px;font-weight:900;letter-spacing:1px;color:#c2410c;text-transform:uppercase;margin-bottom:12px;">Submission Details</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#64748b;width:35%;">Seller Name</td><td style="font-weight:800;color:#0f172a;">${sellerName}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="font-weight:700;color:#2563eb;">${sellerEmail}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Phone</td><td style="font-weight:700;">${sellerPhone || 'Not provided'}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Project Name</td><td style="font-weight:800;color:#c2410c;">${projectTitle || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;">Asking Price</td><td style="font-weight:900;color:#16a34a;">${price ? `₹${price}` : 'Quote Requested'}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b;vertical-align:top;">Description</td><td style="font-style:italic;color:#334155;">${projectDesc || '—'}</td></tr>
        </table>
      </div>
      `,
      'Review Submission in Admin',
      `${SITE_URL}/admin`,
      '#ea580c',
      'SELL PROJECT'
    )
  }),

  // 10. Sell Request — User Acknowledgment
  sell_request_user: ({ sellerName, sellerEmail, projectTitle }) => ({
    to: sellerEmail,
    subject: '💼 Sell Request Received — Amit Solution Hub',
    html: emailTemplate(
      `Project Submission Received!`,
      `
      <p style="font-size:16px;margin-bottom:16px;">Hello <strong>${sellerName}</strong> 👋,</p>
      <p>We have successfully received your request to list <strong>${projectTitle || 'your project'}</strong> on Amit Solution Hub.</p>

      <div style="margin:24px 0;padding:24px;background:#fff7ed;border-radius:18px;border:1px solid #fed7aa;">
        <div style="font-size:14px;font-weight:800;color:#c2410c;margin-bottom:6px;">📋 Code Quality Evaluation</div>
        <p style="margin:0;font-size:13px;color:#9a3412;">Our evaluation team will review your project code and contact you within 2-3 business days.</p>
      </div>
      `,
      'View Platform Guidelines',
      `${SITE_URL}`,
      '#ea580c',
      'SUBMISSION CONFIRMED'
    )
  }),

  // 11. Certificate Issued
  certificate_issued: ({ studentName, studentEmail, courseName, certId, documentType, documentLabel }) => ({
    to: studentEmail,
    subject: `🏆 Verified Document Issued — ${courseName}`,
    html: emailTemplate(
      `Verified Document Issued!`,
      `
      <p style="font-size:16px;margin-bottom:16px;">Congratulations <strong>${studentName}</strong> 🎓,</p>
      <p>Your official <strong>${documentLabel || (documentType === 'offer_letter' ? 'Offer Letter' : documentType === 'internship_certificate' ? 'Internship Certificate' : 'Certificate of Completion')}</strong> for <strong>${courseName}</strong> is now issued and verified.</p>

      <div style="margin:24px 0;padding:28px;background:linear-gradient(135deg,#fef9c3 0%,#fef3c7 100%);border-radius:20px;border:2px solid #f59e0b;text-align:center;">
        <div style="font-size:32px;margin-bottom:6px;">🏆</div>
        <div style="font-size:20px;font-weight:900;color:#78350f;">${documentLabel || 'Verified Certificate'}</div>
        <p style="margin:8px 0 0;font-size:14px;color:#92400e;">Program: <strong>${courseName}</strong></p>
        <div style="display:inline-block;margin-top:12px;padding:6px 16px;background:#ffffff;border-radius:30px;border:1px solid #fde68a;font-size:12px;font-weight:800;color:#b45309;">
          Document ID: ${certId}
        </div>
      </div>

      <p style="font-size:14px;color:#475569;">You can instantly verify, preview, and download your high-resolution PDF certificate from your student account.</p>
      `,
      'View & Download Certificate',
      `${SITE_URL}/customer/certificates`,
      '#d97706',
      'VERIFIED CERTIFICATE'
    )
  }),

  // 12. Task Assigned — Employee
  task_assigned: ({ employeeName, employeeEmail, taskTitle, taskDesc, dueDate, assignedBy }) => ({
    to: employeeEmail,
    subject: `📌 New Task Assigned — ${taskTitle}`,
    html: emailTemplate(
      `New Action Task Assigned`,
      `
      <p style="font-size:16px;margin-bottom:16px;">Hello <strong>${employeeName}</strong> 📌,</p>
      <p>A new assignment task has been assigned to you by <strong>${assignedBy || 'Admin Management'}</strong>.</p>

      <div style="margin:24px 0;padding:24px;background:#f0fdf4;border-radius:18px;border:1px solid #bbf7d0;">
        <div style="font-size:11px;font-weight:900;letter-spacing:1px;color:#166534;text-transform:uppercase;margin-bottom:12px;">Task Overview</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#64748b;width:35%;">Task Title</td><td style="font-weight:800;color:#0f172a;">${taskTitle}</td></tr>
          ${taskDesc ? `<tr><td style="padding:8px 0;color:#64748b;vertical-align:top;">Description</td><td style="font-style:italic;color:#334155;">${taskDesc}</td></tr>` : ''}
          ${dueDate ? `<tr><td style="padding:8px 0;color:#64748b;">Target Deadline</td><td style="font-weight:900;color:#dc2626;">⏳ ${dueDate}</td></tr>` : ''}
        </table>
      </div>

      <p style="font-size:14px;color:#475569;">Please log in to your employee dashboard to start working on this task and post updates.</p>
      `,
      'Open My Employee Tasks',
      `${SITE_URL}/employee/tasks`,
      '#16a34a',
      'TASK ASSIGNMENT'
    )
  }),

  // 14. Permissions Updated — Employee
  permissions_updated: ({ employeeName, employeeEmail, updatedByName, rolePreset }) => ({
    to: employeeEmail,
    subject: '🔑 Your Security Access & Permissions Updated',
    html: emailTemplate(
      `Admin Permissions Updated`,
      `
      <p style="font-size:16px;margin-bottom:16px;">Hello <strong>${employeeName}</strong> 🔐,</p>
      <p>Your administrative permissions and access privileges have been updated by <strong>${updatedByName || 'Admin'}</strong>.</p>

      <div style="margin:24px 0;padding:24px;background:#eff6ff;border-radius:18px;border:1px solid #bfdbfe;">
        ${rolePreset ? `<div style="font-size:14px;font-weight:800;color:#1d4ed8;margin-bottom:6px;">Assigned Role: ${rolePreset}</div>` : ''}
        <p style="margin:0;font-size:13px;color:#1e40af;">Your dashboard controls have been synchronized. Please log in again if needed to see your updated menu.</p>
      </div>
      `,
      'Go to Dashboard',
      `${SITE_URL}/employee`,
      '#2563eb',
      'PERMISSIONS UPDATE'
    )
  }),

  // 13. Trading Enrollment — Student
  trading_enrollment_student: ({ studentName, studentEmail, courseName, sessionDate, amount }) => ({
    to: studentEmail,
    subject: `📈 Trading Mentorship Confirmed — ${courseName || 'Trading Batch'}`,
    html: emailTemplate(
      `Trading Mentorship Confirmed!`,
      `
      <p style="font-size:16px;margin-bottom:16px;">Hello <strong>${studentName}</strong> 📈,</p>
      <p>Your seat in the live <strong>${courseName || 'Trading Mentorship Program'}</strong> has been locked and confirmed!</p>

      <div style="margin:24px 0;padding:24px;background:#f0fdf4;border-radius:18px;border:1px solid #86efac;">
        <div style="font-size:11px;font-weight:900;letter-spacing:1px;color:#166534;text-transform:uppercase;margin-bottom:12px;">Trading Batch Summary</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#64748b;width:35%;">Program</td><td style="font-weight:800;color:#166534;">${courseName || 'Trading Mentorship'}</td></tr>
          ${sessionDate ? `<tr><td style="padding:8px 0;color:#64748b;">Next Live Market Session</td><td style="font-weight:800;color:#0f172a;">📊 ${sessionDate}</td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#64748b;">Fee Paid</td><td style="font-weight:900;color:#16a34a;">${amount === 0 ? 'FREE' : `₹${Number(amount || 0).toLocaleString('en-IN')}`}</td></tr>
        </table>
      </div>

      <p style="font-size:14px;color:#475569;">You will receive live webinar links and market analysis updates before every class.</p>
      `,
      'Go to Trading Dashboard',
      `${SITE_URL}/customer`,
      '#16a34a',
      'TRADING MENTORSHIP'
    )
  }),

  // 14. Bootcamp Date Announcement — Student (YouTube Live)
  bootcamp_date_announcement: ({
    studentName,
    studentEmail,
    bootcampName,
    bootcampDate,         // e.g. "15 August 2026"
    bootcampTime,         // e.g. "10:00 AM – 6:00 PM IST"
    batchNumber,          // e.g. "Batch #7"
    mode,                 // "Online" | "Offline" | "Hybrid"
    venue,                // Offline address OR online platform name
    youtubeLink,          // YouTube Live stream URL (primary)
    youtubeChannelLink,   // YouTube Channel link (for Subscribe button)
    meetLink,             // Optional: Zoom/Meet fallback link
    instructor,           // e.g. "Amit Patel"
    totalSeats,           // e.g. 30 (optional for YouTube live)
    seatsLeft,            // e.g. 12 (optional)
    registrationDeadline, // e.g. "12 August 2026"
    fee,                  // e.g. 999 or 0
    ctaLabel,             // Optional override for button text
  }) => ({
    to: studentEmail,
    subject: bootcampDate
      ? `🚀 Bootcamp Announced — ${bootcampName} | ${bootcampDate}`
      : `🚀 Bootcamp Announced — ${bootcampName} | Date Coming Soon`,
    html: emailTemplate(
      bootcampDate ? `${bootcampName} — Date Confirmed! 🎯` : `${bootcampName} — Coming Soon! 🎯`,
      `
      <p style="font-size:16px;margin-bottom:16px;">Hello <strong>${studentName}</strong>,</p>
      <p style="margin-bottom:20px;">
        We are excited to announce an upcoming bootcamp exclusively for you!
        Get ready for an intensive, hands-on learning experience designed to
        level up your skills — all under expert guidance from
        <strong>${instructor || 'our mentors'}</strong>.
      </p>

      <!-- Bootcamp Date Hero Card -->
      <div style="margin:28px 0;padding:28px;background:linear-gradient(135deg,#fff7ed 0%,#ffedd5 100%);border-radius:20px;border:1px solid #fed7aa;text-align:center;">
        <div style="font-size:11px;font-weight:900;letter-spacing:1.5px;color:#c2410c;text-transform:uppercase;margin-bottom:10px;">📅 Bootcamp Date</div>
        <div style="font-size:32px;font-weight:900;color:#ea580c;letter-spacing:-0.5px;margin-bottom:4px;">
          ${bootcampDate || 'To Be Announced'}
        </div>
        ${bootcampTime ? `<div style="font-size:15px;font-weight:700;color:#9a3412;">⏰ ${bootcampTime}</div>` : ''}
        ${!bootcampDate ? `<div style="margin-top:10px;font-size:12px;color:#c2410c;">We will notify you as soon as the date is finalized.</div>` : ''}
        ${batchNumber ? `<div style="margin-top:12px;display:inline-block;padding:5px 18px;background:#ea580c;border-radius:50px;color:#fff;font-size:12px;font-weight:900;letter-spacing:1px;">${batchNumber}</div>` : ''}
      </div>

      <!-- Details Table -->
      <div style="margin:20px 0;padding:24px;background:#f8fafc;border-radius:18px;border:1px solid #e2e8f0;">
        <div style="font-size:11px;font-weight:900;letter-spacing:1px;color:#ea580c;text-transform:uppercase;margin-bottom:14px;">📋 Bootcamp Details</div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:9px 0;color:#64748b;width:38%;border-bottom:1px solid #f1f5f9;">Bootcamp</td><td style="font-weight:800;color:#0f172a;border-bottom:1px solid #f1f5f9;">${bootcampName}</td></tr>
          <tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Date</td><td style="font-weight:800;color:${bootcampDate ? '#ea580c' : '#94a3b8'};border-bottom:1px solid #f1f5f9;">📅 ${bootcampDate || 'To Be Announced'}</td></tr>
          ${bootcampTime ? `<tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Time</td><td style="font-weight:700;color:#0f172a;border-bottom:1px solid #f1f5f9;">⏰ ${bootcampTime}</td></tr>` : ''}
          <tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Mode</td><td style="font-weight:700;color:#0f172a;border-bottom:1px solid #f1f5f9;">${mode === 'Online' ? '💻 Online' : mode === 'Offline' ? '🏢 Offline' : '🔀 Hybrid'}</td></tr>
          ${venue ? `<tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Venue / Platform</td><td style="font-weight:700;color:#0f172a;border-bottom:1px solid #f1f5f9;">${venue}</td></tr>` : ''}
          ${instructor ? `<tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Instructor</td><td style="font-weight:700;color:#2563eb;border-bottom:1px solid #f1f5f9;">👨‍🏫 ${instructor}</td></tr>` : ''}
          ${totalSeats ? `<tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Total Seats</td><td style="font-weight:700;color:#0f172a;border-bottom:1px solid #f1f5f9;">${totalSeats} seats</td></tr>` : ''}
          ${seatsLeft !== undefined ? `<tr><td style="padding:9px 0;color:#64748b;border-bottom:1px solid #f1f5f9;">Seats Remaining</td><td style="font-weight:900;color:${seatsLeft <= 5 ? '#dc2626' : '#16a34a'};border-bottom:1px solid #f1f5f9;">${seatsLeft <= 5 ? '🔥' : '✅'} Only ${seatsLeft} left!</td></tr>` : ''}
          ${fee !== undefined ? `<tr><td style="padding:9px 0;color:#64748b;">Fee</td><td style="font-weight:900;color:#16a34a;">${fee === 0 ? '🎁 FREE' : `₹${Number(fee).toLocaleString('en-IN')}`}</td></tr>` : ''}
        </table>
      </div>

      <!-- Livestream Platform Notice -->
      <div style="margin:20px 0;padding:18px 22px;background:linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%);border-radius:16px;border:2px solid #fecdd3;text-align:center;">
        <span style="display:inline-block;background:#ff0000;color:#fff;font-size:11px;font-weight:900;letter-spacing:2px;padding:4px 14px;border-radius:50px;text-transform:uppercase;margin-bottom:10px;">🔴 LIVE on YouTube</span>
        <p style="margin:0;font-size:13px;font-weight:700;color:#9f1239;">
          This bootcamp will be streamed live on YouTube.<br>
          The join link will be shared with you shortly.
        </p>
      </div>

      ${registrationDeadline ? `
      <!-- Deadline Warning -->
      <div style="margin:20px 0;padding:16px 20px;background:#fef2f2;border-radius:14px;border-left:4px solid #ef4444;">
        <p style="margin:0;font-size:13px;color:#dc2626;font-weight:800;">⚠️ Registration Deadline: ${registrationDeadline}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#b91c1c;">Confirm your seat before the deadline to avoid missing out!</p>
      </div>
      ` : ''}

      <!-- How to Prepare -->
      <div style="margin:20px 0;padding:20px;background:#f0fdf4;border-radius:16px;border:1px solid #bbf7d0;">
        <div style="font-size:13px;font-weight:900;color:#166534;margin-bottom:10px;">✅ How to Prepare</div>
        <ul style="padding-left:18px;color:#475569;font-size:13px;line-height:1.9;margin:0;">
          <li>Keep a <strong>notebook or laptop</strong> ready for live exercises</li>
          <li>Ensure a stable internet connection for online sessions</li>
          <li>Join the session <strong>10 minutes early</strong> for setup</li>
          <li>Feel free to reply to this email if you have any questions</li>
        </ul>
      </div>

      <p style="font-size:14px;color:#64748b;margin-top:24px;">
        This bootcamp has been specially curated to give you <strong>real-world skills</strong>
        in a focused, result-oriented environment. We look forward to seeing you there! 🎊
      </p>
      `,
      ctaLabel || '📅 View My Dashboard',
      `${SITE_URL}/customer`,
      '#ea580c',
      'BOOTCAMP',
      `${SITE_URL}/unsubscribe`
    )
  }),

  // 15. Bootcamp YouTube Link — Send when link is ready (separate follow-up email)
  bootcamp_youtube_link: ({
    studentName,
    studentEmail,
    bootcampName,
    bootcampDate,       // e.g. "15 August 2026"
    bootcampTime,       // e.g. "10:00 AM IST"
    youtubeLink,        // The YouTube Live URL (now available!)
    youtubeChannelLink, // Optional: channel subscribe link
    instructor,         // e.g. "Amit Patel"
  }) => ({
    to: studentEmail,
    subject: `🔴 YouTube Live Link is Here! — ${bootcampName}${bootcampDate ? ' | ' + bootcampDate : ''}`,
    html: emailTemplate(
      `Your YouTube Live Link is Ready! 🎯`,
      `
      <p style="font-size:16px;margin-bottom:16px;">Hello <strong>${studentName}</strong>,</p>
      <p style="margin-bottom:8px;">
        The wait is over! The YouTube Live link for <strong>${bootcampName}</strong> is now available.
        Click the button below and hit <strong>Set Reminder</strong> so you get notified
        the moment we go live! 🔔
      </p>

      <!-- Date Reminder Strip -->
      ${bootcampDate ? `
      <div style="margin:20px 0;padding:14px 20px;background:#fff7ed;border-radius:14px;border-left:4px solid #ea580c;">
        <div style="font-size:12px;color:#c2410c;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Bootcamp Date</div>
        <div style="font-size:16px;font-weight:800;color:#ea580c;">📅 ${bootcampDate}${bootcampTime ? ' &nbsp;⏰ ' + bootcampTime : ''}</div>
      </div>
      ` : ''}

      <!-- YouTube Live Big Card -->
      <div style="margin:24px 0;padding:28px;background:linear-gradient(135deg,#fff1f2 0%,#ffe4e6 100%);border-radius:20px;border:2px solid #fecdd3;text-align:center;">
        <div style="margin-bottom:12px;">
          <span style="display:inline-block;background:#ff0000;color:#fff;font-size:11px;font-weight:900;letter-spacing:2px;padding:5px 16px;border-radius:50px;text-transform:uppercase;">🔴 LIVE on YouTube</span>
        </div>
        <div style="font-size:14px;font-weight:700;color:#9f1239;margin-bottom:18px;">
          Save this link — the bootcamp will be streamed here!
        </div>

        <!-- Link Box -->
        <div style="margin:0 auto 18px;padding:12px 16px;background:#fff;border-radius:12px;border:1px solid #fecdd3;word-break:break-all;font-size:13px;color:#be123c;font-weight:700;">
          ${youtubeLink}
        </div>

        <a href="${youtubeLink}" style="display:inline-block;background:#ff0000;color:#ffffff;padding:16px 36px;border-radius:50px;font-weight:900;font-size:16px;text-decoration:none;box-shadow:0 8px 24px -4px rgba(255,0,0,0.45);letter-spacing:0.3px;">
          ▶ Watch on YouTube
        </a>

        <p style="margin:16px 0 4px;font-size:12px;color:#be123c;">
          👆 Click the link above → press <strong>"Set Reminder"</strong>
        </p>
        <p style="margin:0;font-size:11px;color:#9f1239;">
          YouTube will automatically notify you when we go live 🚀
        </p>
      </div>

      ${youtubeChannelLink ? `
      <!-- Subscribe Box -->
      <div style="margin:16px 0;padding:18px 20px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0;text-align:center;">
        <div style="font-size:13px;font-weight:800;color:#0f172a;margin-bottom:8px;">📢 Not Subscribed Yet?</div>
        <p style="margin:0 0 12px;font-size:12px;color:#64748b;">
          Subscribe to our channel to stay updated on future bootcamps, tutorials, and live sessions!
        </p>
        <a href="${youtubeChannelLink}" style="display:inline-block;background:#ff0000;color:#ffffff;padding:11px 28px;border-radius:50px;font-weight:800;font-size:13px;text-decoration:none;">
          🔔 Subscribe Now
        </a>
        <p style="margin:10px 0 0;font-size:11px;color:#94a3b8;">After subscribing, set notifications to ALL 🔔 to never miss a live session.</p>
      </div>
      ` : ''}

      <!-- Quick Steps -->
      <div style="margin:20px 0;padding:18px 20px;background:#f0fdf4;border-radius:14px;border:1px solid #bbf7d0;">
        <div style="font-size:13px;font-weight:900;color:#166534;margin-bottom:8px;">✅ 3 Quick Steps:</div>
        <ol style="padding-left:18px;color:#475569;font-size:13px;line-height:2;margin:0;">
          <li>Click the <a href="${youtubeLink}" style="color:#ff0000;font-weight:700;text-decoration:none;">YouTube Live link</a></li>
          <li>Press the <strong>Set Reminder</strong> button (🔔 bell icon)</li>
          <li>Show up on bootcamp day${bootcampTime ? ' at <strong>' + bootcampTime + '</strong>' : ''} and enjoy learning!</li>
        </ol>
      </div>

      <p style="font-size:13px;color:#94a3b8;margin-top:20px;text-align:center;">
        Have any questions? Simply reply to this email —
        <strong>${instructor || 'Amit Patel'}</strong> will personally get back to you. 💬
      </p>
      `,
      '▶ Watch on YouTube',
      youtubeLink,
      '#ff0000',
      'YOUTUBE LIVE',
      `${SITE_URL}/unsubscribe`
    )
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

// ── POST /api/notify/bootcamp-broadcast — Send bootcamp email to ALL enrolled students ──
//    Body: same fields as bootcamp_date_announcement template
//    Auth: Admin only (uses verifyFirebaseToken from admin middleware)

router.post('/bootcamp-broadcast', async (req, res) => {
  try {
    const {
      bootcampName,
      bootcampDate,
      bootcampTime,
      batchNumber,
      mode,
      venue,
      youtubeLink,
      youtubeChannelLink,
      meetLink,
      instructor,
      totalSeats,
      seatsLeft,
      registrationDeadline,
      fee,
      emailType,         // 'bootcamp_date_announcement' (default) OR 'bootcamp_youtube_link'
      manualEmails,      // optional: comma/newline separated emails to override DB fetch
    } = req.body

    if (!bootcampName) {
      return res.status(400).json({ success: false, message: 'bootcampName is required' })
    }

    const type = emailType || 'bootcamp_date_announcement'
    const builder = templates[type]
    if (!builder) {
      return res.status(400).json({ success: false, message: `Unknown emailType: ${type}` })
    }

    // ── Fetch Recipients ──────────────────────────────────────────────────────
    let students = []

    if (manualEmails) {
      // Manual override — parse email list, use email as name fallback
      const emails = manualEmails
        .split(/[\n,]+/)
        .map(e => e.trim())
        .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
      students = emails.map(email => ({ email, name: email.split('@')[0] }))
    } else {
      // Fetch all active enrolled students from MongoDB
      const db = getDb()
      const enrollments = await db
        .collection('enrollments')
        .find({ status: 'active' })
        .project({ userEmail: 1, userName: 1, name: 1, studentName: 1, _id: 0 })
        .toArray()

      // Deduplicate by email
      const seen = new Set()
      for (const doc of enrollments) {
        const email = doc.userEmail?.trim()
        if (!email || seen.has(email)) continue
        seen.add(email)
        students.push({
          email,
          name: doc.userName || doc.studentName || doc.name || email.split('@')[0],
        })
      }
    }

    if (students.length === 0) {
      return res.status(400).json({ success: false, message: 'No enrolled students found to email.' })
    }

    logger.info(`[bootcamp-broadcast] Starting broadcast of type=${type} to ${students.length} students`)

    // ── Send in batches of 50 ─────────────────────────────────────────────────
    const results = { sent: 0, failed: 0, skipped: 0 }
    const BATCH_SIZE = 50
    const BATCH_DELAY_MS = 1000  // 1s pause between batches to avoid SMTP rate limits

    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batch = students.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map(async ({ email, name }) => {
          try {
            const emailOpts = builder({
              studentName: name,
              studentEmail: email,
              bootcampName,
              bootcampDate,
              bootcampTime,
              batchNumber,
              mode: mode || 'Online',
              venue,
              youtubeLink,
              youtubeChannelLink,
              meetLink,
              instructor,
              totalSeats,
              seatsLeft,
              registrationDeadline,
              fee,
            })

            await sendEmail(emailOpts)
            results.sent++
          } catch (err) {
            logger.error(`[bootcamp-broadcast] Failed for ${email}: ${err.message}`)
            results.failed++
          }
        })
      )

      // Pause between batches (skip after last batch)
      if (i + BATCH_SIZE < students.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
      }
    }

    logger.info(`[bootcamp-broadcast] Done. Sent=${results.sent} Failed=${results.failed} Skipped=${results.skipped}`)

    res.json({
      success: true,
      message: `Bootcamp broadcast complete!`,
      total: students.length,
      sent: results.sent,
      failed: results.failed,
    })

  } catch (error) {
    logger.error(`[bootcamp-broadcast] Error: ${error.message}`)
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router
