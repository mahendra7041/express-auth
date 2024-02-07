import { HttpStatus } from "../constraints/http-status.enum";
import { HttpException } from "./http.exception";

export class BadRequest extends HttpException {
  constructor() {
    super("Bad request", HttpStatus.BAD_REQUEST);
  }
}
