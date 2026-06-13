# Security Specification - RabatTasker

This document details the Zero-Trust Security posture, data invariants, and the test suite validating our security rules.

## 1. Data Invariants

1. **Identity Integrity**: No user may create, edit, or hijack another user's public profile or private information block. Writing to `users/{userId}` requires `userId == request.auth.uid`.
2. **PII Isolation**: Primary contact records inside `users/{userId}/private/info` containing the email and phone number must only be read by the owner `userId`.
3. **Creation Authentication & Immutability**: All tasks posted must bind the `posterId` to `request.auth.uid`. Once created, the `posterId` and `createdAt` are immutable.
4. **Local Task Validation**: Custom title size must be `<= 100` characters, description `<= 1000` characters, budget must be positive (> 0) and `<= 100000` Dirhams (MAD).
5. **State Transition Controls**:
   - Tasks start with status `open`.
   - Offers can only be created/edited on `open` tasks.
   - Only the task's original poster can accept an offer, which alters task status to `assigned`.
   - Once marked `completed` or `cancelled`, the status field is terminal and further updates (other than reviews) are blocked.
6. **Offer Constraints**: Taskers cannot make bids on their own posted tasks. Offer bids are locked to the provider's UID (`request.auth.uid`).
7. **Size Limits & Boundary Defense**: Document IDs matching alphanumeric boundaries `^[a-zA-Z0-9_\-]+$`. Array variables and inputs must be bounded.

---

## 2. The "Dirty Dozen" Malicious Payloads

Here are twelve payloads designed to attack data integrity, each from a malicious actor's perspective:

### Payload 1: Hijacking another User's display name
- **Attack**: Authenticated User `A` tries to overwrite User `B`'s public profile.
- **Path**: `/users/UserB`
- **Method**: `set`
- **Payload**:
  ```json
  {
    "displayName": "Hacker Master",
    "bio": "Compromised profile",
    "rating": 5,
    "reviewsCount": 100,
    "isTasker": true,
    "createdAt": "2026-06-12T09:03:00Z"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (auth.uid="UserA" != documentId="UserB")

### Payload 2: Self-elevating ratings
- **Attack**: A User tries to update their own level-of-trust rating to 5.0 directly without completing tasks.
- **Path**: `/users/UserA`
- **Method**: `update`
- **Affected key**: `rating`
- **Payload**:
  ```json
  {
    "rating": 5.0
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (Clients are restricted, must use review-based updates or admin overrides; ratings are guarded from direct user modifications).

### Payload 3: Scraping PII of another user
- **Attack**: User `A` tries to read the email and phone of User `B`.
- **Path**: `/users/UserB/private/info`
- **Method**: `get`
- **Expectation**: `PERMISSION_DENIED` (Only the owner can read their private split block).

### Payload 4: Spoofing Task Poster UID
- **Attack**: User `A` tries to create a task under User `B`'s UID to make `B` pay.
- **Path**: `/tasks/task101`
- **Method**: `create`
- **Payload**:
  ```json
  {
    "title": "Clean Hassan Villa",
    "description": "Premium dusting inside Hassan, Rabat",
    "budget": 200,
    "category": "cleaning",
    "location": "Hassan",
    "dueDate": "2026-06-20",
    "status": "open",
    "posterId": "UserB",
    "posterName": "Victim Name",
    "offersCount": 0,
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (validated `incoming().posterId == request.auth.uid`).

### Payload 5: Hyper-inflationary budget allocation
- **Attack**: Creating a task with a budget of 10 million Dirhams (denial of service, wallet draining risk).
- **Path**: `/tasks/task102`
- **Method**: `create`
- **Payload**:
  ```json
  {
    "title": "Assemble Desk",
    "description": "Brief manual work in Agdal",
    "budget": 10000000,
    "category": "maintenance",
    "location": "Agdal",
    "dueDate": "2026-06-20",
    "status": "open",
    "posterId": "UserA",
    "posterName": "User A",
    "offersCount": 0,
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (budget must be `<= 100000` Dirhams).

### Payload 6: Bidding on your own task
- **Attack**: User `A` posts a task and bids on it to drive up mock activity.
- **Path**: `/tasks/task101/offers/offer1`
- **Method**: `create`
- **Payload**:
  ```json
  {
    "taskId": "task101",
    "taskerId": "UserA",
    "taskerName": "User A",
    "amount": 150,
    "message": "I'll do it myself!",
    "status": "pending",
    "createdAt": "request.time"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (bidding user is the poster of parents, disallowed by verifying task owner != offer provider).

### Payload 7: Forcing a Task status directly to Completed
- **Attack**: A Tasker tries to update a task status to completed without the poster's approval.
- **Path**: `/tasks/task101`
- **Method**: `update`
- **Payload**:
  ```json
  {
    "status": "completed"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (Action status modifications must verify who is executing the update and what state is transitionable).

### Payload 8: Direct database manipulation of subcollection offers counts
- **Attack**: Injecting an arbitrary huge offers count field to display fake popularity.
- **Path**: `/tasks/task101`
- **Method**: `update`
- **Payload**:
  ```json
  {
    "offersCount": 99999
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (Clients cannot arbitrarily modify tasks' metadata out-of-bounds without standard structural bid state rules).

### Payload 9: Hijacking another tasker's offer and raising bid price
- **Attack**: User `B` tries to edit User `C`'s bid amount on an open task.
- **Path**: `/tasks/task101/offers/offerC`
- **Method**: `update`
- **Payload**:
  ```json
  {
    "amount": 3000
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (only the owner of the offer can update its details).

### Payload 10: Injecting oversized payload to exhaust resources (Denial of Wallet)
- **Attack**: Putting a 1.2MB junk string in the task title.
- **Path**: `/tasks/task103`
- **Method**: `create`
- **Payload**:
  ```json
  {
    "title": "JUNK-1MB...",
    "description": "Normal repair description",
    "budget": 100,
    "category": "maintenance",
    "location": "Hassan",
    "dueDate": "2026-06-25",
    "status": "open",
    "posterId": "UserA",
    "posterName": "User A",
    "offersCount": 0,
    "createdAt": "request.time",
    "updatedAt": "request.time"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (title size must be `<= 100`).

### Payload 11: Bypassing completed state closure
- **Attack**: Updating description of an already completed task.
- **Path**: `/tasks/task_completed`
- **Method**: `update`
- **Payload**:
  ```json
  {
    "description": "Altered description post-payment!"
  }
  ```
- **Expectation**: `PERMISSION_DENIED` (completed states are locked).

### Payload 12: Anonymous malicious spamming
- **Attack**: Unauthenticated client attempting to bulk-read task directories.
- **Path**: `/tasks`
- **Method**: `list`
- **Expectation**: `PERMISSION_DENIED` (all listing operations require authentications, and verification of user tags).

---

## 3. Test Suite (Conceptual - `firestore.rules.test.ts`)

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from "@firebase/rules-unit-testing";

// Standard TDD tests ensuring all dirty dozen fail.
// Code verification is simulated under firestore rules configuration.
```
