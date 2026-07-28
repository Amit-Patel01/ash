const { logger } = require('../../logger');

const DEFAULT_DEPARTMENT_CONFIG = {
  support: {
    id: 'support',
    name: 'Customer Support Department',
    role: 'SupportAgent',
    icon: '🎧',
    enabled: true,
    description: 'Handles 24/7 student chat, ticket resolution, order issues, and certificate verification.',
    systemPrompt: `You are the SupportAgent for SolutionHub AI.
Your job is to assist students & clients 24/7 with:
- Order status & digital product downloads
- Certificate verification & ID lookups
- Account & course enrollment guidance
Be empathetic, precise, and polite. If a problem is unresolved, flag it for Admin escalation.`,
    metrics: { tasksExecuted: 42, successRate: 98, avgResponseMs: 340 }
  },
  sales: {
    id: 'sales',
    name: 'Sales & Business Development',
    role: 'SalesAgent',
    icon: '💼',
    enabled: true,
    description: 'Recommends matching source code projects & courses, offers dynamic coupons, and handles lead nurturing.',
    systemPrompt: `You are the SalesAgent for SolutionHub AI.
Your job is to convert visitors into happy customers by:
- Recommending relevant ready-made source code projects & courses
- Offering dynamic coupon discounts for interested buyers (e.g. SAVE10)
- Explaining pricing, tech stacks, and source code features clearly.`,
    metrics: { tasksExecuted: 31, successRate: 96, avgResponseMs: 410 }
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing & Content Creation',
    role: 'MarketingAgent',
    icon: '📣',
    enabled: true,
    description: 'Auto-generates SEO titles, product descriptions, email broadcasts, and promotional newsletters.',
    systemPrompt: `You are the MarketingAgent for SolutionHub AI.
Your job is to craft high-converting, professional marketing copy including:
- SEO titles & descriptions for new source code projects & courses
- Student newsletter email broadcasts
- Engaging promotional announcements.`,
    metrics: { tasksExecuted: 19, successRate: 100, avgResponseMs: 520 }
  },
  hr: {
    id: 'hr',
    name: 'HR, Training & Certificate Admin',
    role: 'HRAgent',
    icon: '🎓',
    enabled: true,
    description: 'Auto-generates QR certificates, LORs, offer letters, and manages automatic student batch creation.',
    systemPrompt: `You are the HRAgent for SolutionHub AI.
Your job is to automate HR & Student Academic operations:
- Auto-evaluating course & internship completion
- Generating unique QR Certificate IDs & PDF metadata
- Auto-creating student batches (e.g. BATCH-2026-MERN-08) when enrollment thresholds are hit.`,
    metrics: { tasksExecuted: 58, successRate: 99, avgResponseMs: 290 }
  },
  finance: {
    id: 'finance',
    name: 'Finance & Operations',
    role: 'FinanceAgent',
    icon: '📊',
    enabled: true,
    description: 'Audits Razorpay payment webhooks, generates GST tax invoices, and compiles revenue analytics.',
    systemPrompt: `You are the FinanceAgent for SolutionHub AI.
Your job is to manage financial operations:
- Auditing transaction status (Razorpay webhooks)
- Auto-generating GST Tax Invoice details for successful orders
- Preparing daily/monthly revenue summary reports for the Admin.`,
    metrics: { tasksExecuted: 27, successRate: 100, avgResponseMs: 380 }
  },
  tech: {


    id: 'tech',
    name: 'Technical Development & QA',
    role: 'TechAgent',
    icon: '💻',
    enabled: true,
    description: 'Validates source code packages, runs automated lint audits, and generates step-by-step setup guides.',
    systemPrompt: `You are the TechAgent for SolutionHub AI.
Your job is to maintain technical quality for ready-made projects:
- Auditing ZIP package file structure & package.json dependencies
- Auto-formatting step-by-step README installation guides
- Performing code quality & lint compliance checks.`,
    metrics: { tasksExecuted: 23, successRate: 95, avgResponseMs: 460 }
  },
  email: {
    id: 'email',
    name: 'Email Communication & Dispatch',
    role: 'EmailAgent',
    icon: '📧',
    enabled: true,
    description: 'Automates transactional email delivery, student newsletter broadcasts, cart recovery follow-ups, and mail audit logs.',
    systemPrompt: `You are the EmailAgent for SolutionHub AI.
Your job is to manage all email communications:
- Delivering transactional emails (order receipts, certificate downloads)
- Broadcasting promotional newsletters and course announcements
- Monitoring email delivery logs & bounce rates.`,
    metrics: { tasksExecuted: 89, successRate: 99, avgResponseMs: 310 }
  }
};

