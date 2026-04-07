/**
 * Shared email template wrapper — matches proanswer.dev aesthetic (black/zinc/white)
 */

const LOGO = `
<table cellpadding="0" cellspacing="0" style="margin:0 auto;">
  <tr>
    <td style="width:36px;height:36px;background-color:#09090b;border-radius:10px;text-align:center;vertical-align:middle;">
      <span style="color:#ffffff;font-size:16px;font-weight:900;line-height:36px;">P</span>
    </td>
    <td style="padding-left:10px;">
      <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">ProAnswer</span>
    </td>
  </tr>
</table>`;

export function emailLayout({
  preheader = "",
  body,
}: {
  preheader?: string;
  body: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ProAnswer</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background-color:#09090b;padding:32px 40px;text-align:center;border-radius:16px 16px 0 0;">
              ${LOGO}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px 40px 36px;border-left:1px solid #e4e4e7;border-right:1px solid #e4e4e7;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#ffffff;padding:0 40px 32px;border-left:1px solid #e4e4e7;border-right:1px solid #e4e4e7;border-bottom:1px solid #e4e4e7;border-radius:0 0 16px 16px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="border-top:1px solid #f4f4f5;padding-top:24px;"></td></tr>
              </table>
              <p style="margin:0 0 4px;font-size:13px;color:#a1a1aa;text-align:center;">
                Questions? Reply to this email or visit <a href="https://proanswer.dev" style="color:#71717a;text-decoration:underline;">proanswer.dev</a>
              </p>
              <p style="margin:0;font-size:13px;color:#a1a1aa;text-align:center;">
                &copy; ${new Date().getFullYear()} ProAnswer &middot; Long Island, New York
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(text: string, href: string) {
  return `
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td align="center" style="padding:4px 0;">
      <a href="${href}" style="display:inline-block;background-color:#09090b;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;letter-spacing:0.2px;">
        ${text}
      </a>
    </td>
  </tr>
</table>`;
}

export function emailFeatureList(items: string[]) {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;border-radius:12px;border:1px solid #f4f4f5;margin-bottom:24px;">
  ${items
    .map(
      (item) => `
  <tr>
    <td style="padding:12px 20px;font-size:14px;color:#3f3f46;border-bottom:1px solid #f4f4f5;">
      <span style="color:#09090b;font-weight:600;">&#10003;</span>&nbsp;&nbsp;${item}
    </td>
  </tr>`
    )
    .join("")}
</table>`;
}
