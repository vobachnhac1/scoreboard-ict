// /**
//  * Check all tables in database
//  * Run: node server/migrations/check_tables.js
//  */

// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');

// // Database path
// const DB_PATH = path.join(__dirname, '../../database.sqlite');

// console.log('🔍 Checking database...');
// console.log('📁 Database path:', DB_PATH);

// const db = new sqlite3.Database(DB_PATH, (err) => {
//     if (err) {
//         console.error('❌ Error opening database:', err);
//         process.exit(1);
//     }
//     console.log('✅ Connected to database\n');
// });

// // List all tables
// db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
//     if (err) {
//         console.error('❌ Error listing tables:', err);
//         db.close();
//         process.exit(1);
//     }
    
//     console.log('📋 Tables in database:');
//     if (tables.length === 0) {
//         console.log('  (no tables found)');
//     } else {
//         tables.forEach(table => {
//             console.log(`  - ${table.name}`);
//         });
//     }
    
//     console.log('\n' + '='.repeat(80) + '\n');
    
//     // Check each table's schema
//     let processed = 0;
//     tables.forEach(table => {
//         db.all(`PRAGMA table_info(${table.name})`, (err, columns) => {
//             if (err) {
//                 console.error(`❌ Error checking ${table.name}:`, err);
//             } else {
//                 console.log(`📊 Table: ${table.name}`);
//                 console.log('-'.repeat(80));
//                 columns.forEach(col => {
//                     const pk = col.pk ? ' [PRIMARY KEY]' : '';
//                     const notnull = col.notnull ? ' [NOT NULL]' : '';
//                     const dflt = col.dflt_value ? ` [DEFAULT: ${col.dflt_value}]` : '';
//                     console.log(`  ${col.name} (${col.type})${pk}${notnull}${dflt}`);
//                 });
//                 console.log('\n');
//             }
            
//             processed++;
//             if (processed === tables.length) {
//                 db.close((err) => {
//                     if (err) {
//                         console.error('❌ Error closing database:', err);
//                         process.exit(1);
//                     }
//                     console.log('👋 Database connection closed');
//                     process.exit(0);
//                 });
//             }
//         });
//     });
    
//     // If no tables, close immediately
//     if (tables.length === 0) {
//         db.close((err) => {
//             if (err) {
//                 console.error('❌ Error closing database:', err);
//                 process.exit(1);
//             }
//             console.log('👋 Database connection closed');
//             process.exit(0);
//         });
//     }
// });

