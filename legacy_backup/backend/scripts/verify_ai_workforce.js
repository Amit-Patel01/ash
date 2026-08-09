const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/ai/department/config',
  method: 'GET'
};

console.log('🔍 Checking Real AI Workforce Backend Status...\n');

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.success) {
        console.log('✅ AI Workforce Backend is LIVE & RESPONDING REAL-TIME!');
        console.log('🏢 Registered Active AI Departments:');
        Object.values(parsed.config).forEach(dept => {
          console.log(`  • ${dept.icon} ${dept.name} (${dept.role}) — Enabled: ${dept.enabled ? 'YES' : 'NO'}`);
        });
      } else {
        console.log('⚠️ Backend returned non-success response:', parsed);
      }
    } catch (e) {
      console.log('❌ Failed to parse JSON response:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.log(`❌ Backend connection error: ${e.message}. (Make sure backend 'npm start' is running on port 5000)`);
});

req.end();
