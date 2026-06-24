# Voting Architecture

## Flow

```mermaid
sequenceDiagram
    actor V as Voter
    participant UI as React/Inertia
    participant API as Laravel
    participant DB as MariaDB
    participant Chain as Hash Chain

    V->>UI: Click "Cast Your Vote"
    UI->>API: GET /elections/{id}/ballot-data
    API->>DB: Load positions + candidates
    DB-->>API: Ballot data
    API-->>UI: JSON response

    loop Each Position
        UI->>V: Show candidates (slider + list)
        V->>UI: Select candidate(s)
        UI->>UI: Track selections locally
    end

    V->>API: POST /elections/{id}/vote (all selections)

    API->>API: Validate eligibility + ballot structure
    API->>Chain: getLatestValidVote() — scan for tampered rows

    API->>DB: BEGIN TRANSACTION
    API->>DB: Lock election row (prevent concurrent chain forks)
    API->>DB: Read last valid vote → previous_hash

    loop Each selection
        API->>DB: INSERT evote_votes
        Note over API,DB: receipt_token, position_id,<br/>candidate_id, previous_hash,<br/>current_hash = HMAC(receipt +<br/>candidate + prev_hash, APP_KEY),<br/>status = 'valid'
    end

    API->>DB: INSERT evote_voter_participation
    Note over API,DB: hashed_student_id = HMAC(student_id, APP_KEY)<br/>No user_id stored in votes table
    API->>DB: COMMIT

    API-->>UI: receipt_token (HTU-XXXX-XXXX-XXXX)
    UI-->>V: Show receipt + "Verify Your Vote" button
```

## Anonymity

```mermaid
erDiagram
    evote_votes {
        int id PK
        int election_id
        int position_id
        int candidate_id
        string receipt_token
        string previous_hash
        string current_hash
        string status
    }
    evote_voter_participation {
        int id PK
        int election_id
        string hashed_student_id
        datetime voted_at
    }
    users {
        int id PK
        string student_id
    }
    evote_votes ||--o{ evote_voter_participation : "NO DIRECT LINK"
    evote_voter_participation ||--o{ users : "hashed_student_id ≈ HMAC(student_id)"
    note for evote_votes "No user_id column — votes are anonymous"
    note for evote_voter_participation "Only stores hashed student ID — not reversible without APP_KEY"
```

## Hash Chain Integrity

```mermaid
flowchart LR
    subgraph Genesis
        G[Genesis Block]
    end

    subgraph Vote1
        V1[Vote #1<br/>President]
        H1[curr_hash = HMAC<br/>(receipt + candidate<br/>+ prev_hash, APP_KEY)]
    end

    subgraph Vote2
        V2[Vote #2<br/>Vice President]
        H2[curr_hash = HMAC<br/>(receipt + candidate<br/>+ prev_hash, APP_KEY)]
    end

    subgraph Vote3
        V3[Vote #3<br/>Secretary]
        H3[curr_hash = HMAC<br/>(receipt + candidate<br/>+ prev_hash, APP_KEY)]
    end

    G -->|"prev_hash"| H1
    H1 -->|"prev_hash = H1"| H2
    H2 -->|"prev_hash = H2"| H3

    note for V2 "Tamper with Vote #2<br/>→ H3's prev_hash ≠ H2<br/>→ Chain breaks<br/>→ Auto-quarantined"
```

## Verify Vote

```mermaid
flowchart LR
    V[Voter] -->|Paste receipt| P[Verify Page<br/>GET /verify?token=HTU-...]
    P -->|"EXISTS query"| DB[(evote_votes)]
    DB -->|found + valid| P
    P -->|"✅ Vote Verified<br/>Election: SRC 2026<br/>No ballot choices shown"| V
    note for P "Only confirms existence + validity<br/>Never reveals candidate choices"
```
