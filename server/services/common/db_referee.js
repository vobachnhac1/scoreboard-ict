const { BetterSQLiteWrapper } = require('./db_better_sqlite3');
const { DB_SCHEME, TABLE } = require('./constant_sql');

class DBRefereeService {
    constructor() {
        this.db = new BetterSQLiteWrapper(DB_SCHEME);
        this.db.serialize(() => {
            this.db.run(TABLE.CRE_REF);
            // Migration: Add new columns if missing
            const columns = this.db.all("PRAGMA table_info(referees)");
            const colNames = columns.map(c => c.name);

            if (!colNames.includes('is_ref_machine')) {
                try { this.db.run("ALTER TABLE referees ADD COLUMN is_ref_machine INTEGER DEFAULT 0"); } catch (e) { }
            }
            if (!colNames.includes('is_ref_court')) {
                try { this.db.run("ALTER TABLE referees ADD COLUMN is_ref_court INTEGER DEFAULT 0"); } catch (e) { }
            }
        });
    }

    // Lấy tất cả trọng tài
    getAllReferees() {
        const rows = this.db.all(`
            SELECT r.*
            FROM referees r
            ORDER BY r.id DESC
        `);
        return rows.map(row => {
            const r = { ...row };
            const clean = (v) => Math.round(Number(v || 0));
            for (let i = 1; i <= 7; i++) r[`r${i}`] = clean(r[`r${i}`]);
            r.is_ref_machine = clean(r.is_ref_machine);
            r.is_ref_court = clean(r.is_ref_court);
            return r;
        });
    }

    // Thêm mới
    insertReferee(data) {
        const { full_name, unit, country, r1, r2, r3, r4, r5, r6, r7, is_ref_machine, is_ref_court } = data;
        const toB = (v) => (v === true || v === 1 || v === "true" || v === "1" || v === "X") ? 1 : 0;
        const result = this.db.run(`
            INSERT INTO referees (full_name, unit, country, r1, r2, r3, r4, r5, r6, r7, is_ref_machine, is_ref_court) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            full_name, unit, country,
            toB(r1), toB(r2), toB(r3), toB(r4), toB(r5), toB(r6), toB(r7),
            toB(is_ref_machine), toB(is_ref_court)
        ]);
        return { id: result.lastID, ...data };
    }

    // Bulk insert (Import từ Excel)
    insertListReferee(list) {
        try {
            const insert = this.db.db.prepare(`
                INSERT INTO referees (full_name, unit, country, r1, r2, r3, r4, r5, r6, r7, is_ref_machine, is_ref_court)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            const toB = (v) => (v === true || v === 1 || v === "true" || v === "1" || v === "X") ? 1 : 0;
            const insertMany = this.db.db.transaction((items) => {
                for (const item of items) {
                    insert.run([
                        item.full_name,
                        item.unit,
                        item.country,
                        toB(item.r1),
                        toB(item.r2),
                        toB(item.r3),
                        toB(item.r4),
                        toB(item.r5),
                        toB(item.r6),
                        toB(item.r7),
                        toB(item.is_ref_machine),
                        toB(item.is_ref_court)
                    ]);
                }
            });

            insertMany(list);
            return true;
        } catch (error) {
            console.error('Error insertListReferee:', error);
            throw error;
        }
    }

    // Update
    updateReferee(id, data) {
        const { full_name, unit, country, r1, r2, r3, r4, r5, r6, r7, is_ref_machine, is_ref_court } = data;
        const toB = (v) => (v === true || v === 1 || v === "true" || v === "1" || v === "X") ? 1 : 0;
        this.db.run(`
            UPDATE referees SET 
                full_name = ?,
                unit = ?,
                country = ?,
                r1 = ?, r2 = ?, r3 = ?, r4 = ?, r5 = ?, r6 = ?, r7 = ?,
                is_ref_machine = ?, is_ref_court = ?,
                updated_at = DATETIME('now')
            WHERE id = ?
        `, [
            full_name, unit, country,
            toB(r1), toB(r2), toB(r3), toB(r4), toB(r5), toB(r6), toB(r7),
            toB(is_ref_machine), toB(is_ref_court),
            id
        ]);
        return { id, ...data };
    }

    // Xoá
    deleteReferee(id) {
        this.db.run(`DELETE FROM referees WHERE id = ?`, [id]);
        return { id };
    }

    // Xoá tất cả
    deleteAllReferees() {
        this.db.run(`DELETE FROM referees`);
        return true;
    }

    // Search
    searchReferees(keyword) {
        const rows = this.db.all(`
            SELECT r.*
            FROM referees r
            WHERE r.full_name LIKE ? OR r.unit LIKE ? OR r.country LIKE ?
            ORDER BY r.id DESC
        `, [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]);
        return rows.map(row => {
            const r = { ...row };
            const clean = (v) => Math.round(Number(v || 0));
            for (let i = 1; i <= 7; i++) r[`r${i}`] = clean(r[`r${i}`]);
            r.is_ref_machine = clean(r.is_ref_machine);
            r.is_ref_court = clean(r.is_ref_court);
            return r;
        });
    }
}

const instance = new DBRefereeService();
module.exports = instance;
