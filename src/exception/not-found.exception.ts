import { HttpStatus } from "../constraints/http-status.enum";
import { HttpException } from "./http.exception";

export class NotFoundException extends HttpException {
  constructor() {
    super("Not Found", HttpStatus.NOT_FOUND);
  }
}
