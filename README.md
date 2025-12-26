# Manuscript Archival Platform

A secure, government-grade manuscript archival web platform built with Next.js (frontend) and Node.js (backend), featuring a hybrid database architecture:

- **PostgreSQL (Aiven Cloud)** - User data, sessions, access control
- **MongoDB Atlas (iks_log)** - Audit logs
- **MongoDB Atlas (manuscript)** - Manuscripts and search

## Features

- **Public Manuscript Discovery**: Browse and search manuscripts by metadata (metadata only for public)
- **Role-Based Access Control**: Visitor, User, Owner, Reviewer, Admin
- **Identity Verification**: Upload and verify identity documents before access requests
- **Manual Approval Workflow**: Request access with justification, owner/admin approval
- **Secure Encrypted Storage**: AES-256-GCM encryption for all files at rest
- **Dynamic Watermarking**: Per-user watermarks on viewed/downloaded files
- **Comprehensive Audit Logs**: Track every action for security and compliance

## Tech Stack

- **Frontend**: Next.js 14+, React, TypeScript
- **Backend**: Node.js, Express.js, TypeScript
- **Databases**: 
  - PostgreSQL (Aiven Cloud) - Users, sessions, access control
  - MongoDB Atlas (iks_log) - Audit logs with IKS_logs collection
  - MongoDB Atlas (manuscript) - Manuscripts collection
- **Storage**: S3/MinIO for encrypted file storage

## Project Structure

```
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── lib/           # Utilities and API client
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
│
├── backend/               # Node.js Express API
│   ├── src/
│   │   ├── config/        # Configuration & DB connections
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # MongoDB models
│   │   ├── repositories/  # PostgreSQL repositories
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utilities
│   └── package.json
│
└── docs/                  # Documentation
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (2 databases: iks_log, manuscript)
- PostgreSQL (Aiven Cloud or other provider)
- npm or yarn

### 1. Project Setup

```bash
# Install dependencies for both frontend and backend
npm run install:all

# Start both frontend and backend in development mode
npm run dev:backend
npm run dev:frontend
```

Alternatively, you can navigate to each directory manually:

### Setup Backend

```bash
cd backend
npm install
npm run dev
```

### Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

## Database Architecture

### PostgreSQL (Aiven Cloud) - User Data
```
├── users               # User accounts
├── sessions            # JWT sessions
├── access_requests     # Access request workflow
├── manuscript_access   # Granted access with watermark IDs
└── verification_documents # Identity verification
```

### MongoDB Atlas - iks_log
```
└── IKS_logs           # Audit trail (auto-expires after 90 days)
```

### MongoDB Atlas - manuscript
```
└── manuscripts        # Manuscript metadata, files, search indexes
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/me` - Get current profile
- `PUT /api/users/me` - Update profile
- `POST /api/users/me/identity` - Upload identity document

### Manuscripts
- `GET /api/manuscripts/search` - Search manuscripts (public)
- `GET /api/manuscripts/:id` - Get manuscript details
- `POST /api/manuscripts` - Create manuscript
- `GET /api/manuscripts/:id/view/:fileIndex` - View file (watermarked)
- `GET /api/manuscripts/:id/download/:fileIndex` - Download file (watermarked)

### Access Requests
- `POST /api/access-requests` - Create request
- `GET /api/access-requests/my` - Get my requests
- `PUT /api/access-requests/:id/approve` - Approve request
- `PUT /api/access-requests/:id/reject` - Reject request

### Admin
- `GET /api/admin/statistics` - Platform statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/audit-logs` - View audit logs

## Environment Variables

### Backend (`.env`)

```env
NODE_ENV=development
PORT=5000

# MongoDB Atlas
MONGODB_URI_LOG=mongodb+srv://user:pass@cluster.mongodb.net/iks_log
MONGODB_URI_MANUSCRIPTS=mongodb+srv://user:pass@cluster.mongodb.net/manuscript

# PostgreSQL (Aiven)
POSTGRESS_URI=postgres://user:pass@host:port/database?sslmode=require

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret

# S3/MinIO
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=manuscripts
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# Encryption
ENCRYPTION_KEY=your-32-character-key!

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## License

Proprietary - IKS Institution
