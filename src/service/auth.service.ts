import { User } from "@prisma/client";
import { emailVerificationNotification } from "../mails/email-verification-notification";
import { MailTransporter, temporarySignedRoute } from "../util/helper";
import crypto from "crypto";
import { emailVerificationConfig } from "../config/email-verification.config";
import { PasswordResetService } from "./password-reset.service";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma/prisma.service";
import { HttpException } from "../exception/http.exception";
import { BadRequest } from "../exception/bad-request.exception";
export class AuthService {
  private readonly passwordResetService: PasswordResetService;

  constructor() {
    this.passwordResetService = new PasswordResetService();
  }
  async sendEmailVerificationNotification(data: Omit<User, "password">) {
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

  async forgotPassword(email: string) {
    return await this.passwordResetService.sendPasswordResetLink(email);
  }

  async resetPassword(data: {
    token: string;
    password: string;
    email: string;
  }) {
    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: {
        email: data.email,
      },
    });

    if (
      !passwordResetToken ||
      !bcrypt.compareSync(data.token, passwordResetToken.token)
    ) {
      throw new BadRequest();
    }

    const password = bcrypt.hashSync(data.password, bcrypt.genSaltSync(10));

    await prisma.user.update({
      where: {
        email: data.email,
      },
      data: {
        password,
      },
    });

    return await prisma.passwordResetToken.delete({
      where: {
        email: data.email,
      },
    });
  }
}