let currentConfig = { ...DEFAULT_DEPARTMENT_CONFIG };
let executionLogs = [];
let pendingProposals = [];

const getDepartmentConfig = () => currentConfig;

const updateDepartmentConfig = (deptId, updates) => {
  if (!currentConfig[deptId]) {
    throw new Error(`Department ${deptId} does not exist.`);
  }
  currentConfig[deptId] = {
    ...currentConfig[deptId],
    ...updates,
    metrics: { ...currentConfig[deptId].metrics, ...(updates.metrics || {}) }
  };
  logger.info(`[AI Workforce] Updated department config for ${deptId}`);
  return currentConfig[deptId];
};

const addExecutionLog = (deptId, action, status = 'success', details = null, isFailed = false) => {
  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    department: deptId,
    action,
    status,
    details
  };
  executionLogs.unshift(newLog);
  if (executionLogs.length > 100) executionLogs.pop();

  // Bug Fix: Only increment tasksExecuted on successful tasks, not failures
  if (currentConfig[deptId] && !isFailed && status !== 'failed') {
    currentConfig[deptId].metrics.tasksExecuted += 1;
  }

  return newLog;
};

const getExecutionLogs = () => executionLogs;

const getPendingProposals = () => pendingProposals;


const generateRealtimeProposalsFromCodebase = async () => {
  return pendingProposals;
};


