/**
 * EXAMPLE: Migration từ sqlite3 sang better-sqlite3
 * File này là ví dụ migration của db_common.js
 * 
 * So sánh với db_common.js để thấy sự khác biệt
 */

const { BetterSQLiteWrapper } = require('./db_better_sqlite3');
const { DB_SCHEME, TABLE } = require('./constant_sql');

class DBCommonsService {
    constructor() {
        // Trước: this.db = new sqlite3.Database(DB_SCHEME);
        // Sau: Dùng wrapper
        this.db = new BetterSQLiteWrapper(DB_SCHEME);
        
        // serialize vẫn hoạt động (compatibility)
        this.db.serialize(() => {
            this.db.run(TABLE.CRE_COM); 
            
            // Kiểm tra và insert data ban đầu
            this.getAllCommon().then(data => {
                if (data.length == 0) {
                    // Insert initial data
                    this.insertInitialData();
                }
            });
        });
    }

    /**
     * Get all common data
     * Trước: Dùng callback
     * Sau: Dùng Promise với sync code
     */
    getAllCommon() {
        return new Promise((resolve, reject) => {
            try {
                // Trước: this.db.all("SELECT * FROM common", [], (err, rows) => {...})
                // Sau: Gọi trực tiếp, không cần callback
                const rows = this.db.all("SELECT * FROM common ORDER BY id DESC");
                resolve(rows);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Get common by ID
     */
    getCommonById(id) {
        return new Promise((resolve, reject) => {
            try {
                // Trước: this.db.get("SELECT * FROM common WHERE id = ?", [id], (err, row) => {...})
                // Sau: Gọi trực tiếp
                const row = this.db.get("SELECT * FROM common WHERE id = ?", [id]);
                resolve(row);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Insert common data
     */
    insertCommon(data) {
        return new Promise((resolve, reject) => {
            try {
                // Trước: this.db.run("INSERT ...", [...], function(err) { this.lastID })
                // Sau: Trả về info object
                const info = this.db.run(
                    "INSERT INTO common (name, value) VALUES (?, ?)",
                    [data.name, data.value]
                );
                resolve({ id: info.lastID, changes: info.changes });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Update common data
     */
    updateCommon(id, data) {
        return new Promise((resolve, reject) => {
            try {
                const info = this.db.run(
                    "UPDATE common SET name = ?, value = ? WHERE id = ?",
                    [data.name, data.value, id]
                );
                resolve({ changes: info.changes });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Delete common data
     */
    deleteCommon(id) {
        return new Promise((resolve, reject) => {
            try {
                const info = this.db.run("DELETE FROM common WHERE id = ?", [id]);
                resolve({ changes: info.changes });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Insert initial data using transaction
     * Trước: db.serialize() với nhiều db.run()
     * Sau: Dùng transaction() cho performance tốt hơn
     */
    insertInitialData() {
        const insertStmt = this.db.prepare("INSERT INTO common (name, value) VALUES (?, ?)");
        
        const insertMany = this.db.transaction((items) => {
            for (const item of items) {
                insertStmt.run(item.name, item.value);
            }
        });

        const initialData = [
            { name: 'setting1', value: 'value1' },
            { name: 'setting2', value: 'value2' },
            // ... more data
        ];

        try {
            insertMany(initialData);
            console.log('✅ Inserted initial data');
        } catch (error) {
            console.error('❌ Error inserting initial data:', error);
        }
    }

    /**
     * Close database connection
     */
    close() {
        this.db.close();
    }
}

// Export singleton instance
const instance = new DBCommonsService();
module.exports = instance;

