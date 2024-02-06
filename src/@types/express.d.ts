import { User as UserModelType } from "@prisma/client";

declare global {
  namespace Express {
    export interface User extends Omit<UserModelType, "password"> {}
  }
}
