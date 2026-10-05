const nodemailer = require('nodemailer');

const BRAND = {
  name: 'SugarWise',
  primary: '#2DA1D7',
  accent: '#8EC641',
  bg: '#F4F8FB',
  text: '#142033',
  muted: '#6B7280',
};

const getTransportConfig = () => {
  const host = process.env.SMTP_HOST || '';
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;

  if (!host || !user || !pass) return null;

  return {
    host,
    port,
    secure,
    auth: { user, pass },
  };
};

let transporterCache = null;

const getTransporter = () => {
  if (transporterCache) return transporterCache;
  const config = getTransportConfig();
  if (!config) return null;
  transporterCache = nodemailer.createTransport(config);
  return transporterCache;
};

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const buildOtpEmailTemplate = ({ recipientName, otp, roleLabel }) => {
  const safeName = escapeHtml(recipientName || roleLabel || 'SugarWise User');
  const safeRole = escapeHtml(roleLabel || 'Account');
  const safeOtp = escapeHtml(otp);

  return `
  <div style="margin:0;padding:32px 16px;background:${BRAND.bg};font-family:Arial,'Segoe UI',sans-serif;color:${BRAND.text};">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 24px 60px rgba(20,32,51,0.10);">
      <div style="padding:28px 32px;background:linear-gradient(135deg, ${BRAND.primary}, ${BRAND.accent});color:#ffffff;">
        <div style="font-size:30px;font-weight:800;letter-spacing:-0.03em;">${BRAND.name}</div>
        <div style="margin-top:6px;font-size:13px;opacity:0.92;letter-spacing:0.12em;text-transform:uppercase;">Secure Verification</div>
      </div>
      <div style="padding:32px;">
        <div style="display:inline-block;padding:8px 14px;border-radius:999px;background:rgba(45,161,215,0.10);color:${BRAND.primary};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${safeRole}</div>
        <h1 style="margin:18px 0 12px;font-size:28px;line-height:1.2;color:${BRAND.text};">Your verification code is ready</h1>
        <p style="margin:0 0 16px;font-size:16px;line-height:1.8;color:${BRAND.muted};">Hello ${safeName}, use the OTP below to continue resetting your password securely inside your ${BRAND.name} account.</p>
        <div style="margin:28px 0;padding:24px;border-radius:24px;background:linear-gradient(135deg, rgba(45,161,215,0.10), rgba(142,198,65,0.12));text-align:center;border:1px solid rgba(45,161,215,0.10);">
          <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:${BRAND.muted};font-weight:700;">One-Time Password</div>
          <div style="margin-top:12px;font-size:42px;font-weight:900;letter-spacing:0.28em;color:${BRAND.text};">${safeOtp}</div>
        </div>
        <p style="margin:0 0 12px;font-size:15px;line-height:1.8;color:${BRAND.muted};">This code expires in 10 minutes and can be used once only.</p>
        <p style="margin:0;font-size:15px;line-height:1.8;color:${BRAND.muted};">If you did not request this code, you can safely ignore this email.</p>
      </div>
      <div style="padding:20px 32px;background:#F9FBFD;border-top:1px solid rgba(20,32,51,0.06);font-size:13px;line-height:1.8;color:${BRAND.muted};">
        This email was sent by ${BRAND.name}. Keep your OTP private and never share it with anyone.
      </div>
    </div>
  </div>`;
};

const sendOtpEmail = async ({ to, recipientName, otp, roleLabel }) => {
  const transporter = getTransporter();
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || '';
  const fromName = process.env.SMTP_FROM_NAME || BRAND.name;
  const subject = `${BRAND.name} verification code`;
  const html = buildOtpEmailTemplate({ recipientName, otp, roleLabel });

  if (!transporter || !fromEmail) {
    console.log(`[email fallback] OTP for ${to}: ${otp}`);
    return { delivered: false, fallback: true };
  }

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
    text: `Your ${BRAND.name} OTP is ${otp}. It expires in 10 minutes.`,
  });

  return { delivered: true };
};

module.exports = {
  sendOtpEmail,
};
