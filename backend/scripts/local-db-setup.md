# Local Database Migration Guide

This guide walks you through migrating from remote databases to local MongoDB and PostgreSQL instances.

## Prerequisites

### Install Local Databases

#### MongoDB
1. Download and install MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Or use Docker:
   ```bash
   docker run -d --name mongodb -p 27017:27017 mongo:latest
   ```

#### PostgreSQL
1. Download and install PostgreSQL: https://www.postgresql.org/download/
2. Or use Docker:
   ```bash
   docker run -d --name postgres -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:latest
   ```

---

## Migration Steps

### Step 1: Export Data from Remote Databases

**Important:** Do this BEFORE changing your `.env` file!

```bash
cd backend
npx tsx scripts/export-data.ts
```

This will create JSON files in `./scripts/exports/`:
- `mongo_logs.json` - Audit logs from MongoDB
- `mongo_manuscripts.json` - Manuscripts from MongoDB
- `postgres_users.json` - Users table
- `postgres_sessions.json` - Sessions table
- `postgres_access_requests.json` - Access requests
- `postgres_manuscript_access.json` - Manuscript access grants
- `postgres_verification_documents.json` - Verification documents
- `postgres_bookmarks.json` - User bookmarks
- `postgres_app_settings.json` - Application settings

### Step 2: Setup Local Databases

#### MongoDB
MongoDB databases will be created automatically when you run the import.

#### PostgreSQL
Create the database:
```bash
# Using psql
psql -U postgres
CREATE DATABASE iks;
\q
```

Or via pgAdmin or any PostgreSQL GUI tool.

### Step 3: Update .env File

Update your `.env` file with local database credentials:

```env
# MongoDB - Local
MONGODB_URI_LOG=mongodb://localhost:27017/iks_log
MONGODB_URI_MANUSCRIPTS=mongodb://localhost:27017/manuscript

# PostgreSQL - Local
POSTGRESS_URI=postgres://postgres:YOUR_PASSWORD@localhost:5432/iks

# Keep other settings the same...
```

### Step 4: Import Data to Local Databases

```bash
npx tsx scripts/import-data.ts
```

This will:
1. Connect to your local databases
2. Create all necessary tables/collections
3. Import all exported data
4. Display a summary of imported records

### Step 5: Start the Server

```bash
npm run dev
```

---

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running: `net start MongoDB` (Windows) or `sudo systemctl start mongod` (Linux)
- Check if port 27017 is available: `netstat -an | findstr 27017`

### PostgreSQL Connection Issues
- Ensure PostgreSQL service is running
- Verify password is correct
- Check if the `iks` database exists
- Ensure port 5432 is available

### Import Errors
- Check if export files exist in `./scripts/exports/`
- Verify JSON files are valid (not corrupted)
- Check database permissions

### Foreign Key Errors
- The import script handles dependencies automatically
- If you get FK errors, ensure users are imported first

---

## Environment Variables Reference

```env
# ══════════════════════════════════════════════════════════════════
# LOCAL DATABASE CONFIGURATION
# ══════════════════════════════════════════════════════════════════

# MongoDB - Logs Database
MONGODB_URI_LOG=mongodb://localhost:27017/iks_log

# MongoDB - Manuscripts Database
MONGODB_URI_MANUSCRIPTS=mongodb://localhost:27017/manuscript

# PostgreSQL - User Data
POSTGRESS_URI=postgres://postgres:postgres@localhost:5432/iks

# ══════════════════════════════════════════════════════════════════
# APPLICATION SETTINGS (keep existing values)
# ══════════════════════════════════════════════════════════════════

NODE_ENV=development
PORT=5000
API_PREFIX=/api

# JWT Configuration
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key!

# Frontend URL
FRONTEND_URL=http://localhost:3000

# SMTP Settings (email)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@manuscripts.edu
```

---

## Quick Commands Reference

```bash
# Export from remote databases
npx tsx scripts/export-data.ts

# Import to local databases
npx tsx scripts/import-data.ts

# Start server
npm run dev

# Check MongoDB
mongosh
> show dbs
> use iks_log
> db.IKS_logs.countDocuments()
> use manuscript
> db.manuscripts.countDocuments()

# Check PostgreSQL
psql -U postgres -d iks
\dt
SELECT COUNT(*) FROM users;
```
