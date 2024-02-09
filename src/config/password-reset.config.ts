export const passwordResetConfig = {
  passwordResetLinkFrontendUrl: (token: string, email: string) =>
    `${process.env.FRONTEND_URL}/auth/reset-password/${token}?email=${email}`,
};
