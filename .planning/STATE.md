# Project State: SolutionHub

## Current Status [2026-04-07]
- **Backend**: Fully modularized. `server.js` reduced to orchestrator pattern.
- **Frontend**: AI chatbot widget injected globally in `App.jsx`.
- **AI**: Gemini 1.5 Flash integration live at `/api/ai/chat` and `/api/ai/recommend`.
- **Queue**: In-memory payment queue processing async email + course assignment.
- **Security**: Helmet + rate limiting added. ENV validation at startup.
- **Logging**: Winston logger across all modules (console + file).
- **RBAC**: Middleware created in permissive mode (log-only, not blocking).
- **PM2**: `ecosystem.config.js` created; scripts in `package.json`.
- **Webhook**: Razorpay webhook endpoint at `POST /api/webhook/razorpay`.

## Active Phase
- **Phase 2 (v2.0)**: Incremental upgrade — COMPLETE.

## Module Inventory
### Backend Services
- `services/emailService.js` — Resend + emailTemplate
- `services/firebaseService.js` — Firestore CRUD helpers
- `services/notificationService.js` — Session live/reminder notifications
- `services/queueService.js` — In-memory async payment queue
- `services/aiService.js` — Gemini AI (chat + recommendations)
- `services/storageService.js` — Firebase Storage uploads
- `services/roleService.js` — Custom claims RBAC helpers

### Backend Middlewares
- `middlewares/authMiddleware.js` — Firebase token verifier
- `middlewares/rbacMiddleware.js` — Role enforcement (permissive)

### Backend Controllers
- `controllers/tradingController.js`
- `controllers/adminController.js`
- `controllers/authController.js`
- `controllers/certificateController.js`
- `controllers/razorpayController.js`

### Backend Routes
- `routes/trading.js` → `/api/trading/*`
- `routes/admin.js` → `/api/admin/*`
- `routes/auth.js` → `/api/auth/*`
- `routes/certificates.js` → `/api/certificates/*`
- `routes/razorpay.js` → `/api/razorpay/*`
- `routes/webhook.js` → `/api/webhook/*`
- `routes/ai.js` → `/api/ai/*`

### Frontend
- `components/AIChatbot.jsx` — Floating Gemini chatbot widget

## Key Decisions
1. **Gemini API** over OpenAI — User preference.
2. **In-memory queue** — No Redis dependency; can swap to BullMQ later.
3. **Permissive RBAC** — Roles logged but not enforced; flip switch to enforce.
4. **Firebase Storage** — Service ready; enable by setting `FIREBASE_STORAGE_BUCKET` in `.env`.
5. **Backward compat** — All existing v1 routes preserved; nothing broken.

## Next Steps
- [ ] Add `GEMINI_API_KEY` to backend `.env`
- [ ] Add `RAZORPAY_WEBHOOK_SECRET` to backend `.env`
- [ ] Enable Firebase Storage in Firebase console + add bucket to `.env`
- [ ] To enforce RBAC: uncomment return statements in `rbacMiddleware.js`
- [ ] Install PM2 globally (`npm i -g pm2`) and run `npm run start:pm2`
