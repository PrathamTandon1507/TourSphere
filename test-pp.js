const crypto = require('crypto');
const axios = require('axios');

const testCases = [
  { id: 'PGTESTPAYUAT', key: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399', index: 1 },
  { id: 'PGTESTPAYUAT86', key: '96434309-7796-489d-8924-ab56988a6076', index: 1 },
  { id: 'PGTESTPAYUAT', key: '099eb0cd-02cf-4e2a-8aa0-e3497125a35d', index: 1 },
  { id: 'MERCHANTUAT', key: '38137397-296a-4d32-ae29-ee51884ea23b', index: 1 },
];

async function run() {
  for (const tc of testCases) {
    console.log(`\nTesting ${tc.id} with ${tc.key} (Index: ${tc.index})`);
    
    const payload = {
      merchantId: tc.id,
      merchantTransactionId: `T_TEST_${Date.now()}`,
      merchantUserId: `U_TEST`,
      amount: 100, // 1 INR
      redirectUrl: `http://localhost:8000/callback`,
      redirectMode: 'REDIRECT',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const verifyString = base64Payload + '/pg/v1/pay' + tc.key;
    const checksum = crypto.createHash('sha256').update(verifyString).digest('hex') + '###' + tc.index;

    try {
      const res = await axios.post(
        'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
        { request: base64Payload },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
          }
        }
      );
      if (res.data.success) {
        console.log('✅ SUCCESS! Found working keys:', tc);
        console.log(res.data.data.instrumentResponse.redirectInfo.url);
        return;
      }
    } catch (err) {
      console.error('❌ ERROR:', err.response ? err.response.data.message : err.message);
    }
  }
}
run();
