import express, { NextFunction, Request, Response, Router } from "express";
import { IController } from "../../constraints/controller";
import { validate } from "../../util/validate";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { User } from "@prisma/client";
import passport from "./passport.init";
import { HttpException } from "../../exception/http.exception";
import { HttpStatus } from "../../constraints/http-status.enum";
import { prisma } from "../../prisma/prisma.service";
import { excludeFields } from "../../util/helper";
import bcrypt from "bcryptjs";
import { UnAuthorizedException } from "../../exception/unauthorized.exception";
import { AuthService } from "../../service/auth.service";
import { signedRouteVerify } from "../../middleware/signed-route-verify.middleware";

class AuthController implements IController {
  public readonly router: Router;
  public readonly prefix: string = "/auth";

  constructor() {
    this.router = express.Router();
    this.initializeRouter();
  }

  private initializeRouter() {
    this.router.post("/user", this.user);
    this.router.post("/register", this.register);
    this.router.post("/login", this.login);
    this.router.delete("/logout", this.logout);
    this.router.post(
      "/email/verification-notification",
      this.sendEmailVerificationNotification
    );
    this.router.get(
      "/verify-email/:id/:hash",
      signedRouteVerify,
      this.verifyEmail
    );
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = validate<Pick<User, "name" | "email" | "password">>(
        req.body,
        {
          name: "required|string",
          email: "required|email",
          password: "required|confirmed|min:8",
        }
      );

      const password = bcrypt.hashSync(
        validated.password,
        bcrypt.genSaltSync(10)
      );

      const user = await prisma.user.create({
        data: { ...validated, password },
      });

      req.logIn(excludeFields(user, ["password"]), (err) => {
        if (err) {
          throw new HttpException(
            "Internal Server Error",
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }

        return res.status(201).json({
          message: "User signup successfully",
          statusCode: 201,
        });
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return res.status(422).json({
          message: "Validation Exception",
          errors: {
            email: ["Email address has already been taken"],
          },
        });
      }
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      validate<{ username: string; password: string }>(req.body, {
        username: "required|email",
        password: "required",
      });

      passport.authenticate(
        "local",
        function (error: any, user: User, info: any) {
          if (
            error instanceof PrismaClientKnownRequestError ||
            error === true
          ) {
            return res.status(404).json({
              message: "invalid credential",
              statusCode: 404,
            });
          }

          if (error) {
            return res.status(500).json({
              message: "Internal Server Error",
              statusCode: 500,
            });
          }

          req.logIn(user, (err) => {
            if (err) {
              return res.status(500).json({
                message: "Internal Server Error",
                statusCode: 500,
              });
            }

            return res.status(200).json({
              message: "User login successfully",
              statusCode: 200,
            });
          });
        }
      )(req, res, next);
    } catch (error) {
      next(error);
    }
  }

  logout(req: Request, res: Response) {
    req.logout(() => {
      req.session.destroy(function () {});
    });

    res.status(HttpStatus.NO_CONTENT).json({});
  }

  async sendEmailVerificationNotification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (req.isUnauthenticated() || !req.user) {
        throw new UnAuthorizedException();
      }

      await AuthService.sendEmailVerificationNotification(req.user);

      res.json({
        message: "Your email verification link has been sent",
        statusCode: HttpStatus.OK,
      });
    } catch (error) {
      res.status(HttpStatus.BAD_GATEWAY).json({
        message: "Bad Gateway",
        statusCode: HttpStatus.BAD_GATEWAY,
      });
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.user.update({
        where: {
          id: 5,
        },
        data: {
          email_verified_at: new Date(),
        },
      });

      res.redirect(`${req.query.successRedirect}`);
    } catch (error) {
      next(error);
    }
  }

  user(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.isUnauthenticated()) {
        throw new UnAuthorizedException();
      }
      return res.json(req.user);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
