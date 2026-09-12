import { spawn } from 'child_process';

console.log('[Dev] Starting Yakitodo Monolith API Server & Vite Dev Server...');

// Start Express Backend API on port 5000
const serverProc = spawn('npx', ['tsx', 'src/server/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env },
});

// Start Vite Frontend Dev Server on port 5173
const viteProc = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env },
});

const cleanup = () => {
  serverProc.kill();
  viteProc.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
