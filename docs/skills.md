# Skills & Conventions

How things are done in this project.

## Commit Messages

```
type(scope): short description
```

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

### Scopes (short)

| Scope   | Covers                        |
| ------- | ----------------------------- |
| ui      | Pages, components, layouts    |
| auth    | Login, register, sessions     |
| db      | Migrations, models, seeding   |
| api     | Controllers, routes, requests |
| config  | Env, tailwind, vite, eslint   |
| deps    | Composer/npm packages         |
| vote    | Voting logic, ballot flow     |
| admin   | Admin panel area              |

**Examples:**
```
feat(vote): add ballot submission
fix(auth): prevent double vote submission
refactor(db): extract ballot logic to service
chore(deps): update tailwind to v4.3
style(ui): fix card spacing
```

> Keep it short. No period. Imperative mood (`add` not `added`). Scope is optional — drop it if the change spans the whole app.

