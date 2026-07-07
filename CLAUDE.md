# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, port 5173)
npm run build     # Type-check + production build
npm run lint      # Run oxlint
npm run preview   # Preview production build
```

No test suite is configured.

## Environment

Copy `.env` and set `VITE_BACKEND_URL` to point to the backend:

```
VITE_BACKEND_URL=http://localhost:8080
```

## Architecture

This is a **School Management System** frontend — React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui.

### Provider stack (outermost → innermost in `main.tsx`)

```
Redux Provider → QueryClientProvider → LoadingProvider → BrowserRouter → App
```

Inside `App.tsx`, `AuthProvider` dispatches `restoreSession()` on mount to rehydrate auth state from `localStorage` into Redux.

### API layer (`src/api/`)

All HTTP calls go through `src/api/client.ts` — an Axios instance with:
- Base URL from `VITE_BACKEND_URL`; backend API prefix is `/api/v1/`
- Auto-attaches `Authorization: Bearer <token>` from `localStorage`
- **Global loading state** broadcast via `onLoadingChange()` — tracks active request count
- **Auto-success toasts** for POST/PUT/PATCH/DELETE when `response.data.message` exists (via `sonner`)
- **Auto-error toasts** for all failures; suppress with `{ headers: { 'X-Skip-Toast': 'true' } }` or `{ skipToast: true }`
- **Auto-logout** on 401 — clears localStorage and redirects to `/login`

Each domain has its own file (`student.ts`, `teacher.ts`, `attendance.ts`, etc.) that exports typed async functions wrapping `apiClient`.

### State management

Redux Toolkit slices in `src/store/slices/`:
- `authSlice` — user session (token, role, name, email); persisted to/from `localStorage`
- `studentSlice`, `teacherSlice` — domain data
- `uiSlice` — UI state

Use `useAppDispatch` / `useAppSelector` from `src/store/hooks.ts` (typed wrappers). Server state (fetching, caching) goes through **TanStack Query** (`useQuery` / `useMutation`).

### Auth flow

`useAuth()` from `src/hooks/AuthProvider.tsx` reads from Redux. `ProtectedRoute` wraps all non-login routes; it renders a loading splash while `auth.initializing` is true, then redirects to `/login` if no user, or checks `allowedRoles` if provided.

### Routing (`App.tsx`)

All pages are **lazy-loaded** via `React.lazy`. Route structure:
- `/login` — public
- All other routes — wrapped in `<ProtectedRoute>` and `<SchoolSidebar>` (sidebar layout)

Active page components live in subdirectories under `src/pages/` (e.g., `src/pages/Teacher/Teacherpage.tsx`). Some top-level legacy files (e.g., `src/pages/Teacherpage.tsx`) are unused.

### UI components

shadcn/ui components live in `src/components/ui/` and are managed with `npx shadcn add <component>`. The style is `radix-nova` with `neutral` base color and CSS variables. Icons come from `lucide-react`.

Path alias `@` maps to `/src`.
