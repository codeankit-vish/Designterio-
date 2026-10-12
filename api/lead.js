import nodemailer from 'nodemailer';

// Helper to safely load .env if available in local Node runtime
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {
    // Ignore if .env doesn't exist yet
  }
}

/**
 * Universal JSON response sender that supports Vercel, Express, and native Node HTTP.
 */
function sendJson(res, statusCode, data) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * Parse JSON body if not already parsed by middleware.
 */
async function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw.trim()) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

/**
 * Lead Handler: Sends enquiry email via Nodemailer
 */
export default async function handler(req, res) {
  // CORS Headers to allow requests from any local or hosted origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      return res.status(200).end();
    }
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, {
      success: false,
      error: `Method ${req.method} Not Allowed. Please send a POST request.`
    });
  }

  let body;
  try {
    body = await parseBody(req);
  } catch (err) {
    return sendJson(res, 400, { success: false, error: 'Malformed JSON payload' });
  }

  const {
    type = 'consultation',
    source = 'Website Form',
    name,
    phone,
    email,
    propertyType,
    area,
    preferredDate,
    message
  } = body;

  if (!name || !phone) {
    return sendJson(res, 400, {
      success: false,
      error: 'Client Name and Phone Number are required.'
    });
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailTo = process.env.EMAIL_TO || emailUser;
  const emailFrom = process.env.EMAIL_FROM || emailUser;

  if (!emailUser || !emailPass) {
    console.error('Email configuration missing in environment variables (EMAIL_USER / EMAIL_PASS).');
    return sendJson(res, 500, {
      success: false,
      error: 'Email service is not configured. Please set EMAIL_USER and EMAIL_PASS in your environment or .env file.'
    });
  }

  try {
    // Configure Nodemailer transporter (defaults to Gmail or custom SMTP)
    const transporter = process.env.SMTP_HOST
      ? nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: emailUser,
            pass: emailPass
          }
        })
      : nodemailer.createTransport({
          service: process.env.EMAIL_SERVICE || 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass
          }
        });

    // Formatted executive email layout matching Designterio luxury branding
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; margin: 0; padding: 24px; color: #e0e0e0; }
        .wrapper { max-width: 600px; margin: 0 auto; background: #16181f; border-radius: 12px; border: 1px solid #2a2d39; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #1f2330 0%, #0d0f14 100%); padding: 32px 28px; border-bottom: 2px solid #c5a880; text-align: center; }
        .brand-title { font-size: 22px; letter-spacing: 4px; color: #ffffff; margin: 0; font-weight: 700; text-transform: uppercase; }
        .brand-sub { font-size: 11px; letter-spacing: 2px; color: #c5a880; margin-top: 6px; text-transform: uppercase; }
        .content { padding: 32px 28px; }
        .badge { display: inline-block; background: rgba(197, 168, 128, 0.15); border: 1px solid #c5a880; color: #c5a880; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        .lead-card { background: #1f222d; border-radius: 8px; padding: 20px; margin-bottom: 20px; border: 1px solid #2e3344; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #292e3d; }
        .row:last-child { border-bottom: none; }
        .label { color: #8f95a5; font-size: 13px; font-weight: 500; }
        .val { color: #ffffff; font-size: 14px; font-weight: 600; text-align: right; }
        .val a { color: #c5a880; text-decoration: none; }
        .message-box { background: #12141a; border-left: 3px solid #c5a880; padding: 14px 16px; border-radius: 4px; color: #d0d2db; font-size: 14px; line-height: 1.6; margin-top: 15px; }
        .footer { background: #101217; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #1f222d; }
        .cta-btn { display: inline-block; margin-top: 15px; background: #c5a880; color: #111317 !important; padding: 10px 20px; border-radius: 6px; font-weight: 700; text-decoration: none; font-size: 13px; letter-spacing: 0.5px; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="header">
          <h1 class="brand-title">DESIGNTERIO</h1>
          <div class="brand-sub">LUXURY INTERIOR ARCHITECTURE & BESPOKE LIVING</div>
        </div>
        <div class="content">
          <span class="badge">New ${type.toUpperCase()} Enquiry</span>
          <h2 style="margin: 0 0 20px 0; color: #fff; font-size: 20px;">Client Consultation Request</h2>
          <div class="lead-card">
            <div class="row"><span class="label">Client Name</span><span class="val">${name}</span></div>
            <div class="row"><span class="label">Phone</span><span class="val"><a href="tel:${phone}">${phone}</a></span></div>
            <div class="row"><span class="label">Email</span><span class="val">${email ? `<a href="mailto:${email}">${email}</a>` : 'Not provided'}</span></div>
            ${propertyType ? `<div class="row"><span class="label">Property Type</span><span class="val">${propertyType}</span></div>` : ''}
            ${area ? `<div class="row"><span class="label">Floor Area</span><span class="val">${area} sq.ft</span></div>` : ''}
            ${preferredDate ? `<div class="row"><span class="label">Preferred Date</span><span class="val">${preferredDate}</span></div>` : ''}
            <div class="row"><span class="label">Enquiry Source</span><span class="val">${source}</span></div>
          </div>
          ${
            message
              ? `<div style="margin-top: 20px;"><div class="label" style="margin-bottom: 6px;">Client Message / Requirements:</div><div class="message-box">${message.replace(/\n/g, '<br>')}</div></div>`
              : ''
          }
          <div style="text-align: center; margin-top: 25px;">
            <a href="https://wa.me/91${phone.replace(/\D/g, '')}" class="cta-btn">Contact on WhatsApp</a>
          </div>
        </div>
        <div class="footer">
          Designterio Pvt. Ltd. Automated Lead Notification • Lucknow Atelier
        </div>
      </div>
    </body>
    </html>
    `;

    const textContent = `
New DESIGNTERIO Enquiry
----------------------------------------
Type: ${type}
Source: ${source}
Name: ${name}
Phone: ${phone}
Email: ${email || 'Not provided'}
Property Type: ${propertyType || 'N/A'}
Area: ${area ? `${area} sq.ft` : 'N/A'}
Preferred Date: ${preferredDate || 'N/A'}
Message: ${message || 'None'}
----------------------------------------
    `;

    const mailOptions = {
      from: `"Designterio Leads" <${emailFrom}>`,
      to: emailTo,
      replyTo: email || undefined,
      subject: `[Lead] ${name} - ${propertyType || type || 'Interior Consultation'}`,
      text: textContent,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Lead notification email sent successfully:', info.messageId);

    return sendJson(res, 200, {
      success: true,
      message: 'Consultation enquiry email sent successfully.',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Failed to send lead email:', error);
    return sendJson(res, 500, {
      success: false,
      error: error.message || 'Failed to send consultation email.'
    });
  }
}
