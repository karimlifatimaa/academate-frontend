# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Companion repository

Backend (Spring Boot): `/Users/fatimakarimli/academate-backend`

## Commands

```bash
# Dev server
npm run dev          # localhost:3000

# Type check
npx tsc --noEmit

# Production build (verifies all pages compile)
npx next build

# Lint
npm run lint
```

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · TanStack Query v5 · Zustand · React Hook Form + Zod · Axios · Sonner (toasts) · Lucide React · shadcn/ui (Radix)

**Backend base URL:** `NEXT_PUBLIC_API_URL` env var (default `http://localhost:8080` in `.env.local`).

### Routing

The app uses Next.js route groups to apply different layouts:

| Group | Layout | Who sees it |
|-------|--------|-------------|
| `(app)/` | Top nav + auth guard | STUDENT, TEACHER, PARENT, ADMIN (logged in) |
| `(admin)/` | Admin-specific nav | ADMIN only |
| `(discover)/` | Minimal nav | Public teacher search |
| Top-level | None / auth pages | `/login`, `/register/*`, `/forgot-password`, `/reset-password`, `/verify-email` |

Auth routing is enforced by `src/proxy.ts` (Next.js middleware) — reads `access-token` cookie. Unauthenticated requests to protected paths redirect to `/login`; authenticated users on auth pages redirect to `/dashboard`.

### Auth & token management

- `access-token` — stored as a cookie (`max-age=900`, `SameSite=Strict`). Read by the middleware and by `src/lib/api/axios.ts` request interceptor.
- `refresh-token` — stored in `localStorage`. Used by the axios response interceptor to silently refresh on `401` (queues concurrent failed requests, retries after rotation).
- `useAuthStore` (Zustand) — in-memory only; cleared on page reload. Never use it as the source of truth for role-gating — use `useProfile()` instead (fetches `/api/v1/users/me/profile`).
- `/dashboard` reads role from `useProfile()` and renders the correct dashboard component per role.

### Data fetching

All server state is managed via TanStack Query. Hooks live in `src/hooks/`:

| Hook file | What it covers |
|-----------|---------------|
| `useProfile.ts` | Current user's full profile |
| `useTeachers.ts` | Teacher search, public profile, availability, booked-times, reviews |
| `useLessons.ts` | Student/teacher lessons, confirm/complete/cancel mutations |
| `useBooking.ts` | `useBookLesson` mutation, `useCreateReview` mutation |
| `useAvailability.ts` | Teacher availability CRUD |
| `useFamily.ts` | Invite-code generation, parent-child linking, `useMyParents` |
| `useAdmin.ts` | Admin users, teachers, stats, verify/deactivate mutations |
| `useChildren.ts` | Parent's linked children |

### Slot picker / booking

`src/lib/slots.ts` contains the client-side time slot generation logic:

- `buildDayStrip(n)` — returns `n` days from today as `DayOption[]`.
- `generateSlotsForDate(date, availability, myLessons, bookedTimes, duration)` — generates 60-min slots from the teacher's weekly `TeacherAvailability` template, marks slots as `PAST`, `MY_BOOKING`, or `BOOKED`.

**Critical:** slot `iso` strings must be local-naive (`YYYY-MM-DDTHH:mm:00`, no `Z` suffix) because the backend stores `LocalDateTime` without timezone. Using `.toISOString()` would convert to UTC and break the availability window check.

### Dashboard (role-aware)

`/dashboard` renders a different component per role from `src/components/dashboards/`:

- `TeacherDashboard` — onboarding checklist (profile + availability + admin verification), today's lessons, stats, earnings estimate.
- `StudentDashboard` — upcoming lessons, recommended teachers.
- `ParentDashboard` — linked children list.
- `AdminDashboard` — pending teacher verifications with inline verify button, user counts from `/admin/stats`.

Shared primitives (StatCard, ActionCard, ChecklistItem, SectionCard, EmptyState) live in `src/components/dashboards/shared.tsx`.

### Shared UI utilities

- **`src/lib/utils.ts`** — exports `cn()` (clsx + tailwind-merge) and `getInitials(name)`. Use `getInitials` everywhere instead of inline name-splitting logic.
- **`src/components/ui/user-avatar.tsx`** — `<UserAvatar name url size />` component. Renders avatar image if `url` is set, otherwise shows initials with the green gradient. Sizes: `sm` (h-8), `md` (h-10, default), `lg` (h-20). Use this everywhere instead of inline avatar logic.

### Constants

`src/lib/constants.ts` exports `SUBJECTS` (array with emoji), `SUBJECT_LABEL` (enum key → Azerbaijani label), `DAY_AZ`, `DAY_ORDER`, `DAYS_OF_WEEK`, `ROLE_LABEL`, `RELATION_LABEL`. **Always import from here** — never define inline maps.

### UX patterns

- **Lesson cancel:** Dialog-based (not `window.prompt`). State: `cancelTarget + cancelReason` in `lessons/page.tsx`.
- **Destructive confirmations** (delete account, logout-all): two-step inline pattern — first click shows "Ləğv et / Əminəm" buttons, second click executes. Never use `window.confirm` or `window.prompt`.
- **Toasts:** Sonner (`toast.success` / `toast.error`) for all feedback.
- **Forms:** React Hook Form + Zod everywhere for validated forms. Plain `useState` only for trivial single-field cases.

### Styling conventions

- Design tokens: green `#4A6741` (primary), cream `#F8F5F0` (background), `#EDE9E3` (border), `#7A7570` (muted text).
- Gradient: `linear-gradient(135deg, #4A6741, #6B8F6E)` for primary buttons and avatar backgrounds.
- Rounded corners: `rounded-3xl` for cards, `rounded-2xl` for inner elements, `rounded-xl` for buttons/inputs.
- Cards: `bg-white border border-[#EDE9E3] shadow-[0_1px_6px_rgba(0,0,0,0.04)]` — use this consistently, not `ring-1 ring-black/5`.
- Icons: Lucide React only.
- Fonts: `var(--font-display)` (Playfair Display) for headings/names, default sans for body.

### Middleware (proxy.ts)

Named `proxy.ts` (not `middleware.ts`) — Next.js picks it up via the `config.matcher` export. Handles auth redirects using the `access-token` cookie only (no API call).
