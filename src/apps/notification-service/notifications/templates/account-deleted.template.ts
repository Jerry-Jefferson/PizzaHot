import type { EmailTemplate } from "./account-registered.template.ts";

export function accountDeletedTemplate(): EmailTemplate {
  return {
    subject: "Your PizzaHot account has been deleted",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #e53e3e;">Account Deleted</h1>
        <p>Your PizzaHot account has been successfully deleted.</p>
        <p>All your personal data has been removed from our system.</p>
        <p>If you did not request this action, please contact our support team immediately.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #888; font-size: 12px;">This is an automated message from PizzaHot. Please do not reply.</p>
      </div>
    `,
  };
}
