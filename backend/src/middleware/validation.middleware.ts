import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Validation middleware factory
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            const data = schema.parse(req[source]);
            req[source] = data; // Replace with parsed data
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));

                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: errors,
                });
                return;
            }

            res.status(400).json({
                success: false,
                error: 'Invalid request data',
                code: 'INVALID_DATA',
            });
        }
    };
};

/**
 * Validates request body
 */
export const validateBody = (schema: ZodSchema) => validate(schema, 'body');

/**
 * Validates query parameters
 */
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query');

/**
 * Validates route parameters
 */
export const validateParams = (schema: ZodSchema) => validate(schema, 'params');
