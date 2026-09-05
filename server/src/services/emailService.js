import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationEmail(email, username, otp) {
  const mailOptions = {
    from: `"DataTowel" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify your DataTowel account",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #171717; font-size: 20px; margin-bottom: 8px;">DataTowel</h2>
        <p style="color: #6F6F69; font-size: 14px; margin-bottom: 32px;">Hi ${username}, verify your email to get started.</p>
        <div style="background: #FAFAF7; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 32px;">
          <p style="color: #6F6F69; font-size: 13px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Your verification code is</p>
          <p style="color: #171717; font-size: 32px; font-weight: 700; letter-spacing: 0.15em; margin: 0;">${otp}</p>
        </div>
        <p style="color: #96958D; font-size: 12px; line-height: 1.6;">This code expires in 10 minutes.<br/>If you didn't create this account, you can ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
