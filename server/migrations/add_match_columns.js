// /**
//  * Migration: Add match_name and team_name columns to competition_match table
//  * Run: node server/migrations/add_match_columns.js
//  */

// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');

// // Database path
// const DB_PATH = path.join(__dirname, '../../database.sqlite');

// console.log('🔄 Starting migration...');
// console.log(' Database path:', DB_PATH);

// const db = new sqlite3.Database(DB_PATH, (err) => {
//     if (err) {
//         console.error(' Error opening database:', err);
//         process.exit(1);
//     }
//     console.log(' Connected to database');
// });

// // Run migrations
// db.serialize(() => {
//     console.log('\n📋 Checking table schema...');
    
//     // Check current columns
//     db.all("PRAGMA table_info(competition_match)", (err, columns) => {
//         if (err) {
//             console.error(' Error checking table:', err);
//             db.close();
//             process.exit(1);
//         }
        
//         console.log('\n Current columns:');
//         columns.forEach(col => {
//             console.log(`  - ${col.name} (${col.type})`);
//         });
        
//         const columnNames = columns.map(col => col.name);
//         const hasMatchName = columnNames.includes('match_name');
//         const hasTeamName = columnNames.includes('team_name');
//         const hasMatchType = columnNames.includes('match_type');

//         console.log('\n🔍 Column status:');
//         console.log(`  - match_name: ${hasMatchName ? ' exists' : ' missing'}`);
//         console.log(`  - team_name: ${hasTeamName ? ' exists' : ' missing'}`);
//         console.log(`  - match_type: ${hasMatchType ? ' exists' : ' missing'}`);
        
//         // Add match_name if missing
//         if (!hasMatchName) {
//             console.log('\n➕ Adding match_name column...');
//             db.run(`ALTER TABLE competition_match ADD COLUMN match_name TEXT`, (err) => {
//                 if (err) {
//                     console.error(' Error adding match_name:', err);
//                 } else {
//                     console.log(' Added match_name column');
//                 }
//             });
//         }
        
//         // Add team_name if missing
//         if (!hasTeamName) {
//             console.log('\n➕ Adding team_name column...');
//             db.run(`ALTER TABLE competition_match ADD COLUMN team_name TEXT`, (err) => {
//                 if (err) {
//                     console.error(' Error adding team_name:', err);
//                 } else {
//                     console.log(' Added team_name column');
//                 }
//             });
//         }

//         // Add match_type if missing
//         if (!hasMatchType) {
//             console.log('\n➕ Adding match_type column...');
//             db.run(`ALTER TABLE competition_match ADD COLUMN match_type TEXT DEFAULT 'DK'`, (err) => {
//                 if (err) {
//                     console.error(' Error adding match_type:', err);
//                 } else {
//                     console.log(' Added match_type column');
//                 }
//             });
//         }
        
//         // Verify changes
//         setTimeout(() => {
//             db.all("PRAGMA table_info(competition_match)", (err, newColumns) => {
//                 if (err) {
//                     console.error(' Error verifying changes:', err);
//                     db.close();
//                     process.exit(1);
//                 }
                
//                 console.log('\n Updated columns:');
//                 newColumns.forEach(col => {
//                     console.log(`  - ${col.name} (${col.type})`);
//                 });
                
//                 const newColumnNames = newColumns.map(col => col.name);
//                 const nowHasMatchName = newColumnNames.includes('match_name');
//                 const nowHasTeamName = newColumnNames.includes('team_name');
//                 const nowHasMatchType = newColumnNames.includes('match_type');

//                 console.log('\n✨ Migration result:');
//                 console.log(`  - match_name: ${nowHasMatchName ? ' exists' : ' missing'}`);
//                 console.log(`  - team_name: ${nowHasTeamName ? ' exists' : ' missing'}`);
//                 console.log(`  - match_type: ${nowHasMatchType ? ' exists' : ' missing'}`);

//                 if (nowHasMatchName && nowHasTeamName && nowHasMatchType) {
//                     console.log('\n🎉 Migration completed successfully!');
//                 } else {
//                     console.log('\n  Migration completed with warnings');
//                 }
                
//                 db.close((err) => {
//                     if (err) {
//                         console.error(' Error closing database:', err);
//                         process.exit(1);
//                     }
//                     console.log('\n👋 Database connection closed');
//                     process.exit(0);
//                 });
//             });
//         }, 500);
//     });
// });

