# Security Model

This document outlines the comprehensive security architecture of the Manuscript Archival Platform.

## 1. Authentication & Authorization

### 1.1 Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Backend   │────▶│  PostgreSQL │
│             │◀────│    API      │◀────│   (Users)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   ▼
       │            ┌─────────────┐
       └───────────▶│    Redis    │
                    │  (Sessions) │
                    └─────────────┘
```

1. User submits credentials
2. Server validates against PostgreSQL (Argon2id hash)
3. On success, generate JWT access token (15 min) + refresh token (7 days)
4. Create session in PostgreSQL with refresh token
5. Return tokens to client

### 1.2 JWT Configuration

| Parameter | Value | Purpose |
|-----------|-------|---------|
| Algorithm | RS256 | Asymmetric signing (production) / HS256 (development) |
| Access Token Expiry | 15 minutes | Short-lived for security |
| Refresh Token Expiry | 7 days | Longer for convenience |
| Issuer | `manuscript-archive` | Token validation |
| Audience | `manuscript-users` | Token validation |

### 1.3 Password Policy

- **Minimum Length**: 12 characters
- **Complexity Requirements**:
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
- **Hashing Algorithm**: Argon2id
  - Memory: 64 MB
  - Time Cost: 3 iterations
  - Parallelism: 4 threads

### 1.4 Account Security

- **Failed Login Attempts**: 5 attempts before lockout
- **Lockout Duration**: 30 minutes
- **Concurrent Sessions**: Maximum 5 per user
- **Session Timeout**: 24 hours absolute, 30 minutes idle

## 2. Role-Based Access Control (RBAC)

### 2.1 Role Hierarchy

```
ADMIN (Level 4)
   ├── Full system access
   ├── User management & role assignment
   ├── Identity verification
   ├── Override access controls
   └── View all audit logs
        │
REVIEWER (Level 3)
   ├── Review manuscripts
   ├── Approve/reject access requests
   └── View manuscript content
        │
OWNER (Level 2)
   ├── Upload/manage own manuscripts
   ├── Grant/revoke access to own manuscripts
   └── View access requests for own manuscripts
        │
USER (Level 1)
   ├── Request access to manuscripts
   ├── View approved manuscripts
   └── Download with watermark
        │
VISITOR (Level 0)
   ├── View public metadata only
   ├── Search & discover manuscripts
   └── Register for account
```

### 2.2 Permission Matrix

| Action | Visitor | User | Owner | Reviewer | Admin |
|--------|---------|------|-------|----------|-------|
| View public metadata | ✓ | ✓ | ✓ | ✓ | ✓ |
| Search manuscripts | ✓ | ✓ | ✓ | ✓ | ✓ |
| Request access | - | ✓ | ✓ | ✓ | ✓ |
| View approved content | - | ✓ | ✓ | ✓ | ✓ |
| Download with watermark | - | ✓* | ✓ | ✓ | ✓ |
| Upload manuscripts | - | - | ✓ | ✓ | ✓ |
| Manage own manuscripts | - | - | ✓ | ✓ | ✓ |
| Approve access requests | - | - | ✓** | ✓ | ✓ |
| Review manuscripts | - | - | - | ✓ | ✓ |
| Manage users | - | - | - | - | ✓ |
| View audit logs | - | - | - | - | ✓ |
| Verify identities | - | - | - | - | ✓ |

*Requires approved access
**Only for their own manuscripts

## 3. File Encryption

### 3.1 Encryption Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Original   │────▶│   Encrypt   │────▶│  Encrypted  │
│    File     │     │  (AES-256)  │     │    File     │
└─────────────┘     └─────────────┘     └─────────────┘
                          │
                          ▼
                    ┌─────────────┐
                    │  Data Key   │
                    │   (DEK)     │
                    └─────────────┘
                          │
                    ┌─────────────┐
                    │  Master Key │
                    │   (KEK)     │
                    └─────────────┘
```

### 3.2 Encryption Specifications

| Component | Algorithm/Specification |
|-----------|------------------------|
| Symmetric Encryption | AES-256-GCM |
| Key Derivation | scrypt |
| IV Size | 16 bytes (random) |
| Authentication Tag | 16 bytes |
| Salt Size | 32 bytes |
| Integrity Check | SHA-256 checksum |

### 3.3 Encryption Flow

