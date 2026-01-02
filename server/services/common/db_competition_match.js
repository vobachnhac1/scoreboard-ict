const sqlite3 = require('sqlite3').verbose();
const { DB_SCHEME } = require('./constant_sql');
const { configureSQLite } = require('./db_config');

/**
 * Service quản lý trận đấu từ competition_dk
 * - Lưu thông tin cặp đấu
 * - Lưu lịch sử kết quả thi đấu
 * - Lưu config system cho mỗi cặp thi đấu
 */
class DBCompetitionMatchService {
    constructor() {
        this.db = configureSQLite(new sqlite3.Database(DB_SCHEME));
        this.db.serialize(() => {
            // Bảng competition_match - Thông tin cặp đấu
            this.db.run(`
                CREATE TABLE IF NOT EXISTS competition_match (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    competition_dk_id INTEGER NOT NULL,
                    match_no TEXT NOT NULL,
                    row_index INTEGER NOT NULL,
                    red_name TEXT,
                    blue_name TEXT,
                    match_name TEXT,
                    team_name TEXT,
                    match_type TEXT DEFAULT 'DK',
                    winner TEXT,
                    match_status TEXT DEFAULT 'WAI',
                    config_system TEXT,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (competition_dk_id) REFERENCES competition_dk(id) ON DELETE CASCADE
                )
            `);

            // Migration: Thêm cột match_name nếu chưa có
            this.db.run(`
                ALTER TABLE competition_match ADD COLUMN match_name TEXT
            `, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Error adding match_name column:', err);
                }
            });

            // Migration: Thêm cột team_name nếu chưa có
            this.db.run(`
                ALTER TABLE competition_match ADD COLUMN team_name TEXT
            `, (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    console.error('Error adding team_name column:', err);
                }
            });

