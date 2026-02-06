require('dotenv').config();
console.log('Loaded Secret:', process.env.SUPABASE_JWT_SECRET ? process.env.SUPABASE_JWT_SECRET.substring(0,5) : 'UNDEFINED');
