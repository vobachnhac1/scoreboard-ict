/**
 * Helper wrapper cho better-sqlite3
 * Giúp migration từ sqlite3 dễ dàng hơn
 */

const Database = require('better-sqlite3');
const { DB_SCHEME } = require('./constant_sql');

/**
 * Tạo database connection với cấu hình tối ưu
 * @param {string} dbPath - Đường dẫn đến database file
 * @returns {Database} - better-sqlite3 database instance
 */
function createDatabase(dbPath = DB_SCHEME) {
    const db = new Database(dbPath);
    
    // Cấu hình tối ưu (tương tự db_config.js)
    db.pragma('journal_mode = WAL');
    db.pragma('busy_timeout = 10000');
    db.pragma('synchronous = NORMAL');
    db.pragma('cache_size = 10000');
    db.pragma('temp_store = MEMORY');
    
    return db;
}

/**
 * Wrapper class để dễ migration từ sqlite3
 * Cung cấp API tương tự sqlite3 nhưng dùng better-sqlite3
 */
class BetterSQLiteWrapper {
    constructor(dbPath = DB_SCHEME) {
        this.db = createDatabase(dbPath);
    }

    /**
     * Execute SQL (CREATE TABLE, INSERT, UPDATE, DELETE)
     * Hỗ trợ cả sync và callback style (sqlite3 compatibility)
     * @param {string} sql - SQL query
     * @param {Array|Function} params - Parameters hoặc callback
     * @param {Function} callback - Callback (optional)
     * @returns {Object} - { lastID, changes } (nếu không có callback)
     */
    run(sql, params, callback) {
        // Xử lý overload: run(sql, callback)
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        try {
            const stmt = this.db.prepare(sql);
            // Đảm bảo params là array
            const paramsArray = Array.isArray(params) ? params : (params ? [params] : []);
            const info = stmt.run(...paramsArray);

            const result = {
                lastID: info.lastInsertRowid,
                changes: info.changes
            };

            // Nếu có callback, gọi callback (sqlite3 style)
            if (callback) {
                // Trong sqlite3, callback được gọi với context là statement
                // this.lastID và this.changes
                const context = {
                    lastID: info.lastInsertRowid,
                    changes: info.changes
                };
                process.nextTick(() => callback.call(context, null));
                return;
            }

            // Không có callback, return trực tiếp
            return result;
        } catch (error) {
            console.error('❌ Error in run():', error.message);
            console.error('   SQL:', sql);
            console.error('   Params:', params);

            if (callback) {
                process.nextTick(() => callback(error));
                return;
            }
            throw error;
        }
    }

    /**
     * Get single row
     * Hỗ trợ cả sync và callback style (sqlite3 compatibility)
     * @param {string} sql - SQL query
     * @param {Array|Function} params - Parameters hoặc callback
     * @param {Function} callback - Callback (optional)
     * @returns {Object|undefined} - Row object hoặc undefined (nếu không có callback)
     */
    get(sql, params, callback) {
        // Xử lý overload: get(sql, callback)
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        try {
            const stmt = this.db.prepare(sql);
            // Đảm bảo params là array
            const paramsArray = Array.isArray(params) ? params : (params ? [params] : []);
            const row = stmt.get(...paramsArray);

            // Nếu có callback, gọi callback (sqlite3 style)
            if (callback) {
                process.nextTick(() => callback(null, row));
                return;
            }

            // Không có callback, return trực tiếp
            return row;
        } catch (error) {
            console.error('❌ Error in get():', error.message);
            console.error('   SQL:', sql);
            console.error('   Params:', params);

            if (callback) {
                process.nextTick(() => callback(error));
                return;
            }
            throw error;
        }
    }

    /**
     * Get all rows
     * Hỗ trợ cả sync và callback style (sqlite3 compatibility)
     * @param {string} sql - SQL query
     * @param {Array|Function} params - Parameters hoặc callback
     * @param {Function} callback - Callback (optional)
     * @returns {Array} - Array of row objects (nếu không có callback)
     */
    all(sql, params, callback) {
        // Xử lý overload: all(sql, callback)
        if (typeof params === 'function') {
            callback = params;
            params = [];
        }

        try {
            const stmt = this.db.prepare(sql);
            // Đảm bảo params là array
            const paramsArray = Array.isArray(params) ? params : (params ? [params] : []);
            const rows = stmt.all(...paramsArray);

            // Nếu có callback, gọi callback (sqlite3 style)
            if (callback) {
                // Gọi callback trong nextTick để giống async behavior
                process.nextTick(() => callback(null, rows));
                return;
            }

            // Không có callback, return trực tiếp (better-sqlite3 style)
            return rows;
        } catch (error) {
            console.error('❌ Error in all():', error.message);
            console.error('   SQL:', sql);
            console.error('   Params:', params);

            if (callback) {
                process.nextTick(() => callback(error));
                return;
            }
            throw error;
        }
    }

    /**
     * Prepare statement (để tái sử dụng)
     * Wrapper để tương thích với sqlite3
     * @param {string} sql - SQL query
     * @returns {Object} - Prepared statement wrapper
     */
    prepare(sql) {
        const stmt = this.db.prepare(sql);

        // Wrap statement để tương thích với sqlite3 API
        return {
            // better-sqlite3 native methods
            run: (...params) => stmt.run(...params),
            get: (...params) => stmt.get(...params),
            all: (...params) => stmt.all(...params),

            // sqlite3 compatibility - finalize() không cần thiết trong better-sqlite3
            finalize: () => {
                // better-sqlite3 tự động cleanup, không cần finalize
                // Giữ method này để tương thích với code cũ
            },

            // Expose raw statement nếu cần
            _stmt: stmt
        };
    }

    /**
     * Execute transaction
     * @param {Function} fn - Function chứa các operations
     * @returns {Function} - Transaction function
     */
    transaction(fn) {
        return this.db.transaction(fn);
    }

    /**
     * Execute PRAGMA
     * @param {string} pragma - PRAGMA command
     * @returns {any} - Result
     */
    pragma(pragma) {
        return this.db.pragma(pragma);
    }

    /**
     * Close database
     */
    close() {
        this.db.close();
    }

    /**
     * Serialize (compatibility với sqlite3)
     * better-sqlite3 là sync nên không cần serialize
     * @param {Function} callback - Callback function
     */
    serialize(callback) {
        // better-sqlite3 là sync, nên chỉ cần gọi callback
        callback();
    }

    /**
     * Get raw database instance
     * @returns {Database} - better-sqlite3 database
     */
    getRawDB() {
        return this.db;
    }
}

module.exports = {
    createDatabase,
    BetterSQLiteWrapper,
    Database // Export raw Database class
};

