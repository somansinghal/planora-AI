# Security Policy

Planora AI takes user data security, authentication integrity, and privacy seriously.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within Planora AI, please report it responsibly:

1. **Email**: Send vulnerability disclosures to **security@planora.ai** (or contact the repository maintainers directly).
2. **Do Not File Public Issues**: Do not disclose vulnerabilities in public GitHub issues.
3. **Response Time**: We acknowledge receipt of vulnerability reports within 48 hours.

## Security Architecture

- **Token Verification**: Every protected backend route validates Firebase ID tokens server-side.
- **Resource Ownership**: Endpoints verify that the caller's verified `uid` matches the entity's `user_id`. Attempts to access another user's events result in an immediate `403 Forbidden` response and an audit log entry.
- **Secret Isolation**: Cloud Firestore credentials and AI provider keys are stored exclusively in backend server environments and are never delivered to the client browser.
- **Safe AI Prompts**: User inputs to AI models are sanitized and bounded in character length to mitigate prompt injection risks.
