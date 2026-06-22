# Skills & Conventions

How things are done in this project.

## Commit Messages

```
type: short description
```

No scope. Keep it simple.

### Types

| Type     | When                          |
| -------- | ----------------------------- |
| feat     | New feature                   |
| fix      | Bug fix                       |
| refactor | Code restructure, no behavior |
| style    | Formatting, missing semis     |
| docs     | Documentation only            |
| chore    | Deps, config, build tasks     |
| test     | Adding/updating tests         |
| perf     | Performance improvement       |

**Examples:**
```
feat: add ballot submission
fix: prevent double vote submission
refactor: extract ballot logic to service
chore: update tailwind to v4.3
style: fix card spacing
```

> Keep it short. No period. Imperative mood (`add` not `added`).

## Verification Checks

Only run when explicitly asked. Project uses PHP (Laravel) + TypeScript (React/Inertia).

### PHP

| Command | What it does |
| ------- | ------------ |
| `composer lint:check` | Check PHP style (pint, no changes) |
| `composer lint` | Auto-fix PHP style (pint) |
| `composer types:check` | Static analysis (PHPStan) — needs `php -d memory_limit=512M vendor/bin/phpstan analyse --memory-limit=512M` if default memory crashes |
| `php artisan test` | Run test suite only |
| `composer test` | Full: config:clear + lint:check + types:check + artisan test |

### Frontend (pnpm)

| Command | What it does |
| ------- | ------------ |
| `pnpm lint:check` | Check ESLint (no changes) |
| `pnpm lint` | Auto-fix ESLint |
| `pnpm format:check` | Check Prettier formatting (no changes) |
| `pnpm format` | Auto-format with Prettier |
| `pnpm types:check` | TypeScript type check (tsc) |

### All-in-one

| Command | What it does |
| ------- | ------------ |
| `composer ci:check` | pnpm lint:check + format:check + types:check + composer test |

