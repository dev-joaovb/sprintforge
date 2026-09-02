import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
        res.status(400).json({
          success: false,
          message: `Dados inválidos: ${errorMessages}`,
          errors: error.issues,
        });
        return;
      }
      res.status(400).json({ success: false, message: 'Erro na validação da requisição.' });
    }
  };
};
