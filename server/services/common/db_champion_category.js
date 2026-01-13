const { BetterSQLiteWrapper } = require('./db_better_sqlite3');
const fs = require('fs');
const {DB_SCHEME, TABLE} = require('./constant_sql')

class DBChampCategoryService {
    constructor() {
        this.db = new BetterSQLiteWrapper(DB_SCHEME);
        this.db.serialize(() => {
            this.db.run(TABLE.CRE_CHP_CG);
        })
    }

    // Thêm mới
    createCatetory(body){
        const { category_key, category_name, description } = body
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO 
                    champion_category (category_key, category_name, description)
                VALUES (?, ?, ?)
            `;
            this.db.run(query, [category_key, category_name, description], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    };

    // Cập nhật
    updateCatetory(id, body){
        const {category_key, category_name, description } = body;
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE champion_category
                SET category_key = ?, category_name = ?,  description = ?, updated_at = datetime('now')
                WHERE id = ?
            `;
            this.db.run(query, [category_key, category_name, description, id], function (err) {
                if (err) {
                    console.log('err: ', err);
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    // Xoá
    deleteCatetory(id) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM champion_category WHERE id = ?`;
            this.db.run(query, [id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
        });
    }

    // Lấy thông tin
    getCatetory() {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM champion_category ORDER BY ID DESC`;
            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

const instance = new DBChampCategoryService ();
module.exports = instance;
