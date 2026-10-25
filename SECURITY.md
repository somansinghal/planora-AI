# Security Policy

Planora AI takes user data security, authentication integrity, and privacy seriously.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within Planora AI, please report it responsibly:

1. **Responsible Disclosure**: Contact founder Soman Singhal directly via his verified [Portfolio Contact Form](https://somansinghal.vercel.app/) or open a private security advisory on [GitHub](https://github.com/somansinghal).
2. **Do Not File Public Issues**: Please avoid disclosing suspected vulnerabilities in public issue trackers.
3. **Response Time**: All verified reports are acknowledged within 48 hours.

## Security Architecture

- **Token Verification**: Every protected backend route validates Firebase ID tokens server-side.
- **Resource Ownership**: Endpoints verify that the caller's verified `uid` matches the entity's `user_id`. Attempts to access another user's events result in an immediate `403 Forbidden` response and an audit log entry.
- **Secret Isolation**: Cloud Firestore credentials and AI provider keys are stored exclusively in backend server environments and are never delivered to the client browser.
- **Safe AI Prompts**: User inputs to AI models are sanitized and bounded in character length to mitigate prompt injection risks.
