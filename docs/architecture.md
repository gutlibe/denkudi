# Voting Architecture

## 1. Voter Flow

```mermaid
sequenceDiagram
    actor V as Voter
    participant UI as Ballot UI
    participant API as Server
    participant DB as Database
    participant Chain as Hash Chain

    Note over V,Chain: Step 1: Load ballot
    V->>UI: Click "Cast Your Vote"
    UI->>API: GET ballot data
    API->>DB: Load positions and candidates
    DB-->>API: Ballot data
    API-->>UI: Show positions

    Note over V,Chain: Step 2: Select candidates
    loop Per position
        V->>UI: Choose candidate(s)
    end

    Note over V,Chain: Step 3: Submit ballot
    V->>API: POST all selections
    API->>Chain: Scan for tampered votes
    API->>DB: Lock election row
    API->>DB: Insert vote rows with hash links
    API->>DB: Insert participation record (no user ID in votes)
    API-->>UI: Receipt token HTU-XXXX-XXXX-XXXX

    Note over V,Chain: Step 4: Verify (optional)
    V->>API: Verify receipt token
    API-->>V: Vote exists and is valid
```

## 2. Anonymity Model

```mermaid
flowchart LR
    subgraph votes[evote_votes table]
        direction TB
        A[receipt_token<br/>position_id<br/>candidate_id<br/>hash chain data]
    end

    subgraph participation[evote_voter_participation]
        direction TB
        B[hashed_student_id<br/>election_id]
    end

    votes --- participation
    note1[No foreign key between tables<br/>No user_id in votes table]
```

**Key:** The `hashed_student_id` prevents double-voting. The receipt token proves you voted — but only you hold it. No ID links your vote rows to your identity.

## 3. Hash Chain

```mermaid
flowchart TD
    G["Genesis Block<br/>prev: 0"]
    G -->|chain link| V1
    V1["Vote 1: President<br/>prev: Genesis hash<br/>curr: HMAC of row data"]
    V1 -->|chain link| V2
    V2["Vote 2: Vice President<br/>prev: Vote 1 hash<br/>curr: HMAC of row data"]
    V2 -->|chain link| V3
    V3["Vote 3: Secretary<br/>prev: Vote 2 hash<br/>curr: HMAC of row data"]

    note[["Tamper detection: modify any row = next rows prev hash no longer matches = auto quarantined"]]
```

Each vote row is hashed to the previous one via `HMAC-SHA256` with the app key. Break the chain, break the election.

## 4. Verify Vote

```mermaid
flowchart LR
    A[Voter pastes receipt] --> B{Token exists?}
    B -->|Yes| C{Status valid?}
    B -->|No| D[Not Found]
    C -->|Yes| E{Chain integrity?}
    C -->|No| F[Quarantined / Tampered]
    E -->|Pass| G[Verified: election name only<br/>No ballot choices revealed]
    E -->|Fail| F
```

---

## How It Works

### The Voting Process

1. A student logs in and sees active elections on their dashboard
2. They click "Cast Your Vote" which opens a full-screen ballot
3. For each position (President, VP, Secretary), they select their candidate
4. They click "Continue" to move to the next position
5. On the last position, they click "Submit Ballot"
6. The system gives them a receipt token like `HTU-XXXX-XXXX-XXXX`
7. They can use this receipt later to verify their vote was counted

> This describes the swipeable step-by-step ballot opened from the dashboard
> (`vote-flow-mobile.tsx` / `vote-flow-desktop.tsx`, via `use-ballot.ts`).
> There's also a standalone full-page ballot at `/elections/{election}/vote`
> (`elections/ballot.tsx`) with a simpler single-page UI (all positions shown
> at once, "Review Ballot" then "Confirm & Submit") — both submit to the same
> `VotingService::castBallot()` and produce the same receipt.

### What Happens Behind the Scenes

When a ballot is submitted:

