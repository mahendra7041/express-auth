import crypto from "crypto";
import { prisma } from "../prisma/prisma.service";
import bcrypt from "bcryptjs";
import { HttpException } from "../exception/http.exception";
import { HttpStatus } from "../constraints/http-status.enum";
import { MailTransporter } from "../util/helper";
import { passwordResetLinkNotification } from "../mails/password-reset-link-notification";
import { passwordResetConfig } from "../config/password-reset.config";

export class PasswordResetService {
  private readonly expiredIn =
    passwordResetConfig.passwordResetLinkExpireInMinute * 60 * 1000;

  public async sendPasswordResetLink(email: string) {
    const user = await this.validateEmail(email);

    if (!user) {
      throw new HttpException("Invalid email address", HttpStatus.BAD_REQUEST);
    }

    await this.deletePreviousToken(email);
    const token = await this.createToken(email);
    const link = passwordResetConfig.passwordResetLinkFrontendUrl(token);
    return await this.sendPasswordResetLinkEmail(email, link, user.name);
  }

  private async sendPasswordResetLinkEmail(
    email: string,
    link: string,
    name: string
  ) {
    return await MailTransporter.sendMail({
      from: `"Fred Foo 👻" <${process.env.MAIL_SENDER}>`,
      to: email,
      subject: "Reset Password",
      html: passwordResetLinkNotification({
        name,
        link,
        company: process.env.COMPANY_NAME
          ? process.env.COMPANY_NAME
          : "My Company",
      }),
    });
  }

  private async createToken(email: string) {
    const hmac = crypto.createHmac("sha256", `${process.env.APP_KEY}`);
    const randomBytes = crypto.randomBytes(64).toString("hex");
    const token = hmac.update(randomBytes).digest("hex");

    const hashToken = bcrypt.hashSync(token, bcrypt.genSaltSync(10));

    await prisma.passwordResetToken.create({
      data: {
        email,
        token: hashToken,
      },
    });

    return token;
  }

  private async validateEmail(email: string) {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async deletePreviousToken(email: string) {
    return await prisma.passwordResetToken.delete({
      where: {
        email,
      },
    });
  }
}
