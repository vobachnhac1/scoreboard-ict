const dbChampionService = require('../services/common/db_champion');
const dbChampionGroupService = require('../services/common/db_champion_group');
const dbChampCategoryService = require('../services/common/db_champion_category');
const dbChampEventService = require('../services/common/db_champion_event');
const dbChampionGrpEventService = require('../services/common/db_champion_grp_event');
const dbCommonService = require('../services/common/db_common');
const dbChampionAthleteService = require('../services/common/db_champion_athlete');

// xử lý excel
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const ExcelJS = require('exceljs');


//#region Hàm chuyển đổi Encrypt

    const checkEncypt = async(type, input, out)=>{
        // type: 1: mã sheet | 2: mã nội dung dự thi | 3: name sheet
        // 2. Lấy thông tin Giới tính 
        const list_gender = await dbCommonService.getListCommonByCategory('gender');
        // 3. Lấy thông tin Hình thức: Đối kháng/Biểu diễn
        const list_champ_category = await dbChampCategoryService.getCatetory();

        if(type ==  1){
            // 1. Phân rã                
            const data = {
                category_key: input.substring(0, 2),
                cham_grp_id: input.substring(2, 5),
                gender_id: input.slice(-1)
            }
            //4. lấy thông tin nhóm thi
            const list_champ_grp = await dbChampionGroupService.getChampionGroupById(data.cham_grp_id);
            if(!list_champ_grp) return false;
            const is_gender_valid = list_gender.find(ele=> ele.key ==  data.gender_id)
            if(!is_gender_valid) return false;
            const is_category_valid = list_champ_category.find(ele=> ele.category_key ==  data.category_key)
            if(!is_category_valid) return false;
            if(out) return data
            return true
        }else if(type ==  2){
            const data = {
                cham_grp_id: Number(input.substring(0, 3)),
                gender_id: input.charAt(3),
                champ_grp_event_id: Number(input.slice(-4))
            }
            const list_champ_grp = await dbChampionGroupService.getChampionGroupById(data.cham_grp_id);
            if(!list_champ_grp) return false;
            const is_gender_valid = list_gender.find(ele=> ele.key ==  data.gender_id)
            if(!is_gender_valid) return false;
            const list_champ_grp_event = await dbChampionGrpEventService.getEventById(data.champ_grp_event_id);
            if(!list_champ_grp_event) return false;
            if(out) return data
            return true
        }else if(type ==  3){

        }

        return true;
    }

    const encrypt = (type, input)=>{
        // const code = list_champ_category[category].category_key + String(list_champ_grp[grp].id).padStart(3, '0') + 
        // VD: QU001M | 2 ký tự đầ Mã hình thức | Ký tự 3->5 mã nhóm thi | 1 ký tự cuối là giới tính
        // Mã Sheet: category_key + nhóm thi: QU001M
        // Nội dung thi
        // VD: 001F0022 | 3 ký tự đầu nhóm dự thi | ký tự 4 giới tính | 4 ký tự cuối là mã nội dung thi
        // type: 1: mã sheet | 2: mã nội dung dự thi | 3: name sheet
        if(type ==  1){
            const {category_key, cham_grp_id, gender_id} = input
            let code = category_key + String(cham_grp_id).padStart(3, '0') + gender_id;
            return code
        }else if(type == 2){
            const {champ_grp_event_id, cham_grp_id, gender_id} = input
            const id_event = String(cham_grp_id).padStart(3, '0') + gender_id + String(champ_grp_event_id).padStart(4, '0');
            return id_event
        }else if(type == 3){
            const {group_name, category_name, gender_name} = input
            return `${group_name}| ${category_name} - ${gender_name}`;
        }
        return ''
    }  

//#endregion

class ChampionController {
    
    //#region 1. API Quản lý giải đấu
        async getAllChampion(req, res) {
            try {
                const {query, body} = req;
                console.log('query, body: ', query, body);
                const tournaments = await dbChampionService.getAllChampion();
                res.json({
                    success: true,
                    message: "Lấy giải đấu thành công.",
                    data: tournaments
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

        async insertChampion (req, res) {
            try {
                const data = req.body;
                const { tournament_name, start_date, end_date, location } = req.body;
                if (!tournament_name || !start_date || !end_date || !location   ) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu thông tin giải đấu.",
                        data: {}
                    });
                }
                const result = await dbChampionService.insertChampion(data);
                res.status(201).json({
                    success: true,
                    message: "Tạo giải đấu thành công.",
                    data: result
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

        // Cập nhật Tournament
        async updateChampion(req, res)  {
            try {
                const id = req.params.id;
                const data = req.body;
                const { tournament_name, start_date, end_date, location } = req.body;
                if (!id || !tournament_name || !start_date || !end_date || !location   ) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu thông tin giải đấu.",
                        data: {}
                    });
                }
                const result = await dbChampionService.updateChampion(id, data);
                if (result.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy giải đấu để cập nhật.",
                        data: {}
                    });
                }

                res.json({
                    success: true,
                    message: "Cập nhật giải đấu thành công.",
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        };

        // Xóa Tournament
        async deleteChampion (req, res){
            try {
                const id = req.params.id;
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu ID giải đấu cần xóa.",
                        data: {}
                    });
                }
                const result = await dbChampionService.deleteChampion(id);
                if (result.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy giải đấu để xóa.",
                        data: {}
                    });
                }
    
