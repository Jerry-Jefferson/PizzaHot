export function emailVerificationTemplate(data, backendUrl) {
    const token = typeof data.verificationToken === "string" ? data.verificationToken : "";
    const name = typeof data.name === "string" ? data.name : "there";
    const baseUrl = backendUrl.replace(/\/+$/, "");
    const apiPrefix = baseUrl.endsWith("/api") ? "" : "/api";
    const acceptLink = `${baseUrl}${apiPrefix}/auth/verify-email/accept?token=${encodeURIComponent(token)}`;
    const declineLink = `${baseUrl}${apiPrefix}/auth/verify-email/decline?token=${encodeURIComponent(token)}`;
    return {
        subject: "Verify your PizzaHot email",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h1 style="color: #e53e3e; margin-bottom: 8px;">PizzaHot Email Verification 🍕</h1>
        <p style="font-size: 16px;">Hello ${name},</p>
        <p style="font-size: 14px; line-height: 1.5;">
          Thank you for signing up for PizzaHot! Please confirm whether you want to verify this email address for your account.
        </p>
        <p style="font-size: 13px; color: #718096;">
          This verification link will expire in 30 minutes.
        </p>

        <div style="margin: 30px 0; display: flex; gap: 15px;">
          <a href="${acceptLink}"
             style="display: inline-block; background-color: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; margin-right: 12px;">
            ✅ Accept &amp; Verify Email
          </a>
          <a href="${declineLink}"
             style="display: inline-block; background-color: #e2e8f0; color: #4a5568; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px;">
            ❌ Decline Verification
          </a>
        </div>

        <div style="font-size: 12px; color: #718096; margin-top: 24px; line-height: 1.6;">
          <p style="margin-bottom: 4px;">Direct Accept link:</p>
          <p style="word-break: break-all; margin-top: 0;"><a href="${acceptLink}" style="color: #3182ce;">${acceptLink}</a></p>
          <p style="margin-bottom: 4px;">Direct Decline link:</p>
          <p style="word-break: break-all; margin-top: 0;"><a href="${declineLink}" style="color: #718096;">${declineLink}</a></p>
        </div>

        <hr style="border: none; border-top: 1px solid #edf2f7; margin: 24px 0;" />
        <p style="color: #a0aec0; font-size: 12px;">
          If you did not create a PizzaHot account, you can safely decline or ignore this email.
        </p>
      </div>
    `,
    };
}
//# sourceMappingURL=email-verification.template.js.map