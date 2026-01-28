import morgan from 'morgan';
import { stream } from '../utils/logger.js';

// Define log format string (Apache combined format + response time)
const format = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';

export const httpLogger = morgan(format, { stream });
