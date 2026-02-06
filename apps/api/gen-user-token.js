const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.SUPABASE_JWT_SECRET;
const payload = {
  sub: '12345678-1234-1234-1234-123456789012',
  email: 'test@test.com',
  role: 'authenticated',
  aud: 'authenticated',
  exp: Math.floor(Date.now() / 1000) + 3600
};

const token = jwt.sign(payload, secret);
console.log(token);
