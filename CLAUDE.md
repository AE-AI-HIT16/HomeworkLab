# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (Turbopack, http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint check
```

No test framework is configured.

## Architecture Overview

**HomeworkLab** is a Next.js 16 App Router homework platform for AI education classes. The stack is intentionally lean: **Google Sheets is the database**, **Google Drive is the file store**, and **Auth.js v5 with GitHub OAuth** handles authentication.

### Data layer — Google Sheets

All reads go through `unstable_cache` (1h TTL, tag-based) in `src/lib/google-sheets.ts`. All writes call `revalidateTag()` immediately after to bust the cache.

Sheet tabs and their column layout:

| Tab | Range | Columns |
|-----|-------|---------|
| `Students` | A2:E | githubUsername, name, email, active, role |
| `CourseMembers` | A2:D | githubUsername, courseId, role ("teacher"), active |
| `Assignments` | A2:N | id, week, lesson, title, description, dueAt, published, driveFolderId, promptFilesJSON, createdAt, updatedAt, assignmentType, quizData, courseId |
| `Materials` | A2:I | id, courseId, week, title, url, type, published, contentMode, postContent |
| `Submissions` | A2:N | id, assignmentId, courseId, githubUsername, studentName, submittedAt, type, isLate, fileJSON, repoUrl, grade, feedback, quizAnswers, quizScore |

`CourseMembers` is optional — the code gracefully handles a missing tab (returns empty array).

### Role system

Roles are resolved at runtime in `src/lib/roles.ts` by querying Google Sheets, not from the JWT:

- **admin** — GitHub username in `ADMIN_GITHUB_USERNAMES` env var (comma-separated)
- **teacher** — Active row in `CourseMembers` sheet
- **student / guest** — Active row in `Students` sheet (column E sets sub-role)
- **unauthorized** — Everyone else; `getCurrentUserRole()` auto-redirects to `/unauthorized`

`getCurrentUserRole()` is memoized per-request via `React.cache`. Use it in Server Components and Server Actions; never call `getUserRole` directly in pages.

### Authentication flow

- `src/auth.ts` — NextAuth config; enriches JWT with `id` and `githubUsername` from GitHub profile
- `src/proxy.ts` — Edge middleware (exported as `proxy`, not `middleware`). Does **authentication only** (redirect unauthenticated → `/login`). Role-based authorization happens in Server Components via `getCurrentUserRole()`, not here, because `googleapis` requires the Node.js runtime unavailable in Edge.

### Server Actions

`src/server/actions.ts` — `createAssignment`, `submitAssignment` (handles Drive upload)  
`src/server/quiz-actions.ts` — Quiz submission and auto-grading

All actions call `getCurrentUserRole()` at the top before any mutation.

### Courses

Courses are **statically defined** in `src/lib/courses.ts` (ai-core, data-engineer, aiml-engineer). Adding a new course requires editing that file. `getActiveCourseIds()` is used for validation throughout.

### Google Drive integration

`src/lib/google-drive.ts` streams files directly from the client to Drive without buffering on the server. `src/app/api/drive/file/route.ts` proxies Drive file downloads for the browser (avoids CORS, keeps credentials server-side).

Drive auth supports two modes (controlled by env vars):
- Service Account (`GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY`) — default
- OAuth2 (`GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` + `GOOGLE_REFRESH_TOKEN`) — see `OAUTH2_INSTRUCTIONS.md`

### Environment variables

`src/lib/env.ts` validates env vars server-side at import time. It is **server-only** — importing it in client code throws. In development, missing vars produce a warning but do not crash. In production (`NODE_ENV=production` or `STRICT_ENV=true`), missing required vars throw immediately.

Required vars: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`  
Optional but needed for full functionality: `ADMIN_GITHUB_USERNAMES`, `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_DRIVE_ROOT_FOLDER_ID`

### Key route layout

| Path | Role access |
|------|-------------|
| `/` | Public |
| `/login` | Public |
| `/dashboard` | student, admin |
| `/assignment/[id]` | student, admin |
| `/admin/*` | admin, teacher (course-scoped) |
| `/courses/[slug]` | student, admin, teacher |
| `/materials/[id]` | student, admin, teacher |
