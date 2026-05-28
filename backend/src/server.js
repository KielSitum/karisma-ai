import app from './server/index.js';

const PORT = process.env.PORT || 5000;

// ── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Karisma AI Backend running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Supabase URL: ${process.env.SUPABASE_URL?.slice(0, 40)}...`);
  console.log(`   CORS origin : http://localhost:5173/`);
});

export default app;
