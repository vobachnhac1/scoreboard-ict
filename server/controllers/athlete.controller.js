const DBChampionAthleteService = require('../services/common/db_champion_athlete');
const dbChampionGrpEventService = require('../services/common/db_champion_grp_event');
const dbAthMatchService = require('../services/common/db_champion_athlete_match');

const BracketService = require('../services/bracket.service');

class AthleteController {
   
    //#region Bracket 

        // 1.1 Kiểm tra số lượng vận động viên được miễn  
        async handleNumPlayerBye (req, res){
            try {
                const {players} = req.query;
                const num_bye_needed = BracketService.checkByeNeeded(players)
                res.status(200).json({
                    success: true,
                    message: "Thực hiện thành công",
                    data: {
                        num_bye_needed: num_bye_needed,
                        num_player: Number(players)
                    }
                });
            } catch (error) {
                res.status(500).json({success: false, message: 'Lỗi kiểm tra VĐV được miễn', error: error.message });
            }
        }  

        // 1.2. Tạo lịch thi đấu theo nội dung thi
        async randomBracket(req, res){
            const {champ_grp_event_id, list_bye} = req.query
            if(!champ_grp_event_id){
                res.status(400).json({
                    success: false,
                    message: "Thiếu nội dung thi",
                });
                return
            }
            const ls_champ_grp_event = await dbChampionGrpEventService.getEventById(champ_grp_event_id)
            if(!ls_champ_grp_event){
                res.status(400).json({
                    success: false,
                    message: "Chức năng không phù hợp với nội dung thi",
                });
                return
            }
            // Lấy danh sách vận động viên
            let ls_athlete = await DBChampionAthleteService.selectByChampGrpEventId(champ_grp_event_id);

            // nếu chưa có kết quả bốc thăm mà muốn random
            if(ls_athlete.filter(ele=> ele.num_random == '0').length > 0){
                ls_athlete = ls_athlete.map((ele,index)=>({...ele, num_random: index+1}) )
            }

            // Sắp xếp theo thức tự nhỏ -> lớn
            let ls_sort = ls_athlete.sort((a, b) => a?.num_random.toString().toLowerCase()   > b?.num_random.toString().toLowerCase() ? 1 : -1);
            let ls_ids = ls_sort.map(ele=>ele.id)

            const ls_byes = list_bye?.split(',').filter(ele=> ele) ?? []
            let data = BracketService.generateKnockoutBracket(ls_ids, ls_byes);
            // console.log('data: ', data);

            // 🧾 Log sơ đồ đấu
            let num = 0;

            // data.forEach((round, roundIndex) => {
            //     console.log(`\n🔹 Vòng ${roundIndex + 1}:`);
            //     if(round.round == 1){
            //         round.right.forEach((match, idx) => {
            //             if(!match.value.includes('BYE')){
            //                 num++
            //                 console.log(`  Trận ${num} | id ${match.match_id}: ${match.value[0]} vs ${match.value[1]}`);
            //             }
            //         });
            //         round.left.forEach((match, idx) => {
            //             if(!match.value.includes('BYE')){
            //                 num++
            //                 console.log(` Trận ${num} | id ${match.match_id}: ${match.value[0]} vs ${match.value[1]}`);
            //             }
            //         }); 
            //     }else{
            //         round.matches.forEach(match=>{
            //             if(!match.value.includes('BYE')){
            //                 num++
            //                 console.log(`Trận ${num} | id ${match.match_id}: ${match.value[0]} vs ${match.value[1]}`);
            //             }
            //         })
            //     }
            // });

            //Lặp số vòng đấu
            // let ls_round =[]
            let ls_total = []

            for(let i =0; i < data.length; i++){
                // let ls_final =[]
                const round = data[i]
                if(i==0){
                    // id để map mới trận sau:  id | parent_id 
                    const arrRound1 = [...round.right,...round.left];
                    for(let j =0; j< arrRound1.length; j++){
                        if(!arrRound1[j].value.includes('BYE')){
                            const item = {
                                ...arrRound1[j],
                                match_id: arrRound1[j].match_id,
                                round: round.round,
                                match_no: ls_total.length +1,
                                value: arrRound1[j].value
                            }
                            ls_total.push(item)
                            // ls_final.push(item)
                        }
                    }                    
                }else{
                    const arrMatch= round.matches;
                    for(let j=0; j < arrMatch.length; j++){                        
                        const item = {
                            ...arrMatch[j],
                            match_id: arrMatch[j].match_id,
                            round: round.round,
                            match_no: ls_total.length +1,
                            value: arrMatch[j].value
                        }
                        ls_total.push(item)                        
                        // ls_final.push(item)                        
                    }
                }
                // ls_round.push({
                //     round: round.round,
                //     data: ls_final
                // })
            }
 
            // lưu vào table danh sách lưu table  ls_total
            // ID | CHAMP_GRP_EVENT_ID | ID_VDV_DO | ID_VDV_XANH | VDV_WIN | CREATED_AT | UPDATED_AT;
            let list_insert = ls_total.map(ele=>{
                return {
                    champ_grp_event_id: champ_grp_event_id,
                    round: ele.round,
                    match_id: ele.match_id,
                    match_no: ele.match_no,
                    ath_red_id:  ele.ath_red,
                    ath_blue_id:  ele.ath_blue,
                }
            });

            const remove = await dbAthMatchService.deleteByChampGrpEventId(champ_grp_event_id)
            const insert = await dbAthMatchService.insertList(list_insert);

            res.status(200).json({
                success: true,
                message: "Thực hiện thành công",
                data: {
                    num_round : data.length,
                    num_match: list_insert.length,
                    num_member: ls_athlete.length,
                    list_insert: list_insert
                },
            }); 
        }

