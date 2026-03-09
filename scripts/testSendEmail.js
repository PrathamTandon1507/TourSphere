require('dotenv').config({ path: './config.env' });
const Email = require('../utils/email');

(async () => {
  try {
    const dummy = { email: 'test@example.com', name: 'Test User' };
    const url = 'https://example.com/reset';
    await new Email(dummy, url).sendPasswordReset();
    console.log('Email send succeeded');
  } catch (err) {
    console.error('Send error:', err);
  }
})();
