const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;

    const defaultFrom = 'TourSphere <no-reply@toursphere.com>'; // safe fallback
    const configuredFrom = (process.env.EMAIL_FROM || '').trim();
    this.from = `PratT <${configuredFrom || defaultFrom}>`;
  }

  createBrevoTransport() {
    if (
      process.env.BREVO_HOST &&
      process.env.BREVO_PORT &&
      process.env.BREVO_LOGIN &&
      process.env.BREVO_PASSWORD
    ) {
      return nodemailer.createTransport({
        host: process.env.BREVO_HOST,
        port: Number(process.env.BREVO_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.BREVO_LOGIN,
          pass: process.env.BREVO_PASSWORD,
        },
        tls: {
          // Allow self-signed certificates in some environments; disable in production if not needed.
          rejectUnauthorized: false,
        },
      });
    }

    return null;
  }

  createFallbackTransport() {
    // Fallback: Mailtrap / any SMTP defined via EMAIL_*
    if (process.env.EMAIL_HOST && process.env.EMAIL_PORT) {
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
        logger: true,
      });
    }
    return null;
  }

  // Send the actual email
  async send(template, subject) {
    // 1. Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2. Define the email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html), // convert to text
    };

    // 3. Create transports (try Brevo first, then fall back to SMTP if needed)
    const transports = [];
    const brevoTransport = this.createBrevoTransport();
    if (brevoTransport) transports.push({ name: 'Brevo', transport: brevoTransport });

    const fallbackTransport = this.createFallbackTransport();
    if (fallbackTransport) transports.push({ name: 'SMTP', transport: fallbackTransport });

    if (transports.length === 0) {
      throw new Error(
        'No email transport configured. Please set BREVO_* or EMAIL_* environment variables.',
      );
    }

    let lastError;
    for (const { name, transport } of transports) {
      try {
        if (transports.length > 1) {
          console.log(`Attempting to send email using ${name} transport`);
        }
        await transport.sendMail(mailOptions);
        return;
      } catch (err) {
        lastError = err;
        console.error(`Email send failed using ${name} transport:`, err);
      }
    }

    throw new Error(`Email send failed: ${lastError?.message || 'unknown error'}`);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the TourSphere Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 minutes)',
    );
  }
};
