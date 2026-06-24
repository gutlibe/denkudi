# Denkudi — HTU E-Voting Platform

Secure, anonymous, blockchain-verified e-voting for student elections. Built with Laravel, React, and shadcn/ui.

## Architecture

Every vote is linked into a hash chain using HMAC-SHA256. Tampering with a single vote breaks the chain and triggers automatic quarantine. Voter identity is separated from ballot choices — no user ID is stored in the votes table.

📖 **[Full architecture docs](docs/architecture.md)** — diagrams, scenarios, anonymity model

## Getting Started

### Prerequisites

- [Laravel Herd](https://herd.laravel.com) — local PHP + nginx server
- [TablePlus](https://tableplus.com) — database GUI
- [Node.js 22+](https://nodejs.org) — JavaScript runtime
- [pnpm](https://pnpm.io) — package manager

### Setup

See **[docs/setup.md](docs/setup.md)** for step-by-step instructions including database setup, environment configuration, and running the app locally.

Quick overview:

```bash
git clone https://github.com/gutlibe/denkudi.git ~/Herd/denkudi
cd ~/Herd/denkudi
composer install && pnpm install
cp .env.example .env && php artisan key:generate
# Configure .env (see setup guide)
php artisan migrate && php artisan storage:link
pnpm dev
```

Visit `http://denkudi.test`. Herd must be running.

## Tech Stack

| Layer | Technology |
| ----- | ---------- |
| Backend | Laravel 13 + MariaDB |
| Frontend | React 19 + TypeScript + shadcn/ui |
| Auth | Laravel Fortify + Passkeys (WebAuthn) |
| Integrity | Hash chain (HMAC-SHA256) |

📖 **[Full tech stack](docs/stack.md)**

## Features

### Voter
- **Passwordless login** — Passkeys (fingerprint, face, security key)
- **Position-by-position voting** — Mobile-first, swipeable candidate slider
- **Receipt verification** — Prove your vote was counted without revealing choices
- **Live results** — Admin-gated release

### Admin
- **Election lifecycle** — Draft → Scheduled → Active → Closed
- **Chain audit** — Validate hash integrity per election
- **Audit logs** — Every admin action recorded
- **User management** — Role assignment

### Security
- **Anonymous voting** — No user_id in votes table
- **Tamper detection** — Hash chain auto-quarantines modified rows
- **Double-vote prevention** — Database-level unique constraint

## Project Structure

```
denkudi/
├── app/
│   ├── Http/Controllers/    # Web + Admin controllers
│   ├── Models/               # Eloquent models
│   └── Services/             # VotingService (chain logic)
├── resources/
│   ├── js/
│   │   ├── pages/            # Inertia page components
│   │   ├── components/       # Shared UI components
│   │   └── layouts/          # App + Admin layouts
│   └── views/                # Blade templates
├── routes/
│   ├── web.php               # Public routes
│   ├── admin.php             # Admin routes
│   └── settings.php          # Settings routes
└── docs/
    ├── architecture.md       # Voting architecture
    ├── stack.md              # Tech stack
    ├── setup.md              # Local setup
    └── skills.md             # Commit conventions + checks
```

## Documentation

| Doc | Covers |
| --- | ------ |
| [setup.md](docs/setup.md) | Local development setup |
| [architecture.md](docs/architecture.md) | Voting flow, hash chain, anonymity, scenarios |
| [stack.md](docs/stack.md) | Full technology stack with versions |
| [skills.md](docs/skills.md) | Commit conventions and code quality checks |

## Deployment

Zero-downtime deployment via GitHub Actions to Hestia CP. Uses atomic symlink swap — new release tested in isolation, then activated in <1ms. PHP-FPM restart clears Opcache.

📖 **Deploy guide** available on request (not in public repo).
