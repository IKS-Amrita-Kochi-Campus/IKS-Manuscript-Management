// MongoDB Models (use getXxxModel() functions after connection)
export { getManuscriptModel } from './mongo/Manuscript.model.js';
export type { IManuscript } from './mongo/Manuscript.model.js';

export { getAuditLogModel } from './mongo/AuditLog.model.js';
export type { IAuditLog } from './mongo/AuditLog.model.js';

// PostgreSQL Repositories
export {
    userRepo,
    sessionRepo,
    accessRequestRepo,
    manuscriptAccessRepo,
    verificationDocRepo,
} from '../repositories/postgres.repository.js';

// PostgreSQL Types
export type {
    User,
    Session,
    AccessRequest,
    ManuscriptAccess,
    VerificationDocument,
} from '../repositories/postgres.repository.js';
