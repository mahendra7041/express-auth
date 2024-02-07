import { NextFunction, Request, Response } from "express";
import { UnAuthorizedException } from "../exception/unauthorized.exception";

export function auth(req: Request, res: Response, next: NextFunction) {
  if (req.isUnauthenticated()) {
    return next(new UnAuthorizedException());
  }
  next();
}
