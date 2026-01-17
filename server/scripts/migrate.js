// const fs = require('fs');
// const path = require('path');
// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const dbConfig = {
//   host: process.env.DB_HOST || 'localhost',
//   port: process.env.DB_PORT || 3306,
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'scoreboard_ict',
//   multipleStatements: true
// };

// async function runMigration() {
//   let connection;
  
//   try {
//     console.log('🔄 Connecting to database...');
//     connection = await mysql.createConnection(dbConfig);
//     console.log('✅ Connected to database');

//     // Read migration file
//     const migrationPath = path.join(__dirname, '../migrations/add_match_result_fields.sql');
//     console.log('📄 Reading migration file:', migrationPath);
    
//     const sql = fs.readFileSync(migrationPath, 'utf8');
    
//     // Execute migration
//     console.log('🚀 Running migration...');
//     await connection.query(sql);
    
//     console.log('✅ Migration completed successfully!');
    
//     // Verify tables
//     const [tables] = await connection.query(`
//       SELECT TABLE_NAME, TABLE_ROWS 
//       FROM information_schema.TABLES
//       WHERE TABLE_SCHEMA = ? 
//         AND TABLE_NAME IN ('matches', 'round_results')
//     `, [process.env.DB_NAME || 'scoreboard_ict']);
    
//     console.log('\n📊 Tables created/updated:');
//     tables.forEach(table => {
//       console.log(`  - ${table.TABLE_NAME} (${table.TABLE_ROWS} rows)`);
//     });
    
//   } catch (error) {
//     console.error('❌ Migration failed:', error.message);
//     process.exit(1);
//   } finally {
//     if (connection) {
//       await connection.end();
//       console.log('\n👋 Database connection closed');
//     }
//   }
// }

// // Run migration
// runMigration();

