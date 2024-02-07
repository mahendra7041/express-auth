import { Errback, NextFunction, Request, Response } from "express";
import { HttpStatus } from "../constraints/http-status.enum";

export function globalExceptionHandler(
  error: Errback,
  req: Request,
  res: Response,
  next: NextFunction
) {
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    message: "Internal Server Error",
    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  });
}
