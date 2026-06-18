# Tech Stack — HTU E-Voting

> Updated: 2026-06-18 — all versions latest as of this date.

## Core

| Layer    | Technology               | Version    |
| -------- | ------------------------ | ---------- |
| Backend  | Laravel                  | 13.16.1    |
| Frontend | React                    | 19.2.7     |
| Language | TypeScript (TSX)         | 6.0.3      |
| Bridge   | Inertia.js               | 3.4.0      |
| DB       | MariaDB                  | —          |
| UI Kit   | shadcn/ui (new-york)     | latest     |
| CSS      | Tailwind CSS             | 4.3.1      |
| Icons    | lucide-react             | 1.21.0     |
| Auth     | Laravel Fortify          | 1.37.2     |
| Bundler  | Vite                     | 8.0.16     |

## Tooling

| Area    | Tool                      | Version    |
| ------- | ------------------------- | ---------- |
| Forms   | React Hook Form           | (TBD)      |
| Forms   | Zod                       | (TBD)      |
| Charts  | Recharts                  | (TBD)      |
| Testing | Pest                      | 12.x       |
| Testing | Vitest                    | —          |
| Linting | ESLint + Laravel Pint     | 9.39 + 1.29 |
| Pkg Mgr | pnpm                      | 10.33      |

## Infra

| Area       | Option               |
| ---------- | -------------------- |
| Queue      | Database (simple)    |
| Storage    | Local / Public       |
| Deployment | VPS / Laravel Forge  |
| CI/CD      | GitHub Actions       |
