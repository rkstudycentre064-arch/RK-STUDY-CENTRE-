# RK STUDY CENTRE - Security Specification

## 1. Data Invariants
- A **User Profile** must have a unique `uid` matching their Auth ID. Only the user can edit their own basic profile. Only the owner can set the `role` to `owner`.
- **Educational Curriculum** (Classes, Subjects, Books, Chapters) are read-only for students and only manageable by the verified owner.
- **Study Materials** and **Tests** are read-only for all users to ensure consistency. Only the owner can upload or modify them.
- **Test Results** must belong to the student who submitted them (`studentId` == `auth.uid`). Once submitted, they are immutable for the student.
- **Vlogs** are public for reading. View and like counts can be incremented by anyone, but all other metadata is owner-only.

## 2. The "Dirty Dozen" Payloads (Deny Targets)

### Identity & Spoofing
1. **User Role Escalate**: `{"uid": "user123", "email": "hacker@evil.com", "role": "owner"}` sent by `user123`.
2. **Result Hijack**: `{"testId": "t1", "studentId": "victim_uid", "score": 100}` sent by `hacker_uid`.
3. **Profile Steal**: Attempt to `get` `/users/victim_uid` by `hacker_uid`.

### Integrity & Schema
4. **Junk ID**: Attempt to `create` `/users/!!!_invalid_id_!!!`.
5. **Oversized String**: `{"displayName": "A" * 10000}` in profile.
6. **Curriculum Sabotage**: `{"title": "Hacked"}` sent to `/subjects/math` by a student.

### State & Immutability
7. **Score Tamper**: `update` `score` in `/testResults/r1` by the student after submission.
8. **Result Date Spoof**: `{"completedAt": "2020-01-01"}` instead of server time.
9. **Curriculum Wipe**: Student attempting to `delete` a chapter.

### Resource Exhaustion
10. **Array Poisoning**: `{"enrolledCourseIds": ["c1", "c2", ... 1000 items]}` in profile.
11. **Shadow Update**: `{"isVerified": true, "ghostField": "secret"}` in a profile update.
12. **Public Wipe**: Anonymous user attempting to `list` all users.

## 3. Implementation Patterns
- `isValidId()` check on all document IDs.
- `isAdmin()` check via verified email `rkstudycentre064@gmail.com`.
- `isValidUser()`, `isValidResult()`, `isValidVlog()` validation helpers.
- Action-based updates for Vlog increments.
- Default deny for all unspecified paths.
