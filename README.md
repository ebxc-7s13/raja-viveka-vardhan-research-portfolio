# Raja Viveka Vardhan Siluveru — Research Portfolio

A production-ready research portfolio website for **Raja Viveka Vardhan Siluveru**, a Biomedical Engineering researcher at IIEST Shibpur. Built with Next.js 15, SQLite, and comprehensive security measures.

**Live site:** [raja-viveka-vardhan-portfolio-xp6d.onrender.com](https://raja-viveka-vardhan-portfolio-xp6d.onrender.com/)

## Features

- **Homepage** — Hero section, featured research highlights, research notes, and stats
- **Research Projects** — 6 detailed case studies with carousel navigation (AFI framework, FASCANet denoising, microgravity platform, OncoSpectrix microscope, coal volume estimation, ECG cannabis detection)
- **Theses** — Interactive node-based flowchart for M.Tech and B.Tech thesis presentations
- **Publications** — Peer-reviewed manuscripts (IEEE JBHI, Elsevier CBM) with abstracts and metadata
- **Patents** — Patent filings with detailed innovation descriptions
- **Timeline** — Chronological research journey from 2018–2026
- **About** — Academic background, 6 research themes, and technical expertise with skill bars
- **Research Notes** — Blog-style research notes with rich content
- **Contact Form** — Spam-protected with honeypot, time-based detection, and rate limiting
- **Admin Dashboard** — Secure admin panel with authentication, audit logging, and CMS for all content
- **Search** — Full-text search across projects, publications, and research notes
- **Day/Night Theme Toggle** — Blossom theme, cursor trail, animated dot grid
- **Responsive Design** — Mobile-optimized with touch interactions

## Security Features

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

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, better-sqlite3
- **Auth:** jose (JWT), bcryptjs
- **Validation:** Zod, sanitize-html
- **Styling:** Tailwind CSS with custom blossom theme, cursor trail, animated dot grid

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example and set your secrets:

```bash
cp .env.example .env.local
```

Edit `.env.local` and set:

```bash
# Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

JWT_SECRET=your-generated-secret-here
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=YourStr0ng!Password123
DATABASE_PATH=./data/portfolio.db
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

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/              # API routes (auth, contact, admin, seed)
│   │   ├── admin/            # Admin dashboard page
│   │   ├── research/         # Research projects with case studies
│   │   ├── thesis/           # Thesis flowchart views
│   │   ├── publications/     # Publications listing
│   │   ├── timeline/         # Research timeline
│   │   ├── about/            # About page with skills
│   │   ├── contact/          # Contact form
│   │   ├── search/           # Full-text search
│   │   ├── blog/             # Research notes
│   │   ├── patents/          # Patent listings
│   │   ├── privacy/          # Privacy policy
│   │   ├── terms/            # Terms of use
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Homepage
│   ├── components/           # Reusable UI components
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   ├── DayNightToggle.tsx
│   │   ├── BlossomTheme.tsx
│   │   ├── CursorTrail.tsx
│   │   ├── DotGrid.tsx
│   │   ├── ThesisFlow.tsx
│   │   ├── ProjectCarousel.tsx
│   │   ├── ResearchCarousel.tsx
│   │   ├── TimelineClient.tsx
│   │   ├── FigureViewer.tsx
│   │   ├── ImageCrossFade.tsx
│   │   ├── GlassTitle.tsx
│   │   ├── Marquee.tsx
│   │   ├── AdminCms.tsx
│   │   └── ThemeToggle.tsx
│   └── lib/
│       ├── auth.ts           # JWT + bcrypt authentication
│       ├── db.ts             # SQLite database setup + auto-seed
│       ├── validation.ts     # Zod schemas + sanitization
│       ├── rate-limit.ts     # Rate limiting
│       └── api-utils.ts      # Response helpers + CSRF
├── scripts/
│   └── seed.ts               # Database seeding with full research data
├── public/                   # Static assets (research images, videos)
├── data/                     # SQLite database (gitignored)
├── render.yaml               # Render deployment blueprint
└── next.config.js            # Security headers config
```

## Deployment

### Render (current)

The site is deployed on Render using the included `render.yaml` blueprint. On first deploy:

1. Render creates env vars (JWT_SECRET and ADMIN_PASSWORD are auto-generated)
2. Build command runs `npm install && npm run build && npx tsx scripts/seed.ts`
3. Seed script creates the admin user and populates all research data
4. Auto-seed in `db.ts` also runs if the database is empty at runtime

**Admin credentials** are set via the `ADMIN_EMAIL` and `ADMIN_PASSWORD` env vars in Render's dashboard.

### Vercel

```bash
npx vercel
```

### Self-hosted (PM2)

```bash
npm run build
pm2 start npm --name portfolio -- start
```

## Before Deploying

1. Generate a strong `JWT_SECRET` (64+ random characters)
2. Set a strong `ADMIN_PASSWORD` (12+ chars, mixed case, numbers, symbols)
3. Set `ADMIN_EMAIL` to the admin account email
4. Ensure HTTPS is enabled (required for secure cookies)
5. Review and customize the CSP headers in `next.config.js`

## Research Content

The portfolio showcases research in:

- **Non-Invasive Oral Cancer Detection** — FASCANet denoising, StyleGAN2 synthetic augmentation, AFiS-Net classification via autofluorescence imaging
- **Microgravity Simulation** — IoT-enabled multi-modal clinostat/RPM platform with patent filing
- **OncoSpectrix** — Portable LED autofluorescence microscope on Raspberry Pi 5 with on-edge AI
- **Industrial Sensor Fusion** — ROS 2 camera-LiDAR coal volume estimation
- **ECG Cannabis Detection** — ML-based morphological feature classification

## License

MIT
