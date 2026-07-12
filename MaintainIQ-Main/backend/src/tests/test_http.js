const http = require('http');

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

const runDiagnostics = async () => {
  const testEmail = `diag_${Date.now()}@example.com`;
  const testPassword = 'password123';

  console.log('--- STARTING AUTH DIAGNOSTICS ---');

  // Test 1: Register
  const registerPayload = JSON.stringify({
    name: 'Diagnostic User',
    email: testEmail,
    password: testPassword,
    role: 'Technician'
  });

  const registerOptions = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(registerPayload)
    }
  };

  try {
    console.log(`[Diagnostic] Registering ${testEmail}...`);
    const regRes = await makeRequest(registerOptions, registerPayload);
    console.log(`[Diagnostic] Register status: ${regRes.statusCode}`);
    console.log(`[Diagnostic] Register body: ${regRes.body}`);

    if (regRes.statusCode !== 201) {
      throw new Error(`Register failed with status ${regRes.statusCode}`);
    }

    // Test 2: Login
    const loginPayload = JSON.stringify({
      email: testEmail,
      password: testPassword
    });

    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginPayload)
      }
    };

    console.log(`[Diagnostic] Logging in ${testEmail}...`);
    const logRes = await makeRequest(loginOptions, loginPayload);
    console.log(`[Diagnostic] Login status: ${logRes.statusCode}`);
    console.log(`[Diagnostic] Login body: ${logRes.body}`);

    if (logRes.statusCode !== 200) {
      throw new Error(`Login failed with status ${logRes.statusCode}`);
    }

    console.log('--- DIAGNOSTICS PASSED SUCCESSFULLY ---');
  } catch (error) {
    console.error('❌ DIAGNOSTICS FAILED:', error.message);
  }
};

runDiagnostics();
