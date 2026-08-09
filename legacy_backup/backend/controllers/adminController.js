const fs = require("fs");
const path = require("path");
const { sendEmail, emailTemplate } = require("../services/emailService");
const { getActiveEnrolledEmails } = require("../services/firebaseService");
const { getDb } = require("../utils/mongo");
const { ObjectId } = require("mongodb");
const { logger } = require("../logger");
const {
  listUsersFromSql,
  createManagedUser,
  updateManagedUser,
  deleteManagedUser,
  mergeManagedUsers,
  approveAccountRequest,
  rejectAccountRequest,
  deleteAccountRequest,
  listEmployeeCvRecords,
  getManagedUser,
  revokeUserSession,
} = require("../services/userService");

const dedupeEmails = (emails) => [...new Set(emails.filter(Boolean))];
const HTML_ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => HTML_ESCAPE_MAP[char] || char);

const formatMessageHtml = (message = "") =>
  escapeHtml(message)
    .split(/\r?\n\r?\n/)
    .map((block) => `<p style="margin: 0 0 18px;">${block.replace(/\r?\n/g, "<br />")}</p>`)
    .join("");

const guessImageContentType = (imageUrl = "") => {
  const lowered = String(imageUrl).toLowerCase();
  if (lowered.endsWith(".png")) return "image/png";
  if (lowered.endsWith(".webp")) return "image/webp";
  if (lowered.endsWith(".jpg") || lowered.endsWith(".jpeg")) return "image/jpeg";
  if (lowered.endsWith(".gif")) return "image/gif";
  return "image/png";
};

const getAttachmentFilename = (imageUrl = "", imageLabel = "") => {
  const fallbackBase = String(imageLabel || "broadcast-image")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  try {
    const pathname = new URL(imageUrl).pathname || "";
    const remoteName = pathname.split("/").pop();
    if (remoteName) return remoteName;
  } catch (error) {
    logger.warn(`Unable to parse broadcast image URL for filename: ${error.message}`);
  }

  const extension = guessImageContentType(imageUrl).split("/")[1] || "png";
  return `${fallbackBase || "broadcast-image"}.${extension}`;
};

const buildBroadcastContent = ({ message, imageUrl, imageLabel }) => {
  const safeImageUrl = imageUrl ? escapeHtml(imageUrl) : "";
  const safeImageLabel = escapeHtml(imageLabel || "Broadcast image");
  const imageBlock = safeImageUrl
    ? `
      <div style="margin: 0 0 24px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px;">
        <img src="${safeImageUrl}" alt="${safeImageLabel}" style="display: block; width: 100%; max-height: 320px; object-fit: contain; border-radius: 14px; background: #ffffff;" />
        <p style="margin: 12px 0 0; font-size: 12px; color: #64748b; text-align: center;">${safeImageLabel}</p>
      </div>
    `
    : "";

  return `
    ${imageBlock}
    <div style="font-size: 15px; color: #334155; line-height: 1.8;">
      ${formatMessageHtml(message)}
    </div>
  `;
};

const getActiveGenericEnrolledEmails = async () => {
  const docs = await getDb()
    .collection("enrollments")
    .find({ status: "active" })
    .toArray();

  return dedupeEmails(docs.map((d) => d.userEmail));
};

const getGenericCourseEnrollments = async (courseId, courseTitle) => {
  const enrollments = await getDb()
    .collection("enrollments")
    .find({ courseId, status: "active" })
    .toArray();

  if (!courseTitle) {
    return enrollments;
  }

  const legacyEnrollments = await getDb()
    .collection("enrollments")
    .find({ courseTitle, status: "active" })
    .toArray();

  return [...new Map([...enrollments, ...legacyEnrollments].map((enrollment) => [enrollment._id, enrollment])).values()];
};

const getAuthorizedCourse = async (requestUser, courseId) => {
  const course = await getDb().collection("courses").findOne({
    _id: ObjectId.isValid(courseId) ? new ObjectId(courseId) : courseId,
  });

  if (!course) {
    return {
      error: {
        status: 404,
        message: "Course not found.",
      },
    };
  }

  course.id = course._id;

  if (requestUser?.role === "admin") {
    return { course };
  }

  const assignedIds = [course.assignedEmployeeId, course.assignedEmployeeRef].filter(Boolean);
  const requesterIds = [requestUser?.uid, requestUser?.employeeId].filter(Boolean);
  const hasAccess = requesterIds.some((id) => assignedIds.includes(id));

  if (!hasAccess) {
    return {
      error: {
        status: 403,
        message: "You can only message students from courses assigned to you.",
      },
    };
  }

  return { course };
};

