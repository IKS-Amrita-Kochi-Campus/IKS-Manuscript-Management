# API Documentation

Complete API reference for the Manuscript Archival Platform.

## Base URL

```
Development: http://localhost:5000/api
Production: https://api.manuscripts.institution.edu/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "researcher@university.edu",
  "password": "SecureP@ssw0rd!",
  "firstName": "John",
  "lastName": "Doe",
  "institution": "University of Example",
  "designation": "Research Scholar",
  "researchInterests": "Sanskrit manuscripts, Vedic literature",
  "phone": "+91 9876543210"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "uuid",
    "email": "researcher@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "VISITOR",
    "isEmailVerified": false,
    "verificationStatus": "PENDING"
  }
}
```

### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "researcher@university.edu",
  "password": "SecureP@ssw0rd!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "researcher@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "isEmailVerified": true,
    "verificationStatus": "VERIFIED"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Refresh Token

```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Verify Email

```http
GET /auth/verify-email/:token
```

### Forgot Password

```http
POST /auth/forgot-password
```

**Request Body:**
```json
{
  "email": "researcher@university.edu"
}
```

### Reset Password

```http
POST /auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecureP@ssw0rd!"
}
```

---

## User Endpoints

### Get Profile

```http
GET /users/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "researcher@university.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER",
    "institution": "University of Example",
    "designation": "Research Scholar",
    "researchInterests": "Sanskrit manuscripts",
    "phone": "+91 9876543210",
    "verificationStatus": "VERIFIED",
    "isEmailVerified": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "lastLoginAt": "2024-01-20T14:25:00Z"
  }
}
```

### Update Profile

```http
PUT /users/me
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "institution": "New University",
  "designation": "Professor",
  "researchInterests": "Updated interests",
  "phone": "+91 9876543210",
  "address": "123 Academic Street"
}
```

### Upload Identity Document

```http
POST /users/me/identity
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Fields:**
- `document`: File (PDF, JPEG, PNG) - max 10MB
- `documentType`: String (e.g., "Aadhaar", "Passport", "Institutional ID")

### Get Verification Status

```http
GET /users/me/identity/status
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "verification": {
    "status": "PENDING",
    "documentType": "Aadhaar",
    "verifiedAt": null,
    "documents": [
      {
        "documentType": "Aadhaar",
        "status": "PENDING",
        "uploadedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### Get Active Sessions

```http
GET /users/me/sessions
Authorization: Bearer <token>
```

### Revoke Session

```http
DELETE /users/me/sessions/:sessionId
Authorization: Bearer <token>
```

---

## Manuscript Endpoints

### Search Manuscripts

```http
GET /manuscripts/search
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Full-text search query |
| category | string | Filter by category |
| language | string | Filter by language |
| script | string | Filter by script |
| material | string | Filter by material |
| century | string | Filter by century estimate |
| origin | string | Filter by origin |
| repository | string | Filter by repository |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20, max: 100) |
| sortBy | string | relevance, title, date, views |
| sortOrder | string | asc, desc |

**Example:**
```
GET /manuscripts/search?q=vedanta&language=Sanskrit&page=1&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "manuscripts": [
    {
      "_id": "mongo-id",
      "title": "Vedanta Sara",
      "author": "Sadananda Yogindra",
      "category": "Religious Text",
      "subject": ["Vedanta", "Philosophy"],
      "language": ["Sanskrit"],
      "abstract": "A concise treatise on Advaita Vedanta...",
      "centuryEstimate": "15th century",
      "repository": "National Archives",
      "visibility": "public",
      "status": "published",
      "viewCount": 1250,
      "keywords": ["vedanta", "advaita", "philosophy"]
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "totalPages": 3
  }
}
```

### Get Filter Options

```http
GET /manuscripts/filters
```

**Response (200 OK):**
```json
{
  "success": true,
  "filters": {
    "categories": ["Religious Text", "Scientific Treatise", "Literary Work"],
    "languages": ["Sanskrit", "Pali", "Tamil", "Telugu"],
    "scripts": ["Devanagari", "Grantha", "Malayalam"],
    "materials": ["Palm Leaf", "Paper", "Birch Bark"],
    "centuries": ["10th century", "15th century", "18th century"],
    "origins": ["Kerala", "Karnataka", "Tamil Nadu"],
    "repositories": ["National Archives", "University Library"]
  }
}
```

### Get Manuscript by ID

```http
GET /manuscripts/:id
Authorization: Bearer <token> (optional)
```