1. **Upload**:
   - Generate random salt and IV
   - Derive encryption key from master key using scrypt
   - Encrypt file content with AES-256-GCM
   - Generate authentication tag for integrity
   - Calculate SHA-256 checksum of original file
   - Store: salt + IV + authTag + encryptedData

2. **Download**:
   - Verify user access permissions
   - Retrieve encrypted file from storage
   - Extract salt, IV, and auth tag
   - Derive decryption key
   - Decrypt and verify authentication tag
   - Verify checksum matches original
   - Apply watermark if required
   - Stream to user

## 4. Dynamic Watermarking

### 4.1 Watermark Components

- User full name
- User email address
- Access timestamp (ISO format)
- Unique watermark ID (UUID)
- Institution name (if available)

### 4.2 Watermark Application

**PDF Watermarks**:
- Diagonal text across each page
- 15% opacity, gray color
- Corner watermark IDs
- Footer with timestamp and email

**Image Watermarks**:
- Tiled pattern overlay
- 20% opacity
- Bottom corner tracking ID

### 4.3 Forensic Tracking

Each watermark ID is stored in the database linked to:
- User ID
- Manuscript ID
- Access grant ID
- Timestamp
- Download count

If leaked document found:
1. Extract watermark ID from document
2. Query database by watermark ID
3. Identify responsible user
4. Review audit logs for context

## 5. Audit Logging

### 5.1 Logged Events

| Category | Actions |
|----------|---------|
| Authentication | login, logout, register, password_change, token_refresh |
| User | profile_update, identity_upload, session_revoke |
| Manuscript | create, update, delete, file_upload, file_delete |
| Access | view_metadata, view_content, download, request_access |
| Admin | role_change, status_change, verify_identity, access_approve |

### 5.2 Log Entry Structure

```typescript
{
  userId: string;
  userEmail: string;
  userRole: string;
  sessionId: string;
  action: string;
  actionCategory: string;
  status: 'success' | 'failure';
  resourceType: string;
  resourceId: string;
  method: string;
  path: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata: Record<string, any>;
}
```

### 5.3 Log Retention

- Default retention: 90 days
- TTL index for automatic cleanup
- Critical logs (security events): 1 year
- Compliance logs: As required by policy

## 6. Network Security

### 6.1 CORS Policy

```javascript
{
  origin: 'https://manuscripts.institution.edu',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

### 6.2 Rate Limiting

| Endpoint Category | Window | Max Requests |
|------------------|--------|--------------|
| General API | 1 minute | 100 |
| Login | 15 minutes | 5 |
| Registration | 1 hour | 3 |
| Password Reset | 1 hour | 3 |
| File Download | 1 hour | 10 |
| File Upload | 1 hour | 20 |

### 6.3 Security Headers (Helmet.js)

- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (production)

## 7. Input Validation

All inputs are validated using Zod schemas before processing:

- Email format validation
- Password strength validation
- File type and size restrictions
- SQL injection prevention (Prisma parameterized queries)
- NoSQL injection prevention (Mongoose query sanitization)
- XSS prevention (input escaping)

## 8. Secure Viewer Protection

### 8.1 Client-Side Protections

- Disable right-click context menu
- Intercept Ctrl+P (print)
- No direct file URLs exposed
- Session-based viewing tokens
- Watermark overlay (cannot be removed via CSS)

### 8.2 Server-Side Protections

- Short-lived viewing sessions (15 minutes)
- IP and User-Agent binding
- Real-time session validation
- Access logging for every view

## 9. Identity Verification

### 9.1 Verification Process

1. User uploads government ID or institutional ID
2. Document is encrypted and stored
3. Admin reviews document (manual verification)
4. Admin approves/rejects with notes
5. User role upgraded on approval
6. Original document retained for compliance

### 9.2 Accepted Documents

- Aadhaar Card
- Passport
- Institutional ID Card
- Government-issued Photo ID

## 10. Recommendations for Production

1. **Use HTTPS everywhere** with TLS 1.3
2. **Deploy behind WAF** (Web Application Firewall)
3. **Use HashiCorp Vault or AWS KMS** for key management
4. **Enable database encryption at rest**
5. **Regular security audits** and penetration testing
6. **Implement IP whitelisting** for admin access
7. **Two-factor authentication** for admins
8. **Regular backup and disaster recovery** testing
