// Simple debug script to test Vite startup
import { createServer } from 'vite';

async function startServer() {
  try {
    console.log('Starting Vite server...');
    const server = await createServer({
      configFile: './vite.config.ts',
      root: process.cwd(),
    });
    
    await server.listen(5173);
    console.log('Server started successfully on http://localhost:5173');
    
    server.printUrls();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
