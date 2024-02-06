import crypto from "crypto";
import qs from "qs";
import nodemailer from "nodemailer";
import { mailConfig } from "../config/mail.config";

export function excludeFields<
  T extends Record<string, any>,
  U extends Array<keyof T>
>(inputObject: T, excludedKeys: U): Omit<T, keyof U> {
  const result: Omit<T, keyof U> = {} as Omit<T, keyof U>;
  Object.keys(inputObject).forEach((key: keyof T) => {
    if (!excludedKeys.includes(key)) {
      Object.assign(result, { [key]: inputObject[key] });
    }
  });
  return result;
}

export function temporarySignedRoute(
  basePath: string,
  expiredAt: Date,
  queryParams?: { [kye: string]: string | number | boolean }
): string {
  console.log(process.env.APP_KEY);
  const hmac = crypto.createHmac("sha256", "secret");
  let url = `${basePath}?expires=${new Date(expiredAt).getTime()}`;
  if (queryParams) {
    const query = qs.stringify(queryParams);
    url += `&${query}`;
  }
  const signature = hmac.update(url).digest("hex");
  return `${url}&signature=${signature}`;
}

export const MailTransporter = nodemailer.createTransport(mailConfig);
