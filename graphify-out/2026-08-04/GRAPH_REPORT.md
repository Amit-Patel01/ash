# Graph Report - solutionhub  (2026-08-04)

## Corpus Check
- 461 files · ~684,070 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3167 nodes · 7890 edges · 189 communities (165 shown, 24 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 1071 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `eb56e616`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- normalize
- sendEmail
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- G
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- EmployeeLayout.jsx
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- oh
- .then
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- authController.js
- hg
- Community 53
- .m
- razorpayController.js
- Community 56
- Community 57
- tradingController.js
- .X
- Community 60
- Community 61
- SEO.jsx
- be
- .l
- th
- .aa
- qc
- Community 68
- EmployeeTasks.jsx
- Community 70
- wg
- turn_off_all_maintenance.js
- Community 73
- Community 74
- EmployeeTasks.jsx
- Community 76
- Community 77
- Community 78
- Community 79
- Community 80
- Community 81
- Community 82
- Community 83
- Community 84
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- authMiddleware.js
- tradingController.js
- notificationService.js
- .Z
- AdminTasks.jsx
- inspect_employees.js
- Sf
- authMiddleware.js
- Services.jsx
- UserOrders.jsx
- AdminInternshipCategories.jsx
- emailNotify
- x
- App
- lazyWithRetry
- lazyWithRetry
- p
- agentDispatcher.js
- ll
- AdminTasks.jsx
- demo_newsletter.js
- check_maintenance_db.js
- fix_maintenance_setting.js
- Community 186
- Community 205
- Community 215
- Community 219
- Community 299
- Community 315
- Community 316
- Community 324
- Community 325
- Community 326
- Community 327

## God Nodes (most connected - your core abstractions)
1. `useStore()` - 124 edges
2. `useAuth()` - 101 edges
3. `getDb()` - 76 edges
4. `b()` - 75 edges
5. `b()` - 71 edges
6. `b()` - 66 edges
7. `c()` - 57 edges
8. `d()` - 55 edges
9. `d()` - 50 edges
10. `c()` - 49 edges

## Surprising Connections (you probably didn't know these)
- `sendReceiptEmail()` --indirect_call--> `p()`  [INFERRED]
  backend/controllers/adminController.js → frontend/.chrome-test-5/Default/Extensions/lmjegmlicamnimmfhcmpkclmigmmcbeh/3.10_0/offscreen_compiled.js
- `R()` --indirect_call--> `be()`  [INFERRED]
  frontend/.chrome-test-5/Default/Extensions/ghbmnnjooekpmoecnnnilnnbdlolhkhi/1.104.1_0/service_worker_bin_prod.js → frontend/.chrome-test-5/Default/Extensions/ghbmnnjooekpmoecnnnilnnbdlolhkhi/1.104.1_0/offscreendocument_main.js
- `qc()` --indirect_call--> `Rc()`  [INFERRED]
  frontend/.chrome-test-5/Default/Extensions/lmjegmlicamnimmfhcmpkclmigmmcbeh/3.10_0/offscreen_compiled.js → frontend/.chrome-test-5/Default/Extensions/nmmhkkegccagdldgiimedpiccmgmieda/1.0.0.6_0/craw_background.js
- `getUserRole()` --calls--> `getDb()`  [EXTRACTED]
  backend/services/roleService.js → backend/utils/mongo.js
- `q()` --indirect_call--> `Zd()`  [INFERRED]
  frontend/.chrome-test-5/Default/Extensions/ghbmnnjooekpmoecnnnilnnbdlolhkhi/1.104.1_0/offscreendocument_main.js → frontend/.chrome-test-5/Default/Extensions/lmjegmlicamnimmfhcmpkclmigmmcbeh/3.10_0/offscreen_compiled.js

## Import Cycles
- 1-file cycle: `frontend/src/components/Certificate/index.js -> frontend/src/components/Certificate/index.js`

## Communities (189 total, 24 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (82): AdminQrCertificates(), buildVerifyUrl(), CERTIFICATE_TYPES, createInitialForm(), formatDisplayDate(), getTypeMeta(), mapCertificateToForm(), resolveAssetSrc() (+74 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (39): ae(), b(), Bf(), c(), ck(), d(), di(), dk() (+31 more)

### Community 2 - "Community 2"
Cohesion: 0.03
Nodes (57): aa(), af(), ah(), be(), bh(), ce(), Cf(), Ci() (+49 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (57): Ae(), al(), bc(), Be(), Bf(), bh(), ce(), cf() (+49 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (55): ag(), Ak(), b(), Bk(), c(), cm(), d(), dm() (+47 more)

### Community 5 - "Community 5"
Cohesion: 0.03
Nodes (78): About, AboutTradingMentorship, AdminAccountRequests, AdminAIDepartments, AdminCoupons, AdminCourseCategories, AdminCourseEnrollments, AdminCourses (+70 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (14): DarkModeBackgroundFix(), Footer(), GlowBackground(), GuidanceModal(), Layout(), Navbar(), ThemeContext, useTheme() (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.23
Nodes (20): addExecutionLog(), addPendingProposal(), { addPendingProposal, addExecutionLog }, cron, { dispatchDepartmentTask }, { generateUnsubscribeToken }, getSubscribedEmails(), { logger } (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (29): A(), b(), c(), D(), da(), e(), ea(), fa() (+21 more)

### Community 9 - "Community 9"
Cohesion: 0.04
Nodes (40): ad(), af(), cc(), cd(), ce(), cf(), Ea(), fa() (+32 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (26): 1️⃣ Backend Test (2 minutes), 2️⃣ Frontend Test (3 minutes), 3️⃣ Data Setup (If profiles not showing), 4️⃣ Browser Console Debugging, Backend Console:, Bonus Checks:, Check network requests:, Check React state: (+18 more)

### Community 11 - "Community 11"
Cohesion: 0.06
Nodes (46): ac(), ad(), bb(), Bc(), bd(), bl(), cd(), dc() (+38 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (57): ADMIN_EMAIL, buildVerifyResponseData(), buildVerifyUrl(), createQrCertificate(), generateCertificateId(), generateUniqueCertificateId(), {
  getCertificateByUserAndCourse,
  addCertificate,
  getCertificateById,
  updateCertificate,
  getCertificateByPublicId,
  findCertificateByPublicId,
  createCertificateRecord,
  deleteCertificate,
}, getFrontendUrl() (+49 more)

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (19): gd(), ke(), L(), le(), lh(), M(), O(), qe() (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (22): { chatWithAI, getRecommendations, getAIStatus, generateText }, { dispatchDepartmentTask }, dispatchRateLimiter, express, { getDepartmentConfig, updateDepartmentConfig, getExecutionLogs, getPendingProposals, generateRealtimeProposalsFromCodebase, resolveProposal, clearAllProposals }, { logger }, { optionalAuth }, router (+14 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (22): dg(), dh(), eh(), fh(), gh(), hg(), hh(), ih() (+14 more)

### Community 16 - "normalize"
Cohesion: 0.10
Nodes (45): getNotificationMergeKey(), mergeNotificationGroups(), NotificationBell(), EmployeeBroadcastRefined(), EmployeeCourseManageRefined(), EmployeeHomeDashboard(), formatTimeAgo(), getTimeValue() (+37 more)

### Community 17 - "sendEmail"
Cohesion: 0.12
Nodes (24): ProtectedAdmin(), ProtectedEmployee(), ProtectedStudent(), RoleRedirect(), ChatPanel(), EMOJIS, formatMsgDateTime(), formatTime() (+16 more)

### Community 18 - "Community 18"
Cohesion: 0.07
Nodes (19): cg(), gg(), Je(), ji(), mf(), rg(), sg(), td() (+11 more)

### Community 19 - "Community 19"
Cohesion: 0.14
Nodes (30): bc(), c(), dc(), ec(), ei(), f(), fc(), fh() (+22 more)

### Community 20 - "Community 20"
Cohesion: 0.05
Nodes (39): ALLOWED_MIME_TYPES, fs, imageFilter(), multer, path, uploadBroadcast, uploadChat, uploadPayment (+31 more)

### Community 21 - "Community 21"
Cohesion: 0.10
Nodes (16): $a(), ab(), Ae(), bb(), cb(), db(), eb(), ee() (+8 more)

### Community 22 - "Community 22"
Cohesion: 0.09
Nodes (50): AdminCourseCategories(), AdminCourses(), compactPlanKey(), CourseEnrollModal(), getPlanIdentity(), loadRazorpayScript(), matchesPlanEnrollment(), normalizePlanKey() (+42 more)

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (24): bg(), ch(), dh(), eh(), fg(), fh(), gh(), hh() (+16 more)

### Community 24 - "Community 24"
Cohesion: 0.09
Nodes (22): Aj(), Bj(), ca(), Gj(), Hj(), ij(), jj(), kj() (+14 more)

### Community 25 - "Community 25"
Cohesion: 0.07
Nodes (58): {
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
  validateCouponForPurchase,
}, createCouponRecord(), deleteCouponRecord(), listAllCoupons(), { logger }, updateCouponRecord(), validateCoupon(), { addPaymentJob } (+50 more)

### Community 26 - "Community 26"
Cohesion: 0.16
Nodes (25): Aa(), ah(), ai(), bg(), bi(), ci(), dg(), di() (+17 more)

### Community 27 - "Community 27"
Cohesion: 0.09
Nodes (51): ADMIN_EMAIL, approveRequest(), broadcastEmail(), buildBroadcastContent(), dedupeEmails(), deleteUser(), deleteUserByEmail(), downloadEmployeeCv() (+43 more)

### Community 28 - "G"
Cohesion: 0.17
Nodes (3): Ai(), rh(), th()

### Community 29 - "Community 29"
Cohesion: 0.29
Nodes (9): AdminTasks(), avatarColors, buildAssigneeRows(), columns, emptyAssignee, getAvatarInitials(), priorityColors, resolveAssigneeFromTask() (+1 more)

### Community 30 - "Community 30"
Cohesion: 0.11
Nodes (20): ac(), Df(), ie(), jb(), jd(), kd(), kh(), Mc() (+12 more)

### Community 31 - "Community 31"
Cohesion: 0.07
Nodes (11): Aa(), Ab(), Ba(), Bb(), Ea(), Pa(), ra(), Rc() (+3 more)

### Community 32 - "Community 32"
Cohesion: 0.06
Nodes (34): author, dependencies, bcryptjs, cors, dotenv, express, express-rate-limit, @google/generative-ai (+26 more)

### Community 33 - "Community 33"
Cohesion: 0.10
Nodes (23): A(), Aj(), Bj(), da(), Gj(), Hj(), ij(), jj() (+15 more)

### Community 34 - "Community 34"
Cohesion: 0.10
Nodes (20): M(), Ef(), Ff(), Gf(), Hf(), ii(), md(), nd() (+12 more)

### Community 35 - "Community 35"
Cohesion: 0.06
Nodes (30): action, default_icon, author, email, background, service_worker, content_security_policy, extension_pages (+22 more)

### Community 36 - "Community 36"
Cohesion: 0.09
Nodes (15): a(), c(), d(), Fa(), Ga(), ja(), ka(), na() (+7 more)

### Community 37 - "EmployeeLayout.jsx"
Cohesion: 0.06
Nodes (45): createUser(), notifyAccountApproval(), { addPaymentJob }, crypto, { logger }, {
  savePayment,
  createEnrollment,
  getEnrollmentsByCourse,
  getSession,
  updateSession,
}, { sendEmail, emailTemplate }, sendEnrollmentEmail() (+37 more)

### Community 38 - "Community 38"
Cohesion: 0.05
Nodes (57): ab(), aa(), Ab(), Ac(), ad(), bd(), cc(), cd() (+49 more)

### Community 39 - "Community 39"
Cohesion: 0.06
Nodes (33): Additional Notes, Code Reference, Prevention, Problem, Root Cause, Solution, Step 1: Check Current Team Data in MongoDB, Step 2: Enable Team Display for Existing Employees (+25 more)

### Community 40 - "Community 40"
Cohesion: 0.19
Nodes (22): ag(), Bh(), eg(), fg(), hg(), hh(), ig(), J() (+14 more)

### Community 41 - "Community 41"
Cohesion: 0.07
Nodes (26): author, email, background, service_worker, content_capabilities, matches, permissions, content_security_policy (+18 more)

### Community 43 - "Community 43"
Cohesion: 0.18
Nodes (23): normalize(), PublicEmployeeProfile(), socialLinks(), buildTeamProfiles(), fetchApiTeamProfiles(), fetchFirestoreTeamProfiles(), fetchPublicTeamProfiles(), genericRoles (+15 more)

### Community 44 - "oh"
Cohesion: 0.08
Nodes (35): bg(), bl(), Cg(), dd(), eg(), el(), fb(), fg() (+27 more)

### Community 45 - ".then"
Cohesion: 0.25
Nodes (14): fc(), hc(), jb(), jc(), Kb(), kc(), lc(), mc() (+6 more)

### Community 46 - "Community 46"
Cohesion: 0.43
Nodes (7): formatDate(), getAbsoluteUrl(), getStatusColor(), getStatusStep(), numberToWords(), STEPS, UserOrders()

### Community 47 - "Community 47"
Cohesion: 0.14
Nodes (19): { connectDB, closeDB }, fixTypoInPlans(), cleanup(), { connectDB, closeDB }, EXPORTS_DIR, fs, path, UNUSED_COLLECTIONS (+11 more)

### Community 48 - "Community 48"
Cohesion: 0.13
Nodes (25): changeMyEmail(), CV_UPLOAD_DIR, cvStorage, cvUpload, fs, getChatContacts(), getMyProfile(), {
  getOwnProfile,
  changeOwnEmail,
  updateOwnProfile,
  uploadEmployeeCv,
  listPublicTeamMembers,
  listChatContacts,
  requestPasswordReset,
  createHttpError,
} (+17 more)

### Community 49 - "Community 49"
Cohesion: 0.09
Nodes (21): app, background, scripts, default_locale, description, display_in_launcher, display_in_new_tab_page, icons (+13 more)

### Community 50 - "Community 50"
Cohesion: 0.12
Nodes (6): a(), c(), Cb(), fa(), ma(), f()

### Community 51 - "authController.js"
Cohesion: 0.07
Nodes (31): db(), eb(), ek(), fk(), Ga(), gb(), gk(), hk() (+23 more)

### Community 52 - "hg"
Cohesion: 0.29
Nodes (11): compactText(), formatMeetingDateTime(), {
  getSession,
  getEnrollmentsByCourse,
  updateSession,
}, isEnrollmentForCoursePlan(), { logger }, normalizeText(), resolveCoursePlanMeetingLink(), sendBatchedEmails() (+3 more)

### Community 53 - "Community 53"
Cohesion: 0.35
Nodes (6): qa(), ra(), va(), wa(), xa(), ya()

### Community 54 - ".m"
Cohesion: 0.11
Nodes (18): am(), ck(), dk(), gb(), ik(), kk(), mf(), Nk() (+10 more)

### Community 55 - "razorpayController.js"
Cohesion: 0.07
Nodes (82): bcrypt, {
  createManagedUser,
  createAccountRequest,
  requestPasswordReset,
  verifyResetToken,
  completePasswordReset,
  createHttpError,
}, crypto, forgotPassword(), getClientIp(), { getDb }, handleControllerError(), jwt (+74 more)

### Community 58 - "tradingController.js"
Cohesion: 0.26
Nodes (11): AI_KEY_SOURCES, buildChatContents(), chatWithAI(), extractTextFromResponse(), generateText(), getRecommendations(), https, keySourceEntry (+3 more)

### Community 61 - "Community 61"
Cohesion: 0.17
Nodes (5): b(), ha(), Ib(), Kb(), La()

### Community 63 - "be"
Cohesion: 0.10
Nodes (30): AdminCoupons(), buildPlanKey(), createBlankForm(), formatDate(), formatDiscount(), toDateInputValue(), ADMIN_PERMISSIONS, AdminPermissions() (+22 more)

### Community 64 - ".l"
Cohesion: 0.22
Nodes (5): mid, ROW1, ROW2, TechMarquee(), TECHS

### Community 65 - "th"
Cohesion: 0.20
Nodes (3): DEFAULT_STATUS, QUICK_PROMPTS, WELCOME_MESSAGE

### Community 66 - ".aa"
Cohesion: 0.22
Nodes (5): { chatWithAI }, express, { getDb }, { logger }, router

### Community 68 - "Community 68"
Cohesion: 0.25
Nodes (3): g(), Ka(), z()

### Community 69 - "EmployeeTasks.jsx"
Cohesion: 0.19
Nodes (15): ProjectCard(), ActionButton(), joinClasses(), PublicGlassCard(), PublicPageShell(), PublicSection(), PublicSectionHeading(), contactInfo (+7 more)

### Community 70 - "Community 70"
Cohesion: 0.33
Nodes (5): ac(), Fb(), Gb(), Hb(), zb()

### Community 71 - "wg"
Cohesion: 0.24
Nodes (7): ai(), bi(), ji(), li(), ni(), oi(), Ta()

### Community 73 - "Community 73"
Cohesion: 0.33
Nodes (4): credentialsPath, fs, { google }, path

### Community 74 - "Community 74"
Cohesion: 0.33
Nodes (4): capabilities, coreInfrastructure, services, techStack

### Community 76 - "Community 76"
Cohesion: 0.40
Nodes (3): bcrypt, client, { MongoClient }

### Community 77 - "Community 77"
Cohesion: 0.40
Nodes (4): body, http, options, req

### Community 79 - "Community 79"
Cohesion: 0.40
Nodes (4): Architecture, Backend, Frontend, System Overview

### Community 80 - "Community 80"
Cohesion: 0.40
Nodes (4): Code Hygiene, Concerns, Performance/Scaling, Security

### Community 81 - "Community 81"
Cohesion: 0.40
Nodes (4): Coding Conventions, Component Pattern, Language, Styles

### Community 82 - "Community 82"
Cohesion: 0.40
Nodes (4): Automatic Testing, Manual Testing, Testing Strategy, Verification Plan

### Community 83 - "Community 83"
Cohesion: 0.50
Nodes (3): express, pool, router

### Community 84 - "Community 84"
Cohesion: 0.67
Nodes (3): main(), migrate(), { MongoClient }

### Community 86 - "Community 86"
Cohesion: 0.50
Nodes (3): Core Services, Integrations, Media Handling

### Community 87 - "Community 87"
Cohesion: 0.50
Nodes (3): Backend, Frontend, Tech Stack

### Community 88 - "Community 88"
Cohesion: 0.50
Nodes (3): `backend/`, `frontend/`, Project Structure

### Community 148 - "authMiddleware.js"
Cohesion: 0.40
Nodes (5): getModuleErrorAutoRefreshCount(), getModuleErrorCacheBustCount(), isRecoverableModuleLoadError(), MODULE_LOAD_ERROR_PATTERNS, ModuleLoadErrorFallback()

### Community 149 - "tradingController.js"
Cohesion: 0.12
Nodes (13): CATEGORIES, Counter(), FAQS, Hero(), HERO_PARTICLES, STATS, STEPS, TECH_STACK (+5 more)

### Community 150 - "notificationService.js"
Cohesion: 0.33
Nodes (3): cl(), lg(), W()

### Community 151 - ".Z"
Cohesion: 0.14
Nodes (24): cc(), ec(), hb(), hc(), Ib(), ic(), jc(), kc() (+16 more)

### Community 152 - "AdminTasks.jsx"
Cohesion: 0.06
Nodes (24): b(), ba(), be(), bf(), d(), da(), de(), e() (+16 more)

### Community 154 - "Sf"
Cohesion: 0.22
Nodes (7): crypto, express, generateUnsubscribeToken(), { getDb }, { logger }, router, buildUnsubscribeUrl()

### Community 155 - "authMiddleware.js"
Cohesion: 0.05
Nodes (46): { createLogger, format, transports }, fs, logger, logsDir, path, enrichDecodedUser(), { getDb }, jwt (+38 more)

### Community 157 - "UserOrders.jsx"
Cohesion: 0.11
Nodes (6): ACCENTS, AdminAIDepartments(), callsign(), formatAiText(), getAccent(), getDepartmentIcon()

### Community 158 - "AdminInternshipCategories.jsx"
Cohesion: 0.50
Nodes (3): http, options, req

### Community 159 - "emailNotify"
Cohesion: 0.05
Nodes (42): jspdf, AdminAccountRequests(), AdminCourseEnrollments(), AdminDashboard(), AdminInternshipCategories(), COLOR_OPTIONS, EMPTY_FORM, ICON_MAP (+34 more)

### Community 160 - "x"
Cohesion: 0.08
Nodes (26): ag(), al(), cg(), dd(), Dl(), el(), ff(), ha() (+18 more)

### Community 162 - "lazyWithRetry"
Cohesion: 0.06
Nodes (32): AdminLayout(), iconMap, navGroups, AdminProfile(), createProfileForm(), AppContent(), TermsAndConditions(), useAuth() (+24 more)

### Community 165 - "agentDispatcher.js"
Cohesion: 0.36
Nodes (7): classifyIntent(), dispatchDepartmentTask(), { generateText }, { getDepartmentConfig, addExecutionLog }, getDeptRole(), { logger }, getDepartmentConfig()

### Community 166 - "ll"
Cohesion: 0.11
Nodes (6): Ci(), qh(), rh(), sh(), th(), uh()

### Community 167 - "AdminTasks.jsx"
Cohesion: 0.19
Nodes (12): AdminEmployees(), avatarColors, departments, employeeRoles, departments, EmployeeDashboard(), EmployeeDashboardRoute(), employeeRoles (+4 more)

### Community 186 - "Community 186"
Cohesion: 0.05
Nodes (39): dependencies, framer-motion, html2canvas, html-to-image, lucide-react, qrcode.react, react, react-dom (+31 more)

### Community 205 - "Community 205"
Cohesion: 0.17
Nodes (11): Active Phase, Backend Controllers, Backend Middlewares, Backend Routes, Backend Services, Current Status [2026-04-07], Frontend, Key Decisions (+3 more)

### Community 215 - "Community 215"
Cohesion: 0.20
Nodes (9): Admin Management, E-Commerce (Projects), Functional Requirements (FR), Non-Functional Requirements (NFR), Reliability, Requirements: SolutionHub, Security, Trading Mentorship (+1 more)

### Community 219 - "Community 219"
Cohesion: 0.25
Nodes (7): Backend, Core Pillars, Frontend, Project Context: SolutionHub, Success Metrics, Technical Foundation, Vision

### Community 299 - "Community 299"
Cohesion: 0.29
Nodes (6): Phase 1: GSD Workflow Initialization [CURRENT], Phase 2: Core Refinement & Security, Phase 3: Marketplace Optimization, Phase 4: Trading Ecosystem Expansion, Phase 5: Admin Panel 2.0, Roadmap: SolutionHub

### Community 315 - "Community 315"
Cohesion: 0.50
Nodes (3): files, fs, path

### Community 316 - "Community 316"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 325 - "Community 325"
Cohesion: 0.25
Nodes (7): dependencies, @anthropic-ai/sdk, @aws-sdk/client-bedrock-runtime, tesseract.js, license, name, private

## Knowledge Gaps
- **660 isolated node(s):** `@kilocode/plugin`, `fs`, `path`, `{ sendEmail, emailTemplate }`, `{ getActiveEnrolledEmails }` (+655 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `p()` connect `Community 34` to `Community 6`, `Community 9`, `Community 19`, `AdminTasks.jsx`, `Community 27`?**
  _High betweenness centrality (0.320) - this node is a cross-community bridge._
- **Why does `sendReceiptEmail()` connect `Community 27` to `Community 34`, `Community 12`, `EmployeeLayout.jsx`?**
  _High betweenness centrality (0.256) - this node is a cross-community bridge._
- **Why does `useStore()` connect `emailNotify` to `Community 0`, `th`, `lazyWithRetry`, `Community 34`, `Community 5`, `Community 6`, `AdminTasks.jsx`, `EmployeeTasks.jsx`, `Community 43`, `Community 46`, `normalize`, `sendEmail`, `tradingController.js`, `Community 22`, `Community 29`, `be`?**
  _High betweenness centrality (0.196) - this node is a cross-community bridge._
- **Are the 33 inferred relationships involving `b()` (e.g. with `ad()` and `c()`) actually correct?**
  _`b()` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Are the 30 inferred relationships involving `b()` (e.g. with `ad()` and `.removeAll()`) actually correct?**
  _`b()` has 30 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@kilocode/plugin`, `fs`, `path` to the rest of the system?**
  _661 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05070892410341952 - nodes in this community are weakly interconnected._