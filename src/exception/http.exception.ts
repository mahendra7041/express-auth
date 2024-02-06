import { Errback, NextFunction, Request, Response } from "express";
import { HttpStatus } from "../constraints/http-status.enum";

export class HttpException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: HttpStatus
  ) {
    super(message);
  }

  public static handler(
    error: Errback,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (error instanceof HttpException) {
      return res.status(error.statusCode).json({
        message: error.message,
        statusCode: error.statusCode,
      });
    }
    next(error);
  }
}
