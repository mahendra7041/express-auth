import { MailTransporter } from "../util/helper";

export class AuthService {
  public static async sendEmailVerificationNotification(email: string) {
    return await MailTransporter.sendMail({
      from: `"Fred Foo 👻" <${process.env.MAIL_SENDER}>`,
      to: email,
      subject: "Please verify your email", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
  }
}
