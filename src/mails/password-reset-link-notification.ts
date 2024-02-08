export type EmailVerificationNotificationProps = {
  name: string;
  link: string;
  company: string;
};

export function passwordResetLinkNotification(
  props: EmailVerificationNotificationProps
): string {
  return `
    <h2>Reset Password</h2>
    <h3>Hi ${props.name}</h3>
    <p>If you've forgotten your password, don't worry! Click the link below to reset it.</p>
    <a href="${props.link}" >Verify</a>
    <br/>
    <p>If you didn't request this reset, please ignore this email.</p>
    <br/>
    <h4>Best,<br/>${props.company}</h4>
    `;
}