    //#endregion


    //#region  Màn Hình Bốc thăm 

        // Create a new athlete
        async create(req, res) {
            try {
                const { fullname, dob, team_id, team_name, gender_id, champ_grp_event_id, cham_grp_id, champ_id, num_random } = req.body;
                if ( !champ_grp_event_id|| !gender_id|| !cham_grp_id|| !champ_id) {
                    return res.status(400).json({
                        success: false,
                        message: "Thông tin không chính xác",
                        data: {}
                    });
                }
                const id = await DBChampionAthleteService.insert({
                    fullname,
                    dob,
                    team_id,
                    team_name,
                    gender_id,
                    champ_grp_event_id,
                    cham_grp_id,
                    champ_id,
                    num_random
                });
                res.status(201).json({success: true, message: 'Thêm VĐV thành công', data: id });
            } catch (error) {
                res.status(500).json({success: false, message: 'Error creating athlete', error: error.message });
            }
        }

        // Update an existing athlete
        async update(req, res) {
            try {
                const { id } = req.params;
                const { fullname, dob, team_id, team_name, gender_id, champ_grp_event_id, cham_grp_id, champ_id, num_random } = req.body;
                if (!id || !champ_grp_event_id|| !gender_id|| !cham_grp_id|| !champ_id) {
                    return res.status(400).json({
                        success: false,
                        message: "Thông tin không chính xác",
                        data: {}
                    });
                }
                const changes = await DBChampionAthleteService.update(id, {
                    fullname,
                    dob,
                    team_id,
                    team_name,
                    gender_id,
                    champ_grp_event_id,
                    cham_grp_id,
                    champ_id,
                    num_random
                });
                if (changes > 0) {
                    res.status(200).json({ success: true, message: 'Cập nhật thông tin VĐV thành công' });
                } else {
                    res.status(404).json({success: false, message: 'Thực hiện thất bại' });
                }
            } catch (error) {
                res.status(500).json({success: false, message: 'Lỗi: API cập nhật VĐV', error: error.message });
            }
        }
        
        // Delete an athlete
        async delete(req, res) {
            try {
                const { id } = req.params;
                if (!id) {
                    return res.status(400).json({
                        success: false,
                        message: "Thông tin không chính xác",
                        data: {}
                    });
                }
                const changes = await DBChampionAthleteService.delete(id);
                if (changes > 0) {
                    res.status(200).json({ success: true,message: 'Thực hiện xoá thành công' });
                } else {
                    res.status(404).json({ success: false,message: 'Thực hiện thất bại' });
                }
            } catch (error) {
                res.status(500).json({ success: false, message: 'Lỗi: API xoá VĐV', error: error.message });
            }
        }

        // Get all athletes
        async getAll(req, res) {
            try {
                const athletes = await DBChampionAthleteService.selectAll();
                res.status(200).json({
                    success: true,
                    message: "Thực hiện thành công",
                    data: athletes
                });
            } catch (error) {
                res.status(500).json({ message: 'Error fetching athletes', error: error.message });
            }
        }

        // Get athletes by champ_grp_event_id
        async getByChampGrpEventId(req, res) {
            try {
                const { champ_grp_event_id } = req.params;
                if (!champ_grp_event_id) {
                    return res.status(400).json({
                        success: false,
                        message: "Dữ liệu tìm kiếm không chính xác.",
                        data: {}
                    });
                }
                const athletes = await DBChampionAthleteService.selectByChampGrpEventId(champ_grp_event_id);
                res.status(200).json({
                    success: true,
                    message: "Thực hiện thành công",
                    data: athletes
                });
            } catch (error) {
                res.status(500).json({ message: 'Error fetching athletes', error: error.message });
            }
        }

        // Get athletes by champ_id
        async getByChampId(req, res) {
            try {
                const { champ_id, champ_grp_event_id } = req.query;
                if (!champ_id && !champ_grp_event_id) {
                    return res.status(400).json({
                        success: false,
                        message: "Thiếu mã giải đấu.",
                        data: {}
                    });
                }
                let athletes =[]
                if(champ_id){
                    athletes = await DBChampionAthleteService.selectAllByChampId(champ_id, champ_grp_event_id)
                }else if(champ_grp_event_id){
                    athletes = await DBChampionAthleteService.selectByChampGrpEventId(champ_grp_event_id)
                }

                res.status(200).json({
                    success: true,
                    message: "Thực hiện thành công",
                    data: athletes
                });
            } catch (error) {
                res.status(500).json({ message: 'Error fetching athletes', error: error.message });
            }
        }

