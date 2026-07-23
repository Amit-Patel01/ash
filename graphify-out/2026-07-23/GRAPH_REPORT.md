# Graph Report - solutionhub  (2026-07-22)

## Corpus Check
- 432 files · ~563,374 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2982 nodes · 7481 edges · 162 communities (151 shown, 11 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 1035 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a51f84af`
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
- Services.jsx
- .X
- Community 60
- Community 61
- SEO.jsx
- Community 64
- Community 65
- Community 68
- EmployeeTasks.jsx
- Community 70
- Community 71
- Community 73
- Community 74
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
- .Z
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
- `qc()` --indirect_call--> `Rc()`  [INFERRED]
  frontend/.chrome-test-5/Default/Extensions/lmjegmlicamnimmfhcmpkclmigmmcbeh/3.10_0/offscreen_compiled.js → frontend/.chrome-test-5/Default/Extensions/nmmhkkegccagdldgiimedpiccmgmieda/1.0.0.6_0/craw_background.js
- `getUserRole()` --calls--> `getDb()`  [EXTRACTED]
  backend/services/roleService.js → backend/utils/mongo.js
- `q()` --indirect_call--> `Zd()`  [INFERRED]
  frontend/.chrome-test-5/Default/Extensions/ghbmnnjooekpmoecnnnilnnbdlolhkhi/1.104.1_0/offscreendocument_main.js → frontend/.chrome-test-5/Default/Extensions/lmjegmlicamnimmfhcmpkclmigmmcbeh/3.10_0/offscreen_compiled.js
- `e()` --indirect_call--> `Re()`  [INFERRED]
  frontend/.chrome-test-5/Default/Extensions/ghbmnnjooekpmoecnnnilnnbdlolhkhi/1.104.1_0/offscreendocument_main.js → frontend/.chrome-test-5/Default/Extensions/lmjegmlicamnimmfhcmpkclmigmmcbeh/3.10_0/offscreen_compiled.js

## Import Cycles
- 1-file cycle: `frontend/src/components/Certificate/index.js -> frontend/src/components/Certificate/index.js`

## Communities (162 total, 11 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (77): AdminQrCertificates(), buildVerifyUrl(), CERTIFICATE_TYPES, createInitialForm(), formatDisplayDate(), getTypeMeta(), mapCertificateToForm(), resolveAssetSrc() (+69 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (47): ae(), ah(), b(), c(), Cf(), ck(), d(), dd() (+39 more)

### Community 2 - "Community 2"
Cohesion: 0.03
Nodes (67): aa(), al(), Cj(), cl(), df(), ed(), ef(), fd() (+59 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (46): yf(), bc(), el(), ff(), fl(), G(), gf(), hf() (+38 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (64): ag(), ai(), Ak(), b(), Bk(), c(), Ci(), Cj() (+56 more)

### Community 5 - "Community 5"
Cohesion: 0.03
Nodes (80): About, AboutTradingMentorship, AdminAccountRequests, AdminCoupons, AdminCourseCategories, AdminCourseEnrollments, AdminCourses, AdminDashboard (+72 more)

### Community 6 - "Community 6"
Cohesion: 0.04
Nodes (56): jspdf, AdminAccountRequests(), AdminCourseCategories(), AdminCourseEnrollments(), AdminDashboard(), AdminEmployees(), avatarColors, departments (+48 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (70): { admin }, approveAccountRequest(), assertMySqlReady(), bcrypt, buildFirestoreAccountRequestPayload(), buildFirestoreUserPayload(), buildResetEmailMarkup(), buildResetUrl() (+62 more)

### Community 8 - "Community 8"
Cohesion: 0.07
Nodes (29): A(), b(), c(), D(), da(), e(), ea(), fa() (+21 more)

### Community 9 - "Community 9"
Cohesion: 0.04
Nodes (36): ad(), ba(), cc(), cd(), cf(), dg(), Ea(), fa() (+28 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (26): 1️⃣ Backend Test (2 minutes), 2️⃣ Frontend Test (3 minutes), 3️⃣ Data Setup (If profiles not showing), 4️⃣ Browser Console Debugging, Backend Console:, Bonus Checks:, Check network requests:, Check React state: (+18 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (39): ac(), ad(), Bc(), bd(), bl(), cd(), db(), dc() (+31 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (58): ADMIN_EMAIL, buildVerifyResponseData(), buildVerifyUrl(), createQrCertificate(), generateCertificateId(), generateUniqueCertificateId(), {
  getCertificateByUserAndCourse,
  addCertificate,
  getCertificateById,
  updateCertificate,
  getCertificateByPublicId,
  findCertificateByPublicId,
  createCertificateRecord,
  deleteCertificate,
}, getFrontendUrl() (+50 more)

### Community 13 - "Community 13"
Cohesion: 0.07
Nodes (56): {
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
  validateCouponForPurchase,
}, createCouponRecord(), deleteCouponRecord(), listAllCoupons(), { logger }, updateCouponRecord(), validateCoupon(), { addPaymentJob } (+48 more)

### Community 14 - "Community 14"
Cohesion: 0.07
Nodes (42): al(), bg(), bl(), Cg(), cl(), cm(), dm(), eg() (+34 more)

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (43): be(), Ae(), Be(), Bf(), ce(), ch(), df(), dh() (+35 more)

### Community 16 - "normalize"
Cohesion: 0.11
Nodes (41): getNotificationMergeKey(), mergeNotificationGroups(), NotificationBell(), EmployeeBroadcastRefined(), EmployeeCourseManageRefined(), EmployeeHomeDashboard(), formatTimeAgo(), getTimeValue() (+33 more)

### Community 17 - "Community 17"
Cohesion: 0.21
Nodes (15): AdminCoupons(), buildPlanKey(), createBlankForm(), formatDate(), formatDiscount(), toDateInputValue(), readApiJson(), ChatContext (+7 more)

### Community 18 - "Community 18"
Cohesion: 0.09
Nodes (37): c(), d(), dc(), Df(), e(), ec(), ei(), fc() (+29 more)

### Community 19 - "Community 19"
Cohesion: 0.08
Nodes (34): createUser(), notifyAccountApproval(), sendReceiptEmail(), sendEnrollmentEmail(), passport, express, { logger }, router (+26 more)

### Community 20 - "Community 20"
Cohesion: 0.05
Nodes (43): ALLOWED_MIME_TYPES, fs, imageFilter(), multer, path, uploadBroadcast, uploadCertificateAsset, uploadChat (+35 more)

### Community 21 - "Community 21"
Cohesion: 0.06
Nodes (19): $a(), ab(), Ae(), b(), bb(), cb(), db(), de() (+11 more)

### Community 22 - "Community 22"
Cohesion: 0.10
Nodes (44): AdminCourses(), compactPlanKey(), CourseEnrollModal(), getPlanIdentity(), loadRazorpayScript(), matchesPlanEnrollment(), normalizePlanKey(), buildPlanId() (+36 more)

### Community 23 - "Community 23"
Cohesion: 0.08
Nodes (34): af(), bg(), bh(), ce(), ch(), dh(), eh(), Fe() (+26 more)

### Community 24 - "Community 24"
Cohesion: 0.06
Nodes (55): ab(), aa(), Ab(), Ac(), ad(), bd(), cc(), cd() (+47 more)

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (7): ag(), cg(), el(), lg(), Qf(), wi(), x()

### Community 26 - "Community 26"
Cohesion: 0.12
Nodes (27): Aa(), ah(), ai(), bg(), bi(), cg(), ci(), di() (+19 more)

### Community 27 - "Community 27"
Cohesion: 0.08
Nodes (42): ADMIN_EMAIL, approveRequest(), broadcastEmail(), buildBroadcastContent(), dedupeEmails(), deleteUser(), deleteUserByEmail(), downloadEmployeeCv() (+34 more)

### Community 28 - "Community 28"
Cohesion: 0.08
Nodes (25): Aj(), bi(), Bj(), ca(), dk(), Gj(), Hj(), ij() (+17 more)

### Community 29 - "Community 29"
Cohesion: 0.07
Nodes (30): DarkModeBackgroundFix(), Footer(), GlowBackground(), GuidanceModal(), CATEGORIES, Counter(), FAQS, Hero() (+22 more)

### Community 30 - "Community 30"
Cohesion: 0.11
Nodes (21): ac(), bc(), gg(), ie(), jd(), kd(), kh(), Mc() (+13 more)

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
Cohesion: 0.08
Nodes (22): M(), Ef(), Ff(), Gf(), Hf(), ii(), md(), nd() (+14 more)

### Community 35 - "Community 35"
Cohesion: 0.06
Nodes (30): action, default_icon, author, email, background, service_worker, content_security_policy, extension_pages (+22 more)

### Community 36 - "Community 36"
Cohesion: 0.09
Nodes (15): a(), c(), d(), Fa(), Ga(), ja(), ka(), na() (+7 more)

### Community 37 - "Community 37"
Cohesion: 0.09
Nodes (22): af(), be(), bf(), ce(), da(), f(), Ga(), hb() (+14 more)

### Community 38 - "Community 38"
Cohesion: 0.10
Nodes (22): { chatWithAI, getRecommendations, getAIStatus, generateText }, express, { logger }, { optionalAuth }, router, { chatWithAI }, express, { getDb } (+14 more)

### Community 39 - "Community 39"
Cohesion: 0.06
Nodes (33): Additional Notes, Code Reference, Prevention, Problem, Root Cause, Solution, Step 1: Check Current Team Data in MongoDB, Step 2: Enable Team Display for Existing Employees (+25 more)

### Community 40 - "Community 40"
Cohesion: 0.17
Nodes (23): ag(), Bh(), eg(), fg(), hg(), hh(), ig(), J() (+15 more)

### Community 41 - "Community 41"
Cohesion: 0.07
Nodes (26): author, email, background, service_worker, content_capabilities, matches, permissions, content_security_policy (+18 more)

### Community 42 - "Community 42"
Cohesion: 0.07
Nodes (26): am(), bh(), cf(), Ei(), gb(), If(), ik(), kk() (+18 more)

### Community 43 - "Community 43"
Cohesion: 0.06
Nodes (40): ProjectCard(), ActionButton(), joinClasses(), PublicGlassCard(), PublicPageShell(), PublicSection(), PublicSectionHeading(), SEO() (+32 more)

### Community 44 - "Community 44"
Cohesion: 0.18
Nodes (17): bcrypt, {
  createManagedUser,
  createAccountRequest,
  requestPasswordReset,
  verifyResetToken,
  completePasswordReset,
  createHttpError,
}, forgotPassword(), { getDb }, handleControllerError(), jwt, { logger }, login() (+9 more)

### Community 45 - "Community 45"
Cohesion: 0.10
Nodes (16): Ai(), fi(), gd(), gi(), hi(), ii(), ji(), ki() (+8 more)

### Community 46 - "Community 46"
Cohesion: 0.12
Nodes (12): Bf(), Ci(), Mh(), n(), Nh(), oh(), ph(), qh() (+4 more)

### Community 47 - "Community 47"
Cohesion: 0.14
Nodes (19): { connectDB, closeDB }, fixTypoInPlans(), cleanup(), { connectDB, closeDB }, EXPORTS_DIR, fs, path, UNUSED_COLLECTIONS (+11 more)

### Community 48 - "Community 48"
Cohesion: 0.13
Nodes (23): changeMyEmail(), CV_UPLOAD_DIR, cvStorage, cvUpload, fs, getChatContacts(), getMyProfile(), {
  getOwnProfile,
  changeOwnEmail,
  updateOwnProfile,
  uploadEmployeeCv,
  listPublicTeamMembers,
  listChatContacts,
  requestPasswordReset,
  createHttpError,
} (+15 more)

### Community 49 - "Community 49"
Cohesion: 0.09
Nodes (21): app, background, scripts, default_locale, description, display_in_launcher, display_in_new_tab_page, icons (+13 more)

### Community 50 - "Community 50"
Cohesion: 0.12
Nodes (6): a(), c(), Cb(), fa(), ma(), f()

### Community 51 - "Community 51"
Cohesion: 0.71
Nodes (6): qa(), ra(), va(), wa(), xa(), ya()

### Community 52 - "Community 52"
Cohesion: 0.11
Nodes (23): eb(), ek(), fk(), Ga(), gk(), hk(), hl(), ik() (+15 more)

### Community 53 - "Community 53"
Cohesion: 0.22
Nodes (5): mid, ROW1, ROW2, TechMarquee(), TECHS

### Community 54 - "Community 54"
Cohesion: 0.29
Nodes (5): bb(), If(), qc(), rc(), Sa()

### Community 55 - "Community 55"
Cohesion: 0.12
Nodes (8): ji(), mf(), mi(), oi(), tg(), ug(), vg(), wg()

### Community 58 - "Services.jsx"
Cohesion: 0.38
Nodes (6): EmployeeTasks(), getPriority(), getStatus(), priorityConfig, statusConfig, TaskCard()

### Community 60 - "Community 60"
Cohesion: 0.08
Nodes (35): ProtectedAdmin(), ProtectedEmployee(), ProtectedStudent(), RoleRedirect(), ChatPanel(), EMOJIS, formatMsgDateTime(), formatTime() (+27 more)

### Community 61 - "Community 61"
Cohesion: 0.17
Nodes (5): b(), ha(), Ib(), Kb(), La()

### Community 64 - "Community 64"
Cohesion: 0.32
Nodes (7): EmployeeLayout(), getFilteredNavItems(), GRADIENTS, hasPermissionForPath(), iconMap, navItems, PERMISSION_MAP

### Community 65 - "Community 65"
Cohesion: 0.29
Nodes (9): AdminTasks(), avatarColors, buildAssigneeRows(), columns, emptyAssignee, getAvatarInitials(), priorityColors, resolveAssigneeFromTask() (+1 more)

### Community 68 - "Community 68"
Cohesion: 0.25
Nodes (3): g(), Ka(), z()

### Community 69 - "EmployeeTasks.jsx"
Cohesion: 0.09
Nodes (26): ADMIN_PERMISSIONS, AdminPermissions(), getPermissionsArray(), ROLE_PRESETS, avatarColors, DEFAULT_STATUS, QUICK_PROMPTS, WELCOME_MESSAGE (+18 more)

### Community 70 - "Community 70"
Cohesion: 0.33
Nodes (5): ac(), Fb(), Gb(), Hb(), zb()

### Community 71 - "Community 71"
Cohesion: 0.06
Nodes (38): verifyPayment(), { createLogger, format, transports }, fs, logger, logsDir, path, enrichDecodedUser(), { getDb } (+30 more)

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

### Community 150 - ".Z"
Cohesion: 0.23
Nodes (15): cc(), hb(), hc(), Ib(), ic(), jc(), kc(), Nd() (+7 more)

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
- **592 isolated node(s):** `@kilocode/plugin`, `fs`, `path`, `{ sendEmail, emailTemplate }`, `{ getActiveEnrolledEmails }` (+587 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `p()` connect `Community 34` to `Community 9`, `Community 18`, `Community 19`, `Community 21`?**
  _High betweenness centrality (0.362) - this node is a cross-community bridge._
- **Why does `sendReceiptEmail()` connect `Community 19` to `Community 34`, `Community 27`, `Community 12`?**
  _High betweenness centrality (0.252) - this node is a cross-community bridge._
- **Why does `AIChatbot()` connect `Community 34` to `EmployeeTasks.jsx`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.197) - this node is a cross-community bridge._
- **Are the 33 inferred relationships involving `b()` (e.g. with `ad()` and `c()`) actually correct?**
  _`b()` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Are the 30 inferred relationships involving `b()` (e.g. with `ad()` and `.removeAll()`) actually correct?**
  _`b()` has 30 INFERRED edges - model-reasoned connections that need verification._
- **What connects `@kilocode/plugin`, `fs`, `path` to the rest of the system?**
  _593 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05457875457875458 - nodes in this community are weakly interconnected._