import { Errback, NextFunction, Request, Response } from "express";
import Validator from "validatorjs";

export class ValidationException extends Error {
  private cause: any;

  constructor(message: string, errors: Validator.Errors) {
    super(message);
    this.cause = errors;
    this.message = message;
  }

  get errors() {
    return this.cause;
  }

  get response() {
    return {
      message: this.message,
      errors: this.cause.errors,
    };
  }

  public static handler(
    error: Errback,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (error instanceof ValidationException) {
      return res.status(422).json(error.response);
    }
    next(error);
  }
}
