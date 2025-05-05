const sqlite3 = require('sqlite3').verbose();

class LicenseService {
    constructor() {
        this.db = new sqlite3.Database('./database.sqlite');
        this.db.serialize(() => {
            this.db.run(`
                CREATE TABLE IF NOT EXISTS license (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    client_key TEXT UNIQUE NOT NULL,
                    mac_address TEXT NOT NULL,
                    random_code TEXT NOT NULL,
                    valid_from TEXT NOT NULL DEFAULT (datetime('now')),
                    valid_to TEXT NOT NULL
                )
            `);
        });
        
    }

    // ✅ Hàm tạo mã random 10 ký tự
    randomCode(length = 10) {
        return [...Array(length)].map(() =>
            Math.floor(Math.random() * 36).toString(36)
        ).join('').toUpperCase();
    }

    getAllLicense() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM license", [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    getLicenseById(id) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM license WHERE id = ? OR client_key = ? OR mac_address = ?", [id, id, id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    getLicenseByKeyMac(client_key, mac_address) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM license WHERE client_key = ? OR mac_address = ?", [client_key, mac_address], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    createLicense(license) {
        return new Promise((resolve, reject) => {
            const randomCode = this.randomCode();
            this.db.run(
                "INSERT INTO license (client_key, mac_address, valid_to, random_code) VALUES (?, ?, ?, ?)",
                [license.client_key, license.mac_address, license.valid_to, randomCode],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({
                            id: this.lastID,
                            client_key: license.client_key,
                            mac_address: license.mac_address,
                            valid_to: license.valid_to,
                            random_code: randomCode
                        });
                    }
                }
            );
        });
    }

    updateLicense(id, license) {
        return new Promise((resolve, reject) => {
            this.db.run(
                "UPDATE license SET client_key = ?, mac_address = ?, valid_to = ? WHERE id = ?",
                [license.client_key, license.mac_address, license.valid_to, id],
                function (err) {
                    if (err) reject(err);
                    else resolve({ id, ...license });
                }
            );
        });
    }

    deleteLicense(id) {
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM license WHERE id = ?", [id], function (err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    }

    close() {
        this.db.close();
    }
}

module.exports = LicenseService;
