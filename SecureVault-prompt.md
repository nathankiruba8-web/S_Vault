:::writing{variant="standard" id="69482"}
You are a senior full-stack software engineer, cybersecurity architect, UI/UX designer, and DevOps engineer.

Your task is to build a complete production-ready SaaS application called:

# SecureVault

SecureVault is a secure personal password manager similar in concept to Bitwarden and 1Password.

This is NOT a demo project.
Do NOT create mock data.
Do NOT create static UI only.

Build a complete working full-stack application with:

- Real frontend
- Real backend
- Real MongoDB database
- Real authentication
- Real encryption
- Real Google Authenticator 2FA
- Real WhatsApp 2FA
- Real API communication
- Deployment configuration

================================================

TECHNOLOGY STACK

Frontend:

- React + Vite
- JavaScript
- Tailwind CSS
- React Router DOM
- Axios
- Framer Motion
- React Hot Toast
- Lucide React Icons

Backend:

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose ODM

Security:

- JWT Authentication
- Refresh Token Rotation
- bcrypt password hashing
- Google Authenticator TOTP 2FA
- WhatsApp OTP 2FA (via Twilio WhatsApp API or similar)
- AES-256 encryption
- Helmet security headers
- CORS configuration
- Express Rate Limiting
- Input validation
- Secure cookies
- Session management

Deployment:

Frontend:
- Vercel

Backend:
- Render

Database:
- MongoDB Atlas

================================================

PROJECT STRUCTURE

Create this exact structure:

SecureVault/

backend/

config/
- database.js
- encryption.js

models/
- User.js
- Password.js
- LoginHistory.js
- SecurityLog.js

controllers/
- authController.js
- passwordController.js
- securityController.js

routes/
- authRoutes.js
- passwordRoutes.js
- securityRoutes.js

middleware/
- authMiddleware.js
- errorMiddleware.js

services/
- emailService.js
- breachService.js
- whatsappService.js

utils/
- passwordGenerator.js
- backupCodes.js

server.js
.env.example
package.json

frontend/

src/

api/
- axios.js

components/
- Navbar.jsx
- Sidebar.jsx
- ProtectedRoute.jsx
- AddPassword.jsx
- PasswordCard.jsx
- PasswordGenerator.jsx
- PasswordStrength.jsx
- StatCard.jsx

pages/
- Landing.jsx
- Login.jsx
- Register.jsx
- Verify2FA.jsx
- Dashboard.jsx
- Vault.jsx
- Security.jsx
- Settings.jsx

layouts/
- DashboardLayout.jsx

context/
- AuthContext.jsx

hooks/
- useAuth.js

utils/
- securityScore.js

App.jsx
main.jsx
index.css

deployment/

- render.yaml
- vercel.json

================================================

CORE FEATURES

AUTHENTICATION:

Implement:

Register:

Fields:
- Name
- Email
- Password
- Phone number (for WhatsApp 2FA)

Security:

- bcrypt hash password
- JWT access token
- Refresh token
- Secure cookie storage

Login:

- Email
- Password

After password verification:

Require 2FA verification via Google Authenticator OR WhatsApp OTP.

2FA Features:

- Generate secret key (Google Authenticator)
- Generate QR code
- Verify OTP
- Enable 2FA (Google Authenticator and/or WhatsApp)
- Disable 2FA
- Generate backup recovery codes
- Send WhatsApp OTP for login verification
- Allow user to choose preferred 2FA method (Authenticator app or WhatsApp)

================================================

PASSWORD VAULT

Users can:

Create password entry:

Fields:

- Website name
- Website URL
- Username
- Password
- Notes
- Category
- Expiry date

Before storing:

Encrypt password using AES-256.

Features:

- Add password
- View password
- Edit password
- Delete password
- Search password
- Filter category
- Copy password
- Hide password by default
- Password strength meter
- Last accessed tracking

================================================

PASSWORD GENERATOR

Create advanced generator:

Options:

- Length
- Uppercase
- Lowercase
- Numbers
- Symbols

Show:

- Generated password
- Strength score
- Copy button

================================================

SECURITY CENTER

Create security dashboard:

Display:

Login History:

- Date
- Time
- Browser
- Device
- IP Address

Security Logs:

Track:

- Login
- Logout
- Password created
- Password viewed
- Password updated
- Export actions

================================================

BREACH DETECTION

Integrate:

HaveIBeenPwned API

When saving password:

Check if password exists in known breaches.

If compromised:

Show warning.

================================================

UI REQUIREMENTS

Create professional SaaS design inspired by:

- Bitwarden
- 1Password
- Dashlane

Design:

- Modern dark theme
- Responsive mobile layout
- Sidebar navigation
- Dashboard cards
- Smooth animations
- Glassmorphism style
- Professional typography

Pages:

Landing Page

Login

Register

2FA Verification

Dashboard

Password Vault

Security Center

Settings

================================================

DEVELOPMENT RULES

Follow these rules:

1. First create complete folder structure.

2. Then implement backend completely.

3. Test backend APIs.

4. Then implement frontend.

5. Connect frontend with backend.

6. Fix all errors automatically.

7. Never leave TODO comments instead of code.

8. Never create fake data.

9. Use clean production-quality code.

10. Add comments where security logic is complex.

================================================

API ENDPOINTS

Authentication:

POST /api/auth/register

POST /api/auth/login

POST /api/auth/logout

POST /api/auth/setup-2fa

POST /api/auth/verify-2fa

POST /api/auth/send-whatsapp-otp

POST /api/auth/verify-whatsapp-otp

Password:

POST /api/password

GET /api/password

GET /api/password/:id

PUT /api/password/:id

DELETE /api/password/:id

POST /api/password/generate

Security:

GET /api/security/logs

GET /api/security/history

GET /api/security/stats

================================================

ENVIRONMENT VARIABLES

Create .env.example:

PORT=

MONGO_URI=

JWT_SECRET=

REFRESH_SECRET=

AES_SECRET=

CLIENT_URL=

EMAIL_USER=

EMAIL_PASSWORD=

TWILIO_ACCOUNT_SID=

TWILIO_AUTH_TOKEN=

TWILIO_WHATSAPP_NUMBER=

================================================

DEPLOYMENT

Deploy the application using:

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

Include complete deployment configuration files (render.yaml, vercel.json) and environment variable setup for production.

================================================

FINAL REQUIREMENT

After completing:

Provide:

1. Installation steps

2. Run commands

3. Environment setup guide

4. MongoDB Atlas setup

5. Deployment guide (Render for backend, Vercel for frontend)

6. Testing checklist

Build the entire SecureVault application step by step.

I want to Add whatsapp for 2fa and i want to deploy it using render and vercel.
:::
