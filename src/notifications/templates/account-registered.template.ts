export interface EmailTemplate {
  subject: string;
  html: string;
}

export function accountRegisteredTemplate(data: Record<string, unknown>): EmailTemplate {
  const name = typeof data.name === "string" ? data.name : "there";

  return {
    subject: "Welcome to PizzaHot!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #e53e3e;">Welcome to PizzaHot! 🍕</h1>
        <p>Hi ${name},</p>
        <p>Your account has been successfully created. We're excited to have you on board!</p>
        <p>You can now browse our menu.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #888; font-size: 12px;">This is an automated message from PizzaHot. Please do not reply.</p>
      </div>
    `,
  };
}
