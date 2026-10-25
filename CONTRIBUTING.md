# Contributing to Planora AI

Thank you for your interest in contributing to Planora AI!

## Development Workflow

1. **Fork and Clone**: Clone your fork locally.
2. **Environment Setup**:
   - Backend: Ensure Python 3.10+ is installed.
   - Frontend: Vanilla HTML5, CSS3, and ES Modules. No build steps required.
3. **Local Backend Startup**:
   ```bash
   cd backend
   python3 -m uvicorn app.main:app --reload --port 8000
   ```
4. **Local Frontend Startup**:
   Serve the root directory using any local static file server (e.g. `npx serve .`, `python3 -m http.server 3000`).
5. **Running Tests**:
   ```bash
   cd backend
   python3 -m unittest discover -s tests -p "test_*.py" -v
   ```

## Contribution Guidelines

- **No Secrets**: Never commit API keys, service account JSON files, or tokens.
- **Strict Ownership**: All new database routes and entity models must enforce user authorization.
- **Clean Vanilla Code**: Avoid adding heavy runtime frontend frameworks unless approved.
- **Pull Requests**: Provide clear descriptions of bug fixes and features with associated automated tests.
