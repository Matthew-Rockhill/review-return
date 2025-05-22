import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

async function setupDatabase() {
  // First, connect to the default 'postgres' database to create our database
  const initialPool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: 'postgres', // Connect to default database
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
  });

  try {
    // Create the database if it doesn't exist
    await initialPool.query(`
      SELECT 'CREATE DATABASE review_return'
      WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'review_return')
    `);
    console.log('Database created or already exists');

    // Close the initial connection
    await initialPool.end();

    // Now connect to our new database
    const pool = new Pool({
      user: process.env.POSTGRES_USER || 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      database: 'review_return',
      password: process.env.POSTGRES_PASSWORD,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
    });

    // Read and execute the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    // Execute each statement
    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('Executed statement successfully');
      } catch (error) {
        console.error('Error executing statement:', error);
        console.error('Statement:', statement);
      }
    }

    console.log('Database setup completed successfully');
    await pool.end();
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase(); 