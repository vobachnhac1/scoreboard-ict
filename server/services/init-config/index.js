const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
// Thực hiện khi nào
// Tạo mới 1 record khi chưa có 1 dữ liệu nào
// Cập nhật dữ liệu mới nhất sau khi gọi API kích hoạt thành công.

class InitConfigService {
    constructor() {
        this.db = new sqlite3.Database('./database.sqlite');
        this.db.serialize(() => {
            // table initconfig
            this.db.run(`
                CREATE TABLE IF NOT EXISTS initconfig (
                    mac_address TEXT PRIMARY KEY,
                    uuid_desktop TEXT KEY,
                    key_license TEXT NOT NULL,
                    total_device_desktop INTEGER DEFAULT 0,
                    total_device_app INTEGER DEFAULT 0,
                    use_desktop INTEGER DEFAULT 0,
                    use_app INTEGER DEFAULT 0,
                    expired_date TEXT,       -- ISO 8601 format: YYYY-MM-DD
                    active_date TEXT,        -- ISO 8601 format
                    promotion_code TEXT,
                    room_code TEXT
                )
            `);  

            // table config_values  => màn hình cấu hình hệ thống
            this.db.run(`
                CREATE TABLE IF NOT EXISTS config_values (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT NOT NULL,
                    child_key TEXT,
                    value TEXT
                )
            `); 

            // table license_child
            this.db.run(`
                CREATE TABLE IF NOT EXISTS license_child (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key_license TEXT NOT NULL,
                    uuid_desktop TEXT NOT NULL,
                    device_id TEXT,
                    expired_date TEXT
                )
            `);  
            
            
            /**
             * 
             * const common = [
             *  ['gender','G01','Nữ'], 
             *  ['gender','G02','Nam'], 
             *  ['gender','G03','Khác'], 
             *  ['qu_type','DON','Đơn luyện'], 
             *  ['qu_type','DAL','Đa luyện'], 
             *  ['qu_type','DDO','Đồng đội'], 
             *  ['qu_type','TUV','Tự vệ'], 
             *  ['qu_type','SON','Song luyện'], 
             *  ['qu_type','VON','Võ nhạc'], 
             *  ['qu_type','OTH','Khác'], 
             * ]
             * 
             *  */ 

            this.getAllKeyValue().then(data=>{
                if(data.length == 0){
                    // insert lần đầu
                    const stmt = this.db.prepare("INSERT INTO config_values (key, child_key, value) VALUES (?, ?, ?)");
                    const data = [
                        ['system', 'mon_thi', '3'],
                        ['system', 'so_giam_dinh', '3'],
                        ['system', 'so_hiep', '2'],
                        ['system', 'so_hiep_phu', '1'],
                        ['system', 'he_diem', '1'], // 1,2,3

                        ['system', 'cau_hinh_doi_khang_diem_thap', '1'], // 1: Có | 0: Không
                        ['system', 'cau_hinh_quyen_tinh_tong', '0'],     // 1: Có | 0: Không
                        ['system', 'cau_hinh_y_te', '1'],                // 1: Có | 0: Không
                        ['system', 'cau_hinh_xoa_nhac_nho', '1'],        // 1: Có | 0: Không
                        ['system', 'cau_hinh_xoa_canh_cao', '1'],        // 1: Có | 0: Không
                        ['system', 'cau_hinh_tinh_diem_tuyet_doi', '1'], // 1: Có | 0: Không
                        ['system', 'cau_hinh_hinh_thuc_quyen', '1'],     // 1: Có | 0: Không
                        ['system', 'cau_hinh_hinh_thuc_doikhang', '1'],  // 1: Có | 0: Không

                        ['system', 'thoi_gian_tinh_diem', '1000'],
                        ['system', 'thoi_gian_thi_dau', '90'],
                        ['system', 'thoi_gian_nghi', '30'],
                        ['system', 'thoi_gian_hiep_phu', '60'],
                        ['system', 'thoi_gian_y_te', '120'],

                        ['system', 'khoang_diem_tuyet_toi', '10'],

                        ['system', 'che_do_app', '1'], // chế độ chỉ dùng Thi đối kháng đơn giản | Thi quyền đơn giản 

                        ['competition', 'ten_giai', 'GIẢI VÔ ĐỊCH THỂ DỤC THỂ THAO NĂM 2025'],
                        ['competition', 'thoi_gian_bat_dau', '07-07-2025'],
                        ['competition', 'thoi_gian_ket_thuc', '10-07-2025'],
                        ['competition', 'dia_diem', 'QUẬN BÌNH TÂN, HỒ CHÍ MINH'],
                        ['competition', 'logo', 'logo'],

                        // dữ liệu chung
                        // giới tính/ hình thức quyền/
                    ]
                    data.forEach(([key, child_key, value]) => {
                        stmt.run(key, child_key, value);
                    });
                    stmt.finalize();
                    // INSERT INTO config_values (key, child_key, value) VALUES
                    // ('license', 'mac_address', '00:1A:2B:3C:4D:5E'),
                    // ('license', 'key_license', 'ABC-123-XYZ'),
                    // ('license', 'expired_date', '2025-12-31'),
                    // ('license', 'active_date', '2025-01-01'),
                    // ('license', 'promotion_code', 'PROMO50'),
    
                }
            }).catch(err=>console.log(err));
            
        });

        this.backup()

    }
    // Backup JSON 
    backup(){
        this.db.serialize(() => {
            this.db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
                if (err) throw err;
            
                const exportData = {};
                let completed = 0;
            
                tables.forEach( (table) => {
                    const tableName = table.name;
                    this.db.all(`SELECT * FROM ${tableName}`, async (err, rows) => {
                        if (err) throw err;
                        exportData[tableName] = rows;
                        completed++;
                
                        if (completed === tables.length) {
                        await fs.writeFileSync('./backup/backup.json', JSON.stringify(exportData, null, 2));
                        console.log('✅ Exported to backup.json');
                        }
                    });
                });
            });
        });
    }
  
    getAllConfig() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM initconfig", [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    };

    getConfigByMacaddress(id) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM initconfig WHERE mac_address = ?", [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    };

    getConfigByUUID(id) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM initconfig WHERE uuid_desktop = ?", [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    };

    getConfigByLicense(id) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM initconfig WHERE key_license = ?", [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    };

    // thêm mới 
    // ✅ Hàm tạo mã random 10 ký tự
    randomCode(length = 10) {
        return [...Array(length)].map(() =>
            Math.floor(Math.random() * 36).toString(36)
        ).join('').toUpperCase();
    }

    insertConfig(data) {
        const room_code = this.randomCode(10)
        const {uuid_desktop, mac_address, key_license, total_device_desktop, total_device_app, use_desktop, use_app, expired_date, active_date, promotion_code} = data
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO initconfig 
                        (uuid_desktop, mac_address, key_license, total_device_desktop, total_device_app, use_desktop, use_app, expired_date, active_date, promotion_code, room_code) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                // [data.mac_address, null, 0,0,0,0, '20251231', '20250101', 'FREE'], 
                [uuid_desktop, mac_address, key_license, total_device_desktop, total_device_app, use_desktop, use_app, expired_date, active_date, promotion_code, room_code], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
        });
    }

    // cập nhật
    updateConfig(id, data) {
        const room_code = this.randomCode(10)
        return new Promise((resolve, reject) => {
            this.db.run(`   UPDATE initconfig SET 
                                key_license = ?,
                                uuid_desktop = ?,
                                total_device_desktop = ?,
                                total_device_app = ?,
                                use_desktop = ?,
                                use_app = ?,
                                expired_date = ?,
                                active_date = ?,
                                promotion_code = ?,
                                mac_address = ?,
                                room_code = ?
                            WHERE uuid_desktop = ?
                        `,
                [data.key_license, data.uuid_desktop, data.total_device_desktop ?? 0, data.total_device_app ?? 0, data.use_desktop ?? 0, data.use_app ?? 0, 
                    data.expired_date, data.active_date, data.promotion_code, data.mac_address, room_code, id ], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, ...data });
                    }
                });
        });
    }

    // xoá  
    deleteConfig(data) {
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM initconfig WHERE uuid_desktop = ?", [id], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, ...data });
                    }
                });
        });
    }

    /// ------ Table Key -Value  ---------///
    getAllKeyValue() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM config_values", [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    };

    getAllKeyValueByKey(key) {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM config_values where key = ?", [key], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    };

    // thêm mới 
    inserteKeyValue(data) {
        const {key, child_key, value} = data
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO config_values (key, child_key, value) VALUES (?, ?, ?)`,
                [key, child_key, value], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
        });
    }

    updateKeyValueByKey(id, data){
        return new Promise((resolve, reject) => {
            this.db.run(`   UPDATE config_values SET 
                                key = ?,
                                child_key = ?,
                                value = ?
                            WHERE id = ?
                        `,
                [data.key, data.child_key, data.value, data.id], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, ...data });
                    }
                });
        });
    }

    deleteKeyValueByKey(id, data){
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM config_values WHERE id = ?", [id], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, ...data });
                    }
                });
        });
    }

    /// ----- TABLE: LICENSE_CHILD ----- ///
    // CREATE TABLE IF NOT EXISTS license_child (
    //     id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     key_license TEXT NOT NULL,
    //     uuid_desktop TEXT NOT NULL,
    //     device_id TEXT,
    //     expired_date TEXT)
    getAllLicenseChild() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM license_child", [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    };

    getLicenseChildByKey(key) {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM license_child where key_license = ?", [key], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }; 

    // thêm mới 
    insertLicenseChild(data) {
        const {key_license, uuid_desktop, device_id, expired_date} = data
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO license_child (key_license, uuid_desktop, device_id, expired_date) VALUES (?, ?, ?, ?)`,
                [key_license, uuid_desktop, device_id, expired_date], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
        });
    }

    // cập nhật
    updateLicenseChild(id, data){
        return new Promise((resolve, reject) => {
            const {key_license, uuid_desktop, device_id, expired_date} = data
            this.db.run(`   UPDATE license_child SET 
                                key_license = ?,
                                uuid_desktop = ?,
                                device_id = ?,
                                expired_date = ?
                            WHERE id = ?
                        `,
                [key_license, uuid_desktop, device_id, expired_date, id], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, ...data });
                    }
                });
        });
    }

    // Xoá
    deleteLicenseChild(id, data){
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM license_child WHERE id = ?", [id], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, ...data });
                    }
                });
        });
    }
    // tìm kiểm  key_license, uuid_desktop, device_id
    getLicenseChildByConndition(data) {
        const {key_license, uuid_desktop, device_id} = data
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM license_child where key_license = ? and uuid_desktop = ? and device_id = ?", [key_license, uuid_desktop, device_id], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    };

}
const instance = new InitConfigService()
module.exports = instance;
