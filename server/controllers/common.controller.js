const dbChampionService = require('../services/common/db_champion');
const dbChampionGroupService = require('../services/common/db_champion_group');
const dbChampCategoryService = require('../services/common/db_champion_category');
const dbChampEventService = require('../services/common/db_champion_event');
const dbChampEventGenderService = require('../services/common/db_champion_grp_event');

// const dbChampionComTypeService = require('../services/common/db_champion_competition_type');
// const dbChampionComEventService = require('../services/common/db_champion_competition_event');
const dbTeamService = require('../services/common/db_team');
const dbRefereeService = require('../services/common/db_referee');
const dbCommonsService = require('../services/common/db_common');



// xử lý excel
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

class CommonController {

    //#region API quản lý team 
        // Get all units by tournament_id
        async getAllTeamsByTournament (req, res) {
            try {
                const tournamentId = req.query.tournament_id;
                if (!tournamentId) {
                    return res.status(400).json({success: false, error: 'tournament_id is required' });
                }
                const units = await dbTeamService.getAllTeamsByTournament(tournamentId);
                res.status(200).json({
                    success: true,
                    message: 'Thực hiện thành công',
                    data: units
                });
            } catch (err) {
                res.status(500).json({success: false, message: 'Lỗi: API lỗi', error: err.message });
            }
        }

        // Create new unit
        async insertTeam (req, res){
            try {
                const data = req.body;
                const result = await dbTeamService.insertTeam(data);
                res.status(201).json({
                    success: true,
                    message: 'Thực hiện thành công',
                    data: result
                });
            } catch (err) {
                res.status(500).json({success: false, message: 'Lỗi: API lỗi', error: err.message });
            }
        }


