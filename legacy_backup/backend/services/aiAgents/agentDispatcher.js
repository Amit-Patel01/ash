const { generateText } = require('../aiService');
const { getDepartmentConfig, addExecutionLog } = require('./departmentConfig');
const { logger } = require('../../logger');

/**
 * Smart Intent Classifier
 * Analyses prompt text to determine what real action the AI should perform.
 * Priority order: Coupon > Course > Certificate > Email > General
 */
const classifyIntent = (prompt, department, aiResponse) => {
  const lowerPrompt = prompt.toLowerCase();

  // 1. Email / Broadcast Intent (Highest priority if prompt is an email draft or explicitly email-related)
  if (
    lowerPrompt.startsWith('subject:') ||
    lowerPrompt.includes('subject:') ||
    lowerPrompt.includes('mail') ||
    lowerPrompt.includes('email') ||
    lowerPrompt.includes('broadcast') ||
    lowerPrompt.includes('newsletter') ||
    lowerPrompt.includes('dear ') ||
    department === 'email'
  ) {
    const subjectMatch = (prompt + '\n' + aiResponse).match(/Subject:\s*([^\n]+)/i);
    const emailSubject = subjectMatch ? subjectMatch[1].trim() : `Announcement: ${prompt.slice(0, 40)}`;
    return {
      proposalType: 'marketing_email_broadcast',
      proposalTitle: `📢 Email Broadcast: "${emailSubject}"`,
      proposalDetails: `Prepared HTML email campaign. Click Approve to send to all registered users in database.`,
      proposedData: { emailSubject, aiResponse: aiResponse || prompt }
    };
  }

  // 2. Coupon / Discount Intent
  if (lowerPrompt.includes('coupon') || lowerPrompt.includes('discount') || lowerPrompt.includes('create code')) {
    const codeMatch = prompt.match(/(?:code|coupon|offer)\s+([A-Za-z0-9]+)/i);
    const discountMatch = prompt.match(/(\d+)\s*%/);
    const couponCode = codeMatch ? codeMatch[1].toUpperCase() : `OFFER${Math.floor(Math.random() * 900 + 100)}`;
    const discountPercentage = discountMatch ? parseInt(discountMatch[1]) : 20;

    return {
      proposalType: 'create_coupon',
      proposalTitle: `💼 Activate Discount Coupon "${couponCode}" (${discountPercentage}% Off)`,
      proposalDetails: `${getDeptRole(department)} generated a real coupon code. Click Approve to activate for checkout in the database.`,
      proposedData: { couponCode, discountPercentage, validDays: 14, aiResponse }
    };
  }

  // 2. Course Creation Intent
  if (lowerPrompt.includes('course') || lowerPrompt.includes('syllabus') || lowerPrompt.includes('launch') || lowerPrompt.includes('batch')) {
    // Extract proper course title — not raw prompt
    const courseNameMatch = prompt.match(/(?:course|create|launch|named?)\s+["']?([A-Za-z0-9\s\+\-&]+?)["']?(?:\s+for|\s+at|\s+on|\s*$)/i);
    const courseTitle = courseNameMatch ? courseNameMatch[1].trim().slice(0, 60) : prompt.replace(/course|create|launch/gi, '').trim().slice(0, 50) || 'New Course';
    const priceMatch = prompt.match(/(?:₹|rs\.?|inr)\s*(\d+)/i);
    const price = priceMatch ? parseInt(priceMatch[1]) : 2999;

    return {
      proposalType: 'create_course',
      proposalTitle: `🎓 Create & Schedule Course: "${courseTitle}"`,
      proposalDetails: `Agent structured course syllabus, pricing (₹${price}), and launch schedule. Click Approve to save to MongoDB 'courses' collection.`,
      proposedData: { title: courseTitle, price, category: 'Development', launchDate: new Date(Date.now() + 864000000).toISOString().split('T')[0], aiResponse }
    };
  }

  // 3. Certificate Intent
  if (lowerPrompt.includes('certificate') || lowerPrompt.includes('cert')) {
    const nameMatch = prompt.match(/(?:for|name|student|issue)\s+([A-Za-z\s]{2,30}?)(?:\s+for|\s+course|certificate|\.|$)/i);
    const studentName = nameMatch ? nameMatch[1].trim() : 'Student';
    const courseMatch = prompt.match(/(?:in|for|course)\s+([A-Za-z0-9\s\+\-]{3,40}?)(?:\s+on|\s+dated|$)/i);
    const courseName = courseMatch ? courseMatch[1].trim() : 'Full-Stack Web Development';
    const certId = `QR-${Date.now().toString(36).toUpperCase()}`;

    return {
      proposalType: 'issue_certificate',
      proposalTitle: `📜 Issue Certificate for ${studentName}`,
      proposalDetails: `HRAgent generated Certificate ID ${certId} for ${studentName} (${courseName}). Click Approve to save to 'certificates' collection.`,
      proposedData: { studentName, courseName, certificateId: certId, issueDate: new Date().toISOString().split('T')[0], aiResponse }
    };
  }

  // 4. Email / Broadcast Intent
  if (lowerPrompt.includes('mail') || lowerPrompt.includes('email') || lowerPrompt.includes('broadcast') || lowerPrompt.includes('newsletter') || department === 'email') {
    const subjectMatch = aiResponse.match(/Subject:\s*(.+)/i);
    const emailSubject = subjectMatch ? subjectMatch[1].trim() : `Announcement: ${prompt.slice(0, 40)}`;
    return {
      proposalType: 'marketing_email_broadcast',
      proposalTitle: `📢 Email Broadcast: "${emailSubject}"`,
      proposalDetails: `EmailAgent prepared HTML email campaign. Click Approve to send to all registered users in 'users' database.`,
      proposedData: { emailSubject, aiResponse }
    };
  }

  // 5. Tech QA & Package / Dependency Audit Intent
  if (lowerPrompt.includes('zip') || lowerPrompt.includes('package') || lowerPrompt.includes('dependency') || lowerPrompt.includes('lint') || (department === 'tech' && lowerPrompt.includes('scan'))) {
    const cleanTitlePrompt = prompt.replace(/[*_#"`']/g, '').replace(/Autonomous scan requested by Admin for department/i, 'Scan:').trim();
    return {
      proposalType: 'tech_qa_audit',
      proposalTitle: `💻 Tech QA & Package Audit: "${cleanTitlePrompt.slice(0, 50)}${cleanTitlePrompt.length > 50 ? '...' : ''}"`,
      proposalDetails: `TechAgent completed ZIP package structure & package.json dependency validation. Review findings below.`,
      proposedData: { prompt, aiResponse }
    };
  }

  // 6. Clean fallback title (strip raw markdown symbols like ** from title)
  const cleanPrompt = prompt.replace(/[*_#"`']/g, '').replace(/Autonomous scan requested by Admin for department/i, 'Department Scan:').trim();
  const displayTitle = cleanPrompt.length > 55 ? `${cleanPrompt.slice(0, 55)}...` : cleanPrompt;

  return {
    proposalType: 'general_ai_task',
    proposalTitle: `🤖 ${getDeptRole(department)} Task: "${displayTitle}"`,
    proposalDetails: `AI Agent completed task analysis. Review output and approve to acknowledge.`,
    proposedData: { prompt, aiResponse }
  };
};

const getDeptRole = (dept) => {
  const roles = { support: 'SupportAgent', sales: 'SalesAgent', marketing: 'MarketingAgent', hr: 'HRAgent', finance: 'FinanceAgent', tech: 'TechAgent', email: 'EmailAgent' };
  return roles[dept] || 'AIAgent';
};

/**
 * Dispatch a task to a specific AI Department Agent
 */
const dispatchDepartmentTask = async ({ department, prompt, context = {} }) => {
  const allConfigs = getDepartmentConfig();
  const config = allConfigs[department];

  if (!config) {
    throw new Error(`Invalid department ID: ${department}`);
  }

  if (!config.enabled) {
    addExecutionLog(department, `Task rejected: Department is disabled by Admin`, 'failed', null, true);
    return {
      success: false,
      department,
      role: config.role,
      message: `The ${config.name} is currently disabled by Admin.`
    };
  }

  const fullInstruction = `${config.systemPrompt}\n\nAdditional Context:\n${JSON.stringify(context, null, 2)}`;
  const startTime = Date.now();

  try {
    const aiResponse = await generateText({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: fullInstruction,
      temperature: 0.6,
      maxOutputTokens: 800
    });

    const { addPendingProposal } = require('./departmentConfig');

    // Smart Intent Classification
    const { proposalType, proposalTitle, proposalDetails, proposedData } = classifyIntent(prompt, department, aiResponse);

    const proposal = addPendingProposal(department, proposalTitle, proposalType, proposalDetails, proposedData);

    const executionMs = Date.now() - startTime;
    const logEntry = addExecutionLog(
      department,
      `AI Agent created approval proposal: ${proposalTitle}`,
      'success',
      { executionMs, proposalId: proposal.id }
    );

    logger.info(`[AI Dispatcher] ${config.role} created approval proposal ${proposal.id} in ${executionMs}ms`);

    return {
      success: true,
      department,
      role: config.role,
      reply: aiResponse,
      proposal,
      executionMs,
      logId: logEntry.id
    };

  } catch (error) {
    const executionMs = Date.now() - startTime;
    logger.error(`[AI Dispatcher] ${config.role} error: ${error.message}`);
    addExecutionLog(department, `Execution error: ${error.message}`, 'failed', null, true);

    return {
      success: false,
      department,
      role: config.role,
      message: `Execution failed in ${config.name}: ${error.message}`,
      executionMs
    };
  }
};

module.exports = {
  dispatchDepartmentTask
};
