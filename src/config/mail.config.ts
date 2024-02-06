import SMTPTransport from "nodemailer/lib/smtp-transport";

export const mailConfig: SMTPTransport.Options = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT ? +process.env.MAIL_PORT : 25,
  secure: process.env.MAIL_SECURE == "true" ? true : false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
};
