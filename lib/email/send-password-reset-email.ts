import "server-only";

import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY
);

type SendPasswordResetEmailInput = {
  to: string;
  resetUrl: string;
};

export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: SendPasswordResetEmailInput) {
  const from = process.env.EMAIL_FROM;

  if (!from) {
    throw new Error(
      "EMAIL_FROM is not configured."
    );
  }

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Reset your password",
    html: `
      <!doctype html>
      <html lang="en">
        <body
          style="
            margin: 0;
            padding: 0;
            background: #f8fafc;
            font-family: Arial, sans-serif;
            color: #0f172a;
          "
        >
          <div
            style="
              max-width: 560px;
              margin: 0 auto;
              padding: 40px 20px;
            "
          >
            <div
              style="
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 32px;
              "
            >
              <h1
                style="
                  margin-top: 0;
                  font-size: 24px;
                "
              >
                Reset your password
              </h1>

              <p style="line-height: 1.6;">
                We received a request to reset the
                password for your Sales Management
                account.
              </p>

              <p style="margin: 28px 0;">
                <a
                  href="${resetUrl}"
                  style="
                    display: inline-block;
                    background: #059669;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                  "
                >
                  Reset password
                </a>
              </p>

              <p
                style="
                  color: #64748b;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                This link expires in 30 minutes.
                If you did not request a password
                reset, you can ignore this email.
              </p>

              <hr
                style="
                  border: 0;
                  border-top: 1px solid #e2e8f0;
                  margin: 28px 0;
                "
              />

              <p
                style="
                  color: #64748b;
                  font-size: 12px;
                  line-height: 1.6;
                "
              >
                If the button does not work, copy
                and paste this address into your
                browser:
              </p>

              <p
                style="
                  word-break: break-all;
                  font-size: 12px;
                "
              >
                ${resetUrl}
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    throw new Error(
      `Failed to send password reset email: ${error.message}`
    );
  }
}