import app, { connectToDatabase } from './app';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('[MongoDB] Connecting to database...');
    await connectToDatabase();

    app.listen(PORT, () => {
      console.log(`[Server] Yakitodo Monolith API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Server] Startup error:', error);
    process.exit(1);
  }
}

startServer();