const handleAdminError = (res, error, fallbackMessage) => {
  logger.error(error);
  return res.status(error.status || 500).json({
    success: false,
    message: error.message || fallbackMessage,
    code: error.code || "internal_error",
  });
};

/**
 * POST /api/admin/broadcast-email
 * Send bulk emails to enrolled students or manual list
 */
const broadcastEmail = async (req, res) => {
  const { targetType, manualEmails, subject, message, imageUrl, imageLabel, attachImage } = req.body;

  try {
    if (!subject?.trim() || !message?.trim()) {
      return res.status(400).json({ success: false, message: "Subject and message are required." });
    }

    const requesterRole = req.user?.role;
    let authorizedCourse = null;

    if (requesterRole !== "admin") {
      if (targetType !== "course" || !req.body.courseId) {
        return res.status(403).json({
          success: false,
          message: "Employees can only send broadcasts for their assigned courses.",
        });
      }

      const { course, error } = await getAuthorizedCourse(req.user, req.body.courseId);
      if (error) {
        return res.status(error.status).json({ success: false, message: error.message });
      }

      authorizedCourse = course;
    }

    let emails = [];

    if (targetType === "enrolled") {
      const [genericEmails, tradingEmails] = await Promise.all([
        getActiveGenericEnrolledEmails(),
        getActiveEnrolledEmails(),
      ]);
      emails = dedupeEmails([...genericEmails, ...tradingEmails]);
    } else if (targetType === "course" && req.body.courseId) {
      const course = authorizedCourse || (await getAuthorizedCourse(req.user, req.body.courseId)).course;
      const enrolls = await getGenericCourseEnrollments(req.body.courseId, course?.title);
      emails = enrolls
        .filter((enrollment) => !req.body.planId || enrollment.planId === req.body.planId)
        .map((enrollment) => enrollment.userEmail)
        .filter(Boolean);
      emails = dedupeEmails(emails);
    } else if (targetType === "manual" && manualEmails) {
      emails = manualEmails
        .split(/[\n, ]+/)
        .map((e) => e.trim())
        .filter((e) => e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    }

    if (emails.length === 0) {
      return res.status(400).json({ success: false, message: "No valid email addresses found." });
    }

    const normalizedImageUrl =
      typeof imageUrl === "string" && imageUrl.trim()
        ? imageUrl.trim().startsWith("http")
          ? imageUrl.trim()
          : `${req.protocol}://${req.get("host")}${imageUrl.trim().startsWith("/") ? imageUrl.trim() : `/${imageUrl.trim()}`}`
        : "";

    const attachments =
      attachImage && normalizedImageUrl
        ? [
            {
              filename: getAttachmentFilename(normalizedImageUrl, imageLabel),
              path: normalizedImageUrl,
              contentType: guessImageContentType(normalizedImageUrl),
            },
          ]
        : undefined;

    const html = emailTemplate(escapeHtml(subject.trim()), buildBroadcastContent({
      message: message.trim(),
      imageUrl: normalizedImageUrl,
      imageLabel: imageLabel || "Broadcast image",
    }));

    const results = { sent: 0, failed: 0 };
    for (let i = 0; i < emails.length; i += 50) {
      const batch = emails.slice(i, i + 50);
      await Promise.all(
        batch.map(async (email) => {
          try {
            await sendEmail({
              to: email,
              subject: subject.trim(),
              html,
              attachments,
            });
            results.sent++;
          } catch (e) {
            logger.error(`Broadcast failed for ${email}: ${e.message}`);
            results.failed++;
          }
        })
      );
    }

    res.json({
      success: true,
      message: `Broadcast complete. Sent: ${results.sent}, Failed: ${results.failed}`,
      count: results.sent,
    });
  } catch (error) {
    logger.error("Broadcast email error:", error);
    res.status(500).json({ success: false, message: "Internal server error during broadcast." });
  }
};

/**
 * POST /api/admin/notify-account-approval
 * Notify user their account was approved
 */
const notifyAccountApproval = async (req, res) => {
  const { email, name, role } = req.body;

  if (!email || !name) {
    return res.status(400).json({ success: false, message: "Email and Name are required." });
  }

  const welcomeContent = `
    <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
      <h2 style="color: #1e40af; margin-top: 0;">Welcome to the Team, ${name}!</h2>
      <p style="color: #475569; font-size: 16px;">Your account request for <strong>Amit Solution Hub</strong> has been <strong>APPROVED</strong>.</p>
      <div style="margin: 20px 0; padding: 15px; background: #ffffff; border-left: 4px solid #2563eb; border-radius: 4px;">
        <p style="margin: 4px 0;"><strong>Role:</strong> ${role || "Employee"}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> Active</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: email,
      subject: "Account Approved - Welcome to Amit Solution Hub",
      html: emailTemplate("Account Approved!", welcomeContent, "Access Dashboard", "https://www.amitsolutionhub.com/login"),
    });

    logger.info(`Account approval notification sent to ${email}`);
    res.json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    logger.error("Notify account approval error:", error);
    res.status(500).json({ success: false, message: "Failed to send notification email." });
  }
};

const listUsers = async (req, res) => {
  try {
    const users = await listUsersFromSql({
      role: req.query.role,
      status: req.query.status,
    });
    return res.json({ success: true, users });
  } catch (error) {
    return handleAdminError(res, error, "Unable to load users.");
  }
};

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

const createUser = async (req, res) => {
  try {
    const role = req.body.role || "customer";
    const user = await createManagedUser(
      {
        ...req.body,
        role,
      },
      {
        sendActivationEmail: true,
        activationFrom: role === "employee" ? "employee" : "customer",
        requestIp: req.ip,
        createdBy: req.user,
      }
    );

    if (ADMIN_EMAIL) {
      const label = role === "employee" ? "Employee" : "Student";
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `New ${label} account created: ${user.displayName || user.email}`,
        html: emailTemplate(
          `New ${label} Account`,
          `
          <p>A new ${label.toLowerCase()} account has been created:</p>
          <div style="margin: 24px 0; padding: 20px; border: 1px solid #e2e8f0; border-radius: 14px; background: #f8fafc;">
            <p style="margin: 0 0 8px;"><strong>Name:</strong> ${user.displayName || "—"}</p>
            <p style="margin: 0 0 8px;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 0 0 8px;"><strong>Role:</strong> ${role}</p>
            <p style="margin: 0;"><strong>Phone:</strong> ${user.phone || "—"}</p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Created by ${req.user?.email || "admin"} from the admin panel.</p>
          `,
          "Open Admin Panel",
          process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/admin/students` : "https://www.amitsolutionhub.com/admin/students"
        ),
      }).catch(err => logger.warn("Admin notification email failed:", err.message));
    }

    return res.status(201).json({
      success: true,
      message:
        role === "customer"
          ? "Customer account created. A password setup email has been sent to the registered address."
          : "Employee account created. A password setup email has been sent to the registered address.",
      user,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to create the user.");
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await updateManagedUser(req.params.userId, req.body, { updatedBy: req.user });
    return res.json({
      success: true,
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to update the user.");
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await deleteManagedUser(req.params.userId, { deletedBy: req.user });
    return res.json({
      success: true,
      message: "User deleted successfully.",
      user,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to delete the user.");
  }
};

const deleteUserByEmail = async (req, res) => {
  const email = String(req.query.email || "").trim().toLowerCase();
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email query is required.",
      code: "email_required",
    });
  }

  try {
    const existingUser = await getManagedUser(email);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        code: "user_not_found",
      });
    }

    const user = await deleteManagedUser(email, { deletedBy: req.user });
    return res.json({
      success: true,
      message: "User deleted successfully.",
      email,
      user,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to delete the user.");
  }
};