                res.json({
                    success: true,
                    message: "Xóa giải đấu thành công.",
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

    //#endregion

    //#region 2. API lấy nhóm thi đấu
        async createChampionGroup(req, res) {
            try {
                const { name, description, tournament_id } = req.body;
                if (!name) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu tên nhóm thi đấu.",
                        data: {}
                    });
                }
                const result = await dbChampionGroupService.createChampionGroup(name, description, tournament_id);
                res.json({
                    success: true,
                    message: "Tạo nhóm thi đấu thành công.",
                    data: result
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

        async updateChampionGroup(req, res) {
            try {
                const { id } = req.params;
                const { name, description, tournament_id } = req.body;

                if (!id || !name) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu ID hoặc tên nhóm thi đấu cần cập nhật.",
                        data: {}
                    });
                }

                const result = await dbChampionGroupService.updateChampionGroup(id, name, description, tournament_id);
                if (result.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy nhóm thi đấu để cập nhật.",
                        data: {}
                    });
                }

                res.json({
                    success: true,
                    message: "Cập nhật nhóm thi đấu thành công.",
                    data: result
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

        async getChampionGroup(req, res) {
            try {
                const groups = await dbChampionGroupService.getChampionGroups();
                res.json({
                    success: true,
                    message: "Lấy danh sách nhóm thi đấu thành công.",
                    data: groups
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }
    
        async deleteChampionGroup(req, res) {
            try {
                const { id } = req.params;
    
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu ID nhóm thi đấu cần xóa.",
                        data: {}
                    });
                }
    
                const result = await dbChampionGroupService.deleteChampionGroup(id);
                if (result.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy nhóm thi đấu để xóa.",
                        data: {}
                    });
                }
    
                res.json({
                    success: true,
                    message: "Xóa nhóm thi đấu thành công.",
                    data: result
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

        async getChampionGroupById(req, res) {
            try {
                const { id } = req.query;        
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu ID nhóm thi đấu cần lấy.",
                        data: {}
                    });
                }
        
                const group = await dbChampionGroupService.getChampionGroupById(id);
        
                if (!group) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy nhóm thi đấu.",
                        data: {}
                    });
                }
        
