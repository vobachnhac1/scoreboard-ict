const { BetterSQLiteWrapper } = require('../common/db_better_sqlite3');
const { DB_SCHEME } = require('../common/constant_sql');

class SyncService {
    constructor() {
        this.db = new BetterSQLiteWrapper(DB_SCHEME);

        // Danh sách bảng QUAN TRỌNG - KHÔNG THỂ XÓA
        this.protectedTables = [
            'config_values'
        ];

        // Tự động load tất cả bảng từ database
        this.syncableTables = this.loadAllTablesFromDatabase();
    }

    /**
     * Load tất cả bảng từ database
     */
    loadAllTablesFromDatabase() {
        try {
            // Lấy tất cả bảng từ SQLite
            const tables = this.db.prepare(
                `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
            ).all();

            const syncableTables = {};

            tables.forEach(({ name }) => {
                syncableTables[name] = {
                    name: name,
                    label: this.getTableLabel(name),
                    priority: 2,
                    dependencies: []
                };
            });

            console.log(`✅ Loaded ${Object.keys(syncableTables).length} tables from database`);
            return syncableTables;
        } catch (error) {
            console.error('Error loading tables from database:', error);
            // Fallback to empty object
            return {};
        }
    }

    /**
     * Tạo label cho bảng (có thể customize)
     */
    getTableLabel(tableName) {
        // Mapping các bảng quan trọng
        const labelMap = {
            'config_values': 'Cấu hình hệ thống',
            'initconfig': 'Cấu hình khởi tạo',
            'license_child': 'License con',
            'license_activation': 'Kích hoạt license',
            'logos': 'Logo/Hình ảnh',
            'commons': 'Dữ liệu chung'
        };

        return labelMap[tableName] || tableName;
    }
    
    /**
     * Lấy danh sách các bảng có thể đồng bộ
     */
    async getAvailableTables() {
        return Object.values(this.syncableTables);
    }

    /**
     * Lấy tất cả các bảng trong database
     */
    async getAllDatabaseTables() {
        try {
            const tables = this.db.prepare(
                `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
            ).all();

            return tables.map(t => ({
                name: t.name,
                isSyncable: this.protectedTables.includes(t.name), // Bảng protected = quan trọng
                label: this.syncableTables[t.name]?.label || t.name
            }));
        } catch (error) {
            console.error('Error getting all database tables:', error);
            throw error;
        }
    }

    /**
     * Xóa một bảng khỏi database
     * @param {string} tableName - Tên bảng cần xóa
     */
    async dropTable(tableName) {
        // Kiểm tra xem bảng có phải là PROTECTED table không
        if (this.protectedTables.includes(tableName)) {
            throw new Error(`Không thể xóa bảng ${tableName} vì đây là bảng quan trọng của hệ thống`);
        }

        try {
            // Kiểm tra bảng có tồn tại không
            const tableExists = this.db.prepare(
                `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`
            ).get(tableName);

            if (!tableExists) {
                throw new Error(`Bảng ${tableName} không tồn tại`);
            }

            // Xóa bảng
            this.db.prepare(`DROP TABLE ${tableName}`).run();

            console.log(`✅ Đã xóa bảng: ${tableName}`);
            return { success: true, message: `Đã xóa bảng ${tableName}` };
        } catch (error) {
            console.error(`Error dropping table ${tableName}:`, error);
            throw error;
        }
    }

