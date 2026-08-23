# 🔒 Secure Portfolio & Blog

A production-ready, security-hardened portfolio and blog website built with Next.js, SQLite, and comprehensive security measures.

## 🚀 Features

- **Portfolio Showcase** — Projects page with featured items, tech stacks, and live demo links
- **Blog System** — Full CRUD with rich text content, slugs, and SEO metadata
- **Contact Form** — Spam-protected with honeypot, time-based detection, and rate limiting
- **Admin Dashboard** — Secure admin panel with authentication and audit logging
- **Responsive Design** — Beautiful on all devices with Tailwind CSS

## 🛡️ Security Features

| Feature | Implementation |
|---------|---------------|
| **Authentication** | bcrypt (12 rounds) + JWT with httpOnly, secure, SameSite=strict cookies |
| **CSRF Protection** | SameSite=strict cookies prevent cross-site request forgery |
| **Rate Limiting** | In-memory sliding window — 5 login attempts/15min, 5 contact msgs/hour |
| **Input Validation** | Zod schemas validate all user input server-side |
| **XSS Prevention** | sanitize-html strips malicious content from all outputs |
| **SQL Injection** | All queries use parameterized statements (better-sqlite3) |
| **Security Headers** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| **Session Management** | JWT tokens stored in sessions table, revocable on logout |
| **Audit Logging** | All admin actions logged with IP, user agent, and timestamps |
| **Spam Protection** | Honeypot fields, time-based detection, and content pattern filtering |
| **Error Handling** | Production-safe error messages (no internal details leaked) |
| **PoweredBy Header** | Removed to hide framework information |

## 📦 Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, better-sqlite3
- **Auth:** jose (JWT), bcryptjs
- **Validation:** Zod, sanitize-html
- **Styling:** Tailwind CSS with custom theme

## 🏃 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Edit `.env.local` and **change these before deploying**:

```bash
# Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Set it in .env.local
JWT_SECRET=your-generated-secret-here

# Change admin credentials
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=YourStr0ng!Password
```

### 3. Seed the database

```bash
npm run db:seed
```

### 4. Start development server

```bash
npm run dev
```

Visit:
- **Site:** http://localhost:3000
- **Admin:** http://localhost:3000/admin

## 🔐 Before Deploying

1. ✅ Generate a strong `JWT_SECRET` (64+ random characters)
2. ✅ Change `ADMIN_PASSWORD` to a strong password (12+ chars, mixed case, numbers, symbols)
3. ✅ Set `NEXT_PUBLIC_SITE_URL` to your production domain
4. ✅ Ensure HTTPS is enabled (required for secure cookies)
5. ✅ Review and customize the CSP headers in `next.config.js`
6. ✅ Update social links in `Footer.tsx`
7. ✅ Replace placeholder content with your own

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Login, logout, session
│   │   │   ├── contact/       # Contact form handler
│   │   │   └── admin/         # Admin CRUD APIs
│   │   ├── admin/             # Admin dashboard page
│   │   ├── blog/              # Blog pages
│   │   ├── projects/          # Projects page
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable UI components
│   └── lib/
│       ├── auth.ts            # JWT + bcrypt auth
│       ├── db.ts              # SQLite database setup
│       ├── validation.ts      # Zod schemas + sanitization
│       ├── rate-limit.ts      # Rate limiting
│       └── api-utils.ts       # Response helpers + CSRF
├── scripts/
│   └── seed.ts                # Database seeding
├── data/                      # SQLite database (gitignored)
└── next.config.js             # Security headers config
```

## 🚢 Deploy

### Vercel (Recommended)

```bash
npx vercel
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.js ./

EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

### Self-hosted (PM2)

```bash
npm run build
pm2 start npm --name portfolio -- start
```

## License

MIT
