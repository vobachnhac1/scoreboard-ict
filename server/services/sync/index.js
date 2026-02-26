const { BetterSQLiteWrapper } = require('../common/db_better_sqlite3');
const { DB_SCHEME } = require('../common/constant_sql');
const dbCompetitionMatchTeamService = require('../../services/common/db_competition_match_team');

class SyncService {
    constructor() {
        this.db = new BetterSQLiteWrapper(DB_SCHEME);

        // Danh sách bảng QUAN TRỌNG - KHÔNG THỂ XÓA
        this.protectedTables = [
            // 'config_values',
            // 'initconfig',
            // 'license_child',
            // 'license_activation',
            // 'logos',
            // 'commons',
            'competition_dk',
            // 'competition_match',
            // 'competition_match_history',
            'competition_match_team',
            // 'competition_match_team_athlete',
            // 'competition_match_team_history',
            // 'sync_staging'
        ];

        // Tự động load tất cả bảng từ database
        this.syncableTables = this.loadAllTablesFromDatabase();

        // chỉ hiển thị dữ liệu trong protectedTables
        this.syncableTables = Object.fromEntries(
            Object.entries(this.syncableTables).filter(([tableName]) => this.protectedTables.includes(tableName))
        );

        // sort this.syncableTables theo value A-Z
        this.syncableTables = Object.fromEntries(
            Object.entries(this.syncableTables).sort((a, b) => a[1].label.localeCompare(b[1].label))
        );

        // Khởi tạo bảng staging để lưu dữ liệu tạm
        this.initStagingTable();
    }

    /**
     * Khởi tạo bảng staging để lưu dữ liệu nhận được
     */
    initStagingTable() {
        try {
            this.db.prepare(`
                CREATE TABLE IF NOT EXISTS sync_staging (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    session_id TEXT NOT NULL,
                    table_name TEXT NOT NULL,
                    record_data TEXT NOT NULL,
                    source_ip TEXT,
                    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    status TEXT DEFAULT 'pending',
                    mapping_to_id INTEGER,
                    action TEXT DEFAULT 'insert',
                    meta TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `).run();

            // Thêm cột meta nếu chưa có (migration cho DB cũ)
            try {
                this.db.prepare(`ALTER TABLE sync_staging ADD COLUMN meta TEXT`).run();
                console.log(' Added meta column to sync_staging');
            } catch (e) {
                // Column already exists
            }

            console.log(' Staging table initialized');
        } catch (error) {
            console.error('Error initializing staging table:', error);
        }
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
            //Todo: Thực hiện chỉ lấy table cho phép 



            tables.forEach(({ name }) => {
                syncableTables[name] = {
                    name: name,
                    label: this.getTableLabel(name),
                    priority: 5,
                    dependencies: []
                };
            });


            console.log(` Loaded ${Object.keys(syncableTables).length} tables from database`);
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
            'competition_dk': '1. Danh sách tổng Đối Kháng/Quyền/Võ Nhạc (Màn hình Quản lý thi đấu)',
            // 'competition_match': '1.1. Danh sách đối kháng',
            // 'competition_match_history': '1.2. Kết quả thi đối kháng',
            'competition_match_team': '2. Danh sách Quyền/Võ Nhạc',
            // 'competition_match_team_athlete': '1.4. Danh sách VĐV trong Quyền/Võ Nhạc',
            // 'competition_match_team_history': '1.5. Kết quả thi Quyền/Võ Nhạc',
            // 'config_values': '2.1. Cấu hình hệ thống',
            // 'initconfig': '2.2. Cấu hình khởi tạo',
            // 'license_child': '2.3. License con',
            // 'license_activation': '2.4. Kích hoạt license',
            // 'logos': '2.5. Logo/Hình ảnh',
            // 'commons': '2.6. Dữ liệu chung', 
            // 'sync_staging': '3. Staging dữ liệu',
        };

        // sort value 

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

            console.log(` Đã xóa bảng: ${tableName}`);
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

            console.log(` Đã xóa record ID ${recordId} từ bảng ${tableName}`);
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

        // chỉ hiển thị dữ liệu trong protectedTables
        this.syncableTables = Object.fromEntries(
            Object.entries(this.syncableTables).filter(([tableName]) => this.protectedTables.includes(tableName))
        );

        // sort this.syncableTables theo value A-Z
        this.syncableTables = Object.fromEntries(
            Object.entries(this.syncableTables).sort((a, b) => a[1].label.localeCompare(b[1].label))
        );

