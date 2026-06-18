# Architecture — HTU E-Voting

## Roles

| Role    | Permissions                          |
| ------- | ------------------------------------ |
| Admin   | Create/manage elections, candidates  |
| Student | Vote in active elections             |

## Core Models

| Model      | Key Fields                                          |
| ---------- | ---------------------------------------------------- |
| User       | first_name, last_name, student_id, email, password, role |
| Election   | title, description, starts_at, ends_at, is_active    |
| Position   | election_id, title (e.g. "President", "VP")          |
| Candidate  | election_id, position_id, name, bio, photo           |
| Vote       | election_id, position_id, candidate_id, user_id      |

## Voter Flow (Start → End)

```
1. Landing Page (/)
   - Hero section explaining the e-voting platform
   - CTA: Login or Register
   - Shows current/upcoming election dates (if any)

2. Register (/register)
   - Form: first_name, last_name, student_id, password
   - Email auto-generated: {student_id}@htu.edu.gh
   - Validates: student_id is 10 digits, unique in DB
   - Role defaults to "student"
   → Redirects to Dashboard

3. Login (/login)
   - Email (auto-generated: student_id@htu.edu.gh) + password
   - Sessions persisted via Laravel cookies
   → Redirects to Dashboard

4. Dashboard (/dashboard)
   - Lists all active elections (starts_at <= now <= ends_at)
   - Shows: election title, description, voting period
   - Status badge: "Open" or "Closed"
   - Click to enter an election
   - If already voted: shows "View Results" instead

5. Voting Form (/elections/{id})
   - Displays positions one at a time (or all on single page)
   - Per position: list of candidates with name, photo, bio
   - Select one candidate per position (radio button)
   - Progress indicator (step 1 of N positions)
   - "Next" to proceed, "Back" to revisit

6. Review (/elections/{id} — same page, review step)
   - Summary of all selections before final submit
   - Shows position → selected candidate
   - Warning: "You cannot change your vote after submission"
   - "Submit Ballot" button

7. Submission
   - Inserts all votes in a transaction
   - Shows confirmation: "Your vote has been recorded"
   - "View Results" button appears

8. Results (/elections/{id}/results)
   - Only visible if user has voted OR election is closed
   - Per position: bar/pie chart of vote counts
   - Shows winner per position
   - Vote is anonymous — user sees totals only

9. Post-Vote Dashboard
   - Election appears in "Past Elections" section
   - No re-entry to voting form
   - Can always revisit results
```

## Admin Flow (Summary)

```
Login → Dashboard (election stats) → Create Election →
Add Positions → Add Candidates → Activate Election →
Monitor turnout → Close Election → View Results
```

## Routing (Inertia pages)

```
/                          Landing page
/login                     Auth (Fortify)
/register                  Auth (Fortify)
/dashboard                 Student: active elections
/elections/{id}            Voting form
/elections/{id}/results    Results (after voting or if closed)
/admin/dashboard           Admin overview
/admin/elections           CRUD elections
/admin/elections/{id}      Manage positions & candidates
/admin/elections/{id}/results  Live results
```

## Project Structure

### Backend (Laravel)

```
app/
├── Models/           Election, Candidate, Position, Vote, User
├── Http/
│   └── Controllers/  ElectionController, VoteController, AdminController
├── Enums/            Role.php
└── Policies/         ElectionPolicy, VotePolicy
```

### Frontend (resources/js)

```
├── Pages/
│   ├── Auth/
│   │   ├── login/
│   │   │   └── index.tsx
│   │   └── register/
│   │       └── index.tsx
│   │
│   ├── App/                           ← Student / voter
│   │   ├── dashboard/
│   │   │   └── index.tsx
│   │   └── Elections/
│   │       ├── elections-list/
│   │       │   └── index.tsx
│   │       ├── voting-form/
│   │       │   └── index.tsx
│   │       └── results/
│   │           └── index.tsx
│   │
│   └── Admin/                         ← Admin management
│       ├── dashboard/
│       │   └── index.tsx
│       └── Elections/
│           ├── elections-list/
│           │   └── index.tsx
│           ├── create-election/
│           │   └── index.tsx
│           ├── edit-election/
│           │   └── index.tsx
│           ├── manage-election/
│           │   └── index.tsx
│           └── results/
│               └── index.tsx
│
├── Layouts/
│   ├── app-layout.tsx
│   ├── admin-layout.tsx
│   └── guest-layout.tsx
│
├── Components/
│   ├── Ui/               ← shadcn/ui primitives
│   └── Shared/
│       ├── election-card.tsx
│       ├── candidate-card.tsx
│       └── vote-chart.tsx
│
├── Hooks/
│   ├── use-election.ts
│   └── use-vote.ts
│
├── Types/
│   └── index.ts
│
└── Lib/
    └── utils.ts
```

### Naming conventions

- **File system:** kebab-case folders and files (`elections-list/`, `app-layout.tsx`)
- **Inertia routes:** PascalCase reference (`Inertia::render('App/Elections/VotingForm')`)
- **Page entry point:** always `index.tsx` inside its page folder

## Constraints

- One vote per student per election (unique constraint on user_id + election_id)
- Votes are anonymous — vote table stores user_id but frontend never exposes it
- Election is read-only once user has voted
- Results visible only when election is closed OR user has voted