            // Bảng competition_match_history - Lịch sử kết quả thi đấu
            this.db.run(`
                CREATE TABLE IF NOT EXISTS competition_match_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    match_id INTEGER NOT NULL,
                    red_score INTEGER DEFAULT 0,
                    blue_score INTEGER DEFAULT 0,
                    red_remind INTEGER DEFAULT 0,
                    blue_remind INTEGER DEFAULT 0,
                    red_warn INTEGER DEFAULT 0,
                    blue_warn INTEGER DEFAULT 0,
                    red_mins INTEGER DEFAULT 0,
                    blue_mins INTEGER DEFAULT 0,
                    red_incr INTEGER DEFAULT 0,
                    blue_incr INTEGER DEFAULT 0,
                    round INTEGER DEFAULT 1,
                    round_type TEXT DEFAULT 'NORMAL',
                    confirm_attack INTEGER DEFAULT 0,
                    status TEXT DEFAULT 'WAI',
                    action_type TEXT,
                    action_by TEXT,
                    notes TEXT,
                    logs TEXT,
                    round_history TEXT,
                    created_at TEXT DEFAULT (datetime('now')),
                    FOREIGN KEY (match_id) REFERENCES competition_match(id) ON DELETE CASCADE
                )
            `);
        });
    }

    // Tạo match từ competition_dk row
    createMatch(body) {
        return new Promise((resolve, reject) => {
            const {
                competition_dk_id,
                match_no,
                row_index,
                red_name,
                blue_name,
                match_name,
                team_name,
                match_type,
                config_system
            } = body;

            const query = `
                INSERT INTO competition_match (
                    competition_dk_id,
                    match_no,
                    row_index,
                    red_name,
                    blue_name,
                    match_name,
                    team_name,
                    match_type,
                    config_system
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            this.db.run(query, [
                competition_dk_id,
                parseInt(match_no) || 0,
                row_index,
                red_name || null,
                blue_name || null,
                match_name || null,
                team_name || null,
                match_type || 'DK',
                JSON.stringify(config_system || {})
            ], function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }

    // Bulk create matches
    bulkCreateMatches(matches) {
        return new Promise((resolve, reject) => {
            const placeholders = matches.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
            const query = `
                INSERT INTO competition_match (
                    competition_dk_id,
                    match_no,
                    row_index,
                    red_name,
                    blue_name,
                    match_name,
                    team_name,
                    match_type,
                    config_system
                )
                VALUES ${placeholders}
            `;

            const values = [];
            matches.forEach(match => {
                values.push(
                    match.competition_dk_id,
                    parseInt(match.match_no) || 0,
                    match.row_index,
                    match.red_name || null,
                    match.blue_name || null,
                    match.match_name || null,
                    match.team_name || null,
                    match.match_type || 'DK',
                    JSON.stringify(match.config_system || {})
                );
            });

            this.db.run(query, values, function (err) {
                if (err) return reject(err);
                resolve({
                    count: this.changes,
                    lastID: this.lastID
                });
            });
        });
    }

    // Lấy match theo competition_dk_id
    getMatchesByCompetitionDKId(competition_dk_id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM competition_match WHERE competition_dk_id = ? ORDER BY match_no`;
            this.db.all(query, [competition_dk_id], (err, rows) => {
                if (err) return reject(err);
                const parsedRows = rows.map(row => ({
                    ...row,
                    config_system: row.config_system ? JSON.parse(row.config_system) : {}
                }));
                resolve(parsedRows);
            });
        });
    }

    // Lấy match theo id
    getMatchById(id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM competition_match WHERE id = ?`;
            this.db.get(query, [id], (err, row) => {
                if (err) return reject(err);
                if (row && row.config_system) {
                    row.config_system = JSON.parse(row.config_system);
                }
                resolve(row);
            });
        });
    }

    // Cập nhật match status
    updateMatchStatus(id, status, winner) {
        return new Promise((resolve, reject) => {
            let query = `
                UPDATE competition_match 
                SET match_status = ?, updated_at = datetime('now')
                WHERE id = ?
            `;

            if(winner ==  'none' ){
                query = `
                    UPDATE competition_match 
                    SET match_status = ?, updated_at = datetime('now'), winner = null
                    WHERE id = ?
                `;

            }
            
            this.db.run(query, [status, id], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }

    // Cập nhật winner
    updateWinner(id, winner) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE competition_match 
                SET winner = ?, match_status = 'FIN', updated_at = datetime('now')
                WHERE id = ?
            `;
            this.db.run(query, [winner, id], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }

    // Cập nhật config system
    updateConfigSystem(id, config_system) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE competition_match
                SET config_system = ?, updated_at = datetime('now')
                WHERE id = ?
            `;
            this.db.run(query, [JSON.stringify(config_system), id], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }

    // Thêm history record
    addHistory(body) {
        return new Promise((resolve, reject) => {
            const {
                match_id, red_score, blue_score, red_remind, blue_remind,
                red_warn, blue_warn, red_mins, blue_mins, red_incr, blue_incr,
                round, round_type, confirm_attack, status, action_type, action_by,
                notes, logs, roundHistory
            } = body;

            const query = `
                INSERT INTO competition_match_history (
                    match_id, red_score, blue_score, red_remind, blue_remind,
                    red_warn, blue_warn, red_mins, blue_mins, red_incr, blue_incr,
                    round, round_type, confirm_attack, status, action_type, action_by,
                    notes, logs, round_history
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            // Chuyển logs và roundHistory (array) thành JSON string
            const logsJson = logs ? JSON.stringify(logs) : null;
            const roundHistoryJson = roundHistory ? JSON.stringify(roundHistory) : null;

            this.db.run(query, [
                match_id,
                red_score || 0, blue_score || 0,
                red_remind || 0, blue_remind || 0,
                red_warn || 0, blue_warn || 0,
                red_mins || 0, blue_mins || 0,
                red_incr || 0, blue_incr || 0,
                round || 1,
                round_type || 'NORMAL',
                confirm_attack || 0,
                status || 'WAI',
                action_type || null,
                action_by || null,
                notes || null,
                logsJson,
                roundHistoryJson
            ], function (err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }

    // Lấy history theo match_id
    getHistoryByMatchId(match_id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM competition_match_history WHERE match_id = ? ORDER BY created_at DESC`;
            this.db.all(query, [match_id], (err, rows) => {
                if (err) return reject(err);

                // Parse logs và round_history từ JSON string thành array
                const parsedRows = rows.map(row => ({
                    ...row,
                    logs: row.logs ? JSON.parse(row.logs) : null,
                    round_history: row.round_history ? JSON.parse(row.round_history) : null
                }));

                resolve(parsedRows);
            });
        });
    }

    // Lấy history mới nhất
    getLatestHistory(match_id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM competition_match_history WHERE match_id = ? ORDER BY created_at DESC LIMIT 1`;
            this.db.get(query, [match_id], (err, row) => {
                if (err) return reject(err);

                // Parse logs và round_history từ JSON string thành array
                if (row) {
                    if (row.logs) {
                        row.logs = JSON.parse(row.logs);
                    }
                    if (row.round_history) {
                        row.round_history = JSON.parse(row.round_history);
                    }
                }

                resolve(row);
            });
        });
    }

    // Xóa match
    deleteMatch(id) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM competition_match WHERE id = ?`;
            this.db.run(query, [id], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }

    // Xóa tất cả match của competition_dk
    deleteMatchesByCompetitionDKId(competition_dk_id) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM competition_match WHERE competition_dk_id = ?`;
            this.db.run(query, [competition_dk_id], function (err) {
                if (err) return reject(err);
                resolve(this.changes);
            });
        });
    }
}

const instance = new DBCompetitionMatchService();
module.exports = instance;

