# SAMAWA — BIMWIN Kemenag Jepara Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Default Deny**: Any unmatched path under `/databases/{database}/documents` is unconditionally denied.
2. **Verified Identity**: All writes require `request.auth != null && request.auth.token.email_verified == true`.
3. **Zero Self-Escalation**: Users creating `/users/{userId}` MUST set `uid == request.auth.uid`, `role == 'Peserta'`, and `identityLocked == false`. Users can NEVER create or modify `/admins/{adminUid}` unless already a verified Admin.
4. **PII Isolation**: `/users/{userId}` is strictly readable only by `isOwner(userId)` or `isAdmin()`. Blanket reads/lists of `/users` by non-admins are forbidden.
5. **Public QR Safety**: `/public_certificates/{certCode}` exposes ONLY single-document `get` (never `list` scraping) and stores strictly non-PII certificate summary fields; only verified Admins/Officers can create/update certificates.
6. **Terminal State Locking**: `/data_tickets/{ticketId}` cannot be modified by participants once `status` reaches `'selesai'` or `'ditolak'`; participants can only edit `details` while `status == 'menunggu'`, while verified Admins can resolve tickets.
7. **Strict Timestamps & Path Hardening**: Every single-doc path variable is guarded by `isValidId()` (`^[a-zA-Z0-9_\-]+$`, `<= 128`), every string has a `.size()` bound, and `createdAt`/`updatedAt` strictly match `request.time`.

## 2. The "Dirty Dozen" Attack Payloads (Expected: PERMISSION_DENIED)
1. **Unverified Admin Email Spoof**: Auth email equals bootstrap admin email, but `email_verified == false`, attempting to write `/public_announcements/a1`.
2. **Self-Assigned SuperAdmin on User Create**: Participant sends `{ role: "SuperAdmin" }` to `/users/{uid}`.
3. **Ghost / Shadow Field Injection**: Participant adds `isVerified: true` to `/users/{uid}` update payload.
4. **Cross-User PII Read**: Authenticated User A calls `get('/users/userB')`.
5. **Cross-User List Scraping**: Authenticated User A calls `list('/data_tickets')` without matching `ownerUid == request.auth.uid`.
6. **Public Certificate Bulk Scraping**: Unauthenticated or standard user calls `list('/public_certificates')`.
7. **Forged Certificate Creation**: Standard participant attempts `create` on `/public_certificates/SERT-FAKE-01`.
8. **Post-Certificate Identity Unlock Bypass**: Participant attempts to flip `identityLocked: false` or change `role` on `/users/{uid}`.
9. **Terminal Ticket Re-Open Attack**: Participant tries to update `/data_tickets/t1` whose existing `status` is `'selesai'`.
10. **Client-Forged Timestamp Attack**: User sends backdated `createdAt` or `updatedAt` != `request.time`.
11. **Path ID Poisoning (Denial of Wallet)**: Attacker writes to `/data_tickets/<200-char-junk-id>`.
12. **Oversized String / Value Poisoning**: Participant submits 5,000-character `details` string (exceeding `maxLength: 1200`) on `/data_tickets/t2`.
