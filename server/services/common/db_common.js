const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const {DB_SCHEME, TABLE} = require('./constant_sql')

// commons
class DBCommonsService {
    constructor() {
        this.db = new sqlite3.Database(DB_SCHEME);
        this.db.serialize(() => {
            this.db.run(TABLE.CRE_COM); 
            this.getAllCommon().then(data=>{
                if(data.length == 0){
                    
                    const stmt = this.db.prepare(`INSERT INTO commons (category_type, key, value, description, num_member) VALUES (?, ?, ?, ?, ?)`);
                    const data = [
                        // Giới tính
                        ['gender','M','Nam', 'Giới tính', 0],
                        ['gender','F','Nữ', 'Giới tính', 0],
                        ['gender','O','Khác', 'Giới tính',0],
                        ['gender','M,F','Nam/Nữ', 'Giới tính',0],

                        ['champ_comp_type','DK','Đối kháng', 'Đối kháng',0],
                        ['champ_comp_type','QU','Quyền', 'Quyền',0],

                        // Loại thi đấu quyền
                        ['qu_type','DON','Đơn luyện', '', 1], 
                        ['qu_type','DAL','Đa luyện', '', 4], 
                        ['qu_type','DDO','Đồng đội', '', 6],  
                        ['qu_type','TUV','Tự vệ', '', 2], 
                        ['qu_type','SON','Song luyện', '', 2], 
                        ['qu_type','VON','Võ nhạc', '', 6], 
                        ['qu_type','OTH','Khác', '', 1], 

                        // Trạng thái giải đấu
                        ['champion_type','NEW','Tạo mới', '', 0], 
                        ['champion_type','PRO','Chờ đăng ký', '', 0], 
                        ['champion_type','COM','Hoàn thiện đăng ký', '', 0],   
                        ['champion_type','RAN','Bốc thăm', '', 0], 
                        ['champion_type','IN','Đang diễn ra', '', 0], 
                        ['champion_type','FIN','Kết thúc', '', 0], 
                        ['champion_type','CAN','Huỷ', '', 0], 
                        ['champion_type','PEN','Tạm hoãn', '', 0],  
                        ['champion_type','OTH','Khác', '', 0], 

                        // trạng thái trận đấu
                        ['match_type','WAI','Chờ', '', 0], 
                        ['match_type','IN','Đang diễn ra', '', 0], 
                        ['match_type','FIN','Kết thúc', '', 0], 
                        ['match_type','CAN','Huỷ', '', 0], 
                        ['match_type','OTH','Khác', '', 0], 

                        // 

                    ];
                    data.forEach(([category_type, key, value, description, num_member]) => {
                        stmt.run(category_type, key, value, description, num_member); 
                    });
                    stmt.finalize();
                }
            }).catch(err=>console.log(err));

        })
 
    }

    getAllCommon(){
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM commons", [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
    // lấy dữ liệu theo category_type
    getListCommonByCategory(category_type) {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM commons WHERE category_type = ?", [category_type], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // thêm mới
    insertCommon(data) {
        const {category_type, key, value, description, num_member} = data
        return new Promise((resolve, reject) => {
            this.db.run(`INSERT INTO commons 
                        (category_type, key, value, description, num_member) 
                        VALUES (?, ?, ?, ?, ?)`,
                [category_type, key, value, description, num_member], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
        });
    }

    updateCommon(id, data) {
        const {category_type, key, value, description, num_member} = data
        return new Promise((resolve, reject) => {
            this.db.run(`
                    UPDATE commons SET 
                        category_type = ?,
                        key = ?,
                        value = ?,
                        description = ?,
                        num_member = ?
                    WHERE id = ?
                `,
                [category_type, key, value, description, num_member, id], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
            });
        });
    }
     // xoá  
     deleteCommon(id, data) {
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM commons WHERE id = ?", [id], 
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id, ...data });
                    }
                });
        });
    }

}

const instance = new DBCommonsService ();
module.exports = instance;
