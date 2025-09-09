# Next.js 15.5.2 Authentication Feature

Authentication system with MongoDB.

## Features

- **Secure Authentication**: Email/password and Google OAuth
- **Automatic Token Refresh**: 30-day sessions with 15-minute access tokens

- **Security Best Practices**:
  - Bcrypt password hashing (12 rounds)
  - JWT tokens with proper expiration
  - HTTP-only cookies for refresh tokens
  - CSRF protection
  - Input validation with Zod
