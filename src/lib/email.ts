const defaultBaseUrl = "http://localhost:3000";

function getBaseUrl() {
  return process.env.APP_URL?.replace(/\/$/, "") ?? defaultBaseUrl;
}

async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const from = process.env.EMAIL_FROM;
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey && from) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text
      }),
      cache: "no-store"
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend failed: ${response.status} ${body}`);
    }

    return { delivered: true as const };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Email delivery is not configured.");
  }

  console.log(`\n[auth-email] ${input.subject}\nTo: ${input.to}\n${input.text}\n`);
  return { delivered: true as const };
}

export async function sendVerificationEmail(input: {
  email: string;
  displayName: string;
  token: string;
}) {
  const verifyUrl = `${getBaseUrl()}/auth/verify?token=${encodeURIComponent(input.token)}`;

  return sendEmail({
    to: input.email,
    subject: "Verify your KrowdCall account",
    text: `Hi ${input.displayName}, verify your email to activate your account: ${verifyUrl}`,
    html: `<p>Hi ${input.displayName},</p><p>Verify your email to activate your account.</p><p><a href="${verifyUrl}">Verify account</a></p><p>If you did not create this account, ignore this email.</p>`
  });
}

export async function sendPasswordResetEmail(input: {
  email: string;
  displayName: string;
  token: string;
}) {
  const resetUrl = `${getBaseUrl()}/auth/reset?token=${encodeURIComponent(input.token)}`;

  return sendEmail({
    to: input.email,
    subject: "Reset your KrowdCall password",
    text: `Hi ${input.displayName}, use this link to reset your password: ${resetUrl}`,
    html: `<p>Hi ${input.displayName},</p><p>Use the link below to reset your password.</p><p><a href="${resetUrl}">Reset password</a></p><p>If you did not request this, ignore this email.</p>`
  });
}
