# iimo

A comprehensive **photo shoot management platform** for photographers — manage shoots, clients, image assets, watermarking, usage rights, and client sharing from a single dashboard.

---

## Features

- **Shoot management** — Create and manage photo shoots with status lifecycle: `active → expiring → expired → archived`
- **Client management** — Organise clients, attach shoots, and keep notes per client
- **Asset uploads** — Upload photos with automatic client-side watermark compositing before storage
- **Usage rights** — Define usage terms per shoot (types, date ranges, restrictions, contract PDF upload)
- **Client sharing** — Generate secure, revocable token-based preview links for clients
- **Notifications** — In-app notification feed for expiring/expired usage rights
- **Public preview** — A public read-only shoot preview page (no login required)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript 5 |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Backend / Auth / DB | [Supabase](https://supabase.com) |
| PDF Generation | [@react-pdf/renderer](https://react-pdf.org) |
| Font | Geist / Geist Mono |

---

## Project Structure

```
app/
├── authenth/           # Auth pages (login, signup, OTP, forgot/reset password)
├── studio/             # Protected dashboard routes
│   ├── shoots/         # Shoots list + shoot detail
│   ├── clients/        # Clients list, detail, and edit pages
│   ├── add-shoot/      # Create a new shoot
│   ├── edit-shoot/     # Edit an existing shoot
│   ├── upload-assets/  # Upload photos to a shoot
│   ├── add-rights/     # Add usage rights to a shoot
│   ├── edit-rights/    # Edit existing usage rights
│   └── events/         # Notifications / activity feed
├── preview/[id]/       # Public, unauthenticated shoot preview
├── components/
│   ├── atoms/          # Reusable UI primitives (buttons, inputs, modals, PDF components, etc.)
│   └── sections/       # Composed page sections (header, navigation, notifications panel, etc.)
├── contexts/           # AuthContext — client-side session state
└── utils/              # Data access layer (Supabase queries, storage helpers, image compositor)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone and install

```bash
git clone <your-repo-url>
cd iimo
npm install
```

### 2. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `NEXT_PUBLIC_SUPABASE_HOSTNAME` | Supabase hostname (for Next.js image optimization) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL used for share links and SEO metadata |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, keep secret) |

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Database

The app uses the following Supabase tables:

| Table | Description |
|---|---|
| `clients` | Photographer's client records |
| `shoots` | Photo shoots, linked to a client |
| `assets` | Images per shoot (original, thumbnail, watermarked) |
| `usage_rights` | Usage terms and contract documents per shoot |
| `share_links` | Secure preview tokens per shoot |
| `notes` | Per-client text notes |
| `notifications` | In-app notifications for usage right expiry events |

**Storage buckets:** `assets` (images, thumbnails, watermarked versions) and `contracts` (usage rights PDFs).

**RPC function:** `get_shoot_id_by_share_token(token)` — resolves a public share token to its shoot, enforcing expiry and revocation.

---

## Authentication

- **Sign-up:** Email + password registration with OTP email verification
- **Login:** Email + password with redirect support via `?redirectedFrom=`
- **Session:** Cookie-based sessions managed by `@supabase/ssr` — Edge middleware protects all `/studio/*` routes
- **Password reset:** Standard email-based forgot password flow
- **Public access:** `/preview/[id]` is intentionally unauthenticated and uses a share token to resolve the shoot

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run analyze` | Build with bundle analyzer enabled |

---

## Deployment

The app is designed to deploy on [Vercel](https://vercel.com). Set all environment variables in your Vercel project settings under **Settings → Environment Variables** before deploying.

```bash
# Test a production build locally first
npm run build
npm run start
```

> **Important:** Set `NEXT_PUBLIC_SITE_URL` to your production domain in Vercel environment variables — this is used for share link generation and SEO metadata.
