# Graph Report - amitsolutionhub  (2026-08-11)

## Corpus Check
- 718 files · ~1,647,951 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4278 nodes · 10064 edges · 325 communities (261 shown, 64 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 1095 edges (avg confidence: 0.53)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1f415542`
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
- razorpayController.js
- getDb
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
- Community 85
- Community 86
- Community 87
- Community 88
- Community 89
- Community 90
- Community 91
- Community 92
- Community 93
- EmployeeTasks.jsx
- Community 95
- page.jsx
- Community 97
- Community 98
- Community 99
- Community 100
- Community 102
- Community 104
- Community 105
- Community 108
- Community 109
- Community 110
- Community 112
- Community 113
- Community 115
- Community 116
- Community 117
- Community 118
- Community 119
- Community 120
- Community 121
- Community 123
- Community 124
- Community 125
- Community 126
- Community 127
- Community 128
- Community 129
- Community 130
- Community 131
- Community 132
- Community 133
- Community 134
- Community 135
- Community 136
- Community 137
- Community 138
- Community 139
- Community 140
- Community 141
- Community 142
- Community 143
- Community 144
- Community 145
- Community 146
- Community 147
- authMiddleware.js
- tradingController.js
- notificationService.js
- .Z
- AdminTasks.jsx
- authMiddleware.js
- Services.jsx
- chat.js
- RequestAccount.jsx
- App
- lazyWithRetry
- TechMarquee.jsx
- agentDispatcher.js
- agentDispatcher.js
- ModuleLoadErrorFallback
- AdminTasks.jsx
- demo_newsletter.js
- check_maintenance_db.js
- fix_maintenance_setting.js
- set_maintenance_prod_on_dev_off.js
- App
- EmployeeTasks.jsx
- MaintenancePage.jsx
- Projects.jsx
- middleware.js
- mongo.js
- next.config.mjs
- Community 205
- reset_attempts.js
- Community 214
- Community 219
- App
- lazyWithRetry
- MaintenancePage.jsx
- Community 299
- Coding Conventions
- Testing Strategy
- route.js
- React + Vite
- Integrations
- Tech Stack
- Project Structure
- email.js
- Community 315
- route.js
- page.jsx
- page.jsx
- dependencies
- vercel.json
- route.js
- graphify
- graphify
- emailTemplate.js

## God Nodes (most connected - your core abstractions)
1. `useStore()` - 126 edges
2. `useStore()` - 124 edges
3. `useAuth()` - 101 edges
4. `useAuth()` - 101 edges
5. `getDb()` - 76 edges
6. `b()` - 75 edges
7. `b()` - 71 edges
8. `b()` - 66 edges
9. `c()` - 57 edges
10. `d()` - 55 edges

## Surprising Connections (you probably didn't know these)
- `EmployeeDashboard()` --indirect_call--> `w()`  [INFERRED]
  src/admin/EmployeeDashboard.jsx → legacy_backup/frontend/.chrome-test-5/Default/Extensions/lmjegmlicamnimmfhcmpkclmigmmcbeh/3.10_0/background_compiled.js
- `GlowBackground()` --indirect_call--> `w()`  [INFERRED]
  src/components/GlowBackground.jsx → legacy_backup/frontend/.chrome-test-5/Default/Extensions/lmjegmlicamnimmfhcmpkclmigmmcbeh/3.10_0/background_compiled.js
- `Layout()` --indirect_call--> `p()`  [INFERRED]
  src/components/Layout.jsx → legacy_backup/frontend/.chrome-test-5/Default/Extensions/lmjegmlicamnimmfhcmpkclmigmmcbeh/3.10_0/offscreen_compiled.js
- `AIChatbot()` --indirect_call--> `p()`  [INFERRED]
  src/components/AIChatbot.jsx → legacy_backup/frontend/.chrome-test-5/Default/Extensions/lmjegmlicamnimmfhcmpkclmigmmcbeh/3.10_0/offscreen_compiled.js
- `qc()` --indirect_call--> `Rc()`  [INFERRED]
  legacy_backup/frontend/.chrome-test-5/Default/Extensions/lmjegmlicamnimmfhcmpkclmigmmcbeh/3.10_0/offscreen_compiled.js → legacy_backup/frontend/.chrome-test-5/Default/Extensions/nmmhkkegccagdldgiimedpiccmgmieda/1.0.0.6_0/craw_background.js

## Import Cycles
- 1-file cycle: `legacy_backup/frontend/src/components/Certificate/index.js -> legacy_backup/frontend/src/components/Certificate/index.js`
- 1-file cycle: `src/components/Certificate/index.js -> src/components/Certificate/index.js`

## Communities (325 total, 64 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (76): AdminQrCertificates(), buildVerifyUrl(), CERTIFICATE_TYPES, createInitialForm(), formatDisplayDate(), getTypeMeta(), mapCertificateToForm(), resolveAssetSrc() (+68 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (26): ai(), ff(), fm(), gf(), gm(), H(), hf(), hm() (+18 more)

### Community 2 - "Community 2"
Cohesion: 0.03
Nodes (61): aa(), af(), ah(), Bf(), bh(), ce(), Cf(), Ci() (+53 more)

### Community 3 - "Community 3"
Cohesion: 0.03
Nodes (57): be(), Ae(), bc(), Be(), Bf(), bh(), ce(), cf() (+49 more)

### Community 4 - "Community 4"
Cohesion: 0.02
Nodes (87): About, AboutTradingMentorship, AdminAccountRequests, AdminAIDepartments, AdminCoupons, AdminCourseCategories, AdminCourseEnrollments, AdminCourses (+79 more)

### Community 5 - "Community 5"
Cohesion: 0.16
Nodes (17): ChatPanel(), EMOJIS, formatMsgDateTime(), formatTime(), getContactName(), getDayLabel(), toMessageDate(), ChatContext (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (34): Ak(), b(), Bk(), Ci(), d(), e(), ef(), ek() (+26 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (38): AdminLayout(), iconMap, navGroups, ProtectedAdmin(), ProtectedEmployee(), ProtectedStudent(), RoleRedirect(), DarkModeBackgroundFix() (+30 more)

### Community 8 - "Community 8"
Cohesion: 0.03
Nodes (78): About, AboutTradingMentorship, AdminAccountRequests, AdminAIDepartments, AdminCoupons, AdminCourseCategories, AdminCourseEnrollments, AdminCourses (+70 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (66): ADMIN_EMAIL, approveRequest(), broadcastEmail(), buildBroadcastContent(), createUser(), dedupeEmails(), deleteUser(), deleteUserByEmail() (+58 more)

### Community 10 - "Community 10"
Cohesion: 0.05
Nodes (40): dependencies, framer-motion, html2canvas, html-to-image, jspdf, lucide-react, qrcode.react, react (+32 more)

### Community 11 - "Community 11"
Cohesion: 0.06
Nodes (50): AdminAccountRequests(), AdminDashboard(), AdminLayout(), iconMap, navGroups, ProtectedAdmin(), ProtectedEmployee(), ProtectedStudent() (+42 more)

### Community 12 - "Community 12"
Cohesion: 0.10
Nodes (70): mergeUsers(), { admin }, approveAccountRequest(), assertMySqlReady(), bcrypt, buildFirestoreAccountRequestPayload(), buildFirestoreUserPayload(), buildResetEmailMarkup() (+62 more)

### Community 13 - "Community 13"
Cohesion: 0.08
Nodes (36): ae(), b(), c(), ck(), d(), di(), dk(), e() (+28 more)

### Community 14 - "Community 14"
Cohesion: 0.04
Nodes (45): ad(), af(), ai(), cc(), cd(), ce(), cf(), dg() (+37 more)

### Community 15 - "Community 15"
Cohesion: 0.05
Nodes (40): AdminCourseEnrollments(), AdminInternshipCategories(), COLOR_OPTIONS, EMPTY_FORM, ICON_MAP, ICON_OPTIONS, LEVEL_OPTIONS, AdminProjects() (+32 more)

### Community 16 - "normalize"
Cohesion: 0.11
Nodes (24): ADMIN_PERMISSIONS, AdminPermissions(), getPermissionsArray(), ROLE_PRESETS, GuidanceModal(), api, API_BASE, DEVTUNNEL_FALLBACK_URL (+16 more)

### Community 17 - "sendEmail"
Cohesion: 0.14
Nodes (19): AdminCoupons(), buildPlanKey(), createBlankForm(), formatDate(), formatDiscount(), toDateInputValue(), AdminEmployees(), avatarColors (+11 more)

### Community 18 - "Community 18"
Cohesion: 0.07
Nodes (29): A(), b(), c(), D(), da(), e(), ea(), fa() (+21 more)

### Community 19 - "Community 19"
Cohesion: 0.11
Nodes (43): getNotificationMergeKey(), mergeNotificationGroups(), NotificationBell(), EmployeeBroadcastRefined(), EmployeeCourseManageRefined(), EmployeeHomeDashboard(), formatTimeAgo(), getTimeValue() (+35 more)

### Community 20 - "Community 20"
Cohesion: 0.08
Nodes (58): getNotificationMergeKey(), mergeNotificationGroups(), NotificationBell(), EmployeeBroadcastRefined(), buildPlanId(), compactText(), COURSE_BLANK, EmployeeCourseManage() (+50 more)

### Community 21 - "Community 21"
Cohesion: 0.12
Nodes (21): de(), dh(), eh(), fh(), gh(), hh(), ih(), Kd() (+13 more)

### Community 22 - "Community 22"
Cohesion: 0.09
Nodes (43): ADMIN_EMAIL, buildVerifyResponseData(), buildVerifyUrl(), createQrCertificate(), generateCertificateId(), generateUniqueCertificateId(), {
  getCertificateByUserAndCourse,
  addCertificate,
  getCertificateById,
  updateCertificate,
  getCertificateByPublicId,
  findCertificateByPublicId,
  createCertificateRecord,
  deleteCertificate,
}, getFrontendUrl() (+35 more)

### Community 23 - "Community 23"
Cohesion: 0.11
Nodes (37): AdminCourseCategories(), AdminCourses(), compactPlanKey(), CourseEnrollModal(), getPlanIdentity(), loadRazorpayScript(), matchesPlanEnrollment(), normalizePlanKey() (+29 more)

### Community 24 - "Community 24"
Cohesion: 0.10
Nodes (43): AdminCourseCategories(), AdminCourses(), buildPlanId(), compactText(), COURSE_BLANK, EmployeeCourseManage(), FALLBACK_CATEGORIES, formatDateTimeInput() (+35 more)

### Community 26 - "Community 26"
Cohesion: 0.06
Nodes (56): ac(), ad(), Bc(), bd(), bl(), cd(), db(), dc() (+48 more)

### Community 27 - "Community 27"
Cohesion: 0.07
Nodes (38): ab(), aa(), Ab(), Ac(), ad(), bd(), cc(), cd() (+30 more)

### Community 28 - "G"
Cohesion: 0.04
Nodes (50): passport, { createLogger, format, transports }, fs, logger, logsDir, path, ADMIN_EMAILS, enrichDecodedUser() (+42 more)

### Community 29 - "Community 29"
Cohesion: 0.06
Nodes (47): b(), ba(), be(), bf(), c(), d(), da(), dc() (+39 more)

### Community 30 - "Community 30"
Cohesion: 0.05
Nodes (40): ALLOWED_MIME_TYPES, fs, imageFilter(), multer, path, uploadBroadcast, uploadCertificateAsset, uploadChat (+32 more)

### Community 31 - "Community 31"
Cohesion: 0.06
Nodes (30): AdminMessages(), ADMIN_PERMISSIONS, AdminPermissions(), getPermissionsArray(), ROLE_PRESETS, AdminReceipts(), getAbsoluteUrl(), numberToWords() (+22 more)

### Community 32 - "Community 32"
Cohesion: 0.13
Nodes (14): cl(), cm(), dm(), Ei(), em(), If(), lg(), n() (+6 more)

### Community 33 - "Community 33"
Cohesion: 0.13
Nodes (12): $a(), ab(), Ae(), bb(), cb(), db(), eb(), qe() (+4 more)

### Community 34 - "Community 34"
Cohesion: 0.08
Nodes (24): eb(), ek(), fk(), Ga(), gk(), hk(), hl(), ik() (+16 more)

### Community 35 - "Community 35"
Cohesion: 0.08
Nodes (39): ag(), bg(), bl(), c(), Cg(), Cj(), dg(), fg() (+31 more)

### Community 36 - "Community 36"
Cohesion: 0.13
Nodes (22): AdminCoupons(), buildPlanKey(), createBlankForm(), formatDate(), formatDiscount(), toDateInputValue(), compactPlanKey(), CourseEnrollModal() (+14 more)

### Community 37 - "EmployeeLayout.jsx"
Cohesion: 0.06
Nodes (33): Additional Notes, Code Reference, Prevention, Problem, Root Cause, Solution, Step 1: Check Current Team Data in MongoDB, Step 2: Enable Team Display for Existing Employees (+25 more)

### Community 38 - "Community 38"
Cohesion: 0.13
Nodes (34): {
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
  validateCouponForPurchase,
}, createCouponRecord(), deleteCouponRecord(), listAllCoupons(), { logger }, updateCouponRecord(), validateCoupon(), { adminOnly } (+26 more)

### Community 39 - "Community 39"
Cohesion: 0.06
Nodes (30): action, default_icon, author, email, background, service_worker, content_security_policy, extension_pages (+22 more)

### Community 40 - "Community 40"
Cohesion: 0.09
Nodes (20): ag(), al(), cg(), el(), ff(), kg(), lg(), ll() (+12 more)

### Community 41 - "Community 41"
Cohesion: 0.10
Nodes (22): Aj(), Bj(), ca(), Gj(), Hj(), ij(), jj(), kj() (+14 more)

### Community 42 - "Community 42"
Cohesion: 0.04
Nodes (54): AdminAccountRequests(), AdminCourseEnrollments(), AdminDashboard(), AdminInternshipCategories(), COLOR_OPTIONS, EMPTY_FORM, ICON_MAP, ICON_OPTIONS (+46 more)

### Community 43 - "Community 43"
Cohesion: 0.09
Nodes (24): ac(), bc(), Df(), gg(), ie(), jb(), jd(), kd() (+16 more)

### Community 44 - "oh"
Cohesion: 0.11
Nodes (27): bg(), ch(), dh(), eh(), fg(), fh(), gh(), hh() (+19 more)

### Community 45 - ".then"
Cohesion: 0.10
Nodes (23): A(), Aj(), Bj(), da(), Gj(), Hj(), ij(), jj() (+15 more)

### Community 46 - "Community 46"
Cohesion: 0.07
Nodes (11): Aa(), Ab(), Ba(), Bb(), Ea(), Pa(), ra(), Rc() (+3 more)

### Community 47 - "Community 47"
Cohesion: 0.05
Nodes (43): dependencies, @anthropic-ai/sdk, @aws-sdk/client-bedrock-runtime, bcryptjs, dotenv, framer-motion, @google/generative-ai, html2canvas (+35 more)

### Community 48 - "Community 48"
Cohesion: 0.09
Nodes (15): a(), c(), d(), Fa(), Ga(), ja(), ka(), na() (+7 more)

### Community 49 - "Community 49"
Cohesion: 0.10
Nodes (17): gd(), ke(), L(), le(), lh(), M(), O(), qe() (+9 more)

### Community 50 - "Community 50"
Cohesion: 0.16
Nodes (26): Aa(), ah(), bg(), bi(), cg(), ci(), di(), ei() (+18 more)

### Community 51 - "authController.js"
Cohesion: 0.13
Nodes (22): razorpay, razorpay, { addPaymentJob }, compactPlanKey(), createCourseOrder(), createOrder(), crypto, { getDb } (+14 more)

### Community 52 - "hg"
Cohesion: 0.10
Nodes (23): { adminOnly }, { chatWithAI, getRecommendations, getAIStatus, generateText }, { dispatchDepartmentTask }, dispatchRateLimiter, express, { getDepartmentConfig, updateDepartmentConfig, getExecutionLogs, getPendingProposals, generateRealtimeProposalsFromCodebase, resolveProposal, clearAllProposals }, { logger }, router (+15 more)

### Community 53 - "Community 53"
Cohesion: 0.07
Nodes (26): author, email, background, service_worker, content_capabilities, matches, permissions, content_security_policy (+18 more)

### Community 54 - ".m"
Cohesion: 0.09
Nodes (21): M(), Ef(), Ff(), Gf(), Hf(), ii(), md(), nd() (+13 more)

### Community 55 - "razorpayController.js"
Cohesion: 0.10
Nodes (12): ji(), mf(), rg(), sg(), td(), tg(), ug(), vd() (+4 more)

### Community 56 - "Community 56"
Cohesion: 0.12
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

### Community 57 - "Community 57"
Cohesion: 0.18
Nodes (23): normalize(), PublicEmployeeProfile(), socialLinks(), buildTeamProfiles(), fetchApiTeamProfiles(), fetchFirestoreTeamProfiles(), fetchPublicTeamProfiles(), genericRoles (+15 more)

### Community 58 - "tradingController.js"
Cohesion: 0.18
Nodes (23): buildTeamProfiles(), fetchApiTeamProfiles(), fetchFirestoreTeamProfiles(), fetchPublicTeamProfiles(), genericRoles, getTeamMemberImageUrl(), getTeamMemberKeys(), getTeamMemberProfileId() (+15 more)

### Community 59 - ".X"
Cohesion: 0.27
Nodes (14): cc(), hb(), hc(), Ib(), ic(), jc(), kc(), Qb() (+6 more)

### Community 60 - "Community 60"
Cohesion: 0.16
Nodes (23): ag(), Bh(), eg(), fg(), hg(), hh(), ig(), J() (+15 more)

### Community 61 - "Community 61"
Cohesion: 0.07
Nodes (26): 1️⃣ Backend Test (2 minutes), 2️⃣ Frontend Test (3 minutes), 3️⃣ Data Setup (If profiles not showing), 4️⃣ Browser Console Debugging, Backend Console:, Bonus Checks:, Check network requests:, Check React state: (+18 more)

### Community 62 - "SEO.jsx"
Cohesion: 0.09
Nodes (21): app, background, scripts, default_locale, description, display_in_launcher, display_in_new_tab_page, icons (+13 more)

### Community 63 - "razorpayController.js"
Cohesion: 0.23
Nodes (20): addExecutionLog(), addPendingProposal(), { addPendingProposal, addExecutionLog }, cron, { dispatchDepartmentTask }, { generateUnsubscribeToken }, getSubscribedEmails(), { logger } (+12 more)

### Community 64 - "getDb"
Cohesion: 0.08
Nodes (47): verifyProjectPayment(), { addPaymentJob }, crypto, { logger }, {
  savePayment,
  createEnrollment,
  getEnrollmentsByCourse,
  getSession,
  updateSession,
}, { sendEmail, emailTemplate }, sendEnrollmentEmail(), toggleLive() (+39 more)

### Community 65 - "th"
Cohesion: 0.14
Nodes (19): { connectDB, closeDB }, fixTypoInPlans(), cleanup(), { connectDB, closeDB }, EXPORTS_DIR, fs, path, UNUSED_COLLECTIONS (+11 more)

### Community 66 - ".aa"
Cohesion: 0.14
Nodes (14): AnnouncementPopup(), DarkModeBackgroundFix(), Footer(), GlowBackground(), GuidanceModal(), Layout(), Navbar(), ThemeContext (+6 more)

### Community 67 - "qc"
Cohesion: 0.14
Nodes (21): bcrypt, {
  createManagedUser,
  createAccountRequest,
  requestPasswordReset,
  verifyResetToken,
  completePasswordReset,
  createHttpError,
}, crypto, forgotPassword(), getClientIp(), { getDb }, handleControllerError(), jwt (+13 more)

### Community 68 - "Community 68"
Cohesion: 0.11
Nodes (7): ACCENTS, AdminAIDepartments(), callsign(), formatAiText(), getAccent(), getAiAdminHeaders(), getDepartmentIcon()

### Community 71 - "wg"
Cohesion: 0.11
Nodes (7): ACCENTS, AdminAIDepartments(), callsign(), formatAiText(), getAccent(), getAiAdminHeaders(), getDepartmentIcon()

### Community 73 - "Community 73"
Cohesion: 0.12
Nodes (12): am(), bi(), ck(), dk(), gb(), ik(), kk(), Rk() (+4 more)

### Community 74 - "Community 74"
Cohesion: 0.19
Nodes (15): ProjectCard(), ActionButton(), joinClasses(), PublicGlassCard(), PublicPageShell(), PublicSection(), PublicSectionHeading(), contactInfo (+7 more)

### Community 75 - "EmployeeTasks.jsx"
Cohesion: 0.19
Nodes (15): ProjectCard(), ActionButton(), joinClasses(), PublicGlassCard(), PublicPageShell(), PublicSection(), PublicSectionHeading(), contactInfo (+7 more)

### Community 76 - "Community 76"
Cohesion: 0.13
Nodes (24): AdminEmployees(), avatarColors, departments, employeeRoles, departments, EmployeeDashboard(), EmployeeDashboardRoute(), employeeRoles (+16 more)

### Community 77 - "Community 77"
Cohesion: 0.12
Nodes (6): a(), c(), Cb(), fa(), ma(), f()

### Community 78 - "Community 78"
Cohesion: 0.11
Nodes (14): CATEGORIES, Counter(), FAQS, Hero(), HERO_PARTICLES, STATS, STEPS, TECH_STACK (+6 more)

### Community 79 - "Community 79"
Cohesion: 0.21
Nodes (9): AdminProfile(), createProfileForm(), ImageCropModal(), createProfileForm(), EmployeeProfileRefined(), getEmployeeInitials(), createProfileForm(), getInitials() (+1 more)

### Community 80 - "Community 80"
Cohesion: 0.71
Nodes (6): qa(), ra(), va(), wa(), xa(), ya()

### Community 81 - "Community 81"
Cohesion: 0.14
Nodes (18): al(), dl(), eg(), fb(), fd(), gd(), hl(), im() (+10 more)

### Community 82 - "Community 82"
Cohesion: 0.17
Nodes (11): Active Phase, Backend Controllers, Backend Middlewares, Backend Routes, Backend Services, Current Status [2026-04-07], Frontend, Key Decisions (+3 more)

### Community 83 - "Community 83"
Cohesion: 0.13
Nodes (12): CATEGORIES, FAQS, Hero(), HERO_PARTICLES, STATS, STEPS, TECH_STACK, TESTIMONIALS (+4 more)

### Community 84 - "Community 84"
Cohesion: 0.26
Nodes (11): AI_KEY_SOURCES, buildChatContents(), chatWithAI(), extractTextFromResponse(), generateText(), getRecommendations(), https, keySourceEntry (+3 more)

### Community 85 - "Community 85"
Cohesion: 0.22
Nodes (16): dd(), fc(), hc(), jb(), jc(), Kb(), kc(), lc() (+8 more)

### Community 86 - "Community 86"
Cohesion: 0.09
Nodes (14): Ai(), bb(), gi(), hi(), If(), ii(), ji(), ki() (+6 more)

### Community 87 - "Community 87"
Cohesion: 0.06
Nodes (34): author, dependencies, bcryptjs, cors, dotenv, express, express-rate-limit, @google/generative-ai (+26 more)

### Community 88 - "Community 88"
Cohesion: 0.20
Nodes (9): Admin Management, E-Commerce (Projects), Functional Requirements (FR), Non-Functional Requirements (NFR), Reliability, Requirements: SolutionHub, Security, Trading Mentorship (+1 more)

### Community 89 - "Community 89"
Cohesion: 0.15
Nodes (6): de(), Ja(), pi(), ri(), ve(), Ye()

### Community 90 - "Community 90"
Cohesion: 0.20
Nodes (3): DEFAULT_STATUS, QUICK_PROMPTS, WELCOME_MESSAGE

### Community 91 - "Community 91"
Cohesion: 0.18
Nodes (9): EmployeeBroadcast, EmployeeCourseManage, EmployeeHomeDashboard, EmployeeLayout, EmployeePage(), EmployeeProfile, EmployeeProjects, EmployeeTasks (+1 more)

### Community 92 - "Community 92"
Cohesion: 0.18
Nodes (9): UserCertificates, UserCustomProject, UserLayout, UserMyCourses, UserOrders, UserOverview, UserPage(), UserProfile (+1 more)

### Community 93 - "Community 93"
Cohesion: 0.28
Nodes (6): TermsAndConditions(), departments, initialForm, RequestAccount(), roles, StudentSignup()

### Community 94 - "EmployeeTasks.jsx"
Cohesion: 0.38
Nodes (6): EmployeeTasks(), getPriority(), getStatus(), priorityConfig, statusConfig, TaskCard()

### Community 95 - "Community 95"
Cohesion: 0.17
Nodes (5): b(), ha(), Ib(), Kb(), La()

### Community 97 - "Community 97"
Cohesion: 0.29
Nodes (9): AdminTasks(), avatarColors, buildAssigneeRows(), columns, emptyAssignee, getAvatarInitials(), priorityColors, resolveAssigneeFromTask() (+1 more)

### Community 98 - "Community 98"
Cohesion: 0.83
Nodes (3): createProfileForm(), getInitials(), UserProfile()

### Community 99 - "Community 99"
Cohesion: 0.05
Nodes (76): AdminQrCertificates(), buildVerifyUrl(), CERTIFICATE_TYPES, createInitialForm(), formatDisplayDate(), getTypeMeta(), mapCertificateToForm(), resolveAssetSrc() (+68 more)

### Community 100 - "Community 100"
Cohesion: 0.22
Nodes (5): { chatWithAI }, express, { getDb }, { logger }, router

### Community 102 - "Community 102"
Cohesion: 0.22
Nodes (5): mid, ROW1, ROW2, TechMarquee(), TECHS

### Community 104 - "Community 104"
Cohesion: 0.22
Nodes (5): mid, ROW1, ROW2, TechMarquee(), TECHS

### Community 105 - "Community 105"
Cohesion: 0.54
Nodes (7): DELETE(), GET(), getQueryId(), PATCH(), POST(), PUBLIC_GET_COLLECTIONS, verifyAuth()

### Community 108 - "Community 108"
Cohesion: 0.25
Nodes (3): g(), Ka(), z()

### Community 109 - "Community 109"
Cohesion: 0.22
Nodes (7): crypto, express, generateUnsubscribeToken(), { getDb }, { logger }, router, buildUnsubscribeUrl()

### Community 110 - "Community 110"
Cohesion: 0.33
Nodes (5): ac(), Fb(), Gb(), Hb(), zb()

### Community 112 - "Community 112"
Cohesion: 0.33
Nodes (4): credentialsPath, fs, { google }, path

### Community 113 - "Community 113"
Cohesion: 0.33
Nodes (4): capabilities, coreInfrastructure, services, techStack

### Community 115 - "Community 115"
Cohesion: 0.33
Nodes (4): capabilities, coreInfrastructure, services, techStack

### Community 116 - "Community 116"
Cohesion: 0.40
Nodes (4): compilerOptions, baseUrl, paths, @/*

### Community 117 - "Community 117"
Cohesion: 0.50
Nodes (4): ADMIN_EMAILS, fixDb(), main(), { MongoClient }

### Community 118 - "Community 118"
Cohesion: 0.40
Nodes (3): bcrypt, client, { MongoClient }

### Community 119 - "Community 119"
Cohesion: 0.40
Nodes (4): body, http, options, req

### Community 123 - "Community 123"
Cohesion: 0.83
Nodes (3): GET(), getUserFromToken(), PATCH()

### Community 146 - "Community 146"
Cohesion: 0.50
Nodes (3): express, pool, router

### Community 147 - "Community 147"
Cohesion: 0.67
Nodes (3): main(), migrate(), { MongoClient }

### Community 148 - "authMiddleware.js"
Cohesion: 0.50
Nodes (3): crons, framework, headers

### Community 151 - ".Z"
Cohesion: 0.07
Nodes (26): AdminAccountRequests, AdminAIDepartments, AdminCoupons, AdminCourseCategories, AdminCourseEnrollments, AdminCourses, AdminDashboard, AdminEmployees (+18 more)

### Community 152 - "AdminTasks.jsx"
Cohesion: 0.50
Nodes (3): http, options, req

### Community 155 - "authMiddleware.js"
Cohesion: 0.50
Nodes (4): getModuleErrorAutoRefreshCount(), getModuleErrorCacheBustCount(), isRecoverableModuleLoadError(), ModuleLoadErrorFallback()

### Community 174 - "MaintenancePage.jsx"
Cohesion: 0.25
Nodes (7): Backend, Core Pillars, Frontend, Project Context: SolutionHub, Success Metrics, Technical Foundation, Vision

### Community 205 - "Community 205"
Cohesion: 0.36
Nodes (7): classifyIntent(), dispatchDepartmentTask(), { generateText }, { getDepartmentConfig, addExecutionLog }, getDeptRole(), { logger }, getDepartmentConfig()

### Community 214 - "Community 214"
Cohesion: 0.29
Nodes (6): Phase 1: GSD Workflow Initialization [CURRENT], Phase 2: Core Refinement & Security, Phase 3: Marketplace Optimization, Phase 4: Trading Ecosystem Expansion, Phase 5: Admin Panel 2.0, Roadmap: SolutionHub

### Community 219 - "Community 219"
Cohesion: 0.40
Nodes (4): Architecture, Backend, Frontend, System Overview

### Community 299 - "Community 299"
Cohesion: 0.40
Nodes (4): Code Hygiene, Concerns, Performance/Scaling, Security

### Community 307 - "Coding Conventions"
Cohesion: 0.40
Nodes (4): Coding Conventions, Component Pattern, Language, Styles

### Community 308 - "Testing Strategy"
Cohesion: 0.40
Nodes (4): Automatic Testing, Manual Testing, Testing Strategy, Verification Plan

### Community 310 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 311 - "Integrations"
Cohesion: 0.50
Nodes (3): Core Services, Integrations, Media Handling

### Community 312 - "Tech Stack"
Cohesion: 0.50
Nodes (3): Backend, Frontend, Tech Stack

### Community 313 - "Project Structure"
Cohesion: 0.50
Nodes (3): `backend/`, `frontend/`, Project Structure

### Community 314 - "email.js"
Cohesion: 0.53
Nodes (5): getTransporter(), isValidEmail(), normalizeRecipients(), sendEmail(), SMTP_PORT

### Community 315 - "Community 315"
Cohesion: 0.50
Nodes (3): files, fs, path

### Community 316 - "route.js"
Cohesion: 0.70
Nodes (4): GET(), getNewsletterRecipients(), getWebsiteContentData(), POST()

## Knowledge Gaps
- **991 isolated node(s):** `@kilocode/plugin`, `Layout`, `About`, `AdminLayout`, `AdminDashboard` (+986 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **64 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `p()` connect `.m` to `.aa`, `Community 7`, `Community 9`, `Community 14`, `Community 29`?**
  _High betweenness centrality (0.314) - this node is a cross-community bridge._
- **Why does `sendReceiptEmail()` connect `Community 9` to `getDb`, `.m`?**
  _High betweenness centrality (0.212) - this node is a cross-community bridge._
- **Why does `w()` connect `Community 18` to `Community 32`, `.aa`, `Community 7`, `Community 76`, `sendEmail`, `.m`, `Community 26`, `Community 29`?**
  _High betweenness centrality (0.159) - this node is a cross-community bridge._
- **What connects `@kilocode/plugin`, `Layout`, `About` to the rest of the system?**
  _992 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05433159073935773 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06882591093117409 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.03179824561403509 - nodes in this community are weakly interconnected._