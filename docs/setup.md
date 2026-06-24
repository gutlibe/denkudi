# Local Setup Guide

> Laravel Herd + TablePlus on Windows

## Prerequisites

| Tool | Purpose |
| ---- | ------- |
| [Laravel Herd](https://herd.laravel.com) | PHP, Composer, nginx, auto-SSL |
| [TablePlus](https://tableplus.com) | Database GUI |
| [Node.js 22+](https://nodejs.org) | JS runtime |
| [pnpm](https://pnpm.io) | Package manager (`npm i -g pnpm`) |

## Setup

### 1. Clone into Herd

Herd automatically detects projects inside its directory. Clone here:

```bash
cd ~/Herd   # or C:\Users\<you>\Herd on Windows
git clone https://github.com/gutlibe/denkudi.git
cd denkudi
```

Herd will serve the project at `http://denkudi.test` — the folder name becomes the domain.

> **Important:** Keep Laravel Herd running in the background. Without it, the local server won't respond.

### 2. Install

```bash
composer install
pnpm install
```

### 3. Environment

```bash
cp .env.example .env
php artisan key:generate
```

Update `.env`:

```env
APP_URL=http://denkudi.test
APP_ENV=local
APP_DEBUG=true

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=denkudi
DB_USERNAME=root
DB_PASSWORD=
```

> `APP_URL` must match your Herd domain (`http://denkudi.test`).

### 4. Create Database

Open TablePlus → New connection → MySQL:

| Field | Value |
| ----- | ----- |
| Host | `127.0.0.1` |
| Port | `3306` |
| User | `root` |
| Password | (empty in Herd) |
| Database | `denkudi` |

Create the database, then run:

```bash
php artisan migrate
php artisan storage:link
```

### 5. Start

```bash
pnpm dev
```

This starts Vite for hot module replacement. **No `php artisan serve` needed** — Herd runs PHP automatically.

Visit `http://denkudi.test` in your browser.

## Running Checks

```bash
pnpm types:check     # TypeScript
pnpm lint:check      # ESLint
pnpm format:check    # Prettier
```
