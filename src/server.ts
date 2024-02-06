import express, { Errback, Express } from "express";
import { createServer, Server as HTTPServer } from "http";
import cors from "cors";
import helmet from "helmet";
import { IController } from "./constraints/controller";
import { ValidationException } from "./exception/validation.exception";
import { HttpException } from "./exception/http.exception";
import passport from "passport";
import session from "express-session";

export class Server {
  private httpServer: HTTPServer;
  private app: Express;

  private readonly PORT = process.env.APP_PORT ? +process.env.APP_PORT : 5000;

  constructor(private readonly options: { controllers: IController[] }) {
    this.initialize();
    this.handleRoutes();
  }

  private initialize(): void {
    this.app = express();
    this.httpServer = createServer(this.app);
  }

  private handleRoutes(): void {
    this.app.disable("x-powered-by");
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.use(express.static("public"));
    this.app.use(
      session({
        secret: "secret",
        resave: false,
        saveUninitialized: true,
      })
    );
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    this.options.controllers.forEach((controller) => {
      let prefix = "/";
      if (controller.prefix) {
        prefix = controller.prefix;
      }
      this.app.use(prefix, controller.router);
    });

    this.app.use(ValidationException.handler);
    this.app.use(HttpException.handler);
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.PORT, () => callback(this.PORT));
  }
}