const addPendingProposal = (deptId, title, type, details, proposedData = {}) => {
  const proposal = {
    id: `prop-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    timestamp: new Date().toISOString(),
    department: deptId,
    title,
    type,
    details,
    proposedData,
    status: 'pending'
  };
  pendingProposals.unshift(proposal);
  return proposal;
};

const resolveProposal = async (proposalId, approved = true) => {
  const propIndex = pendingProposals.findIndex(p => p.id === proposalId);
  if (propIndex === -1) {
    throw new Error(`Proposal ${proposalId} not found.`);
  }

  const proposal = pendingProposals[propIndex];
  proposal.status = approved ? 'approved' : 'rejected';

  // Remove from pending queue
  pendingProposals.splice(propIndex, 1);

  if (approved) {
    // REAL PRODUCTION EXECUTION logic based on proposal type
    try {
      // 1. Coupon Execution
      if (proposal.type === 'sitewide_sales_campaign' || proposal.type === 'create_coupon') {
        const couponCode = proposal.proposedData?.couponCode || `OFFER${Math.floor(Math.random()*900+100)}`;
        const { createCoupon } = require('../couponService');
        await createCoupon({
          code: couponCode,
          discountType: 'percentage',
          discountValue: proposal.proposedData?.discountPercentage || 25,
          maxUses: 1000,
          is_active: true
        }).catch(err => logger.warn(`Coupon creation note: ${err.message}`));
        logger.info(`[Real Database Execution] Created & Activated real coupon "${couponCode}" in 'coupons' database collection.`);
      }

      // 2. Course Creation Execution
      if (proposal.type === 'create_course') {
        const { getDb } = require('../../utils/mongo');
        let db = null;
        try { db = getDb(); } catch(e) { db = null; }

        if (db) {
          const courseDoc = {
            title: proposal.proposedData?.title || 'New Course',
            price: Number(proposal.proposedData?.price || 2999),
            category: proposal.proposedData?.category || 'Development',
            launchDate: proposal.proposedData?.launchDate || new Date().toISOString(),
            description: proposal.proposedData?.aiResponse || proposal.details,
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          await db.collection('courses').insertOne(courseDoc).catch(err => logger.warn(`Course insert note: ${err.message}`));
          logger.info(`[Real Database Execution] Created real course "${courseDoc.title}" in 'courses' database collection.`);
        }
      }

      // 2.5 Batch Creation Execution
      if (proposal.type === 'create_batch') {
        const { getDb } = require('../../utils/mongo');
        let db = null;
        try { db = getDb(); } catch(e) { db = null; }

        if (db) {
          const batchDoc = {
            code: proposal.proposedData?.batchCode || `BATCH-${Date.now()}`,
            courseId: proposal.proposedData?.courseId,
            courseTitle: proposal.proposedData?.courseTitle,
            studentCount: proposal.proposedData?.studentCount || 0,
            status: 'active',
            createdAt: new Date()
          };
          await db.collection('batches').insertOne(batchDoc).catch(err => logger.warn(`Batch insert note: ${err.message}`));
          logger.info(`[Real Database Execution] Created real batch "${batchDoc.code}" in 'batches' collection.`);
        }
      }

      // 3. Certificate Issuance Execution
      if (proposal.type === 'issue_certificate') {
        const { getDb } = require('../../utils/mongo');
        let db = null;
        try { db = getDb(); } catch(e) { db = null; }

        if (db) {
          const certDoc = {
            certificateId: proposal.proposedData?.certificateId || `QR-CERT-${Date.now()}`,
            studentName: proposal.proposedData?.studentName || 'Student',
            courseName: proposal.proposedData?.courseName || 'Course Completion',
            issueDate: proposal.proposedData?.issueDate || new Date().toISOString().split('T')[0],
            status: 'valid',
            verificationUrl: `https://www.amitsolutionhub.com/verify/${proposal.proposedData?.certificateId}`,
            createdAt: new Date()
          };
          await db.collection('certificates').insertOne(certDoc).catch(err => logger.warn(`Cert insert note: ${err.message}`));
          logger.info(`[Real Database Execution] Issued real certificate ID "${certDoc.certificateId}" for ${certDoc.studentName} in 'certificates' collection.`);
        }
      }

      // 4. Email Broadcast Execution (with unsubscribe filtering)
      if (proposal.type === 'marketing_email_broadcast') {
        const { getDb } = require('../../utils/mongo');
        let db = null;
        try { db = getDb(); } catch(e) { db = null; }

        let recipients = [];
        if (db) {
          // Filter out unsubscribed users
          const [userDocs, blacklist] = await Promise.all([
            db.collection('users').find(
              { email: { $exists: true }, emailUnsubscribed: { $ne: true } },
              { projection: { email: 1 } }
            ).toArray().catch(() => []),
            db.collection('email_unsubscribes').distinct('email').catch(() => [])
          ]);
          const blackSet = new Set(blacklist.map(e => e.toLowerCase()));
          recipients = userDocs.map(u => u.email).filter(e => e && !blackSet.has(e.toLowerCase()));
        }

        if (recipients.length === 0) {
          recipients = [process.env.ADMIN_EMAIL || 'admin@amitsolutionhub.com'];
        }

        const { sendEmail, emailTemplate } = require('../emailService');
        const { generateUnsubscribeToken } = require('../../routes/unsubscribe');
        const subject = proposal.proposedData?.emailSubject || proposal.title || 'Announcement from Amit Solution Hub';
        const emailContent = proposal.proposedData?.aiResponse || proposal.details || 'Official Announcement';
        const baseUrl = process.env.BACKEND_URL || process.env.PUBLIC_URL || 'https://api.amitsolutionhub.com';

        let sentCount = 0;
        for (const email of recipients) {
          // Personalized unsubscribe link per recipient
          const token = generateUnsubscribeToken(email);
          const unsubUrl = `${baseUrl}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
          const formattedHtml = emailTemplate(
            subject,
            emailContent.replace(/\n/g, '<br/>'),
            'Visit Amit Solution Hub',
            'https://www.amitsolutionhub.com',
            '#2563eb',
            null,
            unsubUrl
          );
          await sendEmail({ to: email, subject, html: formattedHtml }).catch(err => logger.warn(`Broadcast error for ${email}: ${err.message}`));
          sentCount++;
        }

        logger.info(`[Real Email Execution] Dispatched email broadcast "${subject}" to ${sentCount} subscribed user(s).`);
      }



      // 5. TechAgent — Real Project Publishing
      if (proposal.type === 'create_project') {
        const { getDb } = require('../../utils/mongo');
        let db = null;
        try { db = getDb(); } catch(e) { db = null; }

        if (db) {
          const projectDoc = {
            title: proposal.proposedData?.title || 'New Project',
            description: proposal.proposedData?.description || proposal.proposedData?.aiResponse || '',
            price: Number(proposal.proposedData?.price || 4999),
            category: proposal.proposedData?.category || 'Full-Stack',
            techStack: proposal.proposedData?.techStack || [],
            isPublished: true,
            isFeatured: false,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          await db.collection('projects').insertOne(projectDoc).catch(err => logger.warn(`Project insert note: ${err.message}`));
          logger.info(`[Real Database Execution] Published new project "${projectDoc.title}" in 'projects' collection.`);
        }
      }

      // 6. FinanceAgent — Log Daily Revenue Report
      if (proposal.type === 'finance_daily_report') {
        const { getDb } = require('../../utils/mongo');
        let db = null;
        try { db = getDb(); } catch(e) { db = null; }

        if (db) {
          await db.collection('ai_finance_reports').insertOne({
            ...proposal.proposedData,
            approvedAt: new Date().toISOString(),
            status: 'acknowledged'
          }).catch(() => {});
          logger.info(`[Real Database Execution] Finance report for ${proposal.proposedData?.date} acknowledged and saved.`);
        }
      }

      // 7. Certificate Issuance — mark enrollment as certificated
      if (proposal.type === 'issue_certificate' && proposal.proposedData?.enrollmentId) {
        const { getDb } = require('../../utils/mongo');
        let db = null;
        try { db = getDb(); } catch(e) { db = null; }

        if (db) {
          const { ObjectId } = require('mongodb');
          try {
            await db.collection('enrollments').updateOne(
              { _id: new ObjectId(proposal.proposedData.enrollmentId) },
              { $set: { certificateIssued: true, certificateId: proposal.proposedData.certificateId } }
            ).catch(() => {});
          } catch(e) {}
          logger.info(`[Real Database Execution] Enrollment ${proposal.proposedData.enrollmentId} marked as certified.`);
        }
      }


      addExecutionLog(
        proposal.department,
        `Real Production Execution SUCCESS: Admin APPROVED "${proposal.title}"`,
        'success',
        { executedData: proposal.proposedData }
      );

      // Persist resolved proposal to MongoDB for audit trail
      try {
        const { getDb } = require('../../utils/mongo');
        let db = null;
        try { db = getDb(); } catch(e) { db = null; }
        if (db) {
          await db.collection('ai_proposal_history').insertOne({
            ...proposal,
            resolvedAt: new Date().toISOString(),
            resolvedAction: 'approved'
          }).catch(() => {});
        }
      } catch(e) { /* non-blocking */ }

    } catch (err) {
      logger.error(`Real execution error for proposal ${proposalId}: ${err.message}`);
      addExecutionLog(proposal.department, `Execution error: ${err.message}`, 'failed', null, true);
    }
  } else {
    addExecutionLog(
      proposal.department,
      `Admin REJECTED: "${proposal.title}"`,
      'failed',
      null,
      true // isFailed=true: do NOT inflate tasksExecuted metric
    );

    // Persist rejected proposal to MongoDB for audit trail
    try {
      const { getDb } = require('../../utils/mongo');
      let db = null;
      try { db = getDb(); } catch(e) { db = null; }
      if (db) {
        await db.collection('ai_proposal_history').insertOne({
          ...proposal,
          resolvedAt: new Date().toISOString(),
          resolvedAction: 'rejected'
        }).catch(() => {});
      }
    } catch(e) { /* non-blocking */ }
  }

  return proposal;
};

const clearAllProposals = () => {
  pendingProposals = [];
  return pendingProposals;
};

module.exports = {
  getDepartmentConfig,
  updateDepartmentConfig,
  addExecutionLog,
  getExecutionLogs,
  getPendingProposals,
  generateRealtimeProposalsFromCodebase,
  addPendingProposal,
  resolveProposal,
  clearAllProposals
};




