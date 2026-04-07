# Requirements: SolutionHub

## Functional Requirements (FR)

### E-Commerce (Projects)
- **FR_1.1**: User can browse software projects and their details.
- **FR_1.2**: User can purchase projects using Razorpay.
- **FR_1.3**: Automatic email delivery of project files/links via Resend within 24h.

### Trading Mentorship
- **FR_2.1**: User can enroll in trading mentorship plans.
- **FR_2.2**: Admin can toggle "LIVE NOW" status for sessions.
- **FR_2.3**: Automated notifications for session reminders (via `node-cron`).

### Admin Management
- **FR_3.1**: Admin can manage customers, employees, and sell requests.
- **FR_3.2**: Admin can broadcast emails to all enrolled students or manual lists.
- **FR_3.3**: Account approval system for new staff/employees.

## Non-Functional Requirements (NFR)

### Security
- **NFR_1.1**: Secure access control via Firebase Authentication.
- **NFR_1.2**: Environment variables for sensitive keys.

### Reliability
- **NFR_2.1**: Persistent local storage for payment screenshots.
- **NFR_2.2**: Error handling for failed email deliveries.

### UX/UI
- **NFR_3.1**: Ultra-modern Glassmorphism design.
- **NFR_3.2**: Fully responsive layouts for desktop and mobile.
