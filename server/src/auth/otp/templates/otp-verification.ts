/**
 * Professional minimal OTP email template
 * Palette adapted from provided design tokens
 */
export function formatOtpEmail(otpCode: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Verification</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#f8fafc;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
  color:#1f2937;
">

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:40px 16px;">
  <tr>
    <td align="center">

      <!-- CARD -->
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="
        max-width:100%;
        background:#ffffff;
        border:1px solid #e5e7eb;
        border-radius:12px;
        box-shadow:0 4px 12px rgba(0,0,0,0.05);
      ">

        <!-- HEADER -->
        <tr>
          <td style="padding:24px 28px;border-bottom:1px solid #e5e7eb;">
            <h1 style="
              margin:0;
              font-size:18px;
              font-weight:600;
              letter-spacing:0.2px;
              color:#111827;
            ">
              CodeNotify
            </h1>
          </td>
        </tr>

        <!-- CONTENT -->
        <tr>
          <td style="padding:32px 28px;">

            <h2 style="
              margin:0 0 10px;
              font-size:20px;
              font-weight:600;
              color:#0f172a;
            ">
              Verify your email
            </h2>

            <p style="
              margin:0 0 28px;
              font-size:15px;
              line-height:1.6;
              color:#64748b;
            ">
              Use the verification code below to complete your sign-in.
            </p>

            <!-- OTP BOX -->
            <div style="
              text-align:center;
              padding:24px;
              border-radius:10px;
              background:#f1f5f9;
              border:1px solid #e2e8f0;
              margin-bottom:28px;
            ">
              <p style="
                margin:0 0 6px;
                font-size:12px;
                color:#64748b;
                text-transform:uppercase;
                letter-spacing:1.2px;
              ">
                Verification Code
              </p>

              <p style="
                margin:0;
                font-size:34px;
                font-weight:700;
                letter-spacing:8px;
                color:#b45309;
                font-family:ui-monospace,Menlo,Monaco,'JetBrains Mono',monospace;
              ">
                ${otpCode}
              </p>
            </div>

            <p style="
              margin:0 0 14px;
              font-size:14px;
              color:#334155;
            ">
              This code expires in <strong>10 minutes</strong>.
            </p>

            <p style="
              margin:0;
              font-size:13px;
              line-height:1.6;
              color:#94a3b8;
            ">
              If you didn’t request this email, you can safely ignore it.
            </p>

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="
            padding:20px;
            border-top:1px solid #e5e7eb;
            text-align:center;
          ">
            <p style="
              margin:0;
              font-size:12px;
              color:#94a3b8;
            ">
              © ${new Date().getFullYear()} CodeNotify · All rights reserved
            </p>
          </td>
        </tr>

      </table>

    </td>
  </tr>
</table>

</body>
</html>
  `.trim();
}
