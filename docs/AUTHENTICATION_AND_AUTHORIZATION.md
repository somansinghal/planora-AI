# Authentication and Authorization Guide – Planora AI

Security and multi-tenant isolation are non-negotiable foundations of Planora AI. This document details how authentication tokens are issued, verified, and enforced across frontend client guards and backend FastAPI routes.

---

## 1. Authentication Lifecycle

Planora AI utilizes Firebase Authentication (Google Cloud Identity Platform) as the identity provider.

```
Client Browser                          Firebase Auth Servers                  Planora FastAPI Backend
      |                                           |                                       |
      |-- 1. Sign In (Email/Pass or Google OAuth) |                                       |
      |------------------------------------------>|                                       |
      |<------------------------------------------|                                       |
      |   Returns ID Token (JWT) + Refresh Token  |                                       |
      |                                                                                   |
      |-- 2. HTTP Request with Header "Authorization: Bearer <ID_TOKEN>" ---------------->|
      |                                                                                   |-- 3. Verify Signature & Expiry
      |                                                                                   |-- 4. Check Token Revocation Status
      |                                                                                   |-- 5. Extract UID into Request Context
      |<-- 6. Returns Protected Resource (200 OK) ----------------------------------------|
```

### 1.1 Token Characteristics
- **Algorithm**: RS256 (asymmetrically signed using Google's public key infrastructure).
- **Lifespan**: 1 hour. The Firebase Client SDK handles automatic background silent renewal without interrupting active user sessions.
- **Claims Extracted**: `uid` (Subject), `email`, `name`, `email_verified`.

---

## 2. Server-Side Authorization & Ownership Enforcement

### 2.1 The Cardinal Rule of Resource Ownership
> **Never trust a user ID supplied in a request body or URL as proof of ownership.**

In Planora AI, user identity is exclusively established via cryptographically verified token claims:
```python
# app/core/security.py
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> AuthenticatedUser:
    token = credentials.credentials
    decoded = firebase_auth.verify_id_token(token, check_revoked=True)
    return AuthenticatedUser(uid=decoded['uid'], email=decoded.get('email'))
```

### 2.2 Ownership Verification Dependency
Whenever any protected resource (event, expense, task, vendor, guest, or report) is requested, updated, or deleted, `verify_resource_ownership` is invoked:
```python
def verify_resource_ownership(resource_user_id: str, current_user: AuthenticatedUser) -> None:
    if resource_user_id != current_user.uid:
        logger.warning(
            f"Unauthorized access attempt: user {current_user.uid[:8]}... "
            f"attempted to access resource owned by {resource_user_id[:8]}..."
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource."
        )
```
If User A creates an event with ID `123`, and User B submits `GET /api/events/123`, User B is immediately rejected with `403 Forbidden`, regardless of what payload User B provides.

---

## 3. Frontend Route Protection (`js/auth-guard.js`)

Public pages (`index.html`, `login.html`, `signup.html`, `pricing.html`, `about.html`, `privacy.html`, `terms.html`, `404.html`) do not require authentication.

Every authenticated workspace page (`dashboard.html`, `create-event.html`, `planner.html`, `budget.html`, `timeline.html`, `tasks.html`, `vendors.html`, `guests.html`, `copilot.html`, `reports.html`, `settings.html`) executes `requireAuth()` before mounting DOM components:
```javascript
// js/auth-guard.js
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.replace(`login.html?redirect=${returnUrl}`);
    return null;
  }
  return user;
}
```

*Defense-in-depth notice:* Frontend route redirection is a user experience convenience. Real security is enforced at the backend API layer and Firestore Security Rules.

---

## 4. Firestore Security Rules

To ensure direct browser database queries (if activated) cannot bypass the backend, `firebase/firestore.rules` enforces identical ownership rules:
```javascript
match /events/{eventId} {
  allow read: if request.auth != null && resource.data.user_id == request.auth.uid;
  allow create: if request.auth != null && request.resource.data.user_id == request.auth.uid;
  allow update, delete: if request.auth != null && resource.data.user_id == request.auth.uid;
}
```
All unauthorized read or write attempts to Firestore collections are denied by default.
