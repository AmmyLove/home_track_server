import nodemailer from "nodemailer";
import net from "node:net";
import dns from "node:dns";
import dotenv from "dotenv";
dotenv.config();

// ── Validate that env vars are set ───────────────────────────────
// This catches missing credentials early with a clear error message
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn("⚠️  EMAIL_USER or EMAIL_PASS not set — emails will fail.");
}

// ── Create the transporter ────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",       // ← explicit host instead of service:"gmail"
  port: 465,                    // ← 465 for SSL, more reliable than 587
  secure: true,                 // ← true for port 465
   // ✅ Force IPv4 resolution manually
    getSocket: (options, callback) => {
    dns.lookup(options.host, { family: 4 }, (err, address) => {
      if (err) return callback(err);

      const socket = net.connect({
        host: address,
        port: options.port,
      });

      callback(null, socket);
    });
  },


  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});



// ── Verify connection on startup ──────────────────────────────────
// This logs a clear message so you know immediately if email works
transporter.verify((error) => {
  if (error) {
    console.error("❌ Email transporter error:", error.message);
  } else {
    console.log("✅ Email service ready — connected to Gmail");
  }
});

// ── Shared email wrapper ──────────────────────────────────────────
const emailWrapper = (content) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  </head>
  <body style="margin:0;padding:0;background:#fdf6e3;font-family:Georgia,serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf6e3;padding:40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width:520px;background:#fff9f0;border:2px solid #f5e6c8;border-radius:24px;padding:40px 36px;box-sizing:border-box;">

            <tr>
              <td style="padding-bottom:28px;border-bottom:2px solid #f5e6c8;">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width:40px;height:40px;background:#ff6b6b;border-radius:50%;text-align:center;vertical-align:middle;font-size:20px;border:2px solid #ffaaaa;">
                      🏡
                    </td>
                    <td style="padding-left:12px;">
                      <div style="font-size:18px;font-weight:700;color:#3d2b1f;">HomeTrack</div>
                      <div style="font-size:11px;color:#b8956a;font-style:italic;">your little home helper</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding-top:28px;">
                ${content}
              </td>
            </tr>

            <tr>
              <td style="padding-top:28px;border-top:2px dashed #f5e6c8;text-align:center;">
                <p style="font-size:11px;color:#d6c4a8;font-style:italic;margin:0;">
                  This email was sent by HomeTrack. Please do not reply to this email.
                </p>
                <p style="font-size:11px;color:#d6c4a8;font-style:italic;margin:6px 0 0;">
                  Built with 🌿 and lots of jollof rice.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
`;

// ── Send OTP verification email ───────────────────────────────────
export const sendOTPEmail = async (to, name, otp) => {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#3d2b1f;margin:0 0 8px;">
      Welcome to HomeTrack! 🌸
    </h1>
    <p style="font-size:13px;color:#b8956a;font-style:italic;margin:0 0 24px;">
      You're almost there. Verify your email to get started.
    </p>
    <p style="font-size:14px;color:#3d2b1f;line-height:1.7;margin:0 0 24px;">
      Hi ${name}! Here is your one-time verification code:
    </p>
    <div style="background:#fff0f0;border:2px solid #ffb3b3;border-radius:18px;padding:24px;text-align:center;margin:0 0 24px;">
      <div style="font-size:38px;font-weight:800;color:#ff6b6b;letter-spacing:12px;font-family:system-ui,sans-serif;">
        ${otp}
      </div>
      <p style="font-size:12px;color:#b8956a;font-style:italic;margin:10px 0 0;">
        This code expires in 10 minutes.
      </p>
    </div>
    <p style="font-size:13px;color:#b8956a;line-height:1.7;margin:0;">
      If you didn't create a HomeTrack account, you can safely ignore this email. 🌿
    </p>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"HomeTrack" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject: "Your HomeTrack verification code 🏡",
      html: emailWrapper(content),
    });
    console.log("✅ OTP email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Failed to send OTP email:", err.message);
    throw err; // re-throw so the controller can catch it
  }
};

// ── Send password reset email ─────────────────────────────────────
export const sendPasswordResetEmail = async (to, name, otp) => {
  const content = `
    <h1 style="font-size:22px;font-weight:700;color:#3d2b1f;margin:0 0 8px;">
      Reset your password 🔑
    </h1>
    <p style="font-size:13px;color:#b8956a;font-style:italic;margin:0 0 24px;">
      No worries — it happens to all of us!
    </p>
    <p style="font-size:14px;color:#3d2b1f;line-height:1.7;margin:0 0 24px;">
      Hi ${name}! Here is your password reset code:
    </p>
    <div style="background:#f0f4ff;border:2px solid #b3c9f0;border-radius:18px;padding:24px;text-align:center;margin:0 0 24px;">
      <div style="font-size:38px;font-weight:800;color:#3b6fc4;letter-spacing:12px;font-family:system-ui,sans-serif;">
        ${otp}
      </div>
      <p style="font-size:12px;color:#b8956a;font-style:italic;margin:10px 0 0;">
        This code expires in 10 minutes.
      </p>
    </div>
    <p style="font-size:13px;color:#b8956a;line-height:1.7;margin:0;">
      If you didn't request a password reset, you can safely ignore this email. Your password will not change. 🌿
    </p>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"HomeTrack" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject: "Reset your HomeTrack password 🔑",
      html: emailWrapper(content),
    });
    console.log("✅ Reset email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Failed to send reset email:", err.message);
    throw err;
  }
};