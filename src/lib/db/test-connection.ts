import { query } from './client';

async function testConnection() {
  try {
    // Test the connection with a simple query
    const result = await query('SELECT NOW()');
    console.log('Database connection successful!');
    console.log('Current timestamp:', result.rows[0].now);
    
    // Test if our tables exist
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\nAvailable tables:');
    tables.rows.forEach(row => console.log('-', row.table_name));
    
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    process.exit();
  }
}

testConnection(); 