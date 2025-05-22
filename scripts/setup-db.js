const { spawn } = require('child_process');
const path = require('path');

// Set up environment variables
process.env.POSTGRES_USER = 'postgres';
process.env.POSTGRES_PASSWORD = 'Mw5883Rl$'; // Change this to your password
process.env.POSTGRES_DB = 'review_return';
process.env.POSTGRES_HOST = 'localhost';
process.env.POSTGRES_PORT = '5432';

// Run the setup script using the local ts-node installation
const setup = spawn('node', [
  path.join(__dirname, '../node_modules/ts-node/dist/bin.js'),
  '--project', path.join(__dirname, '../src/lib/db/tsconfig.json'),
  path.join(__dirname, '../src/lib/db/setup-db.ts')
], {
  stdio: 'inherit',
  env: process.env
});

setup.on('close', (code) => {
  if (code === 0) {
    console.log('Database setup completed successfully');
  } else {
    console.error(`Database setup failed with code ${code}`);
  }
}); 