const mergeUsers = async (req, res) => {
  try {
    const result = await mergeManagedUsers({
      primaryIdentifier: req.body.primaryUserId,
      duplicateIdentifier: req.body.duplicateUserId,
      mergeReason: req.body.reason,
      mergedBy: req.user,
    });
    return res.json({
      success: true,
      message: "Accounts merged successfully.",
      ...result,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to merge the accounts.");
  }
};

const approveRequest = async (req, res) => {
  try {
    const result = await approveAccountRequest(req.params.requestId, req.user);
    return res.json({
      success: true,
      message: result.alreadyExists
        ? "Account already exists. Please reset your password."
        : "The account request has been approved successfully.",
      ...result,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to approve the account request.");
  }
};

const rejectRequest = async (req, res) => {
  try {
    const request = await rejectAccountRequest(req.params.requestId, req.user);
    return res.json({
      success: true,
      message: "Account request rejected successfully.",
      request,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to reject the account request.");
  }
};

const removeRequest = async (req, res) => {
  try {
    const request = await deleteAccountRequest(req.params.requestId);
    return res.json({
      success: true,
      message: "Account request deleted successfully.",
      request,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to delete the account request.");
  }
};

const listEmployeeCvs = async (req, res) => {
  try {
    const cvs = await listEmployeeCvRecords();
    return res.json({ success: true, cvs });
  } catch (error) {
    return handleAdminError(res, error, "Unable to load employee CV records.");
  }
};

/**
 * GET /api/admin/employee-cvs/:userId/download
 * Secure download (admin only); file is stored under uploads/cv/
 */
const downloadEmployeeCv = async (req, res) => {
  try {
    const user = await getManagedUser(req.params.userId);
    if (!user || user.role !== "employee") {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }
    if (!user.cvFilePath) {
      return res.status(404).json({ success: false, message: "No CV file is available for this employee." });
    }

    const baseName = path.basename(String(user.cvFilePath));
    if (!baseName || baseName === "." || baseName === "..") {
      return res.status(400).json({ success: false, message: "Invalid file reference." });
    }

    const cvDir = path.resolve(path.join(__dirname, "..", "uploads", "cv"));
    const absolute = path.resolve(cvDir, baseName);
    if (!absolute.startsWith(cvDir)) {
      return res.status(400).json({ success: false, message: "Invalid file path." });
    }
    if (!fs.existsSync(absolute)) {
      return res.status(404).json({ success: false, message: "The file could not be found on the server." });
    }

    return res.download(absolute, user.cvFileName || baseName);
  } catch (error) {
    return handleAdminError(res, error, "Unable to download the CV file.");
  }
};

/**
 * POST /api/admin/receipts/:id/send-email
 * Email a payment receipt to the customer
 */
const sendReceiptEmail = async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDb();
    
    // Find receipt in the db
    const receipt = await db.collection("receipts").findOne({
      $or: [
        { _id: ObjectId.isValid(id) ? new ObjectId(id) : id },
        { id: id }
      ]
    });

    if (!receipt) {
      return res.status(404).json({ success: false, message: "Receipt not found." });
    }

    if (!receipt.customerEmail) {
      return res.status(400).json({ success: false, message: "Customer email is missing on the receipt." });
    }

    // Pricing calculation
    const amount = Number(receipt.amount || 0);
    const discount = Number(receipt.discount || 0);
    const net = Math.max(0, amount - discount);
    const taxPercent = Number(receipt.taxPercent || 0);
    const tax = net * (taxPercent / 100);
    const total = net + tax;

    const totals = { amount, discount, net, tax, total };

    // Number to Words converter (Indian System)
    const localNumberToWords = (num) => {
      if (num === 0) return 'Zero';
      const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
      ];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

      const convertBelowThousand = (n) => {
        let word = '';
        if (n >= 100) {
          word += a[Math.floor(n / 100)] + ' Hundred ';
          n %= 100;
        }
        if (n > 0) {
          if (word !== '') word += 'and ';
          if (n < 20) {
            word += a[n] + ' ';
          } else {
            word += b[Math.floor(n / 10)] + ' ';
            if (n % 10 > 0) {
              word += a[n % 10] + ' ';
            }
          }
        }
        return word.trim();
      };

      let str = '';
      const parts = [];
      parts.push(Math.floor(num / 10000000));
      num %= 10000000;
      parts.push(Math.floor(num / 100000));
      num %= 100000;
      parts.push(Math.floor(num / 1000));
      num %= 1000;
      parts.push(num);

      const labels = ['Crore', 'Lakh', 'Thousand', ''];
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (p > 0) {
          str += convertBelowThousand(p) + ' ' + labels[i] + ' ';
        }
      }
      return str.trim() + ' Rupees Only';
    };

    const words = localNumberToWords(Math.round(total));

    // Construct receipt subject & HTML email content
    const subject = `Payment Receipt - ${receipt.receiptId} (Amit Solution Hub)`;
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">PAYMENT RECEIPT</h1>
          <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9; font-weight: 550;">Amit Solution Hub</p>
        </div>
        
        <div style="padding: 30px; color: #1e293b;">
          <p style="margin-top: 0; font-size: 15px;">Dear <strong>${receipt.customerName || 'Valued Customer'}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            Thank you for your payment. Your transaction has been successfully processed. Please find your official payment receipt details below:
          </p>

          <!-- Receipt Metadata -->
          <div style="margin: 24px 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; font-size: 13px;">
            <div style="background-color: #f8fafc; padding: 12px 16px; font-weight: bold; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
              <span style="color: #1e293b;">Receipt No: ${receipt.receiptId}</span>
              <span style="color: #10b981; font-weight: 800;">SUCCESSFUL</span>
            </div>
            <div style="padding: 16px; background-color: #ffffff; line-height: 1.8;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="color: #64748b; padding: 4px 0;">Payment Date:</td>
                  <td style="font-weight: 600; text-align: right; color: #1e293b;">${receipt.paymentDate}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding: 4px 0;">Payment Method:</td>
                  <td style="font-weight: 600; text-align: right; color: #1e293b;">${receipt.paymentMethod}</td>
                </tr>
                ${receipt.transactionId ? `
                <tr>
                  <td style="color: #64748b; padding: 4px 0;">Transaction Ref ID:</td>
                  <td style="font-weight: 600; font-family: monospace; text-align: right; color: #1e293b;">${receipt.transactionId}</td>
                </tr>
                ` : ''}
              </table>
            </div>
          </div>

          <!-- Particulars -->
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 13px;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: bold;">
                <th style="padding: 10px; text-align: left;">Particulars</th>
                <th style="padding: 10px; text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 10px;">
                  <div style="font-weight: bold; color: #1e293b;">${receipt.itemName}</div>
                  <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Category: ${receipt.itemCategory}</div>
                </td>
                <td style="padding: 12px 10px; text-align: right; font-weight: 600; color: #1e293b;">₹${totals.amount.toFixed(2)}</td>
              </tr>
              ${totals.discount > 0 ? `
              <tr style="color: #ef4444; border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 8px 10px; text-align: right;">Discount:</td>
                <td style="padding: 8px 10px; text-align: right; font-weight: 600;">-₹${totals.discount.toFixed(2)}</td>
              </tr>
              ` : ''}
              ${receipt.taxType !== 'exempt' && totals.tax > 0 ? `
              <tr style="border-bottom: 1px solid #f1f5f9; color: #64748b;">
                <td style="padding: 8px 10px; text-align: right;">
                  ${receipt.taxType === 'cgst_sgst' ? 'CGST + SGST' : 'IGST'} (${receipt.taxPercent}%):
                </td>
                <td style="padding: 8px 10px; text-align: right; font-weight: 600;">₹${totals.tax.toFixed(2)}</td>
              </tr>
              ` : ''}
              <tr style="font-size: 15px; font-weight: bold; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                <td style="padding: 12px 10px; text-align: right; color: #1e293b;">Grand Total:</td>
                <td style="padding: 12px 10px; text-align: right; color: #2563eb;">₹${totals.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin: 20px 0; background-color: #f0fdf4; border: 1px dashed #bbf7d0; border-radius: 12px; padding: 12px 16px; font-size: 12.5px; color: #166534; line-height: 1.5;">
            <strong>Amount in Words:</strong><br />
            ${words}
          </div>

          <!-- Company info card -->
          <div style="margin-top: 30px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 14px; background: #f8fafc; font-size: 12px; color: #475569; line-height: 1.6;">
            <p style="margin: 0 0 4px; font-weight: bold; color: #1e293b;">Amit Solution Hub</p>
            <p style="margin: 0 0 4px;">Registered MSME Govt. of India (Udyam ID: UDYAM-GJ-17-0037282)</p>
            <p style="margin: 0 0 4px;">Address: Godhra, Gujarat, India</p>
            <p style="margin: 0;">Support: support@amitsolutionhub.com | +91 7874248481</p>
          </div>

          <div style="margin-top: 30px; text-align: center; font-size: 11px; color: #94a3b8;">
            This is an official computer-generated receipt issued by Amit Solution Hub.
          </div>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8;">
          © 2026 Amit Solution Hub | Gujarat, India
        </div>
      </div>
    `;

    const emailResponse = await sendEmail({
      to: receipt.customerEmail,
      subject,
      html: emailHtml
    });

    if (!emailResponse.success) {
      return res.status(500).json({ success: false, message: emailResponse.error || "Email delivery failed." });
    }

    return res.json({ success: true, message: "Receipt sent successfully via email!" });
  } catch (error) {
    logger.error("Error sending receipt email:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to send receipt email." });
  }
};

/**
 * POST /api/admin/users/:userId/fire
 * Terminate an employee, record fireReason & relievingDate, and send termination notice email
 */
const fireEmployee = async (req, res) => {
  const { userId } = req.params;
  const { fireReason, relievingDate, sendEmailNotice = true } = req.body;

  if (!fireReason || !fireReason.trim()) {
    return res.status(400).json({
      success: false,
      message: "Termination reason is required.",
    });
  }

  try {
    const existingUser = await getManagedUser(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Employee user not found.",
      });
    }

    const formattedRelievingDate = relievingDate || new Date().toISOString().split("T")[0];

    const updatePayload = {
      status: "terminated",
      isTerminated: true,
      previousRole: existingUser.role || "employee",
      role: "customer",
      fireReason: fireReason.trim(),
      relievingDate: formattedRelievingDate,
      terminatedAt: new Date().toISOString(),
      showOnTeam: false,
    };

    const updatedUser = await updateManagedUser(userId, updatePayload, { updatedBy: req.user });

    try {
      const db = getDb();
      await db.collection("team").deleteMany({
        $or: [
          { email: existingUser.email },
          { _id: existingUser.id },
          { _id: existingUser.uid },
          { _id: existingUser.firebaseUid },
        ].filter(Boolean),
      });
    } catch (e) {
      logger.warn("Cleanup team collection warning on fire:", e.message);
    }

    let emailSent = false;
    let emailError = null;

    if (sendEmailNotice && existingUser.email) {
      const safeName = escapeHtml(existingUser.displayName || existingUser.name || "Employee");
      const safeReason = escapeHtml(fireReason.trim())
        .split(/\r?\n/)
        .map((line) => `<p style="margin: 0 0 10px;">${line}</p>`)
        .join("");

      const terminationContent = `
        <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 16px; padding: 28px; margin-bottom: 24px;">
          <h2 style="color: #991b1b; margin-top: 0; font-size: 20px; border-bottom: 2px solid #fecaca; padding-bottom: 12px;">
            📄 Official Notice of Employment Relieving & Termination
          </h2>
          <p style="color: #451a03; font-size: 15px; line-height: 1.6;">
            Dear <strong>${safeName}</strong>,
          </p>
          <p style="color: #451a03; font-size: 15px; line-height: 1.6;">
            This is an official notice to inform you that your employment with <strong>Amit Solution Hub</strong> has been terminated effective from <strong>${escapeHtml(formattedRelievingDate)}</strong>.
          </p>

          <div style="margin: 20px 0; padding: 18px; background: #ffffff; border-left: 4px solid #dc2626; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Employee Record Details</p>
            <p style="margin: 4px 0; font-size: 14px; color: #1e293b;"><strong>Employee ID:</strong> ${escapeHtml(existingUser.employeeId || "N/A")}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #1e293b;"><strong>Designation:</strong> ${escapeHtml(existingUser.jobTitle || "Employee")}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #1e293b;"><strong>Department:</strong> ${escapeHtml(existingUser.department || "N/A")}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #1e293b;"><strong>Joining Date:</strong> ${escapeHtml(existingUser.joinDate || "N/A")}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #1e293b;"><strong>Relieving Date:</strong> ${escapeHtml(formattedRelievingDate)}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #dc2626;"><strong>Employment Status:</strong> Terminated / Relieved</p>
          </div>

          <div style="margin: 20px 0; padding: 18px; background: #fff1f2; border: 1px dashed #fda4af; border-radius: 8px;">
            <p style="margin: 0 0 8px; color: #9f1239; font-size: 13px; font-weight: 700; text-transform: uppercase;">Stated Reason for Termination:</p>
            <div style="color: #881337; font-size: 14px; line-height: 1.6;">
              ${safeReason}
            </div>
          </div>

          <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-top: 20px;">
            Please ensure all company assets, credentials, and access keys are handed over to HR / Management immediately. This document serves as your official Relieving & Termination Certificate Notice.
          </p>

          <p style="color: #475569; font-size: 13px; line-height: 1.6; margin-top: 18px; background: #ffffff; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
            ℹ️ <strong>Note for Student/User Account:</strong> Your employee access has been revoked. However, you can still log in to your account as a regular user/student to access your enrolled courses and learning resources.
          </p>
        </div>
      `;

      try {
        const mailRes = await sendEmail({
          to: existingUser.email,
          subject: "Official Notice: Employment Termination & Relieving Certificate - Amit Solution Hub",
          html: emailTemplate(
            "Official Relieving & Termination Notice",
            terminationContent,
            null,
            null,
            "#dc2626",
            "OFFICIAL HR NOTICE"
          ),
        });
        emailSent = mailRes.success;
        if (!mailRes.success) emailError = mailRes.error;
      } catch (err) {
        logger.error(`Failed to send termination email to ${existingUser.email}: ${err.message}`);
        emailError = err.message;
      }
    }

    return res.json({
      success: true,
      message: `Employee ${existingUser.displayName || existingUser.email} has been terminated.${emailSent ? ' Relieving letter email sent successfully.' : emailError ? ` (Email error: ${emailError})` : ''}`,
      user: updatedUser,
      emailSent,
      emailError,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to process employee termination.");
  }
};

/**
 * POST /api/admin/users/:userId/reinstate
 * Reinstate a previously fired/terminated employee back to active status
 */
const reinstateEmployee = async (req, res) => {
  const { userId } = req.params;
  const { sendEmailNotice = true } = req.body;

  try {
    const existingUser = await getManagedUser(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Employee user not found.",
      });
    }

    const restoredRole = existingUser.previousRole || "employee";

    const updatePayload = {
      status: "active",
      isTerminated: false,
      role: restoredRole,
      fireReason: "",
      reinstatementRequested: false,
      reinstatementMessage: "",
      reinstatementStatus: "approved",
      reinstatedAt: new Date().toISOString(),
    };

    const updatedUser = await updateManagedUser(userId, updatePayload, { updatedBy: req.user });

    let emailSent = false;
    let emailError = null;

    if (sendEmailNotice && existingUser.email) {
      const safeName = escapeHtml(existingUser.displayName || existingUser.name || "Employee");

      const reinstatementContent = `
        <div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 16px; padding: 28px; margin-bottom: 24px;">
          <h2 style="color: #166534; margin-top: 0; font-size: 20px; border-bottom: 2px solid #bbf7d0; padding-bottom: 12px;">
            🎉 Employment Reinstatement Notice
          </h2>
          <p style="color: #14532d; font-size: 15px; line-height: 1.6;">
            Dear <strong>${safeName}</strong>,
          </p>
          <p style="color: #14532d; font-size: 15px; line-height: 1.6;">
            We are pleased to inform you that your employment status at <strong>Amit Solution Hub</strong> has been <strong>REINSTATED</strong> and your account has been restored to <strong>Active</strong> status.
          </p>

          <div style="margin: 20px 0; padding: 18px; background: #ffffff; border-left: 4px solid #16a34a; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
            <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Account Details</p>
            <p style="margin: 4px 0; font-size: 14px; color: #1e293b;"><strong>Employee ID:</strong> ${escapeHtml(existingUser.employeeId || "N/A")}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #1e293b;"><strong>Designation:</strong> ${escapeHtml(existingUser.jobTitle || "Employee")}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #16a34a; font-weight: 700;"><strong>Account Status:</strong> ACTIVE</p>
          </div>

          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            You can now log in to the portal and resume your duties. Welcome back to the team!
          </p>
        </div>
      `;

      try {
        const mailRes = await sendEmail({
          to: existingUser.email,
          subject: "Notice: Employment Reinstated - Welcome Back to Amit Solution Hub",
          html: emailTemplate(
            "Welcome Back! Account Reinstated",
            reinstatementContent,
            "Login to Portal",
            "https://www.amitsolutionhub.com/login",
            "#16a34a",
            "OFFICIAL HR REINSTATEMENT"
          ),
        });
        emailSent = mailRes.success;
        if (!mailRes.success) emailError = mailRes.error;
      } catch (err) {
        logger.error(`Failed to send reinstatement email to ${existingUser.email}: ${err.message}`);
        emailError = err.message;
      }
    }

    return res.json({
      success: true,
      message: `Employee ${existingUser.displayName || existingUser.email} has been reinstated to active status.${emailSent ? ' Reinstatement email sent.' : emailError ? ` (Email error: ${emailError})` : ''}`,
      user: updatedUser,
      emailSent,
      emailError,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to process employee reinstatement.");
  }
};

/**
 * POST /api/admin/reinstatement-requests
 * Former employee submits a request to the Founder/CEO for reinstatement
 */
const submitReinstatementRequest = async (req, res) => {
  const { message, email: bodyEmail } = req.body;
  const user = req.user;

  const targetIdentifier = bodyEmail || user?.email || user?.uid;
  if (!targetIdentifier) {
    return res.status(400).json({ success: false, message: "Email address or login is required." });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, message: "Request message is required." });
  }

  try {
    const existingUser = await getManagedUser(targetIdentifier);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "Employee user account not found with this email." });
    }

    const userId = existingUser.id || existingUser.uid || targetIdentifier;

    const updatePayload = {
      reinstatementRequested: true,
      reinstatementMessage: message.trim(),
      reinstatementRequestedAt: new Date().toISOString(),
      reinstatementStatus: "pending",
    };

    const updatedUser = await updateManagedUser(userId, updatePayload, { updatedBy: user || { uid: userId } });

    const targetEmail = existingUser?.email || targetIdentifier;
    const targetName = existingUser?.displayName || targetEmail;

    try {
      await getDb().collection("reinstatementRequests").insertOne({
        userId,
        userEmail: targetEmail,
        userName: targetName,
        previousRole: existingUser?.previousRole || "employee",
        message: message.trim(),
        status: "pending",
        createdAt: new Date(),
      });
    } catch (e) {
      logger.warn("Mongo insert into reinstatementRequests warning:", e.message);
    }

    if (ADMIN_EMAIL) {
      const safeName = escapeHtml(targetName);
      const safeMessage = escapeHtml(message.trim())
        .split(/\r?\n/)
        .map((line) => `<p style="margin: 0 0 8px;">${line}</p>`)
        .join("");

      sendEmail({
        to: ADMIN_EMAIL,
        subject: `📩 Reinstatement Request: Former Employee ${safeName}`,
        html: emailTemplate(
          "Employee Reinstatement Request",
          `
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
              <h3 style="color: #1e293b; margin-top: 0; font-size: 18px;">Former Employee Reinstatement Request</h3>
              <p style="color: #475569; font-size: 14px;"><strong>Employee:</strong> ${safeName} (${targetEmail})</p>
              <p style="color: #475569; font-size: 14px;"><strong>Previous Role:</strong> ${escapeHtml(existingUser?.previousRole || "employee")}</p>
              <div style="margin-top: 16px; padding: 16px; background: #ffffff; border-left: 4px solid #3b82f6; border-radius: 8px;">
                <p style="margin: 0 0 6px; font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase;">Message to Founder & CEO:</p>
                <div style="color: #1e293b; font-size: 14px; line-height: 1.6;">${safeMessage}</div>
              </div>
            </div>
          `,
          "Review Request in Admin Panel",
          process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/admin/employees` : "https://www.amitsolutionhub.com/admin/employees"
        ),
      }).catch((err) => logger.warn("Founder reinstatement notification failed:", err.message));
    }

    return res.json({
      success: true,
      message: "Your reinstatement request has been submitted to the Founder & CEO successfully.",
      user: updatedUser,
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to submit reinstatement request.");
  }
};

const revokeUserSessionHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    await revokeUserSession(userId);
    return res.json({
      success: true,
      message: "User session revoked successfully. Account will be logged out on their next request.",
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to revoke user session.");
  }
};

const lookupUserByEmail = async (req, res) => {
  try {
    const { email, uid, id } = req.query;
    const queryTarget = email || uid || id;
    if (!queryTarget) {
      return res.status(400).json({ success: false, message: "Email or ID is required for lookup." });
    }

    const db = getDb();
    const cleanTarget = String(queryTarget).trim();

    const userDoc = await db.collection("users").findOne({
      $or: [
        { email: cleanTarget.toLowerCase() },
        { uid: cleanTarget },
        { firebaseUid: cleanTarget },
        ...(ObjectId.isValid(cleanTarget) ? [{ _id: new ObjectId(cleanTarget) }] : [])
      ]
    });

    if (!userDoc) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const { passwordHash, ...user } = userDoc;
    user.id = user._id ? user._id.toString() : user.id;
    user.uid = user.uid || user.firebaseUid || user.id;

    return res.json({
      success: true,
      user
    });
  } catch (error) {
    return handleAdminError(res, error, "Unable to lookup user.");
  }
};

module.exports = {
  broadcastEmail,
  notifyAccountApproval,
  listUsers,
  lookupUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  deleteUserByEmail,
  mergeUsers,
  approveRequest,
  rejectRequest,
  removeRequest,
  listEmployeeCvs,
  downloadEmployeeCv,
  sendReceiptEmail,
  fireEmployee,
  reinstateEmployee,
  submitReinstatementRequest,
  revokeUserSessionHandler,
};
