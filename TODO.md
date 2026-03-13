# Contact Form Enhancement: Add Mobile & GitHub Fields

## Steps:

- [ ] 1. Edit `frontend/src/pages/Contact.jsx`: 
  - Add `mobile: "", github: ""` to formData initial state.
  - Add mobile input (type="tel", placeholder="Mobile Number", required) after email.
  - Add github input (type="url", placeholder="https://github.com/username", required) after mobile.

- [ ] 2. Edit `backend/server.js`:
  - Destructure `mobile, github` in POST /contact.
  - Update admin text email to include Mobile and GitHub lines.
  - Update auto-reply HTML to display mobile (click-to-call) and github (link button) nicely.

- [ ] 3. Test:
  - Backend: `cd backend &amp;&amp; npm start`
  - Frontend: `cd frontend &amp;&amp; npm run dev`
  - Submit form with all fields, check emails.

- [ ] 4. Deploy to Render/Vercel if needed.

- [ ] 5. Mark all complete and cleanup TODO.md.

**Current progress: Starting implementation...**
