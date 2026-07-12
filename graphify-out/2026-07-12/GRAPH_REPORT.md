# Graph Report - solutionhub  (2026-07-12)

## Corpus Check
- 428 files · ~560,958 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2966 nodes · 7460 edges · 170 communities (161 shown, 9 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 1034 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

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
- Community 17
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
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 56
- Community 57
- Community 58
- .X
- Community 60
- Community 61
- Community 62
- Community 63
- Community 64
- Community 65
- Community 66
- Community 67
- Community 68
- Community 69
- Community 70
- Community 71
- Community 72
- Community 73
- Community 74
- Community 75
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
- mergeManagedUsers
- .Z
- cl
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
1. `useStore()` - 109 edges
2. `useAuth()` - 93 edges
3. `b()` - 75 edges
4. `b()` - 71 edges
5. `getDb()` - 68 edges
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

## Communities (170 total, 9 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (78): AdminQrCertificates(), buildVerifyUrl(), CERTIFICATE_TYPES, createInitialForm(), formatDisplayDate(), getTypeMeta(), mapCertificateToForm(), resolveAssetSrc() (+70 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (41): b(), Bf(), c(), ck(), d(), di(), dk(), e() (+33 more)

### Community 2 - "Community 2"
Cohesion: 0.03
Nodes (49): aa(), ag(), ah(), be(), Cf(), cg(), Cj(), cl() (+41 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (49): ab(), al(), bc(), bi(), Cj(), db(), dk(), ff() (+41 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (52): ag(), Ak(), b(), Bk(), c(), ck(), cm(), d() (+44 more)

### Community 5 - "Community 5"
Cohesion: 0.02
Nodes (84): About, AboutTradingMentorship, AdminAccountRequests, AdminCoupons, AdminCourseCategories, AdminCourseEnrollments, AdminCourses, AdminDashboard (+76 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (49): AdminAccountRequests(), AdminCourseCategories(), AdminCourseEnrollments(), AdminDashboard(), AdminEmployees(), avatarColors, departments, employeeRoles (+41 more)

### Community 7 - "Community 7"
Cohesion: 0.14
Nodes (39): admin, { admin }, bcrypt, buildFirestoreAccountRequestPayload(), crypto, DEFAULT_SITE_URL, deleteAccountRequestFromFirebase(), findUserByIdentifier() (+31 more)

### Community 8 - "Community 8"
Cohesion: 0.06
Nodes (30): A(), b(), c(), D(), da(), e(), ea(), fa() (+22 more)

### Community 9 - "Community 9"
Cohesion: 0.04
Nodes (46): ad(), af(), ba(), cc(), cd(), cf(), dg(), Ea() (+38 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (26): 1️⃣ Backend Test (2 minutes), 2️⃣ Frontend Test (3 minutes), 3️⃣ Data Setup (If profiles not showing), 4️⃣ Browser Console Debugging, Backend Console:, Bonus Checks:, Check network requests:, Check React state: (+18 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (38): ac(), al(), Bc(), bl(), cd(), dc(), dd(), Dl() (+30 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (33): ADMIN_EMAIL, buildVerifyResponseData(), buildVerifyUrl(), createQrCertificate(), generateCertificateId(), generateUniqueCertificateId(), {
  getCertificateByUserAndCourse,
  addCertificate,
  getCertificateById,
  updateCertificate,
  getCertificateByPublicId,
  findCertificateByPublicId,
  createCertificateRecord,
  deleteCertificate,
}, getFrontendUrl() (+25 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (34): {
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
  validateCouponForPurchase,
}, createCouponRecord(), deleteCouponRecord(), listAllCoupons(), { logger }, updateCouponRecord(), validateCoupon(), { adminOnly } (+26 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (23): bg(), bl(), Cg(), eg(), fb(), fg(), jl(), $k() (+15 more)

### Community 15 - "Community 15"
Cohesion: 0.06
Nodes (47): Ae(), Be(), Bf(), bh(), ce(), cf(), ch(), de() (+39 more)

### Community 16 - "normalize"
Cohesion: 0.11
Nodes (41): getNotificationMergeKey(), mergeNotificationGroups(), NotificationBell(), EmployeeBroadcastRefined(), EmployeeCourseManageRefined(), EmployeeHomeDashboard(), formatTimeAgo(), getTimeValue() (+33 more)

### Community 17 - "Community 17"
Cohesion: 0.10
Nodes (21): jspdf, AdminMessages(), ADMIN_PERMISSIONS, AdminPermissions(), getPermissionsArray(), ROLE_PRESETS, AdminReceipts(), numberToWords() (+13 more)

### Community 18 - "Community 18"
Cohesion: 0.09
Nodes (37): c(), d(), dc(), e(), ec(), ei(), fc(), fh() (+29 more)

### Community 19 - "Community 19"
Cohesion: 0.09
Nodes (30): createUser(), notifyAccountApproval(), sendReceiptEmail(), passport, express, { logger }, router, { sendEmail, emailTemplate } (+22 more)

### Community 20 - "Community 20"
Cohesion: 0.06
Nodes (36): ALLOWED_MIME_TYPES, fs, imageFilter(), multer, path, uploadBroadcast, uploadChat, uploadPayment (+28 more)

### Community 21 - "Community 21"
Cohesion: 0.13
Nodes (12): $a(), ab(), Ae(), bb(), cb(), db(), eb(), qe() (+4 more)

### Community 22 - "Community 22"
Cohesion: 0.11
Nodes (43): AdminCourses(), compactPlanKey(), CourseEnrollModal(), getPlanIdentity(), loadRazorpayScript(), matchesPlanEnrollment(), normalizePlanKey(), buildPlanId() (+35 more)

### Community 23 - "Community 23"
Cohesion: 0.12
Nodes (24): bg(), ch(), dh(), eh(), fg(), fh(), gh(), hh() (+16 more)

### Community 24 - "Community 24"
Cohesion: 0.06
Nodes (47): aa(), Ab(), Ac(), ad(), bd(), cc(), cd(), dc() (+39 more)

### Community 25 - "Community 25"
Cohesion: 0.11
Nodes (35): removeQrCertificate(), requestCertificate(), updateCertificateStatus(), { addPaymentJob }, crypto, { logger }, {
  savePayment,
  createEnrollment,
  getEnrollmentsByCourse,
  getSession,
  updateSession,
}, { sendEmail, emailTemplate } (+27 more)

### Community 26 - "Community 26"
Cohesion: 0.11
Nodes (30): Aa(), ac(), ah(), ai(), bc(), bg(), bi(), cg() (+22 more)

### Community 27 - "Community 27"
Cohesion: 0.09
Nodes (41): ADMIN_EMAIL, approveRequest(), broadcastEmail(), buildBroadcastContent(), dedupeEmails(), deleteUser(), deleteUserByEmail(), downloadEmployeeCv() (+33 more)

### Community 28 - "Community 28"
Cohesion: 0.11
Nodes (19): Aj(), Bj(), ca(), Gj(), Hj(), ij(), jj(), kj() (+11 more)

### Community 29 - "Community 29"
Cohesion: 0.11
Nodes (19): AnnouncementPopup(), DarkModeBackgroundFix(), Footer(), GlowBackground(), GuidanceModal(), Layout(), Navbar(), ThemeContext (+11 more)

### Community 30 - "Community 30"
Cohesion: 0.13
Nodes (19): Df(), ie(), jb(), jd(), kd(), kh(), Mc(), N() (+11 more)

### Community 31 - "Community 31"
Cohesion: 0.07
Nodes (11): Aa(), Ab(), Ba(), Bb(), Ea(), Pa(), ra(), Rc() (+3 more)

### Community 32 - "Community 32"
Cohesion: 0.06
Nodes (35): author, dependencies, bcryptjs, cors, dotenv, express, express-rate-limit, @google/generative-ai (+27 more)

### Community 33 - "Community 33"
Cohesion: 0.10
Nodes (23): A(), Aj(), Bj(), da(), Gj(), Hj(), ij(), jj() (+15 more)

### Community 34 - "Community 34"
Cohesion: 0.09
Nodes (18): Ef(), Ff(), Gf(), Hf(), ii(), Ja(), md(), nd() (+10 more)

### Community 35 - "Community 35"
Cohesion: 0.06
Nodes (30): action, default_icon, author, email, background, service_worker, content_security_policy, extension_pages (+22 more)

### Community 36 - "Community 36"
Cohesion: 0.09
Nodes (15): a(), c(), d(), Fa(), Ga(), ja(), ka(), na() (+7 more)

### Community 37 - "Community 37"
Cohesion: 0.13
Nodes (15): b(), be(), bf(), ce(), ee(), lh(), pe(), qa() (+7 more)

### Community 38 - "Community 38"
Cohesion: 0.10
Nodes (22): { chatWithAI, getRecommendations, getAIStatus, generateText }, express, { logger }, { optionalAuth }, router, { chatWithAI }, express, { getDb } (+14 more)

### Community 39 - "Community 39"
Cohesion: 0.06
Nodes (33): Additional Notes, Code Reference, Prevention, Problem, Root Cause, Solution, Step 1: Check Current Team Data in MongoDB, Step 2: Enable Team Display for Existing Employees (+25 more)

### Community 40 - "Community 40"
Cohesion: 0.14
Nodes (26): ag(), Bh(), eg(), fg(), hc(), hg(), hh(), ig() (+18 more)

### Community 41 - "Community 41"
Cohesion: 0.07
Nodes (26): author, email, background, service_worker, content_capabilities, matches, permissions, content_security_policy (+18 more)

### Community 42 - "Community 42"
Cohesion: 0.10
Nodes (19): am(), gb(), ik(), kk(), mf(), n(), Nk(), ph() (+11 more)

### Community 43 - "Community 43"
Cohesion: 0.18
Nodes (23): normalize(), PublicEmployeeProfile(), socialLinks(), buildTeamProfiles(), fetchApiTeamProfiles(), fetchFirestoreTeamProfiles(), fetchPublicTeamProfiles(), genericRoles (+15 more)

### Community 44 - "Community 44"
Cohesion: 0.10
Nodes (31): updateUser(), changeMyEmail(), CV_UPLOAD_DIR, cvStorage, cvUpload, fs, getChatContacts(), getMyProfile() (+23 more)

### Community 45 - "Community 45"
Cohesion: 0.13
Nodes (14): af(), bb(), ce(), gi(), hi(), If(), ii(), ji() (+6 more)

### Community 46 - "Community 46"
Cohesion: 0.09
Nodes (12): Ai(), Ci(), n(), Nh(), oh(), ph(), qh(), rh() (+4 more)

### Community 47 - "Community 47"
Cohesion: 0.14
Nodes (19): { connectDB, closeDB }, fixTypoInPlans(), cleanup(), { connectDB, closeDB }, EXPORTS_DIR, fs, path, UNUSED_COLLECTIONS (+11 more)

### Community 48 - "Community 48"
Cohesion: 0.09
Nodes (17): CATEGORIES, Counter(), FAQS, Hero(), STATS, STEPS, TECH_STACK, TechIllustration() (+9 more)

### Community 49 - "Community 49"
Cohesion: 0.09
Nodes (21): app, background, scripts, default_locale, description, display_in_launcher, display_in_new_tab_page, icons (+13 more)

### Community 50 - "Community 50"
Cohesion: 0.12
Nodes (6): a(), c(), Cb(), fa(), ma(), f()

### Community 51 - "Community 51"
Cohesion: 0.19
Nodes (18): dd(), fc(), hc(), jb(), jc(), Kb(), kc(), lc() (+10 more)

### Community 52 - "Community 52"
Cohesion: 0.12
Nodes (36): bcrypt, {
  createManagedUser,
  createAccountRequest,
  requestPasswordReset,
  verifyResetToken,
  completePasswordReset,
  createHttpError,
}, forgotPassword(), { getDb }, handleControllerError(), jwt, { logger }, login() (+28 more)

### Community 53 - "Community 53"
Cohesion: 0.07
Nodes (29): ad(), ed(), fd(), gd(), hd(), jd(), ke(), L() (+21 more)

### Community 54 - "Community 54"
Cohesion: 0.10
Nodes (20): ai(), Ci(), fi(), fm(), gi(), gm(), H(), hi() (+12 more)

### Community 55 - "Community 55"
Cohesion: 0.10
Nodes (12): gg(), mf(), rg(), sg(), td(), tg(), ug(), vd() (+4 more)

### Community 56 - "Community 56"
Cohesion: 0.32
Nodes (7): EmployeeLayout(), getFilteredNavItems(), GRADIENTS, hasPermissionForPath(), iconMap, navItems, PERMISSION_MAP

### Community 57 - "Community 57"
Cohesion: 0.12
Nodes (5): de(), ji(), mi(), oi(), ri()

### Community 58 - "Community 58"
Cohesion: 0.53
Nodes (5): formatDate(), getStatusColor(), getStatusStep(), STEPS, UserOrders()

### Community 59 - ".X"
Cohesion: 0.12
Nodes (25): { addPaymentJob }, compactPlanKey(), createCourseOrder(), createOrder(), crypto, { getDb }, {
  incrementCouponUsage,
  validateCouponForPurchase,
}, { logger } (+17 more)

### Community 60 - "Community 60"
Cohesion: 0.08
Nodes (35): ProtectedAdmin(), ProtectedEmployee(), ProtectedStudent(), RoleRedirect(), ChatPanel(), EMOJIS, formatMsgDateTime(), formatTime() (+27 more)

### Community 61 - "Community 61"
Cohesion: 0.17
Nodes (5): b(), ha(), Ib(), Kb(), La()

### Community 62 - "Community 62"
Cohesion: 0.18
Nodes (16): ProjectCard(), ActionButton(), joinClasses(), PublicGlassCard(), PublicPageShell(), PublicSection(), PublicSectionHeading(), contactInfo (+8 more)

### Community 63 - "Community 63"
Cohesion: 0.08
Nodes (23): { createLogger, format, transports }, fs, logger, logsDir, path, { addPaymentJob }, crypto, express (+15 more)

### Community 64 - "Community 64"
Cohesion: 0.11
Nodes (17): ae(), bh(), Fe(), ge(), He(), Ie(), je(), kg() (+9 more)

### Community 65 - "Community 65"
Cohesion: 0.29
Nodes (9): AdminTasks(), avatarColors, buildAssigneeRows(), columns, emptyAssignee, getAvatarInitials(), priorityColors, resolveAssigneeFromTask() (+1 more)

### Community 66 - "Community 66"
Cohesion: 0.12
Nodes (22): db(), eb(), fk(), Ga(), gk(), hk(), hl(), ik() (+14 more)

### Community 67 - "Community 67"
Cohesion: 0.21
Nodes (15): AdminCoupons(), buildPlanKey(), createBlankForm(), formatDate(), formatDiscount(), toDateInputValue(), readApiJson(), ChatContext (+7 more)

### Community 68 - "Community 68"
Cohesion: 0.25
Nodes (3): g(), Ka(), z()

### Community 70 - "Community 70"
Cohesion: 0.33
Nodes (5): ac(), Fb(), Gb(), Hb(), zb()

### Community 71 - "Community 71"
Cohesion: 0.17
Nodes (12): enrichDecodedUser(), { getDb }, jwt, { logger }, optionalAuth(), verifyFirebaseToken(), express, { getDb } (+4 more)

### Community 72 - "Community 72"
Cohesion: 0.38
Nodes (6): EmployeeTasks(), getPriority(), getStatus(), priorityConfig, statusConfig, TaskCard()

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

### Community 149 - "mergeManagedUsers"
Cohesion: 0.40
Nodes (6): mergeUsers(), buildFirestoreUserPayload(), buildTeamPayload(), mergeManagedUsers(), removeUserFromFirebase(), syncUserToFirebase()

### Community 150 - ".Z"
Cohesion: 0.16
Nodes (21): bd(), cc(), ec(), hb(), hc(), Ib(), ic(), jc() (+13 more)

### Community 151 - "cl"
Cohesion: 0.33
Nodes (3): cl(), lg(), W()

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
- **587 isolated node(s):** `fs`, `path`, `{ sendEmail, emailTemplate }`, `{ getActiveEnrolledEmails }`, `{ getDb }` (+582 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `p()` connect `Community 34` to `Community 37`, `Community 5`, `Community 8`, `Community 9`, `Community 18`, `Community 19`?**
  _High betweenness centrality (0.368) - this node is a cross-community bridge._
- **Why does `sendReceiptEmail()` connect `Community 19` to `Community 25`, `Community 34`, `Community 27`?**
  _High betweenness centrality (0.256) - this node is a cross-community bridge._
- **Why does `AIChatbot()` connect `Community 5` to `Community 34`, `Community 6`?**
  _High betweenness centrality (0.197) - this node is a cross-community bridge._
- **Are the 33 inferred relationships involving `b()` (e.g. with `ad()` and `c()`) actually correct?**
  _`b()` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Are the 30 inferred relationships involving `b()` (e.g. with `ad()` and `.removeAll()`) actually correct?**
  _`b()` has 30 INFERRED edges - model-reasoned connections that need verification._
- **What connects `fs`, `path`, `{ sendEmail, emailTemplate }` to the rest of the system?**
  _588 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.053369272237196765 - nodes in this community are weakly interconnected._