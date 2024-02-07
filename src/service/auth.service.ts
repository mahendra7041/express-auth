import { User } from "@prisma/client";
import { emailVerificationNotification } from "../mails/email-verification-notification";
import { MailTransporter, temporarySignedRoute } from "../util/helper";
import crypto from "crypto";
import { emailVerificationConfig } from "../config/email-verification.config";

export class AuthService {
  public static async sendEmailVerificationNotification(
    data: Omit<User, "password">
  ) {
    const hash = crypto.createHash("sha1").update(data.email).digest("hex");

    const link = temporarySignedRoute(
      emailVerificationConfig.emailVerificationLinkBasePath(data.id, hash),
      new Date(
        Date.now() + emailVerificationConfig.emailVerificationLinkExpiryInMS
      ),
      {
        successRedirect:
          emailVerificationConfig.emailVerificationSuccessRedirectUrl,
        failedRedirect:
          emailVerificationConfig.emailVerificationFailedRedirectUrl,
      }
    );

    return await MailTransporter.sendMail({
      from: `"Fred Foo 👻" <${process.env.MAIL_SENDER}>`,
      to: data.email,
      subject: "Verify Your Email",
      html: emailVerificationNotification({
        name: data.name,
        link,
        company: process.env.COMPANY_NAME
          ? process.env.COMPANY_NAME
          : "My Company",
      }),
    });
  }
}
