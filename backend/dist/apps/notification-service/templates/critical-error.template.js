export function criticalErrorTemplate(data) {
    const errorMessage = typeof data.message === "string" ? data.message : "Unknown error";
    const timestamp = typeof data.timestamp === "string" ? data.timestamp : new Date().toISOString();
    const path = typeof data.path === "string" ? data.path : "N/A";
    const errorType = typeof data.errorType === "string" ? data.errorType : "Unknown";
    const statusCode = typeof data.statusCode === "number" || typeof data.statusCode === "string"
        ? String(data.statusCode)
        : "N/A";
    return {
        subject: "Critical PizzaHot system error",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #e53e3e;">⚠️ Critical System Error</h1>
        <p>A critical error occurred in the PizzaHot application:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f7f7f7;">Error Type</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${errorType}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f7f7f7;">Status Code</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${statusCode}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f7f7f7;">Message</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${errorMessage}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f7f7f7;">Request Path</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${path}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f7f7f7;">Timestamp</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${timestamp}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #888; font-size: 12px;">This is an automated error notification from PizzaHot.</p>
      </div>
    `,
    };
}
//# sourceMappingURL=critical-error.template.js.map