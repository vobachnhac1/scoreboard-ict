/**
 * Helper function để cấu hình SQLite database
 * Tránh database locked error
 */
function configureSQLite(db) {
    // Cấu hình timeout để tránh database locked
    db.configure('busyTimeout', 10000); // 10 seconds timeout
    
    // Enable WAL mode để cho phép concurrent reads
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA busy_timeout = 10000');
    
    // Tối ưu hóa performance
    db.run('PRAGMA synchronous = NORMAL');
    db.run('PRAGMA cache_size = 10000');
    db.run('PRAGMA temp_store = MEMORY');
    
    return db;
}

module.exports = { configureSQLite };

