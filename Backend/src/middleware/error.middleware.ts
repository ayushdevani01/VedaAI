import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}

export function globalErrorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  console.error(`[Error] ${statusCode} – ${message}`);
  if (statusCode === 500) console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

export function notFound(_req: Request, _res: Response, next: NextFunction): void {
  const err: AppError = new Error("Route not found");
  err.statusCode = 404;
  next(err);
}
