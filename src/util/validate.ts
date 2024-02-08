import Validator from "validatorjs";
import { ValidationException } from "../exception/validation.exception";

export function validate<T extends {}>(
  body: T,
  rules: Record<keyof T, string>,
  customMessages: Validator.ErrorMessages = {}
): T {
  const validator = new Validator(body, rules, customMessages);

  if (validator.fails()) {
    throw new ValidationException("Validation Exception", validator.errors);
  }
  const whiteListKeys = <(keyof T)[]>Object.keys(rules);

  const whitelistObject: T = {} as T;

  whiteListKeys.forEach((key) => {
    if (key in body) {
      Object.assign(whitelistObject, { [key]: body[key] });
    }
  });

  return whitelistObject;
}
