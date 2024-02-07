export type EmailVerificationNotificationProps = {
  name: string;
  link: string;
  company: string;
};

export function emailVerificationNotification(
  props: EmailVerificationNotificationProps
): string {
  return `
    <h2>Verify Your Email</h2>
    <h3>Hi ${props.name}</h3>
    <p>Thanks for joining us! To complete your registration, please click the link below to verify your email</p>
    <a href="${props.link}" >Verify</a>
    <br/>
    <h4>Thanks,<br/>${props.company}</h4>
    `;
}