        // Update unit
        async updateTeam (req, res) {
            try {
                const id = req.params.id;
                const data = req.body;
                const result = await dbTeamService.updateTeam(id, data);
                if (result.changes === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Thực hiện thất bại'
                    });
                    return;
                }
                res.json({
                    success: true,
                    message: 'Thực hiện thành công',
                    data: result
                });
            } catch (err) {
                res.status(500).json({success: false, message: 'Lỗi: API lỗi', error: err.message });
            }
        }


        // Delete unit
        async  deleteTeam(req, res) {
            try {
                const id = req.params.id;
                const result = await dbTeamService.deleteTeam(id);
                if (result.changes === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Thực hiện thất bại',
                    });
                    return;
                }
                res.json({
                    success: true,
                    message: 'Thực hiện thành công',
                    data: result
                });
            } catch (err) {
                res.status(500).json({success: false, message: 'Lỗi: API lỗi', error: err.message });
            }
        }

        // tìm thêm tên hiển thị
        async  searchTeamsByDisplayName(req, res) {
            try {
                const keyword = req.query.keyword || '';
                const result = await dbTeamService.searchTeamsByDisplayName(keyword);
                res.status(200).json({
                    success: true,
                    message: 'Thực hiện thành công',
                    data: result
                });
            } catch (err) {
                res.status(500).json({success: false, message: 'Lỗi: API lỗi', error: err.message });
            }
        }

        // xuất file mẫu
        async exportFileSampleTeams (req, res){
            try {
                // thực hiện lấy giải đấu 
                const { tournament_id } = req.query;
                if (!tournament_id) {
                    return res.status(400).json({ message: "Missing tournament_id" });
                }
                // Lấy Thông tin giải đấu
                const ls_tournaments = await dbChampionService.getAllChampion();
                const tournament = ls_tournaments?.find(ele=> ele.id == tournament_id )
                if(!tournament){
                    return res.status(400).json({ message: "tournament_id not exist" });
                }
                // Format lại dữ liệu theo cấu trúc file mẫu
                const data = [
                    {
                        STT: '',
                        'Tên đơn vị đầy đủ':'',
                        'Khu vực': '',
                        'Tên hiển thị': '',
                        'Trưởng đoàn': ''
                    }
                ]
                const ws = xlsx.utils.json_to_sheet(data);
                const wb = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(wb, ws, 'TEAM');
                // Thêm mã 
                const data_code = [{
                    'Mã': tournament_id,
                    'Tên giải': tournament.tournament_name
                }]
                const ws1 = xlsx.utils.json_to_sheet(data_code);
                xlsx.utils.book_append_sheet(wb, ws1, 'CODE');

                // Ẩn sheet: 0: không ẩn | 1: ẩn | 2: ẩn bảo mật
                wb.Workbook = { Sheets: [{ Hidden: 0 }, { Hidden: 1 }] };

                // Ghi workbook ra buffer
                const excelBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

                // Gửi response về luôn
                res.setHeader('Content-Disposition', 'attachment; filename="vhd_mau_team_02.xlsx"');
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.send(excelBuffer);
            } catch (error) {
                res.status(500).json({ error: err.message });
            }
        }

        // upload danh sách đơn vị theo giải 
        async importFileTeams(req, res){
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
                    list_team:[]
                }
                if(!ls_sheetName.includes('CODE') ){
                    return res.status(400).send({
                        success: false,
                        message: "Thông tin giải đấu không hợp lệ.",
                        data: {}
                    });
                }else{
                    const worksheet = workbook.Sheets['CODE'];
                    const data = xlsx.utils.sheet_to_json(worksheet);
                    // const dataRef = xlsx.utils.sheet_to_json(worksheetRef);
                    if(data.length == 0){
                        return res.status(400).send({
                            success: false,
                            message: "Thông tin giải đấu không hợp lệ.",
                            data: {}
                        });
                    }
                    input.tournament ={
                        tournament_id: data[0]['Mã'],
                        tournament_name: data[0]['Tên giải'],
                    }

                    // API kiểm tra Thông tin giải đấu 
                    const tournament = await dbChampionService.getChampionById(input.tournament.tournament_id);
                    // console.log('ls_tournaments: ', ls_tournaments);
                    // const tournament = ls_tournaments?.find(ele=> ele.id == input.tournament.tournament_id )
                    if(!tournament){
                        return res.status(400).json({ success: false, message: "tournament_id not exist" });
                    }
                }
                // thực hiện đọc dữ liệu từ danh sách 
                const worksheetTeam = workbook.Sheets['TEAM'];
                const data = xlsx.utils.sheet_to_json(worksheetTeam);
                if(data.length == 0 ){
                    return res.status(400).json({success: false, message: "Danh sách không hợp lệ" });
                }
                input.list_team = data.map(ele=>({
                    full_name: ele['Tên đơn vị đầy đủ'],
                    area: ele['Khu vực'],
                    display_name: ele['Tên hiển thị'],
                    leader_name: ele['Trưởng đoàn'],
                    tournament_id: input.tournament.tournament_id ?? ''
                }))

                const list_insert = input.list_team.map(ele=>[ele.full_name, ele.area, ele.display_name, ele.leader_name, ele.tournament_id])
                input.list_insert = list_insert
                // lấy dữ liệu lưu 
                const result = await dbTeamService.insertListTeams(list_insert)
                if(!result){
                    return res.status(400).json({success: false, message: "Lỗi: Thêm mới bị lỗi" });
                }
                res.status(200).json({
                    success: result,
                    message: "Thực hiện thành công",
                    data: {}
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

    //#region API quản lý trọng tài/ Giám định

        // GET all referees theo tournament_id
        async getAllReferees (req, res) {
            try {
                const { tournament_id } = req.query;
                if (!tournament_id) return res.status(400).json({ message: "Missing tournament_id" });

                const referees = await dbRefereeService.getAllReferees(tournament_id);
                res.json({
                    success: true,
                    message: 'Thực hiện thành công',
                    data: referees
                });
            } catch (err) {
                res.status(500).json({success: false, message: 'Lỗi: API lỗi', error: err.message });
            }
        }

        // POST - thêm mới
        async insertReferee (req, res){
            try {
                const data = req.body;
                const inserted = await dbRefereeService.insertReferee(data);
                res.json({
                    success: true,
                    message: 'Thực hiện thành công',
                    data: inserted
                });
            } catch (err) {
                res.status(500).json({success: false, message: 'Lỗi: API lỗi', error: err.message });
            }
        }
        // PUT - cập nhật
        async updateReferee (req, res) {
            try {
                const id = req.params.id;
                const data = req.body;
                const updated = await dbRefereeService.updateReferee(id, data);
                if (updated.changes === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Thực hiện thất bại'
                    });
                    return;
                }
                res.json({
                    success: true,
                    message: 'Thực hiện thành công',
                    data: updated
                });
            } catch (err) {
                res.status(500).json({success: false, message: 'Lỗi: API lỗi', error: err.message });
            }
        }
        // DELETE - xoá
        async deleteReferee (req, res) {
            try {
                const id = req.params.id;
                const deleted = await dbRefereeService.deleteReferee(id);
                if (deleted.changes === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Thực hiện thất bại',
                    });
                    return;
                }
                res.json({
                    success: true,
                    message: 'Thực hiện thành công',
                    data: deleted
                });
            } catch (err) {
                res.status(500).json({success: false, message: 'Lỗi: API lỗi', error: err.message });
            }
        }

        async searchReferees (req, res) {
            try {
                const { tournament_id, keyword } = req.query;
                if (!tournament_id || !keyword) {
                    return res.status(400).json({ message: "Missing tournament_id or keyword" });
                }
                const referees = await dbRefereeService.searchReferees(tournament_id, keyword);
                res.json({
                    success: true,
                    message: 'Thực hiện thành công',
                    data: referees
                });
            } catch (err) {
                res.status(500).json({success: false, message: 'Lỗi: API lỗi', error: err.message });
            }
        }

        // xuất file mẫu
        async exportFileSampleReferee (req, res){
            try {
                // thực hiện lấy giải đấu 
                const { tournament_id } = req.query;
                if (!tournament_id) {
                    return res.status(400).json({ message: "Missing tournament_id" });
                }
                // Lấy Thông tin giải đấu
                const ls_tournaments = await dbChampionService.getAllChampion();
                const tournament = ls_tournaments?.find(ele=> ele.id == tournament_id )
                if(!tournament){
                    return res.status(400).json({ message: "tournament_id not exist" });
                }
                // Format lại dữ liệu theo cấu trúc file mẫu
                const data = [
                    {
                        STT: '',
                        'Họ tên':'',
                        'Đơn vị': '',
                        'Cấp bậc': '',
                        'Chức vụ': ''
                    }
                ]
                const ws = xlsx.utils.json_to_sheet(data);
                const wb = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(wb, ws, 'REF');
                // Thêm mã 
                const data_code = [{
                    'Mã': tournament_id,
                    'Tên giải': tournament.tournament_name
                }]
                const ws1 = xlsx.utils.json_to_sheet(data_code);
                xlsx.utils.book_append_sheet(wb, ws1, 'CODE');

                // Ẩn sheet: 0: không ẩn | 1: ẩn | 2: ẩn bảo mật
                wb.Workbook = { Sheets: [{ Hidden: 0 }, { Hidden: 1 }] };

                // Ghi workbook ra buffer
                const excelBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

                // Gửi response về luôn
                res.setHeader('Content-Disposition', 'attachment; filename="vhd_mau_ref_01.xlsx"');
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.send(excelBuffer);
            } catch (error) {
                res.status(500).json({ error: err.message });
            }
        }

        // upload danh sách giám định theo giải 
        async importFileReferee(req, res){
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
                    list_ref:[]
                }
                if(!ls_sheetName.includes('CODE') ){
                    return res.status(400).send({
                        success: false,
                        message: "Thông tin giải đấu không hợp lệ.",
                        data: {}
                    });
                }else{
                    const worksheet = workbook.Sheets['CODE'];
                    const data = xlsx.utils.sheet_to_json(worksheet);
                    // const dataRef = xlsx.utils.sheet_to_json(worksheetRef);
                    if(data.length == 0){
                        return res.status(400).send({
                            success: false,
                            message: "Thông tin giải đấu không hợp lệ.",
                            data: {}
                        });
                    }
                    input.tournament ={
                        tournament_id: data[0]['Mã'],
                        tournament_name: data[0]['Tên giải'],
                    }
                    // API kiểm tra Thông tin giải đấu
                    const ls_tournaments = await dbChampionService.getAllChampion();
                    const tournament = ls_tournaments?.find(ele=> ele.id == input.tournament.tournament_id )
                    if(!tournament){
                        return res.status(400).json({ message: "tournament_id not exist" });
                    }
                    console.log('input: ', input);                    

                }
                // thực hiện đọc dữ liệu từ danh sách 
                const worksheetRef = workbook.Sheets['REF'];
                const data = xlsx.utils.sheet_to_json(worksheetRef);
                if(data.length == 0 ){
                    return res.status(400).json({success: false, message: "Danh sách không hợp lệ" });
                }
                input.list_ref = data.map(ele=>({
                    full_name: ele['Họ tên'],
                    team_name: ele['Đơn vị'],
                    tournament_id: input.tournament.tournament_id ?? '',
                    rank: ele['Cấp bậc'],
                    position: ele['Chức vụ'],
                }))

                const list_insert = input.list_ref.map(ele=>[ele.full_name, ele.team_name, ele.tournament_id, ele.rank, ele.position])
                input.list_insert = list_insert

                // thực hiện xoá dữ liệu trước đó
                const resultDel = await dbRefereeService.deleteListReferees(input.tournament.tournament_id);

                // lấy dữ liệu lưu 
                const resultInsert = await dbRefereeService.insertListReferee(list_insert)
                if(!result){
                    return res.status(400).json({success: false, message: "Lỗi: Thêm mới bị lỗi" });
                }
                res.status(200).json({
                    success: result,
                    message: "Thực hiện thành công",
                    data: {}
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
    
    // xuất file mẫu
    async exportFileSampleVDV (req, res){
        try {
            // thực hiện lấy giải đấu 
            const { tournament_id } = req.query;
            if (!tournament_id) {
                return res.status(400).json({ message: "Missing tournament_id" });
            }
            // Lấy Thông tin giải đấu
            const ls_tournaments = await dbChampionService.getAllChampion();
            const tournament = ls_tournaments?.find(ele=> ele.id == tournament_id )
            if(!tournament){
                return res.status(400).json({ message: "tournament_id not exist" });
            }
            // Format lại dữ liệu theo cấu trúc file mẫu
            // 1. Lấy thông tin Nhóm thi đấu theo tournament_id
            // 2. Lấy thông tin Giới tính 
            // 3. Lấy thông tin Hình thức: Đối kháng/Biểu diễn
            // 4. Lấy thông tin nội dung thi

            const list_champ_grp = await dbChampionGroupService.getChampionGroupsByTourament(tournament_id)
            console.log('list_champ_grp: ', list_champ_grp);

            const list_gender = await dbCommonsService.getListCommonByCategory('gender');
            console.log('list_gender: ', list_gender);

            const list_cham_type = await dbCommonsService.getListCommonByCategory('champ_comp_type');
            console.log('list_cham_type: ', list_cham_type);

            //4. Lấy thông tin nội dung thi
            const list_cham_event = await dbChampionComEventService.getCompetitionEventsByType('DK');
            const list_cham_event_QU = await dbChampionComEventService.getCompetitionEventsByType('QU');


            let list_sheet =[]

            // tạo 1 các excel
            const workbook = new ExcelJS.Workbook();

            // Tạo danh sach đối kháng
            for(let i = 0; i < list_champ_grp.length; i++){
                const sheet = workbook.addWorksheet(list_champ_grp[i].name);
                // lọc nọi dung thi theo nhóm thi
                // table mới: nhóm thi | nọi dung thi | hình thức thi 
                //  Cấp 1 | Thập tự quyền | Quyền
                //  Cấp 1 | Long Hổ Quyền | Quyền
                //  Cấp 2 | Tứ Trụ Quyền  | Quyền
                //  Cấp 3 | Tứ Trụ Quyền  | Quyền
                //  Cấp 3 | Ngũ Môn quyền | Quyền
                console.log('list_champ_grp[i]: ', list_champ_grp[i]);

                // Merge header
                sheet.mergeCells('A1:A2');
                sheet.mergeCells('B1:B2');
                sheet.mergeCells('C1:D1');
                sheet.mergeCells('E1:E2');
                
                // tính toán chỗ này
                // Danh sách nội dung thi
                const contentList = list_cham_event.map(ele=> ele.name);
                // Bắt đầu từ cột F (tức là cột số 6)
                const startCol = 6;
                const endCol = startCol + contentList.length - 1;
                // Merge các ô từ F1 đến K1 (tùy theo contentList)
                const startColLetter = sheet.getColumn(startCol).letter;
                const endColLetter = sheet.getColumn(endCol).letter;
                sheet.mergeCells(`${startColLetter}1:${endColLetter}1`);
                sheet.getCell(`${startColLetter}1`).value = 'Nội dung thi';
                sheet.getCell(`${startColLetter}1`).alignment = { horizontal: 'center' };
                // Ghi nội dung từng nội dung thi vào dòng 2
                contentList.forEach((item, index) => {
                    const colIndex = startCol + index;
                    sheet.getRow(2).getCell(colIndex).value = item;
                    sheet.getRow(2).getCell(colIndex).alignment = { horizontal: 'center' };
                });

                // Header content
                sheet.getCell('A1').value = 'STT|DK';
                sheet.getCell('B1').value = 'Họ tên';
                sheet.getCell('C1').value = 'Giới tính';
                sheet.getCell('C2').value = 'Nam';
                sheet.getCell('D2').value = 'Nữ';
                sheet.getCell('E1').value = 'Đơn vị';
                // sheet.getCell('F1').value = 'Nội dung thi';

                for (let row = 1; row <= 2; row++) {
                    for (let col = 1; col <= endCol; col++) {
                      const cell = sheet.getCell(row, col);
                      cell.alignment = { vertical: 'middle', horizontal: 'center' };
                      cell.font = { bold: true };
                      cell.border = {
                        top: { style: 'thin' },
                        bottom: { style: 'thin' },
                        left: { style: 'thin' },
                        right: { style: 'thin' },
                      };
                      sheet.getColumn(col).width = 8;
                    }
                }
            }


            // Thêm mã 
            const data_code = [{
                'Mã': tournament_id,
                'Tên giải': tournament.tournament_name
            }];
            const sheetCode = workbook.addWorksheet('CODE')
            sheetCode.state = 'veryHidden'; // hoặc 'hidden'

            // Ghi workbook vào stream và trả về client
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="vhd_mau_10.xlsx"');
            await workbook.xlsx.write(res);
            res.end();
            // res.status(200).json({ success: true, message: 'Thực hiện thành công' });
        } catch (error) {
            res.status(500).json({ error: err.message });
        }
    }

    async getCategoryByKey (req, res){
        try {
            // thực hiện lấy giải đấu 
            const { category_key } = req.query;
            if (!category_key) {
                return res.status(400).send({
                    success: false,
                    message: "Không có category_key",
                    data: {}
                });
            }
            const list = await dbCommonsService.getListCommonByCategory(category_key)
            res.status(200).json({ 
                success: true,
                message: "Thực hiện thành công",
                data: list
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

    async getCategoryAll (req, res){
        try {           
            const list = await dbCommonsService.getAllCommon()
            res.status(200).json({ 
                success: true,
                message: "Thực hiện thành công",
                data: list
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

}

const instances = new CommonController();
module.exports = instances;


