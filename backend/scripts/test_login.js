const http = require('http');

const body = JSON.stringify({ email: 'support@amitsolutionhub.com', password: 'Admin@123' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const parsed = JSON.parse(data);
    console.log('HTTP Status:', res.statusCode);
    console.log('success:', parsed.success);
    if (parsed.success) {
      console.log('LOGIN SUCCESS!');
      console.log('User role:', parsed.user?.role);
      console.log('Token received:', parsed.token ? 'YES' : 'NO');
    } else {
      console.log('Login FAILED:', parsed.message);
    }
  });
});

req.on('error', err => console.error('Request error:', err.message));
req.write(body);
req.end();