                res.json({
                    success: true,
                    message: "Lấy nhóm thi đấu thành công.",
                    data: group
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

        async getChampionGroupsByChampion(req, res) {
            try {
                const { champ_id } = req.params;
        
                if (!champ_id) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu ID tên giải cần lấy.",
                        data: {}
                    });
                }
        
                const group = await dbChampionGroupService.getChampionGroupsByChampion(champ_id);
        
                if (!group) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy nhóm thi đấu.",
                        data: {}
                    });
                }
        
                res.json({
                    success: true,
                    message: "Lấy nhóm thi đấu thành công.",
                    data: group
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }
    //#endregion

    //#region 3. API Lấy hình thức dự thi
        async getAllChampionCategory(req, res) {
            try {
                const {query, body} = req;
                const categories = await dbChampCategoryService.getCatetory();
                if (!categories) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy hình thức",
                        data: {}
                    });
                }
                res.json({
                    success: true,
                    message: "Lấy hình thức thành công.",
                    data: categories
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }
        async insertChampionCategory (req, res) {
            try {
                const data = req.body;
                const result = await dbChampCategoryService.createCatetory(data);
                res.status(201).json({
                    success: true,
                    message: "Tạo hình thức thành công.",
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

         // Cập nhật
         async updateChampionCaterory(req, res)  {
            try {
                const id = req.params.id;
                const data = req.body;
                const { category_key, category_name, description } = data;
                if (!id || !category_key || !category_name || !description ) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu thông tin hình thức.",
                        data: {}
                    });
                }
                const result = await dbChampCategoryService.updateCatetory(id, data);
                if (result.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy hình thức để cập nhật.",
                        data: {}
                    });
                }

                res.json({
                    success: true,
                    message: "Cập nhật hình thức thành công.",
                    data: result
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        };

        // Xoá
        async deleteChampionCaterory(req, res)  {
            try {
                const id = req.params.id;
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu ID hình thức cần xóa.",
                        data: {}
                    });
                }
                const result = await dbChampCategoryService.deleteCatetory(id);
                if (result.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy hình thức để cập nhật.",
                        data: {}
                    });
                }

                res.json({
                    success: true,
                    message: "Xoá hình thức thành công.",
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        };

    //#endregion

    //#region 4. API Lấy nội dung thi theo hình thức thi
        async getEvent(req, res) {
            try {
                const {query, body} = req;
                const result = await dbChampEventService.getEvent();
                res.json({
                    success: true,
                    message: "Lấy nội dung thi thành công.",
                    data: result
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

        async getEventByCategory(req, res) {
            try {
                const {query, body} = req;
                const category_key = req.params.category_key;
                      
                if (!category_key) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu thông tin cần lấy.",
                        data: {}
                    });
                }
                const result = await dbChampEventService.getEventByCategory(category_key);
                res.json({
                    success: true,
                    message: "Lấy nội dung thi thành công.",
                    data: result
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

        async createEvent(req, res) {
            try {
                const data = req.body
                const { event_name, num_member, category_key, description, qu_type } = data
                if (!category_key) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu mã hình thức thi đấu.",
                        data: {}
                    });
                }
                // kiểm tra mã category_key có tồn tại không
                const categories = await dbChampCategoryService.getCatetory();
                console.log('categories: ', categories);
                if(!categories || categories && categories.filter(ele=>ele.category_key == category_key).length == 0){
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy hình thức",
                        data: {}
                    });
                }
                const result = await dbChampEventService.createEvent( data);
                res.json({
                    success: true,
                    message: "Tạo nội dung thi thành công.",
                    data: result
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

        async updateEvent(req, res) {
            try {
                const data = req.body
                const id = req.params.id;

                const { event_name, num_member, category_key, description, qu_type } = data
                if (!id || !category_key) {
                    return res.status(400).json({
                        success: false,
                        message: "Tham số truyền vào không hợp lệ",
                        data: {}
                    });
                }
                // kiểm tra mã category_key có tồn tại không
                const categories = await dbChampCategoryService.getCatetory();
                if(!categories || categories && categories.filter(ele=>ele.category_key == category_key).length == 0){
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy hình thức",
                        data: {}
                    });
                }
                const result = await dbChampEventService.updateEvent(id, data);
                if (result.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy nội dung thi để cập nhật.",
                        data: {}
                    });
                }

                res.json({
                    success: true,
                    message: "Cập nhật nội dung thi thành công.",
                    data: result
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

        // Xóa 
        async deleteEvent (req, res){
            try {
                const id = req.params.id;
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu ID nội dung thi cần xóa.",
                        data: {}
                    });
                }
                const result = await dbChampEventService.deleteEvent(id);
                if (result.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy nội dung thi để xóa.",
                        data: {}
                    });
                }
                res.json({
                    success: true,
                    message: "Xóa nội dung thi thành công.",
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }
    //#endregion

    //#region 5. API lấy dụng dung thi theo nhóm thi
        // API lấy thông tin nội dung thi.
        async getGrpEvtSearch(req, res) {
            try {
                // điều kiện: champ_grp_id => mới tìm theo giới tính
                const {query, body} = req;
                const {champ_grp_id, gender_id, champ_id} = query
                if(!champ_grp_id || !champ_id){
                    res.json({
                        success: false,
                        message: "Tham số truyền vào không đúng",
                        data: {}
                    });
                    return 
                }
                const result = await dbChampionGrpEventService.getGrpEvtSearch(champ_id, champ_grp_id, gender_id);
                res.json({
                    success: true,
                    message: "Lấy nội dung thi thành công.",
                    data: result
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
    }

        async getGrpEvent(req, res) {
            try {
                // điều kiện: champ_grp_id => mới tìm theo giới tính
                const {query, body} = req;
                const {champ_grp_id, gender_id, champ_id} = query
                if(!champ_grp_id ){
                    res.json({
                        success: false,
                        message: "Tham số truyền vào không đúng",
                        data: {}
                    });
                    return 
                }
                const result = await dbChampionGrpEventService.getGrpEvent(champ_grp_id, gender_id);
                res.json({
                    success: true,
                    message: "Lấy nội dung thi thành công.",
                    data: result
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

        async createGrpEvent(req, res) {
            try {
                const data = req.body
                const { champ_event_id, gender_commons_key, champ_grp_id } = data
                console.log('data: ', data);
                if (!champ_grp_id || !gender_commons_key || !champ_event_id) {
                    return res.status(400).json({
                        success: false,
                        message: "Tham số truyền vào không đúng",
                        data: {}
                    });
                }
                // kiểm tra mã champ_event_id có tồn tại không
                const lsEvent = await dbChampEventService.getEventById(champ_event_id);
                if(!lsEvent){
                    return res.status(404).json({
                        success: false,
                        message: "Mã champ_event_id không hợp lệ",
                        data: {}
                    });
                }

                // kiểm tra mã champ_grp_id có tồn tại không
                const lsGrp = await dbChampionGroupService.getChampionGroupById(champ_grp_id);
                if (!lsGrp) {
                    return res.status(404).json({
                        success: false,
                        message: "Mã champ_grp_id không hợp lệ",
                        data: {}
                    });
                }

                // kiểm tra gender_commons_key có tồn tại không
                const lsGender = await dbCommonService.getListCommonByCategory('gender');
                if(lsGender.length == 0 || lsGender && lsGender.filter(ele=> ele.key == gender_commons_key).length == 0 ){
                    return res.status(404).json({
                        success: false,
                        message: "Mã gender_commons_key không hợp lệ",
                        data: {}
                    });
                }

                // thực hiện lưu
                const result = await dbChampionGrpEventService.createGrpEvent(data);
                res.json({
                    success: true,
                    message: "Tạo nội dung thi thành công.",
                    data: result
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

        async updateGrpEvent(req, res) {
            try {
                const data = req.body
                const id = req.params.id;
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu ID cần cập nhật",
                        data: {}
                    });
                }
                const { champ_event_id, gender_commons_key, champ_grp_id } = data
                if (!champ_grp_id || !gender_commons_key || !champ_event_id) {
                    return res.status(400).json({
                        success: false,
                        message: "Tham số truyền vào không đúng",
                        data: {}
                    });
                }
                // kiểm tra mã champ_event_id có tồn tại không
                const lsEvent = await dbChampEventService.getEventById(champ_event_id);
                if(!lsEvent){
                    return res.status(404).json({
                        success: false,
                        message: "Mã champ_event_id không hợp lệ",
                        data: {}
                    });
                }

                // kiểm tra mã champ_grp_id có tồn tại không
                const lsGrp = await dbChampionGroupService.getChampionGroupById(champ_grp_id);
                if (!lsGrp) {
                    return res.status(404).json({
                        success: false,
                        message: "Mã champ_grp_id không hợp lệ",
                        data: {}
                    });
                }

                // kiểm tra gender_commons_key có tồn tại không
                const lsGender = await dbCommonService.getListCommonByCategory('gender');
                if(lsGender.length == 0 || lsGender && lsGender.filter(ele=> ele.key == gender_commons_key).length == 0 ){
                    return res.status(404).json({
                        success: false,
                        message: "Mã gender_commons_key không hợp lệ",
                        data: {}
                    });
                }

                // thực hiện lưu
                const result = await dbChampionGrpEventService.updateGrpEvent(id, data);
                if (result.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy nội dung thi để cập nhật.",
                        data: {}
                    });
                }
                res.json({
                    success: true,
                    message: "Cập nhập nội dung thi thành công.",
                    data: result
                });
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }

        // Xóa 
        async deleteGrpEvent (req, res){
            try {
                const id = req.params.id;
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu ID nội dung thi cần xóa.",
                        data: {}
                    });
                }
                const result = await dbChampionGrpEventService.deleteGrpEvent(id);
                if (result.changes === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy nội dung thi để xóa.",
                        data: {}
                    });
                }
                res.json({
                    success: true,
                    message: "Xóa nội dung thi thành công.",
                    data: result
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: "Hệ thống xử lý lỗi.",
                    data: {}
                });
            }
        }


    //#endregion

    //#region 6. Xuất file mẫu

        async exportFileChampion(req, res) {
            try {
                // thực hiện lấy giải đấu 
                const { champ_id } = req.query;
                if (!champ_id) {
                    return res.status(400).json({ message: "Missing champ_id" });
                }
                // Lấy Thông tin giải đấu
                const champion = await dbChampionService.getChampionById(champ_id);
                if(!champion){
                    return res.status(400).json({ message: "champ_id not exist" });
                }
                // Format lại dữ liệu theo cấu trúc file mẫu
                // 1. Lấy thông tin Nhóm thi đấu theo champ_id
                // 2. Lấy thông tin Giới tính 
                // 3. Lấy thông tin Hình thức: Đối kháng/Biểu diễn
                // 4. Lấy thông tin nội dung thi
    
                // 1. Lấy thông tin Nhóm thi đấu theo tournament_id champ_id
                const list_champ_grp = await dbChampionGroupService.getChampionGroupsByChampion(champ_id)
    
                // 2. Lấy thông tin Giới tính 
                const list_gender = await dbCommonService.getListCommonByCategory('gender');

                // 3. Lấy thông tin Hình thức: Đối kháng/Biểu diễn
                const list_champ_category = await dbChampCategoryService.getCatetory();

                // 4. Lấy thông tin nội dung thi: Nhóm thi + Giới tính      
    
                // tạo 1 các excel
                const workbook = new ExcelJS.Workbook();
                
                // Lặp nhóm
                let arr_sheet =[]
                 /**
                 * NHÓM THI + HÌNH THỨC THI: CẤP 1 + ĐỐI KHÁNG/QUYỀN
                 * HÌNH THỨC THI NÊU ĐỐI KHÁNG THÌ NAM/NỮ TRONG 1 SHEET
                 * HÌNH THỨC THI QUYỀN: TÁCH NAM NỮA RA LÀM 2 SHEET
                 * 
                 * TỔNG: MỘT NHÓM THI GỒM: 
                 * - 02 SHEET ĐỐI KHÁNG: NAM + NỮ
                 * - 02 SHEET THI QUYỀN: NAM + NỮ
                 * 
                 * XUẤT DỮ LIỆU MẪU CHO TỪNG NỘI DUNG: Đã hoàn thành
                 * 
                 * 
                 */
        
                for(let grp = 0; grp < list_champ_grp.length; grp++){
                    // Lặp Hình thức
                    for(let category = 0; category < list_champ_category.length; category++ ){
                        // 1. Hình thức thi và nhóm thi đấu
                        const code = list_champ_category[category].category_key + String(list_champ_grp[grp].id).padStart(3, '0');
                        const category_key = list_champ_category[category].category_key ?? ''
                        // 2. Lấy nội dung thi bao gồm nam/nữ
                        const list_event = await dbChampionGrpEventService.getGrpEvent(list_champ_grp[grp].id, null, category_key );

                        // 3. Phân biệt giới tính nam/nữ
                        let ls_gender_exist = await dbChampionGrpEventService.getGrpEventDistinct(list_champ_grp[grp].id, null, category_key );
                        ls_gender_exist = ls_gender_exist?.map(ele=> ele.gender_id) || [];

                        // 4. Tạo sheet Nam/Nữ
                        for(let i = 0 ; i < ls_gender_exist.length; i++){
                            const group_name = list_champ_grp[grp].name ?? '';
                            const category_name = list_champ_category[category].category_name ?? '';
                            const gender_name = list_gender.find(ele=> ele.key  == ls_gender_exist[i]).value ?? '';
                            let ls_event = list_event.filter(ele => ele.gender_commons_key == ls_gender_exist[i])
                            // tạo mã nội dung thi: nhóm thi + giới tính + nội dung thi
                            // VD: 001F0022 | 3 ký tự đầu nhóm dự thi | ký tự 4 giới tính | 4 ký tự cuối là mã nội dung thi
                             ls_event = ls_event.map(ele=>{
                                const id_event = String(list_champ_grp[grp].id).padStart(3, '0') + ls_gender_exist[i] + String(ele.champ_grp_event_id).padStart(4, '0')
                                return {
                                    ...ele,
                                    id_event: id_event
                                }
                            })
                            const sheet_info = { 
                                sheet_name: `${group_name}| ${category_name} - ${gender_name}`, // Thêm phân biệt Nam/Nữ,
                                sheet_code: code + ls_gender_exist[i],
                                category_key: category_key,
                                ls_event: ls_event
                            }
                            arr_sheet.push(sheet_info)
                        }
                    }
                }

                for(let i = 0; i < arr_sheet.length; i++){
                    const sheet = workbook.addWorksheet(arr_sheet[i].sheet_name);

                    // Nếu trường hợp QU -> cần tạo thêm số lượng thành viên cho khớp với num_member 
                    const category_key = arr_sheet[i].category_key
                    // Merge header
                    sheet.mergeCells('A2:A3');
                    sheet.mergeCells('B1:B3');
                    sheet.mergeCells('C1:C3');
                    sheet.mergeCells('D1:D3');

                    // Tính toán render header nội dungg
                    const contentList = arr_sheet[i]?.ls_event?.map(ele=> ({
                        id_event: ele.id_event,
                        event_name: ele.event_name,
                        num_member: ele.num_member
                       }));
                    // Bắt đầu từ cột F (tức là cột số 6)
                    const startCol = 5;
                    const endCol = startCol + contentList.length - 1;
                    // Merge các ô từ F1 đến K1 (tùy theo contentList   )
                    const startColLetter = sheet.getColumn(startCol).letter;
                    const endColLetter = sheet.getColumn(endCol).letter;
                    sheet.mergeCells(`${startColLetter}1:${endColLetter}1`);
                    sheet.getCell(`${startColLetter}1`).value = 'Nội dung thi';
                    sheet.getCell(`${startColLetter}1`).alignment = { horizontal: 'center' };
                    // Ghi nội dung từng nội dung thi vào dòng 2
                    contentList.forEach((item, index) => {
                        const colIndex = startCol + index;
                        sheet.getRow(2).getCell(colIndex).value = item.id_event;
                        sheet.getRow(3).getCell(colIndex).value = item.event_name;
                        sheet.getRow(2).getCell(colIndex).alignment = { horizontal: 'center', wrapText: true };
                        sheet.getRow(3).getCell(colIndex).alignment = { horizontal: 'center', wrapText: true };
                    }); 

                    // Header content
                    sheet.getCell('A1').value = arr_sheet[i].sheet_code;
                    sheet.getCell('A2').value = 'STT';
                    sheet.getCell('B1').value = 'Họ tên';
                    sheet.getCell('C1').value = 'Đơn vị';
                    sheet.getCell('D1').value = 'Năm sinh';
                    // sheet.getCell('F1').value = 'Nội dung thi';
                    for (let row = 1; row <= 3; row++) {
                        for (let col = 1; col <= endCol; col++) {
                          const cell = sheet.getCell(row, col);
                          cell.alignment = { vertical: 'middle', horizontal: 'center'};
                          // chỉ xuống hàng khi là tên nội dung thi
                          if(col > 3 && row == 3){
                            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                          }
                          cell.font = { bold: true };
                          cell.border = {
                            top: { style: 'thin' },
                            bottom: { style: 'thin' },
                            left: { style: 'thin' },
                            right: { style: 'thin' },
                          };
                          cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: '8DB4E2' } // Màu vàng (ARGB: Alpha-Red-Green-Blue)
                          };
                          if(col == 1){
                            sheet.getColumn(col).width = 8;
                          }else if([2,3].includes(col)){
                            sheet.getColumn(col).width = 20;
                          }else{
                            sheet.getColumn(col).width = 12;
                          }
                        }
                    }
                    let condition = true
                    // bắt đầu từ vị trí số row 4 -> lấy event đầu tiên và gán gía trị  =x tạo 3 item nối đuôi
                    while(condition){
                        if(category_key == 'DK'){
                            let row = 3;
                            let maxCol = 4 + contentList.length;
                            let isSelected = contentList.length > 0 ? 5: 0
                            if(isSelected == 0) condition= false
                            for(let i = 0; i < contentList.length; i++  ){
                                const content = contentList[i];
                                for (let item = 1; item <= 3; item++) {
                                    sheet.getRow(item+row).getCell(1).value = item;
                                    sheet.getRow(item+row).getCell(2).value = 'Nguyễn Văn ' + content.id_event;
                                    sheet.getRow(item+row).getCell(3).value = 'Đơn vị '+ item;
                                    sheet.getRow(item+row).getCell(4).value = moment().format('YYYY');
                                    sheet.getRow(item+row).getCell(4).alignment = { vertical: 'middle', horizontal: 'center'};

                                    // chọn nội dung
                                    sheet.getRow(item+row).getCell(isSelected).value = 'x';
                                    sheet.getRow(item+row).getCell(isSelected).alignment = { vertical: 'middle', horizontal: 'center'};
        
                                    for (let col = 1; col <= endCol; col++) {
                                        const cell = sheet.getCell(item+row, col);
                                        cell.border = {
                                            top: { style: 'thin' },
                                            bottom: { style: 'thin' },
                                            left: { style: 'thin' },
                                            right: { style: 'thin' },
                                        };
                                    }
                                }
                                row = 3 + row;
                                isSelected++
                            }
                            condition = false
                        }else{
                            let row = 3;
                            let maxCol = 4 + contentList.length;
                            let isSelected = contentList.length > 0 ? 5: 0
                            for(let i = 0; i < contentList.length; i++  ){
                                const content = contentList[i];
                                const num_member = Number(content.num_member);
                                for (let item = 1; item <= 3; item++) {
                                    for(let num = 0; num < num_member; num++ ){
                                        const rows = item + row + num
                                        // sheet.getRow(rows).getCell(1).value = item;
                                        sheet.getRow(rows).getCell(2).value = 'Nguyễn Văn ' + content.id_event;
                                        sheet.getRow(rows).getCell(4).value = moment().format('YYYY');
                                        sheet.getRow(rows).getCell(4).alignment = { vertical: 'middle', horizontal: 'center'};

                                        // sheet.getRow(rows).getCell(3).value = 'Đơn vị '+ item;
                                        for (let col = 1; col <= endCol; col++) {
                                            const cell = sheet.getCell(rows, col);
                                            cell.border = {
                                                top: { style: 'thin' },
                                                bottom: { style: 'thin' },
                                                left: { style: 'thin' },
                                                right: { style: 'thin' },
                                            };
                                        }        
                                    }
                                    // STT 
                                    sheet.mergeCells(item + row, 1, item + row + num_member-1, 1);
                                    sheet.getRow(item + row).getCell(1).value = item;
                                    sheet.getRow(item + row).getCell(1).alignment = { vertical: 'middle', horizontal: 'center'};

                                    // Đơn vị 
                                    sheet.mergeCells(item + row, 3, item + row + num_member-1, 3);
                                    sheet.getRow(item + row).getCell(3).value =  'Đơn vị '+ item;
                                    sheet.getRow(item + row).getCell(3).alignment = { vertical: 'middle', horizontal: 'center'};
                                    
                                    // chọn stick
                                    sheet.mergeCells(item + row, isSelected, item + row + num_member-1, isSelected);
                                    sheet.getRow(item + row).getCell(isSelected).value = 'x';
                                    sheet.getRow(item + row).getCell(isSelected).alignment = { vertical: 'middle', horizontal: 'center'};
                                    row = row + num_member-1
                                }
                                row = row + 3
                                isSelected++
                            }
                            condition = false
                        }
                    }
                    // tạo dữ liệu mẫu để người dùng thấy: DK
                }

                // Thêm mã 
                const data_code = [{
                    'Mã': champ_id,
                    'Tên giải': champion.tournament_name
                }];
                const sheetCode = workbook.addWorksheet('CODE')
                sheetCode.state = 'veryHidden'; // hoặc 'hidden'

                // Thiết lập cột từ tiêu đề của phần tử đầu tiên
                sheetCode.columns = Object.keys(data_code[0]).map(key => ({
                    header: key,
                    key: key,
                    width: 30
                }));

                // Thêm dữ liệu
                data_code.forEach(row => {
                    sheetCode.addRow(row);
                });

    
                // Ghi workbook vào stream và trả về client
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', 'attachment; filename="vhd_mau_1.xlsx"');
                await workbook.xlsx.write(res);
                res.end();
                // res.status(200).json({ success: true, message: 'Thực hiện thành công' });
            } catch (error) {
                res.status(500).json({ error: error.message });
            } 
        }

    //#endregion

    //#region 7. Nhập dữ liệu từ muc 6.

        async importFileChampion(req, res){
            try {
                if (!req.file) {
                    return res.status(400).send({
                        success: false,
                        message: "Không có tập tin tải lên.",
                        data: {}
                    });
                }
                const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
                const ls_sheetName = workbook.SheetNames
                // kiểm tra giải đấu có hợp lệ không
                let input = {
                    tournament: {},
                    list_sheet:[]
                }
                if(!ls_sheetName.includes('CODE') ){
                    return res.status(400).send({
                        success: false,
                        message: "[1] Thông tin giải đấu không hợp lệ.",
                        data: {}
                    });
                }else{
                    const worksheet = workbook.Sheets['CODE'];
                    const data = xlsx.utils.sheet_to_json(worksheet);
                    // const dataRef = xlsx.utils.sheet_to_json(worksheetRef);
                    if(data.length == 0){
                        return res.status(400).send({
                            success: false,
                            message: "[2] Thông tin giải đấu không hợp lệ.",
                            data: {}
                        });
                    }
                    input.tournament ={
                        champ_id: data[0]['Mã'],
                        tournament_name: data[0]['Tên giải'],
                    }
                    // API kiểm tra Thông tin giải đấu
                    const tournament = await dbChampionService.getChampionById(input.tournament.champ_id);
                    if(!tournament){
                        return res.status(400).json({ message: "champ_id not exist" });
                    }
                   
                    // lấy danh sách được tải lên phân 
                    let arr_read_excel = []
                    const arr_error = []
                    for(let i = 0; i < ls_sheetName.length; i++){
                        if(ls_sheetName[i] == 'CODE') continue;
                        const worksheet = workbook.Sheets[`${ls_sheetName[i]}`];
                        const rawData = xlsx.utils.sheet_to_json(worksheet);

                        const headers = rawData[0];
                        const contents = rawData[1];
                        let input ={
                            id_sheet: '',
                            ls_vdv: [],
                            category_key: ''
                        }
                        let list_event =[]
                        Object.keys(headers).forEach(key => {
                            if (key && (key.startsWith('QU') || key.startsWith('DK')) ) {
                                input.id_sheet = key
                                input.category_key = key.startsWith('QU') ? 'QU' : key.startsWith('DK') ? 'DK' : '' 
                            }else{
                                const param = {
                                    id_event: headers[key],
                                    event_name: contents[key],
                                    key: key
                                }
                                list_event.push(param)
                            }

                        });
                        if(input.category_key == 'DK'){

                            // map data with object 
                            let ls_vdv = []
    
                            for (let k = 2; k < rawData.length; k++) {
                                let itembase = {
                                    stt: rawData[k][input.champ_grp_gender],
                                    fullname: rawData[k]['Họ tên'],
                                    team_name: rawData[k]['Đơn vị'],
                                    dob: rawData[k]['Năm sinh'],
                                }
                                Object.keys(contents).forEach(colKey => {
                                    if (rawData[k][colKey] === 'x') {
                                        const event = list_event.find(ele=> ele.key == colKey)
                                        itembase ={
                                            ...itembase,
                                            id_event: event.id_event,
                                            event_name: event.event_name,
                                        }    
                                        ls_vdv.push(itembase)
                                    }
                                });
                            }
                            input.ls_vdv = ls_vdv
                            arr_read_excel.push(input)

                        }else{
                            let ls_vdv = []
                            let itembase = {
                                stt: null,
                                team_name: null,
                                id_event: null,
                                event_name: null,
                                members:[] // fullname + dob
                            }
                            for (let k = 2; k < rawData.length; k++) {
                                if(rawData[k][input.id_sheet]){
                                    if(itembase.members.length > 0)ls_vdv.push(itembase)
                                    itembase = {
                                        stt: rawData[k][input.champ_grp_gender],
                                        team_name: rawData[k]['Đơn vị'],
                                        members: [
                                            {
                                                stt: 1,
                                                fullname: rawData[k]['Họ tên'],
                                                dob: rawData[k]['Năm sinh'],
                                            }
                                        ]
                                       
                                    }
                                    Object.keys(contents).forEach(colKey => {
                                        if (rawData[k][colKey] === 'x') {
                                            const event = list_event.find(ele=> ele.key == colKey)
                                            itembase ={
                                                ...itembase,
                                                id_event: event.id_event,
                                                event_name: event.event_name,
                                            }    
                                        }
                                    });
                                }else{
                                    itembase = {
                                        ...itembase,
                                        members: [...itembase.members, {
                                            stt: (itembase.members.length + 1),
                                            fullname: rawData[k]['Họ tên'],
                                            dob: rawData[k]['Năm sinh'],
                                        }]
                                    }
                                }
                                ls_vdv.push(itembase)
                            }
                            input.ls_vdv = ls_vdv
                            arr_read_excel.push(input)
                        }
                    }          

                    // // Thực hiện lưu vào table quản lý VĐV 
                    for(let i =0; i< arr_read_excel.length; i++){
                        const record = arr_read_excel[i];
                        const check_sheet = await checkEncypt(1, record.id_sheet, true)
                        console.log('check_sheet: ', check_sheet);
                        if(!check_sheet) continue;
                        // xoá sheet trong database
                        const del = await dbChampionAthleteService.deleteByChampGrpId(check_sheet.cham_grp_id, check_sheet.gender_id, check_sheet.category_key)
                        for(let j = 0; j < record.ls_vdv.length; j++ ){
                            const item = record.ls_vdv[j];
                            const check = await checkEncypt(2, item.id_event, true)
                            if(!check) {
                                arr_error.push(item)
                            }else{
                                // thực hiện lưu bản table 
                                let _input = {}
                                if(record.category_key == 'DK'){
                                    _input = {
                                        category_key: check_sheet.category_key,
                                        champ_id: input.tournament.champ_id,
                                        champ_grp_event_id: check.champ_grp_event_id,
                                        gender_id: check.gender_id,
                                        cham_grp_id: check.cham_grp_id,
                                        team_name: item.team_name,
                                        fullname: item.fullname,
                                        dob: item.dob ?? moment().format('YYYYMMDD'),
                                        num_random: 0
                                    } 
                                    const rs_ins = await dbChampionAthleteService.insert(_input)
                                }else{
                                    for(let m = 0;  m < item.members.length; m++){
                                        _input = {
                                            category_key: check_sheet.category_key,
                                            champ_id: input.tournament.champ_id,
                                            champ_grp_event_id: check.champ_grp_event_id,
                                            gender_id: check.gender_id,
                                            cham_grp_id: check.cham_grp_id,
                                            team_name: item.team_name,
                                            fullname: item.members[m].fullname,
                                            dob: item.members[m].dob ?? moment().format('YYYYMMDD'),
                                            num_random: 0
                                        } 
                                        const rs_ins = await dbChampionAthleteService.insert(_input)
                                    }
                                }
                            }
                        }
                    }
                    const list_upload = await dbChampionAthleteService.selectAllByChampId(input.tournament.champ_id)
                    res.status(200).json({
                        success: true,
                        message: "Thực hiện thành công",
                        data: list_upload,
                        arr_error: arr_error,
                    });
                }
            } catch (error) {
                console.log('error: ', error);
                res.status(500).json({ error: error.message });
            }
        }
        
    //#endregion
}



const instances = new ChampionController();
module.exports = instances;


