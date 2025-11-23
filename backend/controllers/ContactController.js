const nodemailer = require('nodemailer');

// A simple contact controller that validates input and sends an email to the admin
exports.receiveContact = async (req, res) => {
  try {
    const { name, email, message, userId } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // In production: store contact in DB and/or send via transactional email
    // Here: attempt to send an email using nodemailer if SMTP is configured via env
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || 'no-reply@healthyai.local',
        to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
        subject: `HealthyAI Contact: ${name}`,
        text: `UserId: ${userId || 'unknown'}\nFrom: ${name} <${email}>\n\n${message}`,
      };

      await transporter.sendMail(mailOptions);
    }

    // Return success regardless (silent fallback if mail not configured)
    return res.json({ success: true, message: 'Message received' });
  } catch (err) {
    console.error('ContactController error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