    /**
     * Xóa nhiều bảng cùng lúc
     * @param {string[]} tableNames - Danh sách tên bảng cần xóa
     */
    async dropMultipleTables(tableNames) {
        const results = {
            success: [],
            failed: []
        };

        for (const tableName of tableNames) {
            try {
                await this.dropTable(tableName);
                results.success.push(tableName);
            } catch (error) {
                results.failed.push({
                    table: tableName,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Xóa một record khỏi bảng
     * @param {string} tableName - Tên bảng
     * @param {number} recordId - ID của record cần xóa
     */
    async deleteRecord(tableName, recordId) {
        // Kiểm tra bảng có tồn tại không
        const tableExists = this.db.prepare(
            `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`
        ).get(tableName);

        if (!tableExists) {
            throw new Error(`Bảng ${tableName} không tồn tại`);
        }

        try {
            // Kiểm tra record có tồn tại không
            const record = this.db.prepare(
                `SELECT * FROM ${tableName} WHERE id = ?`
            ).get(recordId);

            if (!record) {
                throw new Error(`Record với ID ${recordId} không tồn tại trong bảng ${tableName}`);
            }

            // Xóa record
            const result = this.db.prepare(
                `DELETE FROM ${tableName} WHERE id = ?`
            ).run(recordId);

            console.log(`✅ Đã xóa record ID ${recordId} từ bảng ${tableName}`);
            return {
                success: true,
                message: `Đã xóa record ID ${recordId}`,
                changes: result.changes
            };
        } catch (error) {
            console.error(`Error deleting record from ${tableName}:`, error);
            throw error;
        }
    }

    /**
     * Xóa nhiều records cùng lúc
     * @param {string} tableName - Tên bảng
     * @param {number[]} recordIds - Danh sách ID của records cần xóa
     */
    async deleteMultipleRecords(tableName, recordIds) {
        // Kiểm tra bảng có tồn tại không
        const tableExists = this.db.prepare(
            `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`
        ).get(tableName);

        if (!tableExists) {
            throw new Error(`Bảng ${tableName} không tồn tại`);
        }

        const results = {
            success: [],
            failed: [],
            totalChanges: 0
        };

        for (const recordId of recordIds) {
            try {
                const result = await this.deleteRecord(tableName, recordId);
                results.success.push(recordId);
                results.totalChanges += result.changes;
            } catch (error) {
                results.failed.push({
                    recordId,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Lấy tất cả records của một bảng
     * @param {string} tableName - Tên bảng
     * @param {number} limit - Giới hạn số lượng records (mặc định: 1000)
     * @param {number} offset - Vị trí bắt đầu (mặc định: 0)
     */
    async getTableRecords(tableName, limit = 1000, offset = 0) {
        // Kiểm tra bảng có tồn tại không
        const tableExists = this.db.prepare(
            `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`
        ).get(tableName);

        if (!tableExists) {
            throw new Error(`Bảng ${tableName} không tồn tại`);
        }

        try {
            // Lấy tổng số records
            const countResult = this.db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get();
            const totalCount = countResult.count;

            // Lấy records với pagination
            const records = this.db.prepare(
                `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`
            ).all(limit, offset);

            return {
                table: tableName,
                label: this.syncableTables[tableName]?.label || tableName,
                totalCount,
                limit,
                offset,
                records
            };
        } catch (error) {
            console.error(`Error getting records from ${tableName}:`, error);
            throw error;
        }
    }
    
    /**
     * Lấy metadata của các bảng
     * Nếu không truyền tables, sẽ lấy tất cả syncable tables
     */
    async getMetadata(tables = null) {
        const metadata = {};

        // Nếu không truyền tables, lấy tất cả syncable tables
        const tablesToProcess = tables || Object.keys(this.syncableTables);

        for (const table of tablesToProcess) {
            if (!this.syncableTables[table]) {
                continue;
            }

            try {
                const countResult = this.db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
                const count = countResult.count;

                // Estimate size (rough calculation)
                const sampleData = this.db.prepare(`SELECT * FROM ${table} LIMIT 10`).all();
                const avgSize = sampleData.length > 0
                    ? JSON.stringify(sampleData).length / sampleData.length
                    : 0;
                const estimatedSize = Math.ceil(avgSize * count);

                metadata[table] = {
                    table,
                    label: this.syncableTables[table].label,
                    count,
                    estimatedSize,
                    priority: this.syncableTables[table].priority
                };
            } catch (error) {
                console.error(`Error getting metadata for ${table}:`, error);
                metadata[table] = {
                    table,
                    label: this.syncableTables[table].label,
                    count: 0,
                    estimatedSize: 0,
                    error: error.message
                };
            }
        }

        return metadata;
    }
    
    /**
     * Export dữ liệu từ các bảng
     */
    async exportData(tables) {
        const exportData = {};
        
        for (const table of tables) {
            if (!this.syncableTables[table]) {
                console.warn(`Table ${table} is not syncable`);
                continue;
            }
            
            try {
                const data = this.db.prepare(`SELECT * FROM ${table}`).all();
                exportData[table] = data;
            } catch (error) {
                console.error(`Error exporting ${table}:`, error);
                exportData[table] = {
                    error: error.message
                };
            }
        }
        
        return exportData;
    }
    
    /**
     * Import dữ liệu vào database
     * @param {string} table - Tên bảng
     * @param {array} data - Dữ liệu cần import
     * @param {string} strategy - Chiến lược: 'overwrite', 'skip', 'merge'
     */
    async importData(table, data, strategy = 'overwrite') {
        if (!this.syncableTables[table]) {
            throw new Error(`Table ${table} is not syncable`);
        }

        if (!Array.isArray(data) || data.length === 0) {
            return { imported: 0, skipped: 0, errors: [] };
        }

        let imported = 0;
        let skipped = 0;
        const errors = [];

        try {
            // Get column names from first record
            const columns = Object.keys(data[0]).filter(col => col !== 'id');
            const placeholders = columns.map(() => '?').join(', ');

            if (strategy === 'overwrite') {
                // Delete all existing data first
                this.db.prepare(`DELETE FROM ${table}`).run();

                // Insert all records
                const insertStmt = this.db.prepare(
                    `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
                );

                for (const record of data) {
                    try {
                        const values = columns.map(col => record[col]);
                        insertStmt.run(...values);
                        imported++;
                    } catch (error) {
                        errors.push({
                            record,
                            error: error.message
                        });
                    }
                }
            } else if (strategy === 'skip') {
                // Insert only if not exists (based on id)
                const insertStmt = this.db.prepare(
                    `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
                );

                for (const record of data) {
                    try {
                        const values = columns.map(col => record[col]);
                        const result = insertStmt.run(...values);
                        if (result.changes > 0) {
                            imported++;
                        } else {
                            skipped++;
                        }
                    } catch (error) {
                        errors.push({
                            record,
                            error: error.message
                        });
                    }
                }
            } else if (strategy === 'merge') {
                // Update if exists, insert if not
                const upsertStmt = this.db.prepare(
                    `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`
                );

                for (const record of data) {
                    try {
                        const values = columns.map(col => record[col]);
                        upsertStmt.run(...values);
                        imported++;
                    } catch (error) {
                        errors.push({
                            record,
                            error: error.message
                        });
                    }
                }
            }

            return { imported, skipped, errors };
        } catch (error) {
            console.error(`Error importing data to ${table}:`, error);
            throw error;
        }
    }
}

module.exports = new SyncService();


module.exports = new SyncService();

