# Tech Stack — Denkudi (HTU E-Voting)

> Updated: 2026-07-02

## Core

| Layer       | Technology              | Version |
| ----------- | ----------------------- | ------- |
| Backend     | Laravel                 | 13.16.1 |
| Frontend    | React (TSX)             | 19.2.7  |
| Language    | TypeScript              | 6.0.3   |
| Bridge      | Inertia.js              | 3.4.0   |
| Types       | Inertia.js Core         | 3.4.0   |
| Database    | MariaDB                 | 11.4    |
| UI Kit      | shadcn/ui (radix-maia)  | 4.11    |
| CSS         | Tailwind CSS            | 4.3.1   |
| Icons       | Hugeicons Core Free     | 4.2.1   |
| Icons       | Lucide React            | 1.21.0  |
| Auth        | Laravel Fortify         | 1.37.2  |
| Passkeys    | Laravel Passkeys (WebAuthn) | 0.2.1 |
| Bundler     | Vite                    | 8.0.16  |

## Frontend Libraries

| Library            | Purpose              |
| ------------------ | -------------------- |
| shadcn/ui (Radix)  | UI primitives        |
| Sonner             | Toast notifications  |
| class-variance-authority | Component variants |
| clsx + tailwind-merge | Class utilities   |
| next-themes        | Dark/light mode      |
| date-fns           | Date formatting      |
| tw-animate-css     | CSS animations       |
| input-otp          | OTP input fields     |
| react-day-picker   | Date picker          |

## Backend Libraries

| Library               | Purpose                |
| --------------------- | ---------------------- |
| Laravel Fortify       | Auth (login, 2FA, passkeys) |
| Laravel Passkeys      | WebAuthn / FIDO2       |
| Inertia.js (Laravel)  | SPA bridge             |
| VotingService         | Hash chain + ballot logic |
| AdminAuditLog         | Action logging         |

## Dev Tooling

| Area      | Tool                     | Version |
| --------- | ------------------------ | ------- |
| Format    | Laravel Pint (PHP)       | 1.29    |
| Format    | Prettier (JS/TS)         | 3.8     |
| Lint      | ESLint (JS/TS)           | 9.39    |
| Lint      | typescript-eslint        | 8.61    |
| Types     | Larastan (PHPStan)       | 3.10.0  |
| Types     | tsc (TypeScript)         | 6.0.3   |
| Pkg Mgr   | Composer (PHP)           | latest  |
| Pkg Mgr   | pnpm (JS)                | 11.9    |
| Build     | Vite                     | 8.0.16  |
| Routing   | Laravel Wayfinder (PHP)  | 0.1.20  |
| Routing   | @laravel/vite-plugin-wayfinder (JS) | 0.1.7 |

## Infrastructure

| Area       | Solution                        |
| ---------- | ------------------------------- |
| Server     | Hestia CP (Ubuntu 24.04 LTS)    |
| PHP        | 8.4 (FPM)                       |
| Queue      | Database driver                 |
| Storage    | Local disk (shared symlink)     |
| CI/CD      | GitHub Actions                  |
| Deploy     | Zero-downtime (releases/ symlink swap) |