        for (const table of tablesToProcess) {
            if (!this.syncableTables[table]) {
                continue;
            }

            try {
                const countResult = this.db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
                const count = countResult.count;

                // Estimate size (rough calculation)
                const sampleData = this.db.prepare(`SELECT * FROM ${table}`).all();
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
        // Reload syncable tables to ensure table exists in DB
        this.syncableTables = this.loadAllTablesFromDatabase();

        if (!this.syncableTables[table]) {
            // Bảng chưa tồn tại - có thể tạo mới từ data nếu cần
            // Bỏ qua lỗi và log thay vì throw để tránh 500
            console.warn(`Table ${table} not found in local DB, skipping import`);
            return { imported: 0, skipped: 0, errors: [`Table ${table} không tồn tại trong database`] };
        }

        if (!Array.isArray(data) || data.length === 0) {
            return { imported: 0, skipped: 0, errors: [] };
        }

        let imported = 0;
        let skipped = 0;
        const errors = [];

        try {
            // Get column names from first record - exclude 'id' for auto-increment tables
            const allColumns = Object.keys(data[0]);
            // Lấy columns thực tế từ bảng trong DB
            const tableInfo = this.db.prepare(`PRAGMA table_info(${table})`).all();
            const dbColumns = tableInfo.map(col => col.name);
            // Chỉ lấy những cột có trong DB
            const columns = allColumns.filter(col => col !== 'id' && dbColumns.includes(col));
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

    /**
     * Lưu dữ liệu vào staging thay vì import trực tiếp
     * @param {string} table - Tên bảng
     * @param {array} data - Dữ liệu cần lưu
     * @param {string} sourceIP - IP máy gửi
     * @param {string} sessionId - ID phiên đồng bộ
     */
    async saveToStaging(table, data, sourceIP, sessionId, meta = null, partial_rows = false) {
        try {


            const insertStmt = this.db.prepare(`
                INSERT INTO sync_staging (session_id, table_name, record_data, source_ip, status, meta)
                VALUES (?, ?, ?, ?, 'pending', ?)
            `);

            const metaJson = meta ? JSON.stringify(meta) : null;

            if (partial_rows) {
                insertStmt.run(sessionId, table, JSON.stringify(data), sourceIP, metaJson);
                return { saved: 0, total: 0 };
            }

            let saved = 0;
            for (const record of data) {
                try {
                    insertStmt.run(sessionId, table, JSON.stringify(record), sourceIP, metaJson);
                    saved++;
                } catch (error) {
                    console.error('Error saving to staging:', error);
                }
            }

            return { saved, total: data.length };
        } catch (error) {
            console.error('Error in saveToStaging:', error);
            throw error;
        }
    }

    /**
     * Lấy danh sách các session staging
     */
    async getStagingSessions() {
        try {
            const sessions = this.db.prepare(`
                SELECT
                    session_id,
                    source_ip,
                    MIN(received_at) as received_at,
                    COUNT(*) as total_records,
                    COUNT(DISTINCT table_name) as total_tables,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count,
                    SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
                    (SELECT meta FROM sync_staging WHERE session_id = s.session_id LIMIT 1) as meta_sample
                FROM sync_staging s
                GROUP BY session_id, source_ip
                ORDER BY received_at DESC
            `).all();

            // Parse meta_sample nếu có
            return sessions.map(s => ({
                ...s,
                meta_sample: s.meta_sample ? JSON.parse(s.meta_sample) : null
            }));
        } catch (error) {
            console.error('Error getting staging sessions:', error);
            throw error;
        }
    }

    /**
     * Lấy dữ liệu staging theo session và table
     */
    async getStagingData(sessionId, tableName = null) {
        try {
            let query = `
                SELECT
                    id,
                    session_id,
                    table_name,
                    record_data,
                    source_ip,
                    received_at,
                    status,
                    mapping_to_id,
                    action,
                    meta
                FROM sync_staging
                WHERE session_id = ?
            `;

            const params = [sessionId];

            if (tableName) {
                query += ` AND table_name = ?`;
                params.push(tableName);
            }

            query += ` ORDER BY table_name, id`;

            const records = this.db.prepare(query).all(...params);

            // Parse JSON data
            return records.map(r => ({
                ...r,
                record_data: JSON.parse(r.record_data),
                meta: r.meta ? JSON.parse(r.meta) : null
            }));
        } catch (error) {
            console.error('Error getting staging data:', error);
            throw error;
        }
    }

    /**
     * Cập nhật mapping cho staging record
     */
    async updateStagingMapping(stagingId, mappingToId, action) {
        try {
            this.db.prepare(`
                UPDATE sync_staging
                SET mapping_to_id = ?, action = ?, status = 'mapped'
                WHERE id = ?
            `).run(mappingToId, action, stagingId);

            return { success: true };
        } catch (error) {
            console.error('Error updating staging mapping:', error);
            throw error;
        }
    }

    /**
     * Apply changes từ staging vào database thực
     */
    async applyStagingChanges(sessionId) {
        try {
            // Lấy tất cả staging records của session
            const stagingRecords = await this.getStagingData(sessionId);
            console.log('stagingRecords: ', stagingRecords);

            const results = {
                inserted: 0,
                updated: 0,
                skipped: 0,
                errors: []
            };

            for (const staging of stagingRecords) {
                try {
                    const { table_name, record_data, action, mapping_to_id, meta } = staging;
                    // Reload syncable tables
                    this.syncableTables = this.loadAllTablesFromDatabase();
                    if (!this.syncableTables[table_name]) {
                        results.errors.push({
                            staging_id: staging.id,
                            error: `Table ${table_name} không tồn tại`
                        });
                        continue;
                    }
                    // Trường hợp: Cập nhật từng dòng
                    if (record_data?.file_type === 'DK' && meta?.type === 'partial_rows' && table_name === 'competition_dk') {
                        const { file_name, sheet_name, items, match_detail } = record_data;
                        // lấy danh sách 
                        const getExcelData = this.db.prepare(' SELECT id, data FROM competition_dk WHERE file_name = ? AND sheet_name = ? ').get(file_name, sheet_name);
                        if (getExcelData) {
                            let _getExcelData = JSON.parse(getExcelData.data);
                            const competition_dk_id = getExcelData.id;
                            // tìm item trong danh sách để cập nhật
                            items.forEach(item => {
                                // cập nhật vào list tổng
                                let id = item[0];
                                _getExcelData[id] = item;
                            });

                            // cập nhật lại danh sách 
                            const update = this.db.prepare(' UPDATE competition_dk SET data = ? WHERE id = ? ').run(JSON.stringify(_getExcelData), getExcelData.id);
                            results.updated++;
                            // cập nhật dữ liệu bên match_detail  table competition_match, competition_match_history
                            if (match_detail) {
                                // thực hiện xoá dữ liệu hiện có competition_match và competition_match_history
                                const arrRowIndex = match_detail.map(item => item.row_index);

                                // 1. lấy danh sách competition_match với  competition_dk_id
                                const matches = this.db.prepare(' SELECT id, row_index FROM competition_match WHERE competition_dk_id = ? and row_index in (' + arrRowIndex.toString() + ')').all(competition_dk_id);
                                if (matches.length > 0) {
                                    // lấy danh sách history 
                                    const arrMatchIds = matches.map(item => item.id);
                                    const getMatchHistory = this.db.prepare(` SELECT id FROM competition_match_history WHERE match_id in (${arrMatchIds.toString()})`)
                                    const matchesHistory = getMatchHistory.all();
                                    if (matchesHistory.length > 0) {
                                        const arrMatchHistoryIds = matchesHistory.map(item => item.id);
                                        this.db.prepare(` DELETE FROM competition_match_history WHERE id in (${arrMatchHistoryIds.toString()})`).run();
                                    }
                                    this.db.prepare(` DELETE FROM competition_match WHERE id in (${arrMatchIds.toString()})`).run();
                                }

                                // thực hiện tuần tự
                                for (const match of match_detail) {
                                    const query = `
                                        INSERT INTO competition_match (
                                            competition_dk_id,
                                            match_no,
                                            row_index,
                                            red_name,
                                            red_team,
                                            blue_name,
                                            blue_team,
                                            match_name,
                                            match_type,
                                            winner,
                                            match_status,
                                            config_system
                                        )
                                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

                                    const insertMatchDetails = this.db.prepare(query).run(
                                        competition_dk_id,
                                        match.match_no,
                                        match.row_index,
                                        match.red_name,
                                        match.red_team,
                                        match.blue_name,
                                        match.blue_team,
                                        match.match_name,
                                        match.match_type,
                                        match.winner,
                                        match.match_status,
                                        JSON.stringify(match.config_system)
                                    );
                                    const lastInsertRowid = insertMatchDetails.lastInsertRowid;
                                    if (insertMatchDetails.changes > 0) {
                                        results.updated++;

                                        if (!match?.history || match?.history.length == 0) continue
                                        // insert history 
                                        const placeholdersHistory = match?.history.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
                                        const queryHistory = `
                                            INSERT INTO competition_match_history (
                                                match_id,
                                                red_score,
                                                blue_score,
                                                red_remind,
                                                blue_remind,
                                                red_warn,
                                                blue_warn,
                                                red_mins,
                                                blue_mins,
                                                red_incr,
                                                blue_incr,
                                                round,
                                                round_type,
                                                confirm_attack,
                                                status,
                                                action_type,
                                                action_by,
                                                notes,
                                                logs,
                                                round_history
                                            )
                                            VALUES ${placeholdersHistory}`;
                                        const values = match?.history?.map((row, index) => [
                                            lastInsertRowid,
                                            row.red_score,
                                            row.blue_score,
                                            row.red_remind,
                                            row.blue_remind,
                                            row.red_warn,
                                            row.blue_warn,
                                            row.red_mins,
                                            row.blue_mins,
                                            row.red_incr,
                                            row.blue_incr,
                                            row.round,
                                            row.round_type,
                                            row.confirm_attack,
                                            row.status,
                                            row.action_type,
                                            row.action_by,
                                            row.notes,
                                            JSON.stringify(row.logs),
                                            JSON.stringify(row.round_history)
                                        ]);
                                        const flatValues = values.flat();
                                        const insertMatchDetailsHistory = this.db.prepare(queryHistory).run(flatValues);
                                        results.updated++;
                                    } else {
                                        results.skipped++;
                                    }
                                }
                            }
                        }
                    } else if (['DOL', 'SOL', 'TUV', 'DAL', 'VON'].includes(record_data?.file_type) && meta?.type === 'partial_rows' && table_name === 'competition_dk') {
                        //TODO: 21.02.2026:  Cập nhật từng dòng 
                        const { file_name, sheet_name, file_type, items, match_detail } = record_data;
                        // lấy danh sách 
                        const getExcelData = this.db.prepare(' SELECT id, data FROM competition_dk WHERE file_name = ? AND sheet_name = ? ').get(file_name, sheet_name);
                        if (getExcelData) {
                            let _getExcelData = JSON.parse(getExcelData.data);
                            const competition_dk_id = getExcelData.id;
                            if (file_type == 'DOL') {
                                // TH: Đơn luyện                         
                                items.forEach(item => {
                                    // cập nhật vào list tổng
                                    let id = item[0];
                                    _getExcelData[id] = item;
                                });
                                // cập nhật lại danh sách 
                                const update = this.db.prepare(' UPDATE competition_dk SET data = ? WHERE id = ? ').run(JSON.stringify(_getExcelData), getExcelData.id);
                                results.updated++;
                                // tìm item trong danh sách để cập nhật competition_match_team 
                                if (match_detail) {
                                    // lấy danh sách hiện có xoá -> ghi đè cái mới
                                    //GET /api/competition-match-team/by-dk/:competition_dk_id
                                    const matchTeams = await dbCompetitionMatchTeamService.getTeamsByCompetitionDKId(competition_dk_id);
                                    if (matchTeams.length > 0) {
                                        // items -> match_no  -> rowIds 
                                        const rowIds = items?.map(item => (item[0] - 1));
                                        if (rowIds.length > 0) {
                                            const lsMatchTeamsUpd = matchTeams.filter(item => rowIds.includes(item.row_index));
                                            // cập nhật lại thông tin match 
                                            for (const match of lsMatchTeamsUpd) {
                                                const itemUpt = match_detail.find(item => item.row_index == match.row_index);
                                                if (itemUpt) {
                                                    const resultUpd = this.db.prepare(` UPDATE competition_match_team SET 
                                                            match_name = ?,
                                                            team_name = ?,
                                                            match_type = ?,
                                                            match_status = ?,
                                                            config_system = ?,
                                                            scores = ?,
                                                            updated_at = datetime('now')
                                                            WHERE id = ?
                                                        `).run(itemUpt.match_name, itemUpt.team_name,
                                                        itemUpt.match_type, itemUpt.match_status,
                                                        JSON.stringify(itemUpt.config_system),
                                                        JSON.stringify(itemUpt.scores), match.id);
                                                    results.updated++;
                                                    // Thực hiện cập nhật thông tin VĐV competition_match_team_athlete
                                                    // XOÁ: competition_match_team_athlete
                                                    const rsDelete = this.db.prepare(` DELETE FROM competition_match_team_athlete WHERE team_id = ?`).run(match.id);
                                                    // THÊM: competition_match_team_athlete
                                                    // Thêm athletes nếu có
                                                    const athletes = itemUpt.athletes ?? [];
                                                    if (athletes && athletes.length > 0) {
                                                        const athleteQuery = `
                                                            INSERT INTO competition_match_team_athlete (team_id, athlete_name, athlete_unit, athlete_order)
                                                            VALUES (?, ?, ?, ?)
                                                        `;

                                                        try {
                                                            const stmt = this.db.prepare(athleteQuery);
                                                            athletes.forEach((athlete, index) => {
                                                                stmt.run(
                                                                    match.id,
                                                                    athlete.name || '',
                                                                    athlete.unit || '',
                                                                    index + 1
                                                                );
                                                            });
                                                        } catch (err) {
                                                            console.error('Error inserting athletes:', err);
                                                        }
                                                    }

                                                }
                                            }

                                        }
                                    }
                                }
                            } else if (['TUV', 'SOL'].includes(file_type)) {
                                // TH: Song luyện/ Tự vệ
                                // Xử lý logic riêng cho file type 'TUV' và 'SOL'
                                let indexExcelData = -1;
                                for (let i = 0; i < items.length; i += 2) {
                                    // từ STT -> STT - 1 là thứ tự của VĐV trong nội dung thi đấu
                                    if (items[i][0] != null) {
                                        // có indexExcelData thì lấy thông tin từ _getExcelData
                                        _getExcelData.forEach((excelItm, ind) => {
                                            if (excelItm[0] == items[i][0] && indexExcelData > -1) {
                                                indexExcelData = ind;
                                            }
                                        });
                                        // có indexExcelData thì lấy thông tin từ _getExcelData
                                        if (indexExcelData > -1) {
                                            _getExcelData[indexExcelData + i] = items[i]
                                            _getExcelData[indexExcelData + i + 1] = items[i + 1]
                                        }
                                    }
                                }
                                // Xử lý dữ liệu
                                // cập nhật lại danh sách 
                                const update = this.db.prepare(' UPDATE competition_dk SET data = ? WHERE id = ? ').run(JSON.stringify(_getExcelData), getExcelData.id);
                                results.updated++;
                                // tìm item trong danh sách để cập nhật competition_match_team 
                                if (match_detail.length > 0) {
                                    // lấy danh sách hiện có xoá -> ghi đè cái mới
                                    //GET /api/competition-match-team/by-dk/:competition_dk_id
                                    const matchTeams = await dbCompetitionMatchTeamService.getTeamsByCompetitionDKId(competition_dk_id);
                                    if (matchTeams.length > 0) {
                                        // Từ items lấy thông tin match_no và xử lý trùng 
                                        const rowIds = items.filter(item => item[0] != null).map(item => item[0]);
                                        // XỬ LÝ TRÙNG rowIds
                                        const uniqueRowIds = [...new Set(rowIds)].map(item => Number(item));
                                        // lấy match 
                                        if (uniqueRowIds.length > 0) {
                                            // cập nhật thông tin
                                            const lsMatchTeamsUpd = matchTeams.filter(item => uniqueRowIds.includes(parseInt(item.match_no)));
                                            for (const match of lsMatchTeamsUpd) {
                                                const itemUpt = match_detail.find(item => parseInt(item.match_no) == parseInt(match.match_no));
                                                if (itemUpt) {
                                                    const resultUpd = this.db.prepare(` UPDATE competition_match_team SET 
                                                            match_name = ?,
                                                            team_name = ?,
                                                            match_type = ?,
                                                            match_status = ?,
                                                            config_system = ?,
                                                            scores = ?,
                                                            updated_at = datetime('now')
                                                            WHERE id = ?
                                                        `).run(itemUpt.match_name, itemUpt.team_name,
                                                        itemUpt.match_type, itemUpt.match_status,
                                                        JSON.stringify(itemUpt.config_system),
                                                        JSON.stringify(itemUpt.scores), match.id);
                                                    results.updated++;
                                                    // Thực hiện cập nhật thông tin VĐV competition_match_team_athlete

                                                    // XOÁ: competition_match_team_athlete
                                                    const rsDelete = this.db.prepare(` DELETE FROM competition_match_team_athlete WHERE team_id = ?`).run(match.id);
                                                    // Thêm athletes nếu có
                                                    const athletes = itemUpt.athletes ?? [];
                                                    if (athletes && athletes.length > 0) {

                                                        try {
                                                            const values = athletes.map((athlete, index) => [
                                                                match.id,
                                                                athlete.athlete_name || '',
                                                                athlete.athlete_unit || '',
                                                                athlete.athlete_order || index + 1
                                                            ]);
                                                            const placeholdersAthlete = values?.map(() => '(?, ?, ?, ?)').join(', ');
                                                            const athleteQuery = `
                                                                INSERT INTO competition_match_team_athlete (team_id, athlete_name, athlete_unit, athlete_order)
                                                                VALUES ${placeholdersAthlete}
                                                            `;
                                                            const flatValues = values.flat();

                                                            console.log(athleteQuery, flatValues)
                                                            const stmt = this.db.prepare(athleteQuery);
                                                            const result = stmt.run(flatValues);
                                                            console.log('result', result);
                                                        } catch (err) {
                                                            console.error('Error inserting athletes:', err);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }


                            } else if (file_type == 'DAL') {
                                // TH: Đa luyện
                                let indexExcelData = -1;
                                for (let i = 0; i < items.length; i += 4) {
                                    // từ STT -> STT - 1 là thứ tự của VĐV trong nội dung thi đấu
                                    if (items[i][0] != null) {
                                        // có indexExcelData thì lấy thông tin từ _getExcelData
                                        _getExcelData.forEach((excelItm, ind) => {
                                            if (excelItm[0] == items[i][0] && indexExcelData > -1) {
                                                indexExcelData = ind;
                                            }
                                        });
                                        // có indexExcelData thì lấy thông tin từ _getExcelData
                                        if (indexExcelData > -1) {
                                            _getExcelData[indexExcelData + i] = items[i]
                                            _getExcelData[indexExcelData + i + 1] = items[i + 1]
                                            _getExcelData[indexExcelData + i + 2] = items[i + 2]
                                            _getExcelData[indexExcelData + i + 3] = items[i + 3]
                                        }
                                    }
                                }
                                // Xử lý dữ liệu
                                // cập nhật lại danh sách 
                                const update = this.db.prepare(' UPDATE competition_dk SET data = ? WHERE id = ? ').run(JSON.stringify(_getExcelData), getExcelData.id);
                                results.updated++;
                                // tìm item trong danh sách để cập nhật competition_match_team 
                                if (match_detail.length > 0) {
                                    // lấy danh sách hiện có xoá -> ghi đè cái mới
                                    //GET /api/competition-match-team/by-dk/:competition_dk_id
                                    const matchTeams = await dbCompetitionMatchTeamService.getTeamsByCompetitionDKId(competition_dk_id);
                                    if (matchTeams.length > 0) {
                                        // Từ items lấy thông tin match_no và xử lý trùng 
                                        const rowIds = items.filter(item => item[0] != null).map(item => item[0]);
                                        // XỬ LÝ TRÙNG rowIds
                                        const uniqueRowIds = [...new Set(rowIds)].map(item => Number(item) - 1);
                                        if (uniqueRowIds.length > 0) {
                                            // cập nhật thông tin
                                            const lsMatchTeamsUpd = matchTeams.filter(item => uniqueRowIds.includes(item.row_index));
                                            for (const match of lsMatchTeamsUpd) {
                                                const itemUpt = match_detail.find(item => item.row_index == match.row_index);
                                                if (itemUpt) {
                                                    const resultUpd = this.db.prepare(` UPDATE competition_match_team SET 
                                                            match_name = ?,
                                                            team_name = ?,
                                                            match_type = ?,
                                                            match_status = ?,
                                                            config_system = ?,
                                                            scores = ?,
                                                            updated_at = datetime('now')
                                                            WHERE id = ?
                                                        `).run(itemUpt.match_name, itemUpt.team_name,
                                                        itemUpt.match_type, itemUpt.match_status,
                                                        JSON.stringify(itemUpt.config_system),
                                                        JSON.stringify(itemUpt.scores), match.id);
                                                    results.updated++;
                                                    // Thực hiện cập nhật thông tin VĐV competition_match_team_athlete

                                                    // XOÁ: competition_match_team_athlete
                                                    const rsDelete = this.db.prepare(` DELETE FROM competition_match_team_athlete WHERE team_id = ?`).run(match.id);
                                                    // Thêm athletes nếu có
                                                    const athletes = itemUpt.athletes ?? [];
                                                    if (athletes && athletes.length > 0) {
                                                        const athleteQuery = `
                                                            INSERT INTO competition_match_team_athlete (team_id, athlete_name, athlete_unit, athlete_order)
                                                            VALUES (?, ?, ?, ?)
                                                        `;

                                                        try {

                                                            const stmt = this.db.prepare(athleteQuery);
                                                            athletes.forEach((athlete, index) => {
                                                                stmt.run(
                                                                    match.id,
                                                                    athlete.athlete_name || '',
                                                                    athlete.athlete_unit || '',
                                                                    athlete.athlete_order || index + 1
                                                                );
                                                            });
                                                        } catch (err) {
                                                            console.error('Error inserting athletes:', err);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                            } else if (file_type == 'VON') {
                                try {
                                    // TH: Võ Nhạc
                                    // Xử lý logic riêng cho file type 'VON'
                                    let count = 0;
                                    let indexExcelData = -1;

                                    for (let i = 0; i < items.length; i += count) {
                                        if (items[i][5] != null) {
                                            count = Number(items[i][5]) > 1 ? Number(items[i][5]) : 1;
                                            // lấy index trong _getExcelData
                                            _getExcelData.forEach((excelItm, ind) => {
                                                if (excelItm[0] == items[i][0] && indexExcelData > -1) {
                                                    indexExcelData = ind;
                                                }
                                            });
                                            // có indexExcelData thì lấy thông tin từ _getExcelData
                                            if (indexExcelData > -1) {
                                                _getExcelData[indexExcelData + i] = items[i]
                                            }
                                        } else {
                                            _getExcelData[indexExcelData + i] = items[i]
                                        }
                                    }
                                    // cập nhật lại danh sách 
                                    const update = this.db.prepare(' UPDATE competition_dk SET data = ? WHERE id = ? ').run(JSON.stringify(_getExcelData), getExcelData.id);
                                    results.updated++;

                                    // Cập nhật lại match_detail
                                    if (match_detail) {
                                        // lấy danh sách team trong 
                                        const matchTeams = await dbCompetitionMatchTeamService.getTeamsByCompetitionDKId(competition_dk_id);
                                        if (matchTeams.length > 0) {
                                            // Từ items lấy thông tin match_no và xử lý trùng 
                                            const rowIds = items.filter(item => item[0] != null && item[5] != null).map(item => item[0]);
                                            // XỬ LÝ TRÙNG rowIds
                                            const uniqueRowIds = [...new Set(rowIds)].map(item => Number(item) - 1);
                                            if (uniqueRowIds.length > 0) {
                                                // cập nhật thông tin
                                                const lsMatchTeamsUpd = matchTeams.filter(item => uniqueRowIds.includes(item.row_index));
                                                for (const match of lsMatchTeamsUpd) {
                                                    const itemUpt = match_detail.find(item => item.row_index == match.row_index);
                                                    if (itemUpt) {
                                                        const resultUpd = this.db.prepare(` UPDATE competition_match_team SET 
                                                                match_name = ?,
                                                                team_name = ?,
                                                                match_type = ?,
                                                                match_status = ?,
                                                                config_system = ?,
                                                                scores = ?,
                                                                updated_at = datetime('now')
                                                                WHERE id = ?
                                                            `).run(itemUpt.match_name, itemUpt.team_name,
                                                            itemUpt.match_type, itemUpt.match_status,
                                                            JSON.stringify(itemUpt.config_system),
                                                            JSON.stringify(itemUpt.scores), match.id);
                                                        results.updated++;
                                                        // Thực hiện cập nhật thông tin VĐV competition_match_team_athlete

                                                        // XOÁ: competition_match_team_athlete
                                                        const rsDelete = this.db.prepare(` DELETE FROM competition_match_team_athlete WHERE team_id = ?`).run(match.id);
                                                        console.log('rsDelete', rsDelete)
                                                        // Thêm athletes nếu có
                                                        const athletes = itemUpt.athletes ?? [];
                                                        console.log('athletes', match.id, athletes)
                                                        if (athletes && athletes.length > 0) {
                                                            // Lấy thông tin athlete
                                                            const athleteQuery = `
                                                                INSERT INTO competition_match_team_athlete (team_id, athlete_name, athlete_unit, athlete_order)
                                                                VALUES (?, ?, ?, ?)
                                                            `;

                                                            try {

                                                                const stmt = this.db.prepare(athleteQuery);
                                                                athletes.forEach((athlete, index) => {
                                                                    stmt.run(
                                                                        match.id,
                                                                        athlete.athlete_name || '',
                                                                        athlete.athlete_unit || '',
                                                                        athlete.athlete_order || index + 1
                                                                    );
                                                                });
                                                            } catch (err) {
                                                                console.error('Error inserting athletes:', err);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }

                                } catch (error) {
                                    console.log(file_type, error)
                                }
                            }
                        }
                    } else {
                        // Trường hợp: Cập nhật/ thêm toàn danh sách
                        const tableInfo = this.db.prepare(`PRAGMA table_info(${table_name})`).all();
                        const dbColumns = tableInfo.map(col => col.name);

                        // === XỬ LÝ PARTIAL ROWS (competition_dk với dòng chọn lọc) ===
                        if (meta && meta.type === 'partial_rows' && table_name === 'competition_dk') {
                            const targetId = mapping_to_id || meta.record_id;
                            if (!targetId) {
                                results.errors.push({ staging_id: staging.id, error: 'Không xác định được record đích' });
                                continue;
                            }

                            // Lấy data hiện tại của record đích
                            const existingRow = this.db.prepare(`SELECT data FROM competition_dk WHERE id = ?`).get(targetId);
                            if (!existingRow) {
                                results.errors.push({ staging_id: staging.id, error: `competition_dk id=${targetId} không tồn tại` });
                                continue;
                            }

                            let existingData;
                            try {
                                existingData = JSON.parse(existingRow.data);
                            } catch (e) {
                                results.errors.push({ staging_id: staging.id, error: 'Không parse được data hiện tại' });
                                continue;
                            }

                            // Lấy data mới từ staging (array-of-arrays: [headers, ...rows])
                            let incomingData;
                            try {
                                incomingData = typeof record_data.data === 'string'
                                    ? JSON.parse(record_data.data)
                                    : record_data.data;
                            } catch (e) {
                                results.errors.push({ staging_id: staging.id, error: 'Không parse được data staging' });
                                continue;
                            }

                            // Gộp: giữ toàn bộ data cũ + append các rows mới (bỏ header của incomingData)
                            const incomingRows = Array.isArray(incomingData) ? incomingData.slice(1) : [];
                            const mergedData = [...existingData, ...incomingRows];

                            this.db.prepare(
                                `UPDATE competition_dk SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
                            ).run(JSON.stringify(mergedData), targetId);
                            results.updated++;

                        } else {
                            const list = JSON.parse(record_data.data) ?? [];
                            const type_list = list.length > 0 ? list[0][0] : null;
                            if (table_name === 'competition_dk' && action === 'insert' && type_list == 'DK') {
                                // Xoá dữ liệu có trước đó 
                                const getExist = this.db.prepare(' SELECT id FROM competition_dk WHERE sheet_name = ? AND file_name = ?').all(record_data.sheet_name, record_data.file_name);
                                console.log('getExist: ', getExist)
                                if (getExist.length > 0) {
                                    const arrExistIds = getExist.map(item => item.id);
                                    // xoá danh sách tồn tại trước đó competition_dk ->  competition_dk_id competition_match (id -> match_id) | competition_match_history (match_id)
                                    const getMatch = this.db.prepare(' SELECT id FROM competition_match WHERE competition_dk_id in (' + arrExistIds.toString() + ')').all();
                                    console.log('getMatch: ', getMatch)

                                    if (getMatch.length > 0) {
                                        const arrMatchIds = getMatch.map(item => item.id);
                                        const getMatchHistory = this.db.prepare(' SELECT id FROM competition_match_history WHERE match_id in (' + arrMatchIds.toString() + ')').all();
                                        console.log('getMatchHistory: ', getMatchHistory)

                                        if (getMatchHistory.length > 0) {
                                            const arrMatchHistoryIds = getMatchHistory.map(item => item.id);
                                            this.db.prepare(' DELETE FROM competition_match_history WHERE id in (' + arrMatchHistoryIds.toString() + ')').run();
                                        }
                                        this.db.prepare(' DELETE FROM competition_match WHERE id in (' + arrMatchIds.toString() + ')').run();
                                    }
                                    this.db.prepare(' DELETE FROM competition_dk WHERE id in (' + arrExistIds.toString() + ')').run();
                                }
                                // === TH1: competition_dk thuộc insert -> Tạo thêm dữ liệu 
                                console.log('=== TH1: competition_dk thuộc insert -> Tạo thêm dữ liệu ');
                                // thêm dữ liệu vào competition_dk -> thành công lấy competition_dk_id 
                                const insertCompetitionDKStmt = this.db.prepare(' INSERT INTO competition_dk (sheet_name, file_name, data) VALUES (?, ?, ?)').run(record_data.sheet_name, record_data.file_name, record_data.data);
                                const competition_dk_id = insertCompetitionDKStmt.lastInsertRowid;
                                if (competition_dk_id && list.length > 0) {
                                    // insert list 
                                    const placeholders = list.slice(1).map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
                                    const query = `
                                    INSERT INTO competition_match (
                                        competition_dk_id,
                                        match_no,
                                        row_index,
                                        red_name,
                                        red_team,
                                        blue_name,
                                        blue_team,
                                        match_name,
                                        match_type
                                    )
                                    VALUES ${placeholders}
                                `;
                                    const values = list.slice(1).map((row, index) => [
                                        competition_dk_id,
                                        row[0] != null ? row[0] : '',
                                        index,
                                        row[3] != null ? row[3] : '',
                                        row[4] != null ? row[4] : '',
                                        row[6] != null ? row[6] : '',
                                        row[7] != null ? row[7] : '',
                                        row[1] != null ? row[1] : '',
                                        row[2] != null ? row[2] : ''
                                    ]);
                                    const flatValues = values.flat();
                                    const insertCompetitionMatchStmt = this.db.prepare(query).run(flatValues);

                                }

                            } else if (table_name === 'competition_dk' && action === 'update' && type_list == 'DK') {
                                // === TH2: competition_dk thuộc update
                                console.log('=== TH2: competition_dk thuộc update')
                                const updateCompetitionDKStmt = this.db.prepare(' UPDATE competition_dk SET sheet_name = ?, file_name = ?, data = ? WHERE id = ?')
                                    .run(record_data.sheet_name, record_data.file_name, record_data.data, mapping_to_id)

                                // Xoá dữ liệu 
                                const deleteCompetitionMatchStmt = this.db.prepare(' DELETE FROM competition_match WHERE competition_dk_id = ?')
                                    .run(mapping_to_id)

                                // thêm mới lại competition_match
                                const list = JSON.parse(record_data.data) ?? [];
                                if (list.length > 0) {
                                    // insert list 
                                    const placeholders = list.slice(1).map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
                                    const query = `
                                    INSERT INTO competition_match (
                                        competition_dk_id,
                                        match_no,
                                        row_index,
                                        red_name,
                                        red_team,
                                        blue_name,
                                        blue_team,
                                        match_name,
                                        match_type                                        
                                    )
                                    VALUES ${placeholders}
                                `;

                                    const values = list.slice(1).map((row, index) => [
                                        competition_dk_id,
                                        row[0] != null ? row[0] : '',
                                        index,
                                        row[3] != null ? row[3] : '',
                                        row[4] != null ? row[4] : '',
                                        row[6] != null ? row[6] : '',
                                        row[7] != null ? row[7] : '',
                                        row[1] != null ? row[1] : '',
                                        row[2] != null ? row[2] : ''
                                    ]);
                                    const flatValues = values.flat();
                                    const insertCompetitionMatchStmt = this.db.prepare(query).run(flatValues);
                                }
                            } else if (table_name === 'competition_dk' && action === 'insert' && ['SOL', 'TUV', 'DOL', 'VON', 'DAL'].includes(type_list)) {
                                // === TH: THI QUYỀN/VÕ NHẠC
                                console.log('=== TH1: THI QUYỀN/VÕ NHẠC | insert')
                                const insertQuyenStmt = this.db.prepare(' INSERT INTO competition_dk (sheet_name, file_name, data) VALUES (?, ?, ?)').run(record_data.sheet_name, record_data.file_name, record_data.data);
                                const competition_dk_id = insertQuyenStmt.lastInsertRowid;
                                if (competition_dk_id && list.length > 0) {
                                    let teams = [];
                                    if (type_list == 'DOL') { // 2 VĐV                                
                                        for (let i = 1; i < list.length; i++) {
                                            const row = list[i];
                                            const athletes = [{ name: row[2], unit: row[3] }];
                                            teams.push({
                                                competition_dk_id: competition_dk_id,
                                                match_no: row[0],
                                                row_index: (i - 1),
                                                config_system: null,
                                                match_name: row[4],
                                                match_status: "WAI",
                                                match_type: "DOL",
                                                team_name: row[3],
                                                athletes: athletes
                                            });
                                        }
                                        // thực hiện tạo 
                                        const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                        console.log('DOL ', result)
                                    } else if (type_list == 'DAL') {
                                        for (let i = 1; i < list.length; i += 4) {
                                            const row = list[i];
                                            const row2 = list[i + 1];
                                            const row3 = list[i + 2];
                                            const row4 = list[i + 3];
                                            const athletes = [
                                                { name: row[2], unit: row[3] },
                                                { name: row2[2], unit: row2[3] },
                                                { name: row3[2], unit: row3[3] },
                                                { name: row4[2], unit: row4[3] }
                                            ];
                                            teams.push({
                                                competition_dk_id: competition_dk_id,
                                                match_no: row[0],
                                                row_index: (i - 1),
                                                config_system: null,
                                                match_name: row[4],
                                                match_status: "WAI",
                                                match_type: "DAL",
                                                team_name: row[3],
                                                athletes: athletes
                                            });
                                        }
                                        // thực hiện tạo 
                                        const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                        console.log('DAL ', result)
                                    } else if (type_list == 'SOL') {
                                        for (let i = 1; i < list.length; i += 2) {
                                            const row = list[i];
                                            const row2 = list[i + 1];
                                            const athletes = [
                                                { name: row[2], unit: row[3] },
                                                { name: row2[2], unit: row2[3] }
                                            ];
                                            teams.push({
                                                competition_dk_id: competition_dk_id,
                                                match_no: row[0],
                                                row_index: (i - 1),
                                                config_system: null,
                                                match_name: row[4],
                                                match_status: "WAI",
                                                match_type: "SOL",
                                                team_name: row[3],
                                                athletes: athletes
                                            });
                                        }
                                        // thực hiện tạo 
                                        const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                        console.log('SOL ', result)
                                    } else if (type_list == 'TUV') {
                                        for (let i = 1; i < list.length; i += 2) {
                                            const row = list[i];
                                            const row2 = list[i + 1];
                                            const athletes = [
                                                { name: row[2], unit: row[3] },
                                                { name: row2[2], unit: row2[3] }
                                            ];
                                            teams.push({
                                                competition_dk_id: competition_dk_id,
                                                match_no: row[0],
                                                row_index: (i - 1),
                                                config_system: null,
                                                match_name: row[4],
                                                match_status: "WAI",
                                                match_type: "TUV",
                                                team_name: row[3],
                                                athletes: athletes
                                            });
                                        }
                                        // thực hiện tạo 
                                        const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                        console.log('TUV ', result)
                                    } else if (type_list == 'VON') {
                                        // thực hiện võ nhạc  
                                        let count = 0
                                        for (let i = 1; i < list.length; i += count) {
                                            const row = list[i];
                                            count = row[5] ?? 0
                                            const athletes = [];
                                            for (let j = 0; j < count; j++) {
                                                athletes.push({ name: list[i + j][3], unit: list[i + j][2] })
                                            }
                                            if (count <= 1) athletes.push({ name: row[3], unit: row[2] })
                                            teams.push({
                                                competition_dk_id: competition_dk_id,
                                                match_no: row[0],
                                                row_index: (i - 1),
                                                config_system: null,
                                                match_name: row[4],
                                                match_status: "WAI",
                                                match_type: "VON",
                                                team_name: row[2],
                                                athletes: athletes
                                            });

                                        }
                                        // thực hiện tạo 
                                        const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                        console.log('VON ', result)
                                    }
                                }
                            } else if (table_name === 'competition_dk' && action === 'update' && ['SOL', 'TUV', 'DOL', 'VON', 'DAL'].includes(type_list)) {
                                // === TH: THI QUYỀN/VÕ NHẠC                            
                                console.log('=== TH2: THI QUYỀN/VÕ NHẠC | update')
                                // cập nhât 
                                const updateCompetitionDKStmt = this.db.prepare(' UPDATE competition_dk SET sheet_name = ?, file_name = ?, data = ? WHERE id = ?')
                                    .run(record_data.sheet_name, record_data.file_name, record_data.data, mapping_to_id)

                                // lấy thông tin competition_match_team dựa trên competition_dk_id
                                const listTeams = this.db.prepare(' SELECT id FROM competition_match_team WHERE competition_dk_id = ?').all(mapping_to_id);
                                if (listTeams.length > 0) {
                                    const arrTeamIds = listTeams.map(team => team.id);
                                    console.log('Xoá: ', arrTeamIds.toString())
                                    // xoá competition_match_team
                                    const deleteCompetitionMatchTeamAthleteStmt = this.db.prepare(' DELETE FROM competition_match_team_athlete WHERE team_id IN (' + arrTeamIds.toString() + ')').run();
                                    const deleteCompetitionMatchTeamStmt = this.db.prepare(' DELETE FROM competition_match_team WHERE competition_dk_id IN (' + mapping_to_id + ')').run();
                                }
                                if (mapping_to_id && list.length > 0) {
                                    let teams = [];
                                    if (type_list == 'DOL') { // 2 VĐV                                
                                        for (let i = 1; i < list.length; i++) {
                                            const row = list[i];
                                            const athletes = [{ name: row[2], unit: row[3] }];
                                            teams.push({
                                                competition_dk_id: mapping_to_id,
                                                match_no: row[0],
                                                row_index: (i - 1),
                                                config_system: null,
                                                match_name: row[4],
                                                match_status: "WAI",
                                                match_type: "DOL",
                                                team_name: row[3],
                                                athletes: athletes
                                            });
                                        }
                                        // thực hiện tạo 
                                        const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                        console.log('DOL ', result)
                                    } else if (type_list == 'DAL') {
                                        for (let i = 1; i < list.length; i += 4) {
                                            const row = list[i];
                                            const row2 = list[i + 1];
                                            const row3 = list[i + 2];
                                            const row4 = list[i + 3];
                                            const athletes = [
                                                { name: row[2], unit: row[3] },
                                                { name: row2[2], unit: row2[3] },
                                                { name: row3[2], unit: row3[3] },
                                                { name: row4[2], unit: row4[3] }
                                            ];
                                            teams.push({
                                                competition_dk_id: mapping_to_id,
                                                match_no: row[0],
                                                row_index: (i - 1),
                                                config_system: null,
                                                match_name: row[4],
                                                match_status: "WAI",
                                                match_type: "DAL",
                                                team_name: row[3],
                                                athletes: athletes
                                            });
                                        }
                                        // thực hiện tạo 
                                        const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                        console.log('DAL ', result)
                                    } else if (type_list == 'SOL') {
                                        for (let i = 1; i < list.length; i += 2) {
                                            const row = list[i];
                                            const row2 = list[i + 1];
                                            const athletes = [
                                                { name: row[2], unit: row[3] },
                                                { name: row2[2], unit: row2[3] }
                                            ];
                                            teams.push({
                                                competition_dk_id: mapping_to_id,
                                                match_no: row[0],
                                                row_index: (i - 1),
                                                config_system: null,
                                                match_name: row[4],
                                                match_status: "WAI",
                                                match_type: "SOL",
                                                team_name: row[3],
                                                athletes: athletes
                                            });
                                        }
                                        // thực hiện tạo 
                                        const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                        console.log('SOL ', result)
                                    } else if (type_list == 'TUV') {
                                        for (let i = 1; i < list.length; i += 2) {
                                            const row = list[i];
                                            const row2 = list[i + 1];
                                            const athletes = [
                                                { name: row[2], unit: row[3] },
                                                { name: row2[2], unit: row2[3] }
                                            ];
                                            teams.push({
                                                competition_dk_id: mapping_to_id,
                                                match_no: row[0],
                                                row_index: (i - 1),
                                                config_system: null,
                                                match_name: row[4],
                                                match_status: "WAI",
                                                match_type: "TUV",
                                                team_name: row[3],
                                                athletes: athletes
                                            });
                                        }
                                        // thực hiện tạo 
                                        const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                        console.log('TUV ', result)
                                    } else if (type_list == 'VON') {
                                        // thực hiện võ nhạc  
                                        let count = 0
                                        for (let i = 1; i < list.length; i += count) {
                                            const row = list[i];
                                            count = row[5] ?? 0
                                            const athletes = [];
                                            for (let j = 0; j < count; j++) {
                                                athletes.push({ name: list[i + j][3], unit: list[i + j][2] })
                                            }
                                            if (count <= 1) athletes.push({ name: row[3], unit: row[2] })
                                            teams.push({
                                                competition_dk_id: mapping_to_id,
                                                match_no: row[0],
                                                row_index: (i - 1),
                                                config_system: null,
                                                match_name: row[4],
                                                match_status: "WAI",
                                                match_type: "VON",
                                                team_name: row[2],
                                                athletes: athletes
                                            });

                                        }
                                        // thực hiện tạo 
                                        const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                        console.log('VON ', result)
                                    }
                                }
                            } else {
                                // === TH3: Khác (xử lý sau)
                                const allColumns = Object.keys(record_data);
                                const columns = allColumns.filter(col => col !== 'id' && dbColumns.includes(col));
                                const placeholders = columns.map(() => '?').join(', ');
                                if (action === 'insert') {
                                    // Insert new record
                                    const insertStmt = this.db.prepare(
                                        `INSERT INTO ${table_name}(${columns.join(', ')}) VALUES (${placeholders})`
                                    );
                                    const values = columns.map(col => record_data[col]);
                                    insertStmt.run(...values);
                                    results.inserted++;
                                } else if (action === 'update' && mapping_to_id) {
                                    // Update existing record
                                    const setClause = columns.map(col => `${col} = ?`).join(', ');
                                    const updateStmt = this.db.prepare(
                                        `UPDATE ${table_name} SET ${setClause} WHERE id = ?`
                                    );
                                    const values = [...columns.map(col => record_data[col]), mapping_to_id];
                                    updateStmt.run(...values);
                                    results.updated++;
                                } else if (action === 'skip') {
                                    results.skipped++;
                                }
                            }
                        }
                    }

                    // Trường hợp: Cập nhật/ thêm toàn danh sách
                    // Get columns
                    const tableInfo = this.db.prepare(`PRAGMA table_info(${table_name})`).all();
                    const dbColumns = tableInfo.map(col => col.name);

                    // === XỬ LÝ PARTIAL ROWS (competition_dk với dòng chọn lọc) ===
                    if (meta && meta.type === 'partial_rows' && table_name === 'competition_dk') {
                        const targetId = mapping_to_id || meta.record_id;
                        if (!targetId) {
                            results.errors.push({ staging_id: staging.id, error: 'Không xác định được record đích' });
                            continue;
                        }

                        // Lấy data hiện tại của record đích
                        const existingRow = this.db.prepare(`SELECT data FROM competition_dk WHERE id = ?`).get(targetId);
                        if (!existingRow) {
                            results.errors.push({ staging_id: staging.id, error: `competition_dk id=${targetId} không tồn tại` });
                            continue;
                        }

                        let existingData;
                        try {
                            existingData = JSON.parse(existingRow.data);
                        } catch (e) {
                            results.errors.push({ staging_id: staging.id, error: 'Không parse được data hiện tại' });
                            continue;
                        }

                        // Lấy data mới từ staging (array-of-arrays: [headers, ...rows])
                        let incomingData;
                        try {
                            incomingData = typeof record_data.data === 'string'
                                ? JSON.parse(record_data.data)
                                : record_data.data;
                        } catch (e) {
                            results.errors.push({ staging_id: staging.id, error: 'Không parse được data staging' });
                            continue;
                        }

                        // Gộp: giữ toàn bộ data cũ + append các rows mới (bỏ header của incomingData)
                        const incomingRows = Array.isArray(incomingData) ? incomingData.slice(1) : [];
                        const mergedData = [...existingData, ...incomingRows];

                        this.db.prepare(
                            `UPDATE competition_dk SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
                        ).run(JSON.stringify(mergedData), targetId);
                        results.updated++;

                    } else {
                        const list = JSON.parse(record_data.data) ?? [];
                        const type_list = list.length > 0 ? list[0][0] : null;
                        if (table_name === 'competition_dk' && action === 'insert' && type_list == 'DK') {
                            // Xoá dữ liệu có trước đó 
                            const getExist = this.db.prepare(' SELECT id FROM competition_dk WHERE sheet_name = ? AND file_name = ?').all(record_data.sheet_name, record_data.file_name);
                            console.log('getExist: ', getExist)
                            if (getExist.length > 0) {
                                const arrExistIds = getExist.map(item => item.id);
                                // xoá danh sách tồn tại trước đó competition_dk ->  competition_dk_id competition_match (id -> match_id) | competition_match_history (match_id)
                                const getMatch = this.db.prepare(' SELECT id FROM competition_match WHERE competition_dk_id in (' + arrExistIds.toString() + ')').all();
                                console.log('getMatch: ', getMatch)

                                if (getMatch.length > 0) {
                                    const arrMatchIds = getMatch.map(item => item.id);
                                    const getMatchHistory = this.db.prepare(' SELECT id FROM competition_match_history WHERE match_id in (' + arrMatchIds.toString() + ')').all();
                                    console.log('getMatchHistory: ', getMatchHistory)

                                    if (getMatchHistory.length > 0) {
                                        const arrMatchHistoryIds = getMatchHistory.map(item => item.id);
                                        this.db.prepare(' DELETE FROM competition_match_history WHERE id in (' + arrMatchHistoryIds.toString() + ')').run();
                                    }
                                    this.db.prepare(' DELETE FROM competition_match WHERE id in (' + arrMatchIds.toString() + ')').run();
                                }
                                this.db.prepare(' DELETE FROM competition_dk WHERE id in (' + arrExistIds.toString() + ')').run();
                            }
                            // === TH1: competition_dk thuộc insert -> Tạo thêm dữ liệu 
                            console.log('=== TH1: competition_dk thuộc insert -> Tạo thêm dữ liệu ');
                            // thêm dữ liệu vào competition_dk -> thành công lấy competition_dk_id 
                            const insertCompetitionDKStmt = this.db.prepare(' INSERT INTO competition_dk (sheet_name, file_name, data) VALUES (?, ?, ?)').run(record_data.sheet_name, record_data.file_name, record_data.data);
                            const competition_dk_id = insertCompetitionDKStmt.lastInsertRowid;
                            if (competition_dk_id && list.length > 0) {
                                // insert list 
                                const placeholders = list.slice(1).map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
                                const query = `
                                    INSERT INTO competition_match (
                                        competition_dk_id,
                                        match_no,
                                        row_index,
                                        red_name,
                                        red_team,
                                        blue_name,
                                        blue_team,
                                        match_name,
                                        match_type
                                    )
                                    VALUES ${placeholders}
                                `;
                                const values = list.slice(1).map((row, index) => [
                                    competition_dk_id,
                                    row[0] != null ? row[0] : '',
                                    index,
                                    row[3] != null ? row[3] : '',
                                    row[4] != null ? row[4] : '',
                                    row[6] != null ? row[6] : '',
                                    row[7] != null ? row[7] : '',
                                    row[1] != null ? row[1] : '',
                                    row[2] != null ? row[2] : ''
                                ]);
                                const flatValues = values.flat();
                                const insertCompetitionMatchStmt = this.db.prepare(query).run(flatValues);
                            }

                        } else if (table_name === 'competition_dk' && action === 'update' && type_list == 'DK') {
                            // === TH2: competition_dk thuộc update
                            console.log('=== TH2: competition_dk thuộc update')
                            const updateCompetitionDKStmt = this.db.prepare(' UPDATE competition_dk SET sheet_name = ?, file_name = ?, data = ? WHERE id = ?')
                                .run(record_data.sheet_name, record_data.file_name, record_data.data, mapping_to_id)

                            // Xoá dữ liệu 
                            const deleteCompetitionMatchStmt = this.db.prepare(' DELETE FROM competition_match WHERE competition_dk_id = ?')
                                .run(mapping_to_id)

                            // thêm mới lại competition_match
                            const list = JSON.parse(record_data.data) ?? [];
                            if (list.length > 0) {
                                // insert list 
                                const placeholders = list.slice(1).map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
                                const query = `
                                    INSERT INTO competition_match (
                                        competition_dk_id,
                                        match_no,
                                        row_index,
                                        red_name,
                                        red_team,
                                        blue_name,
                                        blue_team,
                                        match_name,
                                        match_type                                        
                                    )
                                    VALUES ${placeholders}
                                `;

                                const values = list.slice(1).map((row, index) => [
                                    competition_dk_id,
                                    row[0] != null ? row[0] : '',
                                    index,
                                    row[3] != null ? row[3] : '',
                                    row[4] != null ? row[4] : '',
                                    row[6] != null ? row[6] : '',
                                    row[7] != null ? row[7] : '',
                                    row[1] != null ? row[1] : '',
                                    row[2] != null ? row[2] : ''
                                ]);
                                const flatValues = values.flat();
                                const insertCompetitionMatchStmt = this.db.prepare(query).run(flatValues);
                            }
                        } else if (table_name === 'competition_dk' && action === 'insert' && ['SOL', 'TUV', 'DOL', 'VON', 'DAL'].includes(type_list)) {
                            // === TH: THI QUYỀN/VÕ NHẠC
                            console.log('=== TH1: THI QUYỀN/VÕ NHẠC | insert')
                            const insertQuyenStmt = this.db.prepare(' INSERT INTO competition_dk (sheet_name, file_name, data) VALUES (?, ?, ?)').run(record_data.sheet_name, record_data.file_name, record_data.data);
                            const competition_dk_id = insertQuyenStmt.lastInsertRowid;
                            if (competition_dk_id && list.length > 0) {
                                let teams = [];
                                if (type_list == 'DOL') { // 2 VĐV                                
                                    for (let i = 1; i < list.length; i++) {
                                        const row = list[i];
                                        const athletes = [{ name: row[2], unit: row[3] }];
                                        teams.push({
                                            competition_dk_id: competition_dk_id,
                                            match_no: row[0],
                                            row_index: (i - 1),
                                            config_system: null,
                                            match_name: row[4],
                                            match_status: "WAI",
                                            match_type: "DOL",
                                            team_name: row[3],
                                            athletes: athletes
                                        });
                                    }
                                    // thực hiện tạo 
                                    const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                    console.log('DOL ', result)
                                } else if (type_list == 'DAL') {
                                    for (let i = 1; i < list.length; i += 4) {
                                        const row = list[i];
                                        const row2 = list[i + 1];
                                        const row3 = list[i + 2];
                                        const row4 = list[i + 3];
                                        const athletes = [
                                            { name: row[2], unit: row[3] },
                                            { name: row2[2], unit: row2[3] },
                                            { name: row3[2], unit: row3[3] },
                                            { name: row4[2], unit: row4[3] }
                                        ];
                                        teams.push({
                                            competition_dk_id: competition_dk_id,
                                            match_no: row[0],
                                            row_index: (i - 1),
                                            config_system: null,
                                            match_name: row[4],
                                            match_status: "WAI",
                                            match_type: "DAL",
                                            team_name: row[3],
                                            athletes: athletes
                                        });
                                    }
                                    // thực hiện tạo 
                                    const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                    console.log('DAL ', result)
                                } else if (type_list == 'SOL') {
                                    for (let i = 1; i < list.length; i += 2) {
                                        const row = list[i];
                                        const row2 = list[i + 1];
                                        const athletes = [
                                            { name: row[2], unit: row[3] },
                                            { name: row2[2], unit: row2[3] }
                                        ];
                                        teams.push({
                                            competition_dk_id: competition_dk_id,
                                            match_no: row[0],
                                            row_index: (i - 1),
                                            config_system: null,
                                            match_name: row[4],
                                            match_status: "WAI",
                                            match_type: "SOL",
                                            team_name: row[3],
                                            athletes: athletes
                                        });
                                    }
                                    // thực hiện tạo 
                                    const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                    console.log('SOL ', result)
                                } else if (type_list == 'TUV') {
                                    for (let i = 1; i < list.length; i += 2) {
                                        const row = list[i];
                                        const row2 = list[i + 1];
                                        const athletes = [
                                            { name: row[2], unit: row[3] },
                                            { name: row2[2], unit: row2[3] }
                                        ];
                                        teams.push({
                                            competition_dk_id: competition_dk_id,
                                            match_no: row[0],
                                            row_index: (i - 1),
                                            config_system: null,
                                            match_name: row[4],
                                            match_status: "WAI",
                                            match_type: "TUV",
                                            team_name: row[3],
                                            athletes: athletes
                                        });
                                    }
                                    // thực hiện tạo 
                                    const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                    console.log('TUV ', result)
                                } else if (type_list == 'VON') {
                                    // thực hiện võ nhạc  
                                    let count = 0
                                    for (let i = 1; i < list.length; i += count) {
                                        const row = list[i];
                                        count = row[5] ?? 0
                                        const athletes = [];
                                        for (let j = 0; j < count; j++) {
                                            athletes.push({ name: list[i + j][3], unit: list[i + j][2] })
                                        }
                                        if (count <= 1) athletes.push({ name: row[3], unit: row[2] })
                                        teams.push({
                                            competition_dk_id: competition_dk_id,
                                            match_no: row[0],
                                            row_index: (i - 1),
                                            config_system: null,
                                            match_name: row[4],
                                            match_status: "WAI",
                                            match_type: "VON",
                                            team_name: row[2],
                                            athletes: athletes
                                        });

                                    }
                                    // thực hiện tạo 
                                    const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                    console.log('VON ', result)
                                }
                            }
                        } else if (table_name === 'competition_dk' && action === 'update' && ['SOL', 'TUV', 'DOL', 'VON', 'DAL'].includes(type_list)) {
                            // === TH: THI QUYỀN/VÕ NHẠC                            
                            console.log('=== TH2: THI QUYỀN/VÕ NHẠC | update')
                            // cập nhât 
                            const updateCompetitionDKStmt = this.db.prepare(' UPDATE competition_dk SET sheet_name = ?, file_name = ?, data = ? WHERE id = ?')
                                .run(record_data.sheet_name, record_data.file_name, record_data.data, mapping_to_id)

                            // lấy thông tin competition_match_team dựa trên competition_dk_id
                            const listTeams = this.db.prepare(' SELECT id FROM competition_match_team WHERE competition_dk_id = ?').all(mapping_to_id);
                            if (listTeams.length > 0) {
                                const arrTeamIds = listTeams.map(team => team.id);
                                console.log('Xoá: ', arrTeamIds.toString())
                                // xoá competition_match_team
                                const deleteCompetitionMatchTeamAthleteStmt = this.db.prepare(' DELETE FROM competition_match_team_athlete WHERE team_id IN (' + arrTeamIds.toString() + ')').run();
                                const deleteCompetitionMatchTeamStmt = this.db.prepare(' DELETE FROM competition_match_team WHERE competition_dk_id IN (' + mapping_to_id + ')').run();
                            }
                            if (mapping_to_id && list.length > 0) {
                                let teams = [];
                                if (type_list == 'DOL') { // 2 VĐV                                
                                    for (let i = 1; i < list.length; i++) {
                                        const row = list[i];
                                        const athletes = [{ name: row[2], unit: row[3] }];
                                        teams.push({
                                            competition_dk_id: mapping_to_id,
                                            match_no: row[0],
                                            row_index: (i - 1),
                                            config_system: null,
                                            match_name: row[4],
                                            match_status: "WAI",
                                            match_type: "DOL",
                                            team_name: row[3],
                                            athletes: athletes
                                        });
                                    }
                                    // thực hiện tạo 
                                    const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                    console.log('DOL ', result)
                                } else if (type_list == 'DAL') {
                                    for (let i = 1; i < list.length; i += 4) {
                                        const row = list[i];
                                        const row2 = list[i + 1];
                                        const row3 = list[i + 2];
                                        const row4 = list[i + 3];
                                        const athletes = [
                                            { name: row[2], unit: row[3] },
                                            { name: row2[2], unit: row2[3] },
                                            { name: row3[2], unit: row3[3] },
                                            { name: row4[2], unit: row4[3] }
                                        ];
                                        teams.push({
                                            competition_dk_id: mapping_to_id,
                                            match_no: row[0],
                                            row_index: (i - 1),
                                            config_system: null,
                                            match_name: row[4],
                                            match_status: "WAI",
                                            match_type: "DAL",
                                            team_name: row[3],
                                            athletes: athletes
                                        });
                                    }
                                    // thực hiện tạo 
                                    const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                    console.log('DAL ', result)
                                } else if (type_list == 'SOL') {
                                    for (let i = 1; i < list.length; i += 2) {
                                        const row = list[i];
                                        const row2 = list[i + 1];
                                        const athletes = [
                                            { name: row[2], unit: row[3] },
                                            { name: row2[2], unit: row2[3] }
                                        ];
                                        teams.push({
                                            competition_dk_id: mapping_to_id,
                                            match_no: row[0],
                                            row_index: (i - 1),
                                            config_system: null,
                                            match_name: row[4],
                                            match_status: "WAI",
                                            match_type: "SOL",
                                            team_name: row[3],
                                            athletes: athletes
                                        });
                                    }
                                    // thực hiện tạo 
                                    const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                    console.log('SOL ', result)
                                } else if (type_list == 'TUV') {
                                    for (let i = 1; i < list.length; i += 2) {
                                        const row = list[i];
                                        const row2 = list[i + 1];
                                        const athletes = [
                                            { name: row[2], unit: row[3] },
                                            { name: row2[2], unit: row2[3] }
                                        ];
                                        teams.push({
                                            competition_dk_id: mapping_to_id,
                                            match_no: row[0],
                                            row_index: (i - 1),
                                            config_system: null,
                                            match_name: row[4],
                                            match_status: "WAI",
                                            match_type: "TUV",
                                            team_name: row[3],
                                            athletes: athletes
                                        });
                                    }
                                    // thực hiện tạo 
                                    const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                    console.log('TUV ', result)
                                } else if (type_list == 'VON') {
                                    // thực hiện võ nhạc  
                                    let count = 0
                                    for (let i = 1; i < list.length; i += count) {
                                        const row = list[i];
                                        count = row[5] ?? 0
                                        const athletes = [];
                                        for (let j = 0; j < count; j++) {
                                            athletes.push({ name: list[i + j][3], unit: list[i + j][2] })
                                        }
                                        if (count <= 1) athletes.push({ name: row[3], unit: row[2] })
                                        teams.push({
                                            competition_dk_id: mapping_to_id,
                                            match_no: row[0],
                                            row_index: (i - 1),
                                            config_system: null,
                                            match_name: row[4],
                                            match_status: "WAI",
                                            match_type: "VON",
                                            team_name: row[2],
                                            athletes: athletes
                                        });

                                    }
                                    // thực hiện tạo 
                                    const result = await dbCompetitionMatchTeamService.bulkCreateTeams(teams);
                                    console.log('VON ', result)
                                }
                            }
                        } else {
                            // === TH3: Khác (xử lý sau)
                            const allColumns = Object.keys(record_data);
                            const columns = allColumns.filter(col => col !== 'id' && dbColumns.includes(col));
                            const placeholders = columns.map(() => '?').join(', ');
                            if (action === 'insert') {
                                // Insert new record
                                const insertStmt = this.db.prepare(
                                    `INSERT INTO ${table_name}(${columns.join(', ')}) VALUES (${placeholders})`
                                );
                                const values = columns.map(col => record_data[col]);
                                insertStmt.run(...values);
                                results.inserted++;
                            } else if (action === 'update' && mapping_to_id) {
                                // Update existing record
                                const setClause = columns.map(col => `${col} = ?`).join(', ');
                                const updateStmt = this.db.prepare(
                                    `UPDATE ${table_name} SET ${setClause} WHERE id = ?`
                                );
                                const values = [...columns.map(col => record_data[col]), mapping_to_id];
                                updateStmt.run(...values);
                                results.updated++;
                            } else if (action === 'skip') {
                                results.skipped++;
                            }
                        }
                    }

                    // Mark as approved
                    this.db.prepare(`UPDATE sync_staging SET status = 'approved' WHERE id = ?`).run(staging.id);
                } catch (error) {
                    console.error('Error applying staging record:', error);
                    results.errors.push({
                        staging_id: staging.id,
                        error: error.message
                    });
                }
            }

            return results;
        } catch (error) {
            console.error('Error applying staging changes:', error);
            throw error;
        }
    }

    /**
     * Xóa staging session
     */
    async deleteStagingSession(sessionId) {
        try {
            this.db.prepare(`DELETE FROM sync_staging WHERE session_id = ?`).run(sessionId);
            return { success: true };
        } catch (error) {
            console.error('Error deleting staging session:', error);
            throw error;
        }
    }
}

module.exports = new SyncService();

