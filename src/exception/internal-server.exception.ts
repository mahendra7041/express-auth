import { HttpStatus } from "../constraints/http-status.enum";
import { HttpException } from "./http.exception";

export class InternalServerException extends HttpException {
  constructor() {
    super("Internal Serve Error", HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
