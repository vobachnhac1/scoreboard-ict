const sqlite3 = require('sqlite3').verbose();
const { DB_SCHEME } = require('./constant_sql');
const { configureSQLite } = require('./db_config');

class DBCompetitionDKService {
    constructor() {
        this.db = configureSQLite(new sqlite3.Database(DB_SCHEME));
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS competition_dk (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    sheet_name TEXT NOT NULL,
                    file_name TEXT,
                    data TEXT NOT NULL,
                    created_at TEXT DEFAULT (datetime('now')),
                    updated_at TEXT DEFAULT (datetime('now'))
                )
            `);
        });
    }

    // Lấy tất cả dữ liệu
    getAllCompetitionDK() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM competition_dk ORDER BY created_at DESC", [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    // Parse JSON data
                    const parsedRows = rows.map(row => ({
                        ...row,
                        data: JSON.parse(row.data)
                    }));
                    resolve(parsedRows);
                }
            });
        });
    }

    // Lấy theo ID
    getCompetitionDKById(id) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM competition_dk WHERE id = ?", [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row) {
                        row.data = JSON.parse(row.data);
                    }
                    resolve(row);
                }
            });
        });
    }

    // Thêm mới
    insertCompetitionDK(body) {
        const { sheet_name, file_name, data } = body;
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO competition_dk (sheet_name, file_name, data)
                VALUES (?, ?, ?)
            `;
            this.db.run(query, [sheet_name, file_name, JSON.stringify(data)], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, sheet_name, file_name, data });
                }
            });
        });
    }

    // Cập nhật
    updateCompetitionDK(id, body) {
        const { sheet_name, file_name, data } = body;
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE competition_dk 
                SET sheet_name = ?, file_name = ?, data = ?, updated_at = datetime('now')
                WHERE id = ?
            `;
            this.db.run(query, [sheet_name, file_name, JSON.stringify(data), id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, changes: this.changes });
                }
            });
        });
    }

    // Xóa
    deleteCompetitionDK(id) {
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM competition_dk WHERE id = ?", [id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id, changes: this.changes });
                }
            });
        });
    }

    // Xóa theo sheet_name
    deleteBySheetName(sheet_name) {
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM competition_dk WHERE sheet_name = ?", [sheet_name], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ sheet_name, changes: this.changes });
                }
            });
        });
    }

    // Kiểm tra sheet_name đã tồn tại chưa
    checkSheetNameExists(sheet_name) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT id FROM competition_dk WHERE sheet_name = ?", [sheet_name], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(!!row);
                }
            });
        });
    }

    // Lấy competition_dk theo sheet_name
    getBySheetName(sheet_name) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM competition_dk WHERE sheet_name = ?", [sheet_name], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row && row.data) {
                        row.data = JSON.parse(row.data);
                    }
                    resolve(row);
                }
            });
        });
    }
}

const instance = new DBCompetitionDKService();
module.exports = instance;