**Response (200 OK):**
```json
{
  "success": true,
  "manuscript": {
    "_id": "mongo-id",
    "title": "Vedanta Sara",
    "alternateTitle": "Essence of Vedanta",
    "author": "Sadananda Yogindra",
    "category": "Religious Text",
    "subject": ["Vedanta", "Philosophy"],
    "language": ["Sanskrit"],
    "script": ["Devanagari"],
    "material": "Palm Leaf",
    "format": "Pothi",
    "dimensions": { "height": 5, "width": 30, "unit": "cm" },
    "folioCount": 45,
    "condition": "Good",
    "centuryEstimate": "15th century",
    "origin": "Kerala",
    "repository": "National Archives",
    "abstract": "A concise treatise...",
    "incipit": "अथ वेदान्तसारः...",
    "visibility": "public",
    "status": "published",
    "viewCount": 1250,
    "downloadCount": 85,
    "files": [
      {
        "type": "pdf",
        "originalName": "vedanta_sara.pdf",
        "mimeType": "application/pdf",
        "size": 15234567,
        "pageCount": 90
      }
    ]
  }
}
```

### Create Manuscript

```http
POST /manuscripts
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Manuscript Title",
  "author": "Author Name",
  "category": "Religious Text",
  "subject": ["Subject1", "Subject2"],
  "language": ["Sanskrit"],
  "script": ["Devanagari"],
  "material": "Palm Leaf",
  "repository": "Institution Name",
  "abstract": "Description of the manuscript...",
  "keywords": ["keyword1", "keyword2"],
  "visibility": "restricted"
}
```

### Upload Files

```http
POST /manuscripts/:id/files
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Fields:**
- `files`: Array of files (PDF, JPEG, PNG, TIFF, WebP, TXT) - max 100MB each

### View File (Secure Streaming)

```http
GET /manuscripts/:id/view/:fileIndex
Authorization: Bearer <token>
```

Returns the file content with watermark overlay for viewing.

### Download File (With Watermark)

```http
GET /manuscripts/:id/download/:fileIndex
Authorization: Bearer <token>
```

Returns the watermarked file for download.

---

## Access Request Endpoints

### Create Access Request

```http
POST /access-requests
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "manuscriptId": "mongo-id",
  "requestedLevel": "VIEW_CONTENT",
  "purpose": "Academic research on Vedic literature",
  "institution": "University of Example",
  "justification": "I am conducting research on 15th century philosophical texts for my doctoral thesis. This manuscript is essential for understanding the development of Advaita Vedanta during this period...",
  "duration": 180
}
```

**Access Levels:**
- `VIEW_METADATA` - View extended metadata only
- `VIEW_CONTENT` - View manuscript content online
- `DOWNLOAD` - Download with watermark
- `FULL_ACCESS` - Complete access including high-resolution

### Get My Requests

```http
GET /access-requests/my
Authorization: Bearer <token>
```

### Get Manuscript Requests (Owner/Reviewer)

```http
GET /access-requests/manuscript/:manuscriptId
Authorization: Bearer <token>
```

### Approve Request

```http
PUT /access-requests/:id/approve
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reviewNotes": "Approved for research purposes",
  "approvedLevel": "VIEW_CONTENT",
  "approvedDuration": 90
}
```

### Reject Request

```http
PUT /access-requests/:id/reject
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reviewNotes": "Insufficient justification provided"
}
```

### Revoke Access

```http
DELETE /access-requests/revoke/:manuscriptId/:userId
Authorization: Bearer <token>
```

---

## Admin Endpoints

### Get Statistics

```http
GET /admin/statistics
Authorization: Bearer <token> (Admin only)
```

**Response (200 OK):**
```json
{
  "success": true,
  "statistics": {
    "users": {
      "total": 1500,
      "active": 1350,
      "verified": 1200
    },
    "manuscripts": {
      "total": 5000,
      "published": 4500
    },
    "pending": {
      "accessRequests": 25,
      "verifications": 10
    }
  }
}
```

### Get Users

```http
GET /admin/users
Authorization: Bearer <token> (Admin only)
```

**Query Parameters:**
- `page`, `limit`, `role`, `status`, `search`

### Update User Role

```http
PUT /admin/users/:id/role
Authorization: Bearer <token> (Admin only)
```

**Request Body:**
```json
{
  "role": "REVIEWER"
}
```

### Verify Identity

```http
PUT /admin/verification/:userId
Authorization: Bearer <token> (Admin only)
```

**Request Body:**
```json
{
  "status": "VERIFIED",
  "reviewNotes": "Identity verified successfully"
}
```

### Get Audit Logs

```http
GET /admin/audit-logs
Authorization: Bearer <token> (Admin only)
```

**Query Parameters:**
- `page`, `limit`, `userId`, `action`, `category`, `startDate`, `endDate`

---

## Error Responses

All error responses follow this structure:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication token required |
| `TOKEN_EXPIRED` | 401 | Access token has expired |
| `TOKEN_INVALID` | 401 | Token verification failed |
| `SESSION_INVALID` | 401 | Session expired or invalidated |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `ACCOUNT_LOCKED` | 403 | Account temporarily locked |
| `ACCOUNT_DEACTIVATED` | 403 | Account has been deactivated |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |
