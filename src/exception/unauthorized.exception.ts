import { HttpStatus } from "../constraints/http-status.enum";
import { HttpException } from "./http.exception";

export class UnAuthorizedException extends HttpException {
  constructor() {
    super("Unauthorized", HttpStatus.UNAUTHORIZED);
  }
}