1. **Before any transaction opens**, the system checks the hash chain for previously tampered votes and quarantines/pauses as needed. This runs deliberately *outside* the transaction below — if it ran inside, a later failure in the ballot write would roll back the quarantine along with it, letting a detected tamper silently reappear as "valid."
2. **Then, inside a single database transaction:**
   - It locks the election row so no other ballot can interfere
   - It reads the last valid vote's hash as the "previous hash"
   - For each candidate selected, it creates a vote row that links to the previous one
   - It records that the student has voted (using a hashed student ID)
   - It generates a unique receipt token and returns it to the voter

The transactional part is atomic — either everything in step 2 succeeds, or nothing is saved. The integrity scan in step 1 is intentionally independent of that transaction, by design.

---

## Why the Hash Chain Matters

### The Problem It Solves

Imagine a traditional voting database:

| ID | Student | Position | Candidate |
|----|---------|----------|-----------|
| 1  | Julius  | President | Alice     |
| 2  | Sarah   | President | Bob       |

If someone with database access changes Julius's vote from Alice to Bob, there is **no way to detect the change**. The vote count changes and nobody knows.

### How Our Hash Chain Works

Every vote row contains two hashes that link it to the previous row:

| ID | Position | Candidate | Previous Hash | Current Hash |
|----|----------|-----------|---------------|--------------|
| 1  | President | Alice | `a1b2...` (from Genesis) | `c3d4...` |
| 2  | VP | Bob | `c3d4...` (matches row 1) | `e5f6...` |

The current hash is computed by: `HMAC-SHA256(receipt_token + candidate_id + previous_hash, APP_KEY)`.

If someone changes the candidate in row 1 from Alice to Bob, the current hash of row 1 no longer matches (because the candidate_id changed). And row 2's previous hash no longer matches row 1's current hash (because row 1's hash changed too). The entire chain breaks.

### What Happens When Tampering Is Detected

- The tampered row is automatically quarantined (status changes from `valid` to `quarantined`)
- If 20 or more votes are quarantined, the entire election is paused for review
- Administrators see the broken chain on the Audit page
- The system logs every quarantine event

### Why It's Necessary for E-Voting

- **Trust:** Voters can verify their vote without trusting the server
- **Detection:** Any tampering is immediately visible — no silent vote flipping
- **Recovery:** Quarantined votes are flagged, not deleted — administrators can investigate
- **Defense:** Even with direct database access, modifying votes breaks the chain and is detected

---

## Scenarios the System Handles

### Scenario 1: Direct Database Tampering

An attacker with database access changes a candidate_id in the votes table. The system detects the broken hash link on the next ballot submission. The tampered row is quarantined. Administrators are alerted.
**Result:** Attack detected, vote integrity preserved.

### Scenario 2: Double Voting

A student tries to vote twice in the same election. The system checks `evote_voter_participation` before accepting the ballot. The unique constraint on `(election_id, hashed_student_id)` blocks the second attempt.
**Result:** One vote per student, enforced at the database level.

### Scenario 3: Concurrent Voting

Two students submit ballots at the exact same time. The database transaction locks the election row. Only one ballot processes at a time. Each gets a unique chain position.
**Result:** No forked chains, consistent vote ordering.

### Scenario 4: Receipt Verification

A voter wants to prove their vote was counted. They paste their receipt token on the verify page. The system confirms the vote exists, checks its status, and verifies hash chain integrity — without revealing who they voted for.
**Result:** Trust without compromising anonymity.

### Scenario 5: Admin Quarantine Dismissal

An administrator reviews a quarantined vote and attempts to restore it. The system re-verifies the hash chain integrity (self-consistency and cross-row linkage) before allowing dismissal. If the chain is still broken, dismissal is blocked.
**Result:** Tampered votes cannot be silently restored by a rogue admin.

### Scenario 6: Admin Audit

After an election, administrators run a chain audit. The system validates every hash link. Broken links are flagged. A health status (valid/broken) is displayed with quarantine counts.
**Result:** Transparent, verifiable election integrity.
