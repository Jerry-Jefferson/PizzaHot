import { describe, it, expect } from "@jest/globals";
import { emailVerificationTemplate } from "../templates/email-verification.template.ts";

describe("emailVerificationTemplate", () => {
  const backendUrl = "http://localhost:3000";

  it("should generate accept and decline verification links with token", () => {
    const template = emailVerificationTemplate(
      {
        verificationToken: "sample-token-abc",
        name: "Alice",
      },
      backendUrl
    );

    expect(template.subject).toBe("Verify your PizzaHot email");
    expect(template.html).toContain("Hello Alice");
    expect(template.html).toContain(
      "http://localhost:3000/api/auth/verify-email/accept?token=sample-token-abc"
    );
    expect(template.html).toContain(
      "http://localhost:3000/api/auth/verify-email/decline?token=sample-token-abc"
    );
    expect(template.html).toContain("30 minutes");
  });

  it("should handle missing name gracefully", () => {
    const template = emailVerificationTemplate(
      {
        verificationToken: "xyz123",
      },
      backendUrl
    );

    expect(template.html).toContain("Hello there");
    expect(template.html).toContain(
      "http://localhost:3000/api/auth/verify-email/accept?token=xyz123"
    );
  });
});
