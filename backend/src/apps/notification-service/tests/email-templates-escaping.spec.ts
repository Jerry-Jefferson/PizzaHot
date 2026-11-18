import { describe, it, expect } from "@jest/globals";
import { accountRegisteredTemplate } from "../templates/account-registered.template.ts";
import { criticalErrorTemplate } from "../templates/critical-error.template.ts";
import { emailVerificationTemplate } from "../templates/email-verification.template.ts";
import { escapeHtml } from "../templates/escape-html.util.ts";

const MALICIOUS_NAME = '<a href="https://evil.example">Verify now</a>';
const ESCAPED_NAME = "&lt;a href=&quot;https://evil.example&quot;&gt;Verify now&lt;/a&gt;";

describe("escapeHtml", () => {
  it("escapes every HTML-significant character", () => {
    expect(escapeHtml(`<b>"Tom" & 'Jerry'</b>`)).toBe(
      "&lt;b&gt;&quot;Tom&quot; &amp; &#39;Jerry&#39;&lt;/b&gt;"
    );
  });

  it("leaves plain text untouched", () => {
    expect(escapeHtml("Anna")).toBe("Anna");
  });
});

describe("email templates escape user-controlled values", () => {
  it("escapes the name in the welcome email", () => {
    const { html } = accountRegisteredTemplate({ name: MALICIOUS_NAME });

    expect(html).toContain(`Hi ${ESCAPED_NAME},`);
    expect(html).not.toContain('https://evil.example"');
  });

  it("escapes the name in the verification email", () => {
    const { html } = emailVerificationTemplate(
      { name: MALICIOUS_NAME, verificationToken: "token" },
      "http://localhost:3000"
    );

    expect(html).toContain(`Hello ${ESCAPED_NAME},`);
    expect(html).not.toContain('<a href="https://evil.example">');
  });

  it("escapes the request path and message in the critical error email", () => {
    const { html } = criticalErrorTemplate({
      message: "<script>alert(1)</script>",
      path: '/api/pizzas?q="><img src=x>',
      errorType: "Error",
      statusCode: 500,
      timestamp: "2026-11-18T00:00:00.000Z",
    });

    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).toContain("/api/pizzas?q=&quot;&gt;&lt;img src=x&gt;");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img src=x>");
  });
});
