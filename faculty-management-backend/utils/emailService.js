require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send welcome email to newly created employee
 */
async function sendWelcomeEmail(employeeName, email, tempPassword) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const loginUrl = frontendUrl;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0; padding:0; background:#f4f6fb; font-family: 'Segoe UI', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb; padding:40px 0;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding:32px 40px; text-align:center;">
                  <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700; letter-spacing:-0.5px;">
                    Welcome to DeepSync
                  </h1>
                  <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">
                    Faculty Management System
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px 40px;">
                  <p style="margin:0 0 20px; color:#1e293b; font-size:16px; line-height:1.6;">
                    Hi <strong>${employeeName}</strong>,
                  </p>
                  <p style="margin:0 0 24px; color:#475569; font-size:14px; line-height:1.7;">
                    Your account has been created by the administrator. Below are your login credentials. Please use these to log in for the first time and <strong>change your password immediately</strong>.
                  </p>

                  <!-- Credentials Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; margin-bottom:28px;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:6px 0; color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Name</td>
                            <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${employeeName}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="border-bottom:1px solid #e2e8f0; padding:4px 0;"></td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Email</td>
                            <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${email}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="border-bottom:1px solid #e2e8f0; padding:4px 0;"></td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Temporary Password</td>
                            <td style="padding:6px 0; color:#dc2626; font-size:14px; font-weight:700; text-align:right; font-family:monospace; letter-spacing:1px;">${tempPassword}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${loginUrl}" target="_blank" style="display:inline-block; background:linear-gradient(135deg, #4f46e5, #6366f1); color:#ffffff; text-decoration:none; padding:14px 40px; border-radius:10px; font-size:15px; font-weight:600; letter-spacing:0.3px; box-shadow:0 4px 14px rgba(79,70,229,0.35);">
                          Login to Your Account &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Warning -->
                  <div style="margin-top:28px; padding:14px 18px; background:#fef3c7; border-left:4px solid #f59e0b; border-radius:8px;">
                    <p style="margin:0; color:#92400e; font-size:13px; line-height:1.6;">
                      ⚠️ <strong>Important:</strong> This is a temporary password. You must change it after your first login for security purposes.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px 28px; border-top:1px solid #f1f5f9; text-align:center;">
                  <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.6;">
                    This is an automated message from DeepSync Faculty Management System.<br/>
                    If you did not expect this email, please contact your administrator.
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

  try {
    const info = await transporter.sendMail({
      from: `"Khan Shoaib" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to DeepSync — Your Account Details",
      html,
    });

    console.log("✅ Welcome email sent to", email, "| MessageId:", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send welcome email to", email, ":", error.message);
  }
}

/**
 * Send email after employee changes their password
 */
async function sendPasswordChangedEmail(employeeName, email, newPassword) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0; padding:0; background:#f4f6fb; font-family: 'Segoe UI', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb; padding:40px 0;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #059669, #10b981); padding:32px 40px; text-align:center;">
                  <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">
                    ✅ Password Updated
                  </h1>
                  <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">
                    DeepSync Faculty Management
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px 40px;">
                  <p style="margin:0 0 20px; color:#1e293b; font-size:16px; line-height:1.6;">
                    Hi <strong>${employeeName}</strong>,
                  </p>
                  <p style="margin:0 0 24px; color:#475569; font-size:14px; line-height:1.7;">
                    Your password has been changed successfully. Here are your updated login details for your records:
                  </p>

                  <!-- Credentials Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; margin-bottom:28px;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:6px 0; color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Email</td>
                            <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${email}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="border-bottom:1px solid #bbf7d0; padding:4px 0;"></td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">New Password</td>
                            <td style="padding:6px 0; color:#059669; font-size:14px; font-weight:700; text-align:right; font-family:monospace; letter-spacing:1px;">${newPassword}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${frontendUrl}" target="_blank" style="display:inline-block; background:linear-gradient(135deg, #059669, #10b981); color:#ffffff; text-decoration:none; padding:14px 40px; border-radius:10px; font-size:15px; font-weight:600; letter-spacing:0.3px; box-shadow:0 4px 14px rgba(5,150,105,0.35);">
                          Login Now &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Note -->
                  <div style="margin-top:28px; padding:14px 18px; background:#eff6ff; border-left:4px solid #3b82f6; border-radius:8px;">
                    <p style="margin:0; color:#1e40af; font-size:13px; line-height:1.6;">
                      💡 <strong>Tip:</strong> Save this email for your records in case you forget your password in the future.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px 28px; border-top:1px solid #f1f5f9; text-align:center;">
                  <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.6;">
                    This is an automated message from DeepSync Faculty Management System.
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

  try {
    const info = await transporter.sendMail({
      from: `"Khan Shoaib" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Changed — Your Updated Login Details",
      html,
    });

    console.log("✅ Password change email sent to", email, "| MessageId:", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send password change email to", email, ":", error.message);
  }
}

/**
 * Send email when a new task is assigned to employee
 */
async function sendTaskAssignedEmail(employeeName, email, task) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const priorityColors = {
    Low: "#22c55e",
    Medium: "#f59e0b",
    High: "#f97316",
    Critical: "#ef4444",
  };
  const priorityColor = priorityColors[task.priority] || "#6366f1";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin:0; padding:0; background:#f4f6fb; font-family: 'Segoe UI', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb; padding:40px 0;">
        <tr>
          <td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #2563eb, #3b82f6); padding:32px 40px; text-align:center;">
                  <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">
                    📋 New Task Assigned
                  </h1>
                  <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">
                    DeepSync Faculty Management
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding:32px 40px;">
                  <p style="margin:0 0 20px; color:#1e293b; font-size:16px; line-height:1.6;">
                    Hi <strong>${employeeName}</strong>,
                  </p>
                  <p style="margin:0 0 24px; color:#475569; font-size:14px; line-height:1.7;">
                    A new task has been assigned to you by the administrator. Here are the details:
                  </p>

                  <!-- Task Details Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; margin-bottom:28px;">
                    <tr>
                      <td style="padding:20px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:6px 0; color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Task Title</td>
                            <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:700; text-align:right;">${task.taskTitle || "N/A"}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="border-bottom:1px solid #e2e8f0; padding:4px 0;"></td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Description</td>
                            <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${task.taskDescription || "N/A"}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="border-bottom:1px solid #e2e8f0; padding:4px 0;"></td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Deadline</td>
                            <td style="padding:6px 0; color:#dc2626; font-size:14px; font-weight:700; text-align:right;">${task.taskDate || "N/A"}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="border-bottom:1px solid #e2e8f0; padding:4px 0;"></td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Priority</td>
                            <td style="padding:6px 0; text-align:right;">
                              <span style="display:inline-block; background:${priorityColor}; color:#ffffff; padding:3px 12px; border-radius:20px; font-size:12px; font-weight:700; letter-spacing:0.5px;">${task.priority || "Medium"}</span>
                            </td>
                          </tr>
                          <tr>
                            <td colspan="2" style="border-bottom:1px solid #e2e8f0; padding:4px 0;"></td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0; color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Category</td>
                            <td style="padding:6px 0; color:#1e293b; font-size:14px; font-weight:600; text-align:right;">${task.category || "General"}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="${frontendUrl}" target="_blank" style="display:inline-block; background:linear-gradient(135deg, #2563eb, #3b82f6); color:#ffffff; text-decoration:none; padding:14px 40px; border-radius:10px; font-size:15px; font-weight:600; letter-spacing:0.3px; box-shadow:0 4px 14px rgba(37,99,235,0.35);">
                          View Task Details &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Note -->
                  <div style="margin-top:28px; padding:14px 18px; background:#eff6ff; border-left:4px solid #3b82f6; border-radius:8px;">
                    <p style="margin:0; color:#1e40af; font-size:13px; line-height:1.6;">
                      💡 <strong>Tip:</strong> Login to your dashboard to view full task details, attachments, and manage your task status.
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:20px 40px 28px; border-top:1px solid #f1f5f9; text-align:center;">
                  <p style="margin:0; color:#94a3b8; font-size:12px; line-height:1.6;">
                    This is an automated message from DeepSync Faculty Management System.
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

  try {
    const info = await transporter.sendMail({
      from: `"Khan Shoaib" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `New Task Assigned: ${task.taskTitle || "Task"}`,
      html,
    });

    console.log("✅ Task assignment email sent to", email, "| MessageId:", info.messageId);
  } catch (error) {
    console.error("❌ Failed to send task assignment email to", email, ":", error.message);
  }
}

module.exports = { sendWelcomeEmail, sendPasswordChangedEmail, sendTaskAssignedEmail };