        async updateRandom(req, res) {
            try {
                const { id } = req.params;
                const { num_random } = req.body;
                if (!id || !num_random ) {
                    return res.status(400).json({
                        success: false,
                        message: "Thông tin không chính xác",
                        data: {}
                    });
                }
                const changes = await DBChampionAthleteService.updateRandom(id, num_random);
                if (changes > 0) {
                    res.status(200).json({ success: true, message: 'Cập nhật thông tin VĐV thành công' });
                } else {
                    res.status(404).json({success: false, message: 'Thực hiện thất bại' });
                }
            } catch (error) {
                res.status(500).json({success: false, message: 'Lỗi: API cập nhật VĐV', error: error.message });
            }
        }
    //#endregion


    //#region Trận đấu | Match
        async updateAthMatch(req, res){
            try {
                const {champ_grp_event_id} = req.query;
                const {match_id, ath_win_id, ath_match_id} = req.body;
                if( !champ_grp_event_id || !match_id || !ath_win_id || !ath_match_id){
                    res.status(404).json({
                        success: false,
                        message: "Tham số truyền không đúng",
                        data: {}
                    });
                    return;
                }
                // Goi hàm cặp nhật
                const result_upd_win  = await dbAthMatchService.updateAthWinner(ath_match_id, {ath_win_id: ath_win_id})
                if(!result_upd_win){
                    res.status(400).json({
                        success: false,
                        message: "Thực hiện lỗi",
                        data: {}
                    });
                    return;
                }
                // Gọi hàm update trận tiếp theo nếu matchid nằm trong vị trí ath_red | ath_blue
                const record = await dbAthMatchService.findNextMatchId(match_id)
                if(!record){
                    res.status(200).json({
                        success: true,
                        message: "[AM01] Lưu kết quả thành công. Không có trận kế tiếp",
                    });
                    return;
                }
                // gọi hàm cặp nhật
                const record_upd = {
                    id: record.id,
                    ath_red_id: record.ath_red_id == match_id ?  ath_win_id : record.ath_red_id,
                    ath_blue_id: record.ath_blue_id == match_id ?  ath_win_id : record.ath_blue_id,
                }   
                const result_upd_match = await dbAthMatchService.updateNextMatchId(record.id,record_upd)
                if(!result_upd_match){
                    res.status(200).json({
                        success: true,
                        message: "[AM02] Lưu kết quả thành công. Lỗi thực hiện cập nhật thông tin trận kế tiếp",
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Thực hiện thành công",
                });
            } catch (error) {
                res.status(500).json({success: false, message: 'Lỗi API cập nhật trận đấu kế tiếp', error: error.message });
            }
        }

        async getAthMatch(req, res){
            try {
                const {champ_grp_event_id} = req.query;
                if( !champ_grp_event_id ){
                    res.status(404).json({
                        success: false,
                        message: "Tham số truyền không đúng",
                        data: {}
                    });
                    return;
                }
                const list  = await dbAthMatchService.findByChampGrpEventId(champ_grp_event_id)
                res.status(200).json({
                    success: true,
                    message: "Thực hiện thành công",
                    data: list
                });
            } catch (error) {
                res.status(500).json({success: false, message: 'Lỗi API lấy trận đấu theo nội dung thi', error: error.message });
            }
        }
        // 
        // 
        /**
         * 1. Bắt đầu trận đấu -> Bấm "Vào trận"
         * 
         *  DB_MATCH_HIS 
         *  - ID | 
         *      MATCH_ID |                   - mã trận đấu
         *      RED_SCORE | BLUE_SCORE |     - điểm tổng
         *      RED_REMIND | BLUE_REMIND |   - số lần nhắc nhở
         *      RED_WARN | BLUE_WARN |       - số lần cảnh cáo
         *      RED_MINS | BLUE_MINS |       - điểm trừ
         *      RED_INCR | BLUE_INCR |       - điểm cộng
         *      ROUND |                      - Hiệp số 
         *      ROUND_TYPE |                 - Loại hiệp 
         *      CONFIRM_ATTACK |             - Số lần công nhận đòn tấn công 
         *      STATUS |                     - Trạng thái
         * 
         *  DB_MATCH_CONFIG: thông số áp dụng của trận thi đấu
         *      - ID:
         *      MATCH_ID
         *      CHAMP_ID
         *      CHAMP_GRP_ID
         *      CHAMP_GRP_EVENT_ID
         *      CONFIG: CẤU HÌNH LƯU DẠNG STRING -> JSON 
         *      
         *  DB_MATCH_LOG: Lưu lại những thao tác của tất cả Trọng tài máy | Giám định 
         * 
         * 
         *  DB_BIENBAN: Khi trận đấu kết thúc hoặc tuyến bố thắng cuộc -> Lưu biên bản  
         * 
         */

    //#endregion

}

let instances = new AthleteController();
module.exports = instances;