const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { getDb } = require("../utils/mongo");
const { sendEmail, emailTemplate } = require("./emailService");
const { logger } = require("../logger");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ["openid", "email", "profile"],
      prompt: "select_account",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || "";
        if (!email) {
          return done(null, false, { message: "Google account has no email." });
        }

        const db = getDb();
        const normalizedEmail = email.trim().toLowerCase();
        const googleId = profile.id;
        const name = profile.displayName || email.split("@")[0];
        const picture = profile.photos?.[0]?.value || "";

        let user = await db.collection("users").findOne({ email: normalizedEmail });

        if (!user) {
          const uid = `google_${googleId}`;
          const newUser = {
            uid,
            email: normalizedEmail,
            displayName: name,
            photoURL: picture,
            role: "student",
            status: "active",
            authProvider: "google",
            googleId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await db.collection("users").insertOne(newUser);
          user = newUser;
          logger.info(`[Passport Google] New user created: ${normalizedEmail}`);

          if (ADMIN_EMAIL) {
            sendEmail({
              to: ADMIN_EMAIL,
              subject: `New student signed up via Google: ${normalizedEmail}`,
              html: emailTemplate(
                "New Google Sign-up",
                `
                <p>A new student account was created via Google OAuth:</p>
                <div style="margin: 24px 0; padding: 20px; border: 1px solid #e2e8f0; border-radius: 14px; background: #f8fafc;">
                  <p style="margin: 0 0 8px;"><strong>Name:</strong> ${name}</p>
                  <p style="margin: 0 0 8px;"><strong>Email:</strong> ${normalizedEmail}</p>
                  <p style="margin: 0;"><strong>Role:</strong> student</p>
                </div>
                `,
                "View Students",
                process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/admin/students` : "https://www.amitsolutionhub.com/admin/students"
              ),
            }).catch(err => logger.warn("[Passport Google] Admin notification failed:", err.message));
          }
        } else {
          await db.collection("users").updateOne(
            { email: normalizedEmail },
            {
              $set: {
                googleId,
                photoURL: user.photoURL || picture || "",
                authProvider: user.authProvider || "google",
                updatedAt: new Date(),
              },
            }
          );
          logger.info(`[Passport Google] Existing user logged in: ${normalizedEmail}`);
        }

        return done(null, user);
      } catch (err) {
        logger.error("[Passport Google] Verify error:", err);
        return done(err, null);
      }
    }
  )
);

module.exports = passport;
