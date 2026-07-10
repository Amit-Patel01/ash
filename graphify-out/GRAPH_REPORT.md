# Graph Report - solutionhub  (2026-07-10)

## Corpus Check
- 427 files · ~555,570 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2961 nodes · 7445 edges · 167 communities (159 shown, 8 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 1033 edges (avg confidence: 0.53)
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
1. `useStore()` - 107 edges
2. `useAuth()` - 93 edges
3. `b()` - 75 edges
4. `b()` - 71 edges
5. `getDb()` - 67 edges
6. `b()` - 66 edges
7. `c()` - 57 edges
8. `d()` - 55 edges
9. `d()` - 50 edges
10. `c()` - 49 edges

## Surprising Connections (you probably didn't know these)
- `qc()` --indirect_call--> `Rc()`  [INFERRED]
  frontend/.chrome-test-5/Default/Extensions/lmjegmlicamnimmfhcmpkclmigmmcbeh/3.10_0/offscreen_compiled.js → frontend/.chrome-test-5/Default/Extensions/nmmhkkegccagdldgiimedpiccmgmieda/1.0.0.6_0/craw_background.js
- `getUserRole()` --calls--> `getDb()`  [EXTRACTED]
  backend/services/roleService.js → backend/utils/mongo.js
- `q()` --indirect_call--> `Zd()`  [INFERRED]
  frontend/.chrome-test-5/Default/Extensions/ghbmnnjooekpmoecnnnilnnbdlolhkhi/1.104.1_0/offscreendocument_main.js → frontend/.chrome-test-5/Default/Extensions/lmjegmlicamnimmfhcmpkclmigmmcbeh/3.10_0/offscreen_compiled.js
- `e()` --indirect_call--> `Re()`  [INFERRED]
  frontend/.chrome-test-5/Default/Extensions/ghbmnnjooekpmoecnnnilnnbdlolhkhi/1.104.1_0/offscreendocument_main.js → frontend/.chrome-test-5/Default/Extensions/lmjegmlicamnimmfhcmpkclmigmmcbeh/3.10_0/offscreen_compiled.js
- `ij()` --indirect_call--> `z()`  [INFERRED]
  frontend/.chrome-test-5/Default/Extensions/ghbmnnjooekpmoecnnnilnnbdlolhkhi/1.104.1_0/service_worker_bin_prod.js → frontend/.chrome-test-5/Default/Extensions/ghbmnnjooekpmoecnnnilnnbdlolhkhi/1.104.1_0/offscreendocument_main.js

## Import Cycles
- 1-file cycle: `frontend/src/components/Certificate/index.js -> frontend/src/components/Certificate/index.js`

## Communities (167 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (76): AdminQrCertificates(), buildVerifyUrl(), CERTIFICATE_TYPES, createInitialForm(), formatDisplayDate(), getTypeMeta(), mapCertificateToForm(), resolveAssetSrc() (+68 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (54): ae(), ah(), b(), c(), Cj(), ck(), d(), di() (+46 more)

### Community 2 - "Community 2"
Cohesion: 0.03
Nodes (58): aa(), ag(), al(), bg(), Cf(), cg(), cl(), df() (+50 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (51): ag(), bc(), bg(), Cg(), Cj(), dg(), fg(), fl() (+43 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (46): ai(), Ak(), b(), Bk(), c(), d(), dc(), de() (+38 more)

### Community 5 - "Community 5"
Cohesion: 0.03
Nodes (79): About, AboutTradingMentorship, AdminAccountRequests, AdminCoupons, AdminCourseCategories, AdminCourseEnrollments, AdminCourses, AdminDashboard (+71 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (53): AdminAccountRequests(), AdminCourseCategories(), AdminCourseEnrollments(), AdminDashboard(), AdminEmployees(), avatarColors, departments, employeeRoles (+45 more)

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
Cohesion: 0.06
Nodes (51): ac(), ad(), bb(), Bc(), bd(), bl(), cd(), db() (+43 more)

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
Cohesion: 0.07
Nodes (55): {
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
  validateCouponForPurchase,
}, createCouponRecord(), deleteCouponRecord(), listAllCoupons(), { logger }, updateCouponRecord(), validateCoupon(), { addPaymentJob } (+47 more)

### Community 14 - "Community 14"
Cohesion: 0.07
Nodes (50): Ab(), al(), bl(), cc(), cl(), cm(), dd(), dl() (+42 more)

### Community 15 - "Community 15"
Cohesion: 0.06
Nodes (43): be(), Ae(), Be(), ce(), ch(), dh(), eh(), fh() (+35 more)

### Community 16 - "normalize"
Cohesion: 0.11
Nodes (41): getNotificationMergeKey(), mergeNotificationGroups(), NotificationBell(), EmployeeBroadcastRefined(), EmployeeCourseManageRefined(), EmployeeHomeDashboard(), formatTimeAgo(), getTimeValue() (+33 more)

### Community 17 - "Community 17"
Cohesion: 0.08
Nodes (38): ProtectedAdmin(), ProtectedEmployee(), ProtectedStudent(), RoleRedirect(), ChatPanel(), EMOJIS, formatMsgDateTime(), formatTime() (+30 more)

### Community 18 - "Community 18"
Cohesion: 0.09
Nodes (37): c(), d(), dc(), Df(), e(), ec(), ei(), fc() (+29 more)

### Community 19 - "Community 19"
Cohesion: 0.07
Nodes (42): createUser(), notifyAccountApproval(), verifyProjectPayment(), sendEnrollmentEmail(), verifyPayment(), passport, express, { logger } (+34 more)

### Community 20 - "Community 20"
Cohesion: 0.05
Nodes (43): ALLOWED_MIME_TYPES, fs, imageFilter(), multer, path, uploadBroadcast, uploadCertificateAsset, uploadChat (+35 more)

### Community 21 - "Community 21"
Cohesion: 0.06
Nodes (19): $a(), ab(), Ae(), b(), bb(), cb(), db(), de() (+11 more)

### Community 22 - "Community 22"
Cohesion: 0.12
Nodes (38): AdminCourses(), buildPlanId(), compactText(), COURSE_BLANK, EmployeeCourseManage(), FALLBACK_CATEGORIES, formatDateTimeInput(), formatMeetingPreview() (+30 more)

### Community 23 - "Community 23"
Cohesion: 0.09
Nodes (33): af(), bh(), ce(), ch(), dh(), eh(), Fe(), fh() (+25 more)

### Community 24 - "Community 24"
Cohesion: 0.09
Nodes (36): ab(), aa(), ad(), bd(), cd(), db(), ed(), fc() (+28 more)

### Community 25 - "Community 25"
Cohesion: 0.08
Nodes (24): ADMIN_PERMISSIONS, AdminPermissions(), getPermissionsArray(), ROLE_PRESETS, avatarColors, DEFAULT_STATUS, QUICK_PROMPTS, WELCOME_MESSAGE (+16 more)

### Community 26 - "Community 26"
Cohesion: 0.12
Nodes (27): Aa(), ah(), ai(), bg(), bi(), cg(), ci(), di() (+19 more)

### Community 27 - "Community 27"
Cohesion: 0.10
Nodes (38): ADMIN_EMAIL, approveRequest(), broadcastEmail(), buildBroadcastContent(), dedupeEmails(), deleteUser(), deleteUserByEmail(), downloadEmployeeCv() (+30 more)

### Community 28 - "Community 28"
Cohesion: 0.08
Nodes (24): Ac(), Aj(), Bj(), ca(), Gj(), Hj(), ij(), il() (+16 more)

### Community 29 - "Community 29"
Cohesion: 0.11
Nodes (19): AnnouncementPopup(), DarkModeBackgroundFix(), Footer(), GlowBackground(), GuidanceModal(), Layout(), Navbar(), ThemeContext (+11 more)

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
Nodes (22): A(), Aj(), Bj(), da(), Gj(), Hj(), ij(), jj() (+14 more)

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
Cohesion: 0.11
Nodes (18): am(), bi(), ck(), dk(), gb(), ik(), kk(), mf() (+10 more)

### Community 43 - "Community 43"
Cohesion: 0.18
Nodes (23): normalize(), PublicEmployeeProfile(), socialLinks(), buildTeamProfiles(), fetchApiTeamProfiles(), fetchFirestoreTeamProfiles(), fetchPublicTeamProfiles(), genericRoles (+15 more)

### Community 44 - "Community 44"
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

### Community 45 - "Community 45"
Cohesion: 0.09
Nodes (13): Ai(), gi(), hi(), ii(), ji(), ki(), Mg(), mi() (+5 more)

### Community 46 - "Community 46"
Cohesion: 0.09
Nodes (17): Bf(), Ci(), ek(), fk(), gk(), hk(), hl(), If() (+9 more)

### Community 47 - "Community 47"
Cohesion: 0.14
Nodes (19): { connectDB, closeDB }, fixTypoInPlans(), cleanup(), { connectDB, closeDB }, EXPORTS_DIR, fs, path, UNUSED_COLLECTIONS (+11 more)

### Community 48 - "Community 48"
Cohesion: 0.09
Nodes (16): CATEGORIES, Counter(), FAQS, STATS, STEPS, TECH_STACK, TechIllustration(), TESTIMONIALS (+8 more)

### Community 49 - "Community 49"
Cohesion: 0.09
Nodes (21): app, background, scripts, default_locale, description, display_in_launcher, display_in_new_tab_page, icons (+13 more)

### Community 50 - "Community 50"
Cohesion: 0.12
Nodes (6): a(), c(), Cb(), fa(), ma(), f()

### Community 52 - "Community 52"
Cohesion: 0.18
Nodes (17): bcrypt, {
  createManagedUser,
  createAccountRequest,
  requestPasswordReset,
  verifyResetToken,
  completePasswordReset,
  createHttpError,
}, forgotPassword(), { getDb }, handleControllerError(), jwt, { logger }, login() (+9 more)

### Community 53 - "Community 53"
Cohesion: 0.14
Nodes (13): ke(), L(), le(), M(), O(), qe(), R(), ud() (+5 more)

### Community 54 - "Community 54"
Cohesion: 0.12
Nodes (11): Bf(), bh(), cf(), Ci(), df(), fe(), hi(), sh() (+3 more)

### Community 55 - "Community 55"
Cohesion: 0.12
Nodes (8): ji(), mf(), mi(), oi(), tg(), ug(), vg(), wg()

### Community 56 - "Community 56"
Cohesion: 0.26
Nodes (14): cc(), hb(), hc(), Ib(), ic(), jc(), kc(), Nd() (+6 more)

### Community 57 - "Community 57"
Cohesion: 0.25
Nodes (13): AdminCoupons(), buildPlanKey(), createBlankForm(), formatDate(), formatDiscount(), toDateInputValue(), compactPlanKey(), CourseEnrollModal() (+5 more)

### Community 58 - "Community 58"
Cohesion: 0.27
Nodes (10): ProjectCard(), ActionButton(), joinClasses(), PublicGlassCard(), PublicPageShell(), PublicSection(), PublicSectionHeading(), contactInfo (+2 more)

### Community 59 - ".X"
Cohesion: 0.17
Nodes (9): ff(), gf(), hf(), jf(), lf(), nf(), vf(), W() (+1 more)

### Community 60 - "Community 60"
Cohesion: 0.27
Nodes (8): dd(), Dl(), ha(), il(), jl(), uk(), ul(), yg()

### Community 61 - "Community 61"
Cohesion: 0.17
Nodes (5): b(), ha(), Ib(), Kb(), La()

### Community 62 - "Community 62"
Cohesion: 0.27
Nodes (7): yf(), ki(), ll(), ti(), ui(), yh(), zh()

### Community 63 - "Community 63"
Cohesion: 0.06
Nodes (35): { createLogger, format, transports }, fs, logger, logsDir, path, enrichDecodedUser(), { getDb }, jwt (+27 more)

### Community 64 - "Community 64"
Cohesion: 0.22
Nodes (6): Ei(), If(), ph(), qh(), rh(), th()

### Community 65 - "Community 65"
Cohesion: 0.29
Nodes (9): AdminTasks(), avatarColors, buildAssigneeRows(), columns, emptyAssignee, getAvatarInitials(), priorityColors, resolveAssigneeFromTask() (+1 more)

### Community 66 - "Community 66"
Cohesion: 0.25
Nodes (5): Ia(), jk(), wk(), zf(), Sf()

### Community 67 - "Community 67"
Cohesion: 0.71
Nodes (6): qa(), ra(), va(), wa(), xa(), ya()

### Community 68 - "Community 68"
Cohesion: 0.25
Nodes (3): g(), Ka(), z()

### Community 69 - "Community 69"
Cohesion: 0.32
Nodes (7): EmployeeLayout(), getFilteredNavItems(), GRADIENTS, hasPermissionForPath(), iconMap, navItems, PERMISSION_MAP

### Community 70 - "Community 70"
Cohesion: 0.33
Nodes (5): ac(), Fb(), Gb(), Hb(), zb()

### Community 71 - "Community 71"
Cohesion: 0.38
Nodes (6): EmployeeTasks(), getPriority(), getStatus(), priorityConfig, statusConfig, TaskCard()

### Community 72 - "Community 72"
Cohesion: 0.43
Nodes (6): accentByCategory(), featuresForService(), iconLibrary, processSteps, routeForService(), Services()

### Community 73 - "Community 73"
Cohesion: 0.33
Nodes (4): credentialsPath, fs, { google }, path

### Community 74 - "Community 74"
Cohesion: 0.33
Nodes (4): capabilities, coreInfrastructure, services, techStack

### Community 75 - "Community 75"
Cohesion: 0.53
Nodes (5): formatDate(), getStatusColor(), getStatusStep(), STEPS, UserOrders()

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

### Community 186 - "Community 186"
Cohesion: 0.05
Nodes (40): dependencies, framer-motion, html2canvas, html-to-image, jspdf, lucide-react, qrcode.react, react (+32 more)

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
- **586 isolated node(s):** `fs`, `path`, `{ sendEmail, emailTemplate }`, `{ getActiveEnrolledEmails }`, `{ getDb }` (+581 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `w()` connect `Community 8` to `Community 34`, `Community 14`, `Community 18`, `Community 60`, `Community 29`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Why does `GlowBackground()` connect `Community 29` to `Community 8`?**
  _High betweenness centrality (0.114) - this node is a cross-community bridge._
- **Why does `useStore()` connect `Community 6` to `Community 0`, `Community 65`, `Community 34`, `Community 5`, `Community 69`, `Community 71`, `Community 72`, `Community 43`, `Community 75`, `Community 48`, `normalize`, `Community 22`, `Community 57`, `Community 58`, `Community 29`, `Community 25`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Are the 33 inferred relationships involving `b()` (e.g. with `ad()` and `c()`) actually correct?**
  _`b()` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Are the 30 inferred relationships involving `b()` (e.g. with `ad()` and `.removeAll()`) actually correct?**
  _`b()` has 30 INFERRED edges - model-reasoned connections that need verification._
- **What connects `fs`, `path`, `{ sendEmail, emailTemplate }` to the rest of the system?**
  _587 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05558728345707215 - nodes in this community are weakly interconnected._