import dotenv from 'dotenv';
dotenv.config();
console.log({
  account: process.env.VITE_CLOUDFLARE_ACCOUNT_ID,
  token: process.env.VITE_CLOUDFLARE_API_TOKEN
});
