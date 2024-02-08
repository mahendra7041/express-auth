export const passwordResetConfig = {
  passwordResetLinkFrontendUrl: (token: string) =>
    `${process.env.FRONTEND_URL}/auth/reset-password/${token}`,
  passwordResetLinkExpireInMinute: 60,
};
